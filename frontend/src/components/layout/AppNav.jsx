import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useAuth } from '../../contexts/AuthContext'
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

const PUBLIC_ITEMS = []

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
    document.body.style.overflow = drawerOpen && window.innerWidth < 900 ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const items = user ? AUTHED_ITEMS : PUBLIC_ITEMS

  const handleLogout = () => {
    setDrawerOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="nav" data-scrolled={scrolled || drawerOpen}>
      <div className="container-wide nav__inner">
        <Link to="/" className="nav__brand" aria-label="CoRide home">
          <span className="nav__brand-mark" aria-hidden="true">
            <Navigation size={16} />
          </span>
          <span className="nav__brand-word">
            Co<em>Ride</em>
          </span>
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {!reduced && isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="nav__pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  {reduced && isActive && <span className="nav__pill" />}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <item.icon size={15} aria-hidden="true" />
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="nav__actions">
          {user && <NotificationBell />}

          {user ? (
            <Link to="/profile" className="nav__user nav-desktop-only" aria-label="Your profile">
              <span className="avatar avatar--sm avatar--brand" aria-hidden="true">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </span>
              <span className="nav__user-name">{user.name}</span>
            </Link>
          ) : (
            <div className="nav__actions nav-desktop-only" style={{ gap: 'var(--p-space-sm)' }}>
              <Link to="/login" className="btn btn--ghost btn--md">Sign in</Link>
              <Link to="/register" className="btn btn--accent btn--md">Get started</Link>
            </div>
          )}

          <button
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            className="nav__burger"
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="nav-drawer__scrim"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              initial={reduced ? false : { y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduced ? undefined : { y: -8, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="nav-drawer"
              aria-label="Mobile navigation"
            >
              <ul className="nav-drawer__list">
                {(user
                  ? [...AUTHED_ITEMS, { label: 'Profile', to: '/profile', icon: User }]
                  : [{ label: 'Home', to: '/', icon: Navigation }]
                ).map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) => `nav-drawer__item${isActive ? ' is-active' : ''}`}
                    >
                      {item.label}
                      <item.icon size={17} aria-hidden="true" />
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="nav-drawer__foot">
                {user ? (
                  <button type="button" onClick={handleLogout} className="nav-drawer__item is-active" style={{ width: '100%' }}>
                    Log out
                    <LogOut size={17} aria-hidden="true" />
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="btn btn--outline btn--lg btn--block">Sign in</Link>
                    <Link to="/register" className="btn btn--accent btn--lg btn--block">Get started</Link>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
