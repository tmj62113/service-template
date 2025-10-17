import ReactGA from 'react-ga4';
import { hasConsentFor } from '../components/CookieConsent';
import theme from '../config/theme';

let isInitialized = false;

/**
 * Initialize Google Analytics 4 only if user has consented to analytics cookies
 * @returns {boolean} True if analytics was initialized
 */
export function initializeAnalytics() {
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if user has consented to analytics
  if (!hasConsentFor('analytics')) {
    console.log('[Analytics] User has not consented to analytics cookies');
    return false;
  }

  // Check if GA4 measurement ID is configured
  if (!theme.analytics?.ga4MeasurementId) {
    console.warn('[Analytics] GA4 Measurement ID not configured in theme.js');
    return false;
  }

  // Only initialize once
  if (isInitialized) {
    console.log('[Analytics] Already initialized');
    return true;
  }

  try {
    ReactGA.initialize(theme.analytics.ga4MeasurementId, {
      gaOptions: {
        anonymizeIp: true, // GDPR compliance
      },
    });

    isInitialized = true;
    console.log('[Analytics] Google Analytics 4 initialized');
    return true;
  } catch (error) {
    console.error('[Analytics] Failed to initialize:', error);
    return false;
  }
}

/**
 * Track a pageview in Google Analytics
 * Only tracks if user has consented and analytics is initialized
 * @param {string} path - Optional path to track (defaults to current path)
 */
export function trackPageView(path) {
  if (!isInitialized || !hasConsentFor('analytics')) {
    return;
  }

  try {
    if (path) {
      ReactGA.send({ hitType: 'pageview', page: path });
    } else {
      ReactGA.send('pageview');
    }
  } catch (error) {
    console.error('[Analytics] Failed to track pageview:', error);
  }
}

/**
 * Track a custom event in Google Analytics
 * Only tracks if user has consented and analytics is initialized
 * @param {string} category - Event category (e.g., 'Products')
 * @param {string} action - Event action (e.g., 'View')
 * @param {string} label - Optional event label (e.g., product name)
 * @param {number} value - Optional numeric value
 */
export function trackEvent(category, action, label = null, value = null) {
  if (!isInitialized || !hasConsentFor('analytics')) {
    return;
  }

  try {
    const eventParams = {
      category,
      action,
    };

    if (label) eventParams.label = label;
    if (value !== null) eventParams.value = value;

    ReactGA.event(eventParams);
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Track an e-commerce transaction
 * Only tracks if user has consented and analytics is initialized
 * @param {Object} transaction - Transaction data
 */
export function trackPurchase(transaction) {
  if (!isInitialized || !hasConsentFor('analytics')) {
    return;
  }

  try {
    ReactGA.gtag('event', 'purchase', {
      transaction_id: transaction.id,
      value: transaction.total,
      currency: transaction.currency || 'USD',
      items: transaction.items,
    });
  } catch (error) {
    console.error('[Analytics] Failed to track purchase:', error);
  }
}

/**
 * Track when a user adds an item to cart
 * @param {Object} item - Item data (name, price, etc.)
 */
export function trackAddToCart(item) {
  if (!isInitialized || !hasConsentFor('analytics')) {
    return;
  }

  try {
    ReactGA.gtag('event', 'add_to_cart', {
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      }],
    });
  } catch (error) {
    console.error('[Analytics] Failed to track add to cart:', error);
  }
}

/**
 * Check if analytics is currently initialized and tracking
 * @returns {boolean}
 */
export function isAnalyticsEnabled() {
  return isInitialized && hasConsentFor('analytics');
}

/**
 * Disable analytics tracking (called when user revokes consent)
 */
export function disableAnalytics() {
  if (typeof window !== 'undefined' && window[`ga-disable-${theme.analytics?.ga4MeasurementId}`]) {
    window[`ga-disable-${theme.analytics.ga4MeasurementId}`] = true;
    isInitialized = false;
    console.log('[Analytics] Tracking disabled');
  }
}
