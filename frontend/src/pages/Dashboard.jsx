import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatRideDateTime } from '@/lib/rideDisplay'
import { cn } from '@/lib/utils'
import {
  Search, CarFront, ArrowRight, ArrowUpRight, MessageCircle,
  Navigation, Star, CheckCircle2, CalendarX2, Route as RouteIcon,
} from 'lucide-react'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const reduced = useReducedMotion()

  const offeredQuery = useQuery({
    queryKey: ['offered-rides'],
    queryFn: () => api.get('/api/rides/my'),
    refetchInterval: 30_000,
  })
  const joinedQuery = useQuery({
    queryKey: ['joined-rides'],
    queryFn: () => api.get('/api/rides/joined'),
    refetchInterval: 30_000,
  })

  const loading = offeredQuery.isLoading || joinedQuery.isLoading
  const offered = offeredQuery.data ?? []
  const joined = joinedQuery.data ?? []

  const activeRides = [
    ...joined
      .filter((r) => r.booking_status === 'accepted' || r.status === 'in_progress')
      .map((r) => ({ ...r, role: 'Passenger' })),
    ...offered
      .filter((r) => r.status === 'open' || r.status === 'in_progress')
      .map((r) => ({ ...r, role: 'Driver' })),
  ].slice(0, 4)

  const nextRide = [...activeRides].sort(
    (a, b) => new Date(a.departure_time ?? 0) - new Date(b.departure_time ?? 0)
  )[0]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
      {/* Header */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--nc-900)]">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1.5 text-[var(--nc-500)]">
            Ready for your next commute?
          </p>
        </div>
        <p className="text-sm text-[var(--nc-500)] tabular-nums">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </motion.div>

      {/* Bento actions */}
      <div className="grid sm:grid-cols-2 gap-5">
        <ActionCard
          to="/search"
          icon={Search}
          title="Find a Ride"
          desc="Join a carpool heading your way."
          cta="Explore routes"
        />
        <ActionCard
          to="/offer-ride"
          icon={CarFront}
          title="Offer a Ride"
          desc="Share your drive, split the cost."
          cta="Post your trip"
          accent
        />
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-8 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-10 min-w-0">
          {/* Next commute */}
          <section aria-label="Next commute">
            <SectionHeading>Next commute</SectionHeading>
            {loading ? (
              <SkeletonCard />
            ) : nextRide ? (
              <NextCommuteCard ride={nextRide} onOpen={() => navigate(`/rides/${nextRide.id}`)} />
            ) : (
              <EmptyCard
                icon={RouteIcon}
                title="Nothing scheduled yet"
                body="Search for a ride or offer one — your next trip will show up here."
                action={
                  <button
                    onClick={() => navigate('/search')}
                    className="mt-4 px-4 py-2 rounded-full bg-[var(--nc-900)] text-[var(--nc-0)] text-sm font-medium hover:bg-[var(--nc-800)] transition-colors cursor-pointer"
                  >
                    Search routes
                  </button>
                }
              />
            )}
          </section>

          {/* Active rides */}
          {activeRides.length > 0 && (
            <section aria-label="Active rides">
              <SectionHeading>
                Active rides
                <span className="size-1.5 rounded-full bg-[var(--nc-accent)] animate-pulse ml-2 inline-block" aria-hidden="true" />
              </SectionHeading>
              <ul className="space-y-3">
                {activeRides.map((ride) => (
                  <li
                    key={`${ride.role}-${ride.id}`}
                    className="group flex items-center gap-4 p-4 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] hover:border-[var(--nc-400)] transition-colors"
                  >
                    <button onClick={() => navigate(`/rides/${ride.id}`)} className="flex-1 min-w-0 text-left cursor-pointer">
                      <p className="text-sm font-medium text-[var(--nc-800)] truncate">
                        {ride.from_city} → {ride.to_city}
                        <span className={cn(
                          'ml-2 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full',
                          ride.status === 'in_progress'
                            ? 'bg-[var(--nc-accent-dim)] text-[var(--nc-accent)]'
                            : 'bg-[var(--nc-300)] text-[var(--nc-600)]'
                        )}>
                          {ride.status.replace('_', ' ')}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--nc-500)] mt-0.5">
                        {formatRideDateTime(ride.departure_time)} · as {ride.role}
                      </p>
                    </button>
                    <Link
                      to={`/chat/${ride.id}`}
                      className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--nc-900)] text-[var(--nc-0)] text-xs font-semibold hover:bg-[var(--nc-accent)] transition-colors"
                    >
                      <MessageCircle size={13} />
                      Chat
                    </Link>
                    {ride.status === 'in_progress' && (
                      <Link
                        to={`/track/${ride.id}`}
                        aria-label="Track live"
                        className="shrink-0 size-9 rounded-full border border-[var(--nc-400)] text-[var(--nc-600)] hover:border-[var(--nc-accent)] hover:text-[var(--nc-accent)] transition-colors flex items-center justify-center"
                      >
                        <Navigation size={14} />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Quick links */}
          <section className="grid grid-cols-2 gap-4" aria-label="Quick links">
            <QuickLink to="/my-rides" label="My Rides" />
            <QuickLink to="/profile" label="Profile" />
          </section>
        </div>

        {/* Sidebar stats — real user fields only */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="p-5 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)]">
            <h3 className="text-[var(--nc-800)] font-semibold">Your record</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat icon={CheckCircle2} value={user?.completed_rides ?? 0} label="Completed" />
              <Stat icon={CalendarX2} value={user?.cancelled_rides ?? 0} label="Cancelled" />
              <Stat
                icon={Star}
                value={user?.total_ratings ? Number(user.avg_rating).toFixed(1) : '—'}
                label="Rating"
              />
            </div>
          </div>

          <div className="p-5 rounded-[14px] bg-[var(--nc-100)] border border-[var(--nc-300)]">
            <h4 className="text-sm font-semibold text-[var(--nc-800)]">Driving somewhere?</h4>
            <p className="mt-1.5 text-xs text-[var(--nc-500)] leading-relaxed">
              Post your trip before you leave — passengers heading your way will request a seat and
              share the fuel cost.
            </p>
            <Link to="/offer-ride" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--nc-accent)] hover:underline">
              Offer a ride <ArrowUpRight size={12} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ActionCard({ to, icon: Icon, title, desc, cta, accent }) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative overflow-hidden p-6 rounded-[16px] border transition-all duration-300 hover:-translate-y-0.5',
        accent
          ? 'bg-[var(--nc-900)] border-transparent hover:bg-[var(--nc-800)]'
          : 'bg-[var(--nc-200)] border-[var(--nc-300)] hover:border-[var(--nc-400)]'
      )}
    >
      <div
        className={cn(
          'size-11 rounded-[12px] flex items-center justify-center mb-4',
          accent ? 'bg-[var(--nc-0)]/10' : 'bg-[var(--nc-300)]'
        )}
      >
        <Icon size={20} className={accent ? 'text-[var(--nc-accent)]' : 'text-[var(--nc-600)]'} />
      </div>
      <h3 className={cn('font-semibold text-lg', accent ? 'text-[var(--nc-0)]' : 'text-[var(--nc-900)]')}>
        {title}
      </h3>
      <p className={cn('mt-1 text-sm', accent ? 'text-[var(--nc-0)]/70' : 'text-[var(--nc-500)]')}>{desc}</p>
      <span
        className={cn(
          'mt-4 inline-flex items-center gap-1.5 text-sm font-semibold',
          accent ? 'text-[var(--nc-accent)]' : 'text-[var(--nc-800)]'
        )}
      >
        {cta}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

function SectionHeading({ children }) {
  return (
    <h2 className="flex items-center text-lg font-bold tracking-tight text-[var(--nc-900)] mb-4">
      {children}
    </h2>
  )
}

function NextCommuteCard({ ride, onOpen }) {
  return (
    <div
      className="p-5 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] cursor-pointer hover:border-[var(--nc-400)] transition-colors group"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-[var(--nc-500)]">{ride.role === 'Driver' ? 'You are driving' : `With ${ride.driver_name || 'driver'}`}</span>
        {ride.status === 'in_progress' && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--nc-accent)]">
            <span className="size-1.5 rounded-full bg-[var(--nc-accent)] animate-pulse" />
            LIVE NOW
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <span className="size-2.5 rounded-full bg-[var(--nc-accent)] shrink-0" aria-hidden="true" />
        <span className="text-base font-semibold text-[var(--nc-900)] truncate">{ride.from_city}</span>
        <span className="flex-1 h-px bg-[var(--nc-400)]" aria-hidden="true" />
        <ArrowRight size={14} className="text-[var(--nc-500)] shrink-0" aria-hidden="true" />
        <span className="flex-1 h-px bg-[var(--nc-400)]" aria-hidden="true" />
        <span className="text-base font-semibold text-[var(--nc-900)] truncate">{ride.to_city}</span>
        <span className="size-2.5 rounded-full bg-[var(--nc-500)] shrink-0" aria-hidden="true" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-[var(--nc-500)] tabular-nums">{formatRideDateTime(ride.departure_time)}</p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--nc-accent)]">
          View ride
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  )
}

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between p-4 rounded-[14px] border border-dashed border-[var(--nc-400)] text-[var(--nc-500)] hover:text-[var(--nc-900)] hover:border-[var(--nc-accent)] transition-colors text-sm font-medium"
    >
      {label}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="text-center">
      <Icon size={16} className="mx-auto text-[var(--nc-accent)] mb-1.5" />
      <p className="text-xl font-bold text-[var(--nc-900)] tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-[var(--nc-500)] mt-0.5">{label}</p>
    </div>
  )
}

function EmptyCard({ icon: Icon, title, body, action }) {
  return (
    <div className="p-8 rounded-[14px] border border-dashed border-[var(--nc-400)] text-center">
      <Icon size={24} className="mx-auto text-[var(--nc-500)]" />
      <h3 className="mt-3 text-sm font-semibold text-[var(--nc-800)]">{title}</h3>
      <p className="mt-1 text-xs text-[var(--nc-500)] max-w-xs mx-auto leading-relaxed">{body}</p>
      {action}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="p-5 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] animate-pulse" aria-busy="true">
      <div className="h-3 w-28 rounded bg-[var(--nc-300)]" />
      <div className="mt-4 h-5 w-3/4 rounded bg-[var(--nc-300)]" />
      <div className="mt-3 h-3 w-40 rounded bg-[var(--nc-300)]" />
    </div>
  )
}
