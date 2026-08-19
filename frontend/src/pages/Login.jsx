import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navigation, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

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
    <div className="min-h-screen bg-background flex">
      {/* Left panel — brand visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--nc-accent)]/5 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-[10px] bg-primary flex items-center justify-center">
              <Navigation size={18} className="text-[var(--nc-accent)]" />
            </div>
            <span className="text-primary font-bold text-xl tracking-tight">coRide</span>
          </Link>

          <div className="space-y-6 max-w-md">
            <h1 className="text-foreground text-4xl font-bold tracking-tight leading-tight">
              Elevate Your Daily Commute
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Experience the gold standard in corporate ride-sharing. Designed for professionals, refined for Hyderabad.
            </p>
            <div className="flex gap-8 pt-4">
              {[
                { value: '18K+', label: 'Rides Shared' },
                { value: '4.9', label: 'Avg. Rating' },
                { value: '214t', label: 'CO₂ Saved' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-foreground text-2xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            {['Live Tracking', 'Verified Drivers', 'Secure Chat'].map((chip) => (
              <span key={chip} className="px-3 py-1.5 rounded-full bg-background/50 border border-border text-muted-foreground text-xs">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="size-9 rounded-[10px] bg-primary flex items-center justify-center">
              <Navigation size={18} className="text-[var(--nc-accent)]" />
            </div>
            <span className="text-primary font-bold text-xl tracking-tight">coRide</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-foreground text-2xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground">Please enter your details to access your account.</p>
          </div>

          {error && (
            <motion.div
              className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-foreground text-sm font-medium">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@company.com"
                  autoComplete="email"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-foreground text-sm font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 cursor-pointer" disabled={loading}>
              {loading ? (
                <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} className="ml-2" /></>
              )}
            </Button>
          </form>

          <p className="text-muted-foreground text-sm text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-foreground font-medium hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
