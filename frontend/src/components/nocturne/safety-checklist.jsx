import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { Check } from 'lucide-react'

const CHECKLIST_ITEMS = [
  { id: 'license', label: 'Driving License Verified', key: 'licenseVerified' },
  { id: 'background', label: 'Background Check Passed', key: 'backgroundCheck' },
  { id: 'vehicle', label: 'Vehicle Match Confirmed', key: 'vehicleMatch' },
]

export function SafetyChecklist({ driver, className }) {
  const reducedMotion = useReducedMotion()
  const [completedItems, setCompletedItems] = useState([])

  useEffect(() => {
    if (reducedMotion) {
      setCompletedItems(CHECKLIST_ITEMS.filter((item) => driver[item.key]).map((item) => item.id))
      return
    }

    const items = CHECKLIST_ITEMS.filter((item) => driver[item.key])
    items.forEach((item, index) => {
      setTimeout(() => {
        setCompletedItems((prev) => [...prev, item.id])
      }, (index + 1) * 120)
    })
  }, [driver, reducedMotion])

  const progress = (completedItems.length / CHECKLIST_ITEMS.length) * 100

  return (
    <Card className={cn('bg-[var(--nc-200)] border-[var(--nc-300)] border', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-[var(--nc-800)] text-base flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nc-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Safety Verified
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progress} className="h-1.5 bg-[var(--nc-300)]" />
        <ul className="space-y-2.5">
          {CHECKLIST_ITEMS.map((item) => {
            const isComplete = completedItems.includes(item.id)
            return (
              <li
                key={item.id}
                className={cn(
                  'flex items-center gap-3 text-sm transition-opacity duration-300',
                  isComplete ? 'opacity-100' : 'opacity-40'
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center size-5 rounded-full border text-xs transition-all duration-300',
                    isComplete
                      ? 'bg-[var(--nc-900)] border-[var(--nc-900)] text-[var(--nc-0)]'
                      : 'border-[var(--nc-400)] text-transparent'
                  )}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className={cn(isComplete ? 'text-[var(--nc-800)]' : 'text-[var(--nc-500)]')}>
                  {item.label}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
