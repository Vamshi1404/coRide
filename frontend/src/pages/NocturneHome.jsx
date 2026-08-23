import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { MagneticButton } from '@/components/nocturne/magnetic-button'
import { RouteHero } from '@/components/nocturne/route-hero'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsapSetup'
import {
  Navigation, Clock, MapPin, Zap, ArrowRight,
  Leaf, Users, Star, ShieldCheck,
} from 'lucide-react'

function Section({ children, className = '', inset = false }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 })
  return (
    <section
      ref={ref}
      className={`chapter nc-section-reveal${inset ? ' chapter--inset' : ''}${className ? ` ${className}` : ''}${isVisible ? ' visible' : ''}`}
    >
      {children}
    </section>
  )
}

const POPULAR_ROUTES = [
  { from: 'Gachibowli', to: 'HITEC City', distance: 7.2 },
  { from: 'Madhapur', to: 'Secunderabad', distance: 18.5 },
  { from: 'Jubilee Hills', to: 'Financial District', distance: 14.1 },
  { from: 'Kondapur', to: 'Cyber Towers', distance: 5.8 },
  { from: 'Ameerpet', to: 'Gachibowli', distance: 12.3 },
  { from: 'Banjara Hills', to: 'HITEC City', distance: 9.4 },
]

export default function NocturneHome() {
  const reducedMotion = useReducedMotion()
  const heroRef = useRef(null)

  useGSAP(() => {
    if (reducedMotion) return

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.from('.hero-badge', { autoAlpha: 0, y: 16, duration: 0.5 })
      .from('.hero-line', { autoAlpha: 0, y: 34, duration: 0.8, stagger: 0.09 }, '-=0.25')
      .from('.hero-sub', { autoAlpha: 0, y: 20, duration: 0.6 }, '-=0.45')
      .from('.hero-route', { autoAlpha: 0, scale: 0.96, duration: 0.7 }, '-=0.35')
      .from('.hero-cta', { autoAlpha: 0, y: 18, duration: 0.55, stagger: 0.08 }, '-=0.4')

    ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      animation: gsap.to('.hero-core', {
        autoAlpha: 0,
        y: -60,
        ease: 'none',
      }),
    })
  }, { scope: heroRef })

  return (
    <div ref={heroRef}>
      {/* ─── Chapter 0 · Intro hook ─── */}
      <section className="home-hero">
        <div className="hero-gradient" aria-hidden="true" />

        {!reducedMotion && (
          <div className="hero-particles" aria-hidden="true">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="particle"
                style={{
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.06 + Math.random() * 0.09,
                  animation: `particle-drift ${10 + Math.random() * 15}s linear infinite`,
                  animationDelay: `${-Math.random() * 12}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="hero-core">
          <p className="hero-badge">
            <span className="hero-badge__dot" aria-hidden="true" />
            Live now in Hyderabad
          </p>

          <h1 className="hero-title">
            <span className="hero-line">Ride together.</span>
            <span className="hero-line hero-line--accent">Move smarter.</span>
          </h1>

          <p className="hero-sub">
            Carpooling for professionals. Community-rated drivers, real-time GPS
            tracking, and a commute that costs less — for you and the planet.
          </p>

          <RouteHero className="hero-route" />

          <div className="hero-cta-row">
            <MagneticButton render={<Link to="/search" />} variant="accent" size="lg" className="hero-cta">
              <MapPin size={19} aria-hidden="true" />
              Find a Ride
            </MagneticButton>
            <MagneticButton render={<Link to="/offer-ride" />} variant="outline" size="lg" className="hero-cta">
              <Navigation size={19} aria-hidden="true" />
              Offer a Ride
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ─── Chapter 1 · Why share ─── */}
      <Section inset>
        <div className="chapter__inner">
          <div className="chapter__head">
            <h2 className="chapter__title nc-stagger-child">Built for the daily commute</h2>
            <p className="chapter__sub nc-stagger-child">
              Everything you need to share rides safely — nothing you don't.
            </p>
          </div>
          <div className="features-grid">
            <FeatureCard
              icon={Star}
              title="Community ratings"
              description="Drivers and passengers carry ratings from real rides. Choose your co-travellers with confidence."
            />
            <FeatureCard
              icon={Clock}
              title="Real-time tracking"
              description="Once the ride starts, follow the driver's live GPS position and traffic-aware ETA on the map."
            />
            <FeatureCard
              icon={Users}
              title="In-app chat"
              description="Coordinate pickup points and timing in the ride's own chat. Share your live location when it matters."
            />
            <FeatureCard
              icon={Zap}
              title="One-tap requests"
              description="Found a ride? Request a seat instantly. The driver accepts, and you're on the manifest."
            />
            <FeatureCard
              icon={MapPin}
              title="Hyderabad coverage"
              description="From Gachibowli to Secunderabad, Madhapur to Jubilee Hills — every major corridor."
            />
            <FeatureCard
              icon={Leaf}
              title="Fewer cars, cleaner air"
              description="Every shared seat is one fewer car on the road at rush hour. Split fares, not the planet."
            />
          </div>
        </div>
      </Section>

      {/* ─── Chapter 2 · Popular corridors ─── */}
      <Section>
        <div className="chapter__inner">
          <div className="chapter__head">
            <h2 className="chapter__title nc-stagger-child">Popular routes</h2>
            <p className="nc-stagger-child" style={{ color: 'var(--text-secondary)' }}>
              Hyderabad's most commuted corridors — tap one to search it
            </p>
          </div>
          <div className="routes-list">
            {POPULAR_ROUTES.map((route) => (
              <RouteCard key={`${route.from}-${route.to}`} {...route} />
            ))}
          </div>
        </div>
      </Section>

      {/* ─── Chapter 3 · How it works ─── */}
      <Section inset>
        <div className="chapter__inner chapter__inner--narrow">
          <div className="chapter__head">
            <h2 className="chapter__title nc-stagger-child">How it works</h2>
          </div>
          <div className="steps-list">
            <StepCard
              number="1"
              title="Search your route"
              description="Enter your pickup and destination. See open rides from drivers heading your way."
            />
            <StepCard
              number="2"
              title="Request your seat"
              description="Pick a ride and send a request. The driver accepts, and your spot is confirmed."
            />
            <StepCard
              number="3"
              title="Track live"
              description="On ride day, watch the driver's approach in real time. Chat directly, call if needed."
            />
            <StepCard
              number="4"
              title="Rate & repeat"
              description="Pay the driver directly, rate the ride, and keep your daily commute partners."
            />
          </div>
        </div>
      </Section>

      {/* ─── Chapter 4 · Climax CTA ─── */}
      <Section>
        <div className="final-cta__inner">
          <h2 className="final-cta__title nc-stagger-child">
            Your commute, <span className="text-accent">reimagined</span>
          </h2>
          <p className="chapter__sub nc-stagger-child">
            Create a free account — offer seats on your drive or find one heading your way.
          </p>
          <div className="nc-stagger-child">
            <MagneticButton render={<Link to="/register" />} variant="accent" size="lg" className="hero-cta">
              Get Started
              <ArrowRight size={19} aria-hidden="true" />
            </MagneticButton>
          </div>
          <p className="eyebrow nc-stagger-child" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={14} aria-hidden="true" />
            Free to join · Rated drivers · Cash or UPI at pickup
          </p>
        </div>
      </Section>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="card card--interactive feature-card nc-stagger-child">
      <span className="card__icon"><Icon size={18} aria-hidden="true" /></span>
      <h3 className="card__title">{title}</h3>
      <p className="card__body">{description}</p>
    </article>
  )
}

function RouteCard({ from, to, distance }) {
  return (
    <Link to={`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`} className="route-row nc-stagger-child">
      <span className="routeline" style={{ flex: 1, minWidth: 0 }}>
        <span className="routeline__node routeline__node--origin" aria-hidden="true" />
        <span className="routeline__label">{from}</span>
        <span className="routeline__connector" aria-hidden="true"><ArrowRight size={11} /></span>
        <span className="routeline__label" style={{ textAlign: 'right' }}>{to}</span>
        <span className="routeline__node routeline__node--dest" aria-hidden="true" />
      </span>
      <span className="route-row__km">{distance} km</span>
      <ArrowRight size={15} className="route-row__go" aria-hidden="true" />
    </Link>
  )
}

function StepCard({ number, title, description }) {
  return (
    <div className="step-item nc-stagger-child">
      <span className="step-item__num" aria-hidden="true">{number}</span>
      <h3 className="step-item__title">{title}</h3>
      <p className="step-item__body">{description}</p>
    </div>
  )
}
