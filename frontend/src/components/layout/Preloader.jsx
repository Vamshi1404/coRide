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

    const ctx = gsap.context((self) => {
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => window.setTimeout(finish, 250),
      })

      tl.from('.preloader-mark', { scale: 0.6, autoAlpha: 0, duration: 0.6 })
        .from(
          '.preloader-route',
          { strokeDashoffset: 320, duration: 0.9, ease: 'power2.inOut' },
          '-=0.25'
        )
        .from(
          '.preloader-word',
          { autoAlpha: 0, y: 18, duration: 0.5, stagger: 0.05 },
          '-=0.45'
        )
        .to(rootRef.current, {
          autoAlpha: 0,
          duration: 0.45,
          ease: 'power2.inOut',
        }, '+=0.15')

      self.vars.tl = tl
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
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--nc-50)]"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="preloader-mark size-12 rounded-[14px] bg-[var(--nc-900)] flex items-center justify-center">
          <Navigation size={22} className="text-[var(--nc-accent)]" />
        </div>
        <svg width="120" height="48" viewBox="0 0 120 48" fill="none" className="overflow-visible">
          <path
            className="preloader-route"
            d="M4 40 C 30 40, 34 10, 60 10 S 92 38, 116 38"
            stroke="var(--nc-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="320"
          />
          <circle cx="4" cy="40" r="4" fill="var(--nc-900)" />
          <circle cx="116" cy="38" r="4" fill="var(--nc-accent)" />
        </svg>
      </div>
      <div className="mt-8 flex gap-[3px] text-2xl font-bold tracking-tight text-[var(--nc-900)]">
        {'CoRide'.split('').map((ch, i) => (
          <span key={i} className={`preloader-word inline-block ${ch === 'i' ? '' : ''}`}>
            {ch}
          </span>
        ))}
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
