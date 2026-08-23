import { useRef, useEffect, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsapSetup'
import {
  Navigation, MapPin, ChevronDown, Search,
  Star, ShieldCheck, MessageCircle, ArrowRight, Users,
} from 'lucide-react'

const CityCanvas = lazy(() => import('@/components/home/CityCanvas'))

const MEDIA = {
  heroVideo: 'https://videos.pexels.com/video-files/2103099/2103099-hd_1920_1080_30fps.mp4',
  heroPoster: 'https://commons.wikimedia.org/wiki/Special:FilePath/CHARMINAR,_Hyderabad_01.jpg?width=1920',
  highway: 'https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?w=1600&fit=crop&auto=compress',
  sunsetHero: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hussain_sagar_sunset.jpg?width=1920',
  charminarNight: 'https://images.pexels.com/photos/9025814/pexels-photo-9025814.jpeg?w=1600&fit=crop&auto=compress',
  commuters: 'https://images.pexels.com/photos/3727464/pexels-photo-3727464.jpeg?w=1200&fit=crop&auto=compress',
  golconda: 'https://commons.wikimedia.org/wiki/Special:FilePath/Golconda_Fort,_Hyderabad.jpg?width=1200',
  birla: 'https://commons.wikimedia.org/wiki/Special:FilePath/Birla_Mandir_in_Hyderabad,_2015.JPG?width=1200',
}

const RIDES = [
  { from: 'LB Nagar', to: 'HITEC City', time: '8:15 AM', driver: 'Priya M.', vehicle: 'Swift Dzire', seats: 3 },
  { from: 'Secunderabad', to: 'Gachibowli', time: '9:00 AM', driver: 'Arjun K.', vehicle: 'Honda City', seats: 2 },
  { from: 'Kondapur', to: 'Financial District', time: '8:45 AM', driver: 'Sneha R.', vehicle: 'Hyundai i20', seats: 1 },
  { from: 'Madhapur', to: 'HITEC City', time: '8:30 AM', driver: 'Vikram S.', vehicle: 'Toyota Innova', seats: 4 },
  { from: 'Charminar', to: 'Kondapur', time: '7:30 AM', driver: 'Fatima Z.', vehicle: 'Maruti Baleno', seats: 2 },
]

const TESTIMONIALS = [
  { name: 'Priya M.', role: 'Software Engineer', text: 'I save Rs.4,200 monthly on my Gachibowli commute. The community ratings make it feel safe.' },
  { name: 'Arjun K.', role: 'Product Manager', text: 'Met my regular carpool partner through CoRide. Live GPS tracking means I never wait in the dark.' },
  { name: 'Sneha R.', role: 'Data Analyst', text: 'Offering rides on my daily route is effortless. I cover my fuel cost and reduce Hyderabad traffic.' },
]

function ScrollProgress() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      el.style.height = h > 0 ? `${(window.scrollY / h) * 100}%` : '0%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduced])
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={ref} className="scroll-progress__fill" />
    </div>
  )
}

function RouteDrawSVG({ from, to, midpoints = [] }) {
  const pathRef = useRef(null)
  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const len = path.getTotalLength()
    path.style.strokeDasharray = len
    path.style.strokeDashoffset = len
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        gsap.to(path, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' })
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    obs.observe(path)
    return () => obs.disconnect()
  }, [])

  const allPts = [from, ...midpoints, to]
  const w = 600, h = 80
  const stepX = w / (allPts.length - 1)
  let d = ''
  allPts.forEach((_, i) => {
    const x = i * stepX, y = i % 2 === 0 ? 20 : 55
    d += i === 0 ? `M${x} ${y}` : ` L${x} ${y}`
  })

  return (
    <svg className="route-draw" viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`rg-${from}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent-solid)" />
          <stop offset="100%" stopColor="var(--accent-solid)" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {allPts.map((_, i) => (
        <circle key={i} cx={i * stepX} cy={i % 2 === 0 ? 20 : 55} r="4"
          fill={i === 0 || i === allPts.length - 1 ? 'var(--accent-solid)' : 'var(--text-muted)'} />
      ))}
      <path ref={pathRef} d={d} stroke={`url(#rg-${from})`} strokeWidth="2" strokeLinecap="round" />
      <text x="0" y="75" fill="var(--text-secondary)" fontSize="10">{from}</text>
      <text x={w} y="75" fill="var(--text-secondary)" fontSize="10" textAnchor="end">{to}</text>
    </svg>
  )
}

function RideStripCard({ ride }) {
  return (
    <Link to={`/search?from=${encodeURIComponent(ride.from)}&to=${encodeURIComponent(ride.to)}`} className="ride-strip-card">
      <div className="ride-strip-card__time">{ride.time}</div>
      <div className="ride-strip-card__route">
        <span className="ride-strip-card__dot" />
        <span className="ride-strip-card__city">{ride.from}</span>
        <span className="ride-strip-card__line" />
        <span className="ride-strip-card__dot ride-strip-card__dot--dest" />
        <span className="ride-strip-card__city">{ride.to}</span>
      </div>
      <div className="ride-strip-card__meta">
        <span>{ride.driver}</span>
        <span>{ride.vehicle}</span>
        <span>{ride.seats} seats</span>
      </div>
      <span className="ride-strip-card__cta">Book <ArrowRight size={12} /></span>
    </Link>
  )
}

function MagneticButton({ children, strength = 0.3 }) {
  const ref = useRef(null)
  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * strength}px, ${(e.clientY - rect.top - rect.height / 2) * strength}px)`
  }
  return (
    <span ref={ref} className="magnetic-wrap" onMouseMove={handleMove} onMouseLeave={() => { if (ref.current) ref.current.style.transform = 'translate(0,0)' }}>
      {children}
    </span>
  )
}

export default function NocturneHome() {
  const rootRef = useRef(null)
  const canvasWrapRef = useRef(null)
  const ridesRef = useRef(null)
  const ctaRef = useRef(null)
  const reduced = useReducedMotion()

  useGSAP(() => {
    if (reduced) return

    const heroTl = gsap.timeline()
    heroTl
      .from('.hero-label', { autoAlpha: 0, y: 20, duration: 0.6 })
      .from('.hero-headline span', { autoAlpha: 0, y: 60, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .from('.hero-subline', { autoAlpha: 0, y: 20, duration: 0.5 }, '-=0.3')
      .from('.hero-cta-row', { autoAlpha: 0, y: 16, duration: 0.5 }, '-=0.2')
      .from('.hero-scroll', { autoAlpha: 0, duration: 0.4 }, '-=0.1')

    ScrollTrigger.create({
      trigger: '.act-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress
        const video = document.querySelector('.hero-video')
        if (video) video.style.transform = `scale(${1 + p * 0.2}) translateY(${p * -40}px)`
        const core = document.querySelector('.hero-core')
        if (core) { core.style.opacity = 1 - p * 2; core.style.transform = `translateY(${p * -80}px)` }
        const overlay = document.querySelector('.hero-video-overlay')
        if (overlay) overlay.style.opacity = 0.5 + p * 0.4
      },
    })

    gsap.utils.toArray('.gsap-reveal').forEach((el) => {
      gsap.from(el, { y: 50, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 82%', once: true } })
    })

    gsap.utils.toArray('.clip-reveal').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 80%', once: true } })
    })

    const ridesTrack = ridesRef.current?.querySelector('.rides-strip__track')
    if (ridesTrack) {
      const maxScroll = ridesTrack.scrollWidth - ridesTrack.parentElement.offsetWidth
      gsap.to(ridesTrack, { x: -maxScroll, ease: 'none', scrollTrigger: { trigger: '.act-rides', start: 'top 20%', end: `+=${maxScroll}`, scrub: 1, anticipatePin: 1 } })
    }

    if (ctaRef.current) {
      gsap.from(ctaRef.current.querySelectorAll('.cta-reveal'), { y: 40, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: ctaRef.current, start: 'top 75%', once: true } })
    }

  }, { scope: rootRef })

  return (
    <div ref={rootRef}>
      <ScrollProgress />

      {/* ACT I — THE CITY */}
      <section className="act-hero">
        <div className="hero-video-bg" aria-hidden="true">
          <video autoPlay muted loop playsInline poster={MEDIA.heroPoster} className="hero-video">
            <source src={MEDIA.heroVideo} type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>
        <div className="hero-core">
          <p className="hero-label">
            <span className="hero-label__dot" aria-hidden="true" />
            CoRide / Hyderabad
          </p>
          <h1 className="hero-headline">
            <span>The city</span>
            <span>is already</span>
            <span className="hero-headline--accent">moving.</span>
          </h1>
          <p className="hero-subline">Move with it. Carpooling for Hyderabad professionals.</p>
          <div className="hero-cta-row">
            <MagneticButton>
              <Link to="/search" className="btn btn--accent btn--xl">
                <MapPin size={19} aria-hidden="true" /> Find a Ride
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/offer-ride" className="btn btn--outline btn--xl">
                <Navigation size={19} aria-hidden="true" /> Offer a Ride
              </Link>
            </MagneticButton>
          </div>
          <div className="hero-scroll" aria-hidden="true">
            <span>Scroll to explore</span>
            <ChevronDown size={16} className="hero-scroll__chevron" />
          </div>
        </div>
      </section>

      {/* ACT II — THE CITY CANVAS */}
      <section className="act-canvas">
        <div className="act-canvas__text gsap-reveal">
          <p className="overline">Every journey connects somewhere</p>
          <h2 className="section-heading">A living network of routes</h2>
          <p className="section-sub">
            Hyderabad's corridors are full of movement. CoRide connects the dots
            between people heading the same way.
          </p>
        </div>
        <div className="act-canvas__scene" ref={canvasWrapRef}>
          <Suspense fallback={<div className="canvas-fallback" />}>
            <CityCanvas scrollProgress={0} />
          </Suspense>
        </div>
      </section>

      {/* ACT III — FIND YOUR WAY */}
      <section className="act-routes">
        <div className="container">
          <div className="act-routes__split">
            <div className="act-routes__text gsap-reveal">
              <p className="overline">Find your way</p>
              <h2 className="section-heading">Going your way?</h2>
              <p className="section-sub">
                Every day, thousands of Hyderabad professionals travel the same corridors.
                Find someone on your route.
              </p>
              <Link to="/search" className="btn btn--primary btn--md" style={{ marginTop: 'var(--p-space-xl)' }}>
                Search routes <ArrowRight size={14} />
              </Link>
            </div>
            <div className="act-routes__visual clip-reveal">
              <RouteDrawSVG from="LB Nagar" to="HITEC City" midpoints={['Dilsukhnagar', 'Madhapur']} />
              <RouteDrawSVG from="Secunderabad" to="Gachibowli" midpoints={['Hussain Sagar', 'Kondapur']} />
              <RouteDrawSVG from="Charminar" to="Financial District" midpoints={['Mehdipatnam', 'Gachibowli']} />
              <RouteDrawSVG from="Uppal" to="Madhapur" midpoints={['Dilsukhnagar', 'Kondapur']} />
            </div>
          </div>
        </div>
      </section>

      {/* ACT IV — REAL RIDES (horizontal strip) */}
      <section className="act-rides" ref={ridesRef}>
        <div className="container">
          <div className="gsap-reveal">
            <p className="overline">Live now</p>
            <h2 className="section-heading">Rides happening around you</h2>
          </div>
        </div>
        <div className="rides-strip">
          <div className="rides-strip__track">
            {RIDES.map((ride, i) => <RideStripCard key={i} ride={ride} />)}
            {RIDES.slice(0, 3).map((ride, i) => <RideStripCard key={`dup-${i}`} ride={ride} />)}
          </div>
        </div>
      </section>

      {/* ACT IV — THE PEOPLE */}
      <section className="act-people">
        <div className="container">
          <div className="act-people__grid">
            <div className="act-people__image clip-reveal">
              <img src={MEDIA.commuters} alt="Hyderabad commuters sharing a ride" loading="lazy" />
            </div>
            <div className="act-people__content gsap-reveal">
              <p className="overline">Share the journey</p>
              <h2 className="section-heading">The human side of commuting</h2>
              <p className="section-sub">
                Carpooling isn't just about saving money. It's about connecting with
                fellow professionals who travel your way every day.
              </p>
              <div className="act-people__stats">
                <div className="act-people__stat">
                  <span className="act-people__stat-value">73%</span>
                  <span className="act-people__stat-label">drive alone daily</span>
                </div>
                <div className="act-people__stat">
                  <span className="act-people__stat-value">Rs.4,200</span>
                  <span className="act-people__stat-label">avg monthly savings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACT IV — TESTIMONIALS */}
      <section className="act-testimonials">
        <div className="container">
          <div className="gsap-reveal" style={{ textAlign: 'center', marginBottom: 'var(--p-space-3xl)' }}>
            <p className="overline">From the community</p>
            <h2 className="section-heading">Trusted by Hyderabad commuters</h2>
          </div>
          <div className="testimonials-row">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-card__stars">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="testimonial-card__text">{t.text}</p>
                <div className="testimonial-card__author">
                  <span className="avatar avatar--sm">{t.name[0]}</span>
                  <div>
                    <p className="testimonial-card__name">{t.name}</p>
                    <p className="testimonial-card__role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACT V — THE DESTINATION */}
      <section className="act-cta parallax-section" ref={ctaRef}>
        <div className="parallax-img" style={{ backgroundImage: `url(${MEDIA.sunsetHero})` }} />
        <div className="parallax-section__overlay" />
        <div className="parallax-section__content">
          <h2 className="cta-reveal act-cta__heading">Move together.</h2>
          <p className="cta-reveal act-cta__sub">
            Join thousands of Hyderabad commuters who save money, reduce their carbon footprint,
            and enjoy a better daily commute.
          </p>
          <div className="cta-reveal act-cta__actions">
            <MagneticButton>
              <Link to="/search" className="btn btn--accent btn--xl">
                <MapPin size={19} /> Find a Ride
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/offer-ride" className="btn btn--outline btn--xl">
                <Navigation size={19} /> Offer a Ride
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  )
}
