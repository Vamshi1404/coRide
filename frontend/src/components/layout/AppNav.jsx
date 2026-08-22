import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import NotificationBell from '../notifications/NotificationBell'
import {
  Navigation, Search, Plus, Route as RouteIcon, MessageCircle, LayoutDashboard,
  Menu, X, User, LogOut,
} from 'lucide-react'

const AUTHED_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Find Ride', to: '/search', icon: Search },
  { label: 'Offer Ride', to: '/offer-ride', icon: Plus },
  { label: 'My Rides', to: '/my-rides', icon: RouteIcon },
  { label: 'Chats', to: '/chats', icon: MessageCircle },
]

const PUBLIC_ITEMS = [
  { label: 'Home', to: '/', icon: Navigation },
]

export function AppNav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen && window.innerWidth < 768 ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const items = user ? AUTHED_ITEMS : PUBLIC_ITEMS

  const handleLogout = () => {
    setDrawerOpen(false)
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-[var(--nc-900)]'
        : 'text-[var(--nc-500)] hover:text-[var(--nc-800)]'
    }`

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || drawerOpen
            ? 'bg-[var(--nc-50)]/70 backdrop-blur-xl border-b border-[var(--nc-300)]/50 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="CoRide home">
            <div className="size-8 rounded-[10px] bg-[var(--nc-900)] flex items-center justify-center transition-transform duration-300 group-hover:rotate-12">
              <Navigation size={16} className="text-[var(--nc-accent)]" />
            </div>
            <span className="text-[var(--nc-900)] font-bold text-lg tracking-tight">CoRide</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {({ isActive }) => (
                  <span className="relative flex items-center gap-2">
                    {isActive && !reduced && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-[var(--nc-200)] rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    {isActive && reduced && (
                      <span className="absolute inset-0 bg-[var(--nc-200)] rounded-full" />
                    )}
                    <item.icon size={15} className="relative" />
                    <span className="relative">{item.label}</span>
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <Link
                  to="/profile"
                  aria-label="Profile"
                  className="size-9 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] hidden sm:flex items-center justify-center text-[var(--nc-700)] text-sm font-semibold hover:bg-[var(--nc-300)] transition-colors"
                >
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </Link>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" render={<Link to="/login" />} className="text-[var(--nc-500)] hover:text-[var(--nc-900)] cursor-pointer">
                  Sign In
                </Button>
                <Button size="sm" render={<Link to="/register" />} className="bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-800)] cursor-pointer">
                  Get Started
                </Button>
              </div>
            )}

            <button
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              className="md:hidden size-9 flex items-center justify-center rounded-full text-[var(--nc-700)] hover:bg-[var(--nc-200)] transition-colors cursor-pointer"
            >
              {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 md:hidden bg-[var(--nc-50)] pt-20 px-6 pb-8 overflow-y-auto"
          >
            <motion.nav
              className="flex flex-col gap-1"
              initial={reduced ? false : 'hidden'}
              animate="show"
              variants={{
                show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
              }}
            >
              {(user ? [...AUTHED_ITEMS, { label: 'Profile', to: '/profile', icon: User }] : PUBLIC_ITEMS).map(
                (item) => (
                  <motion.div
                    key={item.to}
                    variants={reduced ? {} : {
                      hidden: { opacity: 0, x: -14 },
                      show: { opacity: 1, x: 0 },
                    }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3.5 rounded-[14px] text-base font-medium ${
                          isActive
                            ? 'bg-[var(--nc-200)] text-[var(--nc-900)]'
                            : 'text-[var(--nc-600)] active:bg-[var(--nc-200)]'
                        }`
                      }
                    >
                      <item.icon size={18} />
                      {item.label}
                    </NavLink>
                  </motion.div>
                )
              )}

              {!user && (
                <motion.div variants={reduced ? {} : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="flex flex-col gap-2 mt-4">
                  <Button render={<Link to="/login" />} variant="outline" className="border-[var(--nc-400)] text-[var(--nc-700)] h-11 cursor-pointer">
                    Sign In
                  </Button>
                  <Button render={<Link to="/register" />} className="bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-800)] h-11 cursor-pointer">
                    Get Started
                  </Button>
                </motion.div>
              )}

              {user && (
                <motion.button
                  variants={reduced ? {} : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3.5 mt-2 rounded-[14px] text-base font-medium text-[var(--nc-accent)] cursor-pointer"
                >
                  <LogOut size={18} />
                  Log out
                </motion.button>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
