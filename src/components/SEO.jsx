import { Helmet } from 'react-helmet-async';
import { theme } from '../config/theme';

/**
 * SEO Component - Dynamic meta tags for each page
 *
 * Handles:
 * - Page title with brand suffix
 * - Meta description
 * - Open Graph tags for social media
 * - Twitter Card tags
 * - Canonical URLs
 * - Structured data (JSON-LD)
 *
 * @param {Object} props
 * @param {string} props.title - Page title (brand name will be appended)
 * @param {string} props.description - Page description
 * @param {string} props.image - OG image URL (absolute URL)
 * @param {string} props.url - Canonical URL (absolute URL)
 * @param {string} props.type - Open Graph type (website, product, article, etc.)
 * @param {Object} props.structuredData - JSON-LD structured data object
 * @param {Array} props.keywords - Array of keywords for the page
 * @param {string} props.author - Page author
 */
export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  structuredData,
  keywords,
  author
}) {
  // Build full title with brand name
  const fullTitle = title
    ? `${title} | ${theme.brandName}`
    : theme.seo.title;

  // Use provided description or fallback to theme default
  const fullDescription = description || theme.seo.description;

  // Build full image URL (ensure it's absolute)
  const fullImage = image || `${window.location.origin}${theme.seo.ogImage}`;

  // Use provided URL or current page URL
  const fullUrl = url || window.location.href;

  // Combine keywords with theme defaults
  const fullKeywords = keywords
    ? [...keywords, ...theme.seo.keywords.split(', ')].join(', ')
    : theme.seo.keywords;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      {author && <meta name="author" content={author} />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph tags for social media (Facebook, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={theme.brandName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      {theme.seo.twitterHandle && (
        <meta name="twitter:site" content={theme.seo.twitterHandle} />
      )}

      {/* Additional meta tags for SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="revisit-after" content="7 days" />

      {/* Structured data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

/**
 * Helper function to generate Product structured data
 *
 * @param {Object} product - Product object
 * @returns {Object} JSON-LD structured data
 */
export function generateProductStructuredData(product) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": theme.brandName
    },
    "offers": {
      "@type": "Offer",
      "url": `${window.location.origin}/products/${product._id}`,
      "priceCurrency": theme.booking.currency,
      "price": product.price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": theme.brandName
      }
    }
  };
}

/**
 * Helper function to generate Organization structured data
 *
 * @returns {Object} JSON-LD structured data
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": theme.brandName,
    "url": window.location.origin,
    "logo": `${window.location.origin}${theme.logo}`,
    "description": theme.seo.description,
    "email": theme.company.email,
    "telephone": theme.company.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": theme.company.address.street,
      "addressLocality": theme.company.address.city,
      "addressRegion": theme.company.address.state,
      "postalCode": theme.company.address.zip,
      "addressCountry": theme.company.address.country
    },
    "sameAs": Object.values(theme.social).filter(Boolean)
  };
}

/**
 * Helper function to generate BreadcrumbList structured data
 *
 * @param {Array} breadcrumbs - Array of {name, url} objects
 * @returns {Object} JSON-LD structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
}
