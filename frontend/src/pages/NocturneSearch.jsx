import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RideTypeCarousel } from '@/components/nocturne/ride-type-carousel'
import { FareCounter } from '@/components/nocturne/fare-counter'
import { SurgeChip } from '@/components/nocturne/live-indicators'
import { RideCardSkeleton } from '@/components/nocturne/skeletons'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { MOCK_ROUTES } from '@/lib/mock/routes'
import { MOCK_DRIVERS } from '@/lib/mock/drivers'
import { calculateFare } from '@/lib/mock/fares'
import { cn } from '@/lib/utils'
import { Search, MapPin, Navigation, Clock, Users, ArrowRight } from 'lucide-react'

function RideResultCard({ route, driver, fare, onSelect }) {
  const [ref, isVisible] = useScrollReveal()
  return (
    <div ref={ref} className={cn('nc-section-reveal', isVisible && 'visible')}>
      <Card
        className="bg-[var(--nc-200)] border-[var(--nc-300)] border hover:border-[var(--nc-400)] transition-all duration-300 cursor-pointer group"
        onClick={() => onSelect?.(route)}
      >
        <CardContent className="p-5 space-y-4">
          {/* Route line */}
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-[var(--nc-accent)] shrink-0" />
            <span className="text-[var(--nc-800)] font-medium text-sm">{route.from.label}</span>
            <div className="flex-1 flex items-center gap-1.5">
              <div className="flex-1 h-px bg-[var(--nc-400)]" />
              <Navigation size={10} className="text-[var(--nc-500)]" />
              <div className="flex-1 h-px bg-[var(--nc-400)]" />
            </div>
            <span className="text-[var(--nc-800)] font-medium text-sm">{route.to.label}</span>
            <div className="size-2.5 rounded-full bg-[var(--nc-500)] shrink-0" />
          </div>

          {/* Driver info */}
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-[var(--nc-300)] flex items-center justify-center text-[var(--nc-700)] text-sm font-semibold">
              {driver.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--nc-800)] text-sm font-medium truncate">{driver.name}</p>
              <p className="text-[var(--nc-500)] text-xs">{driver.vehicle.make} {driver.vehicle.model}</p>
            </div>
            <div className="text-right">
              <span className="text-[var(--nc-800)] text-xs">★ {driver.rating}</span>
            </div>
          </div>

          {/* Footer: meta + price + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--nc-300)]">
            <div className="flex items-center gap-4 text-[var(--nc-500)] text-xs">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {route.duration} min
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {route.distance} km
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {route.seatsAvailable} seats
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FareCounter value={fare.total} className="text-[var(--nc-900)] font-bold text-lg" />
              <Button
                size="sm"
                className="bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-800)] cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onSelect?.(route) }}
              >
                Book
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NocturneSearch() {
  const navigate = useNavigate()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rideType, setRideType] = useState('economy')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showSurge, setShowSurge] = useState(false)
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0)

  const handleSearch = () => {
    setIsSearching(true)
    setHasSearched(true)
    // Simulate search delay
    setTimeout(() => {
      setResults(MOCK_ROUTES)
      setIsSearching(false)
    }, 800)
  }

  const handleSelectRide = (route) => {
    navigate('/confirm', { state: { route, rideType } })
  }

  const fares = useMemo(() => {
    return results.map((route) => ({
      route,
      fare: calculateFare(route.distance, rideType, showSurge ? surgeMultiplier : null),
    }))
  }, [results, rideType, showSurge, surgeMultiplier])

  return (
    <div className="min-h-screen bg-[var(--nc-50)] pt-20 pb-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-[var(--nc-900)] text-3xl font-bold tracking-tight">
            Find your ride
          </h1>
          <p className="text-[var(--nc-500)]">
            Search available rides across Hyderabad
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nc-accent)]" />
                <Input
                  placeholder="From"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-10 bg-[var(--nc-100)] border-[var(--nc-300)] text-[var(--nc-800)] placeholder:text-[var(--nc-500)]"
                />
              </div>
              <div className="relative">
                <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nc-500)]" />
                <Input
                  placeholder="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-10 bg-[var(--nc-100)] border-[var(--nc-300)] text-[var(--nc-800)] placeholder:text-[var(--nc-500)]"
                />
              </div>
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-800)] cursor-pointer"
              disabled={isSearching}
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-[var(--nc-0)]/30 border-t-[var(--nc-0)] rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                <>
                  <Search size={16} className="mr-2" />
                  Search Rides
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Ride Type Selector */}
        <div className="space-y-4">
          <h2 className="text-[var(--nc-800)] text-lg font-semibold">Choose your ride type</h2>
          <RideTypeCarousel selected={rideType} onSelect={setRideType} />
        </div>

        {/* Surge toggle (demo) */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowSurge(!showSurge)
              setSurgeMultiplier(showSurge ? 1.0 : 1.8)
            }}
            className={cn(
              'border-[var(--nc-400)] cursor-pointer',
              showSurge ? 'bg-[var(--nc-accent-dim)] border-[var(--nc-accent)] text-[var(--nc-accent)]' : 'text-[var(--nc-600)]'
            )}
          >
            {showSurge ? 'Remove Surge' : 'Simulate Surge'}
          </Button>
          {showSurge && <SurgeChip multiplier={surgeMultiplier} />}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {isSearching && (
            <div className="space-y-4">
              <RideCardSkeleton />
              <RideCardSkeleton />
            </div>
          )}

          {!isSearching && hasSearched && results.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <Search size={32} className="mx-auto text-[var(--nc-400)]" />
              <p className="text-[var(--nc-500)]">No rides found for this route</p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-[var(--nc-500)] text-sm">
                {results.length} ride{results.length !== 1 ? 's' : ''} available
              </p>
              {fares.map(({ route, fare }) => {
                const driver = MOCK_DRIVERS.find((d) => d.id === route.driver)
                return (
                  <RideResultCard
                    key={route.id}
                    route={route}
                    driver={driver}
                    fare={fare}
                    onSelect={handleSelectRide}
                  />
                )
              })}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-16 space-y-4">
              <div className="mx-auto size-16 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] flex items-center justify-center">
                <MapPin size={24} className="text-[var(--nc-400)]" />
              </div>
              <p className="text-[var(--nc-500)]">Enter your route to find available rides</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
