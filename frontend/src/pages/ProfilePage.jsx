import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { getInitials } from '@/lib/rideDisplay'
import {
  Star, PencilLine, ChevronRight, Route as RouteIcon,
  MessageCircle, ShieldCheck, CheckCircle2, Loader2,
} from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Name is required.')

    setSaving(true)
    try {
      const updated = await api.patch('/api/profile', { name: name.trim(), phone: phone.trim() })
      updateUser(updated)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 sm:p-7 rounded-[16px] bg-[var(--nc-200)] border border-[var(--nc-300)] shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
      >
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="size-[72px] shrink-0 rounded-full bg-gradient-to-br from-[var(--nc-900)] to-[var(--nc-700)] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-[var(--nc-900)] truncate">
              {user?.name || 'Your profile'}
            </h1>
            <p className="text-sm text-[var(--nc-500)] truncate">{user?.email}</p>
            {user?.total_ratings > 0 ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm tabular-nums">
                <Star size={13} className="fill-current text-[var(--nc-accent)]" />
                <span className="font-semibold text-[var(--nc-800)]">{Number(user.avg_rating).toFixed(1)}</span>
                <span className="text-[var(--nc-500)]">({user.total_ratings} reviews)</span>
              </p>
            ) : (
              <p className="mt-1 text-xs italic text-[var(--nc-500)]">No ratings yet</p>
            )}
          </div>
        </div>

        <div className="my-6 h-px bg-[var(--nc-300)]" />

        {/* Edit form */}
        <section aria-label="Edit profile">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--nc-800)] mb-4">
            <PencilLine size={14} className="text-[var(--nc-accent)]" />
            Edit profile
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Full name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={inputCls}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                aria-disabled
                className={`${inputCls} opacity-60 cursor-not-allowed`}
              />
            </Field>

            <Field label="Phone number" hint="Needed so drivers and passengers can reach you.">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className={inputCls}
              />
            </Field>

            <button
              type="submit"
              disabled={saving}
              className="!mt-6 w-full h-11 rounded-full bg-[var(--nc-accent)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        <div className="my-6 h-px bg-[var(--nc-300)]" />

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Rides completed" value={user?.completed_rides ?? 0} />
          <StatBox label="Rides cancelled" value={user?.cancelled_rides ?? 0} />
        </div>

        <div className="my-6 h-px bg-[var(--nc-300)]" />

        {/* Quick links */}
        <nav aria-label="Quick links" className="space-y-1">
          <QuickLink to="/my-rides" icon={<RouteIcon size={17} />} label="My Rides" />
          <QuickLink to="/chats" icon={<MessageCircle size={17} />} label="Messages" />
          <QuickLink to="/privacy-policy" icon={<ShieldCheck size={17} />} label="Privacy Policy" />
        </nav>
      </motion.div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nc-500)] mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-[var(--nc-500)]">{hint}</p>}
    </div>
  )
}

function QuickLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-sm font-medium text-[var(--nc-700)] hover:bg-[var(--nc-300)] hover:text-[var(--nc-900)] transition-colors"
    >
      <span className="text-[var(--nc-accent)]">{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight size={15} className="text-[var(--nc-500)] transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="p-3.5 rounded-[12px] bg-[var(--nc-100)] border border-[var(--nc-300)] text-center">
      <p className="text-xl font-bold text-[var(--nc-900)] tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-[var(--nc-500)] mt-0.5">{label}</p>
    </div>
  )
}

const inputCls =
  'w-full h-11 px-4 rounded-[12px] bg-[var(--nc-100)] border border-[var(--nc-300)] text-sm text-[var(--nc-800)] placeholder:text-[var(--nc-500)] outline-none focus:border-[var(--nc-accent)] transition-colors'
