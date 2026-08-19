import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function DriverCard({ driver, ETA, className }) {
  const initials = driver.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="relative">
          <Avatar className="size-14">
            <AvatarFallback className="bg-secondary text-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <motion.svg
            className="absolute inset-0 size-14 -rotate-90"
            viewBox="0 0 56 56"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: driver.rating / 5 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <motion.circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="var(--nc-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: driver.rating / 5 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </motion.svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground font-semibold truncate">{driver.name}</h3>
            {driver.verified && (
              <Badge variant="secondary" className="bg-[var(--nc-accent-dim)] text-[var(--nc-accent)] border-0 text-xs shrink-0">
                Verified
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {driver.vehicle.make} {driver.vehicle.model} · {driver.vehicle.color}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <motion.span
              className="text-foreground font-semibold text-sm tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              ★ {driver.rating}
            </motion.span>
            <span className="text-muted-foreground text-xs">({driver.totalRides} rides)</span>
            {ETA != null && (
              <span className="text-[var(--nc-accent)] text-xs font-medium tabular-nums">
                Arriving in {ETA}m
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-muted-foreground text-xs uppercase tracking-wider">Plate</p>
          <p className="text-foreground text-sm font-mono tabular-nums">{driver.vehicle.plate}</p>
        </div>
      </CardContent>
    </Card>
  )
}
