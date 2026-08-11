import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/icon'

export default function Footer() {
  return (
    <footer className="global-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <Icon name="directions_car" className="logo-icon" />
            <span className="logo-text">CoRide</span>
          </div>
          <p className="footer-tagline">
            The gold standard in corporate carpooling & ride sharing.
          </p>
        </div>

        <div className="footer-nav-groups">
          <div className="footer-nav-col">
            <h4>Platform</h4>
            <Link to="/dashboard">Home</Link>
            <Link to="/search">Find a Ride</Link>
            <Link to="/offer-ride">Offer a Ride</Link>
            <Link to="/my-rides">My Rides</Link>
          </div>

          <div className="footer-nav-col">
            <h4>Account</h4>
            <Link to="/profile">Profile</Link>
            <Link to="/chats">Messages</Link>
          </div>

          <div className="footer-nav-col">
            <h4>Legal</h4>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CoRide Technologies. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy-policy">Privacy</Link>
          <span className="dot">&bull;</span>
          <Link to="/terms-of-service">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
