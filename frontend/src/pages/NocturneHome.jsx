import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { MagneticButton } from '@/components/nocturne/magnetic-button'
import { RouteHero } from '@/components/nocturne/route-hero'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsapSetup'
import { cn } from '@/lib/utils'
import {
  Navigation, Shield, Clock, MapPin, Zap, ArrowRight,
  Leaf, Users, Star,
} from 'lucide-react'

function Section({ children, className }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 })
  return (
    <section
      ref={ref}
      className={cn('nc-section-reveal', isVisible && 'visible', className)}
    >
      {children}
    </section>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="nc-stagger-child bg-[var(--nc-200)] border-[var(--nc-300)] border hover:border-[var(--nc-400)] transition-colors duration-300 group">
      <CardContent className="p-6 space-y-3">
        <div className="size-10 rounded-[12px] bg-[var(--nc-300)] flex items-center justify-center group-hover:bg-[var(--nc-accent-dim)] transition-colors duration-300">
          <Icon size={18} className="text-[var(--nc-600)] group-hover:text-[var(--nc-accent)] transition-colors duration-300" />
        </div>
        <h3 className="text-[var(--nc-800)] font-semibold">{title}</h3>
        <p className="text-[var(--nc-500)] text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

function RouteCard({ from, to, distance }) {
  return (
    <Link
      to={`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`}
      className="nc-stagger-child flex items-center gap-4 p-4 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] hover:border-[var(--nc-accent)] transition-colors duration-200 group"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="size-2 rounded-full bg-[var(--nc-accent)] shrink-0" />
        <span className="text-[var(--nc-800)] text-sm font-medium truncate">{from}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[var(--nc-400)]" aria-hidden="true">
        <div className="w-8 h-px bg-[var(--nc-400)]" />
        <ArrowRight size={12} />
        <div className="w-8 h-px bg-[var(--nc-400)]" />
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-[var(--nc-800)] text-sm font-medium truncate">{to}</span>
        <div className="size-2 rounded-full bg-[var(--nc-500)] shrink-0" />
      </div>
      <span className="text-[var(--nc-500)] text-xs tabular-nums shrink-0 hidden sm:block">{distance} km</span>
      <ArrowRight size={14} className="text-[var(--nc-500)] group-hover:text-[var(--nc-accent)] group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  )
}

function StepCard({ number, title, description }) {
  return (
    <div className="nc-stagger-child relative pl-12 space-y-2">
      <div className="absolute left-0 top-0 size-8 rounded-full bg-[var(--nc-900)] text-[var(--nc-accent)] flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <h3 className="text-[var(--nc-800)] font-semibold">{title}</h3>
      <p className="text-[var(--nc-500)] text-sm leading-relaxed">{description}</p>
    </div>
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
      animation: gsap.to('.hero-fade', {
        autoAlpha: 0,
        y: -60,
        ease: 'none',
      }),
    })
  }, { scope: heroRef })

  return (
    <div ref={heroRef}>
      {/* ─── Hero ─── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--nc-0)] via-[var(--nc-50)] to-[var(--nc-50)]" />

        {!reducedMotion && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-[var(--nc-700)]"
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

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 hero-fade">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] text-[var(--nc-600)] text-xs font-medium">
            <span className="size-1.5 rounded-full bg-[var(--nc-accent)] animate-[livePulse_1.5s_ease-in-out_infinite]" aria-hidden="true" />
            Live now in Hyderabad
          </div>

          <h1 className="text-[var(--nc-900)] text-5xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.05]">
            <span className="hero-line block">Ride together.</span>
            <span className="hero-line block text-[var(--nc-accent)]">Move smarter.</span>
          </h1>

          <p className="hero-sub text-[var(--nc-600)] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Carpooling for professionals. Community-rated drivers, real-time GPS
            tracking, and a commute that costs less — for you and the planet.
          </p>

          <RouteHero className="hero-route max-w-3xl mx-auto my-8" />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <MagneticButton asChild size="lg" className="hero-cta bg-[var(--nc-900)] text-white hover:bg-[var(--nc-800)] px-8 text-base cursor-pointer">
              <Link to="/search">
                <MapPin size={18} className="mr-2" />
                Find a Ride
              </Link>
            </MagneticButton>
            <MagneticButton asChild variant="outline" size="lg" className="hero-cta border-[var(--nc-400)] text-[var(--nc-700)] hover:bg-[var(--nc-200)] px-8 text-base cursor-pointer">
              <Link to="/offer-ride">
                <Navigation size={18} className="mr-2" />
                Offer a Ride
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <Section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="nc-stagger-child text-[var(--nc-900)] text-3xl md:text-4xl font-bold tracking-tight">
              Built for the daily commute
            </h2>
            <p className="nc-stagger-child text-[var(--nc-500)] text-lg max-w-xl mx-auto">
              Everything you need to share rides safely — nothing you don't.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
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

      {/* ─── Popular Routes ─── */}
      <Section className="py-20 px-6 bg-[var(--nc-100)]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="nc-stagger-child text-[var(--nc-900)] text-3xl font-bold tracking-tight">
              Popular routes
            </h2>
            <p className="nc-stagger-child text-[var(--nc-500)]">
              Hyderabad's most commuted corridors — tap one to search it
            </p>
          </div>
          <div className="space-y-3">
            {POPULAR_ROUTES.map((route) => (
              <RouteCard key={`${route.from}-${route.to}`} {...route} />
            ))}
          </div>
        </div>
      </Section>

      {/* ─── How It Works ─── */}
      <Section className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="nc-stagger-child text-[var(--nc-900)] text-3xl font-bold tracking-tight">
              How it works
            </h2>
          </div>
          <div className="space-y-10">
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

      {/* ─── CTA ─── */}
      <Section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="nc-stagger-child text-[var(--nc-900)] text-4xl md:text-5xl font-bold tracking-tight">
            Your commute,{' '}
            <span className="text-[var(--nc-accent)]">reimagined</span>
          </h2>
          <p className="nc-stagger-child text-[var(--nc-500)] text-lg max-w-xl mx-auto">
            Create a free account — offer seats on your drive or find one heading your way.
          </p>
          <MagneticButton asChild size="lg" className="bg-[var(--nc-900)] text-white hover:bg-[var(--nc-800)] px-10 text-base cursor-pointer">
            <Link to="/register">
              Get Started
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </MagneticButton>
        </div>
      </Section>
    </div>
  )
}
