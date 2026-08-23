import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import { api } from '@/lib/api'
import { POPULAR_ROUTES } from '@/lib/hyderabad'
import {
  formatRideTime, formatCurrency, formatVehicleName, getDriverName, getInitials,
} from '@/lib/rideDisplay'
import { AddressInput } from '@/components/nocturne/AddressInput'
import {
  Search, Navigation, Clock, Users, Star, ArrowRight, Route as RouteLine,
  SearchX, AlertTriangle, ChevronDown,
} from 'lucide-react'

const todayISO = () => new Date().toISOString().slice(0, 10)

function sortRides(rides, sortBy) {
  const list = [...(rides ?? [])]
  if (sortBy === 'price') list.sort((a, b) => (a.final_cost ?? 0) - (b.final_cost ?? 0))
  else list.sort((a, b) => new Date(a.departure_time ?? 0) - new Date(b.departure_time ?? 0))
  return list
}

export default function SearchRides() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reduced = useReducedMotion()
  const initial = {
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    date: searchParams.get('date') || '',
  }
  const [form, setForm] = useState(initial)
  const [params, setParams] = useState({
    from_city: initial.from,
    to_city: initial.to,
    date: initial.date,
  })
  const [sortBy, setSortBy] = useState('earliest')

  const query = useQuery({
    queryKey: ['rides', params],
    queryFn: () => api.get('/api/rides', params),
    refetchInterval: 30_000,
  })

  const rides = useMemo(() => query.data ?? [], [query.data])
  const sorted = useMemo(() => sortRides(rides, sortBy), [rides, sortBy])
  const hasQuery = Boolean(params.from_city || params.to_city || params.date)

  const submit = (e) => {
    e?.preventDefault()
    setParams({
      from_city: form.from.trim(),
      to_city: form.to.trim(),
      date: form.date || '',
    })
  }

  const applyRoute = (r) => {
    setForm({ from: r.from, to: r.to, date: '' })
    setParams({ from_city: r.from, to_city: r.to, date: '' })
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">Find your ride</h1>
        <p className="page-sub">Open seats leaving from Hyderabad. Request instantly, split the fare.</p>
      </header>

      {/* Search form — mobility product style */}
      <form onSubmit={submit} className="search-form-card" aria-label="Search rides">
        <div className="search-route-visual">
          <AddressInput
            id="search-from"
            label="From"
            value={form.from}
            onChange={(v) => setForm((f) => ({ ...f, from: v }))}
            placeholder="Leaving from"
          />
          <div className="search-route-connector" aria-hidden="true">
            <span className="search-route-connector__line" />
            <ChevronDown size={16} className="search-route-connector__icon" />
            <span className="search-route-connector__line" />
          </div>
          <AddressInput
            id="search-to"
            label="To"
            value={form.to}
            onChange={(v) => setForm((f) => ({ ...f, to: v }))}
            placeholder="Where to?"
          />
        </div>

        <div className="search-form-extras">
          <div className="field">
            <label htmlFor="search-date" className="field__label">Date</label>
            <input
              id="search-date"
              type="date"
              min={todayISO()}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="input"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={query.isFetching}
              className="btn btn--primary btn--md"
              style={{ width: '100%' }}
            >
              <Search size={16} aria-hidden="true" />
              Search rides
            </button>
          </div>
        </div>

        {/* Popular routes */}
        <div className="chips-row" style={{ marginTop: 'var(--p-space-md)' }}>
          {POPULAR_ROUTES.slice(0, 6).map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              type="button"
              onClick={() => applyRoute(r)}
              className="chip"
            >
              {r.from} → {r.to}
            </button>
          ))}
        </div>
      </form>

      {/* Results toolbar */}
      <div className="results-toolbar">
        <p className="results-count" aria-live="polite">
          {query.isLoading
            ? 'Loading rides…'
            : query.isError
              ? 'Could not load rides'
              : (
                <>
                  <strong>{rides.length}</strong> ride{rides.length !== 1 && 's'}{' '}
                  {hasQuery ? 'found' : 'leaving soon'}
                </>
              )}
        </p>
        {!query.isLoading && !query.isError && rides.length > 0 && (
          <label className="sort-field">
            Sort by
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="earliest">Earliest</option>
              <option value="price">Lowest price</option>
            </select>
          </label>
        )}
      </div>

      {/* Loading */}
      {query.isLoading && (
        <div className="results-grid" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skel-card" aria-hidden="true">
              <div className="skel skel--line" style={{ width: 80 }} />
              <div className="skel-row" style={{ marginTop: 10 }}>
                <span className="skel skel--circle" style={{ width: 6 }} />
                <div className="skel skel--line" style={{ flex: 1 }} />
                <span className="skel skel--circle" style={{ width: 6 }} />
              </div>
              <div className="skel-row" style={{ marginTop: 14 }}>
                <span className="skel skel--circle" style={{ width: 32 }} />
                <div style={{ flex: 1 }}>
                  <div className="skel skel--line" style={{ width: 100 }} />
                  <div className="skel skel--line sm" style={{ width: 80, marginTop: 4 }} />
                </div>
              </div>
              <div className="skel-row" style={{ marginTop: 12, justifyContent: 'space-between' }}>
                <div className="skel skel--line" style={{ width: 60 }} />
                <div className="skel skel--block" style={{ width: 80, height: 28 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {query.isError && <ErrorState onRetry={() => query.refetch()} />}

      {/* Empty */}
      {!query.isLoading && !query.isError && rides.length === 0 && (
        <EmptyState hasQuery={hasQuery} />
      )}

      {/* Results grid — 2 columns */}
      {!query.isLoading && !query.isError && sorted.length > 0 && (
        <motion.div
          className="results-grid"
          initial={reduced ? false : 'hidden'}
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        >
          {sorted.map((ride) => (
            <motion.div
              key={ride.id}
              variants={reduced ? {} : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <RideResultCard ride={ride} onSelect={() => navigate(`/confirm/${ride.id}`)} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

function RideResultCard({ ride, onSelect }) {
  const initials = getInitials(getDriverName(ride))
  const rating = ride.driver_avg_rating ? Number(ride.driver_avg_rating).toFixed(1) : null

  return (
    <div
      className="result-card-v2"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      {/* Departure time — dominant */}
      <div className="result-card-v2__time">
        {formatRideTime(ride.departure_time)}
      </div>

      {/* Route */}
      <div className="result-card-v2__route">
        <span className="result-card-v2__route-dot" />
        <span>{ride.from_city}</span>
        <ArrowRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span className="result-card-v2__route-dot result-card-v2__route-dot--dest" />
        <span>{ride.to_city}</span>
      </div>

      {/* Driver */}
      <div className="result-card-v2__driver">
        <span className="avatar avatar--sm">{initials}</span>
        <span className="result-card-v2__driver-name">{getDriverName(ride)}</span>
        {rating && (
          <span className="result-card-v2__driver-rating tabular">
            <Star size={11} aria-hidden="true" style={{ fill: 'currentColor' }} />
            {rating}
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="result-card-v2__meta">
        {ride.available_seats != null && (
          <span className="result-card-v2__meta-item">
            <Users size={12} aria-hidden="true" />
            {ride.available_seats} seats
          </span>
        )}
        {ride.distance_km != null && (
          <span className="result-card-v2__meta-item hide-sm">
            <RouteLine size={12} aria-hidden="true" />
            {Number(ride.distance_km).toFixed(0)} km
          </span>
        )}
        <span className="result-card-v2__meta-item">
          {formatVehicleName(ride)}
        </span>
      </div>

      {/* Footer: price + CTA */}
      <div className="result-card-v2__foot">
        <span className="result-card-v2__price">{formatCurrency(ride.final_cost)}</span>
        <span className="btn btn--primary btn--sm">
          Book <ArrowRight size={13} />
        </span>
      </div>
    </div>
  )
}

function EmptyState({ hasQuery }) {
  return (
    <div className="state">
      <span className="state__icon-wrap"><SearchX size={22} aria-hidden="true" /></span>
      <h2 className="state__title">
        {hasQuery ? 'No rides match your search' : 'No open rides right now'}
      </h2>
      <p className="state__body">
        {hasQuery
          ? 'Try different cities or clear the date filter.'
          : 'Be the first — offer a ride and fill your empty seats.'}
      </p>
      <div className="state__actions">
        <button type="button" onClick={() => window.location.assign('/offer-ride')} className="btn btn--primary btn--md">
          Offer a ride instead
        </button>
      </div>
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className="state state--error">
      <span className="state__icon-wrap"><AlertTriangle size={22} aria-hidden="true" /></span>
      <h2 className="state__title">Something went wrong</h2>
      <p className="state__body">We couldn't load rides. Check your connection.</p>
      <div className="state__actions">
        <button type="button" onClick={onRetry} className="btn btn--primary btn--md">
          Try again
        </button>
      </div>
    </div>
  )
}
