import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useAuth } from './contexts/AuthContext'
import { SmoothScroll } from './components/providers/SmoothScroll'
import { AppNav } from './components/layout/AppNav'
import { AppFooter } from './components/layout/AppFooter'
import { PageTransition } from './components/layout/PageTransition'
import { Preloader, shouldShowPreloader } from './components/layout/Preloader'
import CustomCursor from './components/ui/CustomCursor'

const NocturneHome = lazy(() => import('./pages/NocturneHome'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SearchRides = lazy(() => import('./pages/SearchRides'))
const ConfirmRide = lazy(() => import('./pages/ConfirmRide'))
const TrackRide = lazy(() => import('./pages/TrackRide'))
const OfferRide = lazy(() => import('./pages/OfferRide'))
const MyRides = lazy(() => import('./pages/MyRides'))
const RideDetailPage = lazy(() => import('./pages/RideDetailPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const NotFound = lazy(() => import('./pages/NotFound'))

function scrollToTop() {
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
  else window.scrollTo(0, 0)
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

/** Slim top bar that sweeps once per in-app navigation. */
function RouteProgress() {
  const location = useLocation()
  const reduced = useReducedMotion()
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (!reduced) setKey((k) => k + 1)
  }, [location.pathname, reduced])

  if (reduced) return null

  return (
    <div className="route-progress" aria-hidden="true">
      {key > 0 && (
        <motion.div
          key={key}
          className="route-progress__fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 0.7, 1], opacity: [1, 1, 0] }}
          transition={{ duration: 0.55, times: [0, 0.7, 1], ease: 'easeOut' }}
        />
      )}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="page" aria-busy="true">
      <div className="stack stack--gap-md skel-page" role="status" aria-label="Loading page">
        <div className="skel skel--line lg skel-hero-line" />
        <div className="skel skel--line skel-hero-sub" />
        <div className="skel-row" style={{ marginTop: 'var(--p-space-3xl)' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skel skel--block card--inset" style={{ flex: 1, height: '176px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const [booted, setBooted] = useState(!shouldShowPreloader())

  useEffect(() => {
    scrollToTop()
  }, [location.pathname])

  const isChat =
    location.pathname === '/chats' || location.pathname.startsWith('/chat/') ||
    location.pathname === '/login' || location.pathname === '/register'

  return (
    <SmoothScroll>
      <CustomCursor />
      {!booted && <Preloader onDone={() => setBooted(true)} />}

      <a href="#main-content" className="skip-link">Skip to content</a>

      <div className="app-shell">
        <RouteProgress />
        <AppNav />

        <main id="main-content" className="app-main">
          <Suspense fallback={<PageSkeleton />}>
            <AnimatePresence mode="wait" initial={false} onExitComplete={scrollToTop}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><NocturneHome /></PageTransition>} />
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
                <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
                <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><PageTransition><SearchRides /></PageTransition></ProtectedRoute>} />
                <Route path="/confirm/:rideId" element={<ProtectedRoute><PageTransition><ConfirmRide /></PageTransition></ProtectedRoute>} />
                <Route path="/track/:rideId" element={<ProtectedRoute><PageTransition><TrackRide /></PageTransition></ProtectedRoute>} />
                <Route path="/offer-ride" element={<ProtectedRoute><PageTransition><OfferRide /></PageTransition></ProtectedRoute>} />
                <Route path="/my-rides" element={<ProtectedRoute><PageTransition><MyRides /></PageTransition></ProtectedRoute>} />
                <Route path="/rides/:id" element={<ProtectedRoute><PageTransition><RideDetailPage /></PageTransition></ProtectedRoute>} />
                <Route path="/chats" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/chat/:rideId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfilePage /></PageTransition></ProtectedRoute>} />
                <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>

        {!isChat && <AppFooter />}
      </div>
    </SmoothScroll>
  )
}
