import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { MagneticButton } from '@/components/nocturne/magnetic-button'
import { RouteHero } from '@/components/nocturne/route-hero'
import {
  Navigation, Shield, Clock, MapPin, Zap, ArrowRight,
  Leaf, Users, TrendingUp
} from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-12%' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
}

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.06 } },
  viewport: { once: true, margin: '-12%' },
}

const child = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
}

function StatCard({ value, label, icon: Icon }) {
  return (
    <motion.div {...child} className="text-center space-y-2">
      <div className="mx-auto size-10 rounded-full bg-secondary border border-border flex items-center justify-center">
        <Icon size={18} className="text-[var(--nc-accent)]" />
      </div>
      <p className="text-foreground text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-muted-foreground text-sm">{label}</p>
    </motion.div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div {...child}>
      <Card className="bg-card border-border hover:border-[var(--nc-400)] transition-colors duration-300 group h-full">
        <CardContent className="p-6 space-y-3">
          <div className="size-10 rounded-[12px] bg-secondary flex items-center justify-center group-hover:bg-[var(--nc-accent-dim)] transition-colors duration-300">
            <Icon size={18} className="text-muted-foreground group-hover:text-[var(--nc-accent)] transition-colors duration-300" />
          </div>
          <h3 className="text-foreground font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RouteCard({ from, to, distance }) {
  return (
    <motion.div {...child}>
      <div className="flex items-center gap-4 p-4 rounded-[14px] bg-card border border-border hover:border-[var(--nc-400)] transition-colors duration-200 group cursor-pointer">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="size-2 rounded-full bg-[var(--nc-accent)] shrink-0" />
          <span className="text-foreground text-sm font-medium truncate">{from}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--nc-400)]">
          <div className="w-8 h-px bg-[var(--nc-400)]" />
          <ArrowRight size={12} />
          <div className="w-8 h-px bg-[var(--nc-400)]" />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-foreground text-sm font-medium truncate">{to}</span>
          <div className="size-2 rounded-full bg-muted-foreground shrink-0" />
        </div>
        <span className="text-muted-foreground text-xs tabular-nums shrink-0">{distance} km</span>
      </div>
    </motion.div>
  )
}

function StepCard({ number, title, description }) {
  return (
    <motion.div {...child} className="relative pl-12 space-y-2">
      <div className="absolute left-0 top-0 size-8 rounded-full bg-primary text-[var(--nc-accent)] flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <h3 className="text-foreground font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
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
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--nc-0)] via-background to-background" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-medium"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="size-1.5 rounded-full bg-[var(--nc-accent)]" />
            Live now in Hyderabad
          </motion.div>

          <motion.h1
            className="text-foreground text-5xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.05]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Ride together.
            <br />
            <span className="text-[var(--nc-accent)]">Move smarter.</span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Premium carpooling for professionals. Verified drivers, real-time tracking,
            and a commute that costs less — for you and the planet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            <RouteHero className="max-w-3xl mx-auto" />
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <MagneticButton asChild size="lg" className="px-8 text-base cursor-pointer">
              <Link to="/search">
                <MapPin size={18} className="mr-2" />
                Find a Ride
              </Link>
            </MagneticButton>
            <MagneticButton asChild variant="outline" size="lg" className="px-8 text-base cursor-pointer">
              <Link to="/offer-ride">
                <Navigation size={18} className="mr-2" />
                Offer a Ride
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <motion.section {...fadeUp} className="py-20 px-6">
        <motion.div {...stagger} className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          <StatCard value="18K+" label="Rides Completed" icon={TrendingUp} />
          <StatCard value="4.9" label="Average Rating" icon={Shield} />
          <StatCard value="214t" label="CO₂ Saved" icon={Leaf} />
        </motion.div>
      </motion.section>

      {/* Features */}
      <motion.section {...fadeUp} className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.div {...stagger} className="text-center space-y-4">
            <motion.h2 {...child} className="text-foreground text-3xl md:text-4xl font-bold tracking-tight">
              Built for professionals
            </motion.h2>
            <motion.p {...child} className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every detail designed to make your commute effortless, safe, and sustainable.
            </motion.p>
          </motion.div>
          <motion.div {...stagger} className="grid md:grid-cols-3 gap-5">
            <FeatureCard icon={Shield} title="Verified Drivers" description="Every driver passes background checks, license verification, and vehicle inspections before their first ride." />
            <FeatureCard icon={Clock} title="Real-Time Tracking" description="Watch your driver approach in real-time. Live ETA, route progress, and instant notifications." />
            <FeatureCard icon={Users} title="Community First" description="Carpool with verified professionals heading your way. Chat, coordinate, and build your network." />
            <FeatureCard icon={Zap} title="Instant Booking" description="One tap to request. Smart matching pairs you with drivers on your route in seconds." />
            <FeatureCard icon={MapPin} title="Hyderabad Coverage" description="From Gachibowli to Secunderabad, Madhapur to Jubilee Hills — every major corridor." />
            <FeatureCard icon={Leaf} title="Eco-Conscious" description="Every shared ride reduces emissions. Track your personal CO₂ savings and impact." />
          </motion.div>
        </div>
      </motion.section>

      {/* Popular Routes */}
      <motion.section {...fadeUp} className="py-20 px-6 bg-secondary/50">
        <div className="max-w-4xl mx-auto space-y-10">
          <motion.div {...stagger} className="text-center space-y-3">
            <motion.h2 {...child} className="text-foreground text-3xl font-bold tracking-tight">Popular routes</motion.h2>
            <motion.p {...child} className="text-muted-foreground">Hyderabad's most commuted corridors</motion.p>
          </motion.div>
          <motion.div {...stagger} className="space-y-3">
            {POPULAR_ROUTES.map((route) => (
              <RouteCard key={`${route.from}-${route.to}`} {...route} />
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section {...fadeUp} className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <motion.div {...stagger} className="text-center">
            <motion.h2 {...child} className="text-foreground text-3xl font-bold tracking-tight">How it works</motion.h2>
          </motion.div>
          <motion.div {...stagger} className="space-y-10">
            <StepCard number="1" title="Search your route" description="Enter your pickup and destination. We'll show you available rides from verified drivers heading your way." />
            <StepCard number="2" title="Book your seat" description="Choose a ride, confirm your seat, and you're set. Payment is simple — pay directly to the driver." />
            <StepCard number="3" title="Track live" description="Watch your driver approach in real-time. Chat directly, share your location, and arrive together." />
            <StepCard number="4" title="Rate & repeat" description="Rate your experience. Build trust in the community. Find your regular commute partners." />
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section {...fadeUp} className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.h2 {...child} className="text-foreground text-4xl md:text-5xl font-bold tracking-tight">
            Your commute,{' '}
            <span className="text-[var(--nc-accent)]">reimagined</span>
          </motion.h2>
          <motion.p {...child} className="text-muted-foreground text-lg max-w-xl mx-auto">
            Join thousands of professionals already saving time, money, and carbon with every ride.
          </motion.p>
          <motion.div {...child}>
            <MagneticButton asChild size="lg" className="px-10 text-base cursor-pointer">
              <Link to="/register">
                Get Started
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-[8px] bg-primary flex items-center justify-center">
              <Navigation size={14} className="text-[var(--nc-accent)]" />
            </div>
            <span className="text-foreground font-bold tracking-tight">NOCTURNE</span>
          </div>
          <div className="flex items-center gap-8 text-muted-foreground text-sm">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Safety</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          <p className="text-muted-foreground text-xs">© 2026 Nocturne. Hyderabad, India.</p>
        </div>
      </footer>
    </div>
  )
}
