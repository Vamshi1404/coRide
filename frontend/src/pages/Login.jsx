import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'motion/react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Navigation, Eye, EyeOff, Loader2 } from 'lucide-react'

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 pt-16 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto size-12 rounded-[14px] bg-[var(--nc-900)] flex items-center justify-center">
            <Navigation size={22} className="text-[var(--nc-accent)]" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-[var(--nc-900)]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[var(--nc-500)]">
            Sign in to manage your rides
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 sm:p-7 rounded-[16px] bg-[var(--nc-200)] border border-[var(--nc-300)] shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          {errors.root && (
            <div role="alert" className="mb-4 px-3.5 py-2.5 rounded-[10px] bg-[var(--nc-accent-dim)] border border-[var(--nc-accent)]/50 text-sm text-[var(--nc-accent)]">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-4">
            <Field label="Email" error={errors.email}>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputCls(errors.email)}
              />
            </Field>

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputCls(errors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nc-500)] hover:text-[var(--nc-800)] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full h-12 rounded-full bg-[var(--nc-accent)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>

          <p className="mt-5 text-center text-sm text-[var(--nc-500)]">
            New to CoRide?{' '}
            <Link to="/register" className="font-semibold text-[var(--nc-accent)] hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nc-500)] mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-[var(--nc-accent)]" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}

function inputCls(error) {
  return `w-full h-11 px-4 rounded-[12px] bg-[var(--nc-100)] border ${
    error ? 'border-[var(--nc-accent)]' : 'border-[var(--nc-300)]'
  } text-sm text-[var(--nc-800)] placeholder:text-[var(--nc-500)] outline-none focus:border-[var(--nc-accent)] transition-colors`
}
