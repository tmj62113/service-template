# Stripe Webhooks Setup for Local Development

## Problem
Inventory isn't updating when you make purchases locally because Stripe webhooks can't reach `localhost`.

## Solution
Use Stripe CLI to forward webhooks to your local server.

## Setup Steps

### 1. Install Stripe CLI

**macOS (using Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Other platforms:**
Visit: https://stripe.com/docs/stripe-cli#install

### 2. Login to Stripe
```bash
stripe login
```
This will open your browser to authorize the CLI.

### 3. Forward Webhooks to Local Server
Open a **new terminal window** and run:
```bash
stripe listen --forward-to localhost:3001/api/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### 4. Update .env File
Copy the webhook signing secret and add it to your `.env` file:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 5. Restart Your Server
Kill and restart `node server.js` to load the new webhook secret.

##  Testing

1. Keep the `stripe listen` command running in one terminal
2. Keep `node server.js` running in another terminal
3. Make a test purchase in your app
4. Watch the `stripe listen` terminal - you'll see webhook events
5. Watch the `node server.js` terminal - you'll see inventory updates:
   ```
   ✅ Payment successful: cs_test_xxxxx
   📦 Processing 2 line items for inventory update
   📦 Line item 0: Bluetooth Speaker, quantity: 1, productId: 68ddbfa...
   ✅ Updated stock for product 68ddbfa...: -1
   ```

## How It Works

```
Your App → Stripe Checkout → Stripe Servers
                                    ↓
                           stripe listen (CLI)
                                    ↓
                          localhost:3001/api/webhook
                                    ↓
                           Inventory Updated!
```

## For Production

In production, you'll configure the webhook URL directly in the Stripe Dashboard:
- Go to Developers → Webhooks
- Add endpoint: `https://your-domain.com/api/webhook`
- Select events: `checkout.session.completed`
- Copy the signing secret to your production `.env`

## Verifying It Works

After setup, make a test purchase and verify:
1. ✅ Webhook received in `stripe listen` terminal
2. ✅ Inventory logs in `node server.js` terminal
3. ✅ Stock decreased in admin products table
4. ✅ Stock decreased on product detail page
