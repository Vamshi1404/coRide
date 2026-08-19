import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FareCounter } from '@/components/nocturne/fare-counter'
import { LiveChip } from '@/components/nocturne/live-indicators'
import { api } from '@/lib/api'
import { ArrowLeft, MapPin, Navigation, Clock, CreditCard, CheckCircle2, Shield } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
}

export default function NocturneConfirm() {
  const location = useLocation()
  const navigate = useNavigate()
  const ride = location.state?.ride
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [error, setError] = useState('')

  if (!ride) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No ride selected</p>
          <Button asChild variant="outline" className="cursor-pointer">
            <Link to="/search"><ArrowLeft size={16} className="mr-2" />Back to Search</Link>
          </Button>
        </div>
      </div>
    )
  }

  const departureTime = ride.departure_time ? new Date(ride.departure_time) : null
  const timeStr = departureTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '--:--'

  const handleBook = async () => {
    setIsBooking(true)
    setError('')
    try {
      await api.post(`/api/requests/ride/${ride.id}`)
      setIsBooked(true)
      setTimeout(() => navigate(`/track/${ride.id}`, { state: { ride } }), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors">
          <ArrowLeft size={14} />Back to search
        </Link>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              {isBooked ? 'Ride Confirmed' : 'Confirm your ride'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isBooked ? 'Your request has been sent to the driver' : 'Review details before booking'}
            </p>
          </div>
          {isBooked && <LiveChip />}
        </div>

        {error && (
          <motion.div
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            <motion.div {...fadeUp}>
              <Card className="bg-card border-border overflow-hidden">
                <div className="h-48 bg-secondary relative flex items-center justify-center">
                  <svg viewBox="0 0 400 200" className="w-full h-full" fill="none">
                    <path d="M 40 160 Q 120 40, 200 100 T 360 60" stroke="var(--nc-300)" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
                    <path d="M 40 160 Q 120 40, 200 100 T 360 60" stroke="var(--nc-accent)" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="40" cy="160" r="6" fill="var(--nc-accent)" />
                    <circle cx="360" cy="60" r="6" fill="var(--nc-500)" />
                    <text x="40" y="180" fill="var(--nc-600)" fontSize="11" textAnchor="middle">{ride.from_city}</text>
                    <text x="360" y="50" fill="var(--nc-600)" fontSize="11" textAnchor="middle">{ride.to_city}</text>
                  </svg>
                </div>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base">Route Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-2.5 rounded-full bg-[var(--nc-accent)]" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">{ride.from_city}</p>
                      <p className="text-muted-foreground text-xs">Pickup point</p>
                    </div>
                  </div>
                  <div className="ml-1 w-px h-6 bg-border" />
                  <div className="flex items-center gap-3">
                    <div className="size-2.5 rounded-full bg-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">{ride.to_city}</p>
                      <p className="text-muted-foreground text-xs">Drop-off point</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Distance</p>
                      <p className="text-foreground text-sm font-semibold tabular-nums">{ride.distance_km || '--'} km</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Departure</p>
                      <p className="text-foreground text-sm font-semibold tabular-nums">{timeStr}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Seats</p>
                      <p className="text-foreground text-sm font-semibold tabular-nums">{ride.available_seats}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base">Driver</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-foreground text-sm font-semibold">
                      {ride.driver_name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-medium truncate">{ride.driver_name}</p>
                      <p className="text-muted-foreground text-xs">{ride.vehicle_brand} {ride.vehicle_model}</p>
                    </div>
                    {ride.driver_avg_rating && (
                      <span className="text-foreground text-sm">★ {Number(ride.driver_avg_rating).toFixed(1)}</span>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Shield size={12} className="text-[var(--nc-accent)]" />
                      <span>Verified driver</span>
                    </div>
                    {ride.vehicle_color && (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: ride.vehicle_color === 'Black' ? '#333' : ride.vehicle_color === 'White' ? '#ddd' : '#666' }} />
                        <span>{ride.vehicle_color} {ride.vehicle_brand}</span>
                      </div>
                    )}
                    {ride.vehicle_plate && (
                      <p className="text-foreground text-xs font-mono">{ride.vehicle_plate}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}>
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <CreditCard size={16} className="text-muted-foreground" />
                    Fare
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-semibold">Total</span>
                    <FareCounter value={ride.final_cost} className="text-foreground font-bold text-xl" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.35 }}>
              {isBooked ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Card className="bg-[var(--nc-accent-dim)] border border-[var(--nc-accent)]">
                    <CardContent className="p-4 flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-[var(--nc-accent)]" />
                      <div>
                        <p className="text-foreground text-sm font-medium">Request sent!</p>
                        <p className="text-muted-foreground text-xs">Redirecting to live tracking...</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Button
                  onClick={handleBook}
                  disabled={isBooking}
                  className="w-full cursor-pointer h-12 text-base"
                >
                  {isBooking ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Booking...
                    </span>
                  ) : (
                    <><CheckCircle2 size={18} className="mr-2" />Request to Join — ₹{ride.final_cost}</>
                  )}
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
