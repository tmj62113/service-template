import { Component } from 'react';
import { Link } from 'react-router-dom';
import './ErrorBoundary.css';

/**
 * ErrorBoundary - Catch and handle React errors gracefully
 *
 * This component wraps the application to catch JavaScript errors
 * anywhere in the component tree, log those errors, and display
 * a fallback UI instead of crashing the whole app.
 *
 * Usage:
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console (and in production, send to error tracking service like Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error information in state
    this.setState({
      error,
      errorInfo
    });

    // TODO: Send error to error tracking service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  handleTryAgain = () => {
    // Reset error state and try to re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Reload the page to reset application state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon" aria-hidden="true">
              <span className="material-symbols-outlined">error</span>
            </div>

            <h1 className="error-boundary__title">Oops! Something went wrong</h1>

            <p className="error-boundary__message">
              We're sorry, but something unexpected happened. Don't worry - your cart and data are safe.
            </p>

            <div className="error-boundary__actions">
              <button
                onClick={this.handleTryAgain}
                className="btn btn--primary btn--lg"
                aria-label="Reload page and try again"
              >
                <span className="material-symbols-outlined">refresh</span>
                Try Again
              </button>

              <Link
                to="/"
                className="btn btn--secondary btn--lg"
                aria-label="Go to homepage"
              >
                <span className="material-symbols-outlined">home</span>
                Go Home
              </Link>
            </div>

            <div className="error-boundary__help">
              <p className="text--sm text--muted">
                If this problem continues, please{' '}
                <Link to="/" className="error-boundary__contact-link">
                  contact us
                </Link>{' '}
                and we'll help you out.
              </p>
            </div>

            {/* Only show technical details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary className="error-boundary__details-summary">
                  Technical Details (Development Only)
                </summary>
                <div className="error-boundary__technical">
                  <h3>Error Message:</h3>
                  <pre>{this.state.error.toString()}</pre>

                  {this.state.errorInfo && (
                    <>
                      <h3>Component Stack:</h3>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
