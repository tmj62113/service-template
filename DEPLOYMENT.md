# Whitelabel E-commerce Deployment Guide

This guide covers deploying your whitelabel e-commerce store to production environments.

## =� Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Completed local setup and testing (see [TEMPLATE_SETUP.md](./TEMPLATE_SETUP.md))
- [ ] All tests passing (`npm run test:run`)
- [ ] Customized branding in `/src/config/theme.js`
- [ ] Admin user created in database
- [ ] Products added to store
- [ ] Tested complete order flow locally
- [ ] Domain name purchased (optional but recommended)
- [ ] Production accounts created for all services

---

## < Production Service Requirements

You'll need production accounts for:

1. **MongoDB Atlas** - Database (already have from development)
2. **Stripe** - Payment processing (switch to live mode)
3. **Resend** - Email delivery (upgrade from test to production)
4. **Cloudinary** - Image hosting (existing account works)
5. **Vercel/Netlify** - Frontend hosting (recommended)
6. **Railway/Render** - Backend hosting (recommended)

---

## =� Deployment Architecture

### Recommended Setup:
```
Frontend (React + Vite) � Vercel or Netlify
Backend (Express API) � Railway, Render, or Heroku
Database � MongoDB Atlas
Webhooks � Stripe Production Webhooks (no CLI needed)
```

---

## =� Part 1: Backend Deployment

### Option A: Deploy to Railway (Recommended)

#### 1. Create Railway Account
- Go to [Railway.app](https://railway.app/)
- Sign up with GitHub

#### 2. Create New Project
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init
```

#### 3. Configure Environment Variables

In Railway dashboard, add these environment variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=your_store_production

# Stripe (LIVE MODE - no test keys!)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Resend
RESEND_API_KEY=re_your_production_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server Config
CLIENT_URL=https://your-frontend-domain.com
PORT=3001
NODE_ENV=production

# JWT Secret
JWT_SECRET=your_super_secure_production_jwt_secret
```

#### 4. Deploy Backend
```bash
# Deploy to Railway
railway up

# Get your backend URL
railway domain
```

**Note:** Save your backend URL (e.g., `https://your-app.up.railway.app`)

---

### Option B: Deploy to Render

#### 1. Create Render Account
- Go to [Render.com](https://render.com/)
- Sign up with GitHub

#### 2. Create New Web Service
- Click "New +" � "Web Service"
- Connect your GitHub repository
- Configure:
  - **Name:** `your-store-backend`
  - **Environment:** `Node`
  - **Build Command:** `npm install`
  - **Start Command:** `node server.js`

#### 3. Add Environment Variables
In Render dashboard, go to "Environment" and add all variables from Railway example above.

#### 4. Deploy
- Click "Create Web Service"
- Render will automatically deploy
- Note your backend URL (e.g., `https://your-store-backend.onrender.com`)

---

### Option C: Deploy to Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create your-store-backend

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set STRIPE_SECRET_KEY="sk_live_your_key"
# ... set all other env vars

# Deploy
git push heroku main

# Get URL
heroku info
```

---

## <� Part 2: Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

#### 1. Create Vercel Account
- Go to [Vercel.com](https://vercel.com/)
- Sign up with GitHub

#### 2. Install Vercel CLI
```bash
npm i -g vercel
vercel login
```

#### 3. Update Backend API URL

Edit `src/config/api.js` (or wherever you define your API URL):

```javascript
const API_URL = import.meta.env.PROD
  ? 'https://your-backend.up.railway.app/api'  // Your production backend URL
  : 'http://localhost:3001/api';

export default API_URL;
```

Or use environment variables in Vercel:

Create `vercel.json`:
```json
{
  "env": {
    "VITE_API_URL": "https://your-backend.up.railway.app/api"
  }
}
```

And in your code:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

#### 4. Deploy Frontend
```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

#### 5. Set Environment Variables in Vercel Dashboard
- Go to Vercel dashboard � Project � Settings � Environment Variables
- Add: `VITE_API_URL` = `https://your-backend.up.railway.app/api`
- Redeploy

---

### Option B: Deploy to Netlify

#### 1. Create Netlify Account
- Go to [Netlify.com](https://www.netlify.com/)
- Sign up with GitHub

#### 2. Build Configuration

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. Deploy
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

#### 4. Set Environment Variables
- Netlify dashboard � Site settings � Environment variables
- Add: `VITE_API_URL` = `https://your-backend.up.railway.app/api`
- Trigger redeploy

---

## = Part 3: Stripe Production Webhooks

**CRITICAL:** Production uses actual Stripe webhooks, NOT the CLI.

### 1. Create Production Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Switch to **Live Mode** (toggle in sidebar)
3. Click "Add endpoint"
4. Enter webhook URL:
   ```
   https://your-backend.up.railway.app/api/webhook
   ```
5. Select event to listen to:
   -  `checkout.session.completed`
6. Click "Add endpoint"

### 2. Get Production Webhook Secret

1. Click on your newly created endpoint
2. Click "Reveal" under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to your backend environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
   ```
5. Redeploy backend

### 3. Test Production Webhook

1. Make a test purchase on your live site
2. Check Stripe Dashboard � Webhooks � Your endpoint
3. You should see successful webhook deliveries
4. Verify:
   - Order created in MongoDB
   - Confirmation email sent
   - Inventory updated

---

## =� Part 4: MongoDB Atlas Production Configuration

### 1. Create Production Database

**Option A:** Use separate database in same cluster
```env
MONGODB_DB_NAME=your_store_production
```

**Option B:** Create dedicated production cluster (recommended)
- MongoDB Atlas � Create new cluster
- Name it `production-cluster`
- Use same connection string format
- Update `MONGODB_URI` in production env vars

### 2. Configure Network Access

1. MongoDB Atlas � Network Access
2. **Production Option A (Recommended):** Add specific IPs
   - Add your backend hosting provider's IP addresses
   - Railway: Contact support for IP ranges
   - Render: Check [IP allowlist docs](https://render.com/docs/static-outbound-ip-addresses)
   - Heroku: Check dyno IP ranges

3. **Production Option B (Less Secure):** Allow all IPs
   - Add `0.0.0.0/0` (not recommended for production)

### 3. Create Indexes

Connect to production database and create indexes:

```javascript
// Products collection
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ createdAt: -1 });

// Orders collection
db.orders.createIndex({ sessionId: 1 }, { unique: true });
db.orders.createIndex({ email: 1 });
db.orders.createIndex({ createdAt: -1 });

// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
```

---

## = Part 5: Security Checklist

### Environment Variables
- [ ] Never commit `.env` to Git
- [ ] Use strong, unique JWT secret (32+ characters)
- [ ] Use Stripe **LIVE** keys (not test keys)
- [ ] Rotate secrets periodically

### CORS Configuration
Update `server.js` if needed:
```javascript
const allowedOrigins = [
  'https://your-frontend-domain.com',
  'https://www.your-frontend-domain.com',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### MongoDB
- [ ] Use dedicated production database
- [ ] Restrict IP access (don't use 0.0.0.0/0)
- [ ] Create read-only user for analytics
- [ ] Enable MongoDB encryption at rest

### Stripe
- [ ] Switch to live mode
- [ ] Test webhooks thoroughly
- [ ] Enable 3D Secure for payments
- [ ] Set up webhook signature verification

---

## < Part 6: Custom Domain Setup

### Frontend Domain (Vercel)

1. **Purchase Domain** (Namecheap, Google Domains, etc.)

2. **Add Domain in Vercel**
   - Vercel dashboard � Project � Settings � Domains
   - Add your domain: `www.yourstore.com`
   - Vercel provides DNS records

3. **Configure DNS**
   - Go to your domain registrar
   - Add DNS records from Vercel:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```
   - Wait for DNS propagation (5 minutes - 48 hours)

4. **Enable HTTPS**
   - Vercel automatically provisions SSL certificate
   - Force HTTPS in Vercel settings

### Backend Domain (Optional)

You can use a subdomain for your backend:

1. **Add subdomain in Railway/Render**
   - Railway: Settings � Add custom domain
   - Enter: `api.yourstore.com`

2. **Configure DNS**
   ```
   Type: CNAME
   Name: api
   Value: [provided by hosting platform]
   ```

3. **Update Frontend API URL**
   ```javascript
   const API_URL = 'https://api.yourstore.com/api';
   ```

---

##  Part 7: Post-Deployment Verification

### Complete Testing Checklist

#### Homepage
- [ ] Products display correctly
- [ ] Images load properly
- [ ] Navigation works
- [ ] Search functionality works

#### Product Pages
- [ ] Product details display
- [ ] Add to cart works
- [ ] Quantity selector works
- [ ] Out of stock products handled correctly

#### Shopping Cart
- [ ] Items display in cart
- [ ] Quantity updates work
- [ ] Remove items works
- [ ] Cart total calculates correctly

#### Checkout Flow
- [ ] Stripe Checkout loads
- [ ] Payment processes successfully
- [ ] Redirects to success page
- [ ] Order confirmation displays

#### Order Processing (CRITICAL)
- [ ] Order saved to MongoDB database
- [ ] Confirmation email sent to customer
- [ ] Inventory updated (stock decreased)
- [ ] Webhook appears in Stripe dashboard as successful

#### Admin Dashboard
- [ ] Can login with admin credentials
- [ ] Products list displays
- [ ] Can add/edit/delete products
- [ ] Orders list displays
- [ ] Order details show correctly

#### Email Delivery
- [ ] Order confirmation emails arrive
- [ ] Emails have correct branding
- [ ] Links in emails work
- [ ] Emails not in spam folder

---

## = Troubleshooting Production Issues

### Orders Not Being Created

**Symptoms:**
- Checkout completes but no order in database
- No confirmation email sent

**Causes & Fixes:**

1. **Webhook not configured**
   - Check Stripe Dashboard � Webhooks
   - Ensure endpoint URL is correct
   - Verify `checkout.session.completed` event is selected

2. **Wrong webhook secret**
   - Get secret from Stripe Dashboard
   - Update `STRIPE_WEBHOOK_SECRET` in backend env vars
   - Redeploy backend

3. **Webhook failing**
   - Check Stripe Dashboard � Webhooks � Your endpoint � Logs
   - Look for error responses (5xx, 4xx)
   - Check backend logs for errors

4. **CORS blocking requests**
   - Update `CLIENT_URL` in backend env vars
   - Ensure CORS allows your frontend domain

### Emails Not Sending

1. **Resend API key invalid**
   - Verify production API key in env vars
   - Check Resend dashboard for usage/errors

2. **Domain not verified**
   - Resend requires verified domains for production
   - Go to Resend � Domains � Verify your domain

3. **Email content issues**
   - Check backend logs for email errors
   - Verify email templates render correctly

### Images Not Uploading

1. **Cloudinary credentials wrong**
   - Verify all three credentials in env vars
   - Test upload in Cloudinary dashboard

2. **CORS issues**
   - Check browser console for errors
   - Verify Cloudinary CORS settings

### MongoDB Connection Issues

1. **IP not whitelisted**
   - Add backend server IP to MongoDB Atlas
   - Or temporarily use 0.0.0.0/0 for debugging

2. **Wrong connection string**
   - Verify `MONGODB_URI` is correct
   - Check username/password are URL-encoded

3. **Database doesn't exist**
   - MongoDB creates database on first write
   - Ensure `MONGODB_DB_NAME` is set correctly

---

## =� Monitoring & Maintenance

### Recommended Monitoring Tools

1. **Uptime Monitoring**
   - [UptimeRobot](https://uptimerobot.com/) - Free
   - [Pingdom](https://www.pingdom.com/)
   - Monitor both frontend and backend URLs

2. **Error Tracking**
   - [Sentry](https://sentry.io/) - Application errors
   - Add Sentry to both frontend and backend

3. **Analytics**
   - Google Analytics - User behavior
   - Stripe Dashboard - Payment analytics
   - MongoDB Atlas - Database performance

### Regular Maintenance

- [ ] Review Stripe webhook delivery success rate weekly
- [ ] Check MongoDB Atlas performance metrics
- [ ] Review error logs in hosting platforms
- [ ] Test order flow monthly
- [ ] Update dependencies quarterly (`npm outdated`)
- [ ] Backup MongoDB database monthly
- [ ] Review and rotate secrets every 6 months

---

## = Updating Production

### Frontend Updates
```bash
# Make changes locally
git add .
git commit -m "feat: your changes"
git push

# Vercel auto-deploys on push to main
# Or manually:
vercel --prod
```

### Backend Updates
```bash
# Make changes locally
git add .
git commit -m "feat: your changes"
git push

# Railway auto-deploys on push to main
# Or manually:
railway up
```

### Database Migrations

For schema changes, create a migration script:

```javascript
// scripts/migrations/addFieldToProducts.js
import { Product } from '../db/models/Product.js';

const products = await Product.find({});

for (const product of products) {
  product.newField = 'default value';
  await product.save();
}

console.log(`Updated ${products.length} products`);
```

Run carefully in production!

---

## =� Cost Estimates

### Free Tier (Recommended for starting)
- **Vercel**: Free (Hobby plan)
- **Railway**: $5/month credit (covers small backend)
- **MongoDB Atlas**: Free (M0 cluster, 512MB storage)
- **Stripe**: No monthly fee (2.9% + 30� per transaction)
- **Resend**: Free (100 emails/day)
- **Cloudinary**: Free (25 credits/month)

**Total:** ~$5-10/month for low-traffic store

### Growing Store (100+ orders/month)
- **Vercel**: $20/month (Pro plan)
- **Railway**: $20-50/month (scaled backend)
- **MongoDB Atlas**: $57/month (M10 cluster)
- **Stripe**: Transaction fees only
- **Resend**: $20/month (50k emails)
- **Cloudinary**: $89/month (if high image usage)

**Total:** ~$200-250/month + transaction fees

---

## <� Deployment Complete!

Your whitelabel e-commerce store is now live in production!

### Next Steps:
1. Set up monitoring and alerts
2. Configure automated backups
3. Document your customizations
4. Create runbook for common issues
5. Train team on admin dashboard
6. Plan for scaling as you grow

### Additional Resources:
- [Stripe Production Checklist](https://stripe.com/docs/development/checklist)
- [MongoDB Production Notes](https://docs.mongodb.com/manual/administration/production-notes/)
- [Vercel Production Guide](https://vercel.com/docs/concepts/deployments/overview)

---

## <� Need Help?

If you encounter deployment issues:
1. Check troubleshooting section above
2. Review service-specific documentation
3. Check platform status pages:
   - [Stripe Status](https://status.stripe.com/)
   - [Vercel Status](https://www.vercel-status.com/)
   - [MongoDB Atlas Status](https://status.cloud.mongodb.com/)
4. Review logs in hosting dashboards
5. Test locally to isolate the issue

**Remember:** Most production issues are configuration-related (wrong env vars, CORS, webhooks).

---

**Happy selling! =�**
