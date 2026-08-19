import { useEffect, useRef, useState } from 'react'

// Interpolates a number from `from` to `to` using spring-like easing
export function useCounter(to, { duration = 600, enabled = true } = {}) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setValue(to)
      return
    }

    fromRef.current = value
    startRef.current = null

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)

      // expo-out easing: cubic-bezier(0.16, 1, 0.3, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = fromRef.current + (to - fromRef.current) * eased

      setValue(Math.round(current * 100) / 100)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [to, duration, enabled])

  return value
}
