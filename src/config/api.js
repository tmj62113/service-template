/**
 * API Configuration
 *
 * Centralized API URL configuration for the application.
 * Uses environment variables for different environments.
 */

// Get API URL from environment variable, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Remove trailing slash if present
export const API_BASE_URL = API_URL.replace(/\/$/, '');

/**
 * Helper function to build full API endpoint URLs
 * @param {string} path - API endpoint path (e.g., '/api/products')
 * @returns {string} Full API URL
 */
export const getApiUrl = (path) => {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

// Export commonly used API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_ME: '/api/auth/me',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',

  // Services
  SERVICES: '/api/services',
  SERVICES_BY_ID: (id) => `/api/services/${id}`,

  // Staff
  STAFF: '/api/staff',
  STAFF_BY_ID: (id) => `/api/staff/${id}`,

  // Bookings
  BOOKINGS: '/api/bookings',
  BOOKINGS_BY_ID: (id) => `/api/bookings/${id}`,
  RECURRING_BOOKINGS: '/api/bookings/recurring',

  // Availability
  AVAILABILITY: '/api/availability',
  AVAILABILITY_SLOTS: '/api/availability/slots',
  AVAILABILITY_STAFF: (staffId) => `/api/availability/staff/${staffId}`,

  // Messages
  MESSAGES: '/api/messages',

  // Newsletter
  NEWSLETTER_SUBSCRIBE: '/api/newsletter/subscribe',
  NEWSLETTER_SUBSCRIBERS: '/api/newsletter/subscribers',
  NEWSLETTER_STATS: '/api/newsletter/stats',
  NEWSLETTER_DRAFTS: '/api/newsletter/drafts',

  // Audit Logs
  AUDIT_LOGS: '/api/audit-logs',
  AUDIT_LOGS_STATS: '/api/audit-logs/stats',
  AUDIT_LOGS_SECURITY: '/api/audit-logs/security-events',

  // Checkout & Payment
  CREATE_CHECKOUT: '/api/create-checkout-session',
};

export default API_BASE_URL;
