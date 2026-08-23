import { useRef, useEffect, useState } from 'react'

/**
 * useScrollReveal — IntersectionObserver-driven reveal hook.
 * Returns [ref, isVisible]. Element fades/slides in when it enters viewport.
 */
export function useScrollReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, isVisible]
}

/**
 * useParallax — returns a ref and a progress value (0-1) as element scrolls through viewport.
 * progress 0 = element just entered bottom, 1 = element just exited top.
 */
export function useParallax(speed = 0.3) {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = (vh - rect.top) / (vh + rect.height)
      setOffset((progress - 0.5) * speed * rect.height)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [speed])

  return [ref, offset]
}

/**
 * useMouseParallax — track mouse position for parallax effects on hover.
 */
export function useMouseParallax(strength = 0.02) {
  const ref = useRef(null)
  const [transform, setTransform] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      setTransform({ x: dx, y: dy })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [strength])

  return [ref, transform]
}

/**
 * useScrollProgress — returns a ref and a 0-1 value representing how far the element has scrolled.
 */
export function useScrollProgress() {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1)
      setProgress(p)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return [ref, progress]
}

/**
 * useScrollDirection — returns 'up' or 'down' based on scroll direction.
 */
export function useScrollDirection() {
  const [dir, setDir] = useState('down')
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setDir(y > lastY.current ? 'down' : 'up')
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return dir
}
