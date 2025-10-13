# 🎯 New Client Setup Guide

**Quick reference for setting up this whitelabel e-commerce template for a new client.**

---

## 📋 Before You Start

Gather the following information from your client:

- [ ] **Brand Name** - What should the store be called?
- [ ] **Brand Colors** - Primary, secondary, accent colors (hex codes)
- [ ] **Logo Files** - Logo image and favicon
- [ ] **Company Details** - Legal name, email, phone, address
- [ ] **Social Media** - Links to Facebook, Instagram, Twitter, etc.
- [ ] **Domain Name** - What domain will they use? (for production)
- [ ] **Commerce Settings** - Currency, tax rate, shipping threshold
- [ ] **Feature Requirements** - Do they need ratings? Wishlist? Coupons?

---

## 🚀 Step 1: Clone for New Client

```bash
# Clone the template
git clone <repository-url> client-store-name
cd client-store-name

# Remove existing git history (optional - start fresh)
rm -rf .git
git init
```

---

## ⚙️ Step 2: Run Setup Wizard

```bash
# Make setup script executable
chmod +x setup.sh

# Run interactive setup
./setup.sh
```

The wizard will:
- Check prerequisites
- Install dependencies
- Create `.env` file
- Prompt for all API keys (MongoDB, Stripe, Resend, Cloudinary)
- Generate secure JWT secret
- Open theme.js for customization

**Alternative:** For manual setup, follow [SETUP.md](./SETUP.md)

---

## 🎨 Step 3: Customize Branding

Edit `/src/config/theme.js` with client's information:

### 3.1 Brand Identity
```javascript
brandName: "Client Store Name",
tagline: "Client's Tagline Here",
logo: "/logo.png",
favicon: "/favicon.ico",
```

### 3.2 Company Information
```javascript
company: {
  name: "Client Company LLC",
  email: "hello@clientstore.com",
  supportEmail: "support@clientstore.com",
  phone: "+1 (555) 123-4567",
  address: {
    street: "123 Client Street",
    city: "Client City",
    state: "CA",
    zip: "90001",
    country: "USA",
  },
}
```

### 3.3 Social Media Links
```javascript
social: {
  facebook: "https://facebook.com/clientstore",
  instagram: "https://instagram.com/clientstore",
  twitter: "https://twitter.com/clientstore",
  pinterest: "https://pinterest.com/clientstore",
  linkedin: "https://linkedin.com/company/clientstore",
  youtube: "https://youtube.com/@clientstore",
}
```

### 3.4 Brand Colors
```javascript
colors: {
  primary: "#CLIENT_PRIMARY_COLOR",      // Main brand color
  primaryHover: "#DARKER_SHADE",         // Hover state
  secondary: "#CLIENT_SECONDARY_COLOR",  // Accent color
  accent: "#CLIENT_ACCENT_COLOR",        // Call-to-action
  // ... keep other colors or customize further
}
```

### 3.5 Commerce Settings
```javascript
commerce: {
  currency: "USD",              // Change if different country
  currencySymbol: "$",          // Update if needed
  taxRate: 0.08,                // Client's tax rate (8% = 0.08)
  shippingThreshold: 50,        // Free shipping over $X
}
```

### 3.6 Feature Toggles
```javascript
features: {
  showRatings: true,            // Product ratings?
  showReviews: true,            // Customer reviews?
  enableWishlist: true,         // Wishlist feature?
  enableCoupons: false,         // Discount coupons?
  enableGiftCards: false,       // Gift cards?
}
```

### 3.7 Email Branding
```javascript
email: {
  fromName: "Client Store Name",
  fromEmail: "orders@clientstore.com",  // Must be verified in Resend
  supportEmail: "support@clientstore.com",
  logoUrl: "https://clientstore.com/logo.png",
}
```

### 3.8 SEO Configuration
```javascript
seo: {
  title: "Client Store - Tagline",
  description: "Brief description of client's store for search engines",
  keywords: "relevant, keywords, for, client, industry",
  twitterHandle: "@clientstore",
}
```

---

## 🖼️ Step 4: Replace Logo & Favicon

```bash
# Replace these files in /public folder:
/public/logo.png          # Client's logo
/public/favicon.ico       # Client's favicon
/public/og-image.jpg      # Social media preview image (1200x630px)
```

---

## 🎨 Step 5: Customize CSS Styling

### Option 1: Use Utility Classes (No Custom CSS)

The template provides reusable utility classes (BEM naming):

```html
<!-- Buttons -->
<button class="btn btn--primary">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--outline">Outline</button>

<!-- Cards -->
<div class="card card--lg">Large Card</div>
<div class="card card--elevated">Elevated Card</div>

<!-- Typography -->
<h1 class="heading heading--xl">Large Heading</h1>
<p class="text text--muted">Muted text</p>
```

**Available Utilities:**
- Buttons: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--outline`, `.btn--sm`, `.btn--lg`
- Cards: `.card`, `.card--sm`, `.card--lg`, `.card--elevated`, `.card--bordered`
- Typography: `.heading`, `.text`, `.text--muted`, `.text--bold`, `.text--uppercase`
- Badges: `.badge`, `.badge--success`, `.badge--error`, `.badge--warning`

### Option 2: Add Custom CSS (For Advanced Styling)

For client-specific styles, edit `/src/styles/client.css`:

```css
/* client.css */

/* Custom button styling */
.btn--primary {
  background: linear-gradient(135deg, #custom-color-1, #custom-color-2);
  border-radius: 25px;
}

/* Custom product card styling */
.product-card {
  border: 2px solid var(--color-primary);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Custom header */
.header {
  background: var(--color-dark);
  padding: 24px 0;
}
```

**Important:**
- ✅ Always use CSS variables: `var(--color-primary)`, `var(--spacing-lg)`
- ✅ Add all client customizations to `client.css` only
- ❌ Never modify `template.css` or `design-system.css`

**For detailed guide, see:** [CSS_CUSTOMIZATION.md](./CSS_CUSTOMIZATION.md)

**CSS File Structure:**
```
src/styles/
├── design-system.css    # Variables + utilities (DON'T MODIFY)
├── template.css         # All template styles (DON'T MODIFY)
└── client.css           # CLIENT CUSTOMIZATIONS (EDIT THIS)
```

---

## 📦 Step 6: Update package.json

```json
{
  "name": "client-store-name",
  "version": "1.0.0",
  "description": "E-commerce store for [Client Name]",
  ...
}
```

---

## 🗄️ Step 7: Configure Services

### MongoDB Atlas
1. Create new database (or use existing cluster)
2. Database name: `client_store_production` (or similar)
3. Add your IP to whitelist
4. Copy connection string to `.env`

### Stripe
1. Use **TEST MODE** for development
2. Get secret key from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
3. Add to `.env` as `STRIPE_SECRET_KEY`

### Resend
1. Create API key from [Resend](https://resend.com/api-keys)
2. Verify sender domain (orders@clientstore.com)
3. Add to `.env` as `RESEND_API_KEY`

### Cloudinary
1. Get credentials from [Cloudinary Console](https://console.cloudinary.com/)
2. Add cloud name, API key, and API secret to `.env`

---

## 🚀 Step 8: Test Locally

Start all three required processes:

### Terminal 1 - Backend
```bash
node server.js
```

### Terminal 2 - Frontend
```bash
npm run dev
```

### Terminal 3 - Stripe Webhooks
```bash
stripe listen --forward-to localhost:3001/api/webhook
# Copy the webhook secret to .env and restart backend
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## ✅ Step 9: Create Admin User

Use MongoDB Compass or create a script to add admin user:

```javascript
// Quick admin creation
{
  "email": "admin@clientstore.com",
  "password": "[bcrypt hashed password]",
  "name": "Admin User",
  "role": "admin",
  "createdAt": new Date()
}
```

Or see [SETUP.md Step 7](./SETUP.md#step-7-create-admin-user) for detailed instructions.

---

## 📦 Step 10: Add Client's Products

1. Login to admin dashboard: http://localhost:5173/admin
2. Navigate to Products
3. Add client's products with:
   - Product name and description
   - Price and inventory
   - Categories
   - Images (uploaded to Cloudinary)

---

## 🧪 Step 11: Test Order Flow

**Critical Test - Do this BEFORE deploying:**

1. Go to http://localhost:5173
2. Add product to cart
3. Proceed to checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete payment

**Verify:**
- [ ] Redirects to success page
- [ ] Order appears in MongoDB database
- [ ] Confirmation email sent to customer
- [ ] Inventory decremented
- [ ] Backend logs show "✅ Payment successful"
- [ ] Stripe webhook shows as successful

**If any step fails, see [Troubleshooting](./SETUP.md#troubleshooting)**

---

## 🌐 Step 12: Deploy to Production

Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment:

1. **Frontend**: Deploy to Vercel or Netlify
2. **Backend**: Deploy to Railway, Render, or Heroku
3. **Stripe**: Configure production webhooks (NOT CLI)
4. **MongoDB**: Switch to production database
5. **Environment Variables**: Update all services to production keys
6. **Domain**: Configure custom domain
7. **SSL**: Enable HTTPS

---

## 📋 Post-Deployment Checklist

- [ ] All environment variables set to production values
- [ ] Stripe switched to **LIVE MODE** (not test)
- [ ] Production webhook configured in Stripe dashboard
- [ ] Custom domain configured and SSL enabled
- [ ] Test order on production site
- [ ] Verify order saved to database
- [ ] Verify confirmation email sent
- [ ] Set up monitoring (UptimeRobot, etc.)
- [ ] Train client on admin dashboard
- [ ] Document client-specific customizations

---

## 🎉 Handoff to Client

Provide client with:

1. **Admin Credentials**
   - Admin dashboard URL: https://clientstore.com/admin
   - Email and password

2. **Service Access**
   - Stripe dashboard (transfer ownership or add as team member)
   - MongoDB Atlas (add as project member if needed)
   - Cloudinary (share account or transfer)

3. **Documentation**
   - How to add/edit products
   - How to view orders
   - How to manage customers
   - How to create shipping labels (if using Shippo)

4. **Support Information**
   - Your contact for technical issues
   - Service status pages
   - Common troubleshooting steps

---

## 🔄 For Multiple Clients

**Best Practice:** Create a new repository for each client:

```bash
# Create client-specific repo
gh repo create client-store-name --private
cd client-store-name

# Copy template
cp -r ../whitelabel-ecommerce-template/* .

# Run setup for this client
./setup.sh
```

This keeps each client's code and configuration isolated.

---

## 📚 Additional Resources

- **[SETUP.md](./SETUP.md)** - Detailed step-by-step setup instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[README.md](./README.md)** - General application documentation
- **[.claude/CLAUDE.md](./.claude/CLAUDE.md)** - Development guidelines

---

## 🆘 Common Issues

### Products Not Loading
- Check backend server is running
- Verify MongoDB connection string
- Ensure IP is whitelisted in MongoDB Atlas

### Orders Not Being Created
- **MOST COMMON:** Stripe webhook listener not running (Terminal 3)
- Verify `STRIPE_WEBHOOK_SECRET` in `.env`
- Check backend logs for webhook events

### Emails Not Sending
- Verify sender domain in Resend
- Check `RESEND_API_KEY` is correct
- Stripe webhook must be running (triggers emails)

**For more troubleshooting, see [SETUP.md - Troubleshooting](./SETUP.md#troubleshooting)**

---

## 💡 Tips for Success

1. **Test Locally First** - Always test complete order flow before deploying
2. **Use Test Mode** - Stripe test mode for all development
3. **Document Changes** - Keep notes on client-specific customizations
4. **Version Control** - Commit after each major customization step
5. **Backup Database** - Export MongoDB data before major changes
6. **Monitor Production** - Set up uptime monitoring immediately

---

**Questions?** See detailed documentation in [SETUP.md](./SETUP.md) and [DEPLOYMENT.md](./DEPLOYMENT.md).

**Happy building! 🛍️**
