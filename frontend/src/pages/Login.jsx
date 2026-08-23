import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'motion/react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Navigation } from 'lucide-react'
import AuthVisual from '../components/auth/AuthVisual'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    try {
      const data = await api.post('/api/auth/login', {
        email: values.email.trim(),
        password: values.password,
      })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError('root', { message: err?.message || 'Login failed' })
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

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to manage your rides</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
            {errors.root && (
              <div role="alert" className="auth-alert">
                {errors.root.message}
              </div>
            )}

            <Field label="Email" error={errors.email} required>
              <input
                {...register('email')}
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`input${errors.email ? ' is-invalid' : ''}`}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
              />
            </Field>

            <Field label="Password" error={errors.password} errorId="login-password-error" required>
              <div className="input-wrap">
                <input
                  {...register('password')}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input${errors.password ? ' is-invalid' : ''}`}
                  style={{ paddingRight: '44px' }}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
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
              Sign in
            </button>
          </form>

          <p className="auth-swap">
            New to CoRide?{' '}
            <Link to="/register">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, error, children, required, errorId }) {
  const inputId = children?.props?.id
  const errorElId = errorId || (inputId ? `${inputId}-error` : undefined)
  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label htmlFor={inputId} className={`field__label${required ? ' is-required' : ''}`}>{label}</label>
      {children}
      {error && (
        <p id={errorElId} className="field__error" role="alert">{error.message}</p>
      )}
    </div>
  )
}
