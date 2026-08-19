import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DriverCard } from '@/components/nocturne/driver-card'
import { SafetyChecklist } from '@/components/nocturne/safety-checklist'
import { FareCounter } from '@/components/nocturne/fare-counter'
import { LiveChip } from '@/components/nocturne/live-indicators'
import { MOCK_DRIVERS } from '@/lib/mock/drivers'
import { calculateFare } from '@/lib/mock/fares'
import { ArrowLeft, MapPin, Navigation, Clock, CreditCard, CheckCircle2 } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
}

export default function NocturneConfirm() {
  const location = useLocation()
  const navigate = useNavigate()
  const route = location.state?.route
  const rideType = location.state?.rideType || 'economy'
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)

  if (!route) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No ride selected</p>
          <Button asChild variant="outline" className="cursor-pointer">
            <Link to="/search"><ArrowLeft size={16} className="mr-2" />Back to Search</Link>
          </Button>
        </div>
      </div>
    )
  }

  const driver = MOCK_DRIVERS.find((d) => d.id === route.driver) || MOCK_DRIVERS[0]
  const fare = calculateFare(route.distance, rideType)
  const serviceFee = Math.round(fare.base * 0.1)
  const total = fare.base + serviceFee

  const handleBook = () => {
    setIsBooking(true)
    setTimeout(() => {
      setIsBooking(false)
      setIsBooked(true)
      setTimeout(() => navigate('/track/demo-ride', { state: { route, rideType, driver } }), 2000)
    }, 1500)
  }

  const departureTime = new Date(route.departureTime)
  const timeStr = departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-6">
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
              {isBooked ? 'Your driver is on the way' : 'Review details before booking'}
            </p>
          </div>
          {isBooked && <LiveChip />}
        </div>

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
                    <text x="40" y="180" fill="var(--nc-600)" fontSize="11" textAnchor="middle">{route.from.label}</text>
                    <text x="360" y="50" fill="var(--nc-600)" fontSize="11" textAnchor="middle">{route.to.label}</text>
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
                      <p className="text-foreground text-sm font-medium">{route.from.label}</p>
                      <p className="text-muted-foreground text-xs">Pickup point</p>
                    </div>
                  </div>
                  <div className="ml-1 w-px h-6 bg-border" />
                  <div className="flex items-center gap-3">
                    <div className="size-2.5 rounded-full bg-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">{route.to.label}</p>
                      <p className="text-muted-foreground text-xs">Drop-off point</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Distance</p>
                      <p className="text-foreground text-sm font-semibold tabular-nums">{route.distance} km</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Duration</p>
                      <p className="text-foreground text-sm font-semibold tabular-nums">{route.duration} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Departure</p>
                      <p className="text-foreground text-sm font-semibold tabular-nums">{timeStr}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
              <SafetyChecklist driver={driver} />
            </motion.div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
              <DriverCard driver={driver} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}>
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <CreditCard size={16} className="text-muted-foreground" />
                    Fare Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base fare</span>
                    <FareCounter value={fare.base} className="text-foreground" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="text-foreground tabular-nums">₹{serviceFee}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-foreground font-semibold">Total</span>
                    <FareCounter value={total} className="text-foreground font-bold text-xl" />
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
                        <p className="text-foreground text-sm font-medium">Booking confirmed!</p>
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
                    <><CheckCircle2 size={18} className="mr-2" />Confirm Booking — ₹{total}</>
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
