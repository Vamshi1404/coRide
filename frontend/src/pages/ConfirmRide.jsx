import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { DriverCard } from '@/components/nocturne/driver-card'
import { SafetyChecklist } from '@/components/nocturne/safety-checklist'
import { FareCounter } from '@/components/nocturne/fare-counter'
import { LiveChip } from '@/components/nocturne/live-indicators'
import { Button } from '@/components/ui/Button'
import RouteMap from '@/components/maps/RouteMap'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatRideDateTime, formatCurrency } from '@/lib/rideDisplay'
import {
  ArrowLeft, MapPin, Navigation, Clock,
  CheckCircle2, AlertTriangle, Loader2, Route as RouteIcon, Wallet,
} from 'lucide-react'

export default function ConfirmRide() {
  const { rideId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [booked, setBooked] = useState(false)

  const rideQuery = useQuery({
    queryKey: ['ride', rideId],
    queryFn: () => api.get(`/api/rides/${rideId}`),
    retry: false,
  })

  const ride = rideQuery.data

  useEffect(() => {
    if (!ride) return undefined
    if (ride.booking_status === 'pending' || ride.booking_status === 'accepted') setBooked(true)
    return undefined
  }, [ride])

  const requestMutation = useMutation({
    mutationFn: () => api.post(`/api/requests/ride/${rideId}`),
    onSuccess: () => {
      setBooked(true)
      queryClient.invalidateQueries({ queryKey: ['ride', rideId] })
      queryClient.invalidateQueries({ queryKey: ['joined-rides'] })
      toast.success('Seat request sent!')
      setTimeout(() => navigate('/my-rides'), 1800)
    },
    onError: (err) => {
      toast.error(err?.message || 'Could not send request.')
    },
  })

  if (rideQuery.isLoading) {
    return (
      <div className="page page--narrow" aria-busy="true">
        <div className="stack stack--gap-lg">
          <div className="skel skel--line lg" style={{ width: 160 }} />
          <div className="skel skel--block" style={{ height: 256 }} />
          <div className="skel skel--block" style={{ height: 160 }} />
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
            <Button render={<Link to="/search" />} variant="outline" size="md">
              <ArrowLeft size={16} style={{ marginRight: 8 }} />Back to Search
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (ride.owner_id === user?.id) {
    return (
      <div className="centered-state">
        <div>
          <RouteIcon size={28} aria-hidden="true" style={{ color: 'var(--accent-text)' }} />
          <h1 className="state__title">This is your ride</h1>
          <p className="state__body">Manage requests and status from the ride page.</p>
          <div className="state__actions">
            <Button render={<Link to={`/rides/${ride.id}`} />} variant="primary" size="md">
              Open ride
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isFull = (ride.available_seats ?? 0) <= 0
  const seatPrice = Number(ride.final_cost) || 0
  const bookingStatus = ride.booking_status

  return (
    <div className="page page--narrow">
      <div className="page-head">
        <Link to="/search" className="backlink">
          <ArrowLeft size={14} aria-hidden="true" />
          Back to search
        </Link>
      </div>

      <div className="detail-head">
        <div>
          <h1 className="page-title">
            {bookingStatus === 'accepted' ? 'Ride confirmed' : booked ? 'Request sent' : 'Confirm your ride'}
          </h1>
          <p className="page-sub">
            {bookingStatus === 'accepted'
              ? 'The driver accepted your request'
              : booked
                ? 'Waiting for the driver to accept'
                : 'Review details before requesting a seat'}
          </p>
        </div>
        {(booked || bookingStatus === 'accepted') && <LiveChip />}
      </div>

      {/* Booking funnel — mirrors the real flow state */}
      <div className="flow-steps" role="list" aria-label="Booking progress" style={{ marginBottom: 'var(--p-space-xl)' }}>
        <span className="flow-step flow-step--done" role="listitem">
          <span className="flow-step__dot">✓</span>
          <span className="flow-step__label">Search</span>
        </span>
        <span className="flow-step__bar" aria-hidden="true" />
        <span className={`flow-step ${booked || bookingStatus ? 'flow-step--done' : 'flow-step--active'}`} role="listitem">
          <span className="flow-step__dot">{booked || bookingStatus ? '✓' : '2'}</span>
          <span className="flow-step__label">Request</span>
        </span>
        <span className="flow-step__bar" aria-hidden="true" />
        <span
          className={`flow-step ${bookingStatus === 'accepted' ? 'flow-step--active' : ''}`}
          role="listitem"
          aria-current={bookingStatus === 'accepted' ? 'step' : undefined}
        >
          <span className="flow-step__dot">3</span>
          <span className="flow-step__label">Ride day</span>
        </span>
      </div>

      <div className="confirm-grid">
        <div className="confirm-main">
          {/* Route map */}
          <div className="map-frame" style={{ height: 260, borderRadius: 'var(--p-radius-lg)', overflow: 'hidden', position: 'relative' }}>
            <RouteMap
              from={ride.from_lat != null && ride.from_lng != null ? { lat: ride.from_lat, lng: ride.from_lng } : null}
              to={ride.to_lat != null && ride.to_lng != null ? { lat: ride.to_lat, lng: ride.to_lng } : null}
              height={260}
            />
            <div className="map-overlaybar">
              <OverlayStat label="From" value={ride.from_city} />
              <span className="ostat-divider" aria-hidden="true" />
              <OverlayStat label="To" value={ride.to_city} />
              <span className="ostat-divider hide-sm-divider" aria-hidden="true" />
              <OverlayStat
                label="Distance"
                value={ride.distance_km != null ? `${Number(ride.distance_km).toFixed(0)} km` : '—'}
              />
            </div>
          </div>

          {/* Route details */}
          <div className="card">
            <div className="vroute">
              <div className="vroute__point">
                <span className="vroute__mark"><span className="vroute__dot" /></span>
                <span>
                  <span className="vroute__name">{ride.from_city}</span><br />
                  <span className="vroute__sub">Pickup point</span>
                </span>
              </div>
              <span className="vroute__stem" aria-hidden="true" />
              <div className="vroute__point vroute__point--dest">
                <span className="vroute__mark"><span className="vroute__dot" /></span>
                <span>
                  <span className="vroute__name">{ride.to_city}</span><br />
                  <span className="vroute__sub">Drop-off point</span>
                </span>
              </div>
            </div>

            <hr className="divider divider--tight" />

            <div className="meta-tiles">
              <Meta label="Departs" value={formatRideDateTime(ride.departure_time)} />
              <Meta
                label="Distance"
                value={ride.distance_km != null ? `${Number(ride.distance_km).toFixed(0)} km` : '—'}
              />
              <Meta label="Seats left" value={String(ride.available_seats ?? '—')} />
            </div>
          </div>

          <SafetyChecklist />
        </div>

        {/* Right column */}
        <div className="confirm-aside">
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

          <div className="card">
            <h2 className="card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={16} aria-hidden="true" style={{ color: 'var(--text-muted)' }} />
              Fare summary
            </h2>
            <div className="stack stack--gap-sm" style={{ marginTop: 'var(--p-space-lg)' }}>
              <div className="fare-row">
                <span className="fare-row__label">Seat price</span>
                <FareCounter value={seatPrice} className="fare-row__value" />
              </div>
              <div className="fare-row">
                <span className="fare-row__label">Seats requested</span>
                <span className="fare-row__value tabular">1</span>
              </div>
              <div className="fare-total fare-row" style={{ display: 'flex' }}>
                <span className="fare-row__label">Total</span>
                <FareCounter value={seatPrice} />
              </div>
              <p className="fare-note">Pay the driver directly — no card needed.</p>
            </div>
          </div>

          {booked || bookingStatus === 'accepted' ? (
            <div className="booking-banner">
              <CheckCircle2 size={20} aria-hidden="true" />
              <div>
                <p className="booking-banner__title">
                  {bookingStatus === 'accepted' ? 'Booking confirmed!' : 'Request sent to driver'}
                </p>
                <p className="booking-banner__sub">Track it under My Rides → Upcoming</p>
              </div>
            </div>
          ) : isFull ? (
            <Button disabled size="lg" block>Ride full</Button>
          ) : (
            <Button
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending}
              variant="primary"
              size="lg"
              block
            >
              {requestMutation.isPending ? (
                <>
                  <Loader2 size={16} className="spinner" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Request seat — {formatCurrency(seatPrice)}
                </>
              )}
            </Button>
          )}

          {!booked && !isFull && (
            <p className="fare-note" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Clock size={12} aria-hidden="true" />
              Free cancellation until the driver departs
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div className="meta-tile" style={{ minWidth: 0 }}>
      <p className="meta-tile__label">{label}</p>
      <p className="meta-tile__value">{value}</p>
    </div>
  )
}

function OverlayStat({ label, value }) {
  return (
    <div className="ostat">
      <p className="ostat__label">{label}</p>
      <p className="ostat__value">{value}</p>
    </div>
  )
}
