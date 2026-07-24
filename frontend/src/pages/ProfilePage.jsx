import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

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

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="profile-page">
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Profile Header */}
        <div className="profile-header">
          <motion.div
            className="profile-avatar-lg"
            whileHover={{ scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {initials}
          </motion.div>
          <div className="profile-header-info">
            <h1 className="profile-name">{user?.name || 'Your Profile'}</h1>
            <p className="profile-email-display">{user?.email}</p>
            {user?.avg_rating > 0 ? (
              <div className="profile-rating">
                <span className="star-icon">★</span>
                <span className="rating-value">{Number(user.avg_rating).toFixed(1)}</span>
                <span className="rating-count">({user.total_ratings || 0} reviews)</span>
              </div>
            ) : (
              <p className="profile-no-rating">No ratings yet</p>
            )}
          </div>
        </div>

        <div className="profile-divider" />

        {/* Edit Form */}
        <div className="profile-form-section">
          <h2 className="profile-section-title">
            <span className="material-symbols-outlined">edit</span>
            Edit Profile
          </h2>

          <form onSubmit={handleSubmit} noValidate className="profile-form">
            <motion.label
              className="form-field"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="field-label">
                <span className="material-symbols-outlined">person</span> Full Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="field-input"
              />
            </motion.label>

            <motion.label
              className="form-field"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span className="field-label">
                <span className="material-symbols-outlined">mail</span> Email Address
              </span>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="field-input disabled"
              />
            </motion.label>

            <motion.label
              className="form-field"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="field-label">
                <span className="material-symbols-outlined">phone</span> Phone Number
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="field-input"
              />
            </motion.label>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <button type="submit" className="btn-primary profile-save-btn" disabled={saving}>
                {saving ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                    Saving...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                    Save Changes
                  </span>
                )}
              </button>
            </motion.div>
          </form>
        </div>

        <div className="profile-divider" />

        {/* Quick Links */}
        <div className="profile-quick-links">
          <Link to="/my-rides" className="profile-quick-link">
            <span className="material-symbols-outlined">directions_car</span>
            <span>My Rides</span>
            <span className="material-symbols-outlined chevron">chevron_right</span>
          </Link>
          <Link to="/chats" className="profile-quick-link">
            <span className="material-symbols-outlined">chat</span>
            <span>Messages</span>
            <span className="material-symbols-outlined chevron">chevron_right</span>
          </Link>
          <Link to="/privacy-policy" className="profile-quick-link">
            <span className="material-symbols-outlined">privacy_tip</span>
            <span>Privacy Policy</span>
            <span className="material-symbols-outlined chevron">chevron_right</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
