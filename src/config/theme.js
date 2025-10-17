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
  brandName: "Your Store",
  tagline: "Quality Products, Great Prices",

  // Logo and images
  logo: "/logo.png",
  logoAlt: "Your Store Logo",
  favicon: "/favicon.ico",

  // ===================================================
  // COMPANY INFORMATION
  // ===================================================
  company: {
    name: "Your Company LLC",
    email: "hello@yourstore.com",
    supportEmail: "support@yourstore.com",
    phone: "+1 (555) 123-4567",
    address: {
      street: "123 Main Street",
      city: "Your City",
      state: "ST",
      zip: "12345",
      country: "USA",
    },
  },

  // ===================================================
  // SOCIAL MEDIA LINKS
  // ===================================================
  social: {
    facebook: "https://facebook.com/yourstore",
    instagram: "https://instagram.com/yourstore",
    twitter: "https://twitter.com/yourstore",
    pinterest: "https://pinterest.com/yourstore",
    linkedin: "",
    youtube: "",
  },

  // ===================================================
  // COLOR SCHEME
  // ===================================================
  colors: {
    // Primary brand colors
    primary: "#2563EB", // Primary blue
    primaryHover: "#1D4ED8", // Darker blue on hover
    primaryText: "#FFFFFF", // White text on primary

    // Secondary colors
    secondary: "#64748B", // Slate gray
    secondaryHover: "#475569", // Darker gray on hover

    // Accent colors
    accent: "#8B5CF6", // Purple accent
    accentHover: "#7C3AED", // Darker purple on hover

    // Neutral colors
    background: "#FFFFFF", // White background
    surface: "#F8FAFC", // Light gray surface
    surfaceHover: "#F1F5F9", // Slightly darker on hover

    // Text colors
    text: "#1E293B", // Dark text
    textSecondary: "#64748B", // Gray text
    textTertiary: "#94A3B8", // Light gray text

    // Border colors
    border: "#E2E8F0", // Light border
    borderLight: "#F1F5F9", // Very light border
    borderDark: "#CBD5E1", // Darker border

    // Feedback colors
    error: "#EF4444", // Red error
    errorLight: "#FEE2E2", // Error background
    success: "#10B981", // Green success
    successLight: "#D1FAE5", // Success background
    warning: "#F59E0B", // Orange warning
    warningLight: "#FEF3C7", // Warning background
    info: "#3B82F6", // Blue info
    infoLight: "#DBEAFE", // Info background
  },

  // ===================================================
  // TYPOGRAPHY
  // ===================================================
  fonts: {
    heading: "'Inter', sans-serif", // All headings (h1-h6)
    body: "'Inter', sans-serif", // Body text, paragraphs, UI elements
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
    maxWidth: "1200px", // Max container width
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
    fromName: "Your Store",
    fromEmail: "orders@yourstore.com",
    supportEmail: "support@yourstore.com",
    logoUrl: "https://yourstore.com/logo.png",
    accentColor: "#8B5CF6",
    footerText: "© 2025 Your Store. All rights reserved.",
  },

  // ===================================================
  // SEO & META
  // ===================================================
  seo: {
    title: "Your Store - Quality Products Online",
    description: "Shop quality products at great prices. Fast shipping and excellent customer service.",
    keywords: "ecommerce, online store, shop, products, quality",
    ogImage: "/og-image.jpg",
    twitterHandle: "@yourstore",
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
