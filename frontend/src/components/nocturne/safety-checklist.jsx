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
    <div className={cn('card', className)}>
      <h3 className="section-head" style={{ color: 'var(--text-strong)', fontSize: 'var(--fs-small)', textTransform: 'none', letterSpacing: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-solid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Safety first
      </h3>

      <ul style={{ listStyle: 'none', padding: 0 }} className="stack stack--gap-md">
        {TIPS.map((item) => {
          const isComplete = completedItems.includes(item.id)
          const Icon = item.icon
          return (
            <li key={item.id} className="row-item" style={{ background: 'transparent', border: 'none', padding: 0, opacity: isComplete ? 1 : 0.4, transition: 'opacity var(--dur-slow) ease' }}>
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  borderRadius: '50%',
                  border: `1px solid ${isComplete ? 'var(--text-strong)' : 'var(--border-strong)'}`,
                  background: isComplete ? 'var(--text-strong)' : 'transparent',
                  color: isComplete ? 'var(--bg-page)' : 'transparent',
                  transition: 'all var(--dur-slow) ease',
                }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              <Icon size={14} aria-hidden="true" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--fs-small)', color: isComplete ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'color var(--dur-slow) ease' }}>
                {item.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
