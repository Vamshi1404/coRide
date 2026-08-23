// NOCTURNE live-status indicators — chips & pulse markers (see components.css §23)

export function PulseMarker({ size = 16 }) {
  const box = size * 3
  return (
    <span
      className="pulse-marker"
      style={{ width: box, height: box, display: 'inline-block' }}
      aria-hidden="true"
    >
      <span className="pulse-marker__ring" />
      <span className="pulse-marker__core" style={{ width: size, height: size }} />
    </span>
  )
}

export function LiveChip({ className = '' }) {
  return (
    <span className={`live-chip${className ? ` ${className}` : ''}`}>
      <span className="live-chip__dot" aria-hidden="true" />
      Live
    </span>
  )
}

export function SurgeChip({ multiplier }) {
  if (!multiplier || multiplier <= 1) return null
  return <span className="surge-chip">{multiplier.toFixed(1)}× surge</span>
}
