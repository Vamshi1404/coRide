import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RideTypeCarousel } from '@/components/nocturne/ride-type-carousel'
import { FareCounter } from '@/components/nocturne/fare-counter'
import { SurgeChip } from '@/components/nocturne/live-indicators'
import { RideCardSkeleton } from '@/components/nocturne/skeletons'
import { MOCK_ROUTES } from '@/lib/mock/routes'
import { MOCK_DRIVERS } from '@/lib/mock/drivers'
import { calculateFare } from '@/lib/mock/fares'
import { cn } from '@/lib/utils'
import { Search, MapPin, Navigation, Clock, Users, ArrowRight } from 'lucide-react'

function RideResultCard({ route, driver, fare, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card
        className="bg-card border-border hover:border-[var(--nc-400)] transition-all duration-300 cursor-pointer group"
        onClick={() => onSelect?.(route)}
      >
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-[var(--nc-accent)] shrink-0" />
            <span className="text-foreground font-medium text-sm">{route.from.label}</span>
            <div className="flex-1 flex items-center gap-1.5">
              <div className="flex-1 h-px bg-border" />
              <Navigation size={10} className="text-muted-foreground" />
              <div className="flex-1 h-px bg-border" />
            </div>
            <span className="text-foreground font-medium text-sm">{route.to.label}</span>
            <div className="size-2.5 rounded-full bg-muted-foreground shrink-0" />
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground text-sm font-semibold">
              {driver.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-medium truncate">{driver.name}</p>
              <p className="text-muted-foreground text-xs">{driver.vehicle.make} {driver.vehicle.model}</p>
            </div>
            <span className="text-foreground text-xs">★ {driver.rating}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-4 text-muted-foreground text-xs">
              <span className="flex items-center gap-1"><Clock size={12} />{route.duration} min</span>
              <span className="flex items-center gap-1"><MapPin size={12} />{route.distance} km</span>
              <span className="flex items-center gap-1"><Users size={12} />{route.seatsAvailable} seats</span>
            </div>
            <div className="flex items-center gap-3">
              <FareCounter value={fare.total} className="text-foreground font-bold text-lg" />
              <Button
                size="sm"
                className="cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onSelect?.(route) }}
              >
                Book
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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
    <div className="min-h-screen bg-background pt-20 pb-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Find your ride</h1>
          <p className="text-muted-foreground">Search available rides across Hyderabad</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nc-accent)]" />
                  <Input placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} className="pl-10" />
                </div>
                <div className="relative">
                  <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} className="pl-10" />
                </div>
              </div>
              <Button onClick={handleSearch} className="w-full cursor-pointer" disabled={isSearching}>
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <><Search size={16} className="mr-2" />Search Rides</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-foreground text-lg font-semibold">Choose your ride type</h2>
          <RideTypeCarousel selected={rideType} onSelect={setRideType} />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowSurge(!showSurge)
              setSurgeMultiplier(showSurge ? 1.0 : 1.8)
            }}
            className={cn(
              'cursor-pointer',
              showSurge ? 'bg-[var(--nc-accent-dim)] border-[var(--nc-accent)] text-[var(--nc-accent)]' : 'text-muted-foreground'
            )}
          >
            {showSurge ? 'Remove Surge' : 'Simulate Surge'}
          </Button>
          {showSurge && <SurgeChip multiplier={surgeMultiplier} />}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {isSearching && (
              <motion.div
                key="skeletons"
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <RideCardSkeleton />
                <RideCardSkeleton />
              </motion.div>
            )}

            {!isSearching && hasSearched && results.length === 0 && (
              <motion.div
                key="empty"
                className="text-center py-16 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Search size={32} className="mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No rides found for this route</p>
              </motion.div>
            )}

            {!isSearching && results.length > 0 && (
              <motion.div
                key="results"
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-muted-foreground text-sm">
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
              </motion.div>
            )}

            {!hasSearched && (
              <motion.div
                key="placeholder"
                className="text-center py-16 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mx-auto size-16 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <MapPin size={24} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Enter your route to find available rides</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
