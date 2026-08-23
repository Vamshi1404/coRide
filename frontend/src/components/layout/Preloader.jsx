import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsapSetup'
import { Navigation } from 'lucide-react'

export function Preloader({ onDone }) {
  const rootRef = useRef(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      finish()
      return undefined
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => window.setTimeout(finish, 250),
      })

      tl.from('.preloader__mark', { scale: 0.6, autoAlpha: 0, duration: 0.6 })
        .from(
          '.preloader__route path',
          { strokeDashoffset: 320, duration: 0.9, ease: 'power2.inOut' },
          '-=0.25'
        )
        .from(
          '.preloader__letter',
          { autoAlpha: 0, y: 18, duration: 0.5, stagger: 0.05 },
          '-=0.45'
        )
        .to(rootRef.current, {
          autoAlpha: 0,
          duration: 0.45,
          ease: 'power2.inOut',
        }, '+=0.15')
    }, rootRef)

    return () => ctx.revert()
  }, [])

  function finish() {
    sessionStorage.setItem('coride_booted', '1')
    setGone(true)
    onDone?.()
  }

  if (gone) return null

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="preloader__stage">
        <svg
          className="preloader__route"
          viewBox="0 0 220 44"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 38 C 50 38, 60 8, 110 8 S 170 36, 216 34"
            strokeDasharray="320"
          />
          <circle cx="4" cy="38" r="4" fill="var(--text-strong)" />
          <circle cx="216" cy="34" r="4" fill="var(--accent-solid)" />
        </svg>

        <div className="preloader__mark">
          <Navigation size={26} aria-hidden="true" />
        </div>

        <div className="preloader__word">
          {'CoRide'.split('').map((ch, i) => (
            <span key={i} className="preloader__letter">{ch}</span>
          ))}
        </div>

        <span className="preloader__tagline">Ride together · Move smarter</span>
      </div>
    </div>
  )
}

export function shouldShowPreloader() {
  try {
    return sessionStorage.getItem('coride_booted') !== '1'
  } catch {
    return true
  }
}
