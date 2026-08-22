import { Link } from 'react-router-dom'
import { Navigation } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function AppFooter() {
  const { user } = useAuth()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--nc-300)]/60 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="size-8 rounded-[10px] bg-[var(--nc-900)] flex items-center justify-center">
                <Navigation size={16} className="text-[var(--nc-accent)]" />
              </div>
              <span className="text-[var(--nc-900)] font-bold text-lg tracking-tight">CoRide</span>
            </Link>
            <p className="mt-3 text-sm text-[var(--nc-500)] leading-relaxed">
              Share the ride, split the cost. City carpooling with live tracking and trusted co-travellers.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-2 gap-x-16 gap-y-8">
            <div>
              <h4 className="text-[var(--nc-800)] text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2.5">
                {user ? (
                  <>
                    <FooterLink to="/dashboard">Dashboard</FooterLink>
                    <FooterLink to="/search">Find a Ride</FooterLink>
                    <FooterLink to="/offer-ride">Offer a Ride</FooterLink>
                  </>
                ) : (
                  <>
                    <FooterLink to="/register">Create account</FooterLink>
                    <FooterLink to="/login">Sign in</FooterLink>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-[var(--nc-800)] text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
                <FooterLink to="/terms-of-service">Terms of Service</FooterLink>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--nc-300)]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--nc-500)]">© {year} CoRide. All rights reserved.</p>
          <p className="text-xs text-[var(--nc-500)]">Hyderabad, IN</p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-sm text-[var(--nc-500)] hover:text-[var(--nc-accent)] transition-colors">
        {children}
      </Link>
    </li>
  )
}
