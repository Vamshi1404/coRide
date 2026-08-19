import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MapPin, Search, Plus, Navigation, User, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: MapPin },
  { label: 'Find Ride', to: '/search', icon: Search },
  { label: 'Offer Ride', to: '/offer-ride', icon: Plus },
  { label: 'My Rides', to: '/my-rides', icon: Navigation },
]

export function NocturneNav({ user, onLogout, className }) {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/70 backdrop-blur-xl border-b border-border/50'
          : 'bg-transparent',
        className
      )}
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-[10px] bg-primary flex items-center justify-center">
            <Navigation size={16} className="text-[var(--nc-accent)]" />
          </div>
          <span className="text-primary font-bold text-lg tracking-tight">NOCTURNE</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.span
                    className="absolute inset-0 bg-secondary rounded-full"
                    layoutId="activeNav"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon size={15} />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                className="size-9 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors"
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm" className="cursor-pointer">
              <Link to="/login">
                <User size={15} className="mr-1.5" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
