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
import { cn } from '@/lib/utils'
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16 space-y-5" aria-busy="true">
        <div className="h-8 w-72 max-w-full rounded bg-[var(--nc-200)] animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] animate-pulse" />
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-40 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (rideQuery.isError || !ride) {
    return (
      <div className="min-h-[60vh] pt-32 pb-16 px-6 flex items-center justify-center text-center">
        <div>
          <CircleAlert size={28} className="mx-auto text-[var(--nc-accent)]" />
          <h1 className="mt-4 text-xl font-bold text-[var(--nc-900)]">Ride not found</h1>
          <p className="mt-1.5 text-sm text-[var(--nc-500)]">It may have been cancelled or removed.</p>
          <Link to="/my-rides" className="inline-block mt-6 px-5 py-2.5 rounded-full bg-[var(--nc-900)] text-[var(--nc-0)] text-sm font-medium hover:bg-[var(--nc-800)] transition-colors">
            My Rides
          </Link>
        </div>
      </div>
    )
  }

  const currentStep = STEPS.findIndex((s) => s.key === ride.status)
  const isActive = ride.status === 'in_progress'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8"
      >
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[var(--nc-500)] mb-2">
            <Link to="/my-rides" className="hover:text-[var(--nc-accent)] transition-colors">My Rides</Link>
            <ChevronRight size={12} />
            <span className="truncate font-mono">#CR-{String(ride.id).slice(-6)}-HYD</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--nc-900)] truncate">
            {ride.from_city} <span className="text-[var(--nc-500)]">to</span> {ride.to_city}
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isActive ? (
            <Link
              to={`/track/${ride.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--nc-accent-dim)] border border-[var(--nc-accent)]/50 text-sm font-semibold text-[var(--nc-accent)] hover:brightness-110 transition-all"
            >
              <span className="size-1.5 rounded-full bg-[var(--nc-accent)] animate-pulse" />
              Live · Open tracker
            </Link>
          ) : (
            <span className="px-4 py-2 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] text-xs font-medium text-[var(--nc-600)] capitalize">
              {ride.status.replace('_', ' ')}
            </span>
          )}
        </div>
      </motion.header>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="lg:col-span-2 space-y-5 min-w-0"
        >
          {/* Map */}
          <div className="rounded-[14px] overflow-hidden border border-[var(--nc-300)] relative">
            <RouteMap
              from={{ lat: ride.from_lat, lng: ride.from_lng }}
              to={{ lat: ride.to_lat, lng: ride.to_lng }}
              height={320}
            />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 px-4 py-2.5 rounded-[12px] bg-[var(--nc-50)]/85 backdrop-blur-md border border-[var(--nc-300)]">
              <OverlayStat label="Departure" value={ride.departure_time ? new Date(ride.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'} />
              <div className="w-px h-7 bg-[var(--nc-300)]" />
              <OverlayStat label="Distance" value={ride.distance_km != null ? `${Number(ride.distance_km).toFixed(1)} km` : '—'} />
              <div className="w-px h-7 bg-[var(--nc-300)] hidden sm:block" />
              <OverlayStat label="Seats left" value={String(ride.available_seats ?? '—')} className="hidden sm:block" />
            </div>
          </div>

          {/* Timeline */}
          <div className="p-5 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--nc-500)] mb-4">
              Journey timeline
            </h3>
            <ol className="grid sm:grid-cols-3 gap-4">
              {STEPS.map((step, idx) => {
                const done = currentStep > idx || ride.status === 'cancelled'
                const activeNow = currentStep === idx
                return (
                  <li key={step.key} className="flex sm:flex-col items-center sm:items-start gap-3">
                    <span
                      className={cn(
                        'size-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                        activeNow
                          ? 'bg-[var(--nc-accent)] text-white'
                          : done
                            ? 'bg-[var(--nc-900)] text-[var(--nc-0)]'
                            : 'bg-[var(--nc-100)] border border-[var(--nc-400)] text-[var(--nc-500)]'
                      )}
                    >
                      {activeNow ? <step.icon size={15} /> : <step.icon size={15} />}
                    </span>
                    <div className="text-center sm:text-left">
                      <p className={cn('text-sm font-semibold', activeNow ? 'text-[var(--nc-900)]' : done ? 'text-[var(--nc-700)]' : 'text-[var(--nc-500)]')}>
                        {step.label}
                      </p>
                      <p className="text-[11px] text-[var(--nc-500)]">
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
            <Link
              to={`/track/${ride.id}`}
              className="group flex items-center gap-4 p-5 rounded-[14px] bg-[var(--nc-900)] hover:bg-[var(--nc-800)] transition-colors"
            >
              <span className="relative flex size-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--nc-accent)] opacity-60" />
                <span className="relative inline-flex rounded-full size-3 bg-[var(--nc-accent)]" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--nc-0)] font-semibold text-sm">This ride is live</p>
                <p className="text-[var(--nc-0)]/60 text-xs mt-0.5">
                  Follow the driver's GPS position and traffic-aware ETA in real time.
                </p>
              </div>
              <Navigation size={18} className="text-[var(--nc-accent)] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          )}

          {/* Driver requests (driver view) */}
          {isDriver && (
            <div className="p-5 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)]">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--nc-500)] mb-3">
                Passenger requests
              </h3>
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
          className="space-y-5 lg:sticky lg:top-24"
        >
          {/* Driver card */}
          <div className="p-5 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)]">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-full bg-[var(--nc-300)] flex items-center justify-center text-base font-bold text-[var(--nc-700)] shrink-0">
                {getInitials(getDriverName(ride))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-[var(--nc-500)]">
                  {isDriver ? 'You are the driver' : 'Your driver'}
                </p>
                <p className="font-semibold text-[var(--nc-800)] truncate">{getDriverName(ride)}</p>
                <p className="text-xs text-[var(--nc-500)] flex items-center gap-1 mt-0.5 tabular-nums">
                  <Star size={11} className="fill-current text-[var(--nc-accent)]" />
                  {ride.driver_avg_rating ? Number(ride.driver_avg_rating).toFixed(1) : 'New driver'}
                  {ride.driver_total_ratings > 0 && (
                    <span className="ml-0.5">({ride.driver_total_ratings})</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 p-3 rounded-[12px] bg-[var(--nc-100)] border border-[var(--nc-300)]">
              <CarFront size={18} className="text-[var(--nc-accent)] shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--nc-800)] truncate">{formatVehicleName(ride)}</p>
                {ride.vehicle_plate && (
                  <p className="text-xs text-[var(--nc-500)] font-mono">{ride.vehicle_plate}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate(`/chat/${ride.id}`)}
              className="mt-4 w-full h-11 rounded-full bg-[var(--nc-900)] text-[var(--nc-0)] text-sm font-semibold hover:bg-[var(--nc-800)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} />
              {isDriver ? 'Chat with passengers' : 'Chat with driver'}
            </button>

            {!isDriver && (
              <div className="mt-3">
                <RequestButton ride={ride} onUpdate={() => rideQuery.refetch()} />
              </div>
            )}

            {!isDriver && ride.booking_id && ride.booking_status !== 'accepted' && (
              <button
                onClick={handleCancelRequest}
                disabled={cancelling}
                className="mt-2 w-full h-10 text-sm font-medium text-[var(--nc-500)] hover:text-[var(--nc-accent)] transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelling ? 'Cancelling…' : 'Withdraw my request'}
              </button>
            )}

            {isDriver && ride.status === 'open' && (
              <>
                <button
                  onClick={startRide}
                  disabled={updating}
                  className="mt-3 w-full h-11 rounded-full bg-[var(--nc-accent)] text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                  Start ride
                </button>
                <button
                  onClick={cancelRide}
                  disabled={updating}
                  className="mt-2 w-full h-10 text-sm font-medium text-[var(--nc-500)] hover:text-[var(--nc-accent)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel ride
                </button>
              </>
            )}

            {isDriver && isActive && (
              <>
                <button
                  onClick={completeRide}
                  disabled={updating}
                  className="mt-3 w-full h-11 rounded-full bg-[var(--nc-accent)] text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  Complete ride
                </button>
                <button
                  onClick={cancelRide}
                  disabled={updating}
                  className="mt-2 w-full h-10 text-sm font-medium text-[var(--nc-500)] hover:text-[var(--nc-accent)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel ride
                </button>
              </>
            )}
          </div>

          {/* Fare card */}
          <div className="p-5 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--nc-500)]">Fare per seat</p>
                <p className="text-2xl font-bold text-[var(--nc-900)] tabular-nums mt-0.5">
                  {formatCurrency(ride.final_cost)}
                </p>
              </div>
              <span className="text-xs text-[var(--nc-500)] tabular-nums text-right">
                {new Date(ride.departure_time).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-xs text-[var(--nc-500)] leading-relaxed">
              <li>· Pay the driver directly at pickup — cash or UPI.</li>
              <li>· Requests are free to withdraw until accepted.</li>
              <li>· Rate your co-travellers after the ride.</li>
            </ul>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}

function OverlayStat({ label, value, className }) {
  return (
    <div className={`min-w-0 ${className || ''}`}>
      <p className="text-[9px] uppercase tracking-wide text-[var(--nc-500)]">{label}</p>
      <p className="text-sm font-bold text-[var(--nc-900)] tabular-nums truncate">{value}</p>
    </div>
  )
}
