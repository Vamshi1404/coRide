import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { api } from '@/lib/api'
import {
  formatRideDateTime, formatVehicleName, getDriverName, getInitials,
} from '@/lib/rideDisplay'
import {
  CalendarDays, ArrowRight, SearchX, History, ChevronRight,
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
    <div className="page page--narrow">
      <header className="page-head">
        <h1 className="page-title">My rides</h1>
        <p className="page-sub">Your scheduled commutes and travel history.</p>
      </header>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Ride lists"
        className="tabs rides-tabs tabs--block"
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
            className={`tab${tab === t.id ? ' is-active' : ''}`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="rides-tab-pill"
                className="tab__pill"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="results-stack" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="skel-card" aria-hidden="true">
              <div className="skel skel--line sm" style={{ width: 140 }} />
              <div className="skel-row">
                <span className="skel skel--circle" style={{ width: 15, height: 15 }} />
                <div className="skel skel--line" style={{ flex: 1 }} />
              </div>
              <div className="skel skel--line" style={{ width: '60%' }} />
              <div className="skel-row">
                <span className="skel skel--circle" style={{ width: 40, height: 40 }} />
                <div className="stack stack--gap-sm" style={{ flex: 1 }}>
                  <div className="skel skel--line" style={{ width: 110 }} />
                  <div className="skel skel--line sm" style={{ width: 150 }} />
                </div>
              </div>
            </div>
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
                  <ul className="results-stack" style={{ listStyle: 'none', padding: 0 }}>
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
                  <ul className="history-stack" style={{ listStyle: 'none', padding: 0 }}>
                    {history.map((ride) => (
                      <li key={`${ride.user_role}-${ride.id}`}>
                        <button
                          type="button"
                          onClick={() => navigate(`/rides/${ride.id}`)}
                          className="row-item row-item--clickable"
                        >
                          <div className="row-item__body">
                            <p className="row-item__title">{ride.from_city} → {ride.to_city}</p>
                            <p className="row-item__sub tabular">
                              {formatRideDateTime(ride.departure_time)} · as {ride.user_role}
                            </p>
                          </div>
                          <span className="badge badge--completed">Completed</span>
                          <ChevronRight size={16} aria-hidden="true" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
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
      className="card card--interactive ride-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      {/* Status row */}
      <div className="ride-card__status">
        <span className={`badge ${confirmed ? 'badge--neutral' : 'badge--pending'} badge--lg`}>
          {confirmed ? 'Confirmed' : 'Pending approval'}
        </span>
        {ride.status === 'in_progress' && (
          <span className="live-now"><span className="live-now__dot" aria-hidden="true" />LIVE</span>
        )}
        <span className="ride-card__when tabular">
          <CalendarDays size={12} aria-hidden="true" />
          {formatRideDateTime(ride.departure_time)}
        </span>
      </div>

      {/* Route */}
      <div className="vroute ride-card__vroute">
        <div className="vroute__point">
          <span className="vroute__mark"><span className="vroute__dot" /></span>
          <span>
            <span className="vroute__name">{ride.from_city}</span><br />
            <span className="vroute__sub">Pickup</span>
          </span>
        </div>
        <span className="vroute__stem ride-card__stem" aria-hidden="true" />
        <div className="vroute__point vroute__point--dest">
          <span className="vroute__mark"><span className="vroute__dot" /></span>
          <span>
            <span className="vroute__name">{ride.to_city}</span><br />
            <span className="vroute__sub">Drop-off</span>
          </span>
        </div>
      </div>

      {/* Driver + vehicle + CTA */}
      <div className="ride-card__foot">
        <span className="avatar avatar--md" style={{ position: 'relative', flexShrink: 0 }}>
          {getInitials(getDriverName(ride))}
          {confirmed && <span className="avatar__dot" aria-hidden="true" />}
        </span>
        <div className="ride-card__who">
          <p className="ride-card__who-label">{isDriving ? 'You are driving' : 'Your driver'}</p>
          <p className="ride-card__who-name">{isDriving ? 'Your vehicle' : getDriverName(ride)}</p>
          <p className="ride-card__vehicle">
            {formatVehicleName(ride)}
            {ride.vehicle_plate && <span className="mono">· {ride.vehicle_plate}</span>}
          </p>
        </div>
        <span className="btn btn--primary btn--sm" aria-hidden="true">
          Details
          <ArrowRight size={13} />
        </span>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, body, cta }) {
  return (
    <div className="state">
      <span className="state__icon-wrap"><Icon size={22} aria-hidden="true" /></span>
      <h2 className="state__title">{title}</h2>
      <p className="state__body">{body}</p>
      {cta && (
        <div className="state__actions">
          <button type="button" onClick={() => window.location.assign(cta.to)} className="btn btn--primary btn--md">
            {cta.label}
          </button>
        </div>
      )}
    </div>
  )
}
