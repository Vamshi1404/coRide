// NOCTURNE Motion Tokens — §1.4 Spring Physics Config
// Every interactive element pulls from this table.
// No bespoke easing anywhere else in the codebase.

export const spring = {
  // Button press, toggle, checkbox
  snappy: { type: 'spring', stiffness: 500, damping: 30, mass: 0.8 },
  // Cursor-following CTA displacement
  magnetic: { type: 'spring', stiffness: 150, damping: 15, mass: 0.5 },
  // Bottom sheet open/drag-close
  sheet: { type: 'spring', stiffness: 300, damping: 32, mass: 1 },
  // Shared-element screen transitions
  morph: { type: 'spring', stiffness: 260, damping: 28, mass: 1 },
  // Driver pin interpolation on map (deliberately soft — mimics vehicle inertia)
  marker: { type: 'spring', stiffness: 80, damping: 20, mass: 1.2 },
}

// Duration-based, not spring — for fare/ETA number roll
export const counterEasing = 'cubic-bezier(0.22, 1, 0.36, 1)'
export const counterDuration = (digitDelta) => 400 + Math.min(digitDelta * 50, 500)

// Scroll-triggered section entrance
export const revealEasing = 'cubic-bezier(0.16, 1, 0.3, 1)' // expo-out
export const revealDuration = 700
export const revealStagger = 60 // ms per child

// Reduced motion fallbacks
export const reducedMotion = {
  duration: 150,
  ease: 'linear',
  spring: { type: 'spring', stiffness: 999, damping: 1, mass: 0 },
}

// Page transition (cross-fade)
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
}
