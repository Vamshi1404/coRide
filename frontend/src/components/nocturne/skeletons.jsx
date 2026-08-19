import { cn } from '@/lib/utils'

// Skeleton loader that mirrors final layout exactly
// with directional shimmer sweep
export function RideCardSkeleton({ className }) {
  return (
    <div className={cn('bg-[var(--nc-200)] border border-[var(--nc-300)] rounded-[20px] p-5 space-y-4', className)}>
      {/* Map preview skeleton */}
      <div className="h-32 rounded-[14px] bg-[var(--nc-300)] animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--nc-300)_0%,var(--nc-400)_50%,var(--nc-300)_100%)]" />

      <div className="space-y-3">
        {/* Route */}
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-[var(--nc-400)]" />
          <div className="h-3 w-24 rounded bg-[var(--nc-300)] animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--nc-300)_0%,var(--nc-400)_50%,var(--nc-300)_100%)]" />
          <div className="h-px flex-1 bg-[var(--nc-300)]" />
          <div className="h-3 w-20 rounded bg-[var(--nc-300)] animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--nc-300)_0%,var(--nc-400)_50%,var(--nc-300)_100%)]" />
          <div className="size-2 rounded-full bg-[var(--nc-400)]" />
        </div>

        {/* Driver info */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[var(--nc-300)] animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--nc-300)_0%,var(--nc-400)_50%,var(--nc-300)_100%)]" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-32 rounded bg-[var(--nc-300)] animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--nc-300)_0%,var(--nc-400)_50%,var(--nc-300)_100%)]" />
            <div className="h-2.5 w-20 rounded bg-[var(--nc-300)] animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--nc-300)_0%,var(--nc-400)_50%,var(--nc-300)_100%)]" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--nc-300)]">
          <div className="h-4 w-16 rounded bg-[var(--nc-300)] animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--nc-300)_0%,var(--nc-400)_50%,var(--nc-300)_100%)]" />
          <div className="h-8 w-24 rounded-[12px] bg-[var(--nc-300)] animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--nc-300)_0%,var(--nc-400)_50%,var(--nc-300)_100%)]" />
        </div>
      </div>
    </div>
  )
}

// Empty state with route-motif animated SVG glyph
export function EmptyState({ message = 'No rides yet', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <svg width="80" height="40" viewBox="0 0 80 40" className="mb-6 opacity-30">
        <path
          d="M 5 35 Q 25 5, 40 20 T 75 10"
          fill="none"
          stroke="var(--nc-500)"
          strokeWidth="1.5"
          strokeDasharray="120"
          strokeDashoffset="120"
          strokeLinecap="round"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="120;0;120"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="75" cy="10" r="3" fill="var(--nc-500)" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
      <p className="text-[var(--nc-500)] text-sm">{message}</p>
    </div>
  )
}
