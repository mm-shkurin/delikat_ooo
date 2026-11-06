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

  render() {
    if (this.state.failed) {
      return (
        <p role="alert" style={{ padding: 24, textAlign: 'center' }}>
          Что-то сломалось. Обновите страницу.
        </p>
      )
    }
    return this.props.children
  }
}
