import React from 'react'
import { uk } from '../i18n/uk'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
          <div className="text-red-500 text-5xl">⚠</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {uk.common.moduleError}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
            {this.state.errorMessage}
          </p>
          <button
            className="btn-primary"
            onClick={this.handleReload}
            aria-label={uk.common.reloadModule}
          >
            {uk.common.reloadModule}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
