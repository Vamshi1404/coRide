import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { MagneticButton } from '@/components/nocturne/magnetic-button'
import { RouteHero } from '@/components/nocturne/route-hero'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { cn } from '@/lib/utils'
import {
  Navigation, Shield, Clock, MapPin, Zap, ArrowRight,
  Leaf, Users, TrendingUp, ChevronRight
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

function StatCard({ value, label, icon: Icon }) {
  return (
    <div className="nc-stagger-child text-center space-y-2">
      <div className="mx-auto size-10 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] flex items-center justify-center">
        <Icon size={18} className="text-[var(--nc-accent)]" />
      </div>
      <p className="text-[var(--nc-900)] text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[var(--nc-500)] text-sm">{label}</p>
    </div>
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
    <div className="nc-stagger-child flex items-center gap-4 p-4 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] hover:border-[var(--nc-400)] transition-colors duration-200 group cursor-pointer">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="size-2 rounded-full bg-[var(--nc-accent)] shrink-0" />
        <span className="text-[var(--nc-800)] text-sm font-medium truncate">{from}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[var(--nc-400)]">
        <div className="w-8 h-px bg-[var(--nc-400)]" />
        <ArrowRight size={12} />
        <div className="w-8 h-px bg-[var(--nc-400)]" />
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-[var(--nc-800)] text-sm font-medium truncate">{to}</span>
        <div className="size-2 rounded-full bg-[var(--nc-500)] shrink-0" />
      </div>
      <span className="text-[var(--nc-500)] text-xs tabular-nums shrink-0">{distance} km</span>
    </div>
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

  return (
    <div className="min-h-screen bg-[var(--nc-50)]">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--nc-0)] via-[var(--nc-50)] to-[var(--nc-50)]" />

        {/* Particle field */}
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

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] text-[var(--nc-600)] text-xs font-medium">
            <span className="size-1.5 rounded-full bg-[var(--nc-accent)] animate-[livePulse_1.5s_ease-in-out_infinite]" />
            Live now in Hyderabad
          </div>

          {/* Headline */}
          <h1 className="text-[var(--nc-900)] text-5xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.05]">
            Ride together.
            <br />
            <span className="text-[var(--nc-accent)]">Move smarter.</span>
          </h1>

          {/* Subhead */}
          <p className="text-[var(--nc-600)] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Premium carpooling for professionals. Verified drivers, real-time tracking,
            and a commute that costs less — for you and the planet.
          </p>

          {/* Living Route Visualization */}
          <RouteHero className="max-w-3xl mx-auto my-8" />

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <MagneticButton asChild size="lg" className="bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-800)] px-8 text-base cursor-pointer">
              <Link to="/search">
                <MapPin size={18} className="mr-2" />
                Find a Ride
              </Link>
            </MagneticButton>
            <MagneticButton asChild variant="outline" size="lg" className="border-[var(--nc-400)] text-[var(--nc-700)] hover:bg-[var(--nc-200)] px-8 text-base cursor-pointer">
              <Link to="/offer-ride">
                <Navigation size={18} className="mr-2" />
                Offer a Ride
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <Section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          <StatCard value="18K+" label="Rides Completed" icon={TrendingUp} />
          <StatCard value="4.9" label="Average Rating" icon={Shield} />
          <StatCard value="214t" label="CO₂ Saved" icon={Leaf} />
        </div>
      </Section>

      {/* ─── Features ─── */}
      <Section className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="nc-stagger-child text-[var(--nc-900)] text-3xl md:text-4xl font-bold tracking-tight">
              Built for professionals
            </h2>
            <p className="nc-stagger-child text-[var(--nc-500)] text-lg max-w-xl mx-auto">
              Every detail designed to make your commute effortless, safe, and sustainable.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={Shield}
              title="Verified Drivers"
              description="Every driver passes background checks, license verification, and vehicle inspections before their first ride."
            />
            <FeatureCard
              icon={Clock}
              title="Real-Time Tracking"
              description="Watch your driver approach in real-time. Live ETA, route progress, and instant notifications — no guessing."
            />
            <FeatureCard
              icon={Users}
              title="Community First"
              description="Carpool with verified professionals heading your way. Chat, coordinate, and build your daily ride network."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Booking"
              description="One tap to request. Smart matching pairs you with drivers on your route in seconds, not minutes."
            />
            <FeatureCard
              icon={MapPin}
              title="Hyderabad Coverage"
              description="From Gachibowli to Secunderabad, Madhapur to Jubilee Hills — we cover every major corridor."
            />
            <FeatureCard
              icon={Leaf}
              title="Eco-Conscious"
              description="Every shared ride reduces emissions. Track your personal CO₂ savings and see your impact grow."
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
              Hyderabad's most commuted corridors
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
              description="Enter your pickup and destination. We'll show you available rides from verified drivers heading your way."
            />
            <StepCard
              number="2"
              title="Book your seat"
              description="Choose a ride, confirm your seat, and you're set. Payment is simple — pay directly to the driver."
            />
            <StepCard
              number="3"
              title="Track live"
              description="Watch your driver approach in real-time. Chat directly, share your location, and arrive together."
            />
            <StepCard
              number="4"
              title="Rate & repeat"
              description="Rate your experience. Build trust in the community. Find your regular commute partners."
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
            Join thousands of professionals already saving time, money, and carbon
            with every ride.
          </p>
          <MagneticButton asChild size="lg" className="bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-800)] px-10 text-base cursor-pointer">
            <Link to="/register">
              Get Started
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </MagneticButton>
        </div>
      </Section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[var(--nc-300)] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-[8px] bg-[var(--nc-900)] flex items-center justify-center">
              <Navigation size={14} className="text-[var(--nc-accent)]" />
            </div>
            <span className="text-[var(--nc-800)] font-bold tracking-tight">NOCTURNE</span>
          </div>
          <div className="flex items-center gap-8 text-[var(--nc-500)] text-sm">
            <a href="#" className="hover:text-[var(--nc-800)] transition-colors">About</a>
            <a href="#" className="hover:text-[var(--nc-800)] transition-colors">Safety</a>
            <a href="#" className="hover:text-[var(--nc-800)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--nc-800)] transition-colors">Terms</a>
          </div>
          <p className="text-[var(--nc-500)] text-xs">
            © 2026 Nocturne. Hyderabad, India.
          </p>
        </div>
      </footer>
    </div>
  )
}
