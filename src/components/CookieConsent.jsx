import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CookieConsent.module.css';
import { initializeAnalytics, disableAnalytics } from '../utils/analytics';

const COOKIE_CONSENT_KEY = 'mjp_cookie_consent';
const CONSENT_EXPIRY_DAYS = 365;

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      // Small delay before showing to prevent jarring experience
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const saveConsent = (consentData) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);

    const consent = {
      ...consentData,
      timestamp: new Date().toISOString(),
      expiresAt: expiryDate.toISOString(),
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));

    // Initialize or disable analytics based on consent
    if (consentData.analytics) {
      initializeAnalytics();
    } else {
      disableAnalytics();
    }

    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  const handleTogglePreference = (key) => {
    if (key === 'essential') return; // Cannot disable essential cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} aria-hidden="true" />

      {/* Cookie consent banner */}
      <div
        className={styles.banner}
        role="dialog"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 id="cookie-consent-title" className={styles.title}>
              Cookie Settings
            </h2>
          </div>

          <p id="cookie-consent-description" className={styles.description}>
            We use cookies to enhance your browsing experience, serve personalized content, and
            analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{' '}
            <Link to="/privacy-policy" className={styles.link}>
              Learn more in our Privacy Policy
            </Link>
          </p>

          {!showCustomize ? (
            // Default view - Simple choice
            <div className={styles.actions}>
              <button
                onClick={handleAcceptAll}
                className={`${styles.button} ${styles.buttonPrimary}`}
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className={`${styles.button} ${styles.buttonSecondary}`}
                aria-label="Reject non-essential cookies"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                className={`${styles.button} ${styles.buttonOutline}`}
                aria-label="Customize cookie settings"
              >
                Customize
              </button>
            </div>
          ) : (
            // Customization view
            <div className={styles.customization}>
              <div className={styles.cookieTypes}>
                {/* Essential Cookies */}
                <div className={styles.cookieType}>
                  <div className={styles.cookieHeader}>
                    <label className={styles.cookieLabel}>
                      <input
                        type="checkbox"
                        checked={preferences.essential}
                        disabled
                        className={styles.checkbox}
                        aria-label="Essential cookies (always enabled)"
                      />
                      <span className={styles.cookieName}>Essential Cookies</span>
                      <span className={styles.badge}>Always Enabled</span>
                    </label>
                  </div>
                  <p className={styles.cookieDescription}>
                    Required for the website to function properly. These cookies enable core
                    functionality such as security, network management, and accessibility.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className={styles.cookieType}>
                  <div className={styles.cookieHeader}>
                    <label className={styles.cookieLabel}>
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={() => handleTogglePreference('analytics')}
                        className={styles.checkbox}
                        aria-label="Toggle analytics cookies"
                      />
                      <span className={styles.cookieName}>Analytics Cookies</span>
                    </label>
                  </div>
                  <p className={styles.cookieDescription}>
                    Help us understand how visitors interact with our website by collecting and
                    reporting information anonymously. This helps us improve the user experience.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className={styles.cookieType}>
                  <div className={styles.cookieHeader}>
                    <label className={styles.cookieLabel}>
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={() => handleTogglePreference('marketing')}
                        className={styles.checkbox}
                        aria-label="Toggle marketing cookies"
                      />
                      <span className={styles.cookieName}>Marketing Cookies</span>
                    </label>
                  </div>
                  <p className={styles.cookieDescription}>
                    Used to track visitors across websites to display relevant advertisements and
                    encourage engagement with our content.
                  </p>
                </div>
              </div>

              <div className={styles.customActions}>
                <button
                  onClick={handleSaveCustom}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  aria-label="Save custom cookie preferences"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowCustomize(false)}
                  className={`${styles.button} ${styles.buttonOutline}`}
                  aria-label="Go back to simple choice"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Export utility function to check if user has consented to specific cookie type
export const hasConsentFor = (cookieType) => {
  const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!savedConsent) return false;

  try {
    const consent = JSON.parse(savedConsent);

    // Check if consent has expired
    const expiryDate = new Date(consent.expiresAt);
    if (expiryDate < new Date()) {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      return false;
    }

    return consent[cookieType] === true;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return false;
  }
};

// Export function to reset consent (for "Change Cookie Settings" link in footer)
export const resetCookieConsent = () => {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.location.reload();
};
