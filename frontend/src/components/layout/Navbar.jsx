import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import NotificationBell from '../notifications/NotificationBell'
import { useState, useEffect, useCallback } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="nav-inner">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1", fontSize: 26 }}>directions_car</span>
          <Link to={user ? "/dashboard" : "/"} className="nav-logo">CoRide</Link>
        </motion.div>

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
              <motion.div whileHover={{ scale: 1.08 }}>
                <NavLink to="/profile" className="nav-profile" title="View Profile">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </NavLink>
              </motion.div>
              <motion.button
                onClick={handleLogout}
                className="btn-logout"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className="nav-guest-actions">
              <Link to="/login" className="btn-login-nav">Sign In</Link>
              <Link to="/register" className="btn-register-nav">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mobile-drawer-inner">
              <NavLink to="/dashboard" className="mobile-nav-item">
                <span className="material-symbols-outlined">dashboard</span> Home
              </NavLink>
              <NavLink to="/search" className="mobile-nav-item">
                <span className="material-symbols-outlined">search</span> Find Ride
              </NavLink>
              <NavLink to="/offer-ride" className="mobile-nav-item">
                <span className="material-symbols-outlined">add_circle</span> Offer Ride
              </NavLink>
              <NavLink to="/my-rides" className="mobile-nav-item">
                <span className="material-symbols-outlined">directions_car</span> My Rides
              </NavLink>
              <NavLink to="/chats" className="mobile-nav-item">
                <span className="material-symbols-outlined">chat</span> Chats
              </NavLink>
              <NavLink to="/profile" className="mobile-nav-item">
                <span className="material-symbols-outlined">person</span> Profile
              </NavLink>
              {user ? (
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <span className="material-symbols-outlined">logout</span> Logout
                </button>
              ) : (
                <div className="mobile-auth-btns">
                  <Link to="/login" className="btn-login-nav w-full">Sign In</Link>
                  <Link to="/register" className="btn-register-nav w-full">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
