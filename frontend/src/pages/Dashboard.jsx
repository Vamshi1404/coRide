import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsapSetup'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { formatRideDateTime } from '../lib/rideDisplay'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeRides, setActiveRides] = useState([])
  const pageRef = useRef(null)

  const firstName = user?.name?.split(' ')[0] || 'there'

  useEffect(() => {
    Promise.all([
      api.get('/api/rides/my').catch(() => []),
      api.get('/api/rides/joined').catch(() => []),
    ]).then(([offered, joined]) => {
      const active = []
      for (const r of (joined || [])) {
        if (r.booking_status === 'accepted' || r.status === 'in_progress') {
          active.push({ ...r, chatLabel: 'Chat with Driver', rideId: r.id })
        }
      }
      for (const r of (offered || [])) {
        if (r.status === 'in_progress' || r.status === 'open') {
          active.push({ ...r, chatLabel: 'Chat with Passengers', rideId: r.id })
        }
      }
      setActiveRides(active.slice(0, 4))
    })
  }, [])

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.dash-hero, .dash-bento > *, .dash-active-rides, .dash-commute-section, .dash-quick-links, .dash-sidebar-img-card, .dash-stats', { clearProps: 'all' })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from('.dash-hero', { autoAlpha: 0, y: 24, duration: 0.5 })
        .from('.dash-bento > *', { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.12 }, '-=0.3')
        .from('.dash-active-rides, .dash-commute-section', { autoAlpha: 0, y: 24, duration: 0.5 }, '-=0.2')
        .from('.dash-quick-links', { autoAlpha: 0, y: 24, duration: 0.5 }, '-=0.2')
        .from('.dash-sidebar-img-card, .dash-stats', { autoAlpha: 0, y: 24, duration: 0.5, stagger: 0.1 }, '-=0.3')
    })

    return () => mm.revert()
  }, { scope: pageRef })

  return (
    <div className="dash-page" ref={pageRef}>
      <div className="dash-hero">
        <div className="dash-hero-bg">
          <img src="/images/driver-profile.jpg" alt="" />
          <div className="dash-hero-overlay" />
        </div>
        <div className="dash-hero-content">
          <h1 className="dash-greeting">{getGreeting()}, {firstName}</h1>
          <p className="dash-subtitle">Ready for your next commute?</p>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          <div className="dash-bento">
            <button
              className="dash-find-card"
              onClick={() => navigate('/search')}
            >
              <div className="dash-card-icon">
                <span className="material-symbols-outlined">search</span>
              </div>
              <h3 className="dash-card-title">Find a Ride</h3>
              <p className="dash-card-desc">Join an existing carpool to your destination.</p>
              <span className="dash-card-link">
                Explore Routes <span className="material-symbols-outlined">arrow_forward</span>
              </span>
              <div className="dash-card-bg-icon">
                <span className="material-symbols-outlined">commute</span>
              </div>
            </button>

            <button
              className="dash-offer-card"
              onClick={() => navigate('/offer-ride')}
            >
              <div className="dash-card-icon dash-offer-icon">
                <span className="material-symbols-outlined">directions_car</span>
              </div>
              <h3 className="dash-card-title">Offer a Ride</h3>
              <p className="dash-card-desc">Share your journey and offset your commute costs.</p>
              <span className="dash-card-link">
                Post your Trip <span className="material-symbols-outlined">arrow_forward</span>
              </span>
              <div className="dash-card-bg-icon">
                <span className="material-symbols-outlined">electric_car</span>
              </div>
            </button>
          </div>

          {activeRides.length > 0 ? (
            <section className="dash-active-rides">
              <div className="dash-commute-header">
                <h2>
                  Active Rides
                  <span className="dash-pulse-dot"></span>
                </h2>
              </div>
              <div className="dash-active-list">
                {activeRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="dash-active-item"
                  >
                    <div className="dash-active-route">
                      <span className="dash-active-cities">{ride.from_city} to {ride.to_city}</span>
                      <span className="dash-active-time">
                        {formatRideDateTime(ride.departure_time)}
                      </span>
                    </div>
                    <button
                      className="dash-chat-btn"
                      onClick={() => navigate(`/chat/${ride.id}`)}
                    >
                      <span className="material-symbols-outlined">chat_bubble</span>
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="dash-commute-section">
              <div className="dash-commute-header">
                <h2>
                  Your Next Commute
                  <span className="dash-pulse-dot"></span>
                </h2>
              </div>
              <div className="dash-commute-placeholder">
                <div className="dash-commute-placeholder-overlay">
                  <span className="material-symbols-outlined">route</span>
                  <h3>Plan your next ride</h3>
                  <p>Search for available routes or offer a ride to get started.</p>
                  <button className="dash-placeholder-btn" onClick={() => navigate('/search')}>
                    Search Routes
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="dash-quick-links">
            <button className="dash-quick-link" onClick={() => navigate('/my-rides')}>
              <span className="material-symbols-outlined">calendar_month</span>
              <span>My Rides</span>
            </button>
            <button className="dash-quick-link" onClick={() => navigate('/profile')}>
              <span className="material-symbols-outlined">person</span>
              <span>Profile</span>
            </button>
          </section>
        </div>

        <aside className="dash-sidebar">
          <div className="dash-sidebar-img-card">
            <img src="/images/corider.jpg" alt="" />
            <div className="dash-sidebar-img-overlay">
              <h4>CoRide Community</h4>
              <p>Connect with professionals on your route.</p>
            </div>
          </div>

          <div className="dash-stats">
            <h3>Quick Stats</h3>
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <span className="material-symbols-outlined">done_all</span>
                <p className="dash-stat-num">{user?.completed_rides || 0}</p>
                <p className="dash-stat-label">Rides Completed</p>
              </div>
              <div className="dash-stat-card">
                <span className="material-symbols-outlined">eco</span>
                <p className="dash-stat-num">0</p>
                <p className="dash-stat-label">CO2 Saved</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
