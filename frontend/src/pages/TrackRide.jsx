import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DriverCard } from '@/components/nocturne/driver-card'
import { LiveChip } from '@/components/nocturne/live-indicators'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from '@/hooks/useLocation'
import { useRideStatus } from '@/hooks/useRideStatus'
import { calculateRoute } from '@/lib/tomtom'
import { formatRideDateTime } from '@/lib/rideDisplay'
import RouteMap from '../components/map/RouteMap'
import { cn } from '@/lib/utils'
import {
  ArrowLeft, Phone, MessageCircle, AlertTriangle, Loader2, Play, CheckCircle2,
  Clock, MapPin,
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

  // Driver: broadcast GPS while ride is in progress
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

  // Everyone: poll driver location comes through the same ride query (driver_lat/lng fields)

  // ETA: driver position -> destination, traffic-aware
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
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 space-y-5" aria-busy="true">
        <div className="h-6 w-40 rounded bg-[var(--nc-200)] animate-pulse" />
        <div className="h-72 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] animate-pulse" />
        <div className="h-32 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] animate-pulse" />
      </div>
    )
  }

  if (rideQuery.isError || !ride) {
    return (
      <div className="min-h-[60vh] pt-32 pb-16 px-6 flex items-center justify-center text-center">
        <div>
          <AlertTriangle size={28} className="mx-auto text-[var(--nc-accent)]" />
          <h1 className="mt-4 text-xl font-bold text-[var(--nc-900)]">Ride not found</h1>
          <p className="mt-1.5 text-sm text-[var(--nc-500)]">It may have been cancelled or removed.</p>
          <Button asChild variant="outline" className="mt-6 border-[var(--nc-400)] text-[var(--nc-600)] cursor-pointer">
            <Link to="/my-rides"><ArrowLeft size={16} className="mr-2" />My Rides</Link>
          </Button>
        </div>
      </div>
    )
  }

  const etaMinutes = etaSeconds != null ? Math.max(1, Math.round(etaSeconds / 60)) : null
  const backTo = isDriver ? '/my-rides' : '/dashboard'

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to={backTo} className="inline-flex items-center gap-2 text-[var(--nc-500)] text-sm hover:text-[var(--nc-800)] transition-colors cursor-pointer">
          <ArrowLeft size={14} />{isDriver ? 'My rides' : 'Dashboard'}
        </Link>

        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h1 className="text-[var(--nc-900)] text-2xl font-bold tracking-tight">Live tracking</h1>
            <p className="text-[var(--nc-500)] text-sm truncate">{ride.from_city} → {ride.to_city}</p>
          </div>
          {isActive ? <LiveChip /> : <StatusPill status={ride.status} />}
        </div>

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isActive
            ? `Ride in progress. ${etaMinutes ? `Driver is about ${etaMinutes} minutes away.` : 'Waiting for driver location.'}`
            : `Ride status: ${ride.status.replace('_', ' ')}.`}
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Left: map */}
          <div className="md:col-span-3 space-y-4">
            <div className="rounded-[14px] overflow-hidden border border-[var(--nc-300)] bg-[var(--nc-100)]">
              {MAP_KEY && ride.from_lat ? (
                <div className="map-dark h-72">
                  <RouteMap
                    from={{ lat: ride.from_lat, lng: ride.from_lng }}
                    to={{ lat: ride.to_lat, lng: ride.to_lng }}
                    driverLocation={
                      ride.driver_lat && ride.driver_lng
                        ? { lat: ride.driver_lat, lng: ride.driver_lng }
                        : null
                    }
                    height="18rem"
                  />
                </div>
              ) : (
                <StaticRouteFallback progress={progress} active={isActive} />
              )}
            </div>

            {/* Progress */}
            {isActive && (
              <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--nc-600)]">Route progress</span>
                    <span className="text-[var(--nc-800)] font-semibold tabular-nums">
                      {Math.round(progress * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--nc-300)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-full bg-[var(--nc-accent)] rounded-full transition-all duration-700"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  {isDriver && gps && (
                    <p className="text-xs text-[var(--nc-500)] flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[var(--nc-accent)] animate-pulse" />
                      Sharing your live location with passengers
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {!isActive && (
              <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
                <CardContent className="p-5 flex items-start gap-3">
                  <Clock size={16} className="text-[var(--nc-accent)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[var(--nc-800)] text-sm font-medium">
                      {ride.status === 'completed'
                        ? 'This ride has ended.'
                        : ride.status === 'cancelled'
                          ? 'This ride was cancelled.'
                          : 'Tracking starts once the driver departs.'}
                    </p>
                    <p className="text-[var(--nc-500)] text-xs mt-1">
                      Scheduled departure: {formatRideDateTime(ride.departure_time)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Journey timeline — mirrors real backend statuses */}
            <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
              <CardContent className="p-5 space-y-4">
                <TimelineStep label="Booked" completed time={formatRideDateTime(ride.departure_time)} />
                <TimelineStep label="Departed" active={isActive} completed={['in_progress', 'completed'].includes(ride.status)} />
                <TimelineStep label="Arrived" completed={ride.status === 'completed'} />
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="md:col-span-2 space-y-4 self-start">
            {isActive && (
              <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
                <CardContent className="p-5 text-center space-y-1">
                  <p className="text-[var(--nc-500)] text-sm">
                    {isDriver ? 'Destination' : 'Driver arrives in'}
                  </p>
                  <p className="text-4xl font-bold text-[var(--nc-900)] tabular-nums">
                    {etaMinutes != null ? `${etaMinutes}′` : '—'}
                  </p>
                  <p className="text-[var(--nc-500)] text-xs">
                    {etaMinutes != null ? 'traffic-aware estimate' : 'waiting for driver GPS'}
                  </p>
                </CardContent>
              </Card>
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
            <div className="space-y-2">
              {isDriver ? (
                <>
                  {ride.status === 'open' && (
                    <StartRideButton rideId={ride.id} onDone={() => rideQuery.refetch()} />
                  )}
                  {isActive && (
                    <Button
                      onClick={completeRide}
                      disabled={updating}
                      className="w-full bg-[var(--nc-accent)] hover:brightness-110 text-white cursor-pointer"
                      size="lg"
                    >
                      {updating ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
                      Complete ride
                    </Button>
                  )}
                  {ride.status === 'open' && (
                    <Button variant="ghost" onClick={cancelRide} disabled={updating} className="w-full text-[var(--nc-500)] cursor-pointer">
                      Cancel ride
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {ride.driver_phone && (
                    <Button asChild className="w-full bg-[var(--nc-900)] text-white hover:bg-[var(--nc-800)] cursor-pointer" size="lg">
                      <a href={`tel:${ride.driver_phone}`}>
                        <Phone size={16} className="mr-2" />
                        Call driver
                      </a>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="w-full border-[var(--nc-400)] text-[var(--nc-600)] cursor-pointer">
                    <Link to={`/chat/${ride.id}`}>
                      <MessageCircle size={16} className="mr-2" />
                      Message driver
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {isDriver && isActive && gpsError && !gpsErrorDismissed && (
              <Card className="bg-[var(--nc-accent-dim)] border border-[var(--nc-accent)]/50">
                <CardContent className="p-4">
                  <p className="text-[var(--nc-800)] text-xs">{gpsError}</p>
                  <button
                    onClick={() => { setEnabled(true); setGpsErrorDismissed(true) }}
                    className="mt-2 text-xs font-semibold text-[var(--nc-accent)] cursor-pointer"
                  >
                    Retry GPS
                  </button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-[var(--nc-100)] border-[var(--nc-300)] border">
              <CardContent className="p-4">
                <p className="text-[var(--nc-500)] text-xs leading-relaxed">
                  Location updates every few seconds while the ride is in progress. Coordinates come
                  directly from the driver's phone.
                </p>
              </CardContent>
            </Card>
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
      // toast handled by caller pattern; simple retry allowed
    }
    setPending(false)
  }
  return (
    <Button
      onClick={start}
      disabled={pending}
      className="w-full bg-[var(--nc-accent)] hover:brightness-110 text-white cursor-pointer"
      size="lg"
    >
      {pending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Play size={16} className="mr-2" />}
      Start ride
    </Button>
  )
}

function StatusPill({ status }) {
  return (
    <span className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-[var(--nc-200)] border border-[var(--nc-300)] text-[var(--nc-600)] capitalize">
      {status.replace('_', ' ')}
    </span>
  )
}

function TimelineStep({ label, time, active, completed }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shrink-0',
          active
            ? 'bg-[var(--nc-accent)] text-white'
            : completed
              ? 'bg-[var(--nc-900)] text-white'
              : 'bg-[var(--nc-300)] text-[var(--nc-500)]'
        )}
      >
        {completed ? '✓' : active ? '●' : '○'}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            active ? 'text-[var(--nc-900)]' : completed ? 'text-[var(--nc-700)]' : 'text-[var(--nc-500)]'
          )}
        >
          {label}
        </p>
        {time && <p className="text-[var(--nc-500)] text-xs tabular-nums">{time}</p>}
      </div>
    </div>
  )
}

function StaticRouteFallback({ progress, active }) {
  const markerX = 40 + progress * 320
  return (
    <div className="h-72 flex items-center justify-center relative">
      <svg viewBox="0 0 400 220" className="w-full h-full" fill="none" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" y1={i * 70} x2="400" y2={i * 70} stroke="var(--nc-300)" strokeWidth="0.5" opacity="0.3" />
        ))}
        <path id="track-route" d="M 40 170 Q 140 60, 220 110 T 360 60" stroke="var(--nc-400)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 5" />
        <circle cx="40" cy="170" r="6" fill="var(--nc-accent)" />
        <text x="40" y="192" fill="var(--nc-500)" fontSize="10" textAnchor="middle">Pickup</text>
        <circle cx="360" cy="60" r="6" fill="var(--nc-500)" />
        <text x="360" y="44" fill="var(--nc-500)" fontSize="10" textAnchor="middle">Drop-off</text>
        {active && (
          <>
            <circle cx={markerX} cy="120" r="16" fill="none" stroke="var(--nc-accent)" strokeWidth="2" opacity="0.3">
              <animate attributeName="r" values="8;20;8" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <circle cx={markerX} cy="120" r="6" fill="var(--nc-accent)" />
          </>
        )}
      </svg>
      <p className="absolute bottom-3 text-[10px] text-[var(--nc-500)] flex items-center gap-1">
        <MapPin size={10} /> Map preview unavailable — set VITE_TOMTOM_API_KEY
      </p>
    </div>
  )
}
