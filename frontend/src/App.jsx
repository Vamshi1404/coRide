import { useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { gsap, useGSAP } from './lib/gsapSetup'
import { useAuth } from './contexts/AuthContext'
import { MotionProvider } from './lib/motion/MotionProvider'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { NocturneNav } from './components/nocturne/nocturne-nav'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import SearchRides from './pages/SearchRides'
import OfferRide from './pages/OfferRide'
import MyRides from './pages/MyRides'
import RideDetailPage from './pages/RideDetailPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import NocturneHome from './pages/NocturneHome'
import NocturneSearch from './pages/NocturneSearch'
import NocturneConfirm from './pages/NocturneConfirm'
import NocturneTrack from './pages/NocturneTrack'

function AnimatedPage({ children }) {
  const ref = useRef(null)

  useGSAP(() => {
    gsap.from(ref.current, {
      autoAlpha: 0,
      y: 16,
      duration: 0.45,
      ease: 'expo.out',
    })
  }, { scope: ref })

  return <div ref={ref}>{children}</div>
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppLayout({ children }) {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const isAuth = location.pathname === '/login' || location.pathname === '/register'
  const isChat = location.pathname.startsWith('/chat')

  const content = <AnimatedPage key={location.pathname}>{children}</AnimatedPage>

  if (isLanding || isAuth) return content

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        {content}
      </main>
      {!isChat && <Footer />}
    </div>
  )
}

function NocturneLayout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-[var(--nc-50)]" data-theme="dark">
      <NocturneNav user={user} onLogout={logout} />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <MotionProvider>
      <Routes>
        <Route path="*" element={<AppLayout><InnerRoutes /></AppLayout>} />
        <Route path="/" element={<NocturneLayout><NocturneHome /></NocturneLayout>} />
        <Route path="/search" element={<NocturneLayout><NocturneSearch /></NocturneLayout>} />
        <Route path="/confirm" element={<NocturneLayout><NocturneConfirm /></NocturneLayout>} />
        <Route path="/track/:rideId" element={<NocturneLayout><NocturneTrack /></NocturneLayout>} />
      </Routes>
    </MotionProvider>
  )
}

function InnerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/offer-ride" element={<ProtectedRoute><OfferRide /></ProtectedRoute>} />
      <Route path="/my-rides" element={<ProtectedRoute><MyRides /></ProtectedRoute>} />
      <Route path="/rides/:id" element={<ProtectedRoute><RideDetailPage /></ProtectedRoute>} />
      <Route path="/chat/:rideId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/chats" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    </Routes>
  )
}
