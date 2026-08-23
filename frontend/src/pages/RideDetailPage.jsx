import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useRideStatus } from '../hooks/useRideStatus'
import RequestButton from '../components/bookings/RequestButton'
import RequestList from '../components/bookings/RequestList'
import RouteMap from '../components/maps/RouteMap'
import {
  formatCurrency, formatVehicleName, getDriverName, getInitials,
} from '@/lib/rideDisplay'
import {
  ChevronRight, Star, CarFront, MessageCircle, Navigation,
  Play, CheckCircle2, Loader2, MapPin, Flag, CircleAlert,
} from 'lucide-react'

const STEPS = [
  { key: 'open', label: 'Scheduled', icon: MapPin },
  { key: 'in_progress', label: 'In progress', icon: Navigation },
  { key: 'completed', label: 'Completed', icon: Flag },
]

export default function RideDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cancelling, setCancelling] = useState(false)

  const rideQuery = useQuery({
    queryKey: ['ride', id],
    queryFn: () => api.get(`/api/rides/${id}`),
    refetchInterval: (q) => (q?.state?.data?.status === 'in_progress' ? 5000 : 15000),
    retry: false,
  })

  const ride = rideQuery.data
  const isDriver = Boolean(ride && user && ride.owner_id === user.id)

  // Driver-only: passenger requests, polled while open
  const requestsQuery = useQuery({
    queryKey: ['ride-requests', id],
    queryFn: () => api.get(`/api/requests/ride/${id}`),
    enabled: isDriver,
    refetchInterval: (q) => {
      const status = q?.state?.data
      return Array.isArray(status) && status.some((r) => r.status === 'pending') ? 5000 : 15000
    },
  })

  const { startRide, completeRide, cancelRide, updating } = useRideStatus(ride, () =>
    rideQuery.refetch()
  )

  const handleCancelRequest = async () => {
    if (!ride?.booking_id) return
    if (!window.confirm('Cancel this seat request?')) return
    setCancelling(true)
    try {
      await api.patch(`/api/requests/${ride.booking_id}?status=cancelled`)
      await rideQuery.refetch()
    } catch (err) {
      toast.error(err.message)
    }
    setCancelling(false)
  }

  if (rideQuery.isLoading) {
    return (
      <div className="page" aria-busy="true">
        <div className="stack stack--gap-lg">
          <div className="skel skel--line lg" style={{ width: 280, maxWidth: '100%' }} />
          <div className="detail-grid">
            <div className="skel skel--block" style={{ height: 320 }} />
            <div className="stack stack--gap-md">
              {[0, 1].map((i) => (
                <div key={i} className="skel skel--block" style={{ height: 160 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (rideQuery.isError || !ride) {
    return (
      <div className="centered-state">
        <div>
          <CircleAlert size={28} aria-hidden="true" style={{ color: 'var(--accent-text)' }} />
          <h1 className="state__title">Ride not found</h1>
          <p className="state__body">It may have been cancelled or removed.</p>
          <div className="state__actions">
            <Link to="/my-rides" className="btn btn--primary btn--md">My Rides</Link>
          </div>
        </div>
      </div>
    )
  }

  const currentStep = STEPS.findIndex((s) => s.key === ride.status)
  const isActive = ride.status === 'in_progress'

  return (
    <div className="page">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="detail-head"
      >
        <div style={{ minWidth: 0 }}>
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link to="/my-rides">My Rides</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="mono">#CR-{String(ride.id).slice(-6)}-HYD</span>
          </nav>
          <h1 className="page-title detail-title-row" style={{ display: 'block' }}>
            {ride.from_city} <span style={{ color: 'var(--text-muted)', fontWeight: 'var(--p-weight-medium)' }}>to</span> {ride.to_city}
          </h1>
        </div>

        <div className="row-item__actions">
          {isActive ? (
            <Link to={`/track/${ride.id}`} className="badge badge--live badge--lg" style={{ textDecoration: 'none' }}>
              <span className="badge__dot" aria-hidden="true" />
              Live · Open tracker
            </Link>
          ) : (
            <span className={`badge badge--${ride.status === 'open' ? 'open' : ride.status} badge--lg`}>
              {ride.status.replace('_', ' ')}
            </span>
          )}
        </div>
      </motion.header>

      <div className="detail-grid">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="detail-main"
        >
          {/* Map */}
          <div className="map-frame" style={{ height: 340 }}>
            <RouteMap
              from={{ lat: ride.from_lat, lng: ride.from_lng }}
              to={{ lat: ride.to_lat, lng: ride.to_lng }}
              height="100%"
            />
            <div className="map-overlaybar">
              <OverlayStat label="Departure" value={ride.departure_time ? new Date(ride.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'} />
              <span className="ostat-divider" aria-hidden="true" />
              <OverlayStat label="Distance" value={ride.distance_km != null ? `${Number(ride.distance_km).toFixed(1)} km` : '—'} />
              <span className="ostat-divider hide-sm-divider" aria-hidden="true" />
              <OverlayStat label="Seats left" value={String(ride.available_seats ?? '—')} />
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="section-head">Journey timeline</h2>
            <ol className="journey-steps" style={{ listStyle: 'none', padding: 0 }}>
              {STEPS.map((step, idx) => {
                const done = currentStep > idx || ride.status === 'cancelled'
                const activeNow = currentStep === idx
                const state = activeNow ? ' tstep--active' : done ? ' tstep--done' : ''
                return (
                  <li key={step.key} className={`tstep${state}`}>
                    <span className="tstep__dot"><step.icon size={15} aria-hidden="true" /></span>
                    <div>
                      <p className="tstep__label">{step.label}</p>
                      <p className="tstep__meta">
                        {activeNow ? 'Current stage' : done ? 'Done' : 'Upcoming'}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Live tracking promo while active */}
          {isActive && (
            <Link to={`/track/${ride.id}`} className="live-banner">
              <span className="live-banner__ping" aria-hidden="true" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="live-banner__title">This ride is live</p>
                <p className="live-banner__sub">
                  Follow the driver's GPS position and traffic-aware ETA in real time.
                </p>
              </div>
              <Navigation size={18} aria-hidden="true" style={{ color: 'var(--accent-text)', flexShrink: 0 }} />
            </Link>
          )}

          {/* Driver requests (driver view) */}
          {isDriver && (
            <div className="card">
              <h2 className="section-head">Passenger requests</h2>
              <RequestList
                requests={requestsQuery.data}
                ride={ride}
                onUpdate={() => {
                  rideQuery.refetch()
                  requestsQuery.refetch()
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Right */}
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="detail-aside"
        >
          {/* Driver card */}
          <div className="card">
            <div className="result-card__driver">
              <span className="avatar avatar--lg">{getInitials(getDriverName(ride))}</span>
              <div className="row-item__body">
                <p className="ride-card__who-label">{isDriver ? 'You are the driver' : 'Your driver'}</p>
                <p className="card__title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getDriverName(ride)}</p>
                <p className="rating-chip tabular">
                  <Star size={11} style={{ fill: 'currentColor' }} aria-hidden="true" />
                  {ride.driver_avg_rating ? Number(ride.driver_avg_rating).toFixed(1) : 'New driver'}
                  {ride.driver_total_ratings > 0 && <span style={{ color: 'var(--text-muted)' }}>({ride.driver_total_ratings})</span>}
                </p>
              </div>
            </div>

            <div className="vehicle-strip" style={{ marginTop: 'var(--p-space-lg)' }}>
              <CarFront size={18} aria-hidden="true" />
              <div style={{ minWidth: 0 }}>
                <p className="vehicle-strip__name">{formatVehicleName(ride)}</p>
                {ride.vehicle_plate && (
                  <p className="vehicle-strip__plate">{ride.vehicle_plate}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/chat/${ride.id}`)}
              className="btn btn--primary btn--md btn--block"
              style={{ marginTop: 'var(--p-space-lg)' }}
            >
              <MessageCircle size={15} aria-hidden="true" />
              {isDriver ? 'Chat with passengers' : 'Chat with driver'}
            </button>

            {!isDriver && (
              <div style={{ marginTop: 'var(--p-space-md)' }}>
                <RequestButton ride={ride} onUpdate={() => rideQuery.refetch()} />
              </div>
            )}

            {!isDriver && ride.booking_id && ride.booking_status !== 'accepted' && (
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={cancelling}
                className="withdraw-btn"
                style={{ marginTop: 'var(--p-space-sm)' }}
              >
                {cancelling ? 'Cancelling…' : 'Withdraw my request'}
              </button>
            )}

            {isDriver && ride.status === 'open' && (
              <>
                <button
                  type="button"
                  onClick={startRide}
                  disabled={updating}
                  className="btn btn--accent btn--md btn--block"
                  style={{ marginTop: 'var(--p-space-md)' }}
                >
                  {updating ? <Loader2 size={15} className="spinner" aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
                  Start ride
                </button>
                <button type="button" onClick={cancelRide} disabled={updating} className="withdraw-btn" style={{ marginTop: 'var(--p-space-xs)' }}>
                  Cancel ride
                </button>
              </>
            )}

            {isDriver && isActive && (
              <>
                <button
                  type="button"
                  onClick={completeRide}
                  disabled={updating}
                  className="btn btn--accent btn--md btn--block"
                  style={{ marginTop: 'var(--p-space-md)' }}
                >
                  {updating ? <Loader2 size={15} className="spinner" aria-hidden="true" /> : <CheckCircle2 size={15} aria-hidden="true" />}
                  Complete ride
                </button>
                <button type="button" onClick={cancelRide} disabled={updating} className="withdraw-btn" style={{ marginTop: 'var(--p-space-xs)' }}>
                  Cancel ride
                </button>
              </>
            )}
          </div>

          {/* Fare card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--p-space-md)' }}>
              <div>
                <p className="ride-card__who-label">Fare per seat</p>
                <p className="tabular" style={{ fontSize: 'var(--p-text-2xl)', fontWeight: 'var(--p-weight-extrabold)', color: 'var(--text-strong)' }}>
                  {formatCurrency(ride.final_cost)}
                </p>
              </div>
              <span className="tstep__meta tabular" style={{ textAlign: 'right' }}>
                {new Date(ride.departure_time).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
              </span>
            </div>
            <ul className="fare-list">
              <li>Pay the driver directly at pickup — cash or UPI.</li>
              <li>Requests are free to withdraw until accepted.</li>
              <li>Rate your co-travellers after the ride.</li>
            </ul>
          </div>
        </motion.aside>
      </div>
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
