import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { gsap, useGSAP } from '../../lib/gsapSetup'
import { format } from 'date-fns'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import RatingModal from '../ratings/RatingModal'
import { Icon } from '../../components/ui/icon'

const COMPLETED_RIDE_TYPES = new Set(['ride_completed', 'ride_complete'])

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
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
              toast(n.title, { icon: '📬' })
              if (COMPLETED_RIDE_TYPES.has(n.type) && n.related_ride_id) {
                triggerRating(n.related_ride_id)
              }
            })
          }
          return [...newN, ...prev]
        })
        // Shake bell on new notifications
        if (data.length > prevCountRef.current) {
          setShake(true)
          setTimeout(() => setShake(false), 500)
        }
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
        className={`bell-btn ${shake ? 'shake' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <Icon name="notifications" size={24} />
        {unread > 0 && (
          <span className="bell-badge">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="bell-dropdown">
          <div className="bell-header">
            <h4>Notifications</h4>
            {unread > 0 && (
              <button
                className="btn-text"
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="bell-list">
            {!notifications.length && <p className="empty-text">No notifications</p>}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bell-item ${!n.is_read ? 'unread' : ''}`}
              >
                <p className="bell-title">{n.title}</p>
                <p className="bell-msg">{n.message}</p>
                <span className="bell-time">
                  {format(new Date(n.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingRatingRide && createPortal(
        <RatingModal
          ride={pendingRatingRide}
          onClose={handleCloseRating}
        />,
        document.body,
      )}
    </div>
  )
}
