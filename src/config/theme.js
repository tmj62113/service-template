// =====================================================
// WHITELABEL THEME CONFIGURATION
// =====================================================
// Customize these values for different brands/clients
// This is the SINGLE SOURCE OF TRUTH for all branding
// =====================================================

export const theme = {
  // ===================================================
  // BRAND IDENTITY
  // ===================================================
  brandName: "Booked",
  tagline: "Schedule Your Success",

  // Logo and images
  logo: "/booked_logo.png",
  logoAlt: "Booked Logo",
  favicon: "/favicon.ico",

  // ===================================================
  // COMPANY INFORMATION
  // ===================================================
  company: {
    name: "Booked",
    email: "hello@booked.app",
    supportEmail: "support@booked.app",
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
  // COLOR SCHEME - Mark J Peterson Art Brand
  // ===================================================
  colors: {
    // Primary brand colors - Dark blues for text and headings
    primary: "#122D38", // Gunmetal - main text, headings, footer
    primaryHover: "#0C3A4B", // Charcoal - darker shade on hover
    primaryText: "#F7F6EF", // Cream text on dark backgrounds

    // Secondary colors - Browns for accents
    secondary: "#692413", // Seal brown - deep brown accent, borders
    secondaryHover: "#B93A0C", // Rust - accent rust (minimal usage)

    // Accent colors - Golds for CTAs and highlights
    accent: "#C0A679", // Ecru - primary buttons, CTAs, active states
    accentHover: "#B49A68", // Lion - hover states, borders (often 20% opacity)

    // Neutral colors - Cream base
    background: "#F7F6EF", // Cream - primary background (replaces white everywhere)
    surface: "#F7F6EF", // Cream - card/surface background
    surfaceHover: "#EFEEE5", // Slightly darker cream on hover

    // Text colors
    text: "#122D38", // Gunmetal - primary text
    textSecondary: "#0C3A4B", // Charcoal - secondary/muted text
    textTertiary: "#B49A68", // Lion - tertiary/accent text

    // Border colors
    border: "rgba(180, 154, 104, 0.2)", // Lion at 20% opacity - subtle borders
    borderLight: "rgba(180, 154, 104, 0.1)", // Lion at 10% opacity - very subtle
    borderDark: "#692413", // Seal brown - darker borders

    // Feedback colors
    error: "#B93A0C", // Rust - error state
    errorLight: "#FEE2E2", // Error background
    success: "#10B981", // Success state
    successLight: "#D1FAE5", // Success background
    warning: "#F59E0B", // Warning state
    warningLight: "#FEF3C7", // Warning background
    info: "#0C3A4B", // Charcoal - info state
    infoLight: "#DBEAFE", // Info background
  },

  // ===================================================
  // TYPOGRAPHY - Mark J Peterson Art Brand
  // ===================================================
  fonts: {
    heading: "'Anton', sans-serif", // All headings (h1-h6)
    body: "'Barlow Semi Condensed', sans-serif", // Body text, paragraphs, UI elements
    mono: "'Courier New', monospace",
  },

  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // ===================================================
  // LAYOUT & SPACING
  // ===================================================
  layout: {
    maxWidth: "1050px", // MJ Peterson Art design system max container width
    maxWidthNarrow: "800px",
    borderRadius: "8px", // Cards and images
    borderRadiusLarge: "9999px", // Circular buttons/icons
    borderRadiusSmall: "4px", // Buttons

    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
      "2xl": "48px",
      "3xl": "64px",
    },

    breakpoints: {
      mobile: "640px",
      tablet: "768px",
      desktop: "1024px",
      wide: "1280px",
    },
  },

  // ===================================================
  // COMMERCE SETTINGS
  // ===================================================
  commerce: {
    currency: "USD",
    currencySymbol: "$",
    currencyPosition: "before", // "before" or "after"
    taxRate: 0.08, // 8% (adjust for your region)
    shippingThreshold: 50, // Free shipping over $50

    // Product display settings
    productsPerPage: 12,
    showOutOfStock: true,
    allowBackorders: false,
  },

  // ===================================================
  // FEATURES TOGGLES
  // ===================================================
  features: {
    // Product features
    showRatings: false,
    showReviews: true,
    showStock: true,
    showCategories: true,

    // User features
    enableWishlist: true,
    enableGuestCheckout: true,
    enableSocialLogin: false,

    // Commerce features
    enableCoupons: false,
    enableGiftCards: false,
    enableSubscriptions: false,

    // Search & filters
    enableSearch: true,
    enableFilters: true,
    enableSort: true,
  },

  // ===================================================
  // EMAIL BRANDING
  // ===================================================
  email: {
    fromName: "Booked",
    fromEmail: "bookings@booked.app",
    supportEmail: "support@booked.app",
    logoUrl: "https://booked.app/booked_logo.png",
    accentColor: "#8E44AD",
    footerText: "© 2025 Booked. All rights reserved.",
  },

  // ===================================================
  // SEO & META
  // ===================================================
  seo: {
    title: "Booked - Schedule Your Success",
    description: "Streamline your booking process with Booked. Schedule appointments, manage services, and grow your business with our powerful booking platform.",
    keywords: "booking, appointments, scheduling, calendar, services, business management, booking system",
    ogImage: "/og-image.jpg",
    twitterHandle: "@booked",
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
// CSS VARIABLES GENERATOR
// =====================================================
// Converts theme values to CSS custom properties
export const getCSSVariables = () => {
  const { colors, fonts, layout, fontSize, fontWeight } = theme;

  return {
    // Colors
    "--color-primary": colors.primary,
    "--color-primary-hover": colors.primaryHover,
    "--color-primary-text": colors.primaryText,
    "--color-secondary": colors.secondary,
    "--color-secondary-hover": colors.secondaryHover,
    "--color-accent": colors.accent,
    "--color-accent-hover": colors.accentHover,
    "--color-background": colors.background,
    "--color-surface": colors.surface,
    "--color-surface-hover": colors.surfaceHover,
    "--color-text": colors.text,
    "--color-text-secondary": colors.textSecondary,
    "--color-text-tertiary": colors.textTertiary,
    "--color-border": colors.border,
    "--color-border-light": colors.borderLight,
    "--color-border-dark": colors.borderDark,
    "--color-error": colors.error,
    "--color-error-light": colors.errorLight,
    "--color-success": colors.success,
    "--color-success-light": colors.successLight,
    "--color-warning": colors.warning,
    "--color-warning-light": colors.warningLight,
    "--color-info": colors.info,
    "--color-info-light": colors.infoLight,

    // Typography
    "--font-heading": fonts.heading,
    "--font-body": fonts.body,
    "--font-mono": fonts.mono,

    // Font sizes
    "--font-size-xs": fontSize.xs,
    "--font-size-sm": fontSize.sm,
    "--font-size-base": fontSize.base,
    "--font-size-lg": fontSize.lg,
    "--font-size-xl": fontSize.xl,
    "--font-size-2xl": fontSize["2xl"],
    "--font-size-3xl": fontSize["3xl"],
    "--font-size-4xl": fontSize["4xl"],
    "--font-size-5xl": fontSize["5xl"],

    // Font weights
    "--font-weight-normal": fontWeight.normal,
    "--font-weight-medium": fontWeight.medium,
    "--font-weight-semibold": fontWeight.semibold,
    "--font-weight-bold": fontWeight.bold,

    // Layout
    "--border-radius": layout.borderRadius,
    "--border-radius-large": layout.borderRadiusLarge,
    "--border-radius-small": layout.borderRadiusSmall,
    "--max-width": layout.maxWidth,
    "--max-width-narrow": layout.maxWidthNarrow,

    // Spacing
    "--spacing-xs": layout.spacing.xs,
    "--spacing-sm": layout.spacing.sm,
    "--spacing-md": layout.spacing.md,
    "--spacing-lg": layout.spacing.lg,
    "--spacing-xl": layout.spacing.xl,
    "--spacing-2xl": layout.spacing["2xl"],
    "--spacing-3xl": layout.spacing["3xl"],
  };
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Format currency based on theme settings
export const formatCurrency = (amount) => {
  const { currency, currencySymbol, currencyPosition } = theme.commerce;
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
