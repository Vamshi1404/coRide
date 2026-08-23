import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'motion/react'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Navigation } from 'lucide-react'
import AuthVisual from '../components/auth/AuthVisual'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,15}$/, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  })

  const onSubmit = async (values) => {
    try {
      await api.post('/api/auth/signup', {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      })
      // Auto sign-in after signup for a seamless first run
      try {
        const data = await api.post('/api/auth/login', {
          email: values.email.trim(),
          password: values.password,
        })
        login(data.token, data.user)
        navigate('/dashboard')
        return
      } catch {
        // fall through to the success screen if auto-login fails
      }
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2200)
    } catch (err) {
      setError('root', { message: err?.message || 'Signup failed' })
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-visual-side" aria-hidden="true">
        <AuthVisual />
      </aside>

      <div className="auth-form-side">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="auth-card"
        >
          <div className="auth-card__brand">
            <span className="auth-card__mark" aria-hidden="true">
              <Navigation size={20} />
            </span>
            <span className="auth-card__word">CoRide</span>
          </div>

          <h1 className="auth-title">Join CoRide</h1>
          <p className="auth-sub">One account to ride and to drive</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
            {success ? (
              <div className="auth-success" role="status">
                <CheckCircle2 size={38} aria-hidden="true" style={{ color: 'var(--status-open)' }} />
                <p className="card__title">Account created</p>
                <p className="state__body">Redirecting you to sign in…</p>
              </div>
            ) : (
              <>
                {errors.root && (
                  <div role="alert" className="auth-alert">
                    {errors.root.message}
                  </div>
                )}

                <Field label="Full name" error={errors.name} required>
                  <input
                    {...register('name')}
                    id="reg-name"
                    autoComplete="name"
                    placeholder="Arjun Mehta"
                    className={`input${errors.name ? ' is-invalid' : ''}`}
                    aria-describedby={errors.name ? 'reg-name-error' : undefined}
                  />
                </Field>

                <Field label="Email" error={errors.email} required>
                  <input
                    {...register('email')}
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`input${errors.email ? ' is-invalid' : ''}`}
                    aria-describedby={errors.email ? 'reg-email-error' : undefined}
                  />
                </Field>

                <Field label="Phone" error={errors.phone} required>
                  <input
                    {...register('phone')}
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    className={`input${errors.phone ? ' is-invalid' : ''}`}
                    aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
                  />
                </Field>

                <Field label="Password" error={errors.password} required>
                  <div className="input-wrap">
                    <input
                      {...register('password')}
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      className={`input${errors.password ? ' is-invalid' : ''}`}
                      style={{ paddingRight: '44px' }}
                      aria-describedby={errors.password ? 'reg-password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="field__trail"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                <button type="submit" disabled={isSubmitting} className="btn btn--accent btn--lg btn--block">
                  {isSubmitting && <Loader2 size={16} className="spinner" aria-hidden="true" />}
                  Create account
                </button>
              </>
            )}
          </form>

          {!success && (
            <p className="auth-swap">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, error, children, required }) {
  const inputId = children?.props?.id
  const errorId = inputId ? `${inputId}-error` : undefined
  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label htmlFor={inputId} className={`field__label${required ? ' is-required' : ''}`}>{label}</label>
      {children}
      {error && (
        <p id={errorId} className="field__error" role="alert">{error.message}</p>
      )}
    </div>
  )
}
