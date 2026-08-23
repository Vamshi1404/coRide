import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/motion/MotionProvider'

// Odometer-style digit roll for fare/ETA display (components.css §20)
export function FareCounter({ value, prefix = '₹', className = '' }) {
  const reducedMotion = useReducedMotion()
  const [displayDigits, setDisplayDigits] = useState([])
  const prevValueRef = useRef(value)

  useEffect(() => {
    const str = String(Math.round(value))
    const prevStr = String(Math.round(prevValueRef.current))
    prevValueRef.current = value

    if (reducedMotion) {
      setDisplayDigits(str.split('').map((d, i) => ({ char: d, key: `${i}-${d}`, animate: false })))
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
    <span className={`counter-digits${className ? ` ${className}` : ''}`}>
      {prefix && <span style={{ marginRight: 2 }}>{prefix}</span>}
      {displayDigits.map((digit) => (
        <span key={digit.key} className={digit.animate ? 'is-rolling' : undefined}>
          {digit.char}
        </span>
      ))}
    </span>
  )
}
