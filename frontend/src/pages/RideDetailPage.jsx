import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsapSetup'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useRideStatus } from '../hooks/useRideStatus'
import RequestButton from '../components/bookings/RequestButton'
import RequestList from '../components/bookings/RequestList'
import LiveTracker from '../components/map/LiveTracker'
import RouteMap from '../components/maps/RouteMap'
import { formatCurrency, formatRideTime, formatVehicleName, getDriverName } from '../lib/rideDisplay'

const STEP_ORDER = ['open', 'in_progress', 'completed']

const STEP_CONFIG = {
  open: { icon: 'event_available', label: 'Ride Scheduled' },
  in_progress: { icon: 'electric_car', label: 'Ride in Progress' },
  completed: { icon: 'flag', label: 'Completed' },
}

const getCurrentStep = (status) => {
  const idx = STEP_ORDER.indexOf(status)
  return idx >= 0 ? idx : -1
}

export default function RideDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ride, setRide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [requests, setRequests] = useState([])
  const pageRef = useRef(null)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const isDriver = ride?.owner_id === user?.id

  const fetchData = async () => {
    const data = await api.get(`/api/rides/${id}`)
    setRide(data)
    setLoading(false)
  }

  const fetchRequests = async () => {
    try {
      const data = await api.get(`/api/requests/ride/${id}`)
      setRequests(data || [])
    } catch {
      // silent - not the owner, or ride not found
    }
  }

  const { startRide, completeRide, cancelRide, updating } = useRideStatus(ride, fetchData)

  useEffect(() => {
    fetchData()
  }, [id])

  useEffect(() => {
    if (!isDriver) return
    fetchRequests()
    const interval = setInterval(fetchRequests, 5000)
    return () => clearInterval(interval)
  }, [isDriver, id])

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from('.ride-detail-page > .ride-detail-header', { autoAlpha: 0, y: 20, duration: 0.4, ease: 'power2.out' })
    gsap.from('.ride-detail-left > *', { autoAlpha: 0, y: 20, duration: 0.4, ease: 'power2.out', stagger: 0.1 })
    gsap.from('.ride-detail-right > *', { autoAlpha: 0, y: 20, duration: 0.4, ease: 'power2.out', stagger: 0.1 })
  }, { scope: pageRef, dependencies: [ride] })

  const handleCancel = async () => {
    if (!ride.booking_id) return
    if (!window.confirm('Are you sure you want to cancel this request?')) return
    setCancelling(true)
    try {
      await api.patch(`/api/requests/${ride.booking_id}?status=cancelled`)
      await fetchData()
    } catch (err) {
      toast.error(err.message)
    }
    setCancelling(false)
  }

  const currentStep = getCurrentStep(ride?.status)
  const canStart = isDriver && ride?.status === 'open'
  const canComplete = isDriver && ride?.status === 'in_progress'

  if (loading) return (
    <div className="loading">
      <div className="spinner spinner-lg" />
      <span>Loading ride details...</span>
    </div>
  )

  if (!ride) return (
    <div className="empty-state">
      <h3>Ride not found</h3>
    </div>
  )

  return (
    <div
      className="ride-detail-page"
      ref={pageRef}
    >
      {/* Header */}
      <header className="ride-detail-header">
        <div>
          <nav className="ride-breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/my-rides')}>My Rides</button>
            <span className="material-symbols-outlined breadcrumb-chevron">chevron_right</span>
            <span className="breadcrumb-current">#CR-{ride.id}-HYD</span>
          </nav>
          <h1 className="ride-detail-title">{ride.from_city} to {ride.to_city}</h1>
        </div>
        <div className="ride-header-actions">
          <span className="live-badge">
            <span className="live-badge-dot" />
            Live Tracking
          </span>
          <button className="share-btn">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="ride-detail-grid">
        {/* Left Column: Map + Timeline */}
        <div className="ride-detail-left">
          {/* Map Section */}
          <div className="ride-map-section">
            <RouteMap
              from={{ lat: ride.from_lat, lng: ride.from_lng }}
              to={{ lat: ride.to_lat, lng: ride.to_lng }}
              height={300}
            />
            <div className="ride-map-overlay-panel glass-panel">
              <div className="map-overlay-item">
                <span className="map-overlay-label">Estimated Arrival</span>
                <span className="map-overlay-value">
                  {ride.departure_time
                    ? new Date(ride.departure_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : '--'}
                </span>
              </div>
              <div className="map-overlay-divider" />
              <div className="map-overlay-item">
                <span className="map-overlay-label">Distance</span>
                <span className="map-overlay-value">{ride.distance_km || '--'} km</span>
              </div>
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="journey-timeline">
            <h3 className="journey-timeline-title">Journey Timeline</h3>
            <div className="timeline-steps">
              {STEP_ORDER.map((step, idx) => {
                const config = STEP_CONFIG[step]
                const isCompleted = currentStep > idx
                const isActive = currentStep === idx
                const isFuture = currentStep < idx

                return (
                  <div
                    key={step}
                    className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isFuture ? 'future' : ''}`}
                  >
                    <div className={`timeline-step-icon ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                      {isCompleted ? (
                        <span className="material-symbols-outlined">check</span>
                      ) : (
                        <span className="material-symbols-outlined">{config.icon}</span>
                      )}
                    </div>
                    <div className="timeline-step-info">
                      <span className="timeline-step-label">{config.label}</span>
                    <span className="timeline-step-time">
                      {isActive ? 'Current stage' : isCompleted ? 'Done' : 'Upcoming'}
                    </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Driver, Route, Actions */}
        <aside className="ride-detail-right">
          {/* Driver & Vehicle */}
          <div className="detail-card">
            <div className="driver-header">
              <div className="driver-avatar-wrap">
                <div className="driver-avatar">
                  {getDriverName(ride).charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="driver-info">
                <h2 className="driver-name">{getDriverName(ride)}</h2>
                <div className="driver-rating-row">
                  <span className="material-symbols-outlined driver-rating-icon">star</span>
                  <span className="driver-rating-value">{ride.driver_avg_rating != null ? Number(ride.driver_avg_rating).toFixed(1) : 'No ratings yet'}</span>
                </div>
              </div>
            </div>

            <div className="driver-vehicle-card">
              <span className="material-symbols-outlined driver-vehicle-icon">directions_car</span>
              <div>
                <p className="driver-vehicle-name">{formatVehicleName(ride)}</p>
                {ride.vehicle_plate && <p className="driver-vehicle-plate">{ride.vehicle_plate}</p>}
              </div>
            </div>

            <div className="driver-actions">
              <button
                className="driver-chat-btn"
                onClick={() => navigate(`/chat/${ride.id}`)}
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                {isDriver ? 'Chat with Passengers' : 'Chat with Driver'}
              </button>
            </div>

            {!isDriver && (
              <div style={{ marginTop: 12 }}>
                <RequestButton ride={ride} onUpdate={fetchData} />
              </div>
            )}

            {canStart && (
              <button
                className="btn-success"
                onClick={startRide}
                disabled={updating}
                style={{ marginTop: 12, width: '100%' }}
              >
                {updating ? 'Starting...' : 'Start Ride'}
              </button>
            )}

            {canComplete && (
              <button
                className="btn-success"
                onClick={completeRide}
                disabled={updating}
                style={{ marginTop: 12, width: '100%' }}
              >
                {updating ? 'Completing...' : 'Complete Ride'}
              </button>
            )}
          </div>

          {/* Route Details */}
          <div className="detail-card">
            <h3 className="detail-card-title">Route Details</h3>
            <div className="route-detail-lines">
              <div className="route-detail-point">
                <div className="route-detail-dot route-dot-pickup" />
                <div>
                  <span className="route-point-label">Pickup Location</span>
                  <span className="route-point-address">{ride.from_city}</span>
                </div>
              </div>
              <div className="route-detail-point">
                <div className="route-detail-dot route-dot-dropoff" />
                <div>
                  <span className="route-point-label">Drop-off Location</span>
                  <span className="route-point-address">{ride.to_city}</span>
                </div>
              </div>
            </div>
            <div className="route-fare-row">
              <div>
                <span className="route-fare-label">Estimated Fare</span>
                <span className="route-fare-value">{formatCurrency(ride.final_cost ?? ride.price_per_seat)}</span>
              </div>
              <span className="route-corp-badge">{formatRideTime(ride.departure_time)}</span>
            </div>
          </div>

          {/* Live Tracking */}
          {ride.status === 'in_progress' && (
            <div className="detail-card">
              <h3 className="detail-card-title">Live Tracking</h3>
              <LiveTracker ride={ride} />
            </div>
          )}

          {/* Passenger Requests (driver only) */}
          {isDriver && (
            <div className="detail-card">
              <h3 className="detail-card-title">Passenger Requests</h3>
              <RequestList
                requests={requests}
                ride={ride}
                onUpdate={() => { fetchData(); fetchRequests() }}
              />
            </div>
          )}

          {/* Cancel Button */}
          {!isDriver && ride.booking_id && (
            <button
              className="cancel-request-btn"
              onClick={handleCancel}
              disabled={cancelling}
            >
              <span className="material-symbols-outlined">cancel</span>
              {cancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          )}

          {isDriver && (ride.status === 'open' || ride.status === 'in_progress') && (
            <button
              className="cancel-request-btn"
              onClick={cancelRide}
              disabled={updating}
            >
              <span className="material-symbols-outlined">cancel</span>
              {updating ? 'Cancelling...' : 'Cancel Ride'}
            </button>
          )}

          {/* Safety Section */}
          <section className="safety-section">
            <h3 className="safety-section-title">Ride Experience & Safety</h3>
            <div className="safety-grid">
              <div className="safety-card">
                <span className="material-symbols-outlined safety-card-icon">gpp_good</span>
                <h4 className="safety-card-title">Safety Shield</h4>
                <p className="safety-card-desc">Your ride is protected with real-time GPS monitoring and SOS support.</p>
              </div>
              <div className="safety-card">
                <span className="material-symbols-outlined safety-card-icon">air</span>
                <h4 className="safety-card-title">Climate Preferences</h4>
                <p className="safety-card-desc">Pre-set to 22&deg;C. Air purifier active for your comfort.</p>
              </div>
              <div className="safety-card">
                <span className="material-symbols-outlined safety-card-icon">support_agent</span>
                <h4 className="safety-card-title">Concierge Support</h4>
                <p className="safety-card-desc">24/7 priority support available for any route adjustments.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
