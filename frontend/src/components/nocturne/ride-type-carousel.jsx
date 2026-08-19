import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_RIDE_TYPES } from '@/lib/mock/drivers'
import { Leaf, Armchair, Crown } from 'lucide-react'

const ICONS = { leaf: Leaf, armchair: Armchair, crown: Crown }

export function RideTypeCarousel({ selected, onSelect, className }) {
  const [activeIndex, setActiveIndex] = useState(
    MOCK_RIDE_TYPES.findIndex((r) => r.id === selected) || 0
  )

  const handleSelect = (index) => {
    setActiveIndex(index)
    onSelect?.(MOCK_RIDE_TYPES[index].id)
  }

  return (
    <div className={cn('flex gap-4 overflow-x-auto no-scrollbar px-1 py-2', className)}>
      {MOCK_RIDE_TYPES.map((rideType, index) => {
        const Icon = ICONS[rideType.icon] || Leaf
        const isActive = index === activeIndex

        return (
          <motion.div
            key={rideType.id}
            className="shrink-0 w-[200px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Card
              className={cn(
                'cursor-pointer transition-all duration-300',
                isActive
                  ? 'bg-card border-2 border-[var(--nc-accent)] shadow-sm'
                  : 'bg-card border border-[var(--nc-300)] hover:border-[var(--nc-400)] hover:bg-card/80'
              )}
              onClick={() => handleSelect(index)}
            >
              <CardContent className="p-5 text-center space-y-3">
                <motion.div
                  className={cn(
                    'mx-auto size-12 rounded-full flex items-center justify-center',
                    isActive ? 'bg-[var(--nc-accent-dim)]' : 'bg-secondary'
                  )}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Icon
                    size={22}
                    className={cn(
                      'transition-colors duration-300',
                      isActive ? 'text-[var(--nc-accent)]' : 'text-muted-foreground'
                    )}
                  />
                </motion.div>
                <div>
                  <h3 className={cn(
                    'font-semibold text-sm',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {rideType.name}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1">{rideType.description}</p>
                </div>
                {isActive && rideType.multiplier > 1 && (
                  <motion.span
                    className="inline-block text-[var(--nc-accent)] text-xs font-bold"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    {rideType.multiplier}× fare
                  </motion.span>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
