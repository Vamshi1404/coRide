import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsapSetup'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Icon } from '../components/ui/icon'
import AuthVisual from '../components/auth/AuthVisual'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.auth-left-content > *, .auth-form-panel', { clearProps: 'all' })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.auth-route-art', { autoAlpha: 0, duration: 1 })
        .from('.auth-logo', { autoAlpha: 0, x: -20, duration: 0.7 })
        .from('.auth-left-heading', { autoAlpha: 0, y: 32, duration: 0.7 }, '-=0.25')
        .from('.auth-left-sub', { autoAlpha: 0, duration: 0.6 }, '-=0.3')
        .from('.auth-route-chips > *', { autoAlpha: 0, y: 12, stagger: 0.08, duration: 0.4 }, '-=0.2')
        .from('.auth-stats > *', { autoAlpha: 0, y: 16, stagger: 0.08, duration: 0.5 }, '-=0.25')
        .from('.auth-form-panel', { autoAlpha: 0, x: 24, duration: 0.6 }, '-=0.35')
    })

    return () => mm.revert()
  }, { scope: containerRef })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const data = await api.post('/api/auth/login', { email: email.trim(), password })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split" ref={containerRef}>
      <div className="auth-split-left">
        <div className="auth-left-bg">
          <img src="/images/login-bg.jpg" alt="" />
        </div>
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <div className="auth-logo">
            <Icon name="directions_car" className="auth-logo-icon" />
            <span className="auth-logo-text">CoRide</span>
          </div>

          <AuthVisual />

          <div>
            <h1 className="auth-left-heading">
              Elevate Your Daily Commute
            </h1>
            <p className="auth-left-sub">
              Experience the gold standard in corporate ride-sharing. Designed for professionals, refined for Hyderabad.
            </p>
          </div>

        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-panel">
          <div className="auth-mobile-logo">
            <Icon name="directions_car" />
            <span>CoRide</span>
          </div>

          <h2 className="auth-form-title">Welcome Back</h2>
          <p className="auth-form-subtitle">Please enter your details to access your dashboard.</p>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">EMAIL ADDRESS</label>
              <div className="input-wrap">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@company.com"
                  autoComplete="email"
                />
                <Icon name="mail" className="input-icon" />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">PASSWORD</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                >
                  <Icon name={showPassword ? 'visibility' : 'visibility_off'} />
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="auth-checkbox-mark">
                  <Icon name="check" />
                </span>
                <span className="auth-checkbox-label">Remember me</span>
              </label>
            </div>

            <Button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              ) : (
                <>
                  Sign In
                  <Icon name="arrow_forward" />
                </>
              )}
            </Button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
