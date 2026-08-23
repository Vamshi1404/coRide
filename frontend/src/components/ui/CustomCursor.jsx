import { useEffect, useRef, useCallback } from 'react'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const dotPos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const rafId = useRef(null)
  const isHovering = useRef(false)

  const onMove = useCallback((e) => {
    pos.current.x = e.clientX
    pos.current.y = e.clientY
  }, [])

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.body.classList.add('has-custom-cursor')

    const animate = () => {
      const { x, y } = pos.current

      dotPos.current.x += (x - dotPos.current.x) * 0.2
      dotPos.current.y += (y - dotPos.current.y) * 0.2
      ringPos.current.x += (x - ringPos.current.x) * 0.08
      ringPos.current.y += (y - ringPos.current.y) * 0.08

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotPos.current.x - 6}px, ${dotPos.current.y - 6}px)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`
      }
      rafId.current = requestAnimationFrame(animate)
    }
    rafId.current = requestAnimationFrame(animate)

    const onEnter = (e) => {
      const t = e.target
      if (t.closest('a, button, [role="button"], input, textarea, select, .cursor-hover')) {
        isHovering.current = true
        dotRef.current?.classList.add('is-hovering')
        ringRef.current?.classList.add('is-hovering')
      }
    }
    const onLeave = () => {
      isHovering.current = false
      dotRef.current?.classList.remove('is-hovering')
      ringRef.current?.classList.remove('is-hovering')
    }
    const onDown = () => {
      dotRef.current?.classList.add('is-clicking')
      ringRef.current?.classList.add('is-clicking')
    }
    const onUp = () => {
      dotRef.current?.classList.remove('is-clicking')
      ringRef.current?.classList.remove('is-clicking')
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onEnter, { passive: true })
    document.addEventListener('mouseout', onLeave, { passive: true })
    document.addEventListener('mousedown', onDown, { passive: true })
    document.addEventListener('mouseup', onUp, { passive: true })

    return () => {
      document.body.classList.remove('has-custom-cursor')
      cancelAnimationFrame(rafId.current)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter)
      document.removeEventListener('mouseout', onLeave)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
    }
  }, [onMove])

  return (
    <>
      <div ref={dotRef} className="custom-cursor" aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor__ring" aria-hidden="true" />
    </>
  )
}
