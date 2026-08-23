import { Link } from 'react-router-dom'
import { Navigation, Heart, ExternalLink } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function AppFooter() {
  const { user } = useAuth()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container-wide footer__inner">
        <div className="footer__brand">
          <Link to="/" className="nav__brand" aria-label="CoRide home">
            <span className="nav__brand-mark" aria-hidden="true">
              <Navigation size={16} />
            </span>
            <span className="nav__brand-word">
              Co<em>Ride</em>
            </span>
          </Link>
          <p className="footer__brand-blurb">
            Share the ride, split the cost. City carpooling for Hyderabad with live GPS
            tracking, in-app chat and community ratings.
          </p>
          <span className="footer__status">
            <span className="footer__status-dot" aria-hidden="true" />
            Live in Hyderabad
          </span>
        </div>

        <nav className="footer__col" aria-label="Product">
          <h4>Product</h4>
          <ul>
            {user ? (
              <>
                <li><FooterLink to="/dashboard">Dashboard</FooterLink></li>
                <li><FooterLink to="/search">Find a ride</FooterLink></li>
                <li><FooterLink to="/offer-ride">Offer a ride</FooterLink></li>
                <li><FooterLink to="/my-rides">My rides</FooterLink></li>
                <li><FooterLink to="/chats">Chats</FooterLink></li>
              </>
            ) : (
              <>
                <li><FooterLink to="/register">Create account</FooterLink></li>
                <li><FooterLink to="/login">Sign in</FooterLink></li>
                <li><FooterLink to="/search">Find a ride</FooterLink></li>
              </>
            )}
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Legal">
          <h4>Legal</h4>
          <ul>
            <li><FooterLink to="/privacy-policy">Privacy policy</FooterLink></li>
            <li><FooterLink to="/terms-of-service">Terms of service</FooterLink></li>
          </ul>
        </nav>

        <div className="footer__col">
          <h4>City</h4>
          <ul>
            <li><span className="footer-city-note">Hyderabad, India</span></li>
            <li><span className="footer-city-note">Gachibowli · HITEC City</span></li>
            <li><span className="footer-city-note">Secunderabad · Madhapur</span></li>
            <li><span className="footer-city-note">Kondapur · Financial District</span></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container-wide footer__bottom-inner">
          <p>© {year} CoRide. All rights reserved.</p>
          <p className="footer__made">
            Built with <Heart size={11} aria-hidden="true" /> in Hyderabad
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }) {
  return <Link to={to}>{children}</Link>
}
