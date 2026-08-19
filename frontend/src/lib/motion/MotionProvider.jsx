import { createContext, useContext, useEffect, useState } from 'react'

const MotionContext = createContext({ prefersReducedMotion: false })

export function useReducedMotion() {
  return useContext(MotionContext).prefersReducedMotion
}

export function MotionProvider({ children }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <MotionContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </MotionContext.Provider>
  )
}
