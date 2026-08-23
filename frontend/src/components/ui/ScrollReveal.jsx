import { useRef, useEffect, useState } from 'react'

/**
 * ScrollReveal — wrapper that reveals children with a specified animation
 * when they enter the viewport.
 */
export function ScrollReveal({
  children,
  animation = 'reveal-up',
  delay = 0,
  threshold = 0.15,
  className = '',
  as: Tag = 'div',
  ...props
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <Tag
      ref={ref}
      className={`${animation} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  )
}

/**
 * StaggerReveal — reveals a group of children with staggered delays.
 */
export function StaggerReveal({
  children,
  animation = 'reveal-up',
  stagger = 80,
  threshold = 0.1,
  className = '',
  as: Tag = 'div',
  ...props
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <Tag
      ref={ref}
      className={`stagger-children ${animation} ${visible ? 'is-visible' : ''} ${className}`}
      {...props}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div key={i} style={{ transitionDelay: `${i * stagger}ms` }}>
              {child}
            </div>
          ))
        : children}
    </Tag>
  )
}

/**
 * CountUp — animates a number from 0 to target when visible.
 */
export function CountUp({ target, duration = 1500, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); observer.unobserve(el) } },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const start = performance.now()
    const numTarget = typeof target === 'string' ? parseFloat(target) : target

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 4) // power4.out
      setValue(Math.round(ease * numTarget))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{typeof target === 'string' && !isNaN(parseFloat(target)) ? value.toLocaleString() : target}{suffix}
    </span>
  )
}

/**
 * MagneticWrapper — wraps children with a magnetic hover effect.
 */
export function MagneticWrapper({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      el.style.transform = `translate(${dx}px, ${dy}px)`
    }

    const onLeave = () => {
      el.style.transform = 'translate(0, 0)'
      el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      setTimeout(() => { el.style.transition = '' }, 400)
    }

    el.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return (
    <div ref={ref} className={className} style={{ display: 'inline-block', willChange: 'transform' }}>
      {children}
    </div>
  )
}
