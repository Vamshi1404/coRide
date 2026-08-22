import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '@/lib/utils'

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

  const base =
    'w-full h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer'

  if (existing?.status === 'accepted') {
    return (
      <span className={cn(base, 'bg-[var(--nc-accent-dim)] text-[var(--nc-accent)] border border-[var(--nc-accent)]/50 cursor-default')} aria-live="polite">
        Seat confirmed ✓
      </span>
    )
  }

  if (existing?.status === 'pending') {
    return (
      <button onClick={cancelRequest} disabled={loading} className={cn(base, 'border border-[var(--nc-400)] text-[var(--nc-600)] hover:bg-[var(--nc-300)] disabled:opacity-60')}>
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Cancelling…' : 'Cancel request'}
      </button>
    )
  }

  if (existing?.status === 'rejected') {
    return (
      <span className={cn(base, 'bg-transparent border border-dashed border-[var(--nc-400)] text-[var(--nc-500)] cursor-default')}>
        Request declined
      </span>
    )
  }

  if (!isOpen) {
    return (
      <span className={cn(base, 'bg-[var(--nc-100)] border border-[var(--nc-300)] text-[var(--nc-500)] cursor-default')}>
        {ride.status === 'completed' ? 'Ride completed' : 'Ride in progress'}
      </span>
    )
  }

  if (isFull) {
    return (
      <span className={cn(base, 'bg-[var(--nc-100)] border border-[var(--nc-300)] text-[var(--nc-500)] cursor-default')}>
        Fully booked
      </span>
    )
  }

  return (
    <button onClick={handleRequest} disabled={loading} className={cn(base, 'bg-[var(--nc-accent)] text-white hover:brightness-110 active:scale-[0.98] disabled:opacity-60')}>
      {loading ? (
        <>
          <Loader2 size={15} className="animate-spin" /> Sending…
        </>
      ) : (
        'Request seat'
      )}
    </button>
  )
}
