import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function RideCardSkeleton({ className }) {
  return (
    <div className={cn('bg-card border border-border rounded-[20px] p-5 space-y-4', className)}>
      <Skeleton className="h-32 w-full rounded-[14px]" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="size-2 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-24 rounded-[12px]" />
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ message = 'No rides yet', className }) {
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center py-16 text-center', className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.svg
        width="80"
        height="40"
        viewBox="0 0 80 40"
        className="mb-6 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.3 }}
      >
        <motion.path
          d="M 5 35 Q 25 5, 40 20 T 75 10"
          fill="none"
          stroke="var(--nc-500)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <circle cx="75" cy="10" r="3" fill="var(--nc-500)" opacity="0.6" />
      </motion.svg>
      <p className="text-muted-foreground text-sm">{message}</p>
    </motion.div>
  )
}
