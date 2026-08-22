import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { getInitials } from '@/lib/rideDisplay'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

export default function RequestList({ requests, ride, onUpdate }) {
  const [loading, setLoading] = useState(null)

  const respond = async (requestId, status) => {
    setLoading(requestId)
    try {
      await api.patch(`/api/requests/${requestId}?status=${status}`)
    } catch (err) {
      setLoading(null)
      return toast.error(err.message)
    }
    setLoading(null)
    toast.success(status === 'accepted' ? 'Passenger accepted!' : 'Request declined.')
    onUpdate?.()
  }

  const pending = requests?.filter((r) => r.status === 'pending') || []
  const resolved = requests?.filter((r) => r.status !== 'pending') || []
  const canAccept = ride.available_seats > 0

  if (!requests?.length) {
    return (
      <p className="text-sm text-[var(--nc-500)] py-2">
        No requests yet. Share your ride to fill your seats.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--nc-500)] mb-2">
            Pending ({pending.length})
          </h4>
          <ul className="space-y-2">
            {pending.map((req) => (
              <li
                key={req.id}
                className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--nc-100)] border border-[var(--nc-300)]"
              >
                <div className="size-9 shrink-0 rounded-full bg-[var(--nc-300)] flex items-center justify-center text-xs font-bold text-[var(--nc-700)]">
                  {getInitials(req.passenger_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--nc-800)] truncate">
                    {req.passenger_name}
                  </p>
                  {req.passenger_phone && (
                    <p className="text-xs text-[var(--nc-500)]">{req.passenger_phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => respond(req.id, 'accepted')}
                    disabled={loading === req.id || !canAccept}
                    aria-label={`Accept ${req.passenger_name}`}
                    title={!canAccept ? 'No seats available' : 'Accept'}
                    className="size-8 rounded-full bg-[var(--nc-900)] text-[var(--nc-0)] flex items-center justify-center hover:bg-[var(--nc-accent)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => respond(req.id, 'rejected')}
                    disabled={loading === req.id}
                    aria-label={`Decline ${req.passenger_name}`}
                    title="Decline"
                    className="size-8 rounded-full border border-[var(--nc-400)] text-[var(--nc-500)] flex items-center justify-center hover:border-[var(--nc-accent)] hover:text-[var(--nc-accent)] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <X size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--nc-500)] mb-2">
            Resolved
          </h4>
          <ul className="space-y-1.5">
            {resolved.map((req) => (
              <li
                key={req.id}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-[10px] text-xs',
                  req.status === 'accepted'
                    ? 'bg-[var(--nc-accent-dim)] text-[var(--nc-700)]'
                    : 'bg-[var(--nc-100)] text-[var(--nc-500)]'
                )}
              >
                <span className="font-medium truncate">{req.passenger_name}</span>
                <span className="capitalize shrink-0 ml-2">{req.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
