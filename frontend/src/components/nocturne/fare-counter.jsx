import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function FareCounter({ value, prefix = '₹', className }) {
  const [digits, setDigits] = useState([])

  useEffect(() => {
    const str = String(Math.round(value))
    setDigits(str.split(''))
  }, [value])

  return (
    <span className={cn('inline-flex items-baseline tabular-nums', className)}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <AnimatePresence mode="popLayout">
        {digits.map((char, i) => (
          <motion.span
            key={`${i}-${char}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              mass: 0.8,
              delay: i * 0.03,
            }}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}
