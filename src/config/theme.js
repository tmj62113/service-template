// =====================================================
// THEME CONFIGURATION
// =====================================================
// Customize these values for different brands/clients
// All visual styling (colors, fonts, spacing) is defined in /src/styles/global.css
// This file contains only non-CSS configuration values
// =====================================================

export const theme = {
  // ===================================================
  // BRAND IDENTITY
  // ===================================================
  brandName: "Clockwork",
  tagline: "your business, always on time",

  // Logo and images
  logo: "/clockwork_logo.png",
  logoAlt: "Clockwork Logo",
  favicon: "/clockwork_favicon.png",

  // ===================================================
  // COMPANY INFORMATION
  // ===================================================
  company: {
    name: "Clockwork",
    email: "hello@onclockwork.com",
    supportEmail: "support@onclockwork.com",
    phone: "+1 (555) 555-5555",
    address: {
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      country: "USA",
    },
  },

  // ===================================================
  // SOCIAL MEDIA LINKS
  // ===================================================
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
  },

  // ===================================================
  // BOOKING & PAYMENT SETTINGS
  // ===================================================
  booking: {
    currency: "USD",
    currencySymbol: "$",
    currencyPosition: "before", // "before" or "after"
    taxRate: 0.08, // 8% (adjust for your region)

    // Service display settings
    servicesPerPage: 12,
  },

  // ===================================================
  // FEATURES TOGGLES
  // ===================================================
  features: {
    // Service features
    showRatings: false,
    showReviews: true,
    showCategories: true,

    // User features
    enableGuestCheckout: true,
    enableSocialLogin: false,

    // Booking features
    enableCoupons: false,
    enableGiftCards: false,
    enableRecurringBookings: true,

    // Search & filters
    enableSearch: true,
    enableFilters: true,
    enableSort: true,
  },

  // ===================================================
  // EMAIL BRANDING
  // ===================================================
  email: {
    fromName: "Clockwork",
    fromEmail: "bookings@onclockwork.com",
    supportEmail: "support@onclockwork.com",
    logoUrl: "https://onclockwork.com/clockwork_logo.png",
    footerText: "© 2025 Clockwork. All rights reserved.",
  },

  // ===================================================
  // SEO & META
  // ===================================================
  seo: {
    title: "Clockwork - your business, always on time",
    description: "Streamline your booking process with Clockwork. Schedule appointments, manage services, and grow your business with our powerful booking platform.",
    keywords: "booking, appointments, scheduling, calendar, services, business management, booking system",
    ogImage: "/og-image.jpg",
    twitterHandle: "@clockwork",
  },

  // ===================================================
  // ANALYTICS & TRACKING
  // ===================================================
  analytics: {
    // Google Analytics 4 Measurement ID
    // Get this from: https://analytics.google.com/ > Admin > Data Streams
    // Format: G-XXXXXXXXXX
    // Set to null to disable analytics
    ga4MeasurementId: null, // Replace with your GA4 ID (e.g., "G-XXXXXXXXXX")

    // Enable/disable specific tracking features
    enablePageViews: true,
    enableEvents: true,
    enableEcommerce: true,

    // Privacy settings
    anonymizeIp: true, // GDPR compliance - anonymize IP addresses
    respectDoNotTrack: true, // Respect browser's Do Not Track setting
  },
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Format currency based on theme settings
export const formatCurrency = (amount) => {
  const { currency, currencySymbol, currencyPosition } = theme.booking;
  const formatted = amount.toFixed(2);
  return currencyPosition === "before"
    ? `${currencySymbol}${formatted}`
    : `${formatted}${currencySymbol}`;
};

// Check if feature is enabled
export const isFeatureEnabled = (featureName) => {
  return theme.features[featureName] || false;
};

// Get company contact info
export const getContactInfo = () => {
  return {
    email: theme.company.email,
    supportEmail: theme.company.supportEmail,
    phone: theme.company.phone,
    address: theme.company.address,
  };
};
