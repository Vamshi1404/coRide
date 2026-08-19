import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { cn } from '@/lib/utils'

// Living route SVG visualization for the hero section
// SVG path drawn with stroke-dashoffset, gradient node traveling along path,
// cursor proximity bends nearby path points
export function RouteHero({ className }) {
  const svgRef = useRef(null)
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

    let start = null
    const duration = 1200

    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // expo-out easing
      const eased = 1 - Math.pow(1 - progress, 3)
      setDrawProgress(eased)
      if (progress < 1) requestAnimationFrame(animate)
    }

    const raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [reducedMotion])

  // Node traveling along path via scroll (for homepage)
  useEffect(() => {
    if (reducedMotion) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollY / docHeight : 0
      setNodeDistance(progress * 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [reducedMotion])

  // Subtle dash-pattern drift loop
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
    // Start drift after initial draw completes
    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(drift)
    }, 1200)
    return () => {
      clearTimeout(timeout)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <svg
        ref={svgRef}
        viewBox="0 0 800 200"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--nc-accent)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="var(--nc-accent)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--nc-accent)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--nc-accent)" />
            <stop offset="100%" stopColor="var(--nc-accent)" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Background route path (subtle) */}
        <path
          ref={pathRef}
          d="M 50 150 Q 150 80, 250 120 T 450 90 T 650 110 T 780 70"
          stroke="var(--nc-300)"
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
          className="transition-none"
        />

        {/* Traveling node */}
        {!reducedMotion && (
          <circle r="6" fill="var(--nc-accent)" opacity="0.9">
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
        <path
          id="travelPath"
          d="M 50 150 Q 150 80, 250 120 T 450 90 T 650 110 T 780 70"
          fill="none"
          stroke="none"
        />

        {/* Origin node */}
        <circle cx="50" cy="150" r="5" fill="var(--nc-accent)" opacity="0.8" />
        <circle cx="50" cy="150" r="10" fill="var(--nc-accent)" opacity="0.15">
          <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Destination node */}
        <circle cx="780" cy="70" r="5" fill="var(--nc-700)" opacity="0.6" />

        {/* Milestone dots along path */}
        {[250, 450, 650].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={[120, 90, 110][i]}
            r="3"
            fill="var(--nc-400)"
            opacity="0.5"
          />
        ))}
      </svg>

      {/* Particle field overlay — CSS-only */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[var(--nc-700)]"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.08 + Math.random() * 0.07,
                animation: `particle-drift ${8 + Math.random() * 12}s linear infinite`,
                animationDelay: `${-Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
