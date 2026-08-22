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
import { RideCardSkeleton } from '@/components/nocturne/skeletons'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--nc-900)]">
          Find your ride
        </h1>
        <p className="mt-2 text-[var(--nc-500)]">
          Open seats leaving from Hyderabad. Book instantly, split the fare.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="p-4 sm:p-5 rounded-[16px] bg-[var(--nc-200)] border border-[var(--nc-300)] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        aria-label="Search rides"
      >
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <AddressInput
            id="search-from"
            label="From"
            value={form.from}
            onChange={(v) => setForm((f) => ({ ...f, from: v }))}
            placeholder="Leaving from"
          />
          <div className="hidden lg:block h-11 w-px bg-[var(--nc-300)]" aria-hidden="true" />
          <AddressInput
            id="search-to"
            label="To"
            value={form.to}
            onChange={(v) => setForm((f) => ({ ...f, to: v }))}
            placeholder="Where to?"
          />
          <div className="hidden lg:block h-11 w-px bg-[var(--nc-300)]" aria-hidden="true" />
          <div className="flex gap-3 flex-1">
            <div>
              <label
                htmlFor="search-date"
                className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nc-500)] mb-1.5"
              >
                Date
              </label>
              <input
                id="search-date"
                type="date"
                min={todayISO()}
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full sm:w-44 h-11 px-3 rounded-[12px] bg-[var(--nc-100)] border border-[var(--nc-300)] text-sm text-[var(--nc-800)] outline-none focus:border-[var(--nc-accent)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={query.isFetching}
              className="ml-auto shrink-0 size-11 self-end rounded-[12px] bg-[var(--nc-accent)] text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--nc-300)]/60 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {POPULAR_ROUTES.slice(0, 8).map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              type="button"
              onClick={() => applyRoute(r)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--nc-500)] bg-transparent border border-[var(--nc-300)] hover:border-[var(--nc-accent)] hover:text-[var(--nc-800)] transition-colors cursor-pointer"
            >
              {r.from} → {r.to}
            </button>
          ))}
        </div>
      </form>

      <div className="mt-10 mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--nc-500)]" aria-live="polite">
          {query.isLoading ? (
            'Loading rides…'
          ) : query.isError ? (
            'Could not load rides'
          ) : (
            <>
              <span className="text-[var(--nc-900)] font-semibold">{rides.length}</span>{' '}
              ride{rides.length !== 1 && 's'} {hasQuery ? 'found' : 'leaving soon'}
            </>
          )}
        </p>
        {!query.isLoading && !query.isError && rides.length > 0 && (
          <label className="flex items-center gap-2 text-xs text-[var(--nc-500)]">
            Sort by
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[var(--nc-accent)] cursor-pointer outline-none [&>option]:bg-[var(--nc-100)] [&>option]:text-[var(--nc-800)]"
            >
              <option value="earliest">Earliest</option>
              <option value="price">Lowest price</option>
            </select>
          </label>
        )}
      </div>

      {query.isLoading && (
        <div className="space-y-4" aria-busy="true">
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
          className="space-y-4"
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
      className="group p-5 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] hover:border-[var(--nc-400)] transition-colors duration-300 cursor-pointer"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <div className="flex items-center gap-3">
        <span className="size-2.5 rounded-full bg-[var(--nc-accent)] shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium text-[var(--nc-800)] truncate">{ride.from_city}</span>
        <span className="flex-1 flex items-center gap-1.5 text-[var(--nc-500)]" aria-hidden="true">
          <span className="flex-1 h-px bg-[var(--nc-400)]" />
          <Navigation size={10} />
          <span className="flex-1 h-px bg-[var(--nc-400)]" />
        </span>
        <span className="text-sm font-medium text-[var(--nc-800)] truncate">{ride.to_city}</span>
        <span className="size-2.5 rounded-full bg-[var(--nc-500)] shrink-0" aria-hidden="true" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="size-9 rounded-full bg-[var(--nc-300)] flex items-center justify-center text-[var(--nc-700)] text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--nc-800)] truncate">{getDriverName(ride)}</p>
          <p className="text-xs text-[var(--nc-500)] truncate">{formatVehicleName(ride)}</p>
        </div>
        {rating && (
          <span className="flex items-center gap-1 text-xs text-[var(--nc-700)] shrink-0 tabular-nums">
            <Star size={12} className="fill-current text-[var(--nc-accent)]" />
            {rating}
          </span>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-[var(--nc-300)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-[var(--nc-500)]">
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {formatRideTime(ride.departure_time)}
          </span>
          {ride.available_seats != null && (
            <span className="flex items-center gap-1.5">
              <Users size={12} />
              {ride.available_seats} left
            </span>
          )}
          {ride.distance_km != null && (
            <span className="hidden sm:flex items-center gap-1.5">
              <RouteLine size={12} />
              {Number(ride.distance_km).toFixed(0)} km
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-lg font-bold text-[var(--nc-900)] tabular-nums">
            {formatCurrency(ride.final_cost)}
          </span>
          <span className="size-8 rounded-full bg-[var(--nc-900)] flex items-center justify-center group-hover:bg-[var(--nc-accent)] transition-colors">
            <ArrowRight size={14} className="text-white" />
          </span>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ hasQuery }) {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto size-14 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] flex items-center justify-center">
        <SearchX size={22} className="text-[var(--nc-500)]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--nc-900)]">
        {hasQuery ? 'No rides match your search' : 'No open rides right now'}
      </h3>
      <p className="mt-1.5 text-sm text-[var(--nc-500)] max-w-sm mx-auto">
        {hasQuery
          ? 'Try different cities or clear the date filter.'
          : 'Be the first — offer a ride and fill your empty seats.'}
      </p>
      <button
        onClick={() => window.location.assign('/offer-ride')}
        className="mt-6 px-5 py-2.5 rounded-full bg-[var(--nc-900)] text-white text-sm font-medium hover:bg-[var(--nc-800)] transition-colors cursor-pointer"
      >
        Offer a ride instead
      </button>
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto size-14 rounded-full bg-[var(--nc-accent-dim)] border border-[var(--nc-accent)]/40 flex items-center justify-center">
        <AlertTriangle size={22} className="text-[var(--nc-accent)]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[var(--nc-900)]">Something went wrong</h3>
      <p className="mt-1.5 text-sm text-[var(--nc-500)]">We couldn't load rides. Check your connection.</p>
      <button
        onClick={onRetry}
        className="mt-6 px-5 py-2.5 rounded-full bg-[var(--nc-900)] text-white text-sm font-medium hover:bg-[var(--nc-800)] transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  )
}
