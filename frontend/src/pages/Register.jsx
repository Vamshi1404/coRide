import { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsapSetup'
import { api } from '../lib/api'
import { Button } from '../components/ui/button'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const toastRef = useRef(null)

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => navigate('/login'), 2000)
      return () => clearTimeout(t)
    }
  }, [success, navigate])

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.auth-left-content > *, .auth-form-panel', { clearProps: 'all' })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from('.auth-logo', { autoAlpha: 0, x: -20, duration: 0.6 })
        .from('.auth-left-heading', { autoAlpha: 0, y: 30, duration: 0.6 })
        .from('.auth-left-sub', { autoAlpha: 0, duration: 0.6 })
        .from('.auth-form-panel', { autoAlpha: 0, x: 20, duration: 0.5 }, '-=0.3')
    })

    return () => mm.revert()
  }, { scope: containerRef })

  useGSAP(() => {
    if (success && toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, ease: 'power2.out', duration: 0.5 }
      )
    }
  }, { scope: toastRef, dependencies: [success] })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/signup', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split" ref={containerRef}>
      <div className="auth-split-left auth-left-primary">
        <div className="auth-left-content">
          <div className="auth-logo">
            <span className="material-symbols-outlined auth-logo-icon">directions_car</span>
            <span className="auth-logo-text">CoRide</span>
          </div>

          <div>
            <h1 className="auth-left-heading">
              Elevate Your Daily Commute
            </h1>
            <p className="auth-left-sub">
              Join an exclusive network of urban professionals for reliable, premium ride-sharing across Hyderabad.
            </p>

          </div>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-panel">
          <div className="auth-mobile-logo">
            <span className="material-symbols-outlined">directions_car</span>
            <span>CoRide</span>
          </div>

          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-subtitle">Start your journey with CoRide.</p>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">Full Name</label>
              <div className="input-wrap">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Corporate Email</label>
              <div className="input-wrap">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="phone">Phone Number</label>
              <div className="input-wrap">
                <span className="input-prefix">+91</span>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  autoComplete="tel"
                  className="has-prefix"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <Button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </Button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>

      {success && (
        <div className="auth-toast" ref={toastRef}>
          <div className="auth-toast-icon">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="auth-toast-title">Registration Successful</p>
            <p className="auth-toast-desc">Welcome to CoRide.</p>
          </div>
        </div>
      )}
    </div>
  )
}
