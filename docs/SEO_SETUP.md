# SEO & Metadata Setup Guide

This template comes with comprehensive SEO features pre-built and ready to customize for client sites. This guide covers everything you need to optimize a site for search engines.

## Table of Contents
- [Overview](#overview)
- [Quick Start Checklist](#quick-start-checklist)
- [Step 1: Update Theme Configuration](#step-1-update-theme-configuration)
- [Step 2: Update robots.txt](#step-2-update-robotstxt)
- [Step 3: Add Open Graph Image](#step-3-add-open-graph-image)
- [Step 4: Customize Page Metadata](#step-4-customize-page-metadata)
- [Step 5: Verify SEO Implementation](#step-5-verify-seo-implementation)
- [Features Included](#features-included)
- [Advanced SEO](#advanced-seo)
- [Testing & Validation](#testing--validation)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What's Included

This template provides production-ready SEO with:

- ✅ Dynamic page titles and descriptions
- ✅ Open Graph tags for social media sharing
- ✅ Twitter Card support
- ✅ Structured data (JSON-LD) for rich search results
- ✅ Dynamic XML sitemap
- ✅ Canonical URLs
- ✅ robots.txt configuration
- ✅ Mobile-friendly metadata

### SEO Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **SEO Component** | `src/components/SEO.jsx` | Dynamic meta tags for every page |
| **Theme Config** | `src/config/theme.js` | Centralized SEO settings |
| **Sitemap** | `/sitemap.xml` (API endpoint) | Auto-generated XML sitemap |
| **robots.txt** | `public/robots.txt` | Search engine crawler instructions |

---

## Quick Start Checklist

When setting up SEO for a new client site:

- [ ] Update SEO settings in `src/config/theme.js`
- [ ] Update `public/robots.txt` with client domain
- [ ] Add Open Graph image to `public/`
- [ ] Verify sitemap works at `/sitemap.xml`
- [ ] Test social media preview links
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools

---

## Step 1: Update Theme Configuration

### Location
```
src/config/theme.js (lines ~203-211)
```

### Required Changes

Update the SEO section with client information:

```javascript
seo: {
  // Page title (used as fallback and for homepage)
  title: "Client Business Name - Brief Tagline",

  // Meta description (155-160 characters recommended)
  description: "Concise description of the client's business, products, or services. Include primary keywords naturally.",

  // Keywords (comma-separated, not heavily weighted by search engines anymore)
  keywords: "primary keyword, secondary keyword, product type, industry, location",

  // Open Graph image (for social media sharing)
  ogImage: "/og-image.jpg", // Must be absolute URL or path from public/

  // Twitter handle (include @ symbol)
  twitterHandle: "@clienthandle",
},
```

### Best Practices

**Title:**
- Keep under 60 characters
- Include brand name
- Be descriptive and unique

**Description:**
- 155-160 characters optimal
- Include primary keywords naturally
- Make it compelling (increases click-through rate)
- Each page should have unique description

**Keywords:**
- Not critical for modern SEO
- Use 5-10 relevant keywords
- Don't keyword stuff

**Example for E-Commerce Site:**
```javascript
seo: {
  title: "Artisan Coffee Co - Premium Small-Batch Coffee Roasters",
  description: "Discover hand-roasted specialty coffee beans from around the world. Free shipping on orders over $50. Subscribe and save 15%.",
  keywords: "specialty coffee, artisan coffee, coffee beans, coffee subscription, fresh roasted coffee",
  ogImage: "/og-image.jpg",
  twitterHandle: "@artisancoffeeco",
},
```

---

## Step 2: Update robots.txt

### Location
```
public/robots.txt
```

### Required Change

Update the sitemap URL (line 30):

```txt
# BEFORE (template default):
Sitemap: https://yourdomain.com/sitemap.xml

# AFTER (client domain):
Sitemap: https://clientdomain.com/sitemap.xml
```

### Understanding robots.txt

This file tells search engines:
- ✅ **Allow: /** - Crawl all pages
- ❌ **Disallow: /admin** - Don't index admin pages
- ❌ **Disallow: /test-utilities** - Don't index development pages
- 📍 **Sitemap** - Where to find the sitemap

### Common Customizations

**Block specific pages:**
```txt
Disallow: /checkout
Disallow: /thank-you
```

**Block specific bots:**
```txt
User-agent: BadBot
Disallow: /
```

**Allow specific bots only:**
```txt
User-agent: Googlebot
Allow: /

User-agent: *
Disallow: /
```

---

## Step 3: Add Open Graph Image

### What is an Open Graph Image?

The OG image appears when your site is shared on social media (Facebook, LinkedIn, Twitter, Slack, etc.).

### Image Specifications

| Platform | Recommended Size | Aspect Ratio | Max File Size |
|----------|-----------------|--------------|---------------|
| **Facebook** | 1200 x 630 px | 1.91:1 | 8 MB |
| **Twitter** | 1200 x 628 px | 1.91:1 | 5 MB |
| **LinkedIn** | 1200 x 627 px | 1.91:1 | 5 MB |
| **Universal** | 1200 x 630 px | 1.91:1 | < 2 MB |

### How to Add

1. **Create the image:**
   - Design: 1200 x 630 pixels
   - Format: JPG or PNG
   - Include: Brand logo, tagline, or key visual
   - Text: Should be large and readable when thumbnail-sized

2. **Save to public folder:**
   ```
   public/og-image.jpg
   ```

3. **Verify in theme.js:**
   ```javascript
   seo: {
     ogImage: "/og-image.jpg", // ✓ Correct path
   }
   ```

### Design Tips

- **Keep text minimal** - Image will be small in feeds
- **High contrast** - Ensure text is readable
- **Brand consistent** - Use brand colors/fonts
- **Safe zone** - Keep important content in center (edges may be cropped)
- **Test** - Share on Facebook/Twitter to preview

### Alternative: Per-Page OG Images

For product pages or blog posts, pass custom images:

```javascript
<SEO
  title="Product Name"
  image="/images/products/product-hero.jpg"
/>
```

---

## Step 4: Customize Page Metadata

### How SEO Component Works

The template uses a reusable `<SEO>` component on every page:

```javascript
import SEO from '../components/SEO';

function ProductPage() {
  return (
    <>
      <SEO
        title="Product Name"
        description="Product description for search engines"
        image="/images/product.jpg"
        type="product"
      />
      {/* Page content */}
    </>
  );
}
```

### SEO Component Props

| Prop | Type | Description | Required |
|------|------|-------------|----------|
| `title` | string | Page title (brand appended automatically) | ✓ |
| `description` | string | Meta description | ✓ |
| `image` | string | OG image URL (absolute or relative) | Optional |
| `url` | string | Canonical URL | Optional |
| `type` | string | OG type (`website`, `product`, `article`) | Optional |
| `structuredData` | object | JSON-LD structured data | Optional |
| `keywords` | array | Page-specific keywords | Optional |
| `author` | string | Content author | Optional |

### Page-Specific Optimization

**Homepage:**
```javascript
<SEO
  title="Home"
  description="Welcome to [Business]. [Main value proposition in 155 chars]"
  image="/og-image.jpg"
  type="website"
/>
```

**Product Pages:**
```javascript
<SEO
  title={product.name}
  description={product.description.substring(0, 160)}
  image={product.images[0]}
  type="product"
  structuredData={generateProductStructuredData(product)}
/>
```

**Blog/Article Pages:**
```javascript
<SEO
  title={article.title}
  description={article.excerpt}
  image={article.featuredImage}
  type="article"
  author={article.author}
  keywords={article.tags}
/>
```

---

## Step 5: Verify SEO Implementation

### Test Locally

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **View page source** (Ctrl+U or Cmd+U):
   ```html
   <!-- Check for these tags: -->
   <title>Page Title | Brand Name</title>
   <meta name="description" content="...">
   <meta property="og:title" content="...">
   <meta property="og:image" content="...">
   <link rel="canonical" href="...">
   ```

3. **Verify sitemap:**
   ```
   http://localhost:3001/sitemap.xml
   ```
   Should show XML with all pages listed.

### Test Social Media Previews

**Facebook Sharing Debugger:**
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your URL
3. Click "Scrape Again" to refresh cache
4. Verify image and text appear correctly

**Twitter Card Validator:**
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your URL
3. Preview how the card will look
4. Note: Requires Twitter approval for large cards

**LinkedIn Post Inspector:**
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your URL
3. See preview of how link will appear

### Deploy to Production

1. **Push changes:**
   ```bash
   git add .
   git commit -m "config: Update SEO settings for [Client Name]"
   git push
   ```

2. **Deploy to hosting platform**

3. **Verify on live site:**
   - View page source
   - Check /sitemap.xml
   - Test social sharing

### Submit to Search Engines

**Google Search Console:**
1. Go to: https://search.google.com/search-console
2. Add property (client domain)
3. Verify ownership (HTML file or DNS)
4. Submit sitemap: `https://clientdomain.com/sitemap.xml`

**Bing Webmaster Tools:**
1. Go to: https://www.bing.com/webmasters
2. Add site
3. Verify ownership
4. Submit sitemap

---

## Features Included

### 1. Dynamic Meta Tags

Every page automatically gets:

```html
<!-- Basic SEO -->
<title>Page Title | Brand Name</title>
<meta name="description" content="Page description">
<meta name="keywords" content="relevant, keywords">
<link rel="canonical" href="https://domain.com/page">

<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://domain.com/image.jpg">
<meta property="og:url" content="https://domain.com/page">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Description">
<meta name="twitter:image" content="https://domain.com/image.jpg">

<!-- Search Engine Instructions -->
<meta name="robots" content="index, follow">
<meta name="googlebot" content="index, follow">
```

### 2. Structured Data (JSON-LD)

Structured data helps search engines understand your content and can generate rich results (star ratings, prices, availability, etc.).

**Product Schema:**
```javascript
import { generateProductStructuredData } from '../components/SEO';

<SEO
  structuredData={generateProductStructuredData(product)}
/>
```

Generates:
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Product Name",
  "image": ["image1.jpg", "image2.jpg"],
  "description": "Product description",
  "sku": "SKU123",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

**Organization Schema:**
```javascript
import { generateOrganizationStructuredData } from '../components/SEO';

<SEO
  structuredData={generateOrganizationStructuredData()}
/>
```

**Breadcrumb Schema:**
```javascript
import { generateBreadcrumbStructuredData } from '../components/SEO';

const breadcrumbs = [
  { name: "Home", url: "https://domain.com/" },
  { name: "Products", url: "https://domain.com/products" },
  { name: "Product Name", url: "https://domain.com/products/123" }
];

<SEO
  structuredData={generateBreadcrumbStructuredData(breadcrumbs)}
/>
```

### 3. Dynamic Sitemap

The sitemap is automatically generated and includes:
- Homepage
- All product pages (from database)
- Static pages (About, Contact, etc.)
- Last modified dates
- Priority values

**Access:**
```
https://yourdomain.com/sitemap.xml
```

**Sitemap Format:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/products/123</loc>
    <lastmod>2025-01-14</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## Advanced SEO

### Custom Structured Data

Create custom schemas for specific content types:

```javascript
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "image": "https://domain.com/image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Brand Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://domain.com/logo.png"
    }
  },
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-15"
};

<SEO structuredData={articleSchema} />
```

### FAQ Schema

For FAQ pages:

```javascript
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is your return policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer 30-day returns..."
      }
    }
  ]
};
```

### Local Business Schema

For businesses with physical locations:

```javascript
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "image": "https://domain.com/storefront.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "telephone": "+1-555-555-5555",
  "openingHours": "Mo-Fr 09:00-17:00",
  "priceRange": "$$"
};
```

### Multi-Language Support

For international sites:

```javascript
<SEO>
  <link rel="alternate" hreflang="en" href="https://domain.com/en/" />
  <link rel="alternate" hreflang="es" href="https://domain.com/es/" />
  <link rel="alternate" hreflang="fr" href="https://domain.com/fr/" />
</SEO>
```

---

## Testing & Validation

### SEO Testing Tools

**Google Rich Results Test:**
- URL: https://search.google.com/test/rich-results
- Tests: Structured data validity
- Use: Verify product schemas, breadcrumbs, etc.

**Google Mobile-Friendly Test:**
- URL: https://search.google.com/test/mobile-friendly
- Tests: Mobile usability
- Use: Ensure responsive design works

**PageSpeed Insights:**
- URL: https://pagespeed.web.dev/
- Tests: Core Web Vitals, performance
- Use: Optimize loading speed (affects SEO)

**Structured Data Testing Tool:**
- URL: https://validator.schema.org/
- Tests: JSON-LD syntax
- Use: Validate custom schemas

### Manual Checks

**View Page Source Checklist:**
- [ ] Title tag present and unique
- [ ] Meta description present (155-160 chars)
- [ ] Canonical URL matches current page
- [ ] OG image URL is absolute
- [ ] No duplicate meta tags
- [ ] Structured data is valid JSON

**Header Inspection:**
```bash
curl -I https://yourdomain.com
```

Check for:
- HTTP/2 (faster)
- Proper redirects (301, not 302)
- HTTPS enabled
- No 404 errors

### Google Search Console Reports

After submitting sitemap, monitor:

1. **Coverage Report** - Pages indexed vs. errors
2. **Performance Report** - Clicks, impressions, CTR
3. **Core Web Vitals** - LCP, FID, CLS metrics
4. **Mobile Usability** - Mobile-specific issues
5. **Enhancements** - Structured data status

---

## Troubleshooting

### Sitemap Not Loading

**Issue:** `/sitemap.xml` shows 404 error

**Solution:**
1. Verify backend server is running
2. Check server.js for sitemap route (line ~422)
3. Ensure database has products
4. Check browser console for errors

**Test:**
```bash
curl http://localhost:3001/sitemap.xml
```

### Social Media Preview Not Showing

**Issue:** Facebook/Twitter not showing image when shared

**Possible Causes:**

1. **Image doesn't exist:**
   - Verify file at `public/og-image.jpg`
   - Check file permissions

2. **Image URL is relative:**
   - OG images must be absolute URLs
   - SEO component handles this automatically

3. **Cache not cleared:**
   - Use Facebook Debugger to clear cache
   - Click "Scrape Again"

4. **Image too large:**
   - Max 8MB for Facebook
   - Max 5MB for Twitter
   - Compress image if needed

### Structured Data Errors

**Issue:** Google reports structured data errors

**Solutions:**

1. **Test with Rich Results Tool:**
   - https://search.google.com/test/rich-results
   - Fix reported errors

2. **Validate JSON-LD:**
   - https://validator.schema.org/
   - Check syntax errors

3. **Common issues:**
   - Missing required fields
   - Invalid date formats
   - Wrong property types
   - URLs not absolute

### Pages Not Being Indexed

**Issue:** Google not indexing pages

**Solutions:**

1. **Check robots.txt:**
   - Ensure not blocking pages
   - Verify sitemap URL correct

2. **Verify in Search Console:**
   - Submit URL for indexing
   - Check coverage report

3. **Check meta robots:**
   - Should be `index, follow`
   - Not `noindex, nofollow`

4. **Ensure HTTPS:**
   - Google prefers HTTPS
   - Setup SSL certificate

5. **Fix technical errors:**
   - No 404 errors
   - Fast loading speed
   - Mobile-friendly

---

## Best Practices

### Title Tags
- ✅ Unique for every page
- ✅ 50-60 characters
- ✅ Include primary keyword
- ✅ Brand name at end
- ❌ Don't keyword stuff
- ❌ Don't duplicate

### Meta Descriptions
- ✅ Unique for every page
- ✅ 155-160 characters
- ✅ Include call-to-action
- ✅ Include primary keyword naturally
- ❌ Don't duplicate
- ❌ Don't cut off mid-sentence

### Images
- ✅ Use descriptive alt text
- ✅ Optimize file size (< 200KB)
- ✅ Use WebP format when possible
- ✅ Lazy load below fold
- ❌ Don't use generic names (image1.jpg)

### URLs
- ✅ Descriptive and readable
- ✅ Use hyphens (not underscores)
- ✅ Lowercase only
- ✅ Include keywords
- ❌ Don't use special characters
- ❌ Don't use session IDs

### Content
- ✅ Original and unique
- ✅ Comprehensive (1000+ words for guides)
- ✅ Regular updates
- ✅ Internal linking
- ❌ Don't duplicate content
- ❌ Don't hide text

---

## Quick Reference

### File Locations

| File | Purpose |
|------|---------|
| `src/components/SEO.jsx` | SEO component with helpers |
| `src/config/theme.js` | SEO configuration |
| `public/robots.txt` | Crawler instructions |
| `server.js (line ~422)` | Sitemap generation |
| `public/og-image.jpg` | Social media image |

### Configuration Steps

1. Update `src/config/theme.js` → SEO section
2. Update `public/robots.txt` → Sitemap URL
3. Add `public/og-image.jpg` → Social image
4. Test locally → View source
5. Deploy → Submit sitemap
6. Monitor → Search Console

### Testing URLs

- **Rich Results:** https://search.google.com/test/rich-results
- **Mobile-Friendly:** https://search.google.com/test/mobile-friendly
- **PageSpeed:** https://pagespeed.web.dev/
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Validator:** https://cards-dev.twitter.com/validator

---

**Last Updated**: 2025
**Template Version**: 1.0
