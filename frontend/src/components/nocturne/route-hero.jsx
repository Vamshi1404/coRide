import { useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function RouteHero({ className }) {
  const containerRef = useRef(null)
  const pathRef = useRef(null)

  return (
    <div ref={containerRef} className={cn('relative w-full overflow-hidden', className)}>
      <svg
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
        </defs>

        {/* Background path */}
        <path
          d="M 50 150 Q 150 80, 250 120 T 450 90 T 650 110 T 780 70"
          stroke="var(--nc-300)"
          strokeWidth="2"
          strokeDasharray="8 6"
          opacity="0.4"
        />

        {/* Animated drawn path */}
        <motion.path
          ref={pathRef}
          d="M 50 150 Q 150 80, 250 120 T 450 90 T 650 110 T 780 70"
          stroke="url(#routeGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Scroll-driven node */}
        <motion.circle
          r="6"
          fill="var(--nc-accent)"
          opacity="0.9"
          style={{ offsetPath: "path('M 50 150 Q 150 80, 250 120 T 450 90 T 650 110 T 780 70')" }}
        />

        {/* Origin node */}
        <circle cx="50" cy="150" r="5" fill="var(--nc-accent)" opacity="0.8" />
        <motion.circle
          cx="50"
          cy="150"
          r="10"
          fill="var(--nc-accent)"
          opacity="0.15"
          animate={{ r: [10, 18, 10], opacity: [0.15, 0, 0.15] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Destination node */}
        <circle cx="780" cy="70" r="5" fill="var(--nc-500)" opacity="0.6" />

        {/* Milestone dots */}
        {[
          { cx: 250, cy: 120 },
          { cx: 450, cy: 90 },
          { cx: 650, cy: 110 },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="var(--nc-400)" opacity="0.5" />
        ))}
      </svg>

      {/* Particle field */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[var(--nc-700)]"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.06, 0.12, 0.06],
              y: [0, -8, 0],
              x: [0, 3, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  )
}
