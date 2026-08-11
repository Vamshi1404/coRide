import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsapSetup'
import { api } from '../lib/api'
import RouteMap from '../components/maps/RouteMap'
import { formatCurrency, formatRideTime, formatVehicleName, getDriverName } from '../lib/rideDisplay'
import AddressAutocomplete from '../components/AddressAutocomplete'

const SORT_OPTIONS = [
  { value: 'earliest', label: 'Earliest Departure' },
  { value: 'price', label: 'Price: Low to High' },
]

export default function SearchRides() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ from: '', to: '', date: '' })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('earliest')
  const [allRides, setAllRides] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const pageRef = useRef(null)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    api.get('/api/rides').then((data) => {
      setAllRides(data || [])
    }).catch(() => {}).finally(() => setInitialLoading(false))
  }, [])

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from('.search-bar-card', { autoAlpha: 0, y: -12, duration: 0.35, ease: 'power2.out' })
  }, { scope: pageRef })

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from('.error-box', { autoAlpha: 0, x: -10, duration: 0.3 })
    gsap.from('.results-header', { autoAlpha: 0, duration: 0.4 })
    gsap.from('.search-initial-state', { autoAlpha: 0, y: 16, duration: 0.4, ease: 'power2.out' })
    gsap.from('.loading', { autoAlpha: 0, duration: 0.3 })
    gsap.from('.ride-cards-list .ride-card-horizontal', { autoAlpha: 0, y: 24, duration: 0.35, ease: 'power2.out', stagger: 0.06 })
  }, { scope: pageRef, dependencies: [results, loading, initialLoading] })

  const updateForm = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const search = async (fromOverride, toOverride) => {
    const fromVal = fromOverride || form.from
    const toVal = toOverride || form.to
    if (!fromVal.trim() || !toVal.trim()) return

    setLoading(true)
    setError('')

    try {
      const params = { from_city: fromVal.trim(), to_city: toVal.trim() }
      if (form.date) params.date = form.date
      const data = await api.get('/api/rides', params)
      setResults(data || [])
    } catch {
      setError('Search failed. Try again.')
    }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    search()
  }

  const handleFromSelect = (item) => {
    setForm((prev) => ({ ...prev, from: item.label }))
  }

  const handleToSelect = (item) => {
    setForm((prev) => ({ ...prev, to: item.label }))
  }

  const sortedResults = results
    ? [...results].sort((a, b) => {
        if (sortBy === 'price')
          return (a.price_per_seat || a.final_cost || 0) - (b.price_per_seat || b.final_cost || 0)
        return new Date(a.departure_time || 0) - new Date(b.departure_time || 0)
      })
    : []

  return (
    <div className="search-rides-page" ref={pageRef}>
      {/* Search Bar Card */}
      <div className="search-bar-card">
        <form onSubmit={handleSubmit}>
          <div className="search-bar-grid">
            <div className="search-bar-field">
              <div className="search-field-content">
                <span className="search-field-label">Starting Point</span>
                <AddressAutocomplete
                  value={form.from}
                  onChange={(val) => setForm((prev) => ({ ...prev, from: val }))}
                  onSelect={handleFromSelect}
                  placeholder="Enter origin"
                  icon="location_on"
                  inputClassName="search-field-input"
                />
              </div>
            </div>
            <div className="search-bar-divider" />
            <div className="search-bar-field">
              <div className="search-field-content">
                <span className="search-field-label">Destination</span>
                <AddressAutocomplete
                  value={form.to}
                  onChange={(val) => setForm((prev) => ({ ...prev, to: val }))}
                  onSelect={handleToSelect}
                  placeholder="Where to?"
                  icon="near_me"
                  inputClassName="search-field-input"
                />
              </div>
            </div>
            <div className="search-bar-divider" />
            <div className="search-bar-field search-bar-date-field">
              <span className="material-symbols-outlined search-field-icon">calendar_today</span>
              <div className="search-field-content">
                <span className="search-field-label">Date</span>
                <input
                  type="date"
                  value={form.date}
                  onChange={updateForm('date')}
                  className="search-field-input"
                />
              </div>
              <button
                type="submit"
                className="search-submit-btn"
                disabled={loading}
              >
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Area */}
      <div className="search-results-area">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {results !== null && !loading && (
            <div className="results-header">
              <span className="results-count">
                Showing <strong>{results.length} ride{results.length !== 1 ? 's' : ''}</strong> for {form.date ? new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }) : 'today'}
              </span>
              <div className="results-sort">
                <span className="results-sort-label">Sort by:</span>
                <select
                  className="results-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

            {results === null && initialLoading && (
              <div className="loading">
                <div className="spinner spinner-lg" />
                <span>Loading available rides...</span>
              </div>
            )}

            {results === null && !initialLoading && allRides.length === 0 && (
              <div className="search-initial-state">
                <div className="empty-state">
                  <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)', marginBottom: 12 }}>search</span>
                  <h3>No rides available</h3>
                  <p>There are no open rides right now. Check back later or offer a ride!</p>
                </div>
              </div>
            )}

            {results === null && !initialLoading && allRides.length > 0 && (
              <div className="ride-cards-list">
                <div className="results-header">
                  <span className="results-count">
                    Showing <strong>all {allRides.length} open ride{allRides.length !== 1 ? 's' : ''}</strong>
                  </span>
                  <div className="results-sort">
                    <span className="results-sort-label">Sort by:</span>
                    <select
                      className="results-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {[...allRides].sort((a, b) => {
                  if (sortBy === 'price')
                    return (a.price_per_seat || a.final_cost || 0) - (b.price_per_seat || b.final_cost || 0)
                  return new Date(a.departure_time || 0) - new Date(b.departure_time || 0)
                }).map((ride) => (
                  <div
                    key={ride.id}
                    className="ride-card-horizontal"
                  >
                      <div className="ride-card-inner">
                        <div className="ride-map-column">
                          <div className="ride-map-route-labels">
                            <span className="ride-map-route-label">{ride.from_city}</span>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--outline)' }}>east</span>
                            <span className="ride-map-route-label">{ride.to_city}</span>
                          </div>
                          <div className="ride-map-preview">
                            <RouteMap
                              from={{ lat: ride.from_lat, lng: ride.from_lng }}
                              to={{ lat: ride.to_lat, lng: ride.to_lng }}
                              height={160}
                            />
                            {ride.distance_km && (
                              <span className="ride-map-badge">{ride.distance_km} km Route</span>
                            )}
                          </div>
                        </div>
                      <div className="ride-card-info">
                        <div className="ride-card-top">
                          <div>
                            <div className="ride-card-driver-row">
                              <h3 className="ride-card-driver-name">{getDriverName(ride)}</h3>
                              <span className="material-symbols-outlined ride-verified-icon">verified</span>
                              <div className="ride-rating-pill">
                                <span className="material-symbols-outlined ride-rating-star">star</span>
                                <span>{ride.driver_avg_rating ? Number(ride.driver_avg_rating).toFixed(1) : '-'}</span>
                              </div>
                            </div>
                            <p className="ride-card-vehicle">
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>directions_car</span>
                              {formatVehicleName(ride)}
                            </p>
                          </div>
                          <div className="ride-card-departure">
                            <span className="ride-departure-label">Departure</span>
                            <span className="ride-departure-time">{formatRideTime(ride.departure_time)}</span>
                          </div>
                        </div>
                        <div className="ride-card-features">
                          {ride.available_seats != null && (
                            <div className="ride-feature-item">
                              <span className="material-symbols-outlined">event_seat</span>
                              <span>{ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left</span>
                            </div>
                          )}
                          {ride.distance_km != null && (
                            <div className="ride-feature-item">
                              <span className="material-symbols-outlined">route</span>
                              <span>{Number(ride.distance_km).toFixed(1)} km</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="ride-card-cta">
                        <div className="ride-card-price">
                          <span className="ride-price-label">Total per seat</span>
                          <span className="ride-price-value">{formatCurrency(ride.price_per_seat ?? ride.final_cost)}</span>
                        </div>
                        <button
                          className="ride-book-btn"
                          onClick={() => navigate(`/rides/${ride.id}`)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading && (
              <div className="loading">
                <div className="spinner spinner-lg" />
                <span>Searching rides...</span>
              </div>
            )}

            {results !== null && !loading && results.length === 0 && (
              <div className="search-initial-state">
                <div className="empty-state">
                  <h3>No rides found</h3>
                  <p>Try different cities, dates, or adjust your filters.</p>
                </div>
              </div>
            )}

            {results !== null && !loading && results.length > 0 && (
              <div className="ride-cards-list">
                {sortedResults.map((ride) => (
                  <div
                    key={ride.id}
                    className="ride-card-horizontal"
                  >
                    <div className="ride-card-inner">
                      <div className="ride-map-column">
                        <div className="ride-map-route-labels">
                          <span className="ride-map-route-label">{ride.from_city}</span>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--outline)' }}>east</span>
                          <span className="ride-map-route-label">{ride.to_city}</span>
                        </div>
                        <div className="ride-map-preview">
                          <RouteMap
                            from={{ lat: ride.from_lat, lng: ride.from_lng }}
                            to={{ lat: ride.to_lat, lng: ride.to_lng }}
                            height={160}
                          />
                          {ride.distance_km && (
                            <span className="ride-map-badge">{ride.distance_km} km Route</span>
                          )}
                        </div>
                      </div>

                      {/* Ride Info */}
                      <div className="ride-card-info">
                        <div className="ride-card-top">
                          <div>
                            <div className="ride-card-driver-row">
                              <h3 className="ride-card-driver-name">{getDriverName(ride)}</h3>
                              <span className="material-symbols-outlined ride-verified-icon">verified</span>
                              <div className="ride-rating-pill">
                                <span className="material-symbols-outlined ride-rating-star">star</span>
                                <span>{ride.driver_avg_rating ? Number(ride.driver_avg_rating).toFixed(1) : '-'}</span>
                              </div>
                            </div>
                            <p className="ride-card-vehicle">
                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>directions_car</span>
                              {formatVehicleName(ride)}
                            </p>
                          </div>
                          <div className="ride-card-departure">
                            <span className="ride-departure-label">Departure</span>
                            <span className="ride-departure-time">{formatRideTime(ride.departure_time)}</span>
                          </div>
                        </div>

                        <div className="ride-card-features">
                          {ride.available_seats != null && (
                            <div className="ride-feature-item">
                              <span className="material-symbols-outlined">event_seat</span>
                              <span>{ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left</span>
                            </div>
                          )}
                          {ride.distance_km != null && (
                            <div className="ride-feature-item">
                              <span className="material-symbols-outlined">route</span>
                              <span>{Number(ride.distance_km).toFixed(1)} km</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="ride-card-cta">
                        <div className="ride-card-price">
                          <span className="ride-price-label">Total per seat</span>
                          <span className="ride-price-value">{formatCurrency(ride.price_per_seat ?? ride.final_cost)}</span>
                        </div>
                        <button
                          className="ride-book-btn"
                          onClick={() => navigate(`/rides/${ride.id}`)}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
    </div>
  )
}
