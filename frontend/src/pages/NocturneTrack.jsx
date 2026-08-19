import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DriverCard } from '@/components/nocturne/driver-card'
import { ETACountdown, LiveChip } from '@/components/nocturne/live-indicators'
import { useDriverSimulation } from '@/hooks/useDriverSimulation'
import { MOCK_DRIVERS } from '@/lib/mock/drivers'
import { cn } from '@/lib/utils'
import { ArrowLeft, Phone, MessageCircle, Shield } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
}

function TrackingMap({ progress }) {
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
          <text x="60" y="262" fill="var(--nc-600)" fontSize="10" textAnchor="middle">Pickup</text>
          <circle cx="540" cy="100" r="8" fill="var(--nc-500)" opacity="0.2" />
          <circle cx="540" cy="100" r="4" fill="var(--nc-500)" />
          <text x="540" y="88" fill="var(--nc-600)" fontSize="10" textAnchor="middle">Drop-off</text>
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
  const route = location.state?.route
  const driverData = location.state?.driver
  const driver = driverData || MOCK_DRIVERS[0]
  const { progress } = useDriverSimulation(true)
  const [eta, setEta] = useState({ minutes: 8, seconds: 30 })

  useEffect(() => {
    if (progress >= 1) return
    const interval = setInterval(() => {
      setEta((prev) => {
        if (prev.minutes === 0 && prev.seconds === 0) return prev
        if (prev.seconds === 0) return { minutes: prev.minutes - 1, seconds: 59 }
        return { ...prev, seconds: prev.seconds - 1 }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [progress])

  const fromLabel = route?.from?.label || 'Gachibowli'
  const toLabel = route?.to?.label || 'HITEC City'

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors">
          <ArrowLeft size={14} />Back to search
        </Link>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Live Tracking</h1>
            <p className="text-muted-foreground text-sm">{fromLabel} to {toLabel}</p>
          </div>
          <LiveChip />
        </div>

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Driver is {Math.round(progress * 100)}% of the way. ETA: {eta.minutes} minutes.
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            <motion.div {...fadeUp}>
              <TrackingMap progress={progress} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Route progress</span>
                    <span className="text-foreground font-semibold tabular-nums">{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--nc-accent)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-base">Journey</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TimelineStep label="Ride started" time="Just now" completed={progress > 0} active={progress === 0} />
                  <TimelineStep label="En route" time={`${Math.round(progress * 100)}% complete`} active={progress > 0 && progress < 1} completed={progress >= 1} />
                  <TimelineStep label="Arrived at destination" time={progress >= 1 ? 'Arrived' : 'Pending'} completed={progress >= 1} active={false} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <Card className="bg-card border-border">
                <CardContent className="p-5 text-center space-y-2">
                  <p className="text-muted-foreground text-sm">Arriving in</p>
                  <ETACountdown minutes={eta.minutes} seconds={eta.seconds} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
              <DriverCard driver={driver} ETA={eta.minutes} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="space-y-2">
              <Button className="w-full cursor-pointer" size="lg">
                <Phone size={16} className="mr-2" />Call Driver
              </Button>
              <Button variant="outline" className="w-full cursor-pointer">
                <MessageCircle size={16} className="mr-2" />Message
              </Button>
              <Button variant="ghost" className="w-full cursor-pointer text-muted-foreground">
                <Shield size={16} className="mr-2" />Safety
              </Button>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.25 }}>
              <Card className="bg-secondary/50 border-border">
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Share your trip status with a trusted contact. Your live location and ETA will be sent automatically.
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
