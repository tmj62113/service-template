/**
 * Sentry Error Tracking Configuration (Frontend)
 *
 * Integrates Sentry for production error tracking and monitoring
 * - Only active in production (disabled in development)
 * - Captures unhandled exceptions and promise rejections
 * - Filters sensitive data from error reports
 * - Tracks user interactions and performance
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking
 *
 * Call this in your main.jsx BEFORE rendering the app
 */
export function initSentry() {
  // Only initialize Sentry in production
  if (import.meta.env.MODE !== 'production') {
    console.log('Sentry disabled in development mode');
    return;
  }

  // Require SENTRY_DSN in production
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('VITE_SENTRY_DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,

    // Environment name
    environment: import.meta.env.MODE || 'production',

    // Integration with React Router
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Session Replay: Record user sessions for debugging
        // Only enable if you have user consent and privacy policy compliance
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance monitoring sample rate (0.0 to 1.0)
    // 0.1 = 10% of transactions
    tracesSampleRate: 0.1,

    // Session replay sample rate (0.0 to 1.0)
    // 0.1 = 10% of sessions
    replaysSessionSampleRate: 0.1,

    // Capture 100% of sessions with errors
    replaysOnErrorSampleRate: 1.0,

    // Before sending events, filter sensitive data
    beforeSend(event, hint) {
      // Filter sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          // Remove sensitive data from console logs
          if (breadcrumb.category === 'console') {
            const message = breadcrumb.message || '';
            if (message.includes('password') || message.includes('token')) {
              return { ...breadcrumb, message: '[FILTERED]' };
            }
          }

          // Remove sensitive data from fetch requests
          if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
            if (breadcrumb.data?.url) {
              // Remove tokens from URLs
              breadcrumb.data.url = breadcrumb.data.url.replace(/token=[^&]+/, 'token=[FILTERED]');
            }
          }

          return breadcrumb;
        });
      }

      // Filter sensitive data from extra context
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.token;
        delete event.extra.secret;
      }

      // Filter sensitive data from request
      if (event.request) {
        // Remove cookies
        delete event.request.cookies;

        // Remove authorization headers
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }

        // Remove sensitive query parameters
        if (event.request.query_string) {
          const params = new URLSearchParams(event.request.query_string);
          if (params.has('token')) params.delete('token');
          if (params.has('password')) params.delete('password');
          event.request.query_string = params.toString();
        }
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Network errors (API down, user offline, etc.)
      'Network request failed',
      'NetworkError',
      'Failed to fetch',
      'Load failed',

      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Browser-specific errors we can't control
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',

      // React hydration mismatches (non-critical)
      'Hydration failed',
      'Text content does not match',

      // User navigation (not errors)
      'AbortError',
      'Navigation cancelled',
    ],
  });

  console.log('Sentry error tracking initialized');
}

/**
 * React Error Boundary component
 * Wraps your app to catch React rendering errors
 *
 * Usage in main.jsx:
 * <Sentry.ErrorBoundary fallback={ErrorFallback}>
 *   <App />
 * </Sentry.ErrorBoundary>
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * Manually capture an exception
 *
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export function captureException(error, context = {}) {
  if (import.meta.env.MODE !== 'production') {
    console.error('Error captured (would send to Sentry in production):', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Manually capture a message
 *
 * @param {string} message - The message to capture
 * @param {string} level - Severity level (fatal, error, warning, info, debug)
 * @param {Object} context - Additional context
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (import.meta.env.MODE !== 'production') {
    console.log(`Message captured (would send to Sentry in production): ${message}`, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context for error tracking
 *
 * @param {Object} user - User information
 */
export function setUser(user) {
  if (import.meta.env.MODE !== 'production') {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
  if (import.meta.env.MODE !== 'production') {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging context
 *
 * @param {Object} breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb) {
  if (import.meta.env.MODE !== 'production') {
    return;
  }

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Error fallback component for Error Boundary
 */
export function ErrorFallback({ error, resetError }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        We've been notified and will fix this as soon as possible.
      </p>
      <button
        onClick={resetError}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}

export default Sentry;
