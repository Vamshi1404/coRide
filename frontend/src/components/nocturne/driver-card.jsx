import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useCounter } from '@/hooks/useCounter'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { cn } from '@/lib/utils'

export function DriverCard({ driver, ETA, className }) {
  const reducedMotion = useReducedMotion()
  const ratingValue = useCounter(driver.rating * 100, {
    duration: 600,
    enabled: !reducedMotion,
  })

  const displayRating = (ratingValue / 100).toFixed(driver.rating % 1 === 0 ? 0 : 2)
  const initials = driver.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Card className={cn('bg-[var(--nc-200)] border-[var(--nc-300)] border', className)}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="relative">
          <Avatar className="size-14">
            <AvatarFallback className="bg-[var(--nc-300)] text-[var(--nc-800)] text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {/* Rating ring — SVG circle that draws itself */}
          <svg
            className="absolute inset-0 size-14 -rotate-90"
            viewBox="0 0 56 56"
          >
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="var(--nc-accent)"
              strokeWidth="2"
              strokeDasharray={`${(driver.rating / 5) * 163.36} 163.36`}
              className={cn(
                'transition-all duration-700',
                reducedMotion ? 'opacity-100' : 'animate-[drawRing_700ms_cubic-bezier(0.22,1,0.36,1)_forwards]'
              )}
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[var(--nc-800)] font-semibold truncate">{driver.name}</h3>
            {driver.verified && (
              <Badge variant="secondary" className="bg-[var(--nc-accent-dim)] text-[var(--nc-accent)] border-0 text-xs shrink-0">
                Verified
              </Badge>
            )}
          </div>
          <p className="text-[var(--nc-600)] text-sm mt-0.5">
            {driver.vehicle.make} {driver.vehicle.model} · {driver.vehicle.color}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[var(--nc-800)] font-semibold text-sm tabular-nums">
              ★ {displayRating}
            </span>
            <span className="text-[var(--nc-500)] text-xs">({driver.totalRides} rides)</span>
            {ETA != null && (
              <span className="text-[var(--nc-accent)] text-xs font-medium tabular-nums">
                Arriving in {ETA}m
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[var(--nc-600)] text-xs uppercase tracking-wider">Plate</p>
          <p className="text-[var(--nc-800)] text-sm font-mono tabular-nums">{driver.vehicle.plate}</p>
        </div>
      </CardContent>
    </Card>
  )
}
