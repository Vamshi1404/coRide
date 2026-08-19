import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MagneticButton } from './magnetic-button'
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
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[var(--nc-50)]/70 backdrop-blur-xl border-b border-[var(--nc-300)]/50 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
          : 'bg-transparent',
        className
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-[10px] bg-[var(--nc-900)] flex items-center justify-center">
            <Navigation size={16} className="text-[var(--nc-accent)]" />
          </div>
          <span className="text-[var(--nc-900)] font-bold text-lg tracking-tight">
            NOCTURNE
          </span>
        </Link>

        {/* Desktop nav items */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-[var(--nc-900)]'
                    : 'text-[var(--nc-500)] hover:text-[var(--nc-700)]'
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-[var(--nc-200)] rounded-full" />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon size={15} />
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                className="size-9 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] flex items-center justify-center text-[var(--nc-700)] text-sm font-semibold hover:bg-[var(--nc-300)] transition-colors"
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-[var(--nc-500)] hover:text-[var(--nc-800)] cursor-pointer"
              >
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <MagneticButton asChild variant="default" size="sm">
              <Link to="/login">
                <User size={15} className="mr-1.5" />
                Sign In
              </Link>
            </MagneticButton>
          )}
        </div>
      </nav>
    </header>
  )
}
