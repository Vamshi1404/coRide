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
  SearchX, AlertTriangle,
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

  const SEARCH_HERO = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hyderabad_skyline.jpg?width=1600'

  return (
    <div className="page">
      {/* Hero banner */}
      <div className="search-hero">
        <img src={SEARCH_HERO} alt="" aria-hidden="true" />
        <div className="search-hero__overlay" />
        <div className="search-hero__content">
          <h1 className="page-title" style={{ color: 'var(--text-strong)' }}>Find your ride</h1>
          <p className="page-sub" style={{ color: 'var(--text-secondary)' }}>Open seats leaving from Hyderabad. Request instantly, split the fare.</p>
        </div>
      </div>

      <form onSubmit={submit} className="search-panel" aria-label="Search rides">
        <div className="search-grid">
          <AddressInput
            id="search-from"
            label="From"
            value={form.from}
            onChange={(v) => setForm((f) => ({ ...f, from: v }))}
            placeholder="Leaving from"
          />
          <span className="search-divider" aria-hidden="true" />
          <AddressInput
            id="search-to"
            label="To"
            value={form.to}
            onChange={(v) => setForm((f) => ({ ...f, to: v }))}
            placeholder="Where to?"
          />
          <span className="search-divider" aria-hidden="true" />
          <div className="search-dates">
            <div className="field field--date">
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
            <button
              type="submit"
              disabled={query.isFetching}
              className="search-submit"
              aria-label="Search"
              style={{ marginTop: 'auto' }}
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="chips-row">
          {POPULAR_ROUTES.slice(0, 8).map((r) => (
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

      {query.isLoading && (
        <div className="results-stack" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <RideCardSkeleton key={i} />
          ))}
        </div>
      )}

      {query.isError && <ErrorState onRetry={() => query.refetch()} />}

      {!query.isLoading && !query.isError && rides.length === 0 && (
        <EmptyState hasQuery={hasQuery} />
      )}

      {!query.isLoading && !query.isError && sorted.length > 0 && (
        <motion.ul
          className="results-stack"
          style={{ listStyle: 'none', padding: 0 }}
          initial={reduced ? false : 'hidden'}
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          {sorted.map((ride) => (
            <motion.li
              key={ride.id}
              variants={reduced ? {} : { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <RideResultCard ride={ride} onSelect={() => navigate(`/confirm/${ride.id}`)} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  )
}

function RideResultCard({ ride, onSelect }) {
  const initials = getInitials(getDriverName(ride))
  const rating = ride.driver_avg_rating ? Number(ride.driver_avg_rating).toFixed(1) : null

  return (
    <div
      className="result-card"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <div className="routeline result-card__routeline">
        <span className="routeline__node routeline__node--origin" aria-hidden="true" />
        <span className="routeline__label">{ride.from_city}</span>
        <span className="routeline__connector" aria-hidden="true"><Navigation size={10} /></span>
        <span className="routeline__label" style={{ textAlign: 'right' }}>{ride.to_city}</span>
        <span className="routeline__node routeline__node--dest" aria-hidden="true" />
      </div>

      <div className="result-card__driver">
        <span className="avatar avatar--md" aria-hidden="true">{initials}</span>
        <div className="result-card__driver-info">
          <p className="row-item__title">{getDriverName(ride)}</p>
          <p className="row-item__sub">{formatVehicleName(ride)}</p>
        </div>
        {rating && (
          <span className="rating-chip tabular">
            <Star size={12} aria-hidden="true" style={{ fill: 'currentColor' }} />
            {rating}
          </span>
        )}
      </div>

      <div className="result-card__meta-wrap">
        <div className="result-card__foot" style={{ marginTop: 'var(--p-space-lg)', paddingTop: 'var(--p-space-md)', borderTop: '1px solid var(--divider)' }}>
          <div className="result-card__meta" style={{ margin: 0, padding: 0, border: 'none' }}>
            <span><Clock size={12} aria-hidden="true" />{formatRideTime(ride.departure_time)}</span>
            {ride.available_seats != null && (
              <span><Users size={12} aria-hidden="true" />{ride.available_seats} left</span>
            )}
            {ride.distance_km != null && (
              <span className="hide-sm"><RouteLine size={12} aria-hidden="true" />{Number(ride.distance_km).toFixed(0)} km</span>
            )}
          </div>
          <div className="row-item__actions">
            <span className="result-card__price">{formatCurrency(ride.final_cost)}</span>
            <span className="result-card__go" aria-hidden="true"><ArrowRight size={14} /></span>
          </div>
        </div>
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

function RideCardSkeleton() {
  return (
    <div className="skel-card" aria-hidden="true">
      <div className="skel-row">
        <span className="skel skel--circle" style={{ width: 10, height: 10 }} />
        <div className="skel skel--line" style={{ width: 96 }} />
        <div className="skel skel--line sm" style={{ flex: 1 }} />
        <div className="skel skel--line" style={{ width: 80 }} />
        <span className="skel skel--circle" style={{ width: 10, height: 10 }} />
      </div>
      <div className="skel-row">
        <span className="skel skel--circle avatar avatar--md" style={{ width: 44, height: 44 }} />
        <div className="stack stack--gap-sm" style={{ flex: 1 }}>
          <div className="skel skel--line" style={{ width: 130 }} />
          <div className="skel skel--line sm" style={{ width: 90 }} />
        </div>
      </div>
      <div className="skel-row" style={{ justifyContent: 'space-between', paddingTop: 8 }}>
        <div className="skel skel--line lg" style={{ width: 64 }} />
        <div className="skel skel--block" style={{ width: 96, height: 34 }} />
      </div>
    </div>
  )
}
