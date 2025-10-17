# Getting Started with E-Commerce Template

Welcome to your production-ready e-commerce template! This guide will walk you through everything you need to know.

## Table of Contents

1. [Quick Start](#quick-start)
2. [What's Included](#whats-included)
3. [First-Time Setup](#first-time-setup)
4. [Template Features](#template-features)
5. [Development Workflow](#development-workflow)
6. [Production Deployment](#production-deployment)
7. [Documentation Index](#documentation-index)

---

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn
- Git

### 5-Minute Setup

```bash
# 1. Clone and install
git clone <your-repo-url>
cd mark-j-peterson-art
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Seed database with sample data
node scripts/seed-database.js

# 4. Start development servers
npm run dev          # Frontend (port 5173)
node server.js       # Backend (port 3001)
```

Visit: http://localhost:5173

**Admin Login:**
- Email: `admin@example.com`
- Password: `admin123`

---

## What's Included

This template is production-ready with enterprise-grade features:

### 🛍️ **Core E-Commerce**
- Product catalog with categories
- Shopping cart with persistent storage
- Stripe checkout integration
- Order management system
- Admin dashboard
- Customer authentication

### 🔒 **Security** (Enterprise-Grade)
- CSRF protection
- HTTPS enforcement
- Helmet.js security headers
- Rate limiting (API + forms)
- Input sanitization
- Environment validation
- Error message sanitization

### 📊 **Monitoring & Logging**
- **Winston Logging** - Structured logs with file rotation
- **Sentry Integration** - Error tracking + session replay
- **HTTP Request Logging** - Automatic API monitoring
- **Health Check Endpoint** - `/api/health`

### 🚀 **DevOps & Deployment**
- **Docker Support** - Full containerization
- **CI/CD Pipeline** - GitHub Actions automation
- **Database Backups** - Automated scripts
- **Environment Management** - Secure configuration

### 🛠️ **Developer Tools**
- **Database Seeding** - Sample product data
- **Branding Removal** - One-command rebrand
- **API Documentation** - Complete REST API reference
- **Test Suite** - Vitest + React Testing Library

### 📚 **Complete Documentation**
- Setup guides
- API reference
- Docker deployment
- Backup procedures
- Security testing
- All features explained

---

## First-Time Setup

### Step 1: Environment Configuration

Create `.env` file with your credentials:

```env
# Required Services
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
RESEND_API_KEY=re_...
CONTACT_EMAIL=your@email.com

# Optional Services
SHIPPO_API_KEY=shippo_...
SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_DSN=https://...@sentry.io/...
```

**Get Credentials:**
- MongoDB: [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Stripe: [stripe.com/docs/keys](https://stripe.com/docs/keys)
- Cloudinary: [cloudinary.com](https://cloudinary.com/)
- Resend: [resend.com](https://resend.com/)
- Sentry: [sentry.io](https://sentry.io/) (optional)

### Step 2: Database Setup

**Option A: Use Sample Data (Recommended)**
```bash
node scripts/seed-database.js
```

This creates:
- 10 sample products (artwork)
- 1 admin user (admin@example.com / admin123)
- Product categories and inventory

**Option B: Start Fresh**

Skip seeding and add products through admin panel at `/admin`

### Step 3: Test Locally

```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
npm run dev

# Terminal 3: Stripe Webhooks (for checkout testing)
stripe listen --forward-to localhost:3001/api/webhook
```

**Test Checkout Flow:**
1. Browse products at http://localhost:5173/shop
2. Add items to cart
3. Proceed to checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Check `/admin/orders` for order confirmation

---

## Template Features

### 1. Winston Structured Logging

**What:** Professional logging system that replaces console.log

**Location:** `/utils/logger.js`

**Usage:**
```javascript
import logger from './utils/logger.js';

logger.info('User logged in', { userId: 123 });
logger.error('Payment failed', { orderId: 456, error: err.message });
logger.warn('Low stock', { productId: 789, stock: 2 });
```

**Benefits:**
- ✅ Color-coded console output in development
- ✅ JSON logs saved to files in production
- ✅ Automatic timestamps
- ✅ File rotation (5MB max, 5 files)
- ✅ HTTP request/response logging

**Log Files:** `logs/combined.log`, `logs/error.log`

[Read More →](WINSTON_LOGGING.md)

---

### 2. Sentry Error Tracking

**What:** Captures and tracks production errors automatically

**Location:** `/utils/sentry.js`, `/src/utils/sentry.js`

**Setup:**
1. Create free account at [sentry.io](https://sentry.io/)
2. Add `SENTRY_DSN` to `.env`
3. Errors automatically tracked in production

**Features:**
- Session replay (watch user's screen when error occurred)
- Performance monitoring
- Email/Slack alerts
- Automatic sensitive data filtering

**Documentation:** [SENTRY_SETUP.md](SENTRY_SETUP.md)

---

### 3. Docker Deployment

**What:** Containerize your entire application

**Location:** `/Dockerfile`, `/docker-compose.yml`

**Quick Start:**
```bash
docker-compose up -d
```

This starts:
- Your application (port 3001)
- MongoDB database
- Persistent data volumes

**Benefits:**
- Works identically on any platform
- Easy server deployment
- Isolated environment
- One-command setup

**Documentation:** [DOCKER.md](DOCKER.md)

---

### 4. CI/CD Pipeline

**What:** Automated testing and deployment with GitHub Actions

**Location:** `/.github/workflows/ci.yml`

**What Happens on Push:**
1. ✅ Runs all tests
2. ✅ Security audit
3. ✅ Builds frontend
4. ✅ Creates Docker image
5. ✅ Deploys to production

**Setup:**

Add GitHub Secrets:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

Push to main branch → automatic deployment!

**Documentation:** [CICD_SETUP.md](CICD_SETUP.md)

---

### 5. Database Backups

**What:** Automated MongoDB backup scripts

**Location:** `/scripts/backup-mongodb.sh`, `/scripts/backup-mongodb-docker.sh`

**Quick Backup:**
```bash
# Local MongoDB
node scripts/seed-database.js

# Docker MongoDB
./scripts/backup-mongodb-docker.sh
```

**Automated Backups:**
```bash
# Daily at 2 AM
crontab -e
# Add: 0 2 * * * /path/to/scripts/backup-mongodb.sh
```

**Documentation:** [BACKUP_RECOVERY.md](BACKUP_RECOVERY.md)

---

### 6. Template Branding Removal

**What:** Interactive wizard to rebrand template for your client

**Location:** `/scripts/setup-new-client.js`

**Usage:**
```bash
node scripts/setup-new-client.js
```

**What It Changes:**
- Business name across all files
- Domain and email
- Package.json metadata
- Legal documents
- 10+ other locations

**Time Saved:** 2 hours → 2 minutes

---

### 7. Database Seeding

**What:** Populate database with sample products for testing

**Location:** `/scripts/seed-database.js`

**Usage:**
```bash
node scripts/seed-database.js           # Seed data
node scripts/seed-database.js --clear   # Clear first
node scripts/seed-database.js --no-user # Skip admin user
node scripts/seed-database.js --help    # Show options
```

**Creates:**
- 10 realistic product listings
- Admin user (admin@example.com / admin123)
- Categories and inventory

---

### 8. API Documentation

**What:** Complete REST API reference for all endpoints

**Location:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

**Includes:**
- All endpoints with examples
- Authentication requirements
- Request/response formats
- CSRF token usage
- Rate limits
- Error codes
- Development testing tips

---

### 9. MIT License

**What:** Open-source license allowing free use and modification

**Location:** `/LICENSE`

**Permissions:**
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

**Requirements:**
- Include license file
- Include copyright notice

This makes your template truly reusable!

---

## Development Workflow

### Daily Development

```bash
# Start servers
npm run dev          # Frontend (auto-reload)
node server.js       # Backend

# Run tests
npm run test:run     # All tests
npm test             # Watch mode

# View logs
tail -f logs/combined.log  # All logs
tail -f logs/error.log     # Errors only
```

### Before Committing

```bash
# Run tests
npm run test:run

# Check for issues
npm run lint  # If configured

# Commit with tests passing
git add .
git commit -m "feat: Add new feature

Tests Added:
- src/components/Feature.test.jsx (8 tests)
- All 74 tests passing"
```

### Environment Management

**Development:** Use `.env` (gitignored)
**Production:** Use hosting provider's environment variables

**Never commit `.env` to git!**

---

## Production Deployment

### Option 1: Docker (Recommended)

```bash
# Build and deploy
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 2: Traditional Hosting

```bash
# On server
git pull origin main
npm install
npm run build
node server.js
```

### Option 3: Platform-Specific

- **Vercel:** Connect GitHub repo, auto-deploy
- **Heroku:** `git push heroku main`
- **DigitalOcean:** Use Docker deployment
- **AWS:** EC2 + Docker or ECS

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guides.

---

## Documentation Index

### Core Guides
- 📘 [Getting Started](GETTING_STARTED.md) ← You are here
- 📕 [API Documentation](API_DOCUMENTATION.md)
- 📗 [Deployment Guide](DEPLOYMENT.md)
- 📙 [Security Testing](SECURITY_TESTING.md)

### Feature Documentation
- 🔧 [Winston Logging](WINSTON_LOGGING.md)
- 🐛 [Sentry Error Tracking](SENTRY_SETUP.md)
- 🐳 [Docker Setup](DOCKER.md)
- 🤖 [CI/CD Pipeline](CICD_SETUP.md)
- 💾 [Backup & Recovery](BACKUP_RECOVERY.md)

### Developer Guides
- 🎨 [CSS Customization](CSS_CUSTOMIZATION.md)
- 🎭 [Design System](../context/design/design-system/DESIGN_SYSTEM.md)
- 🔐 [Security Improvements](SECURITY_IMPROVEMENTS.md)
- 🆕 [New Client Setup](TEMPLATE_SETUP.md)

### Scripts & Tools
- 🏷️ Branding Removal: `node scripts/setup-new-client.js`
- 🌱 Database Seeding: `node scripts/seed-database.js`
- 💾 MongoDB Backup: `./scripts/backup-mongodb.sh`

---

## Common Tasks

### Add New Product
1. Login to `/admin`
2. Navigate to Products
3. Click "Add Product"
4. Upload image, set price, description
5. Save

### Process Orders
1. Customer completes checkout
2. View order in `/admin/orders`
3. Update order status
4. Shippo tracks shipping automatically

### Monitor Errors
- **Development:** Check console logs
- **Production:** View Sentry dashboard
- **Logs:** `tail -f logs/error.log`

### Backup Database
```bash
# Manual backup
./scripts/backup-mongodb.sh

# Automated (cron)
0 2 * * * /path/to/scripts/backup-mongodb.sh
```

### Update Template Branding
```bash
node scripts/setup-new-client.js
# Follow interactive prompts
```

---

## Troubleshooting

### "MongoDB connection failed"
- Check `MONGODB_URI` in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure MongoDB is running locally

### "Stripe webhook not working"
- Run `stripe listen --forward-to localhost:3001/api/webhook`
- Copy webhook secret to `STRIPE_WEBHOOK_SECRET` in `.env`
- Restart backend server

### "Tests failing"
- Run `npm install` to ensure dependencies
- Check test setup in `src/test/setup.js`
- Run `npm run test:run` for detailed errors

### "Docker build failing"
- Check `Dockerfile` syntax
- Ensure `.env` has required variables
- Try `docker-compose build --no-cache`

### "Production errors"
- Check Sentry dashboard
- View logs: `docker-compose logs -f app`
- SSH to server and check `logs/error.log`

---

## Next Steps

### For Development
1. ✅ Complete first-time setup above
2. ✅ Run tests to ensure everything works
3. ✅ Customize theme in `src/config/theme.js`
4. ✅ Add your products
5. ✅ Test checkout flow with Stripe test mode

### For Production
1. ✅ Set up Sentry error tracking
2. ✅ Configure automated backups
3. ✅ Set up GitHub Actions secrets
4. ✅ Deploy with Docker
5. ✅ Test production checkout flow
6. ✅ Monitor logs and errors

### For Template Users
1. ✅ Run branding removal script
2. ✅ Update legal documents (Privacy, Terms)
3. ✅ Replace logo and images
4. ✅ Customize colors in theme.js
5. ✅ Add your product catalog
6. ✅ Deploy to your domain

---

## Support & Resources

**Documentation:** All guides in this repository

**Issues:** GitHub Issues for bug reports

**Community:** (Add Discord/Slack if applicable)

**License:** MIT - Free for commercial use

---

**Template Version:** 1.0.0
**Last Updated:** January 2025

**Built with:**
- React 19 + Vite
- Express.js + MongoDB
- Stripe + Cloudinary + Resend
- Docker + GitHub Actions
- Winston + Sentry

---

**Ready to build something amazing!** 🚀
