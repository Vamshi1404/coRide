import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatRideDateTime } from '@/lib/rideDisplay'
import {
  Search, CarFront, ArrowRight, MessageCircle,
  Navigation, CheckCircle2, Route as RouteIcon,
  TrendingUp, Leaf, Star, MapPin,
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

  const completedRides = user?.completed_rides ?? 0
  const co2Saved = completedRides ? Math.round(completedRides * 2.3) : 0

  return (
    <div className="page">
      {/* Hero greeting */}
      <motion.div
        className="dash-hero"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="dash-hero__greeting">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="dash-hero__sub">Where are you going today?</p>
      </motion.div>

      {/* Quick actions — the primary interface */}
      <motion.div
        className="dash-quick-actions"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/search" className="dash-quick-action dash-quick-action--accent">
          <span className="dash-quick-action__icon"><Search size={22} /></span>
          <div className="dash-quick-action__body">
            <p className="dash-quick-action__title">Find a ride</p>
            <p className="dash-quick-action__desc">Search open seats across Hyderabad</p>
          </div>
          <ArrowRight size={18} className="dash-quick-action__arrow" />
        </Link>
        <Link to="/offer-ride" className="dash-quick-action">
          <span className="dash-quick-action__icon"><CarFront size={22} /></span>
          <div className="dash-quick-action__body">
            <p className="dash-quick-action__title">Offer a ride</p>
            <p className="dash-quick-action__desc">Share your drive, split the cost</p>
          </div>
          <ArrowRight size={18} className="dash-quick-action__arrow" />
        </Link>
      </motion.div>

      {/* Two-column layout: main + sidebar */}
      <div className="dash-content">
        <div className="dash-main">
          {/* Next ride */}
          <section aria-label="Next commute">
            <div className="dash-section-head">
              <h2 className="dash-section-title">Next ride</h2>
              <Link to="/my-rides" className="dash-section-link">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="skel-card" aria-busy="true">
                <div className="skel skel--line" style={{ width: 100 }} />
                <div className="skel skel--line" style={{ width: '70%', marginTop: 10 }} />
                <div className="skel skel--line" style={{ width: 140, marginTop: 8 }} />
              </div>
            ) : nextRide ? (
              <div
                className="dash-next-ride"
                onClick={() => navigate(`/rides/${nextRide.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/rides/${nextRide.id}`)}
              >
                <div className="dash-next-ride__header">
                  <span className="dash-next-ride__label">
                    {nextRide.role === 'Driver' ? 'You are driving' : `With ${nextRide.driver_name || 'driver'}`}
                  </span>
                  {nextRide.status === 'in_progress' && (
                    <span className="live-now"><span className="live-now__dot" aria-hidden="true" />LIVE</span>
                  )}
                  <span className="dash-next-ride__time tabular">
                    {formatRideDateTime(nextRide.departure_time)}
                  </span>
                </div>
                <div className="dash-next-ride__route">
                  <span className="dash-next-ride__route-dot dash-next-ride__route-dot--from" />
                  <span className="dash-next-ride__route-city">{nextRide.from_city}</span>
                </div>
                <div className="dash-next-ride__route-line" />
                <div className="dash-next-ride__route">
                  <span className="dash-next-ride__route-dot dash-next-ride__route-dot--to" />
                  <span className="dash-next-ride__route-city">{nextRide.to_city}</span>
                </div>
                <div className="dash-next-ride__foot">
                  <span className="badge badge--neutral">
                    {nextRide.status === 'in_progress' ? 'In progress' : 'Confirmed'}
                  </span>
                  <span className="ride-card__cta">
                    View ride <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="state state--compact">
                <RouteIcon size={20} style={{ color: 'var(--text-muted)' }} />
                <p className="state__title" style={{ fontSize: 'var(--fs-body)' }}>Nothing scheduled</p>
                <p className="state__body" style={{ fontSize: 'var(--fs-small)' }}>
                  Your next commute will appear here.
                </p>
              </div>
            )}
          </section>

          {/* Active rides */}
          {activeRides.length > 0 && (
            <section aria-label="Active rides" style={{ marginTop: 'var(--p-space-2xl)' }}>
              <div className="dash-section-head">
                <h2 className="dash-section-title">
                  Active rides
                  <span className="live-now__dot" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-solid)', marginLeft: 8, animation: 'livePulse 1.5s ease-in-out infinite' }} />
                </h2>
              </div>
              <div className="dash-active-list">
                {activeRides.map((ride) => (
                  <Link
                    key={`${ride.role}-${ride.id}`}
                    to={`/rides/${ride.id}`}
                    className="dash-active-item"
                  >
                    <div className="dash-active-item__route">
                      <p className="dash-active-item__cities">{ride.from_city} → {ride.to_city}</p>
                      <p className="dash-active-item__meta">
                        {formatRideDateTime(ride.departure_time)} · {ride.role}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--p-space-sm)', alignItems: 'center' }}>
                      <span className={`badge ${ride.status === 'in_progress' ? 'badge--live' : 'badge--neutral'}`}>
                        {ride.status.replace('_', ' ')}
                      </span>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="dash-sidebar">
          {/* Stats */}
          <div className="dash-sidebar-card">
            <h3 className="dash-sidebar-card__title">Your impact</h3>
            <div className="dash-sidebar-stat">
              <span className="dash-sidebar-stat__label">
                <CheckCircle2 size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                Completed
              </span>
              <span className="dash-sidebar-stat__value tabular">{completedRides}</span>
            </div>
            <div className="dash-sidebar-stat">
              <span className="dash-sidebar-stat__label">
                <Star size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                Rating
              </span>
              <span className="dash-sidebar-stat__value tabular">
                {user?.total_ratings ? Number(user.avg_rating).toFixed(1) : '—'}
              </span>
            </div>
            <div className="dash-sidebar-stat">
              <span className="dash-sidebar-stat__label">
                <TrendingUp size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                Active
              </span>
              <span className="dash-sidebar-stat__value tabular">{activeRides.length}</span>
            </div>
            <div className="dash-sidebar-stat">
              <span className="dash-sidebar-stat__label">
                <Leaf size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                CO₂ saved
              </span>
              <span className="dash-sidebar-stat__value tabular">{co2Saved} kg</span>
            </div>
          </div>

          {/* Popular route */}
          <div className="dash-sidebar-card">
            <h3 className="dash-sidebar-card__title">Popular route</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-space-sm)', marginBottom: 'var(--p-space-sm)' }}>
              <MapPin size={14} style={{ color: 'var(--accent-solid)', flexShrink: 0 }} />
              <span style={{ fontWeight: 'var(--p-weight-semibold)', color: 'var(--text-strong)', fontSize: 'var(--fs-body)' }}>
                Gachibowli → HITEC City
              </span>
            </div>
            <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)', marginBottom: 'var(--p-space-md)' }}>
              7.2 km · Most commuted corridor
            </p>
            <Link to="/search?from=Gachibowli&to=HITEC City" className="btn btn--primary btn--sm" style={{ width: '100%' }}>
              Search this route <ArrowRight size={13} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
