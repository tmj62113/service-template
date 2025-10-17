# Whitelabel E-Commerce Template Setup Guide

This application is designed to be reusable as a template for future e-commerce projects. Follow this guide to customize it for a new client.

## 🎨 What This Template Provides

### Core Features
- **Product Management**: Full CRUD for products with image uploads (Cloudinary)
- **Shopping Cart**: Zustand-powered cart with local persistence
- **Checkout**: Stripe integration for payments
- **Order Management**: Complete order tracking and fulfillment
- **Customer Management**: Customer profiles and order history
- **Contact Forms**: Customer inquiries with email notifications
- **Newsletter System**: Email campaigns with subscriber management
- **Admin Dashboard**: Full-featured admin interface
- **Security**: Comprehensive security measures (see PRODUCTION_SECURITY_CHECKLIST.md)
- **Audit Logging**: Track all admin actions and security events
- **IP Blocking**: Manual and automatic blocking of suspicious IPs

### Tech Stack
- **Frontend**: React 19 + Vite + React Router 7
- **Backend**: Express.js + Node.js
- **Database**: MongoDB Atlas
- **State Management**: Zustand
- **Payment Processing**: Stripe
- **Email**: Resend
- **Image Hosting**: Cloudinary
- **Styling**: CSS with design system
- **Shipping**: Shippo (optional)

---

## 🚀 Quick Start for New Project

### 1. Clone and Rename

```bash
# Clone this template
git clone [your-template-repo-url] new-client-name

# Navigate to new project
cd new-client-name

# Remove old git history
rm -rf .git

# Initialize new git repository
git init
git add .
git commit -m "Initial commit from e-commerce template"

# Create new GitHub repository and push
gh repo create new-client-name --private --source=. --remote=origin --push
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in all required values in `.env`:

```env
# ============================================
# DATABASE
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# ============================================
# AUTHENTICATION
# ============================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_64_character_random_string_here

# ============================================
# STRIPE (Payment Processing)
# ============================================
STRIPE_SECRET_KEY=sk_test_... (get from https://dashboard.stripe.com/apikeys)
STRIPE_WEBHOOK_SECRET=whsec_... (get from `stripe listen` command)
STRIPE_PUBLISHABLE_KEY=pk_test_... (for frontend)

# ============================================
# RESEND (Email Service)
# ============================================
RESEND_API_KEY=re_... (get from https://resend.com/api-keys)

# ============================================
# CLOUDINARY (Image Hosting)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name (get from https://cloudinary.com/console)
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# SHIPPO (Shipping - Optional)
# ============================================
SHIPPO_API_TOKEN=shippo_test_... (get from https://goshippo.com/api)

# ============================================
# APPLICATION
# ============================================
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
```

### 4. Customize Branding

#### Update Theme Configuration (`src/config/theme.js`)

```javascript
export const theme = {
  // Client's brand name
  brandName: 'Client Business Name',

  // Client's brand colors (replace with their brand colors)
  colors: {
    primary: '#3B82F6',      // Main brand color
    secondary: '#10B981',    // Secondary/accent color
    accent: '#F59E0B',       // Tertiary accent
    dark: '#1F2937',         // Dark text/backgrounds
    light: '#F9FAFB',        // Light backgrounds
  },

  // Client's typography
  fonts: {
    heading: "'Montserrat', sans-serif",  // Headers
    body: "'Open Sans', sans-serif",      // Body text
  },

  // Rest remains the same (spacing, radius, shadows)
  // ...
};
```

#### Update Package.json

```json
{
  "name": "client-business-name",
  "version": "1.0.0",
  "description": "E-commerce store for Client Business Name",
  // ... rest of package.json
}
```

#### Update HTML Title and Meta (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Update these -->
    <title>Client Business Name - E-Commerce Store</title>
    <meta name="description" content="Shop Client Business Name products online" />

    <!-- Update Google Fonts if using different fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 5. Update Client-Specific Content

#### Header and Footer (`src/components/Header.jsx`, `src/components/Footer.jsx`)

- Update logo (replace logo image in `/public/` or update logo component)
- Update navigation links if needed
- Update footer content (copyright, links, social media)

#### About Page (`src/pages/About.jsx`)

- Replace with client's story
- Update images
- Update contact information

#### Home Page (`src/pages/Home.jsx`)

- Update hero section with client's messaging
- Replace featured products logic if needed
- Update call-to-action buttons

### 6. Configure Third-Party Services

#### MongoDB Atlas
1. Create new database cluster
2. Create database user with readWrite permissions
3. Whitelist your IP address
4. Copy connection string to `.env` as `MONGODB_URI`

#### Stripe
1. Create new Stripe account (or use existing)
2. Get API keys from https://dashboard.stripe.com/apikeys
3. Set up webhook endpoint (see "Running the Application" below)
4. Configure products and pricing in Stripe Dashboard (optional)

#### Resend
1. Create account at https://resend.com
2. Get API key from https://resend.com/api-keys
3. Verify domain for production (optional for development)
4. Update email sender addresses in `server.js`

#### Cloudinary
1. Create account at https://cloudinary.com
2. Get credentials from console
3. Configure upload presets if needed

#### Shippo (Optional)
1. Create account at https://goshippo.com
2. Get API token
3. Configure shipping rates and carriers

### 7. Create Admin User

```bash
node scripts/createAdmin.js
```

Follow the prompts to create the first admin account.

### 8. Running the Application

**IMPORTANT**: Three processes must be running:

**Terminal 1 - Backend Server:**
```bash
node server.js
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```

**Terminal 3 - Stripe Webhook Listener:**
```bash
stripe listen --forward-to localhost:3001/api/webhook
```

Copy the webhook signing secret from Terminal 3 and add to `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

Then restart the backend server (Terminal 1).

### 9. Verify Everything Works

1. **Frontend**: http://localhost:5173
2. **Admin Login**: http://localhost:5173/login
3. **Create a test product** via admin dashboard
4. **Test checkout flow** with Stripe test card: `4242 4242 4242 4242`
5. **Check order was created** in admin orders
6. **Verify email was sent** (check Resend dashboard)

---

## 🎨 Customization Guide

### Design System Customization

The application uses a centralized design system with CSS variables. All visual customization should be done through:

1. **`src/config/theme.js`** - Brand colors, fonts, spacing
2. **`src/styles/client.css`** - Client-specific CSS overrides
3. **DO NOT EDIT** `src/styles/design-system.css` or `src/styles/template.css`

### Adding Custom Functionality

#### New Product Fields

**1. Update Database Model** (`db/models/Product.js`):
```javascript
const product = {
  // Existing fields...
  customField: data.customField || null,
};
```

**2. Update Validation** (`utils/security.js`):
```javascript
export function validateProductData(data) {
  // Add validation for new field
  if (data.customField) {
    sanitized.customField = sanitizeString(data.customField);
  }
}
```

**3. Update Admin Form** (`src/pages/AdminProducts.jsx`):
```javascript
// Add to product modal form
<div className="form-group">
  <label htmlFor="customField">Custom Field</label>
  <input
    type="text"
    id="customField"
    name="customField"
    value={editingProduct?.customField || ''}
    onChange={(e) => setEditingProduct({
      ...editingProduct,
      customField: e.target.value
    })}
  />
</div>
```

**4. Update Frontend Display** (`src/pages/Products.jsx`, `src/pages/ProductDetail.jsx`):
```javascript
{product.customField && (
  <p className="product-custom">{product.customField}</p>
)}
```

### Changing Email Templates

Email templates are in `utils/emailTemplates.js`. To customize:

1. Update HTML structure
2. Update brand colors to match client
3. Update footer content
4. Test emails in development

### Adding New Pages

**1. Create page component** (`src/pages/NewPage.jsx`):
```javascript
export default function NewPage() {
  return (
    <div className="page-container">
      <h1>New Page</h1>
      <p>Content here</p>
    </div>
  );
}
```

**2. Add route** (`src/App.jsx`):
```javascript
<Route path="/new-page" element={<NewPage />} />
```

**3. Add navigation link** (`src/components/Header.jsx`):
```javascript
<Link to="/new-page">New Page</Link>
```

---

## 🔧 Common Customizations

### Change Product Categories

**Update** `src/pages/Products.jsx`:
```javascript
const categories = [
  { label: 'All Products', value: 'all' },
  { label: 'Category 1', value: 'category1' },
  { label: 'Category 2', value: 'category2' },
  // Add client's categories
];
```

### Change Footer Content

**Update** `src/components/Footer.jsx`:
- Social media links
- Copyright text
- Footer navigation
- Contact information

### Change Homepage Layout

**Update** `src/pages/Home.jsx`:
- Hero section
- Featured products section
- Call-to-action sections
- Remove/add sections as needed

### Update Logo

**Replace logo image**:
1. Add new logo to `/public/logo.png`
2. Update `src/components/Header.jsx` and `src/components/Footer.jsx`
3. Update `index.html` favicon

### Modify Admin Dashboard

**Admin pages** are in `src/pages/Admin*.jsx`:
- `AdminOverview.jsx` - Dashboard home
- `AdminProducts.jsx` - Product management
- `AdminOrders.jsx` - Order management
- `AdminCustomers.jsx` - Customer management
- `AdminMessages.jsx` - Contact form messages
- `AdminNewsletter.jsx` - Newsletter management
- `AdminSecurity.jsx` - Security dashboard
- `AdminSettings.jsx` - Admin settings

Customize as needed for client's workflow.

---

## 📋 Client Handoff Checklist

Before delivering to client:

### Code & Configuration
- [ ] All client branding applied (colors, fonts, logo)
- [ ] Client-specific content added (about page, contact info)
- [ ] Environment variables documented for client
- [ ] Admin user created for client
- [ ] Test data removed (if any)
- [ ] Production deployment checklist reviewed

### Documentation
- [ ] Updated README.md with client-specific info
- [ ] Documented any custom features added
- [ ] Created user guide for admin dashboard
- [ ] Documented maintenance procedures

### Testing
- [ ] All features tested and working
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked
- [ ] Security measures tested
- [ ] Payment flow tested with test cards
- [ ] Email delivery tested

### Deployment
- [ ] Production environment variables set
- [ ] MongoDB production database created
- [ ] Stripe production keys configured
- [ ] Custom domain configured for emails
- [ ] SSL certificate installed
- [ ] Security checklist completed (PRODUCTION_SECURITY_CHECKLIST.md)

### Training
- [ ] Admin dashboard walkthrough completed
- [ ] Product management training provided
- [ ] Order fulfillment process explained
- [ ] Customer management explained
- [ ] Newsletter system training provided

---

## 🔐 Security Notes

**IMPORTANT**: This template includes comprehensive security features. Before production:

1. **Review** `PRODUCTION_SECURITY_CHECKLIST.md`
2. **Complete all critical items** in the checklist
3. **Test security features** (CSRF, HTTPS, rate limiting)
4. **Set strong secrets** for all environment variables
5. **Enable monitoring** and error tracking

---

## 📚 Additional Resources

### Template Features Documentation
- **Product Management**: CRUD operations with image upload
- **Order Processing**: Stripe checkout → webhook → database
- **Email System**: Resend for transactional and marketing emails
- **Security**: JWT auth, rate limiting, IP blocking, audit logs
- **Admin Dashboard**: Full-featured admin interface

### Key Files to Understand
- `server.js` - Main Express server with all API endpoints
- `src/App.jsx` - React Router configuration
- `src/config/theme.js` - Theming system
- `db/models/` - Database schema definitions
- `middleware/auth.js` - Authentication middleware

### Getting Help
- Review existing code for examples
- Check security checklist for production requirements
- Consult documentation in `/docs` folder (if exists)
- Refer to third-party service documentation (Stripe, Resend, etc.)

---

## 🎉 You're Ready!

This template provides a complete, production-ready e-commerce foundation. Customize the branding and content for each client while keeping the core functionality intact.

**Happy building!** 🚀
