/**
 * Sentry Error Tracking Configuration (Backend)
 *
 * Integrates Sentry for production error tracking and monitoring
 * - Only active in production (disabled in development)
 * - Captures unhandled exceptions and rejections
 * - Filters sensitive data from error reports
 */

import * as Sentry from '@sentry/node';
import logger from './logger.js';

/**
 * Initialize Sentry error tracking
 *
 * Call this BEFORE importing any other modules in your server
 */
export function initSentry() {
  // Only initialize Sentry in production
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Sentry disabled in development mode');
    return;
  }

  // Require SENTRY_DSN in production
  if (!process.env.SENTRY_DSN) {
    logger.warn('SENTRY_DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Environment name
    environment: process.env.NODE_ENV || 'production',

    // Release version (from package.json)
    release: process.env.npm_package_version || '1.0.0',

    // Sample rate for performance monitoring (0.0 to 1.0)
    // 0.1 = 10% of transactions
    tracesSampleRate: 0.1,

    // Before sending events, filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from request
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

      // Filter sensitive data from extra context
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.token;
        delete event.extra.secret;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Network errors (client-side issues)
      'Network request failed',
      'NetworkError',
      'Failed to fetch',

      // Browser-specific errors we can't control
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',

      // Rate limit errors (expected behavior)
      'Too Many Requests',
    ],
  });

  logger.info('Sentry error tracking initialized');
}

/**
 * Express error handler middleware
 * Captures errors and sends to Sentry
 *
 * IMPORTANT: This must be the first error handler in your Express app
 */
export const sentryErrorHandler = Sentry.Handlers.errorHandler();

/**
 * Express request handler middleware
 * Captures request data for error context
 *
 * IMPORTANT: This must be the first middleware in your Express app
 */
export const sentryRequestHandler = Sentry.Handlers.requestHandler();

/**
 * Manually capture an exception
 *
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export function captureException(error, context = {}) {
  if (process.env.NODE_ENV !== 'production') {
    logger.error('Error captured (would send to Sentry in production):', {
      error: error.message,
      stack: error.stack,
      context,
    });
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
  if (process.env.NODE_ENV !== 'production') {
    logger.log(level, `Message captured (would send to Sentry in production): ${message}`, context);
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
  if (process.env.NODE_ENV !== 'production') {
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
  if (process.env.NODE_ENV !== 'production') {
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
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  Sentry.addBreadcrumb(breadcrumb);
}

export default Sentry;
