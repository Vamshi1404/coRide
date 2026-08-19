import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_RIDE_TYPES } from '@/lib/mock/drivers'
import { Leaf, Armchair, Crown } from 'lucide-react'

const ICONS = { leaf: Leaf, armchair: Armchair, crown: Crown }

export function RideTypeCarousel({ selected, onSelect, className }) {
  const scrollRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(
    MOCK_RIDE_TYPES.findIndex((r) => r.id === selected) || 0
  )
  const [dragStart, setDragStart] = useState(null)
  const [tilt, setTilt] = useState(0)

  const handleDragStart = useCallback((e) => {
    setDragStart(e.clientX || e.touches?.[0]?.clientX)
  }, [])

  const handleDragEnd = useCallback(
    (e) => {
      if (dragStart === null) return
      const endX = e.clientX || e.changedTouches?.[0]?.clientX
      const delta = endX - dragStart

      if (Math.abs(delta) > 50) {
        const newIndex = delta > 0
          ? Math.max(0, activeIndex - 1)
          : Math.min(MOCK_RIDE_TYPES.length - 1, activeIndex + 1)
        setActiveIndex(newIndex)
        onSelect?.(MOCK_RIDE_TYPES[newIndex].id)
      }
      setDragStart(null)
      setTilt(0)
    },
    [dragStart, activeIndex, onSelect]
  )

  const handleDragMove = useCallback((e) => {
    if (dragStart === null) return
    const currentX = e.clientX || e.touches?.[0]?.clientX
    const delta = currentX - dragStart
    setTilt(Math.max(-4, Math.min(4, delta * 0.05)))
  }, [dragStart])

  useEffect(() => {
    if (!scrollRef.current) return
    const card = scrollRef.current.children[activeIndex]
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeIndex])

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide px-4 -mx-4"
        style={{ scrollSnapType: 'x mandatory' }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {MOCK_RIDE_TYPES.map((rideType, index) => {
          const Icon = ICONS[rideType.icon] || Leaf
          const isActive = index === activeIndex

          return (
            <Card
              key={rideType.id}
              className={cn(
                'snap-center shrink-0 w-[200px] cursor-pointer transition-all duration-300',
                isActive
                  ? 'bg-[var(--nc-200)] border-[var(--nc-accent)] border-2 scale-105'
                  : 'bg-[var(--nc-100)] border-[var(--nc-300)] border opacity-60 scale-95',
                'hover:opacity-100'
              )}
              style={{
                transform: isActive
                  ? `scale(1.05) rotateY(${tilt}deg)`
                  : 'scale(0.95) rotateY(0deg)',
                transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onClick={() => {
                setActiveIndex(index)
                onSelect?.(rideType.id)
              }}
            >
              <CardContent className="p-5 text-center space-y-3">
                <div
                  className={cn(
                    'mx-auto size-12 rounded-full flex items-center justify-center transition-colors duration-300',
                    isActive ? 'bg-[var(--nc-accent-dim)]' : 'bg-[var(--nc-300)]'
                  )}
                >
                  <Icon
                    size={22}
                    className={cn(
                      'transition-colors duration-300',
                      isActive ? 'text-[var(--nc-accent)]' : 'text-[var(--nc-500)]'
                    )}
                  />
                </div>
                <div>
                  <h3 className={cn(
                    'font-semibold text-sm transition-colors duration-300',
                    isActive ? 'text-[var(--nc-900)]' : 'text-[var(--nc-600)]'
                  )}>
                    {rideType.name}
                  </h3>
                  <p className="text-[var(--nc-500)] text-xs mt-1">{rideType.description}</p>
                </div>
                {isActive && rideType.multiplier > 1 && (
                  <span className="inline-block text-[var(--nc-accent)] text-xs font-bold">
                    {rideType.multiplier}× fare
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
