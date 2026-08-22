import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { Check, MessageCircle, Star, MapPinned } from 'lucide-react'
import { useEffect, useState } from 'react'

const TIPS = [
  { id: 'chat', label: 'Chat in-app to coordinate pickup', icon: MessageCircle },
  { id: 'rate', label: 'Rate your driver after the ride', icon: Star },
  { id: 'track', label: 'Share live tracking with family', icon: MapPinned },
]

export function SafetyChecklist({ className }) {
  const reducedMotion = useReducedMotion()
  const [completedItems, setCompletedItems] = useState([])

  useEffect(() => {
    if (reducedMotion) {
      setCompletedItems(TIPS.map((item) => item.id))
      return
    }

    let cancelled = false
    const timers = TIPS.map((item, index) =>
      setTimeout(() => {
        if (!cancelled) {
          setCompletedItems((prev) => [...prev, item.id])
        }
      }, (index + 1) * 120)
    )
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [reducedMotion])

  return (
    <Card className={cn('bg-[var(--nc-200)] border-[var(--nc-300)] border', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-[var(--nc-800)] text-base flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nc-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Safety first
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <ul className="space-y-2.5">
          {TIPS.map((item) => {
            const isComplete = completedItems.includes(item.id)
            const Icon = item.icon
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
                    'flex items-center justify-center size-5 rounded-full border text-xs transition-all duration-300 shrink-0',
                    isComplete
                      ? 'bg-[var(--nc-900)] border-[var(--nc-900)] text-[var(--nc-0)]'
                      : 'border-[var(--nc-400)] text-transparent'
                  )}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <Icon size={14} className="text-[var(--nc-500)] shrink-0" />
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
