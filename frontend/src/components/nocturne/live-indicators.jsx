import { cn } from '@/lib/utils'

// Pulsing marker for live ride tracking
// Two-layer pulse: inner solid dot + outer ring scaling
export function PulseMarker({ className, size = 16, color = 'var(--nc-accent)' }) {
  return (
    <div className={cn('relative', className)} style={{ width: size * 3, height: size * 3 }}>
      {/* Outer ring pulse */}
      <div
        className="absolute inset-0 rounded-full animate-[pulseRing_1.8s_ease-out_infinite]"
        style={{
          border: `2px solid ${color}`,
          opacity: 0.6,
          willChange: 'transform, opacity',
        }}
      />
      {/* Inner solid dot */}
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

// ETA countdown display with tabular numerals
export function ETACountdown({ minutes, seconds, className }) {
  return (
    <div className={cn('flex items-baseline gap-1 tabular-nums font-variant-numeric-tabular-nums', className)}>
      <span className="text-[var(--nc-accent)] text-3xl font-bold">{String(minutes).padStart(2, '0')}</span>
      <span className="text-[var(--nc-500)] text-lg">:</span>
      <span className="text-[var(--nc-600)] text-lg">{String(seconds).padStart(2, '0')}</span>
      <span className="text-[var(--nc-500)] text-xs ml-1">min</span>
    </div>
  )
}

// Live tracking status chip
export function LiveChip({ className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        'bg-[var(--nc-accent-dim)] text-[var(--nc-accent)]',
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-[var(--nc-accent)] animate-[livePulse_1.5s_ease-in-out_infinite]" />
      Live
    </span>
  )
}

// Surge multiplier chip
export function SurgeChip({ multiplier, className }) {
  if (multiplier <= 1) return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold',
        'bg-[var(--nc-accent)] text-white',
        'animate-[surgePop_300ms_cubic-bezier(0.22,1,0.36,1)]',
        className
      )}
    >
      {multiplier.toFixed(1)}× surge
    </span>
  )
}
