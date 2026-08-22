import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { api } from '@/lib/api'
import {
  formatRideDateTime, formatVehicleName, getDriverName, getInitials,
} from '@/lib/rideDisplay'
import { cn } from '@/lib/utils'
import { RideCardSkeleton } from '@/components/nocturne/skeletons'
import {
  CalendarDays, ArrowRight, SearchX, History, Navigation, ChevronRight, Users,
} from 'lucide-react'

export default function MyRides() {
  const [tab, setTab] = useState('upcoming')
  const navigate = useNavigate()
  const reduced = useReducedMotion()

  const offeredQuery = useQuery({ queryKey: ['offered-rides'], queryFn: () => api.get('/api/rides/my') })
  const joinedQuery = useQuery({ queryKey: ['joined-rides'], queryFn: () => api.get('/api/rides/joined') })

  const loading = offeredQuery.isLoading || joinedQuery.isLoading
  const offered = (offeredQuery.data ?? []).map((r) => ({ ...r, user_role: 'Driver' }))
  const joined = (joinedQuery.data ?? []).map((r) => ({ ...r, user_role: 'Passenger' }))
  const all = [...offered, ...joined]

  const upcoming = all
    .filter((r) => r.status !== 'completed' && r.status !== 'cancelled')
    .sort((a, b) => new Date(a.departure_time ?? 0) - new Date(b.departure_time ?? 0))
  const history = all
    .filter((r) => r.status === 'completed')
    .sort((a, b) => new Date(b.departure_time ?? 0) - new Date(a.departure_time ?? 0))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--nc-900)]">My rides</h1>
        <p className="mt-2 text-[var(--nc-500)]">Your scheduled commutes and travel history.</p>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Ride lists"
        className="inline-flex p-1 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] mb-8"
      >
        {[
          { id: 'upcoming', label: `Upcoming${loading ? '' : ` (${upcoming.length})`}` },
          { id: 'history', label: `History${loading ? '' : ` (${history.length})`}` },
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer',
              tab === t.id ? 'text-[var(--nc-0)]' : 'text-[var(--nc-500)] hover:text-[var(--nc-800)]'
            )}
          >
            {tab === t.id && (
              <motion.span
                layoutId="rides-tab-pill"
                className="absolute inset-0 rounded-full bg-[var(--nc-900)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1].map((i) => (
            <RideCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <AnimatePresence mode="wait" initial={false}>
            {tab === 'upcoming' && (
              <motion.div
                key="upcoming"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {upcoming.length === 0 ? (
                  <EmptyState
                    icon={SearchX}
                    title="No upcoming rides"
                    body="Find a seat on a route you need, or offer your own."
                    cta={{ label: 'Find a ride', to: '/search' }}
                  />
                ) : (
                  <ul className="space-y-4">
                    {upcoming.map((ride) => (
                      <li key={`${ride.user_role}-${ride.id}`}>
                        <UpcomingCard ride={ride} onOpen={() => navigate(`/rides/${ride.id}`)} />
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {/* History */}
            {tab === 'history' && (
              <motion.div
                key="history"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {history.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title="No history yet"
                    body="Completed rides will show up here with their details."
                  />
                ) : (
                  <ul className="space-y-3">
                    {history.map((ride) => (
                      <li key={`${ride.user_role}-${ride.id}`}>
                        <button
                          onClick={() => navigate(`/rides/${ride.id}`)}
                          className="w-full group flex items-center gap-4 p-4 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] hover:border-[var(--nc-400)] transition-colors text-left cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[var(--nc-800)] truncate">
                              {ride.from_city} → {ride.to_city}
                            </p>
                            <p className="text-xs text-[var(--nc-500)] mt-0.5 tabular-nums">
                              {formatRideDateTime(ride.departure_time)} · as {ride.user_role}
                            </p>
                          </div>
                          <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--nc-accent-dim)] text-[var(--nc-accent)]">
                            Completed
                          </span>
                          <ChevronRight size={16} className="text-[var(--nc-500)] shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

function UpcomingCard({ ride, onOpen }) {
  const isDriving = ride.user_role === 'Driver'
  const confirmed = ride.booking_status === 'accepted' || isDriving

  return (
    <div
      className="group p-5 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] hover:border-[var(--nc-400)] transition-colors cursor-pointer"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      {/* Status row */}
      <div className="flex items-center gap-2.5 mb-4 flex-wrap">
        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-[11px] font-semibold',
            confirmed
              ? 'bg-[var(--nc-900)] text-[var(--nc-0)]'
              : 'bg-[var(--nc-accent-dim)] text-[var(--nc-accent)]'
          )}
        >
          {confirmed ? 'Confirmed' : 'Pending approval'}
        </span>
        {ride.status === 'in_progress' && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--nc-accent)]">
            <span className="size-1.5 rounded-full bg-[var(--nc-accent)] animate-pulse" />
            LIVE
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs text-[var(--nc-500)] tabular-nums ml-auto">
          <CalendarDays size={12} />
          {formatRideDateTime(ride.departure_time)}
        </span>
      </div>

      {/* Route */}
      <div className="space-y-3">
        <RoutePoint dot="accent" name={ride.from_city} sub="Pickup" />
        <div className="ml-[7px] w-px h-4 bg-[var(--nc-300)]" aria-hidden="true" />
        <RoutePoint dot="gray" name={ride.to_city} sub="Drop-off" />
      </div>

      {/* Driver + vehicle + CTA */}
      <div className="mt-5 pt-4 border-t border-[var(--nc-300)] flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="size-10 rounded-full bg-[var(--nc-300)] flex items-center justify-center text-xs font-bold text-[var(--nc-700)]">
            {getInitials(getDriverName(ride))}
          </div>
          {confirmed && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[var(--nc-accent)] ring-2 ring-[var(--nc-200)]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-[var(--nc-500)]">
            {isDriving ? 'You are driving' : 'Your driver'}
          </p>
          <p className="text-sm font-semibold text-[var(--nc-800)] truncate">
            {isDriving ? 'Your vehicle' : getDriverName(ride)}
          </p>
          <p className="text-xs text-[var(--nc-500)] truncate flex items-center gap-1.5">
            {formatVehicleName(ride)}
            {ride.vehicle_plate && <span className="font-mono">· {ride.vehicle_plate}</span>}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[var(--nc-900)] text-[var(--nc-0)] text-xs font-semibold group-hover:bg-[var(--nc-accent)] transition-colors">
          Details
          <ArrowRight size={13} />
        </span>
      </div>
    </div>
  )
}

function RoutePoint({ dot, name, sub }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          'size-[15px] rounded-full border-4 mt-0.5 shrink-0',
          dot === 'accent'
            ? 'bg-[var(--nc-accent)]/30 border-[var(--nc-accent)]'
            : 'bg-[var(--nc-400)]/30 border-[var(--nc-500)]'
        )}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--nc-800)] break-words">{name}</p>
        <p className="text-xs text-[var(--nc-500)]">{sub}</p>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, body, cta }) {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto size-14 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] flex items-center justify-center">
        <Icon size={22} className="text-[var(--nc-500)]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--nc-900)]">{title}</h3>
      <p className="mt-1.5 text-sm text-[var(--nc-500)] max-w-sm mx-auto">{body}</p>
      {cta && (
        <button
          onClick={() => window.location.assign(cta.to)}
          className="mt-6 px-5 py-2.5 rounded-full bg-[var(--nc-900)] text-[var(--nc-0)] text-sm font-medium hover:bg-[var(--nc-800)] transition-colors cursor-pointer"
        >
          {cta.label}
        </button>
      )}
    </div>
  )
}
