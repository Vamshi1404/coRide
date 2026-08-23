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
        <div className="oops" role="alert">
          <div className="oops__inner">
            <p className="oops__code">Something broke</p>
            <h1 className="page-title">An unexpected error occurred</h1>
            <p className="oops__msg">
              {String(this.state.error?.message || this.state.error)}
            </p>
            <div className="oops__actions">
              <button type="button" onClick={() => window.location.reload()} className="btn btn--accent btn--md">
                Reload
              </button>
              <Link to="/" className="btn btn--outline btn--md">
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
