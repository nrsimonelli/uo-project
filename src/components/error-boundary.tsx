import { AlertTriangle } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
  errorInfo: ErrorInfo | null
}

// There is currently no way to write Error boundary as a functional component per React documentation.
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    // React can throw non-Error objects, so we normalize them
    const normalizedError =
      error instanceof Error ? error : new Error(String(error))
    return { error: normalizedError, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Store errorInfo in state for display
    this.setState({ errorInfo })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _prevState: ErrorBoundaryState
  ) {
    // Reset error state when children change to allow recovery
    // This is a best practice for error boundaries
    if (prevProps.children !== this.props.children && this.state.error) {
      this.setState({ error: null, errorInfo: null })
    }
  }

  private handleReset = () => {
    this.setState({ error: null, errorInfo: null })
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo } = this.state

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-2xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Something went wrong</h3>
                <p className="text-sm mb-4">
                  An unexpected error occurred. This may be due to corrupted
                  data or a bug in the application.
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium mb-2">
                    Error Details
                  </summary>
                  <pre className="text-xs bg-destructive/10 p-2 rounded overflow-auto max-h-32">
                    {error.message}
                    {error.stack && (
                      <>
                        {'\n\n'}
                        {error.stack}
                      </>
                    )}
                    {errorInfo?.componentStack && (
                      <>
                        {'\n\n'}
                        Component Stack:
                        {errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
                <Button variant="outline" size="sm" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                If the problem persists, try clearing your browser's
                localStorage or contact support.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
