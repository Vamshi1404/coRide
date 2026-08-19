import { useState, useEffect, useCallback } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LiveChip } from '@/components/nocturne/live-indicators'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ArrowLeft, Phone, MessageCircle, Shield, MapPin, Navigation } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
}

const STATUS_LABELS = {
  open: 'Waiting for driver',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function TrackingMap({ ride }) {
  const progress = ride.status === 'completed' ? 1 : ride.status === 'in_progress' ? 0.6 : 0.1
  const markerX = 60 + progress * 480
  const markerY = 240 - progress * 140 + Math.sin(progress * Math.PI * 2) * 20

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="h-72 bg-secondary relative">
        <svg viewBox="0 0 600 300" className="w-full h-full" fill="none">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={`h${i}`} x1="0" y1={i * 60} x2="600" y2={i * 60} stroke="var(--nc-300)" strokeWidth="0.5" opacity="0.3" />
          ))}
          <path d="M 60 240 Q 150 180, 240 200 T 420 160 T 540 100" stroke="var(--nc-400)" strokeWidth="3" strokeLinecap="round" strokeDasharray="800" strokeDashoffset={800 - 800 * progress} />
          <path d="M 60 240 Q 150 180, 240 200 T 420 160 T 540 100" stroke="var(--nc-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <circle cx="60" cy="240" r="8" fill="var(--nc-accent)" opacity="0.2" />
          <circle cx="60" cy="240" r="4" fill="var(--nc-accent)" />
          <text x="60" y="262" fill="var(--nc-600)" fontSize="10" textAnchor="middle">{ride.from_city}</text>
          <circle cx="540" cy="100" r="8" fill="var(--nc-500)" opacity="0.2" />
          <circle cx="540" cy="100" r="4" fill="var(--nc-500)" />
          <text x="540" y="88" fill="var(--nc-600)" fontSize="10" textAnchor="middle">{ride.to_city}</text>
          <motion.g>
            <motion.circle cx={markerX} cy={markerY} r="16" fill="none" stroke="var(--nc-accent)" strokeWidth="2"
              animate={{ r: [8, 20, 8], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <circle cx={markerX} cy={markerY} r="6" fill="var(--nc-accent)" />
          </motion.g>
        </svg>
      </div>
    </Card>
  )
}

function TimelineStep({ label, time, active, completed }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500',
        active ? 'bg-[var(--nc-accent)] text-white' :
        completed ? 'bg-primary text-primary-foreground' :
        'bg-secondary text-muted-foreground'
      )}>
        {completed ? '\u2713' : active ? '\u25CF' : '\u25CB'}
      </div>
      <div className="flex-1">
        <p className={cn('text-sm font-medium', active ? 'text-foreground' : completed ? 'text-foreground' : 'text-muted-foreground')}>
          {label}
        </p>
        {time && <p className="text-muted-foreground text-xs tabular-nums">{time}</p>}
      </div>
    </div>
  )
}

export default function NocturneTrack() {
  const location = useLocation()
  const { rideId } = useParams()
  const initialRide = location.state?.ride
  const [ride, setRide] = useState(initialRide)
  const [loading, setLoading] = useState(!initialRide)

  const fetchRide = useCallback(async () => {
    try {
      const data = await api.get(`/api/rides/${rideId}`)
      setRide(data)
    } catch {
      // keep existing state
    } finally {
      setLoading(false)
    }
  }, [rideId])

  useEffect(() => {
    if (!initialRide) fetchRide()
  }, [initialRide, fetchRide])

  useEffect(() => {
    if (!ride || ride.status === 'completed' || ride.status === 'cancelled') return
    const interval = setInterval(fetchRide, 5000)
    return () => clearInterval(interval)
  }, [ride, fetchRide])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 px-6 flex items-center justify-center">
        <span className="size-6 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Ride not found</p>
          <Button asChild variant="outline" className="cursor-pointer">
            <Link to="/search"><ArrowLeft size={16} className="mr-2" />Back to Search</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isActive = ride.status === 'in_progress'
  const isCompleted = ride.status === 'completed'
  const isCancelled = ride.status === 'cancelled'

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors">
          <ArrowLeft size={14} />Back to search
        </Link>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              {isCompleted ? 'Ride Complete' : isCancelled ? 'Ride Cancelled' : 'Live Tracking'}
            </h1>
            <p className="text-muted-foreground text-sm">{ride.from_city} to {ride.to_city}</p>
          </div>
          {(isActive || ride.status === 'open') && <LiveChip />}
        </div>

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Ride status: {STATUS_LABELS[ride.status] || ride.status}
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            <motion.div {...fadeUp}>
              <TrackingMap ride={ride} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={cn(
                      'text-sm font-semibold',
                      isActive ? 'text-[var(--nc-accent)]' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {STATUS_LABELS[ride.status] || ride.status}
                    </span>
                  </div>
                  {ride.status === 'in_progress' && (
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[var(--nc-accent)] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base">Journey</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TimelineStep label="Ride requested" completed active={ride.status === 'open'} />
                  <TimelineStep label="Driver assigned" completed={isActive || isCompleted} active={false} />
                  <TimelineStep label="In progress" completed={isCompleted} active={isActive} time={isActive ? 'En route' : undefined} />
                  <TimelineStep label="Arrived" completed={isCompleted} active={false} time={isCompleted ? 'Completed' : 'Pending'} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
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
                  {ride.driver_phone && (
                    <p className="text-muted-foreground text-xs">{ride.driver_phone}</p>
                  )}
                  {ride.vehicle_plate && (
                    <p className="text-foreground text-xs font-mono">{ride.vehicle_plate}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="space-y-2">
              {ride.driver_phone && (
                <a href={`tel:${ride.driver_phone}`} className="block">
                  <Button className="w-full cursor-pointer" size="lg">
                    <Phone size={16} className="mr-2" />Call Driver
                  </Button>
                </a>
              )}
              <Button variant="outline" className="w-full cursor-pointer" asChild>
                <Link to="/chats">
                  <MessageCircle size={16} className="mr-2" />Message
                </Link>
              </Button>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}>
              <Card className="bg-secondary/50 border-border">
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Share your trip status with a trusted contact. Your live location will be sent automatically.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
