import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Navigation } from 'lucide-react'

const NOTFOUND_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80'

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__bg" aria-hidden="true">
        <img src={NOTFOUND_IMAGE} alt="" />
        <div className="not-found__bg-overlay" />
      </div>
      <div className="not-found__inner">
        <p className="not-found__code">404</p>
        <h1 className="not-found__title">Off the route</h1>
        <p className="not-found__desc">
          This page doesn't exist — it may have moved, or the link was wrong.
        </p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--accent btn--lg">
            <Navigation size={16} aria-hidden="true" />
            Back home
          </Link>
          <Link to="/search" className="btn btn--outline btn--lg">
            Find a ride
          </Link>
        </div>
      </div>
    </div>
  )
}
