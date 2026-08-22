import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PolicyLayout({ title, children }) {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-16">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--nc-900)]">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-[var(--nc-500)]">Last updated: August 2026</p>

      <div className="mt-8 p-6 sm:p-7 rounded-[16px] bg-[var(--nc-200)] border border-[var(--nc-300)] space-y-4">
        {children}
      </div>

      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--nc-500)] hover:text-[var(--nc-accent)] transition-colors"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>
      </div>
    </main>
  )
}

export function PolicyPlaceholder({ children }) {
  return <p className="text-[var(--nc-600)] text-sm leading-relaxed">{children}</p>
}
