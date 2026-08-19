import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/motion/MotionProvider'

// Odometer-style digit roll for fare/ETA display
export function FareCounter({ value, prefix = '₹', className }) {
  const reducedMotion = useReducedMotion()
  const [displayDigits, setDisplayDigits] = useState([])
  const prevValueRef = useRef(value)

  useEffect(() => {
    const str = String(Math.round(value))
    const prevStr = String(Math.round(prevValueRef.current))
    prevValueRef.current = value

    if (reducedMotion) {
      setDisplayDigits(str.split('').map((d) => ({ char: d, key: d, animate: false })))
      return
    }

    const padded = str.padStart(Math.max(prevStr.length, str.length), ' ')
    const prevPadded = prevStr.padStart(padded.length, ' ')

    setDisplayDigits(
      padded.split('').map((char, i) => ({
        char,
        key: `${i}-${char}`,
        animate: char !== prevPadded[i],
      }))
    )
  }, [value, reducedMotion])

  return (
    <span className={cn('inline-flex items-baseline tabular-nums font-variant-numeric-tabular-nums', className)}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {displayDigits.map((digit) => (
        <span
          key={digit.key}
          className={cn(
            'inline-block overflow-hidden',
            digit.animate && 'animate-[counterRoll_600ms_cubic-bezier(0.22,1,0.36,1)]'
          )}
        >
          {digit.char}
        </span>
      ))}
    </span>
  )
}
