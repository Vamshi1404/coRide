import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DriverCard } from '@/components/nocturne/driver-card'
import { ETACountdown, LiveChip } from '@/components/nocturne/live-indicators'
import { useDriverSimulation } from '@/hooks/useDriverSimulation'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { MOCK_DRIVERS } from '@/lib/mock/drivers'
import { cn } from '@/lib/utils'
import { ArrowLeft, Phone, MessageCircle, Shield } from 'lucide-react'

function TrackingMap({ progress }) {
  const markerX = 60 + progress * 480
  const markerY = 240 - progress * 140 + Math.sin(progress * Math.PI * 2) * 20

  return (
    <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border overflow-hidden">
      <div className="h-72 bg-[var(--nc-100)] relative">
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
          <circle cx={markerX} cy={markerY} r="16" fill="none" stroke="var(--nc-accent)" strokeWidth="2" opacity="0.3">
            <animate attributeName="r" values="8;20;8" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={markerX} cy={markerY} r="6" fill="var(--nc-accent)" />
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
        completed ? 'bg-[var(--nc-900)] text-[var(--nc-0)]' :
        'bg-[var(--nc-300)] text-[var(--nc-500)]'
      )}>
        {completed ? '\u2713' : active ? '\u25CF' : '\u25CB'}
      </div>
      <div className="flex-1">
        <p className={cn('text-sm font-medium', active ? 'text-[var(--nc-900)]' : completed ? 'text-[var(--nc-700)]' : 'text-[var(--nc-500)]')}>
          {label}
        </p>
        {time && <p className="text-[var(--nc-500)] text-xs tabular-nums">{time}</p>}
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
  const [ref, isVisible] = useScrollReveal()

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
    <div className="min-h-screen bg-[var(--nc-50)] pt-20 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/search" className="inline-flex items-center gap-2 text-[var(--nc-500)] text-sm hover:text-[var(--nc-800)] transition-colors">
          <ArrowLeft size={14} />Back to search
        </Link>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[var(--nc-900)] text-2xl font-bold tracking-tight">Live Tracking</h1>
            <p className="text-[var(--nc-500)] text-sm">{fromLabel} to {toLabel}</p>
          </div>
          <LiveChip />
        </div>

        {/* Visually hidden live region for screen readers */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Driver is {Math.round(progress * 100)}% of the way. ETA: {eta.minutes} minutes.
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            <TrackingMap progress={progress} />

            {/* Progress */}
            <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--nc-600)]">Route progress</span>
                  <span className="text-[var(--nc-800)] font-semibold tabular-nums">{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-1.5 bg-[var(--nc-300)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--nc-accent)] rounded-full transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Journey Timeline */}
            <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
              <CardHeader className="pb-3">
                <CardTitle className="text-[var(--nc-800)] text-base">Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TimelineStep label="Ride started" time="Just now" completed={progress > 0} active={progress === 0} />
                <TimelineStep label="En route" time={`${Math.round(progress * 100)}% complete`} active={progress > 0 && progress < 1} completed={progress >= 1} />
                <TimelineStep label="Arrived at destination" time={progress >= 1 ? 'Arrived' : 'Pending'} completed={progress >= 1} active={false} />
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div ref={ref} className={cn('md:col-span-2 space-y-4', 'nc-section-reveal', isVisible && 'visible')}>
            {/* ETA */}
            <div className="nc-stagger-child">
              <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
                <CardContent className="p-5 text-center space-y-2">
                  <p className="text-[var(--nc-500)] text-sm">Arriving in</p>
                  <ETACountdown minutes={eta.minutes} seconds={eta.seconds} />
                </CardContent>
              </Card>
            </div>

            {/* Driver */}
            <div className="nc-stagger-child">
              <DriverCard driver={driver} ETA={eta.minutes} />
            </div>

            {/* Actions */}
            <div className="nc-stagger-child space-y-2">
              <Button className="w-full bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-800)] cursor-pointer" size="lg">
                <Phone size={16} className="mr-2" />
                Call Driver
              </Button>
              <Button variant="outline" className="w-full border-[var(--nc-400)] text-[var(--nc-600)] cursor-pointer">
                <MessageCircle size={16} className="mr-2" />
                Message
              </Button>
              <Button variant="ghost" className="w-full text-[var(--nc-500)] cursor-pointer">
                <Shield size={16} className="mr-2" />
                Safety
              </Button>
            </div>

            {/* Safety tip */}
            <div className="nc-stagger-child">
              <Card className="bg-[var(--nc-100)] border-[var(--nc-300)] border">
                <CardContent className="p-4">
                  <p className="text-[var(--nc-500)] text-xs leading-relaxed">
                    Share your trip status with a trusted contact. Your live location and ETA will be sent automatically.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
