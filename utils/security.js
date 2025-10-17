/**
 * Security Utilities
 * HTML escaping, input validation, and sanitization functions
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} unsafe - Unsafe user input
 * @returns {string} - HTML-escaped safe string
 */
export function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') {
    return '';
  }

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether email is valid
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email regex - matches most valid emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
}

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} - Whether string length is valid
 */
export function isValidLength(str, min = 0, max = Infinity) {
  if (typeof str !== 'string') {
    return false;
  }
  return str.length >= min && str.length <= max;
}

/**
 * Sanitize string by removing potentially dangerous characters
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') {
    return '';
  }

  // Remove null bytes and control characters
  return str.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Check if request contains honeypot field (bot detection)
 * @param {Object} body - Request body
 * @returns {boolean} - True if honeypot detected (likely bot)
 */
export function isHoneypotFilled(body) {
  // Check common honeypot field names
  const honeypotFields = ['website', 'url', 'phone_number', 'fax'];
  return honeypotFields.some(field => body[field] && body[field].trim() !== '');
}

/**
 * Validate and sanitize contact form input
 * @param {Object} data - Form data
 * @returns {Object} - { valid: boolean, errors: Array, sanitized: Object }
 */
export function validateContactForm(data) {
  const errors = [];
  const sanitized = {};

  // Validate name
  if (!data.name || !isValidLength(data.name, 1, 100)) {
    errors.push('Name is required and must be 1-100 characters');
  } else {
    sanitized.name = sanitizeString(data.name.trim());
  }

  // Validate email
  if (!isValidEmail(data.email)) {
    errors.push('Valid email is required');
  } else {
    sanitized.email = data.email.toLowerCase().trim();
  }

  // Validate subject
  if (!data.subject || !isValidLength(data.subject, 1, 200)) {
    errors.push('Subject is required and must be 1-200 characters');
  } else {
    sanitized.subject = sanitizeString(data.subject.trim());
  }

  // Validate message
  if (!data.message || !isValidLength(data.message, 1, 10000)) {
    errors.push('Message is required and must be 1-10,000 characters');
  } else {
    sanitized.message = sanitizeString(data.message.trim());
  }

  // Pass through mailingList boolean
  sanitized.mailingList = Boolean(data.mailingList);

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Validate newsletter subscription input
 * @param {Object} data - Subscription data
 * @returns {Object} - { valid: boolean, errors: Array, sanitized: Object }
 */
export function validateNewsletterSubscription(data) {
  const errors = [];
  const sanitized = {};

  // Validate email
  if (!isValidEmail(data.email)) {
    errors.push('Valid email is required');
  } else {
    sanitized.email = data.email.toLowerCase().trim();
  }

  // Sanitize optional source
  if (data.source) {
    sanitized.source = sanitizeString(data.source.trim()).substring(0, 50);
  }

  // Sanitize optional metadata
  if (data.metadata && typeof data.metadata === 'object') {
    sanitized.metadata = data.metadata;
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Validate and sanitize product data (admin endpoint)
 * @param {Object} data - Product data
 * @returns {Object} - { valid: boolean, errors: Array, sanitized: Object }
 */
export function validateProductData(data) {
  const errors = [];
  const sanitized = {};

  // Validate and sanitize title
  if (!data.title || !isValidLength(data.title, 1, 200)) {
    errors.push('Product title is required and must be 1-200 characters');
  } else {
    sanitized.title = escapeHtml(sanitizeString(data.title.trim()));
  }

  // Validate and sanitize description
  if (!data.description || !isValidLength(data.description, 1, 5000)) {
    errors.push('Product description is required and must be 1-5,000 characters');
  } else {
    sanitized.description = escapeHtml(sanitizeString(data.description.trim()));
  }

  // Validate price
  if (data.price !== undefined) {
    const price = parseFloat(data.price);
    if (isNaN(price) || price < 0 || price > 1000000) {
      errors.push('Price must be a valid number between 0 and 1,000,000');
    } else {
      sanitized.price = price;
    }
  }

  // Validate quantity
  if (data.quantity !== undefined) {
    const quantity = parseInt(data.quantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      errors.push('Quantity must be a non-negative integer');
    } else {
      sanitized.quantity = quantity;
    }
  }

  // Validate category
  if (data.category) {
    if (!isValidLength(data.category, 1, 50)) {
      errors.push('Category must be 1-50 characters');
    } else {
      sanitized.category = escapeHtml(sanitizeString(data.category.trim()));
    }
  }

  // Validate medium
  if (data.medium) {
    if (!isValidLength(data.medium, 1, 100)) {
      errors.push('Medium must be 1-100 characters');
    } else {
      sanitized.medium = escapeHtml(sanitizeString(data.medium.trim()));
    }
  }

  // Validate dimensions
  if (data.dimensions) {
    if (!isValidLength(data.dimensions, 1, 100)) {
      errors.push('Dimensions must be 1-100 characters');
    } else {
      sanitized.dimensions = escapeHtml(sanitizeString(data.dimensions.trim()));
    }
  }

  // Validate year
  if (data.year) {
    const year = parseInt(data.year, 10);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      errors.push('Year must be a valid year between 1900 and next year');
    } else {
      sanitized.year = year;
    }
  }

  // Sanitize image URL
  if (data.image) {
    sanitized.image = sanitizeString(data.image.trim());
  }

  // Boolean fields
  if (data.featured !== undefined) {
    sanitized.featured = Boolean(data.featured);
  }

  if (data.available !== undefined) {
    sanitized.available = Boolean(data.available);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Validate and sanitize newsletter content (admin endpoint)
 * @param {Object} data - Newsletter data
 * @returns {Object} - { valid: boolean, errors: Array, sanitized: Object }
 */
export function validateNewsletterContent(data) {
  const errors = [];
  const sanitized = {};

  // Validate and sanitize subject
  if (!data.subject || !isValidLength(data.subject, 1, 200)) {
    errors.push('Newsletter subject is required and must be 1-200 characters');
  } else {
    sanitized.subject = escapeHtml(sanitizeString(data.subject.trim()));
  }

  // Validate and sanitize content (HTML allowed for newsletter)
  if (!data.content || !isValidLength(data.content, 1, 100000)) {
    errors.push('Newsletter content is required and must be 1-100,000 characters');
  } else {
    // Don't escape HTML for newsletter content, but sanitize control characters
    sanitized.content = sanitizeString(data.content);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize object by recursively sanitizing all string values
 * @param {Object} obj - Object to sanitize
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {Object} - Sanitized object
 */
export function sanitizeObject(obj, maxDepth = 5) {
  if (maxDepth <= 0 || obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item =>
      typeof item === 'string' ? sanitizeString(item) : sanitizeObject(item, maxDepth - 1)
    );
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, maxDepth - 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
