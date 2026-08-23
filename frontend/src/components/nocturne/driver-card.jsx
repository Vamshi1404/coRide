import { useCounter } from '@/hooks/useCounter'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { getInitials } from '@/lib/rideDisplay'

export function DriverCard({ driver, ETA, className = '' }) {
  const reducedMotion = useReducedMotion()
  const rating = Math.min(5, Math.max(0, Number(driver.rating) || 0))
  const ratingValue = useCounter(rating * 100, {
    duration: 600,
    enabled: !reducedMotion,
  })

  const displayRating = rating > 0 ? (ratingValue / 100).toFixed(rating % 1 === 0 ? 0 : 2) : '—'
  const initials = getInitials(driver.name)
  const dash = (rating / 5) * 163.36

  return (
    <div className={`card${className ? ` ${className}` : ''}`}>
      <div className="result-card__driver" style={{ margin: 0 }}>
        <span className="avatar avatar--lg" aria-hidden="true" style={{ width: 56, height: 56 }}>
          {initials}
          <svg className="avatar__ring" viewBox="0 0 56 56" fill="none">
            <circle
              cx="28"
              cy="28"
              r="26"
              stroke="var(--accent-solid)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${dash} 163.36`}
              style={
                reducedMotion
                  ? undefined
                  : { animation: 'drawRing 700ms cubic-bezier(0.22,1,0.36,1) forwards', '--ring-length': '163.36' }
              }
            />
          </svg>
        </span>

        <div className="row-item__body">
          <h3 className="card__title" style={{ fontSize: 'var(--fs-small)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {driver.name || 'Driver'}
          </h3>
          <p className="row-item__sub">
            {[driver.vehicleMake, driver.vehicleModel].filter(Boolean).join(' ') || 'Vehicle'}
          </p>
          <div className="row-item__actions" style={{ marginTop: 6, gap: 'var(--p-space-md)' }}>
            <span className="rating-chip tabular">★ {displayRating}</span>
            {driver.totalRides != null && (
              <span className="row-item__sub tabular" style={{ marginTop: 0 }}>({driver.totalRides} ratings)</span>
            )}
            {ETA != null && (
              <span className="row-item__sub text-accent tabular" style={{ marginTop: 0, fontWeight: 600 }}>
                Arriving in {ETA}m
              </span>
            )}
          </div>
        </div>

        {driver.vehiclePlate && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p className="ride-card__who-label">Plate</p>
            <p className="mono tabular" style={{ fontSize: 'var(--fs-small)', color: 'var(--text-primary)' }}>
              {driver.vehiclePlate}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
