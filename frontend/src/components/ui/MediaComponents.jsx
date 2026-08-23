import { useRef, useEffect, useState } from 'react'

/**
 * ParallaxImage — image that moves at a different speed than scroll.
 * Uses CSS transform for 60fps performance.
 */
export function ParallaxImage({
  src,
  alt,
  speed = 0.15,
  className = '',
  aspectRatio = '16/10',
  sizes,
  loading = 'lazy',
  ...props
}) {
  const containerRef = useRef(null)
  const [offset, setOffset] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = (vh - rect.top) / (vh + rect.height)
      setOffset((progress - 0.5) * speed * rect.height)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [speed])

  return (
    <div
      ref={containerRef}
      className={`media-parallax ${className}`}
      style={{ aspectRatio }}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        style={{
          transform: `translateY(${offset}px) scale(1.15)`,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />
    </div>
  )
}

/**
 * ScrollRevealImage — image that reveals with a clip-path wipe on scroll.
 */
export function ScrollRevealImage({
  src,
  alt,
  direction = 'up',
  className = '',
  aspectRatio = '16/10',
  ...props
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const clipPath = visible
    ? 'inset(0 0 0% 0)'
    : direction === 'up' ? 'inset(0 0 100% 0)'
    : direction === 'down' ? 'inset(100% 0 0 0)'
    : direction === 'left' ? 'inset(0 100% 0 0)'
    : 'inset(0 0 0 100%)'

  return (
    <div
      ref={ref}
      className={`media-reveal ${className}`}
      style={{ aspectRatio, clipPath, transition: 'clip-path 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
      {...props}
    >
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

/**
 * HoverZoomImage — image that scales on hover with overflow hidden.
 */
export function HoverZoomImage({ src, alt, className = '', aspectRatio = '16/10', ...props }) {
  return (
    <div className={`media-hover-zoom ${className}`} style={{ aspectRatio }} {...props}>
      <img src={src} alt={alt} loading="lazy" />
    </div>
  )
}

/**
 * ScrollVideo — video that plays/pauses based on scroll visibility,
 * and can have parallax offset.
 */
export function ScrollVideo({
  src,
  poster,
  className = '',
  parallaxSpeed = 0.1,
  aspectRatio = '16/9',
  ...props
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    const vid = videoRef.current
    if (!el || !vid) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          vid.play().catch(() => {})
        } else {
          vid.pause()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = (vh - rect.top) / (vh + rect.height)
      setOffset((progress - 0.5) * parallaxSpeed * rect.height)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [parallaxSpeed])

  return (
    <div
      ref={containerRef}
      className={`media-parallax ${className}`}
      style={{ aspectRatio, overflow: 'hidden' }}
      {...props}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        style={{
          width: '100%',
          height: '115%',
          objectFit: 'cover',
          transform: `translateY(${offset}px)`,
        }}
      />
    </div>
  )
}
