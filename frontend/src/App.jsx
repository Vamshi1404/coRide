import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { useAuth } from './contexts/AuthContext'
import { SmoothScroll } from './components/providers/SmoothScroll'
import { AppNav } from './components/layout/AppNav'
import { AppFooter } from './components/layout/AppFooter'
import { PageTransition } from './components/layout/PageTransition'
import { Preloader, shouldShowPreloader } from './components/layout/Preloader'

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

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-28 pb-16 animate-pulse" aria-busy="true">
      <div className="h-9 w-64 rounded-[10px] bg-[var(--nc-200)]" />
      <div className="mt-4 h-4 w-96 max-w-full rounded bg-[var(--nc-100)]" />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)]" />
        ))}
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
    location.pathname === '/chats' || location.pathname.startsWith('/chat/')

  return (
    <SmoothScroll>
      {!booted && <Preloader onDone={() => setBooted(true)} />}

      <div className="min-h-screen bg-[var(--nc-50)] text-[var(--nc-800)] antialiased">
        <AppNav />

        <main className={isChat ? 'pt-16' : ''}>
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
