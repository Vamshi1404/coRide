import { useRef, useState, useEffect } from 'react'
import { gsap, useGSAP } from '../../lib/gsapSetup'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

export default function RequestButton({ ride, onUpdate }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState(null)
  const rootRef = useRef(null)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (ride?.booking_status) {
      setExisting({ id: ride.booking_id, status: ride.booking_status })
    } else {
      setExisting(null)
    }
  }, [ride])

  useGSAP(() => {
    if (reducedMotion || !rootRef.current) return
    gsap.from(rootRef.current, {
      autoAlpha: 0,
      y: 10,
      scale: existing?.status === 'accepted' ? 0.6 : 1,
      duration: 0.3,
      ease: existing?.status === 'accepted' ? 'back.out(1.7)' : 'power2.out',
    })
  }, { scope: rootRef, dependencies: [existing, ride] })

  if (!ride) return null

  const isOwner = ride.owner_id === user?.id
  const isFull = ride.available_seats <= 0
  const isOpen = ride.status === 'open'

  if (isOwner) return null

  const handleRequest = async () => {
    if (!user.phone) {
      toast.error('Add your phone number in Profile before requesting.')
      return
    }

    setLoading(true)
    try {
      const data = await api.post(`/api/requests/ride/${ride.id}`)
      toast.success('Request sent!')
      setExisting(data)
      onUpdate?.()
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  const cancelRequest = async () => {
    setLoading(true)
    try {
      await api.patch(`/api/requests/${existing.id}?status=cancelled`)
      toast.success('Request cancelled.')
      setExisting(null)
      onUpdate?.()
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  if (existing?.status === 'accepted') {
    return (
      <span ref={rootRef} className="badge badge-success">
        You're In
      </span>
    )
  }

  if (existing?.status === 'pending') {
    return (
      <button
        ref={rootRef}
        className="btn-secondary"
        onClick={cancelRequest}
        disabled={loading}
      >
        {loading ? 'Cancelling...' : 'Cancel Request'}
      </button>
    )
  }

  if (existing?.status === 'rejected') {
    return (
      <span ref={rootRef} className="badge badge-error">
        Request declined
      </span>
    )
  }

  if (!isOpen) {
    return (
      <span ref={rootRef} className="badge">
        {ride.status === 'completed' ? 'Completed' : 'In Progress'}
      </span>
    )
  }

  if (isFull) {
    return (
      <span ref={rootRef} className="badge badge-error">
        Fully Booked
      </span>
    )
  }

  return (
    <button
      ref={rootRef}
      className="btn-primary"
      onClick={handleRequest}
      disabled={loading}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
          Sending...
        </span>
      ) : 'Request Seat'}
    </button>
  )
}
