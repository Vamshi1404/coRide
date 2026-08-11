import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsapSetup'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'

export default function RequestList({ requests, ride, onUpdate }) {
  const [loading, setLoading] = useState(null)
  const listRef = useRef(null)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from('.request-list > *', { autoAlpha: 0, x: -20, duration: 0.2, ease: 'power2.out' })
    gsap.from('.request-card', { autoAlpha: 0, x: -20, duration: 0.2, ease: 'power2.out', stagger: 0.05 })
  }, { scope: listRef, dependencies: [requests] })

  const respond = async (requestId, status) => {
    setLoading(requestId)

    try {
      await api.patch(`/api/requests/${requestId}?status=${status}`)
    } catch (err) {
      setLoading(null)
      return toast.error(err.message)
    }
    setLoading(null)

    toast.success(status === 'accepted' ? 'Passenger accepted!' : 'Request rejected.')
    onUpdate?.()
  }

  const pending = requests?.filter((r) => r.status === 'pending') || []
  const resolved = requests?.filter((r) => r.status !== 'pending') || []
  const canAccept = ride.available_seats > 0

  if (!requests?.length) {
    return (
      <p className="empty-text">
        No requests yet.
      </p>
    )
  }

  return (
    <div className="request-list" ref={listRef}>
      {pending.length > 0 && (
        <>
          <h3>
            Pending Requests ({pending.length})
          </h3>
          {pending.map((req) => (
            <div
              key={req.id}
              className="request-card"
            >
              <div className="request-info">
                <strong>{req.passenger_name}</strong>
                <span>{req.passenger_phone}</span>
              </div>
              <div className="request-actions">
                <button
                  className="btn-sm btn-success"
                  onClick={() => respond(req.id, 'accepted')}
                  disabled={loading === req.id || !canAccept}
                  title={!canAccept ? 'No seats available' : 'Accept'}
                >
                  {loading === req.id ? '...' : 'Accept'}
                </button>
                <button
                  className="btn-sm btn-danger"
                  onClick={() => respond(req.id, 'rejected')}
                  disabled={loading === req.id}
                >
                  {loading === req.id ? '...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {resolved.length > 0 && (
        <>
          <h3>
            Resolved
          </h3>
          {resolved.map((req) => (
            <div
              key={req.id}
              className={`request-card resolved-${req.status}`}
            >
              <div className="request-info">
                <strong>{req.passenger_name}</strong>
                <span>{req.status}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
