# Whitelabel E-commerce Application

A full-stack e-commerce platform built with React, Express, and MongoDB. Designed as a **whitelabel solution** that can be easily cloned and customized for different brands and clients.

## 🎯 Whitelabel Features

This application is designed to be easily duplicated and customized for multiple clients:

- **Single Source of Truth**: All branding configured in `/src/config/theme.js`
- **Easy Customization**: Change brand name, colors, logo, company info in one place
- **Quick Setup**: Automated setup script gets you running in minutes
- **Comprehensive Documentation**: Step-by-step setup and deployment guides
- **Environment Template**: `.env.example` with all required services documented

## 📚 Documentation

**All documentation is organized in the `/docs` folder for easy access.**

### **🚀 Start Here**
- **[docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md)** - 🎯 **START HERE** - Complete setup guide with all features explained
- **[docs/TEMPLATE_SETUP.md](./docs/TEMPLATE_SETUP.md)** - Setting up for a new client project
- **[setup.sh](./setup.sh)** - Interactive setup script to automate configuration

### **Core Documentation**
- **[docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** - Complete REST API reference
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[docs/SECURITY_TESTING.md](./docs/SECURITY_TESTING.md)** - Security testing procedures

### **Feature Guides**
- **[docs/WINSTON_LOGGING.md](./docs/WINSTON_LOGGING.md)** - Structured logging system
- **[docs/SENTRY_SETUP.md](./docs/SENTRY_SETUP.md)** - Error tracking and monitoring
- **[docs/DOCKER.md](./docs/DOCKER.md)** - Docker containerization
- **[docs/CICD_SETUP.md](./docs/CICD_SETUP.md)** - CI/CD pipeline with GitHub Actions
- **[docs/BACKUP_RECOVERY.md](./docs/BACKUP_RECOVERY.md)** - Database backup procedures

### **Service Configuration**
- **[docs/STRIPE_SETUP.md](./docs/STRIPE_SETUP.md)** - Payment processing setup
- **[docs/WEBHOOKS.md](./docs/WEBHOOKS.md)** - Webhook implementation
- **[docs/EMAIL_SETUP.md](./docs/EMAIL_SETUP.md)** - Email service (Resend)

### **Customization**
- **[docs/CSS_CUSTOMIZATION.md](./docs/CSS_CUSTOMIZATION.md)** - Styling and design
- **[.claude/CLAUDE.md](./.claude/CLAUDE.md)** - Development guidelines

## 🚀 Quick Start (New Project)

### Option 1: Automated Setup (Recommended)

Run the interactive setup script:

```bash
# Clone the repository
git clone <repository-url> my-store-name
cd my-store-name

# Run the setup wizard
chmod +x setup.sh
./setup.sh
```

The setup script will:
- ✅ Check prerequisites (Node.js, npm, Stripe CLI, Git)
- ✅ Install dependencies
- ✅ Create `.env` file and configure all API keys
- ✅ Generate secure JWT secret
- ✅ Prompt you to customize branding
- ✅ Guide you through next steps

### Option 2: Manual Setup

1. Clone the repository:
   ```bash
   git clone <repository-url> my-store-name
   cd my-store-name
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Then edit .env with your API keys
   ```

4. Customize branding:
   - Edit `/src/config/theme.js` with your brand name, colors, logo, etc.

**For detailed step-by-step instructions, see [docs/TEMPLATE_SETUP.md](./docs/TEMPLATE_SETUP.md)**

### Prerequisites

Before starting, ensure you have accounts for:

- **MongoDB Atlas** - Database hosting ([Sign up](https://cloud.mongodb.com/))
- **Stripe** - Payment processing ([Sign up](https://stripe.com/))
- **Resend** - Email service ([Sign up](https://resend.com/))
- **Cloudinary** - Image uploads ([Sign up](https://cloudinary.com/))
- **Stripe CLI** - For local webhook testing ([Install](https://stripe.com/docs/stripe-cli))

And these tools installed:
- Node.js v18 or higher
- npm v9 or higher
- Git

## 🏃 Running the Application

### ⚠️ **CRITICAL: THREE Processes Required**

This application **REQUIRES** three separate terminal processes running simultaneously for full functionality:

---

### **Terminal 1️⃣ - Backend Server** (Port 3001)

```bash
node server.js
```

**What it does:**
- ✅ Handles all API requests
- ✅ Connects to MongoDB Atlas
- ✅ Manages products, orders, and customers
- ✅ Processes Stripe payments
- ✅ Handles Cloudinary image uploads

**Status Check:** You should see `✅ Server running on port 3001`

---

### **Terminal 2️⃣ - Frontend Server** (Port 5173)

```bash
npm run dev
```

**What it does:**
- ✅ Serves the React application
- ✅ Hot module reloading for development
- ✅ Connects to backend API on port 3001

**Status Check:** You should see `Local: http://localhost:5173/`

---

### **Terminal 3️⃣ - Stripe Webhook Listener** ⚡ **REQUIRED FOR ORDERS**

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

**What it does:**
- ✅ Forwards Stripe webhook events to your local server
- 🔴 **CRITICAL**: Without this, orders will **NOT** be saved to database
- 🔴 **CRITICAL**: Without this, confirmation emails will **NOT** be sent
- 🔴 **CRITICAL**: Without this, checkout will appear to succeed but fail silently

**First Time Setup:**
1. Run the command above
2. Copy the webhook signing secret from terminal output (starts with `whsec_`)
3. Add to your `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
4. Restart your backend server (Terminal 1)
5. Keep this terminal running while developing

**Status Check:** You should see `Ready! Your webhook signing secret is whsec_...`

---

### **📍 Application URLs**

Once all three processes are running:

| Service | URL | What You Can Do |
|---------|-----|-----------------|
| **Frontend** | http://localhost:5173 | Browse products, shopping, checkout |
| **Style Guide** | http://localhost:5173/style-guide | View design system components |
| **Admin Dashboard** | http://localhost:5173/admin | Manage products, orders, customers |
| **Backend API** | http://localhost:3001 | API endpoints (not for direct browser access) |

---

### **🚨 What Happens If Processes Are Missing?**

| Missing Process | What Breaks |
|-----------------|-------------|
| ❌ Backend | Products won't load, all API calls fail |
| ❌ Frontend | Application won't display at all |
| ❌ Stripe CLI | Orders won't save, emails won't send, checkout fails silently ⚠️ |

**⚠️ Most Common Mistake:** Forgetting to start Terminal 3 (Stripe webhook listener). Everything appears to work until checkout, then orders disappear!

**First Time Setup - Stripe Webhooks**:
1. Run `stripe listen --forward-to localhost:3001/api/webhook`
2. Copy the webhook signing secret from the output
3. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_your_secret_here`
4. Restart your backend server (`node server.js`)
5. Keep the Stripe CLI running while developing

**Access the application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Stripe CLI: Runs in background, no UI

### Troubleshooting

**Products not loading?**
- Check that all THREE processes are running (backend, frontend, Stripe CLI)
- Verify MongoDB connection in backend server logs
- Ensure your IP address is whitelisted in MongoDB Atlas
- Common error: `MongoServerSelectionError` → IP not whitelisted

**Orders not being created?**
- **MOST COMMON**: Stripe CLI webhook listener is not running
- Check Terminal 3 - you should see `stripe listen` running
- Verify `STRIPE_WEBHOOK_SECRET` in `.env` matches the one from Stripe CLI output
- Check backend server logs for webhook events (should see "✅ Payment successful")
- If you restart Stripe CLI, the webhook secret changes - update `.env` and restart backend

**Confirmation emails not sending?**
- Requires Stripe CLI to be running (webhooks trigger emails)
- Check backend logs for "📧 Confirmation email sent"
- Verify `RESEND_API_KEY` is set correctly in `.env`
- Check Resend dashboard for delivery status

**Backend won't start?**
- Verify all environment variables are set in `.env`
- Check MongoDB Atlas connection string is correct
- Ensure MongoDB cluster is active
- Verify Stripe and Resend API keys are valid

**Need more detailed setup help?**
- 📖 See [docs/STRIPE_SETUP.md](./docs/STRIPE_SETUP.md) for complete Stripe configuration
- 📖 See [docs/WEBHOOKS.md](./docs/WEBHOOKS.md) for webhook troubleshooting
- 📖 See [docs/EMAIL_SETUP.md](./docs/EMAIL_SETUP.md) for email configuration

## 🧪 Testing

Run the test suite:
```bash
npm run test:run     # Run all tests once
npm test             # Run tests in watch mode
npm run test:ui      # Open Vitest UI
npm run test:coverage # Generate coverage report
```

## 🏗️ Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **Zustand** - State management
- **CSS Modules** - Scoped styling
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

### Backend
- **Express.js** - Web server framework
- **MongoDB** - Database
- **Stripe** - Payment processing
- **Cloudinary** - Image storage and management
- **Resend** - Transactional emails
- **Multer** - File upload handling

## 📁 Project Structure

```
/
├── src/
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── stores/            # Zustand state stores
│   ├── config/            # Configuration files
│   └── test/              # Test setup
├── db/
│   ├── models/            # MongoDB models
│   └── connection.js      # Database connection
├── server.js              # Express backend server
├── .env                   # Environment variables (create this)
└── README.md
```

## 🎨 Features

### Customer Features
- Browse products by category
- Add items to shopping cart
- Checkout with Stripe
- Order confirmation emails
- Product search and filtering

### Admin Features
- Product management (CRUD)
- Image upload with Cloudinary
- Order management
- Customer management
- Order statistics dashboard
- Message/inquiry management
- Shipping label creation with Shippo

## 🔐 Admin Access

To access the admin dashboard, you'll need to create an admin user in MongoDB. The admin routes are protected and require authentication.

See [docs/TEMPLATE_SETUP.md](./docs/TEMPLATE_SETUP.md) for instructions on creating an admin user.

## 🎨 Customizing for Your Brand

### Theme Configuration

All branding is centralized in `/src/config/theme.js`. This is the **single source of truth** for:

```javascript
// Brand Identity
brandName: "Your Store"
tagline: "Quality Products, Great Prices"
logo: "/logo.png"

// Company Information
company: {
  name: "Your Company LLC",
  email: "hello@yourstore.com",
  phone: "+1 (555) 123-4567",
  // ... full address
}

// Social Media Links
social: {
  facebook: "https://facebook.com/yourstore",
  instagram: "https://instagram.com/yourstore",
  // ... other platforms
}

// Color Scheme
colors: {
  primary: "#E9E9E9",
  secondary: "#8B5CF6",
  accent: "#F59E0B",
  // ... complete palette
}

// Commerce Settings
commerce: {
  currency: "USD",
  currencySymbol: "$",
  taxRate: 0.08,
  shippingThreshold: 50,
}

// Feature Toggles
features: {
  showRatings: true,
  enableWishlist: true,
  enableCoupons: false,
  // ... toggle features on/off
}

// Email Branding
email: {
  fromName: "Your Store",
  fromEmail: "orders@yourstore.com",
}

// SEO Configuration
seo: {
  title: "Your Store - Quality Products",
  description: "Shop quality products at great prices",
}
```

### Quick Customization Checklist

To customize for a new client:

1. ✅ Update brand name and tagline in `theme.js`
2. ✅ Change color scheme to match brand colors
3. ✅ Replace logo file in `/public/logo.png`
4. ✅ Update company information (name, email, phone, address)
5. ✅ Configure social media links
6. ✅ Update SEO meta information
7. ✅ Set email branding (from name, from email)
8. ✅ Configure commerce settings (currency, tax rate, shipping)
9. ✅ Toggle features on/off based on requirements
10. ✅ Update favicon in `/public/favicon.ico`

**All changes in `theme.js` automatically apply throughout the entire application.**

### Deploying Your Custom Store

Once customized, deploy to production using the instructions in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

Deployment covers:
- Frontend deployment (Vercel/Netlify)
- Backend deployment (Railway/Render/Heroku)
- Production webhooks (Stripe)
- Custom domain setup
- MongoDB production configuration
- Environment variable management

## 📝 Development Notes

- Uses whitelabel theming system (customize in `/src/config/theme.js`)
- Products are stored in MongoDB (no longer static data)
- All commits should follow conventional commit format
- All features must include tests
- See `.claude/CLAUDE.md` for detailed development guidelines

## 🤝 Contributing

1. Create a feature branch
2. Write tests for new features
3. Ensure all tests pass: `npm run test:run`
4. Follow the commit message format in `.claude/CLAUDE.md`
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using React, Express, and MongoDB
