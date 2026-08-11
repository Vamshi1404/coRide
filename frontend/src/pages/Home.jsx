import { useRef, useState, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsapSetup'
import { useAuth } from '../contexts/AuthContext'
import { POPULAR_ROUTES } from '../lib/hyderabad'
import useGsapReveal from '../hooks/useGsapReveal'
import toast from 'react-hot-toast'
import { Button } from '../components/ui/button'

function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const containerRef = useRef(null)
  const revealRef = useGsapReveal({ selector: '.gsap-reveal' })

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.landing-nav, .hero-content > *', { clearProps: 'all' })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from('.landing-nav', { autoAlpha: 0, y: -16, duration: 0.5 })
        .from('.hero-tag', { autoAlpha: 0, y: 24, duration: 0.5 })
        .from('.hero-content h1', { autoAlpha: 0, y: 40, duration: 0.7 })
        .from('.hero-subtitle', { autoAlpha: 0, y: 24, duration: 0.6 })
        .from('.hero-btns', { autoAlpha: 0, y: 16, duration: 0.5 }, '-=0.2')
    })

    return () => mm.revert()
  }, { scope: containerRef })

  const handleShare = useCallback(async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CoRide', text: 'Join CoRide - ride-sharing for professionals', url })
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }, [])

  return (
    <div className="landing" ref={containerRef}>
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 28, fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          <span className="landing-logo">CoRide</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#routes">Routes</a>
          <a href="#tracking">Tracking</a>
          <Link to="/login" className="landing-btn-secondary">Login</Link>
          <Button render={<Link to="/register" />} className="landing-btn-primary">Join CoRide</Button>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero" ref={revealRef}>
        <div className="hero-bg">
          <div className="hero-overlay" />
          <img src="/images/hero-bg.jpg" alt="Hyderabad Cityscape" className="hero-bg-img" />
        </div>
        <div className="hero-content">
          <span className="hero-tag">
            <span className="hero-tag-dot" />
            Now Live
          </span>
          <h1>
            Ride Together,<br /><span className="text-primary">Save Together</span>
          </h1>
          <p className="hero-subtitle">
            The ride-sharing community designed exclusively for Cities professionals. Connect with colleagues and commute in comfort.
          </p>
          <div className="hero-btns">
            <Button render={<Link to="/register" />} className="landing-btn-primary hero-btn-primary">
              <span className="material-symbols-outlined">search</span>
              Find a Ride
            </Button>
            <Button render={<Link to="/register" />} variant="secondary" className="landing-btn-secondary hero-btn-secondary">
              <span className="material-symbols-outlined">add_circle</span>
              Offer a Ride
            </Button>
          </div>
        </div>
      </header>

      {/* Overview: What is CoRide? */}
      <section className="section-overview">
        <div className="section-overview-inner">
          <div className="overview-header gsap-reveal">
            <h2>What is CoRide?</h2>
            <p>We bridge the gap between solo commutes and crowded public transport by connecting car owners with empty seats to verified professional passengers.</p>
          </div>
          <div className="overview-grid">
            <div className="overview-card gsap-reveal">
              <div className="overview-card-img">
                <img src="/images/driver.jpg" alt="Professional Driver" />
              </div>
              <div className="overview-card-body">
                <div className="overview-card-icon">
                  <span className="material-symbols-outlined">drive_eta</span>
                </div>
                <h3>For the Driver</h3>
                <p>Offset your fuel costs and maintenance while helping the environment. Meet fellow professionals during your daily commute.</p>
                <ul>
                  <li><span className="material-symbols-outlined">check_circle</span> Reduce monthly commute expenses</li>
                  <li><span className="material-symbols-outlined">check_circle</span> Flexible scheduling</li>
                  <li><span className="material-symbols-outlined">check_circle</span> Professional network</li>
                </ul>
              </div>
            </div>
            <div className="overview-card gsap-reveal">
              <div className="overview-card-img">
                <img src="/images/passenger.jpg" alt="Professional Passenger" />
              </div>
              <div className="overview-card-body">
                <div className="overview-card-icon passenger-icon">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h3>For the Passenger</h3>
                <p>Skip the stress of navigating Hyderabad traffic. Enjoy a  carpool experience with door-to-door convenience and transparent pricing.</p>
                <ul>
                  <li><span className="material-symbols-outlined">check_circle</span> vehicle comfort</li>
                  <li><span className="material-symbols-outlined">check_circle</span> Safety first tracking</li>
                  <li><span className="material-symbols-outlined">check_circle</span> Cost-effective travel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="section-features" id="features">
        <div className="section-features-inner">
          <h2 className="gsap-reveal">
            Sophisticated Ecosystem
          </h2>
          <div className="features-bento">
            <div className="bento-card bento-wide gsap-reveal">
              <div className="bento-flex">
                <div className="bento-text">
                  <div className="bento-icon-wrap">
                    <span className="material-symbols-outlined">security</span>
                  </div>
                  <h4>Verified Rating System</h4>
                  <p>Our community-driven rating system ensures that only the most reliable and courteous commuters stay on the platform. Safety and trust are our priorities.</p>
                </div>

              </div>
            </div>
            <div className="bento-card bento-primary gsap-reveal">
              <span className="material-symbols-outlined bento-primary-icon">how_to_reg</span>
              <div>
                <h4>Simple Signup</h4>
                <p>Register in under 2 minutes with your corporate ID and LinkedIn.</p>
              </div>
            </div>
            <div className="bento-card gsap-reveal">
              <span className="material-symbols-outlined bento-icon">chat</span>
              <h4>Secure Chat</h4>
              <p>Coordinate pickups without sharing personal contact numbers.</p>
            </div>
          <div className="bento-card gsap-reveal">
            <span className="material-symbols-outlined bento-icon">search</span>
            <h4>Easy Search</h4>
            <p>Smart filters for time, route, vehicle type and preferences.</p>
          </div>
          </div>
        </div>
      </section>

      {/* Live Tracking */}
      <section className="section-tracking" id="tracking">
        <div className="section-tracking-inner">
          <div className="tracking-content gsap-reveal">
            <h2>Real-Time Sync</h2>
            <p>Transparency builds trust. Our advanced tracking interface provides real-time updates for both parties, ensuring you're never left guessing.</p>
            <div className="tracking-pulse">
              <div className="pulse-dot" />
              <span>Live Pulse System</span>
            </div>
            <div className="tracking-feature-card">
              <span className="material-symbols-outlined">location_on</span>
              <div>
                <p className="tracking-feature-title">Precision Tracking</p>
                <p className="tracking-feature-desc">Accurate within 5 meters for seamless pickup experiences.</p>
              </div>
            </div>
          </div>
          <div className="tracking-mockup gsap-reveal">
            <div className="mockup-frame">
              <img src="/images/tracking.jpg" alt="Real-time Tracking Interface" />
              <div className="mockup-overlay-top">
                <div className="mockup-chip">
                  <span className="mockup-dot" />
                  En Route to HITEC City
                </div>
                <div className="mockup-time">14 MINS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="section-routes" id="routes">
        <div className="section-routes-inner">
          <div className="routes-header gsap-reveal">
            <div>
              <h2>Popular Routes</h2>
              <p>Fastest commute patterns for urban travel.</p>
            </div>
          </div>
          <div className="routes-grid-new">
            {POPULAR_ROUTES.slice(0, 6).map((route, i) => (
              <div
                key={i}
                className="route-card-new gsap-reveal"
              >
                <div className="route-card-header">
                  <div>
                    <span className="route-label">Starting from</span>
                    <span className="route-city">{route.from}</span>
                  </div>
                  <span className="material-symbols-outlined route-arrow">trending_flat</span>
                  <div className="route-end">
                    <span className="route-label">Ending at</span>
                    <span className="route-city">{route.to}</span>
                  </div>
                </div>
                <div className="route-card-footer">
                  <div className="route-avatars">
                    <div className="route-avatar" />
                    <div className="route-avatar" />
                    <div className="route-avatar-more">+N</div>
                  </div>
                  <span className="route-count">POPULAR ROUTE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-steps">
        <div className="section-steps-inner">
          <h2 className="gsap-reveal">
            How CoRide Works
          </h2>
          <div className="steps-grid">
            {[
              { icon: 'person_add', title: 'Join', desc: 'Complete your profile with professional verification.' },
              { icon: 'manage_search', title: 'Match', desc: 'Search or offer rides based on your daily schedule.' },
              { icon: 'handshake', title: 'Confirm', desc: 'Review profile ratings and confirm through secure chat.' },
              { icon: 'celebration', title: 'Ride', desc: 'Share the cost, conversation, and a better commute.' },
            ].map((step, i) => (
              <div
                key={i}
                className="step-item gsap-reveal"
              >
                <div className={`step-circle ${i === 3 ? 'step-circle-primary' : ''}`}>
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <h5>{step.title}</h5>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Vision */}
      <section className="section-vision">
        <div className="section-vision-inner">
          <div className="vision-content gsap-reveal">
            <span className="vision-label">Roadmap 2026</span>
            <h2>What's Coming to CoRide</h2>
            <p>We are constantly evolving to make your commute even safer and more seamless. Here's a glimpse into the future of urban mobility in Hyderabad.</p>
            <div className="vision-grid">
              {[
                { icon: 'smartphone', text: 'Native iOS & Android Apps' },
                { icon: 'payments', text: 'Seamless Auto-Pay' },
                { icon: 'female', text: 'Women-Only Ride Toggles' },
                { icon: 'electric_car', text: 'EV Commute Priority' },
              ].map((item, i) => (
                <div key={i} className="vision-item">
                  <span className="material-symbols-outlined vision-item-icon">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-cta">
        <div className="section-cta-inner">
          <div className="gsap-reveal">
            <h2>Ready to transform your daily commute?</h2>
            <p>Start riding smarter, together with professionals.</p>
            <div className="cta-btns-row">
              <Button render={<Link to="/register" />} size="lg" className="cta-btn-primary">Start Riding Today</Button>
              <Button render={<Link to="/login" />} variant="secondary" size="lg" className="cta-btn-secondary">Sign In</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>CoRide</h3>
            <p>Redefining the daily professional commute with security, community, and efficiency at the core.</p>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms-of-service" className="footer-link">Terms of Service</Link>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <div className="footer-social">
              <button className="social-icon" onClick={handleShare} aria-label="Share">
                <span className="material-symbols-outlined">share</span>
              </button>
              <a href="mailto:support@coride.com" className="social-icon" aria-label="Email us">
                <span className="material-symbols-outlined">mail</span>
              </a>
              <Link to="/" className="social-icon" aria-label="Home">
                <span className="material-symbols-outlined">language</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CoRide Technologies.</p>
        </div>
      </footer>
    </div>
  )
}

export default function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="home-loading">
        <h1>
          CoRide
        </h1>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="home-loading">
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  return <LandingPage />
}
