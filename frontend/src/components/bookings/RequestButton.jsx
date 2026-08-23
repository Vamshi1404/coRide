import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

export default function RequestButton({ ride, onUpdate }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState(null)

  useEffect(() => {
    if (ride?.booking_status) {
      setExisting({ id: ride.booking_id, status: ride.booking_status })
    } else {
      setExisting(null)
    }
  }, [ride])

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
      await api.post(`/api/requests/ride/${ride.id}`)
      toast.success('Request sent!')
      onUpdate?.()
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  const cancelRequest = async () => {
    if (!window.confirm('Cancel this seat request?')) return
    setLoading(true)
    try {
      await api.patch(`/api/requests/${existing.id}?status=cancelled`)
      toast.success('Request cancelled.')
      onUpdate?.()
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  if (existing?.status === 'accepted') {
    return (
      <span className="badge badge--accepted badge--lg btn--block" style={{ justifyContent: 'center' }} aria-live="polite">
        Seat confirmed ✓
      </span>
    )
  }

  if (existing?.status === 'pending') {
    return (
      <button type="button" onClick={cancelRequest} disabled={loading} className="btn btn--outline btn--md btn--block">
        {loading && <Loader2 size={15} className="spinner" aria-hidden="true" />}
        {loading ? 'Cancelling…' : 'Cancel request'}
      </button>
    )
  }

  if (existing?.status === 'rejected') {
    return (
      <span className="badge badge--neutral badge--lg btn--block" style={{ justifyContent: 'center', borderStyle: 'dashed' }}>
        Request declined
      </span>
    )
  }

  if (!isOpen) {
    return (
      <span className="badge badge--neutral badge--lg btn--block" style={{ justifyContent: 'center' }}>
        {ride.status === 'completed' ? 'Ride completed' : 'Ride in progress'}
      </span>
    )
  }

  if (isFull) {
    return (
      <span className="badge badge--neutral badge--lg btn--block" style={{ justifyContent: 'center' }}>
        Fully booked
      </span>
    )
  }

  return (
    <button type="button" onClick={handleRequest} disabled={loading} className="btn btn--accent btn--md btn--block">
      {loading ? (
        <>
          <Loader2 size={15} className="spinner" aria-hidden="true" /> Sending…
        </>
      ) : (
        'Request seat'
      )}
    </button>
  )
}
