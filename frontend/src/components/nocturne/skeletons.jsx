// NOCTURNE skeleton primitives — layout-mirroring placeholders with a
// directional shimmer sweep (see components.css §9).

export function RideCardSkeleton() {
  return (
    <div className="skel-card" aria-hidden="true">
      {/* Route line */}
      <div className="skel-row">
        <span className="skel skel--circle" style={{ width: 10, height: 10 }} />
        <div className="skel skel--line" style={{ width: 96 }} />
        <div className="skel skel--line sm" style={{ flex: 1 }} />
        <div className="skel skel--line" style={{ width: 80 }} />
        <span className="skel skel--circle" style={{ width: 10, height: 10 }} />
      </div>

      {/* Driver info */}
      <div className="skel-row">
        <span className="skel skel--circle" style={{ width: 44, height: 44 }} />
        <div className="stack stack--gap-sm" style={{ flex: 1 }}>
          <div className="skel skel--line" style={{ width: 130 }} />
          <div className="skel skel--line sm" style={{ width: 90 }} />
        </div>
      </div>

      {/* Footer */}
      <div className="skel-row" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--divider)', paddingTop: 12 }}>
        <div className="skel skel--line lg" style={{ width: 64 }} />
        <div className="skel skel--block" style={{ width: 96, height: 32 }} />
      </div>
    </div>
  )
}

// Empty state with route-motif animated SVG glyph
export function EmptyState({ message = 'No rides yet' }) {
  return (
    <div className="state state--compact">
      <svg width="80" height="40" viewBox="0 0 80 40" className="state__glyph" aria-hidden="true">
        <path
          d="M 5 35 Q 25 5, 40 20 T 75 10"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeDasharray="120"
          strokeLinecap="round"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="120;0;120"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="75" cy="10" r="3" fill="var(--text-muted)" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
      <p className="state__body">{message}</p>
    </div>
  )
}
