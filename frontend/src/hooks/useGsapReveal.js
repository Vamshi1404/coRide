import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsapSetup'

export default function useGsapReveal({ selector = '.gsap-reveal', y = 24 } = {}) {
  const containerRef = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(containerRef.current.querySelectorAll(selector), { clearProps: 'all' })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const els = containerRef.current.querySelectorAll(selector)
      if (!els.length) return

      els.forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        })
      })
    })

    return () => mm.revert()
  }, { scope: containerRef })

  return containerRef
}
