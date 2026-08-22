import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'motion/react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { Navigation, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

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
      // Auto sign-in after signup for a seamless first-run
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
            Join CoRide
          </h1>
          <p className="mt-1.5 text-sm text-[var(--nc-500)]">
            One account to ride and to drive
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 sm:p-7 rounded-[16px] bg-[var(--nc-200)] border border-[var(--nc-300)] shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          {success ? (
            <div className="py-8 text-center">
              <CheckCircle2 size={36} className="mx-auto text-[var(--nc-accent)]" />
              <p className="mt-4 font-semibold text-[var(--nc-900)]">Account created</p>
              <p className="mt-1 text-sm text-[var(--nc-500)]">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              {errors.root && (
                <div role="alert" className="mb-4 px-3.5 py-2.5 rounded-[10px] bg-[var(--nc-accent-dim)] border border-[var(--nc-accent)]/50 text-sm text-[var(--nc-accent)]">
                  {errors.root.message}
                </div>
              )}

              <div className="space-y-4">
                <Field label="Full name" error={errors.name}>
                  <input {...register('name')} autoComplete="name" placeholder="Arjun Mehta" className={inputCls(errors.name)} />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input {...register('email')} type="email" autoComplete="email" placeholder="you@example.com" className={inputCls(errors.email)} />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input {...register('phone')} type="tel" autoComplete="tel" placeholder="+91 98765 43210" className={inputCls(errors.phone)} />
                </Field>
                <Field label="Password" error={errors.password}>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
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
                Create account
              </button>

              <p className="mt-5 text-center text-sm text-[var(--nc-500)]">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[var(--nc-accent)] hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
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
