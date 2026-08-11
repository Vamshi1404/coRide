import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsapSetup'
import { api } from '../lib/api'
import { formatRideDateTime, formatVehicleName, getDriverName, getInitials, getStatusLabel } from '../lib/rideDisplay'
import { useAuth } from '../contexts/AuthContext'

export default function MyRides() {
  const { user } = useAuth()
  const [offered, setOffered] = useState([])
  const [joined, setJoined] = useState([])
  const [tab, setTab] = useState('upcoming')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const pageRef = useRef(null)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    Promise.all([
      api.get('/api/rides/my').then((d) => setOffered((d || []).map((ride) => ({ ...ride, user_role: 'Driver' })))).catch(() => {}),
      api.get('/api/rides/joined').then((d) => setJoined((d || []).map((ride) => ({ ...ride, user_role: 'Passenger' })))).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [user])

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from('.rides-header', { autoAlpha: 0, y: -10, duration: 0.3, ease: 'power2.out' })
    gsap.from('.rides-upcoming', { autoAlpha: 0, y: 20, duration: 0.25, ease: 'power2.out' })
    gsap.from('.rides-upcoming .rides-card', { autoAlpha: 0, y: 20, duration: 0.4, ease: 'power2.out', stagger: 0.1 })
    gsap.from('.rides-history', { autoAlpha: 0, y: 20, duration: 0.25, ease: 'power2.out' })
    gsap.from('.rides-history-table tbody tr', { autoAlpha: 0, x: -10, duration: 0.25, ease: 'power2.out', stagger: 0.05 })
  }, { scope: pageRef, dependencies: [tab] })

  const allUpcoming = [...offered, ...joined].filter(
    (r) => r.status !== 'completed' && r.status !== 'cancelled'
  )

  const history = [...offered, ...joined].filter(
    (r) => r.status === 'completed'
  )

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner spinner-lg" />
        <span>Loading rides...</span>
      </div>
    )
  }

  return (
    <div className="rides-page" ref={pageRef}>
      <div className="rides-header">
        <div>
          <h1>My Rides</h1>
          <p className="rides-subtitle">Manage your scheduled commutes and view travel history.</p>
        </div>
      </div>

      <div className="rides-tabs">
        <button
          className={`rides-tab ${tab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`rides-tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </div>

        {tab === 'upcoming' ? (
          <div
            key="upcoming"
            className="rides-upcoming"
          >
            {allUpcoming.length === 0 ? (
              <div className="empty-state">
                <h3>No upcoming rides</h3>
                <p>You don&apos;t have any scheduled rides yet. Find a ride or offer one to get started!</p>
              </div>
            ) : (
              allUpcoming.map((ride, i) => (
                <div
                  key={ride.id || i}
                  className="rides-card"
                >
                  <div className="rides-card-inner">
                    <div className="rides-route-col">
                      <div className="rides-badge-row">
                        <span className={`rides-badge ${ride.booking_status === 'accepted' ? 'confirmed' : 'pending'}`}>
                          {getStatusLabel(ride.status, ride.booking_status)}
                        </span>
                        <span className="rides-date">
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
                          {formatRideDateTime(ride.departure_time)}
                        </span>
                      </div>

                      <div className="rides-route-line">
                        <div className="rides-route-item">
                          <div className="rides-route-dot pickup"></div>
                          <div>
                            <p className="rides-location-name">{ride.from_city}</p>
                            <p className="rides-location-sub">Pickup</p>
                          </div>
                        </div>
                        <div className="rides-route-item">
                          <div className="rides-route-dot dropoff"></div>
                          <div>
                            <p className="rides-location-name">{ride.to_city}</p>
                            <p className="rides-location-sub">Drop-off</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rides-details-col">
                      <div className="rides-driver-section">
                        <div className="rides-driver">
                          <div className="rides-driver-avatar-wrap">
                            <div className="rides-driver-avatar">
                              {getInitials(getDriverName(ride))}
                            </div>
                            {(ride.booking_status === 'accepted' || ride.status === 'in_progress') && <div className="rides-avatar-pulse"></div>}
                          </div>
                          <div>
                            <span className="rides-role-label">{ride.user_role === 'Driver' ? 'You are driving' : 'Your driver'}</span>
                            <p className="rides-driver-name">{getDriverName(ride)}</p>

                          </div>
                        </div>
                        <div className="rides-action-block">
                          <div className="rides-vehicle-info">
                            <span className="rides-vehicle-label">Vehicle</span>
                            <p className="rides-vehicle-name">{formatVehicleName(ride)}</p>
                            {ride.vehicle_plate && <p className="rides-vehicle-plate">{ride.vehicle_plate}</p>}
                          </div>
                          <button
                            className="rides-action-btn"
                            onClick={() => navigate(`/rides/${ride.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div
            key="history"
            className="rides-history"
          >
            {history.length === 0 ? (
              <div className="empty-state">
                <h3>No ride history</h3>
                <p>Your completed rides will appear here.</p>
              </div>
            ) : (
              <div className="rides-history-table-wrap">
                <table className="rides-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Route</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((ride, i) => (
                      <tr
                        key={ride.id || i}
                      >
                        <td>
                          <p className="rides-td-primary">
                            {formatRideDateTime(ride.departure_time)}
                          </p>
                          <p className="rides-td-secondary">
                            {getStatusLabel(ride.status, ride.booking_status)}
                          </p>
                        </td>
                        <td>
                          <div className="rides-route-pair">
                            <span>{ride.from_city}</span>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>east</span>
                            <span>{ride.to_city}</span>
                          </div>
                        </td>
                        <td>
                          <span className="rides-role-badge">
                            {ride.user_role || 'Passenger'}
                          </span>
                        </td>
                        <td>
                          <span className="rides-status-completed">Completed</span>
                        </td>
                        <td className="rides-td-details">
                          <button
                            className="rides-details-link"
                            onClick={() => navigate(`/rides/${ride.id}`)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
    </div>
  )
}
