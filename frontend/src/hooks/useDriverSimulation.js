import { useCallback, useEffect, useRef, useState } from 'react'
import { getPositionAtTime } from '@/lib/mock/coords'

// Simulates driver movement along mock route for live tracking
export function useDriverSimulation(isActive = true) {
  const [position, setPosition] = useState(null)
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef(null)
  const rafRef = useRef(null)

  const update = useCallback(() => {
    if (!startTimeRef.current) startTimeRef.current = performance.now()
    const elapsed = performance.now() - startTimeRef.current
    const totalDuration = 60000 // 60s full route
    const p = Math.min(elapsed / totalDuration, 1)

    setPosition(getPositionAtTime(elapsed))
    setProgress(p)

    if (p < 1) {
      rafRef.current = requestAnimationFrame(update)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return
    rafRef.current = requestAnimationFrame(update)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isActive, update])

  const reset = useCallback(() => {
    startTimeRef.current = null
    setPosition(null)
    setProgress(0)
  }, [])

  return { position, progress, reset }
}
