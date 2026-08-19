import { useCallback, useRef, useState } from 'react'
import { spring } from '@/lib/motion/tokens'

export function useMagnetic(radius = 60, maxDisplacement = 8) {
  const ref = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < radius) {
        const strength = 1 - distance / radius
        setOffset({
          x: (dx / distance) * maxDisplacement * strength,
          y: (dy / distance) * maxDisplacement * strength,
        })
      } else {
        setOffset({ x: 0, y: 0 })
      }
    },
    [radius, maxDisplacement]
  )

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setOffset({ x: 0, y: 0 })
  }, [])

  return {
    ref,
    offset,
    isHovered,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    style: {
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      transition: `transform ${spring.magnetic.stiffness}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    },
    labelStyle: {
      transform: `translate(${offset.x * 0.4}px, ${offset.y * 0.4}px)`,
      transition: `transform ${spring.magnetic.stiffness}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    },
  }
}
