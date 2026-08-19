import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function PulseMarker({ className, size = 16, color = 'var(--nc-accent)' }) {
  return (
    <div className={cn('relative', className)} style={{ width: size * 3, height: size * 3 }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: `2px solid ${color}` }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: color,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

export function ETACountdown({ minutes, seconds, className }) {
  return (
    <div className={cn('flex items-baseline gap-1 tabular-nums', className)}>
      <motion.span
        key={minutes}
        className="text-[var(--nc-accent)] text-3xl font-bold"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {String(minutes).padStart(2, '0')}
      </motion.span>
      <span className="text-muted-foreground text-lg">:</span>
      <span className="text-muted-foreground text-lg">{String(seconds).padStart(2, '0')}</span>
      <span className="text-muted-foreground text-xs ml-1">min</span>
    </div>
  )
}

export function LiveChip({ className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        'bg-[var(--nc-accent-dim)] text-[var(--nc-accent)]',
        className
      )}
    >
      <motion.span
        className="size-1.5 rounded-full bg-[var(--nc-accent)]"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      Live
    </span>
  )
}

export function SurgeChip({ multiplier, className }) {
  if (multiplier <= 1) return null
  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
        'bg-[var(--nc-accent)] text-white',
        className
      )}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {multiplier.toFixed(1)}× surge
    </motion.span>
  )
}
