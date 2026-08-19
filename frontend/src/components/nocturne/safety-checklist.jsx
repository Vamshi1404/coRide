import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const CHECKLIST_ITEMS = [
  { id: 'license', label: 'Driving License Verified', key: 'licenseVerified' },
  { id: 'background', label: 'Background Check Passed', key: 'backgroundCheck' },
  { id: 'vehicle', label: 'Vehicle Match Confirmed', key: 'vehicleMatch' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
}

export function SafetyChecklist({ driver, className }) {
  const completedItems = CHECKLIST_ITEMS.filter((item) => driver[item.key])
  const progress = (completedItems.length / CHECKLIST_ITEMS.length) * 100

  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground text-base flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nc-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Safety Verified
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <motion.div
          className="h-1.5 bg-secondary rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-foreground rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </motion.div>

        <motion.ul
          className="space-y-2.5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {CHECKLIST_ITEMS.map((item) => {
            const isComplete = completedItems.includes(item.id)
            return (
              <motion.li
                key={item.id}
                variants={itemVariants}
                className="flex items-center gap-3 text-sm"
              >
                <motion.span
                  className={cn(
                    'flex items-center justify-center size-5 rounded-full border text-xs',
                    isComplete
                      ? 'bg-foreground border-foreground text-background'
                      : 'border-border text-transparent'
                  )}
                  animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Check size={12} strokeWidth={3} />
                </motion.span>
                <span className={cn(isComplete ? 'text-foreground' : 'text-muted-foreground')}>
                  {item.label}
                </span>
              </motion.li>
            )
          })}
        </motion.ul>
      </CardContent>
    </Card>
  )
}
