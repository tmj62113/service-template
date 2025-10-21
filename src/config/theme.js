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
  // COLOR SCHEME - Minimalist Palette
  // ===================================================
  colors: {
    // Primary brand colors - Dark for text and headings
    primary: "#101014", // Dark - main text, headings, footer
    primaryHover: "#101014", // Dark - same on hover
    primaryText: "#f2f0ea", // Light text on dark backgrounds

    // Secondary colors - Beige for accents and surfaces
    secondary: "#e1dbcb", // Tan - secondary elements, hover states
    secondaryHover: "#e1dbcb", // Tan - same on hover

    // Accent colors - Tan for CTAs and highlights
    accent: "#e1dbcb", // Tan - primary buttons, CTAs, active states
    accentHover: "#e1dbcb", // Tan - hover states

    // Neutral colors - Light beige base
    background: "#f2f0ea", // Light beige - primary background
    surface: "#f2f0ea", // Light beige - card/surface background
    surfaceHover: "#e1dbcb", // Tan - surface hover state

    // Text colors
    text: "#101014", // Dark - primary text
    textSecondary: "#101014", // Dark - secondary text
    textTertiary: "#101014", // Dark - tertiary text

    // Border colors
    border: "#e1dbcb", // Tan - borders
    borderLight: "#e1dbcb", // Tan - light borders
    borderDark: "#101014", // Dark - dark borders

    // Feedback colors
    error: "#101014", // Dark - error state
    errorLight: "#e1dbcb", // Tan - error background
    success: "#101014", // Dark - success state
    successLight: "#e1dbcb", // Tan - success background
    warning: "#101014", // Dark - warning state
    warningLight: "#e1dbcb", // Tan - warning background
    info: "#101014", // Dark - info state
    infoLight: "#e1dbcb", // Tan - info background
  },

  // ===================================================
  // TYPOGRAPHY
  // ===================================================
  fonts: {
    heading: "'Urbanist', sans-serif", // All headings (h1-h6)
    body: "'Work Sans', sans-serif", // Body text, paragraphs, UI elements
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
    fromName: "Clockwork",
    fromEmail: "bookings@onclockwork.com",
    supportEmail: "support@onclockwork.com",
    logoUrl: "https://onclockwork.com/clockwork_logo.png",
    accentColor: "#8E44AD",
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
