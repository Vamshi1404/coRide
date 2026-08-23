import { Navigation } from 'lucide-react'

/* Verified: real Charminar photo via Wikimedia Commons FilePath redirect */
const CHARMINAR = 'https://commons.wikimedia.org/wiki/Special:FilePath/CHARMINAR,_Hyderabad_01.jpg?width=800'

export default function AuthVisual() {
  return (
    <div className="auth-visual">
      <div
        className="auth-visual__img"
        style={{
          backgroundImage: `url(${CHARMINAR})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          inset: 0,
          filter: 'saturate(0.6) brightness(0.35)',
        }}
        aria-hidden="true"
      />
      <div className="auth-visual__content">
        <div className="auth-visual__brandline">
          <span className="auth-card__mark" aria-hidden="true">
            <Navigation size={20} />
          </span>
          <span className="auth-card__word">CoRide</span>
        </div>

        <p className="auth-visual__headline">
          Your daily commute, <em>shared</em>.
        </p>

        <div className="auth-visual__art">
          <svg
            className="auth-route-art"
            viewBox="0 0 360 168"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="authRouteGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent-solid)" />
                <stop offset="100%" stopColor="var(--p-accent-500)" />
              </linearGradient>
            </defs>

            <path d="M0 34 H360" stroke="rgba(255,255,255,0.06)" />
            <path d="M0 104 H360" stroke="rgba(255,255,255,0.06)" />
            <path d="M70 0 V168" stroke="rgba(255,255,255,0.05)" />
            <path d="M296 0 V168" stroke="rgba(255,255,255,0.05)" />

            <path className="auth-route-secondary" d="M40 42 C 120 92, 244 32, 330 96" />
            <path className="auth-route-base" d="M24 132 C 96 36, 216 158, 336 52" />
            <path className="auth-route-active" d="M24 132 C 96 36, 216 158, 336 52" />

            <g className="auth-node">
              <circle className="auth-node-pulse" cx="24" cy="132" r="7" />
              <circle className="auth-node-core" cx="24" cy="132" r="5" />
            </g>

            <g className="auth-node auth-node--dest">
              <circle className="auth-node-pulse" cx="336" cy="52" r="7" />
              <circle className="auth-node-core" cx="336" cy="52" r="5" />
            </g>

            <circle className="auth-vehicle" r="4.5">
              <animateMotion
                dur="7s"
                repeatCount="indefinite"
                path="M24 132 C 96 36, 216 158, 336 52"
              />
            </circle>
          </svg>
        </div>

        <div className="auth-chips">
          <span className="auth-chip">
            <span className="auth-chip-dot auth-chip-dot--saffron" aria-hidden="true" />
            Live Tracking
          </span>
          <span className="auth-chip">
            <span className="auth-chip-dot" aria-hidden="true" />
            Community Rated
          </span>
          <span className="auth-chip">
            <span className="auth-chip-dot auth-chip-dot--white" aria-hidden="true" />
            Secure Chat
          </span>
        </div>

        <div className="auth-stats">
          <div>
            <span className="auth-stat-value">12</span>
            <span className="auth-stat-label">City Corridors</span>
          </div>
          <div>
            <span className="auth-stat-value">4.9★</span>
            <span className="auth-stat-label">Rating System</span>
          </div>
          <div>
            <span className="auth-stat-value">₹₹</span>
            <span className="auth-stat-label">Split Fares</span>
          </div>
        </div>
      </div>
    </div>
  )
}
