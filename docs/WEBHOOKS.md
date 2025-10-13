# Stripe Webhooks Setup Guide

Webhooks allow your server to receive real-time notifications about payment events from Stripe.

## Webhook Events Overview

### Essential Events for E-commerce:

| Event | When it fires | What to do |
|-------|--------------|------------|
| `checkout.session.completed` | Customer completes payment | **Create order, send email, update inventory** |
| `payment_intent.succeeded` | Payment confirmed | Log confirmation |
| `payment_intent.payment_failed` | Payment failed | Alert customer, log failure |
| `charge.refunded` | Refund processed | Update order status, restore inventory |
| `checkout.session.expired` | Session expired (24hrs) | Clean up temporary data |

## Local Testing Setup

### 1. Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
# Download from https://github.com/stripe/stripe-cli/releases
```

### 2. Login to Stripe

```bash
stripe login
```

This will open your browser for authentication.

### 3. Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### 4. Copy Webhook Secret to .env

Add the secret to your `.env` file:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 5. Test the Webhook

In another terminal, trigger a test event:
```bash
stripe trigger checkout.session.completed
```

Check your server logs to see the webhook data!

## Production Setup

### 1. Deploy Your Server

Ensure your server is deployed and publicly accessible (e.g., `https://yourdomain.com`)

### 2. Add Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → Webhooks**
3. Click **"Add endpoint"**
4. Enter your endpoint URL: `https://yourdomain.com/api/webhook`

### 3. Select Events to Listen For

Select these events:
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `charge.refunded`
- ✅ `checkout.session.expired`

### 4. Copy Signing Secret

After creating the endpoint:
1. Click on the webhook endpoint
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to your production environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
   ```

### 5. Test Production Webhook

Send a test webhook from the Stripe Dashboard:
1. Go to your webhook endpoint
2. Click **"Send test webhook"**
3. Select `checkout.session.completed`
4. Click **"Send test webhook"**

## Order Data Structure

When a payment is successful, the `checkout.session.completed` event provides:

```javascript
{
  sessionId: "cs_test_xxxxx",
  paymentIntentId: "pi_xxxxx",
  customerId: "cus_xxxxx",
  customerEmail: "customer@example.com",
  customerName: "John Doe",

  // Shipping information
  shippingAddress: {
    line1: "123 Main St",
    line2: "Apt 4B",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "US"
  },
  shippingName: "John Doe",

  // Billing information
  billingAddress: {
    line1: "123 Main St",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "US"
  },

  // Order items
  items: [
    {
      name: "Smart Watch Pro",
      quantity: 1,
      price: 399.99
    },
    {
      name: "Wireless Headphones",
      quantity: 2,
      price: 149.99
    }
  ],

  // Totals
  subtotal: 699.97,
  total: 699.97,
  currency: "usd",

  // Status
  paymentStatus: "paid",
  status: "complete",

  // Timestamps
  createdAt: "2025-09-30T19:30:00.000Z"
}
```

## Implementing Order Fulfillment

### 1. Save Order to Database

```javascript
async function saveOrderToDatabase(orderData) {
  // Example with MongoDB
  const order = await Order.create({
    stripeSessionId: orderData.sessionId,
    stripePaymentIntentId: orderData.paymentIntentId,
    customerEmail: orderData.customerEmail,
    customerName: orderData.customerName,
    shippingAddress: orderData.shippingAddress,
    billingAddress: orderData.billingAddress,
    items: orderData.items,
    subtotal: orderData.subtotal,
    total: orderData.total,
    status: 'processing',
    createdAt: orderData.createdAt,
  });

  return order;
}
```

### 2. Send Confirmation Email

```javascript
async function sendOrderConfirmationEmail(orderData) {
  // Example with SendGrid, Mailgun, or AWS SES
  const emailContent = `
    Hi ${orderData.customerName},

    Thank you for your order!

    Order ID: ${orderData.sessionId}
    Total: $${orderData.total}

    Items:
    ${orderData.items.map(item =>
      `- ${item.name} (${item.quantity}x) - $${item.price}`
    ).join('\n')}

    Shipping to:
    ${orderData.shippingAddress.line1}
    ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postal_code}

    We'll send you tracking information once your order ships!
  `;

  await emailService.send({
    to: orderData.customerEmail,
    subject: 'Order Confirmation',
    text: emailContent,
  });
}
```

### 3. Update Inventory

```javascript
async function updateInventory(items) {
  for (const item of items) {
    await Product.findOneAndUpdate(
      { name: item.name },
      { $inc: { stock: -item.quantity } }
    );
  }
}
```

### 4. Notify Admin/Warehouse

```javascript
async function notifyWarehouse(orderData) {
  // Send to Slack, email, or warehouse management system
  await slackClient.postMessage({
    channel: '#orders',
    text: `🎉 New Order: ${orderData.sessionId}\nTotal: $${orderData.total}\nItems: ${orderData.items.length}`,
  });
}
```

## Security Best Practices

### ✅ Do:
- **Always verify webhook signatures** - Prevents fake webhook calls
- **Use HTTPS in production** - Encrypts data in transit
- **Check event types** - Only process expected events
- **Make webhooks idempotent** - Handle duplicate events gracefully
- **Return 200 quickly** - Process work asynchronously if needed
- **Log all webhook events** - For debugging and audit trails

### ❌ Don't:
- **Never trust webhook data without signature verification**
- **Don't process the same event twice** - Store processed event IDs
- **Don't timeout** - Stripe expects response within 5 seconds
- **Don't make the customer wait** - Process in background if slow

## Idempotency Example

Prevent processing the same order twice:

```javascript
const processedEvents = new Set(); // In production, use database

case 'checkout.session.completed':
  const eventId = event.id;

  // Check if already processed
  if (processedEvents.has(eventId)) {
    console.log('Event already processed:', eventId);
    return res.status(200).json({ received: true });
  }

  // Process order
  await fulfillOrder(orderData);

  // Mark as processed
  processedEvents.add(eventId);
  break;
```

## Monitoring Webhooks

### Check Webhook Status

View webhook attempts in Stripe Dashboard:
1. Go to **Developers → Webhooks**
2. Click on your endpoint
3. View **Recent events** tab

### Webhook Failures

If a webhook fails, Stripe will:
- Retry automatically (with exponential backoff)
- Show failure reason in dashboard
- Send notification after multiple failures

### Debug Webhook Issues

Common issues:
- ❌ 401/403 errors → Check authentication
- ❌ 404 error → Verify endpoint URL
- ❌ 500 error → Check server logs
- ❌ Timeout → Response took > 5 seconds

## Testing Checklist

- [ ] Local webhook forwarding works
- [ ] Test payment completes successfully
- [ ] Order data logged correctly
- [ ] Production webhook endpoint added
- [ ] Production signing secret configured
- [ ] Test webhook sent from dashboard
- [ ] Failed payment handling tested
- [ ] Refund handling tested
- [ ] Email notifications working
- [ ] Database saves order correctly

## Resources

- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Webhook Event Reference](https://stripe.com/docs/api/events/types)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
