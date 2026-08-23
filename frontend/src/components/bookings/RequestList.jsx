import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { getInitials } from '@/lib/rideDisplay'
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
      <p className="row-item__sub" style={{ padding: 'var(--p-space-xs) 0' }}>
        No requests yet. Share your ride to fill your seats.
      </p>
    )
  }

  return (
    <div className="stack stack--gap-lg">
      {pending.length > 0 && (
        <div>
          <h4 className="req-group-label">Pending ({pending.length})</h4>
          <ul className="row-list" style={{ listStyle: 'none', padding: 0 }}>
            {pending.map((req) => (
              <li key={req.id} className="row-item">
                <span className="avatar avatar--sm" aria-hidden="true">
                  {getInitials(req.passenger_name)}
                </span>
                <div className="row-item__body">
                  <p className="row-item__title">{req.passenger_name}</p>
                  {req.passenger_phone && <p className="row-item__sub tabular">{req.passenger_phone}</p>}
                </div>
                <div className="row-item__actions">
                  <button
                    type="button"
                    onClick={() => respond(req.id, 'accepted')}
                    disabled={loading === req.id || !canAccept}
                    aria-label={`Accept ${req.passenger_name}`}
                    title={!canAccept ? 'No seats available' : 'Accept'}
                    data-tooltip={!canAccept ? 'No seats available' : undefined}
                    className="icon-btn icon-btn--solid icon-btn--sm"
                  >
                    {loading === req.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Check size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => respond(req.id, 'rejected')}
                    disabled={loading === req.id}
                    aria-label={`Decline ${req.passenger_name}`}
                    title="Decline"
                    className="icon-btn icon-btn--sm"
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
          <h4 className="req-group-label">Resolved</h4>
          <ul className="stack stack--gap-xs" style={{ listStyle: 'none', padding: 0, gap: 6 }}>
            {resolved.map((req) => (
              <li
                key={req.id}
                className={`resolved-row${req.status === 'accepted' ? ' resolved-row--accepted' : ''}`}
              >
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {req.passenger_name}
                </span>
                <span style={{ textTransform: 'capitalize', flexShrink: 0 }}>{req.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
