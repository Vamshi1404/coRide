import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Navigation } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto size-16 rounded-[18px] bg-[var(--nc-900)] flex items-center justify-center">
          <Navigation size={26} className="text-[var(--nc-accent)]" />
        </div>
        <p className="mt-8 text-[var(--nc-accent)] font-bold text-sm tracking-[0.2em] uppercase">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--nc-900)]">
          Off the route
        </h1>
        <p className="mt-3 text-[var(--nc-500)] leading-relaxed">
          This page doesn't exist — it may have moved, or the link was wrong.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild className="bg-[var(--nc-900)] text-white hover:bg-[var(--nc-800)] cursor-pointer">
            <Link to="/">Back home</Link>
          </Button>
          <Button asChild variant="outline" className="border-[var(--nc-400)] text-[var(--nc-600)] cursor-pointer">
            <Link to="/search">Find a ride</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
