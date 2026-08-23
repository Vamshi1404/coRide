import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PolicyLayout({ title, children }) {
  return (
    <div className="page page--narrow">
      <h1 className="page-title">{title}</h1>
      <p className="policy-updated">Last updated: August 2026</p>

      <div className="card card--inset policy-card">
        <div className="policy-prose">{children}</div>
      </div>

      <div style={{ marginTop: 'var(--p-space-xl)' }}>
        <Link to="/" className="backlink">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </div>
  )
}

export function PolicyPlaceholder({ children }) {
  return <p>{children}</p>
}
