# Google Analytics 4 Setup Guide

This template comes with Google Analytics 4 (GA4) integration pre-built and ready to activate. This guide will walk you through setting up analytics for a new client site.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Create Google Analytics Account](#step-1-create-google-analytics-account)
- [Step 2: Set Up GA4 Property](#step-2-set-up-ga4-property)
- [Step 3: Configure Application](#step-3-configure-application)
- [Step 4: Test Implementation](#step-4-test-implementation)
- [Step 5: Deploy to Production](#step-5-deploy-to-production)
- [Features Included](#features-included)
- [Privacy & GDPR Compliance](#privacy--gdpr-compliance)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Google account (or client's Google account)
- Access to the client's domain/website
- Access to the codebase (`src/config/theme.js`)

---

## Step 1: Create Google Analytics Account

If the client doesn't already have a Google Analytics account:

1. Go to https://analytics.google.com/
2. Sign in with the client's Google account (or your agency account)
3. Click **"Start measuring"** or **"Admin"** (gear icon, bottom left)
4. Click **"Create Account"**
   - Account Name: Client's company name (e.g., "Acme Corporation")
   - Configure account data sharing settings as needed
   - Click **"Next"**

---

## Step 2: Set Up GA4 Property

### Create Property

1. **Property Setup**:
   - Property name: Client's website name (e.g., "Acme E-Commerce Store")
   - Reporting time zone: Client's timezone
   - Currency: Client's primary currency (e.g., USD)
   - Click **"Next"**

2. **Business Details**:
   - Industry category: Select appropriate category
   - Business size: Select client's business size
   - How you intend to use Google Analytics: Check relevant options
   - Click **"Create"**

3. **Accept Terms of Service**

### Set Up Data Stream

1. **Select Platform**:
   - Click **"Web"**

2. **Configure Stream**:
   - Website URL: Enter client's domain (e.g., `https://www.clientdomain.com`)
   - Stream name: Descriptive name (e.g., "Main Website")
   - Click **"Create stream"**

3. **Copy Measurement ID**:
   - At the top of the stream details page, you'll see **"Measurement ID"**
   - Format: `G-XXXXXXXXXX` (10 characters after G-)
   - **Copy this ID** - you'll need it in the next step
   - Example: `G-ABC123XYZ0`

---

## Step 3: Configure Application

### Update Theme Configuration

1. **Open the theme configuration file**:
   ```
   src/config/theme.js
   ```

2. **Locate the analytics section** (around line 216-231):
   ```javascript
   // ===================================================
   // ANALYTICS & TRACKING
   // ===================================================
   analytics: {
     ga4MeasurementId: null, // ← Replace this line
     // ... rest of config
   },
   ```

3. **Replace `null` with your Measurement ID**:
   ```javascript
   analytics: {
     ga4MeasurementId: "G-ABC123XYZ0", // ← Your actual measurement ID

     // Enable/disable specific tracking features
     enablePageViews: true,
     enableEvents: true,
     enableEcommerce: true,

     // Privacy settings
     anonymizeIp: true,
     respectDoNotTrack: true,
   },
   ```

4. **Save the file**

### Commit Changes

```bash
git add src/config/theme.js
git commit -m "config: Add Google Analytics 4 measurement ID for [Client Name]"
```

---

## Step 4: Test Implementation

### Local Testing

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open the site** in your browser:
   ```
   http://localhost:5173
   ```

3. **Open browser console** (F12 or Right-click → Inspect → Console)

4. **Test cookie consent flow**:
   - Wait for the cookie consent banner to appear (appears after 1 second)
   - Click **"Accept All"** to enable analytics
   - OR click **"Customize"** and enable "Analytics Cookies"

5. **Verify initialization**:
   - Check the console for this message:
     ```
     [Analytics] Google Analytics 4 initialized
     ```
   - If you see this, analytics is properly configured! ✅

6. **Test page tracking**:
   - Navigate to different pages (Shop, About, Products)
   - Each navigation should log:
     ```
     [Analytics] User has not consented to analytics cookies
     ```
     (This appears before you accept cookies, which is correct)

### Real-Time Verification

1. **Go to Google Analytics**:
   - Visit https://analytics.google.com/
   - Select the client's property

2. **Open Real-Time Report**:
   - In the left sidebar, click **"Reports"** → **"Realtime"**
   - OR directly: **Admin** → **Data Streams** → Click stream → **"View real-time data"**

3. **Check for active users**:
   - You should see yourself as an active user
   - Page views should appear within 30-60 seconds
   - Try navigating to different pages and watch them appear

### Test Checklist

- [ ] Console shows `[Analytics] Google Analytics 4 initialized`
- [ ] Cookie consent banner appears
- [ ] Analytics only tracks after accepting cookies
- [ ] Page views appear in GA4 real-time report
- [ ] Navigation between pages is tracked
- [ ] No JavaScript errors in console

---

## Step 5: Deploy to Production

### Push to Repository

```bash
git push origin main
```

### Deploy to Hosting Platform

Deploy to your hosting platform (Vercel, Netlify, AWS, etc.) following your standard deployment process.

### Verify Production Tracking

1. **Visit the live site**
2. **Accept analytics cookies**
3. **Check Google Analytics real-time report**
4. **Navigate multiple pages**
5. **Confirm tracking is working**

### Post-Deployment Checklist

- [ ] Live site loads without errors
- [ ] Cookie consent banner appears
- [ ] Analytics tracking after consent acceptance
- [ ] Real-time reports show live traffic
- [ ] Page views are being recorded
- [ ] No console errors on production

---

## Features Included

### Automatic Tracking

✅ **Page Views**: Automatically tracked on every route change
✅ **Cookie Consent**: Only tracks users who accept analytics cookies
✅ **GDPR Compliant**: IP anonymization enabled by default

### Available Tracking Functions

The following tracking functions are available throughout the codebase:

#### Track Custom Events

```javascript
import { trackEvent } from '../utils/analytics';

// Track any custom event
trackEvent('Category', 'Action', 'Label', value);

// Examples:
trackEvent('Products', 'View', 'Blue T-Shirt', 29.99);
trackEvent('Newsletter', 'Subscribe', 'Footer Form');
trackEvent('Contact', 'Submit', 'Contact Form');
```

#### Track E-Commerce Purchases

```javascript
import { trackPurchase } from '../utils/analytics';

trackPurchase({
  id: 'order-12345',
  total: 149.99,
  currency: 'USD',
  items: [
    {
      item_id: 'SKU-001',
      item_name: 'Product Name',
      price: 49.99,
      quantity: 2
    }
  ]
});
```

#### Track Add to Cart

```javascript
import { trackAddToCart } from '../utils/analytics';

trackAddToCart({
  id: 'product-123',
  name: 'Product Name',
  price: 29.99,
  quantity: 1
});
```

#### Check Analytics Status

```javascript
import { isAnalyticsEnabled } from '../utils/analytics';

if (isAnalyticsEnabled()) {
  console.log('Analytics is active and tracking');
}
```

### Where Tracking is Implemented

- **App.jsx**: Automatic page view tracking on route changes
- **CookieConsent.jsx**: Analytics initialization/disabling based on user consent
- **Checkout flow**: Purchase tracking (when integrated with payment provider)
- **Custom components**: Add event tracking as needed

---

## Privacy & GDPR Compliance

This template includes built-in GDPR compliance features:

### Cookie Consent Banner

- ✅ Appears on first visit
- ✅ Blocks analytics until user accepts
- ✅ Stores preference for 365 days
- ✅ Allows users to change preferences
- ✅ "Change Cookie Settings" link in footer

### Privacy Features

| Feature | Status | Description |
|---------|--------|-------------|
| **IP Anonymization** | ✅ Enabled | User IP addresses are anonymized |
| **Consent Checking** | ✅ Enabled | All tracking checks for user consent |
| **Do Not Track** | ✅ Respected | Honors browser DNT setting |
| **Cookie Banner** | ✅ Included | GDPR-compliant consent UI |
| **Privacy Policy** | ✅ Included | `/privacy-policy` page |

### Compliance Notes

- Analytics only initializes **after** user accepts cookies
- All tracking functions check consent before executing
- Users can revoke consent at any time
- Consent preferences stored in localStorage (not cookies)
- No tracking on users who reject analytics cookies

---

## Advanced Configuration

### Customize Tracking Features

In `src/config/theme.js`, you can enable/disable specific tracking features:

```javascript
analytics: {
  ga4MeasurementId: "G-XXXXXXXXXX",

  // Feature toggles
  enablePageViews: true,     // Track page views
  enableEvents: true,        // Track custom events
  enableEcommerce: true,     // Track purchases and cart events

  // Privacy settings
  anonymizeIp: true,         // Anonymize IP addresses (GDPR)
  respectDoNotTrack: true,   // Respect browser DNT setting
},
```

### Enhanced Measurement (Optional)

You can enable additional tracking in Google Analytics:

1. Go to **Admin** → **Data Streams**
2. Click on your web stream
3. Click **"Enhanced measurement"**
4. Enable these recommended options:
   - ✅ Scrolls (track scroll depth)
   - ✅ Outbound clicks (track external links)
   - ✅ Site search (track search queries)
   - ✅ Video engagement (track video plays)
   - ✅ File downloads (track PDF, etc.)

### Custom Dimensions (Optional)

Add custom dimensions for richer tracking:

1. In GA4, go to **Admin** → **Custom Definitions**
2. Create custom dimensions:
   - User Type (Customer, Visitor, Admin)
   - Product Category
   - Cart Value Range
   - Etc.

---

## Troubleshooting

### Analytics Not Tracking

**Check these common issues:**

1. **Measurement ID is incorrect**
   - Verify format: `G-XXXXXXXXXX` (must start with `G-`)
   - Copy ID directly from GA4 Data Streams
   - Check for typos or extra spaces

2. **User hasn't accepted cookies**
   - Open browser console
   - Look for: `[Analytics] User has not consented to analytics cookies`
   - Solution: Click "Accept All" on cookie banner

3. **Ad blocker is blocking analytics**
   - Disable ad blocker temporarily
   - Or test in incognito/private browsing mode
   - Note: End users with ad blockers won't be tracked (expected)

4. **Console errors**
   - Open browser console (F12)
   - Look for JavaScript errors
   - Check network tab for failed requests to Google Analytics

### Verification Steps

```javascript
// Open browser console and run:

// Check if consent was given
localStorage.getItem('mjp_cookie_consent')

// Expected output: JSON object with analytics: true

// Check if GA4 loaded
window.gtag

// Expected output: function definition (not undefined)
```

### Clear Consent and Test Again

If you need to reset and test the cookie consent flow:

```javascript
// Open browser console and run:
localStorage.clear()
location.reload()
```

This will show the cookie banner again.

### Real-Time Report Not Showing Data

**Wait time**: It can take 30-60 seconds for data to appear in real-time reports.

**Check these:**
1. Are you on the correct GA4 property?
2. Did you select the correct data stream?
3. Is the measurement ID correct in the code?
4. Did you accept analytics cookies?
5. Check browser console for errors

### Debug Mode

Enable debug mode for detailed analytics logging:

```javascript
// In browser console:
window.ga_debug = {trace: true}
location.reload()
```

This will show detailed GA4 debug information in the console.

---

## Support & Resources

### Documentation

- **Google Analytics 4 Help**: https://support.google.com/analytics/
- **GA4 Setup Guide**: https://support.google.com/analytics/answer/9304153
- **react-ga4 Package**: https://www.npmjs.com/package/react-ga4

### Template Files

- **Analytics Utility**: `src/utils/analytics.js`
- **Theme Config**: `src/config/theme.js`
- **Cookie Consent**: `src/components/CookieConsent.jsx`
- **App Integration**: `src/App.jsx`

### Getting Help

If you encounter issues:
1. Check this troubleshooting guide first
2. Review console errors in browser
3. Verify GA4 property setup in Google Analytics
4. Test in incognito mode to rule out browser extensions

---

## Quick Reference

### Configuration File Location
```
src/config/theme.js (line ~221)
```

### Add Measurement ID
```javascript
ga4MeasurementId: "G-XXXXXXXXXX"
```

### Test Locally
```bash
npm run dev
# Then visit http://localhost:5173
# Accept cookies and check console
```

### Verify Tracking
```
Google Analytics → Reports → Realtime
```

### Common Console Messages
- ✅ `[Analytics] Google Analytics 4 initialized` - Working correctly
- ⚠️ `[Analytics] User has not consented to analytics cookies` - User needs to accept cookies
- ⚠️ `[Analytics] GA4 Measurement ID not configured` - Need to add measurement ID

---

## Checklist for New Client Setup

Use this checklist when setting up analytics for a new client:

### Pre-Setup
- [ ] Client has Google account or provide access to yours
- [ ] Confirm client's timezone and currency
- [ ] Confirm client's domain name

### Google Analytics Setup
- [ ] Create GA4 account (if needed)
- [ ] Create GA4 property
- [ ] Set up web data stream
- [ ] Copy measurement ID

### Application Configuration
- [ ] Update `src/config/theme.js` with measurement ID
- [ ] Verify all analytics config settings
- [ ] Test locally with dev server
- [ ] Verify console shows initialization message
- [ ] Check GA4 real-time reports

### Deployment
- [ ] Commit changes to repository
- [ ] Deploy to production
- [ ] Verify tracking on live site
- [ ] Test cookie consent flow on production
- [ ] Confirm data appearing in GA4

### Optional Enhancements
- [ ] Set up enhanced measurement
- [ ] Configure custom dimensions
- [ ] Create custom reports/dashboards
- [ ] Set up conversion goals
- [ ] Configure e-commerce tracking details

---

**Last Updated**: 2025
**Template Version**: 1.0
