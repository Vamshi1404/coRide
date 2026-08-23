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
  MapPin, Navigation, Users,
} from 'lucide-react'

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'history', label: 'History' },
]

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

  const counts = { upcoming: upcoming.length, history: history.length }

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">My rides</h1>
        <p className="page-sub">Your scheduled commutes and travel history.</p>
      </header>

      {/* Segmented control */}
      <div className="rides-segment" role="tablist" aria-label="Ride lists">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rides-segment__btn${tab === t.id ? ' is-active' : ''}`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="rides-seg-pill"
                className="rides-segment__pill"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="rides-segment__label">
              {t.label}
              {!loading && <span className="rides-segment__count">{counts[t.id]}</span>}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rides-grid" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skel-card" aria-hidden="true">
              <div className="skel skel--line" style={{ width: 120 }} />
              <div className="skel-row" style={{ marginTop: 12 }}>
                <span className="skel skel--circle" style={{ width: 14, height: 14 }} />
                <div className="skel skel--line" style={{ flex: 1 }} />
              </div>
              <div className="skel skel--line" style={{ width: '55%', marginTop: 10 }} />
              <div className="skel-row" style={{ marginTop: 14 }}>
                <span className="skel skel--circle" style={{ width: 36, height: 36 }} />
                <div style={{ flex: 1 }}>
                  <div className="skel skel--line" style={{ width: 100 }} />
                  <div className="skel skel--line sm" style={{ width: 140, marginTop: 6 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {tab === 'upcoming' && (
            <motion.div
              key="upcoming"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {upcoming.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="No upcoming rides"
                  body="Find a seat on a route you need, or offer your own ride to fellow Hyderabad commuters."
                  cta={{ label: 'Find a ride', to: '/search' }}
                />
              ) : (
                <div className="rides-grid">
                  {upcoming.map((ride) => (
                    <UpcomingCard
                      key={`${ride.user_role}-${ride.id}`}
                      ride={ride}
                      onOpen={() => navigate(`/rides/${ride.id}`)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div
              key="history"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {history.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No history yet"
                  body="Completed rides will appear here with route details and ratings."
                />
              ) : (
                <div className="rides-list">
                  {history.map((ride) => (
                    <button
                      key={`${ride.user_role}-${ride.id}`}
                      type="button"
                      onClick={() => navigate(`/rides/${ride.id}`)}
                      className="ride-row"
                    >
                      <div className="ride-row__route">
                        <span className="ride-row__city">{ride.from_city}</span>
                        <ArrowRight size={12} className="ride-row__arrow" aria-hidden="true" />
                        <span className="ride-row__city">{ride.to_city}</span>
                      </div>
                      <div className="ride-row__meta">
                        <span className="ride-row__date tabular">
                          <CalendarDays size={12} aria-hidden="true" />
                          {formatRideDateTime(ride.departure_time)}
                        </span>
                        <span className="ride-row__role">{ride.user_role}</span>
                      </div>
                      <span className="badge badge--completed">Completed</span>
                      <ChevronRight size={14} className="ride-row__chevron" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

function UpcomingCard({ ride, onOpen }) {
  const isDriving = ride.user_role === 'Driver'
  const confirmed = ride.booking_status === 'accepted' || isDriving

  return (
    <div
      className="ride-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    >
      {/* Top: status + date */}
      <div className="ride-card__top">
        <span className={`badge ${confirmed ? 'badge--neutral' : 'badge--pending'}`}>
          {confirmed ? 'Confirmed' : 'Pending'}
        </span>
        {ride.status === 'in_progress' && (
          <span className="live-now"><span className="live-now__dot" aria-hidden="true" />LIVE</span>
        )}
        <span className="ride-card__date tabular">
          <CalendarDays size={12} aria-hidden="true" />
          {formatRideDateTime(ride.departure_time)}
        </span>
      </div>

      {/* Route visualization */}
      <div className="ride-card__route">
        <div className="ride-card__route-point">
          <span className="ride-card__route-dot" />
          <div>
            <span className="ride-card__route-city">{ride.from_city}</span>
            <span className="ride-card__route-label">Pickup</span>
          </div>
        </div>
        <div className="ride-card__route-line" aria-hidden="true" />
        <div className="ride-card__route-point ride-card__route-point--dest">
          <span className="ride-card__route-dot" />
          <div>
            <span className="ride-card__route-city">{ride.to_city}</span>
            <span className="ride-card__route-label">Drop-off</span>
          </div>
        </div>
      </div>

      {/* Footer: driver + vehicle + action */}
      <div className="ride-card__foot">
        <div className="ride-card__driver">
          <span className="avatar avatar--sm">
            {getInitials(getDriverName(ride))}
            {confirmed && <span className="avatar__dot" aria-hidden="true" />}
          </span>
          <div className="ride-card__driver-info">
            <span className="ride-card__driver-label">{isDriving ? 'You are driving' : getDriverName(ride)}</span>
            <span className="ride-card__vehicle">
              {formatVehicleName(ride)}
              {ride.vehicle_plate && <span className="mono"> · {ride.vehicle_plate}</span>}
            </span>
          </div>
        </div>
        <span className="ride-card__cta">
          Details <ArrowRight size={13} />
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
