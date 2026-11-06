import { Component } from 'react'

/**
 * Thin boundary so a single screen crash does not blank the whole SPA.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="error-boundary" role="alert">
          <p>Что-то сломалось. Обновите страницу.</p>
          <button className="btn btn-accent" type="button" onClick={() => window.location.reload()}>
            Обновить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
