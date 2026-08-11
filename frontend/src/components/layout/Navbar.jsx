import { useRef, useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { gsap, useGSAP } from '../../lib/gsapSetup'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import NotificationBell from '../notifications/NotificationBell'
import { Icon } from '../../components/ui/icon'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useGSAP(() => {
    gsap.from(navRef.current, { autoAlpha: 0, y: -10, duration: 0.3, ease: 'power1.out' })
  }, { scope: navRef })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav ref={navRef} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to={user ? "/dashboard" : "/"} className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="directions_car" filled size={26} style={{ color: 'var(--primary)' }} />
          CoRide
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-links desktop-only">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>Home</NavLink>
          <NavLink to="/search" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>Find Ride</NavLink>
          <NavLink to="/offer-ride" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>Offer Ride</NavLink>
          <NavLink to="/my-rides" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>My Rides</NavLink>
          <NavLink to="/chats" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>Chats</NavLink>

          {user && <NotificationBell />}
          {user ? (
            <div className="nav-user-actions">
              <NavLink to="/profile" className="nav-profile" title="View Profile">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </NavLink>
              <Button variant="outline" className="btn-logout" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          ) : (
            <div className="nav-guest-actions">
              <Link to="/login" className="btn-login-nav">Sign In</Link>
              <Link to="/register" className="btn-register-nav">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="mobile-menu-btn" aria-label="Toggle navigation menu">
            <Icon name="menu" />
          </SheetTrigger>
          <SheetContent side="right" className="w-80 sm:max-w-sm p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="mobile-drawer-inner">
              <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="dashboard" /> Home
              </NavLink>
              <NavLink to="/search" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="search" /> Find Ride
              </NavLink>
              <NavLink to="/offer-ride" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="add_circle" /> Offer Ride
              </NavLink>
              <NavLink to="/my-rides" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="directions_car" /> My Rides
              </NavLink>
              <NavLink to="/chats" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="chat" /> Chats
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Icon name="person" /> Profile
              </NavLink>
              {user ? (
                <Button variant="outline" className="mobile-logout-btn" onClick={handleLogout}>
                  <Icon name="logout" /> Log Out
                </Button>
              ) : (
                <div className="mobile-auth-btns">
                  <Link to="/login" className="btn-login-nav w-full">Sign In</Link>
                  <Link to="/register" className="btn-register-nav w-full">Get Started</Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
