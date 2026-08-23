import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Navigation } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound__inner">
        <span className="notfound__mark" aria-hidden="true">
          <Navigation size={26} />
        </span>
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">Off the route</h1>
        <p className="page-sub" style={{ textAlign: 'center' }}>
          This page doesn't exist — it may have moved, or the link was wrong.
        </p>
        <div className="notfound__actions">
          <Button render={<Link to="/" />} variant="primary" size="md">Back home</Button>
          <Button render={<Link to="/search" />} variant="outline" size="md">Find a ride</Button>
        </div>
      </div>
    </div>
  )
}
