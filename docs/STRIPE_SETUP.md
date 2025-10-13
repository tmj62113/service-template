# Stripe Payment Integration Setup

This guide will help you configure Stripe Checkout for payment processing.

## Prerequisites

1. **Stripe Account**: Sign up at [https://stripe.com](https://stripe.com)
2. **Stripe CLI** (for local testing): Install from [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

## 1. Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy your **Publishable key** and **Secret key**
4. For local development, use **Test mode** keys

## 2. Set Up Backend Server

The Stripe Checkout integration requires a backend server to create checkout sessions securely. Example backend implementations are provided in the `/api` directory.

### Backend Options

Choose one of these deployment options:

#### Option A: Express.js Server

```bash
npm install express stripe cors dotenv
```

Create `server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import createCheckoutSession from './api/create-checkout-session.js';
import webhook from './api/webhook.js';

dotenv.config();

const app = express();

app.use(cors());
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.post('/api/create-checkout-session', createCheckoutSession);
app.post('/api/webhook', webhook);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Option B: Vercel Serverless Functions

Deploy the `/api` folder to Vercel. Each file automatically becomes an API endpoint.

#### Option C: Netlify Functions

Move files from `/api` to `/netlify/functions` and deploy to Netlify.

## 3. Environment Variables

Create a `.env` file in your backend server directory:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**Important**: Never commit your `.env` file to version control!

## 4. Update Frontend API Endpoint

If your backend is not running on the same domain, update the API call in `src/pages/Checkout.jsx`:

```javascript
const response = await fetch('https://your-backend-url.com/api/create-checkout-session', {
  // ... rest of the code
});
```

## 5. Set Up Webhooks (Production)

Webhooks allow Stripe to notify your server about payment events.

### Local Development

Use Stripe CLI to forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

Copy the webhook signing secret and add it to your `.env` file.

### Production

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-backend-url.com/api/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** and add it to your production environment variables

## 6. Test Payment Integration

### Test Mode

Use Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiration date, any 3-digit CVC, and any postal code.

### Testing Flow

1. Add items to cart
2. Click "Proceed to Checkout"
3. On checkout page, click "Proceed to Payment"
4. Complete payment with test card
5. Verify redirect to success page
6. Check Stripe Dashboard for the payment

## 7. Production Deployment

Before going live:

1. **Switch to Live Mode** in Stripe Dashboard
2. Update environment variables with **live API keys**
3. Verify webhook endpoint is accessible
4. Test the complete checkout flow
5. Enable additional Stripe features as needed:
   - Tax calculation
   - Shipping address collection
   - Multiple payment methods
   - Subscription billing

## Security Best Practices

✅ **Do:**
- Store API keys in environment variables
- Use HTTPS in production
- Verify webhook signatures
- Handle errors gracefully
- Log payment events

❌ **Don't:**
- Commit API keys to version control
- Expose secret keys in frontend code
- Skip webhook signature verification
- Process payments without server validation

## Additional Features

### Enable Additional Payment Methods

In `api/create-checkout-session.js`, add more payment methods:

```javascript
payment_method_types: ['card', 'apple_pay', 'google_pay'],
```

### Add Shipping Address Collection

```javascript
shipping_address_collection: {
  allowed_countries: ['US', 'CA', 'GB'],
},
```

### Enable Tax Calculation

```javascript
automatic_tax: { enabled: true },
```

## Troubleshooting

### Checkout session creation fails
- Verify Stripe secret key is correct
- Check that all required fields are provided
- Review server logs for error messages

### Webhook not receiving events
- Verify webhook URL is publicly accessible
- Check webhook signing secret is correct
- Review webhook event logs in Stripe Dashboard

### Payment successful but cart not clearing
- Check success page URL configuration
- Verify webhook handler is processing `checkout.session.completed` event
- Review browser console for errors

## Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Webhook Events](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com)
