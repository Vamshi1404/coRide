import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatRideDateTime } from '@/lib/rideDisplay'
import { ScrollReveal, CountUp } from '@/components/ui/ScrollReveal'
import { ParallaxImage } from '@/components/ui/MediaComponents'
import {
  Search, CarFront, ArrowRight, ArrowUpRight, MessageCircle,
  Navigation, Star, CheckCircle2, CalendarX2, Route as RouteIcon,
  TrendingUp, Leaf, MapPin,
} from 'lucide-react'

const DASH_IMAGES = {
  hero: 'https://commons.wikimedia.org/wiki/Special:FilePath/CHARMINAR,_Hyderabad_01.jpg?width=800',
  offer: 'https://images.pexels.com/photos/12354645/pexels-photo-12354645.jpeg?w=800&fit=crop&auto=compress',
  tip: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hussain_sagar_sunset.jpg?width=800',
  golconda: 'https://commons.wikimedia.org/wiki/Special:FilePath/Golconda_Fort,_Hyderabad.jpg?width=800',
  birla: 'https://commons.wikimedia.org/wiki/Special:FilePath/Birla_Mandir_in_Hyderabad,_2015.JPG?width=800',
  buddha: 'https://commons.wikimedia.org/wiki/Special:FilePath/Buddha_statue_11102016.jpg?width=800',
}

/* Verified: dusk highway traffic loop (Pexels, 4.6 MB SD variant) */
const TRAFFIC_VIDEO = 'https://videos.pexels.com/video-files/2103099/2103099-sd_640_360_30fps.mp4'

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
    <div className="page">
      {/* Header */}
      <motion.header
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="page-head"
        style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}
      >
        <div>
          <h1 className="page-title">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="page-sub">Ready for your next commute?</p>
        </div>
        <p className="dash-date">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </motion.header>

      {/* Stats row */}
      <ScrollReveal animation="reveal-up" className="dash-stats-row">
        <div className="dash-stat-card">
          <span className="dash-stat-card__icon" style={{ background: 'var(--accent-tint)', color: 'var(--accent-text)' }}>
            <CheckCircle2 size={18} />
          </span>
          <div>
            <p className="dash-stat-card__value">
              <CountUp target={user?.completed_rides ?? 0} />
            </p>
            <p className="dash-stat-card__label">Completed</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__icon" style={{ background: 'var(--status-open-bg)', color: 'var(--status-open)' }}>
            <Star size={18} />
          </span>
          <div>
            <p className="dash-stat-card__value">
              {user?.total_ratings ? Number(user.avg_rating).toFixed(1) : '—'}
            </p>
            <p className="dash-stat-card__label">Rating</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__icon" style={{ background: 'var(--status-progress-bg)', color: 'var(--status-progress)' }}>
            <TrendingUp size={18} />
          </span>
          <div>
            <p className="dash-stat-card__value">
              <CountUp target={activeRides.length} />
            </p>
            <p className="dash-stat-card__label">Active rides</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-card__icon" style={{ background: 'var(--p-green-tint)', color: 'var(--p-green-500)' }}>
            <Leaf size={18} />
          </span>
          <div>
            <p className="dash-stat-card__value">
              <CountUp target={user?.completed_rides ? Math.round(user.completed_rides * 2.3) : 0} suffix=" kg" />
            </p>
            <p className="dash-stat-card__label">CO₂ saved</p>
          </div>
        </div>
      </ScrollReveal>

      {/* Bento actions */}
      <div className="dash-actions">
        <ScrollReveal animation="reveal-up" delay={0}>
          <Link to="/search" className="action-card">
            <span className="action-card__icon"><Search size={20} aria-hidden="true" /></span>
            <h2 className="action-card__title">Find a Ride</h2>
            <p className="action-card__desc">Join a carpool heading your way.</p>
            <span className="action-card__cta">Explore routes <ArrowRight size={14} aria-hidden="true" /></span>
          </Link>
        </ScrollReveal>
        <ScrollReveal animation="reveal-up" delay={100}>
          <Link to="/offer-ride" className="action-card action-card--accent">
            <span className="action-card__icon"><CarFront size={20} aria-hidden="true" /></span>
            <h2 className="action-card__title">Offer a Ride</h2>
            <p className="action-card__desc">Share your drive, split the cost.</p>
            <span className="action-card__cta">Post your trip <ArrowRight size={14} aria-hidden="true" /></span>
          </Link>
        </ScrollReveal>
      </div>

      <div className="dash-cols" style={{ marginTop: 'var(--p-space-3xl)' }}>
        <div className="dash-sections">
          {/* Next commute */}
          <ScrollReveal animation="reveal-up" delay={200}>
            <section aria-label="Next commute">
              <h2 className="section-head">Next commute</h2>
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
                    <div className="state__actions">
                      <button type="button" onClick={() => navigate('/search')} className="btn btn--primary btn--md">
                        Search routes
                      </button>
                    </div>
                  }
                />
              )}
            </section>
          </ScrollReveal>

          {/* Active rides */}
          {activeRides.length > 0 && (
            <ScrollReveal animation="reveal-up" delay={300}>
              <section aria-label="Active rides">
                <h2 className="section-head" style={{ color: 'var(--text-strong)', fontSize: 'var(--p-text-lg)', letterSpacing: 'var(--p-tracking-tight)', textTransform: 'none' }}>
                  Active rides
                  <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-solid)', display: 'inline-block', animation: 'livePulse 1.5s ease-in-out infinite', marginLeft: 8 }} />
                </h2>
                <ul className="row-list" style={{ listStyle: 'none', padding: 0 }}>
                  {activeRides.map((ride) => (
                    <li key={`${ride.role}-${ride.id}`}>
                      <div className="row-item">
                        <button
                          type="button"
                          onClick={() => navigate(`/rides/${ride.id}`)}
                          className="row-item__body row-item--clickable"
                          style={{ border: 'none', background: 'none', padding: 0, borderRadius: 0 }}
                        >
                          <p className="row-item__title">
                            {ride.from_city} → {ride.to_city}
                            <span className={`badge ${ride.status === 'in_progress' ? 'badge--live' : 'badge--neutral'}`} style={{ marginLeft: 8 }}>
                              {ride.status.replace('_', ' ')}
                            </span>
                          </p>
                          <p className="row-item__sub">
                            {formatRideDateTime(ride.departure_time)} · as {ride.role}
                          </p>
                        </button>
                        <div className="row-item__actions">
                          <Link to={`/chat/${ride.id}`} className="btn btn--primary btn--sm">
                            <MessageCircle size={13} aria-hidden="true" />
                            Chat
                          </Link>
                          {ride.status === 'in_progress' && (
                            <Link to={`/track/${ride.id}`} className="icon-btn" aria-label="Track live">
                              <Navigation size={14} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </ScrollReveal>
          )}

          {/* Quick links */}
          <nav className="quick-links" aria-label="Quick links">
            <QuickLink to="/my-rides" label="My Rides" />
            <QuickLink to="/profile" label="Profile" />
          </nav>
        </div>

        {/* Sidebar */}
        <aside className="dash-aside stack stack--gap-md">
          {/* Driving tip with image */}
          <ScrollReideTip />

          {/* Popular route suggestion */}
          <ScrollReveal animation="reveal-up" delay={400}>
            <div className="dash-route-suggestion">
              <div className="dash-route-suggestion__img">
                <img src={DASH_IMAGES.tip} alt="" aria-hidden="true" loading="lazy" />
              </div>
              <div className="dash-route-suggestion__body">
                <MapPin size={14} style={{ color: 'var(--accent-text)' }} />
                <p className="dash-route-suggestion__title">Gachibowli → HITEC City</p>
                <p className="dash-route-suggestion__sub">7.2 km · Most popular route</p>
                <Link to="/search?from=Gachibowli&to=HITEC City" className="link-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--p-text-xs)', marginTop: 'var(--p-space-sm)' }}>
                  Search rides <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </aside>
      </div>
    </div>
  )
}

function ScrollReideTip() {
  return (
    <ScrollReveal animation="reveal-up" delay={350}>
      <div className="dash-tip-card">
        <div className="dash-tip-card__img" style={{ overflow: 'hidden', borderRadius: 'var(--radius-card)' }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={DASH_IMAGES.offer}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src={TRAFFIC_VIDEO} type="video/mp4" />
          </video>
        </div>
        <div className="dash-tip-card__body">
          <h4 className="dash-tip-card__title">Driving somewhere?</h4>
          <p className="dash-tip-card__body">
            Post your trip before you leave — passengers heading your way will request a seat and
            share the fuel cost.
          </p>
          <Link to="/offer-ride" className="link-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--p-text-xs)', marginTop: 'var(--p-space-sm)' }}>
            Offer a ride <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </ScrollReveal>
  )
}

function ActionCard({ to, icon: Icon, title, desc, cta, accent }) {
  return (
    <Link to={to} className={`action-card${accent ? ' action-card--accent' : ''}`}>
      <span className="action-card__icon"><Icon size={20} aria-hidden="true" /></span>
      <h2 className="action-card__title">{title}</h2>
      <p className="action-card__desc">{desc}</p>
      <span className="action-card__cta">
        {cta}
        <ArrowRight size={14} aria-hidden="true" />
      </span>
    </Link>
  )
}

function NextCommuteCard({ ride, onOpen }) {
  return (
    <div
      className="card card--interactive next-commute"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      <div className="next-commute__top">
        <span>{ride.role === 'Driver' ? 'You are driving' : `With ${ride.driver_name || 'driver'}`}</span>
        {ride.status === 'in_progress' && (
          <span className="live-now"><span className="live-now__dot" aria-hidden="true" />LIVE NOW</span>
        )}
      </div>
      <div className="routeline next-commute__route">
        <span className="routeline__node routeline__node--origin" aria-hidden="true" />
        <span className="routeline__label">{ride.from_city}</span>
        <span className="routeline__connector" aria-hidden="true"><ArrowRight size={11} /></span>
        <span className="routeline__label" style={{ textAlign: 'right' }}>{ride.to_city}</span>
        <span className="routeline__node routeline__node--dest" aria-hidden="true" />
      </div>
      <div className="next-commute__foot">
        <span className="tabular">{formatRideDateTime(ride.departure_time)}</span>
        <span className="next-commute__open">
          View ride
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

function QuickLink({ to, label }) {
  return (
    <Link to={to} className="quick-link">
      {label}
      <ArrowRight size={15} aria-hidden="true" />
    </Link>
  )
}

function EmptyCard({ icon: Icon, title, body, action }) {
  return (
    <div className="state state--compact card--dashed card" style={{ background: 'transparent' }}>
      <span className="state__icon-wrap"><Icon size={22} aria-hidden="true" /></span>
      <h2 className="state__title">{title}</h2>
      <p className="state__body">{body}</p>
      {action}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="skel-card" aria-busy="true">
      <div className="skel skel--line sm" style={{ width: 112 }} />
      <div className="skel skel--line lg" style={{ width: '75%' }} />
      <div className="skel skel--line" style={{ width: 160 }} />
    </div>
  )
}
