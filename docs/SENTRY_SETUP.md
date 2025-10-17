# Sentry Error Tracking Setup Guide

This template includes Sentry integration for production error tracking and monitoring. Sentry helps you:

- Track runtime errors in both backend and frontend
- Monitor performance and detect bottlenecks
- Replay user sessions to debug issues
- Get alerts when errors occur
- Filter and prioritize errors

## Table of Contents

1. [Getting Started](#getting-started)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Environment Variables](#environment-variables)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Privacy Considerations](#privacy-considerations)

---

## Getting Started

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and create a free account
2. Create a new project for your application
3. Select **Node.js** for backend and **React** for frontend
4. Copy the DSN (Data Source Name) for each project

### 2. Install Dependencies

The Sentry packages are already installed:

```bash
# Backend
@sentry/node

# Frontend
@sentry/react
```

---

## Backend Setup

### 1. Add Sentry DSN to Environment

Add to your `.env` file:

```env
# Sentry Error Tracking (Backend)
SENTRY_DSN=https://your-backend-dsn@o123456.ingest.sentry.io/123456
```

### 2. Initialize Sentry in server.js

The template includes Sentry initialization. Add this to the **top** of your `server.js`:

```javascript
import { initSentry, sentryRequestHandler, sentryErrorHandler } from './utils/sentry.js';

// Initialize Sentry FIRST (before other imports)
initSentry();

// ... other imports

const app = express();

// Add Sentry request handler FIRST
app.use(sentryRequestHandler);

// ... your other middleware

// Add Sentry error handler LAST (before other error handlers)
app.use(sentryErrorHandler);

// Your custom error handler
app.use((err, req, res, next) => {
  // Error handling logic
});
```

### 3. Capture Errors Manually

```javascript
import { captureException, captureMessage } from './utils/sentry.js';

try {
  // Risky operation
  await processPayment(order);
} catch (error) {
  // Capture error with context
  captureException(error, {
    orderId: order.id,
    userId: user.id,
    paymentMethod: 'stripe',
  });

  res.status(500).json({ error: 'Payment failed' });
}

// Capture informational messages
captureMessage('Large order processed', 'info', {
  orderTotal: 5000,
  productCount: 50,
});
```

---

## Frontend Setup

### 1. Add Sentry DSN to Environment

Create or update `.env.local`:

```env
# Sentry Error Tracking (Frontend)
VITE_SENTRY_DSN=https://your-frontend-dsn@o123456.ingest.sentry.io/789012
```

**IMPORTANT:** Frontend environment variables must start with `VITE_` to be accessible.

### 2. Initialize Sentry in main.jsx

Update your `src/main.jsx`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initSentry, ErrorBoundary, ErrorFallback } from './utils/sentry';

// Initialize Sentry FIRST
initSentry();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary fallback={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

### 3. Capture Errors Manually

```javascript
import { captureException, captureMessage, setUser } from '../utils/sentry';

// Capture an error
try {
  await api.checkout(items);
} catch (error) {
  captureException(error, {
    cartTotal: total,
    itemCount: items.length,
  });

  toast.error('Checkout failed. Please try again.');
}

// Set user context (after login)
setUser({
  id: user.id,
  email: user.email,
  role: user.role,
});

// Clear user context (on logout)
import { clearUser } from '../utils/sentry';
clearUser();
```

---

## Environment Variables

### Required

```env
# Backend
SENTRY_DSN=https://backend-dsn@o123456.ingest.sentry.io/123456

# Frontend
VITE_SENTRY_DSN=https://frontend-dsn@o123456.ingest.sentry.io/789012
```

### Optional

```env
# Node environment (Sentry auto-detects)
NODE_ENV=production
```

**Note:** Sentry is only active in production mode. It's disabled in development to avoid noise.

---

## Usage Examples

### 1. Tracking API Errors

```javascript
// Backend route
app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json(order);
  } catch (error) {
    captureException(error, {
      route: '/api/orders',
      userId: req.user?.id,
      orderData: req.body,
    });

    res.status(500).json({ error: 'Failed to create order' });
  }
});
```

### 2. Tracking React Errors

```javascript
// Wrap risky component operations
function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProduct(productId).catch((error) => {
      captureException(error, {
        component: 'ProductDetail',
        productId,
      });
    });
  }, [productId]);

  return <div>{/* ... */}</div>;
}
```

### 3. Adding Context with Breadcrumbs

```javascript
import { addBreadcrumb } from '../utils/sentry';

function checkout() {
  addBreadcrumb({
    category: 'checkout',
    message: 'User started checkout',
    level: 'info',
  });

  // Checkout logic...

  addBreadcrumb({
    category: 'checkout',
    message: 'Payment submitted',
    level: 'info',
  });
}
```

### 4. Setting User Context

```javascript
// After successful login
import { setUser } from '../utils/sentry';

const handleLogin = async (credentials) => {
  const user = await api.login(credentials);

  // Set user context for error tracking
  setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // ... rest of login logic
};
```

---

## Best Practices

### 1. Filter Sensitive Data

The template automatically filters:
- Passwords
- API tokens
- Authorization headers
- Cookies

**Never** manually log sensitive data in error context.

### 2. Add Meaningful Context

```javascript
// ❌ BAD: No context
captureException(error);

// ✅ GOOD: Rich context
captureException(error, {
  userId: user.id,
  action: 'purchase',
  productId: product.id,
  paymentMethod: 'stripe',
  amount: total,
});
```

### 3. Use Appropriate Log Levels

```javascript
// Critical errors
captureException(error); // Level: error

// Important events
captureMessage('Large order completed', 'warning', { total: 5000 });

// Informational
captureMessage('User completed onboarding', 'info', { userId: 123 });

// Debugging
captureMessage('Cache invalidated', 'debug', { cacheKey: 'products' });
```

### 4. Set Sample Rates

Adjust in `utils/sentry.js`:

```javascript
// Performance monitoring sample rate (0.0 to 1.0)
tracesSampleRate: 0.1, // 10% of transactions

// Session replay sample rate (0.0 to 1.0)
replaysSessionSampleRate: 0.1, // 10% of sessions
```

**Lower rates = less data sent = lower costs**

### 5. Use Error Boundaries

Wrap major sections of your app:

```javascript
import { ErrorBoundary } from '@sentry/react';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Routes>
        <Route path="/admin" element={
          <ErrorBoundary fallback={<AdminErrorPage />}>
            <Admin />
          </ErrorBoundary>
        } />
      </Routes>
    </ErrorBoundary>
  );
}
```

---

## Privacy Considerations

### GDPR Compliance

1. **Update Privacy Policy**
   - Disclose that you use error tracking
   - Explain what data is collected
   - Provide opt-out mechanism if required

2. **Data Scrubbing**
   - The template automatically scrubs passwords, tokens, cookies
   - Review `beforeSend` hooks in `utils/sentry.js`

3. **Session Replay**
   - Masks all text by default
   - Blocks all media by default
   - Consider if you need user consent

4. **User Data**
   - Only ID, email, and role are tracked
   - No payment info or sensitive data

### IP Anonymization

Enable in Sentry dashboard:
1. Go to Settings > Security & Privacy
2. Enable "IP Anonymization"

### Data Retention

Configure in Sentry dashboard:
1. Go to Settings > Data Retention
2. Set retention period (default: 90 days)

---

## Testing Sentry

### Development Mode

Sentry is **disabled** in development. To test:

```javascript
// Temporarily enable for testing
if (import.meta.env.MODE === 'development') {
  captureMessage('Test message from dev', 'info');
}
```

### Production Mode

1. Deploy to production (or staging)
2. Trigger an error intentionally:

```javascript
// Frontend
throw new Error('Test Sentry error tracking');

// Backend
app.get('/api/test-sentry', (req, res) => {
  throw new Error('Test Sentry error tracking');
});
```

3. Check Sentry dashboard for the error

---

## Monitoring Performance

### Backend

```javascript
import * as Sentry from '@sentry/node';

app.get('/api/products', async (req, res) => {
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: 'GET /api/products',
  });

  try {
    const products = await Product.find();
    res.json(products);
  } finally {
    transaction.finish();
  }
});
```

### Frontend

Performance monitoring is automatic for:
- Page loads
- Navigation
- API requests

---

## Alerting

### Set Up Alerts in Sentry

1. Go to **Alerts** in Sentry dashboard
2. Create new alert rule:
   - When error count > 10 in 1 hour
   - When new error occurs
   - When error rate increases

3. Configure notifications:
   - Email
   - Slack
   - PagerDuty
   - Webhook

---

## Cost Management

### Free Tier Limits

- **Events**: 5,000/month
- **Replays**: 50/month
- **Attachments**: 1GB storage

### Reducing Costs

1. **Lower sample rates**
   ```javascript
   tracesSampleRate: 0.05, // 5% instead of 10%
   ```

2. **Filter noisy errors**
   ```javascript
   ignoreErrors: [
     'ResizeObserver loop',
     'Network request failed',
   ]
   ```

3. **Disable session replay**
   ```javascript
   // Remove replayIntegration from integrations
   ```

---

## Troubleshooting

### Errors Not Appearing

1. Check DSN is correct
2. Verify `NODE_ENV=production`
3. Check network tab for Sentry requests
4. Review `beforeSend` filters

### Too Many Errors

1. Add to `ignoreErrors` list
2. Lower sample rates
3. Fix common issues causing noise

### Session Replays Not Working

1. Verify `VITE_SENTRY_DSN` is set
2. Check replays quota in dashboard
3. Ensure user consent if required

---

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [React Integration Guide](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Node.js Integration Guide](https://docs.sentry.io/platforms/node/)
- [Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)

---

**Last Updated:** January 2025
