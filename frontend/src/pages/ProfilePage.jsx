import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { motion } from 'motion/react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import AddVehicle from '../components/vehicles/AddVehicle'
import { getInitials } from '@/lib/rideDisplay'
import {
  Star, PencilLine, ChevronRight, Route as RouteIcon,
  MessageCircle, ShieldCheck, CheckCircle2, Loader2, CarFront, Plus,
} from 'lucide-react'

const VEHICLE_LABELS = { car: 'Car', suv: 'SUV', bike: 'Bike' }

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/api/vehicles'),
  })
  const vehicles = vehiclesQuery.data ?? []

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

  const PROFILE_COVER = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80'

  return (
    <div className="page page--form">
      {/* Cover image */}
      <div className="profile-hero" style={{ marginTop: 'calc(-1 * clamp(var(--p-space-4xl), 5vw, var(--p-space-6xl)))' }}>
        <img src={PROFILE_COVER} alt="" aria-hidden="true" />
        <div className="profile-hero__overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="card profile-card"
        style={{ marginTop: '-60px', position: 'relative', zIndex: 2 }}
      >
        {/* Identity */}
        <div className="profile-identity">
          <span className="avatar avatar--xl avatar--brand" aria-hidden="true">
            {getInitials(user?.name)}
          </span>
          <div style={{ minWidth: 0 }}>
            <h1 className="profile-name">{user?.name || 'Your profile'}</h1>
            <p className="profile-email">{user?.email}</p>
            {user?.total_ratings > 0 ? (
              <p className="profile-rating">
                <Star size={13} style={{ fill: 'currentColor', color: 'var(--accent-solid)' }} aria-hidden="true" />
                <strong>{Number(user.avg_rating).toFixed(1)}</strong>
                <span>({user.total_ratings} reviews)</span>
              </p>
            ) : (
              <p className="row-item__sub" style={{ fontStyle: 'italic' }}>No ratings yet</p>
            )}
          </div>
        </div>

        <hr className="divider" />

        {/* Edit form */}
        <section aria-label="Edit profile">
          <h2 className="section-head" style={{ color: 'var(--text-strong)', fontSize: 'var(--fs-small)', textTransform: 'none', letterSpacing: 0 }}>
            <PencilLine size={14} aria-hidden="true" style={{ color: 'var(--accent-text)' }} />
            Edit profile
          </h2>

          <form onSubmit={handleSubmit} noValidate className="stack stack--gap-lg" style={{ marginTop: 'var(--p-space-md)' }}>
            <div className="field">
              <label htmlFor="pf-name" className="field__label is-required">Full name</label>
              <input
                id="pf-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="input"
              />
            </div>

            <div className="field">
              <label htmlFor="pf-email" className="field__label">Email</label>
              <input
                id="pf-email"
                type="email"
                value={user?.email || ''}
                disabled
                aria-disabled
                className="input"
              />
            </div>

            <div className="field">
              <label htmlFor="pf-phone" className="field__label">Phone number</label>
              <input
                id="pf-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="input"
              />
              <p className="field__hint">Needed so drivers and passengers can reach you.</p>
            </div>

            <button type="submit" disabled={saving} className="btn btn--accent btn--md btn--block">
              {saving ? <Loader2 size={15} className="spinner" aria-hidden="true" /> : <CheckCircle2 size={15} aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        <hr className="divider" />

        {/* Vehicles */}
        <section aria-label="Your vehicles">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--p-space-md)' }}>
            <h2 className="section-head" style={{ margin: 0, color: 'var(--text-strong)', fontSize: 'var(--fs-small)', textTransform: 'none', letterSpacing: 0 }}>
              <CarFront size={14} aria-hidden="true" style={{ color: 'var(--accent-text)' }} />
              Your vehicles
            </h2>
            <button
              type="button"
              onClick={() => setShowAddVehicle((v) => !v)}
              className="btn btn--outline btn--sm"
            >
              <Plus size={14} aria-hidden="true" />
              Add
            </button>
          </div>

          {showAddVehicle && (
            <div style={{ marginTop: 'var(--p-space-lg)' }}>
              <AddVehicle
                onSaved={() => {
                  setShowAddVehicle(false)
                  vehiclesQuery.refetch()
                }}
              />
            </div>
          )}

          {vehiclesQuery.isLoading ? (
            <div className="vehicle-list" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="skel skel--block" style={{ height: 64 }} aria-hidden="true" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            !showAddVehicle && (
              <p className="state__body" style={{ marginTop: 'var(--p-space-md)', textAlign: 'center' }}>
                No vehicles yet — add one to start offering rides.
              </p>
            )
          ) : (
            <ul className="vehicle-list" style={{ listStyle: 'none', padding: 0 }}>
              {vehicles.map((v) => (
                <li key={v.id} className="vehicle-item">
                  <CarFront size={17} aria-hidden="true" />
                  <div style={{ minWidth: 0 }}>
                    <p className="vehicle-item__name">{v.brand} {v.model}</p>
                    <p className="vehicle-item__meta tabular">
                      {v.seat_capacity} seats · {VEHICLE_LABELS[v.type] || v.type}
                    </p>
                  </div>
                  <span className="badge badge--neutral mono">{v.registration_number}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <hr className="divider" />

        {/* Stats strip */}
        <div className="profile-stats">
          <StatBox label="Rides completed" value={user?.completed_rides ?? 0} />
          <StatBox label="Rides cancelled" value={user?.cancelled_rides ?? 0} />
        </div>

        <hr className="divider" />

        {/* Quick links */}
        <nav aria-label="Quick links" className="profile-links">
          <QuickLink to="/my-rides" icon={<RouteIcon size={17} />} label="My Rides" />
          <QuickLink to="/chats" icon={<MessageCircle size={17} />} label="Messages" />
          <QuickLink to="/privacy-policy" icon={<ShieldCheck size={17} />} label="Privacy Policy" />
        </nav>
      </motion.div>
    </div>
  )
}

function QuickLink({ to, icon, label }) {
  return (
    <Link to={to} className="profile-link">
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      <ChevronRight size={15} className="profile-link__chevron" aria-hidden="true" />
    </Link>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="mini-stat">
      <p className="mini-stat__value">{value}</p>
      <p className="mini-stat__label">{label}</p>
    </div>
  )
}
