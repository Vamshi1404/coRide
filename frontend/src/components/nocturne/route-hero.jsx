import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/motion/MotionProvider'

// Living route SVG visualization for the hero section.
// Path draws in on load (stroke-dashoffset), a node travels along the
// path with page scroll, and the dash pattern drifts continuously.
export function RouteHero({ className = '' }) {
  const pathRef = useRef(null)
  const [drawProgress, setDrawProgress] = useState(0)
  const [nodeDistance, setNodeDistance] = useState(0)
  const reducedMotion = useReducedMotion()

  // Path drawing animation on load
  useEffect(() => {
    if (reducedMotion) {
      setDrawProgress(1)
      return
    }

    let raf
    let start = null
    const duration = 1200

    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDrawProgress(eased)
      if (progress < 1) raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion])

  // Node travelling along the path via scroll
  useEffect(() => {
    if (reducedMotion) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollY / docHeight : 0
      setNodeDistance(progress * 100)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [reducedMotion])

  // Subtle dash-pattern drift loop after the draw completes
  useEffect(() => {
    if (reducedMotion) return
    let frame
    let offset = 0
    const drift = () => {
      offset += 0.3
      if (pathRef.current) {
        pathRef.current.style.strokeDashoffset = `${-offset}`
      }
      frame = requestAnimationFrame(drift)
    }
    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(drift)
    }, 1200)
    return () => {
      clearTimeout(timeout)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  return (
    <div className={className} style={{ position: 'relative', width: '100%', overflow: 'hidden' }} aria-hidden="true">
      <svg viewBox="0 0 800 200" style={{ width: '100%', height: 'auto' }} fill="none">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-solid)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="var(--accent-solid)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--accent-solid)" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Background dashed route */}
        <path
          ref={pathRef}
          d="M 50 150 Q 150 80, 250 120 T 450 90 T 650 110 T 780 70"
          stroke="var(--border-strong)"
          strokeWidth="2"
          strokeDasharray="8 6"
          opacity="0.4"
        />

        {/* Animated drawn path */}
        <path
          d="M 50 150 Q 150 80, 250 120 T 450 90 T 650 110 T 780 70"
          stroke="url(#routeGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="1200"
          strokeDashoffset={1200 - 1200 * drawProgress}
        />

        {/* Travelling node */}
        {!reducedMotion && (
          <circle r="6" fill="var(--accent-solid)" opacity="0.9">
            <animateMotion
              dur="1ms"
              fill="freeze"
              keyPoints={`${nodeDistance / 100};${nodeDistance / 100}`}
              keyTimes="0;1"
            >
              <mpath href="#travelPath" />
            </animateMotion>
          </circle>
        )}

        {/* Hidden path for animateMotion */}
        <path id="travelPath" d="M 50 150 Q 150 80, 250 120 T 450 90 T 650 110 T 780 70" fill="none" stroke="none" />

        {/* Origin node with pulse */}
        <circle cx="50" cy="150" r="5" fill="var(--accent-solid)" opacity="0.8">
          {!reducedMotion && (
            <>
              <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
            </>
          )}
        </circle>

        {/* Destination node */}
        <circle cx="780" cy="70" r="5" fill="var(--text-muted)" opacity="0.6" />

        {/* Milestone dots */}
        {[250, 450, 650].map((x, i) => (
          <circle key={x} cx={x} cy={[120, 90, 110][i]} r="3" fill="var(--border-strong)" opacity="0.6" />
        ))}
      </svg>
    </div>
  )
}
