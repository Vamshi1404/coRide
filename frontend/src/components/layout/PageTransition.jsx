import { useRef } from 'react'
import { useNavigationType } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'

const TRANSITIONS = {
  PUSH: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  },
  POP: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
  },
  lateral: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -14 },
  },
}

const LATERAL_ROUTES = ['/search', '/offer-ride', '/my-rides', '/dashboard', '/profile']

function isLateral(from, to) {
  return LATERAL_ROUTES.includes(from) && LATERAL_ROUTES.includes(to)
}

export function PageTransition({ children, locationKey }) {
  const reduced = useReducedMotion()
  const navType = useNavigationType()
  const prevPath = useRef(locationKey)

  if (reduced) return <>{children}</>

  const currentPath = locationKey || ''
  const direction = navType === 'POP'
    ? 'POP'
    : isLateral(prevPath.current, currentPath)
      ? 'lateral'
      : 'PUSH'

  prevPath.current = currentPath
  const t = TRANSITIONS[direction]

  return (
    <motion.div
      key={locationKey}
      initial={t.initial}
      animate={t.animate}
      exit={t.exit}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
