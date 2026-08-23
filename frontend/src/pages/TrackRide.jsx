import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DriverCard } from '@/components/nocturne/driver-card'
import { LiveChip } from '@/components/nocturne/live-indicators'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from '@/hooks/useLocation'
import { useRideStatus } from '@/hooks/useRideStatus'
import { calculateRoute } from '@/lib/tomtom'
import { formatRideDateTime } from '@/lib/rideDisplay'
import RouteMap from '../components/map/RouteMap'
import {
  ArrowLeft, Phone, MessageCircle, AlertTriangle, Loader2, Play, CheckCircle2,
  Clock,
} from 'lucide-react'

const MAP_KEY = import.meta.env.VITE_TOMTOM_API_KEY

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export default function TrackRide() {
  const { rideId } = useParams()
  const { user } = useAuth()
  const [etaSeconds, setEtaSeconds] = useState(null)
  const [gpsErrorDismissed, setGpsErrorDismissed] = useState(false)

  const rideQuery = useQuery({
    queryKey: ['ride', rideId],
    queryFn: () => api.get(`/api/rides/${rideId}`),
    refetchInterval: (query) => {
      const status = query?.state?.data?.status
      return status === 'in_progress' ? 3000 : 15000
    },
    retry: false,
  })

  const ride = rideQuery.data
  const isDriver = Boolean(ride && user && ride.owner_id === user.id)
  const isActive = ride?.status === 'in_progress'

  // Driver: broadcast GPS while the ride is in progress
  const { location: gps, error: gpsError, setEnabled } = useLocation()

  useEffect(() => {
    if (!isDriver || !isActive || !gps) return undefined
    let cancelled = false
    const push = async () => {
      try {
        await api.patch(`/api/rides/${rideId}/location?lat=${gps.lat}&lng=${gps.lng}`)
      } catch {
        // transient — next tick retries
      }
    }
    push()
    const interval = setInterval(() => !cancelled && push(), 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isDriver, isActive, gps, rideId])

  useEffect(() => () => setEnabled(false), []) // eslint-disable-line react-hooks/exhaustive-deps

  // Everyone: driver location arrives through the same ride query (driver_lat/lng)

  // ETA: driver position → destination, traffic-aware
  useEffect(() => {
    if (!isActive || !ride?.driver_lat || !ride?.driver_lng || !ride?.to_lat || !ride?.to_lng) {
      setEtaSeconds(null)
      return undefined
    }
    let cancelled = false
    const fetchEta = async () => {
      try {
        const route = await calculateRoute(
          ride.driver_lat, ride.driver_lng, ride.to_lat, ride.to_lng
        )
        if (!cancelled) setEtaSeconds(route.trafficDurationSeconds ?? route.durationSeconds)
      } catch {
        if (!cancelled) setEtaSeconds(null)
      }
    }
    fetchEta()
    const interval = setInterval(fetchEta, 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isActive, ride?.driver_lat, ride?.driver_lng, ride?.to_lat, ride?.to_lng])

  const { completeRide, cancelRide, updating } = useRideStatus(ride, () =>
    rideQuery.refetch()
  )

  const progress = useMemo(() => {
    if (!ride?.from_lat || !ride?.to_lat || !ride?.driver_lat) return 0
    const total =
      haversineKm(ride.from_lat, ride.from_lng, ride.driver_lat, ride.driver_lng) +
      haversineKm(ride.driver_lat, ride.driver_lng, ride.to_lat, ride.to_lng)
    if (total <= 0) return 0
    const covered = haversineKm(ride.from_lat, ride.from_lng, ride.driver_lat, ride.driver_lng)
    return Math.min(1, covered / total)
  }, [ride?.from_lat, ride?.from_lng, ride?.to_lat, ride?.to_lng, ride?.driver_lat, ride?.driver_lng])

  if (rideQuery.isLoading) {
    return (
      <div className="page page--narrow" aria-busy="true">
        <div className="stack stack--gap-lg">
          <div className="skel skel--line lg" style={{ width: 160 }} />
          <div className="skel skel--block" style={{ height: 288 }} />
          <div className="skel skel--block" style={{ height: 128 }} />
        </div>
      </div>
    )
  }

  if (rideQuery.isError || !ride) {
    return (
      <div className="centered-state">
        <div>
          <AlertTriangle size={28} aria-hidden="true" style={{ color: 'var(--accent-text)' }} />
          <h1 className="state__title">Ride not found</h1>
          <p className="state__body">It may have been cancelled or removed.</p>
          <div className="state__actions">
            <Button render={<Link to="/my-rides" />} variant="outline" size="md">
              <ArrowLeft size={16} style={{ marginRight: 8 }} />My Rides
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const etaMinutes = etaSeconds != null ? Math.max(1, Math.round(etaSeconds / 60)) : null
  const backTo = isDriver ? '/my-rides' : '/dashboard'

  return (
    <div className="page page--narrow">
      <Link to={backTo} className="backlink">
        <ArrowLeft size={14} aria-hidden="true" />
        {isDriver ? 'My rides' : 'Dashboard'}
      </Link>

      <header className="page-head" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--p-space-md)' }}>
        <div>
          <h1 className="page-title">Live tracking</h1>
          <p className="page-sub">{ride.from_city} → {ride.to_city}</p>
        </div>
        {isActive ? <LiveChip /> : <StatusPill status={ride.status} />}
      </header>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isActive
          ? `Ride in progress. ${etaMinutes ? `Driver is about ${etaMinutes} minutes away.` : 'Waiting for driver location.'}`
          : `Ride status: ${ride.status.replace('_', ' ')}.`}
      </div>

      <div className="track-grid">
        {/* Left: map */}
        <div className="track-main">
          <div className="map-frame track-map">
            {MAP_KEY && ride.from_lat ? (
              <div className="map-frame__canvas map-dark">
                <RouteMap
                  from={{ lat: ride.from_lat, lng: ride.from_lng }}
                  to={{ lat: ride.to_lat, lng: ride.to_lng }}
                  driverLocation={
                    ride.driver_lat && ride.driver_lng
                      ? { lat: ride.driver_lat, lng: ride.driver_lng }
                      : null
                  }
                  height="100%"
                />
              </div>
            ) : (
              <StaticRouteFallback progress={progress} active={isActive} />
            )}
          </div>

          {/* Progress */}
          {isActive && (
            <div className="card card--inset track-progress">
              <div className="track-progress__row">
                <span style={{ color: 'var(--text-secondary)' }}>Route progress</span>
                <strong>{Math.round(progress * 100)}%</strong>
              </div>
              <div className="progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress__bar" style={{ width: `${progress * 100}%` }} />
              </div>
              {isDriver && gps && (
                <p className="gps-live-note">
                  <span className="gps-live-note__dot" aria-hidden="true" />
                  Sharing your live location with passengers
                </p>
              )}
            </div>
          )}

          {!isActive && (
            <div className="card card--inset" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--p-space-md)' }}>
              <Clock size={16} aria-hidden="true" style={{ color: 'var(--accent-text)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <p className="card__title" style={{ fontSize: 'var(--fs-small)', fontWeight: 'var(--p-weight-semibold)' }}>
                  {ride.status === 'completed'
                    ? 'This ride has ended.'
                    : ride.status === 'cancelled'
                      ? 'This ride was cancelled.'
                      : 'Tracking starts once the driver departs.'}
                </p>
                <p className="row-item__sub" style={{ marginTop: 4 }}>
                  Scheduled departure: {formatRideDateTime(ride.departure_time)}
                </p>
              </div>
            </div>
          )}

          {/* Journey timeline — mirrors real backend statuses */}
          <div className="card card--inset stack stack--gap-lg">
            <TimelineStep label="Booked" completed time={formatRideDateTime(ride.departure_time)} />
            <TimelineStep label="Departed" active={isActive} completed={['in_progress', 'completed'].includes(ride.status)} />
            <TimelineStep label="Arrived" completed={ride.status === 'completed'} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="track-aside">
          {isActive && (
            <div className="card eta-hero">
              <p className="row-item__sub" style={{ fontSize: 'var(--fs-small)' }}>
                {isDriver ? 'Destination' : 'Driver arrives in'}
              </p>
              <p className="eta-hero__value">{etaMinutes != null ? `${etaMinutes}′` : '—'}</p>
              <p className="eta-hero__caption">
                {etaMinutes != null ? 'traffic-aware estimate' : 'waiting for driver GPS'}
              </p>
            </div>
          )}

          <DriverCard
            driver={{
              name: ride.driver_name,
              rating: Number(ride.driver_avg_rating) || 0,
              totalRides: ride.driver_total_ratings,
              vehicleMake: ride.brand,
              vehicleModel: ride.model,
              vehiclePlate: ride.vehicle_plate,
            }}
          />

          {/* Actions — all wired */}
          <div className="stack stack--gap-sm">
            {isDriver ? (
              <>
                {ride.status === 'open' && (
                  <StartRideButton rideId={ride.id} onDone={() => rideQuery.refetch()} />
                )}
                {isActive && (
                  <Button onClick={completeRide} disabled={updating} variant="accent" size="lg" block>
                    {updating ? <Loader2 size={16} className="spinner" style={{ marginRight: 8 }} /> : <CheckCircle2 size={16} style={{ marginRight: 8 }} />}
                    Complete ride
                  </Button>
                )}
                {ride.status === 'open' && (
                  <Button variant="ghost" onClick={cancelRide} disabled={updating} block>
                    Cancel ride
                  </Button>
                )}
              </>
            ) : (
              <>
                {ride.driver_phone && (
                  <Button render={<a href={`tel:${ride.driver_phone}`} />} variant="primary" size="lg" block>
                    <Phone size={16} style={{ marginRight: 8 }} />
                    Call driver
                  </Button>
                )}
                <Button render={<Link to={`/chat/${ride.id}`} />} variant="outline" size="md" block>
                  <MessageCircle size={16} style={{ marginRight: 8 }} />
                  Message driver
                </Button>
              </>
            )}
          </div>

          {isDriver && isActive && gpsError && !gpsErrorDismissed && (
            <div className="gps-error">
              <p>{gpsError}</p>
              <button
                type="button"
                onClick={() => { setEnabled(true); setGpsErrorDismissed(true) }}
                className="btn-text"
                style={{ marginTop: 8 }}
              >
                Retry GPS
              </button>
            </div>
          )}

          <div className="card card--inset">
            <p className="map-caption">
              Location updates every few seconds while the ride is in progress. Coordinates come
              directly from the driver's phone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StartRideButton({ rideId, onDone }) {
  const [pending, setPending] = useState(false)
  const start = async () => {
    setPending(true)
    try {
      await api.patch(`/api/rides/${rideId}/status?status=in_progress`)
      onDone?.()
    } catch {
      // simple retry allowed; toast handled by hook callers elsewhere
    }
    setPending(false)
  }
  return (
    <Button onClick={start} disabled={pending} variant="accent" size="lg" block>
      {pending ? <Loader2 size={16} className="spinner" style={{ marginRight: 8 }} /> : <Play size={16} style={{ marginRight: 8 }} />}
      Start ride
    </Button>
  )
}

function StatusPill({ status }) {
  return <span className="badge badge--neutral badge--lg">{status.replace('_', ' ')}</span>
}

function TimelineStep({ label, time, active, completed }) {
  return (
    <div className={`tstep${active ? ' tstep--active' : completed ? ' tstep--done' : ''}`}>
      <span className="tstep__dot" aria-hidden="true">
        {completed ? '✓' : active ? '●' : '○'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="tstep__label">{label}</p>
        {time && <p className="tstep__meta tabular">{time}</p>}
      </div>
    </div>
  )
}

function StaticRouteFallback({ progress, active }) {
  const markerX = 40 + progress * 320
  return (
    <div className="map-frame__fallback" style={{ position: 'relative', display: 'block' }}>
      <svg viewBox="0 0 400 220" className="route-art" fill="none" aria-hidden="true" style={{ maxHeight: '100%' }}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" y1={i * 70} x2="400" y2={i * 70} stroke="var(--divider)" strokeWidth="0.5" opacity="0.4" />
        ))}
        <path d="M 40 170 Q 140 60, 220 110 T 360 60" stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 5" />
        <circle cx="40" cy="170" r="6" fill="var(--accent-solid)" />
        <text x="40" y="192" textAnchor="middle">Pickup</text>
        <circle cx="360" cy="60" r="6" fill="var(--text-muted)" />
        <text x="360" y="44" textAnchor="middle">Drop-off</text>
        {active && (
          <>
            <circle cx={markerX} cy="120" r="16" fill="none" stroke="var(--accent-solid)" strokeWidth="2" opacity="0.3">
              <animate attributeName="r" values="8;20;8" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx={markerX} cy="120" r="6" fill="var(--accent-solid)" />
          </>
        )}
      </svg>
      <p className="map-caption" style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center' }}>
        Map preview unavailable — set VITE_TOMTOM_API_KEY
      </p>
    </div>
  )
}
