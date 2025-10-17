// Google reCAPTCHA v3 utility functions

const RECAPTCHA_SITE_KEY = '6Lcpnu0rAAAAAKEMGepI2nOEyn5h7A8xxFlJMkZk';

/**
 * Execute reCAPTCHA and get token
 * @param {string} action - The action name (e.g., 'contact_form', 'newsletter_subscribe')
 * @returns {Promise<string>} - The reCAPTCHA token
 */
export const getReCaptchaToken = async (action) => {
  try {
    if (!window.grecaptcha) {
      console.warn('reCAPTCHA not loaded yet');
      return null;
    }

    await window.grecaptcha.ready();

    const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });

    return token;
  } catch (error) {
    console.error('Error executing reCAPTCHA:', error);
    return null;
  }
};

/**
 * Verify reCAPTCHA token on the server
 * @param {string} token - The reCAPTCHA token
 * @param {string} action - The action name
 * @returns {Promise<boolean>} - Whether the verification was successful
 */
export const verifyReCaptcha = async (token, action) => {
  try {
    const response = await fetch('http://localhost:3001/api/verify-recaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, action }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
};
