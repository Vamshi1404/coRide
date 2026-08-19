import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FareCounter } from '@/components/nocturne/fare-counter'
import { RideCardSkeleton } from '@/components/nocturne/skeletons'
import { api } from '@/lib/api'
import { Search, MapPin, Navigation, Clock, Users, ArrowRight } from 'lucide-react'

function RideResultCard({ ride, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card
        className="bg-card border-border hover:border-[var(--nc-400)] transition-all duration-300 cursor-pointer group"
        onClick={() => onSelect?.(ride)}
      >
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-[var(--nc-accent)] shrink-0" />
            <span className="text-foreground font-medium text-sm">{ride.from_city}</span>
            <div className="flex-1 flex items-center gap-1.5">
              <div className="flex-1 h-px bg-border" />
              <ArrowRight size={12} className="text-muted-foreground" />
              <div className="flex-1 h-px bg-border" />
            </div>
            <span className="text-foreground font-medium text-sm">{ride.to_city}</span>
            <div className="size-2.5 rounded-full bg-muted-foreground shrink-0" />
          </div>

          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-secondary flex items-center justify-center text-foreground text-sm font-semibold">
              {ride.driver_name?.split(' ').map(n => n[0]).join('') || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-medium truncate">{ride.driver_name}</p>
              <p className="text-muted-foreground text-xs">{ride.vehicle_brand} {ride.vehicle_model}</p>
            </div>
            {ride.driver_avg_rating && (
              <span className="text-foreground text-xs">★ {Number(ride.driver_avg_rating).toFixed(1)}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-4 text-muted-foreground text-xs">
              {ride.departure_time && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(ride.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {ride.distance_km && (
                <span className="flex items-center gap-1"><MapPin size={12} />{ride.distance_km} km</span>
              )}
              <span className="flex items-center gap-1"><Users size={12} />{ride.available_seats} seats</span>
            </div>
            <div className="flex items-center gap-3">
              <FareCounter value={ride.final_cost} className="text-foreground font-bold text-lg" />
              <Button
                size="sm"
                className="cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onSelect?.(ride) }}
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
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!from.trim() || !to.trim()) return
    setIsSearching(true)
    setHasSearched(true)
    setError('')
    try {
      const rides = await api.get('/api/rides', { from_city: from.trim(), to_city: to.trim() })
      setResults(rides)
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectRide = (ride) => {
    navigate('/confirm', { state: { ride } })
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
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
                  <Input
                    placeholder="From city"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <div className="relative">
                  <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="To city"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <Button onClick={handleSearch} className="w-full h-11 cursor-pointer" disabled={isSearching || !from.trim() || !to.trim()}>
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

            {!isSearching && error && (
              <motion.div
                key="error"
                className="text-center py-12 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-destructive text-sm">{error}</p>
              </motion.div>
            )}

            {!isSearching && !error && hasSearched && results.length === 0 && (
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
                {results.map((ride) => (
                  <RideResultCard
                    key={ride.id}
                    ride={ride}
                    onSelect={handleSelectRide}
                  />
                ))}
              </motion.div>
            )}

            {!hasSearched && (
              <motion.div
                key="placeholder"
                className="text-center py-20 space-y-4 max-h-[50vh] flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mx-auto size-16 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <MapPin size={24} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Enter your pickup and destination above to find available rides
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
