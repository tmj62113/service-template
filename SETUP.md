# Whitelabel E-commerce Setup Guide

This guide will help you set up this whitelabel e-commerce template for a new client or project.

## =Ë Pre-Setup Checklist

Before you begin, ensure you have:
- [ ] Node.js (v18 or higher) installed
- [ ] npm (v9 or higher) installed
- [ ] Git installed
- [ ] A code editor (VS Code recommended)
- [ ] MongoDB Atlas account created
- [ ] Stripe account created
- [ ] Cloudinary account created
- [ ] Resend account created
- [ ] Stripe CLI installed (`brew install stripe/stripe-cli/stripe` on Mac)

---

## =€ Step-by-Step Setup

### Step 1: Clone and Prepare the Project

```bash
# Clone the repository (or download ZIP)
git clone <repository-url> my-new-store
cd my-new-store

# Remove the existing git history (optional - if starting fresh)
rm -rf .git
git init
```

**Checklist:**
- [ ] Repository cloned
- [ ] Navigated to project directory
- [ ] Git history removed (if desired)

---

### Step 2: Install Dependencies

```bash
npm install
```

**Checklist:**
- [ ] All dependencies installed successfully
- [ ] No error messages in terminal

---

### Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Now open `.env` in your editor and fill in the following values:

#### 3.1 MongoDB Configuration

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (or use existing)
3. Click "Connect" ’ "Connect your application"
4. Copy the connection string
5. Replace `username` and `password` with your MongoDB credentials
6. Paste into `.env`:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=your_store_name
```

**Checklist:**
- [ ] MongoDB cluster created
- [ ] Connection string copied and configured
- [ ] Database name customized

#### 3.2 Stripe Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret Key** (starts with `sk_test_`)
3. Paste into `.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
```

**Note:** Webhook secret will be configured in Step 6

**Checklist:**
- [ ] Stripe account created
- [ ] Secret key copied to `.env`

#### 3.3 Resend (Email) Configuration

1. Go to [Resend](https://resend.com/api-keys)
2. Create a new API key
3. Paste into `.env`:

```env
RESEND_API_KEY=re_your_key_here
```

4. Update email branding in `/src/config/theme.js`:
   - Set `email.fromEmail` to your verified domain email
   - Set `email.fromName` to your store name

**Checklist:**
- [ ] Resend account created
- [ ] API key copied to `.env`
- [ ] Email branding updated in theme.js

#### 3.4 Cloudinary (Image Upload) Configuration

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Copy your Cloud Name, API Key, and API Secret
3. Paste into `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Checklist:**
- [ ] Cloudinary account created
- [ ] All three credentials copied to `.env`

#### 3.5 JWT Secret

Generate a secure random string for JWT authentication:

```bash
# On Mac/Linux
openssl rand -base64 32
```

Paste the output into `.env`:

```env
JWT_SECRET=your_generated_secret_here
```

**Checklist:**
- [ ] JWT secret generated and added to `.env`

---

### Step 4: Configure MongoDB Network Access

1. Go to MongoDB Atlas ’ Network Access
2. Click "Add IP Address"
3. Either:
   - Add your current IP address, OR
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development

**Checklist:**
- [ ] IP address whitelisted in MongoDB Atlas

---

### Step 5: Customize Branding

Edit `/src/config/theme.js` and customize:

#### Brand Identity
```javascript
brandName: "Your Store Name",
tagline: "Your Store Tagline",
logo: "/logo.png",  // Add your logo to /public folder
```

#### Company Information
```javascript
company: {
  name: "Your Company LLC",
  email: "hello@yourstore.com",
  supportEmail: "support@yourstore.com",
  phone: "+1 (555) 123-4567",
  address: { ... }
}
```

#### Social Media
```javascript
social: {
  facebook: "https://facebook.com/yourstore",
  instagram: "https://instagram.com/yourstore",
  // ... other social links
}
```

#### Colors
Customize the color scheme to match your brand:
```javascript
colors: {
  primary: "#YOUR_COLOR",
  secondary: "#YOUR_COLOR",
  // ... other colors
}
```

**Checklist:**
- [ ] Brand name updated
- [ ] Logo added to `/public` folder
- [ ] Company information updated
- [ ] Social media links updated
- [ ] Color scheme customized
- [ ] SEO meta information updated

---

### Step 6: Start the Development Servers

You need to start **THREE** processes:

#### Terminal 1 - Backend Server

```bash
node server.js
```

You should see:
```
 Server running on http://localhost:3001
=³ Stripe integration active
< Accepting requests from: http://localhost:5173
```

**Checklist:**
- [ ] Backend server started successfully
- [ ] No MongoDB connection errors
- [ ] Port 3001 is available

#### Terminal 2 - Frontend Server

```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
œ  Local:   http://localhost:5173/
```

**Checklist:**
- [ ] Frontend server started successfully
- [ ] Can access http://localhost:5173 in browser

#### Terminal 3 - Stripe Webhook Listener

**IMPORTANT:** This is required for order processing!

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

You should see:
```
Ready! Your webhook signing secret is whsec_xxxxx
```

1. **Copy the webhook secret** (starts with `whsec_`)
2. Open `.env` and paste it:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
3. **Restart the backend server** (Terminal 1)
4. Keep this terminal running

**Checklist:**
- [ ] Stripe CLI installed
- [ ] Webhook listener started successfully
- [ ] Webhook secret copied to `.env`
- [ ] Backend server restarted

---

### Step 7: Create Admin User

You'll need an admin user to access the admin dashboard.

#### Option 1: Using MongoDB Compass or Atlas

1. Connect to your MongoDB database
2. Create a new document in the `users` collection:

```json
{
  "email": "admin@yourstore.com",
  "password": "$2a$10$your_bcrypt_hashed_password",
  "name": "Admin User",
  "role": "admin",
  "createdAt": {"$date": "2025-01-01T00:00:00.000Z"},
  "lastLogin": null
}
```

**Note:** You'll need to generate a bcrypt hash for the password. Use an online tool or node script.

#### Option 2: Using a Migration Script

Create a file `scripts/createAdmin.js`:

```javascript
import bcrypt from 'bcrypt';
import { User } from './db/models/User.js';

const email = 'admin@yourstore.com';
const password = 'your_secure_password';  // Change this!
const name = 'Admin User';

const hashedPassword = await bcrypt.hash(password, 10);

const admin = await User.create({
  email,
  password: hashedPassword,
  name,
  role: 'admin',
});

console.log('Admin user created:', admin);
process.exit(0);
```

Run it:
```bash
node scripts/createAdmin.js
```

**Checklist:**
- [ ] Admin user created in database
- [ ] Can login to admin dashboard at http://localhost:5173/admin

---

### Step 8: Add Initial Products

#### Option A: Through Admin Dashboard

1. Navigate to http://localhost:5173/admin/products
2. Login with admin credentials
3. Click "Add Product"
4. Fill in product details and upload images

#### Option B: Migrate Sample Products

If you want to keep the sample products:

```bash
node scripts/migrateProducts.js
```

This will migrate the sample products from `/src/data/products.js` to MongoDB.

**Checklist:**
- [ ] Initial products added
- [ ] Products appear on store homepage

---

### Step 9: Test Order Flow

1. Go to http://localhost:5173
2. Add a product to cart
3. Proceed to checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete the payment

**Expected Results:**
- [ ] Order redirects to success page
- [ ] Order appears in MongoDB database
- [ ] Confirmation email sent (check Resend dashboard)
- [ ] Inventory updated
- [ ] Backend logs show:
  -  Payment successful
  -  Order saved to database
  - =ç Confirmation email sent

**If orders aren't working:**
- Ensure Stripe webhook listener (Terminal 3) is running
- Check backend logs for errors
- Verify `STRIPE_WEBHOOK_SECRET` in `.env`

---

### Step 10: Final Configuration

#### Update Package.json

Edit `package.json`:
```json
{
  "name": "your-store-name",
  "version": "1.0.0",
  "description": "Your store description",
  ...
}
```

#### Update Favicon and Logo

1. Replace `/public/favicon.ico` with your favicon
2. Replace `/public/logo.png` with your logo
3. Add `/public/og-image.jpg` for social media sharing

#### Git Repository

```bash
git add .
git commit -m "Initial setup for [Client Name]"
git remote add origin <your-repo-url>
git push -u origin main
```

**Checklist:**
- [ ] package.json updated
- [ ] Favicon and logo replaced
- [ ] Git repository initialized and pushed

---

##  Setup Complete!

Your whitelabel e-commerce store is now set up and ready for development!

### Next Steps:

1. **Customize the design** - Edit CSS files and components
2. **Add more products** - Through admin dashboard
3. **Configure shipping** - Set up Shippo integration (optional)
4. **Set up domain** - When ready for production
5. **Deploy** - See `DEPLOYMENT.md` for deployment instructions

---

## <˜ Troubleshooting

### Products not loading?
- Check MongoDB connection in backend logs
- Verify IP is whitelisted in MongoDB Atlas
- Ensure backend server is running

### Orders not being created?
- **Most common:** Stripe webhook listener (Terminal 3) not running
- Verify `STRIPE_WEBHOOK_SECRET` in `.env`
- Check backend logs for webhook events

### Emails not sending?
- Verify `RESEND_API_KEY` in `.env`
- Check Resend dashboard for errors
- Ensure email domain is verified in Resend

### Images not uploading?
- Verify Cloudinary credentials in `.env`
- Check file size limits (default: 10MB)
- Review browser console for errors

---

## =Ú Additional Resources

- [Full README](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Development Guidelines](./.claude/CLAUDE.md)
- [Getting Started](./docs/GETTING_STARTED.md)

---

## > Need Help?

If you encounter issues during setup, please:
1. Check the troubleshooting section above
2. Review the full documentation
3. Check GitHub issues for similar problems
4. Create a new issue with detailed error messages

**Happy building! =€**
