import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Bell, UserPlus, CheckCircle2, XCircle, Flag, CalendarX2 } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsapSetup'
import { format } from 'date-fns'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import RatingModal from '../ratings/RatingModal'

const COMPLETED_RIDE_TYPES = new Set(['ride_completed', 'ride_complete'])

const NOTIFICATION_ICONS = {
  request_sent: { icon: UserPlus, cls: 'bell-item__icon--request' },
  request_accepted: { icon: CheckCircle2, cls: 'bell-item__icon--accepted' },
  request_rejected: { icon: XCircle, cls: 'bell-item__icon--rejected' },
  ride_completed: { icon: Flag, cls: 'bell-item__icon--completed' },
  ride_complete: { icon: Flag, cls: 'bell-item__icon--completed' },
  ride_cancelled: { icon: CalendarX2, cls: 'bell-item__icon--cancelled' },
}

function NotificationIcon({ type }) {
  const meta = NOTIFICATION_ICONS[type]
  if (!meta) return null
  const Icon = meta.icon
  return (
    <span className={`bell-item__icon ${meta.cls}`} aria-hidden="true">
      <Icon size={15} />
    </span>
  )
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [shake, setShake] = useState(false)
  const [pendingRatingRide, setPendingRatingRide] = useState(null)
  const ref = useRef(null)
  const lastIdRef = useRef(null)
  const prevCountRef = useRef(0)
  const dismissedIdsRef = useRef(new Set())
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const unread = notifications.filter((n) => !n.is_read).length

  useGSAP(() => {
    if (reducedMotion) return
    if (unread > 0) {
      gsap.fromTo(
        '.bell-badge',
        { scale: 0 },
        { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      )
    }
  }, { scope: ref, dependencies: [unread] })

  useGSAP(() => {
    if (reducedMotion) return
    if (open) {
      gsap.fromTo(
        '.bell-dropdown',
        { autoAlpha: 0, scale: 0.95, y: -8, transformOrigin: 'top right' },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.15, ease: 'power2.out' }
      )
      gsap.from('.bell-item', { autoAlpha: 0, x: -10, duration: 0.2, stagger: 0.04, ease: 'power2.out' })
    }
  }, { scope: ref, dependencies: [open, notifications] })

  useEffect(() => {
    if (!user) return
    loadNotifications()
    const interval = setInterval(loadNotifications, 10000)
    return () => clearInterval(interval)
  }, [user])

  const triggerRating = useCallback(async (rideId) => {
    if (dismissedIdsRef.current.has(rideId)) return
    try {
      const [ride, ratingCheck] = await Promise.all([
        api.get(`/api/rides/${rideId}`),
        api.get(`/api/ratings/check/${rideId}`),
      ])
      if (ride && !ratingCheck?.rated) {
        setPendingRatingRide(ride)
      }
    } catch {
      // silent
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const params = lastIdRef.current ? { after_id: lastIdRef.current } : {}
      const data = await api.get('/api/notifications', params)
      if (data.length > 0) {
        setNotifications((prev) => {
          const existing = new Set(prev.map((n) => n.id))
          const newN = data.filter((n) => !existing.has(n.id))
          if (newN.length > 0) {
            lastIdRef.current = newN[newN.length - 1].id
            newN.forEach((n) => {
              toast(n.title, { icon: <Bell size={16} /> })
              if (COMPLETED_RIDE_TYPES.has(n.type) && n.related_ride_id) {
                triggerRating(n.related_ride_id)
              }
            })
          }
          return [...newN, ...prev]
        })
        // Shake bell on brand-new notifications
        setShake(true)
        setTimeout(() => setShake(false), 500)
        prevCountRef.current = data.length
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close on Escape for keyboard users
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const markAllRead = async () => {
    try {
      await api.post('/api/notifications/read')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch {
      // silent
    }
  }

  const handleCloseRating = useCallback(() => {
    if (pendingRatingRide) {
      dismissedIdsRef.current.add(pendingRatingRide.id)
    }
    setPendingRatingRide(null)
  }, [pendingRatingRide])

  return (
    <div className="notification-bell" ref={ref}>
      <button
        type="button"
        className={`bell-btn${shake ? ' shake' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close notifications' : 'Open notifications'}
        aria-expanded={open}
      >
        <Bell size={19} aria-hidden="true" />
        {unread > 0 && (
          <span className="bell-badge" aria-label={`${unread} unread`}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="bell-dropdown" role="dialog" aria-label="Notifications">
          <div className="bell-header">
            <h4>Notifications</h4>
            {unread > 0 && (
              <button type="button" className="btn-text" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="bell-list" aria-live="polite">
            {!notifications.length && <p className="empty-text">No notifications</p>}
            {notifications.map((n) => (
              <div key={n.id} className={`bell-item ${!n.is_read ? 'unread' : ''}`}>
                <NotificationIcon type={n.type} />
                <div className="bell-item__body">
                  <p className="bell-title">{n.title}</p>
                  <p className="bell-msg">{n.message}</p>
                  <span className="bell-time">
                    {format(new Date(n.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingRatingRide &&
        createPortal(<RatingModal ride={pendingRatingRide} onClose={handleCloseRating} />, document.body)}
    </div>
  )
}
