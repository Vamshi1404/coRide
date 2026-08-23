import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/Button'

export default function RatingModal({ ride, onClose }) {
  const { user } = useAuth()
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [hover, setHover] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!panelRef.current) return
    const focusable = panelRef.current.querySelector('button, textarea')
    focusable?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!user || !ride) return null

  const submit = async () => {
    if (stars === 0) return toast.error('Select a rating.')
    setLoading(true)

    try {
      await api.post('/api/ratings', {
        ride_id: ride.id,
        stars,
        review: review.trim() || null,
      })
      toast.success('Rating submitted!')
      onClose?.()
    } catch (err) {
      toast.error(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Rate your ride"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal__title">Rate Your Ride</h2>
        <p className="modal__sub">
          {ride.from_city && ride.to_city
            ? `${ride.from_city} → ${ride.to_city}`
            : 'How was your trip?'}
        </p>

        <div className="star-row" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              className={`star ${n <= (hover || stars) ? 'filled' : ''}`}
              onClick={() => setStars(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Optional: share your experience"
          rows={3}
          maxLength={500}
          className="input"
          aria-label="Written review (optional)"
        />

        <div className="btn-row">
          <Button variant="accent" size="md" block onClick={submit} disabled={loading || stars === 0}>
            {loading && <span className="spinner" style={{ borderTopColor: 'transparent' }} />}
            {loading ? 'Submitting…' : 'Submit Rating'}
          </Button>
          <Button variant="outline" size="md" block onClick={onClose}>
            Skip
          </Button>
        </div>
      </div>
    </div>
  )
}
