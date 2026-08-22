import { Component } from 'react'
import { Link } from 'react-router-dom'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[var(--nc-50)] text-[var(--nc-800)] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="text-[var(--nc-accent)] font-bold text-sm tracking-[0.2em] uppercase">
              Something broke
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--nc-900)]">
              An unexpected error occurred
            </h1>
            <p className="mt-3 text-sm text-[var(--nc-500)] break-all">
              {String(this.state.error?.message || this.state.error)}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-full bg-[var(--nc-900)] text-[var(--nc-0)] text-sm font-medium hover:bg-[var(--nc-800)] transition-colors cursor-pointer"
              >
                Reload
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-full border border-[var(--nc-400)] text-[var(--nc-600)] text-sm font-medium hover:bg-[var(--nc-200)] transition-colors"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
