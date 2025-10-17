# Winston Logging Guide

Production-ready structured logging for your e-commerce application.

## Overview

Winston replaces `console.log()` with professional logging that includes:
- ✅ Log levels (error, warn, info, http, debug)
- ✅ Timestamps
- ✅ Color-coded output in development
- ✅ JSON logs in production
- ✅ File rotation and storage
- ✅ HTTP request/response logging

---

## Quick Start

### Import and Use

```javascript
import logger from './utils/logger.js';

// Info logging
logger.info('User logged in', {
  userId: 123,
  email: 'user@example.com'
});

// Error logging
logger.error('Payment failed', {
  orderId: 456,
  amount: 99.99,
  error: error.message,
  stack: error.stack
});

// Warning
logger.warn('Low stock alert', {
  productId: 789,
  stockLevel: 2
});

// HTTP (automatic via middleware)
// No manual logging needed

// Debug (development only)
logger.debug('Cache invalidated', {
  cacheKey: 'products'
});
```

---

## Log Levels

Winston has 5 log levels in order of priority:

### 1. **error** (Priority 0 - Highest)
Use for critical failures:
```javascript
logger.error('Database connection failed', {
  database: 'mongodb',
  host: 'cluster.mongodb.net',
  error: err.message
});
```

### 2. **warn** (Priority 1)
Use for concerning but non-critical issues:
```javascript
logger.warn('API rate limit approaching', {
  endpoint: '/api/products',
  requests: 95,
  limit: 100
});
```

### 3. **info** (Priority 2)
Use for important operational events:
```javascript
logger.info('Order created successfully', {
  orderId: order.id,
  userId: user.id,
  total: order.total
});
```

### 4. **http** (Priority 3)
Use for HTTP requests (automatic via middleware):
```javascript
// Automatically logged by requestLogger middleware
// Output: GET /api/products 200 - 45ms
```

### 5. **debug** (Priority 4 - Lowest)
Use for detailed debugging information:
```javascript
logger.debug('Cache lookup', {
  key: 'products:featured',
  hit: true,
  ttl: 300
});
```

---

## Development vs Production

### Development Mode (`NODE_ENV !== 'production'`)

**Output:** Color-coded console
```
2025-01-15 14:23:45 info: User logged in
2025-01-15 14:23:47 error: Payment failed
2025-01-15 14:23:50 warn: Low stock alert
```

**Log Level:** Shows all levels (error through debug)

**Files:** Not created

### Production Mode (`NODE_ENV === 'production'`)

**Output:** JSON format
```json
{
  "timestamp": "2025-01-15T14:23:47.123Z",
  "level": "error",
  "message": "Payment failed",
  "orderId": 456,
  "amount": 99.99
}
```

**Log Level:** Shows error, warn, info (filters out http and debug)

**Files:**
- `logs/combined.log` - All logs
- `logs/error.log` - Only errors

**File Rotation:**
- Max size: 5MB per file
- Max files: 5 (automatically rotates)
- Old files auto-deleted

---

## HTTP Request Logging

The `requestLogger` middleware automatically logs all HTTP requests.

### Setup (Already Done)

In `server.js`:
```javascript
import logger, { requestLogger } from './utils/logger.js';

app.use(requestLogger);
```

### What Gets Logged

**Incoming Request:**
```
http: GET /api/products {
  method: 'GET',
  path: '/api/products',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
}
```

**Response:**
```
http: GET /api/products 200 - 45ms {
  method: 'GET',
  path: '/api/products',
  statusCode: 200,
  duration: 45,
  ip: '192.168.1.1'
}
```

**Error Responses (4xx/5xx):**
```
error: POST /api/checkout 500 - 123ms {
  method: 'POST',
  path: '/api/checkout',
  statusCode: 500,
  duration: 123,
  ip: '192.168.1.1'
}
```

---

## Log Files

### Location

```
logs/
├── combined.log  (all logs)
└── error.log     (only errors)
```

### File Rotation

When `combined.log` reaches 5MB:
```
logs/
├── combined.log        (current)
├── combined.log.1      (previous)
├── combined.log.2
├── combined.log.3
├── combined.log.4
└── combined.log.5      (oldest, will be deleted on next rotation)
```

### Viewing Logs

```bash
# View latest logs
tail -f logs/combined.log

# View only errors
tail -f logs/error.log

# Search for specific error
grep "Payment failed" logs/error.log

# View last 100 lines
tail -100 logs/combined.log

# Search with context
grep -A 5 -B 5 "orderId: 456" logs/combined.log
```

---

## Best Practices

### 1. Include Context

**❌ Bad:**
```javascript
logger.error('Payment failed');
```

**✅ Good:**
```javascript
logger.error('Payment failed', {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  paymentMethod: 'stripe',
  error: err.message,
  stack: err.stack
});
```

### 2. Use Appropriate Levels

**❌ Bad:**
```javascript
logger.error('User logged in');  // Not an error!
logger.info('Database crashed!');  // This is an error!
```

**✅ Good:**
```javascript
logger.info('User logged in', { userId: 123 });
logger.error('Database crashed', { error: err.message });
```

### 3. Never Log Sensitive Data

**❌ Bad:**
```javascript
logger.info('User login', {
  email: user.email,
  password: user.password,  // NEVER log passwords!
  creditCard: '4242...'      // NEVER log CC numbers!
});
```

**✅ Good:**
```javascript
logger.info('User login', {
  userId: user.id,
  email: user.email
  // No passwords, no credit cards
});
```

### 4. Log Errors with Stack Traces

**❌ Bad:**
```javascript
try {
  await processPayment();
} catch (err) {
  logger.error('Payment failed');
}
```

**✅ Good:**
```javascript
try {
  await processPayment();
} catch (err) {
  logger.error('Payment processing failed', {
    error: err.message,
    stack: err.stack,
    orderId: order.id
  });
}
```

### 5. Use Structured Data

**❌ Bad:**
```javascript
logger.info(`User ${userId} ordered ${productName} for $${price}`);
```

**✅ Good:**
```javascript
logger.info('Order placed', {
  userId: userId,
  productId: product.id,
  productName: product.name,
  price: price
});
```

---

## Common Use Cases

### User Actions
```javascript
logger.info('User registered', { userId: user.id, email: user.email });
logger.info('User logged in', { userId: user.id });
logger.info('User updated profile', { userId: user.id, fields: ['name', 'email'] });
```

### Order Processing
```javascript
logger.info('Order created', { orderId: order.id, total: order.total });
logger.warn('Order payment pending', { orderId: order.id, duration: '5min' });
logger.error('Order payment failed', { orderId: order.id, error: err.message });
```

### Database Operations
```javascript
logger.info('Database connected', { host: process.env.MONGODB_URI });
logger.warn('Database slow query', { query: 'Product.find()', duration: 5000 });
logger.error('Database connection lost', { error: err.message });
```

### External APIs
```javascript
logger.info('Stripe payment successful', { chargeId: charge.id, amount: charge.amount });
logger.warn('Cloudinary upload slow', { filename: file.name, duration: 8000 });
logger.error('Resend email failed', { to: email, error: err.message });
```

---

## Troubleshooting

### Logs Not Appearing

**Issue:** No logs in console

**Solution:**
```javascript
// Check logger is imported
import logger from './utils/logger.js';

// Not console.log!
logger.info('Test message');
```

### Log Files Not Created

**Issue:** `logs/` directory empty

**Check:**
1. Are you in production mode? `NODE_ENV=production`
2. Does `logs/` directory exist?
3. Do you have write permissions?

**Fix:**
```bash
mkdir -p logs
chmod 755 logs
NODE_ENV=production node server.js
```

### Too Many Log Files

**Issue:** Disk space filling up

**Solution:**
Adjust retention in `/utils/logger.js`:
```javascript
new winston.transports.File({
  filename: path.join(__dirname, '../logs/combined.log'),
  maxsize: 5242880,  // Reduce to 2MB: 2097152
  maxFiles: 5,       // Keep only 3 files: 3
})
```

### Can't Find Specific Log

**Solution:** Use grep
```bash
# Find by order ID
grep "orderId.*456" logs/combined.log

# Find errors from today
grep "$(date +%Y-%m-%d)" logs/error.log

# Find slow requests (>1000ms)
grep "duration.*[0-9]\{4,\}" logs/combined.log
```

---

## Integration with Monitoring

### Send Logs to External Service

Edit `/utils/logger.js` to add transports:

**Datadog:**
```javascript
import { DatadogTransport } from '@shelf/winston-datadog';

transports.push(
  new DatadogTransport({
    apiKey: process.env.DATADOG_API_KEY,
    hostname: 'ecommerce-app',
    service: 'backend',
  })
);
```

**LogDNA:**
```javascript
import logdnaWinston from 'logdna-winston';

transports.push(
  logdnaWinston({
    key: process.env.LOGDNA_KEY,
    hostname: 'ecommerce-app'
  })
);
```

**AWS CloudWatch:**
```javascript
import CloudWatchTransport from 'winston-cloudwatch';

transports.push(
  new CloudWatchTransport({
    logGroupName: 'ecommerce-app',
    logStreamName: 'backend',
    awsRegion: 'us-east-1'
  })
);
```

---

## Configuration

All configuration is in `/utils/logger.js`:

```javascript
// Change log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  verbose: 5  // Add new level
};

// Change colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',  // Change from green
  http: 'magenta',
  debug: 'blue',
};

// Change file size
maxsize: 10485760,  // 10MB instead of 5MB

// Change file count
maxFiles: 10,  // Keep 10 files instead of 5

// Change timestamp format
winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' })
```

---

## Examples

### Complete Error Handling
```javascript
async function processOrder(orderId) {
  logger.info('Processing order', { orderId });

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      logger.warn('Order not found', { orderId });
      return null;
    }

    const payment = await processPayment(order);
    logger.info('Payment processed', {
      orderId,
      paymentId: payment.id,
      amount: payment.amount
    });

    return payment;

  } catch (error) {
    logger.error('Order processing failed', {
      orderId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### Performance Monitoring
```javascript
async function fetchProducts() {
  const start = Date.now();

  try {
    const products = await Product.find();
    const duration = Date.now() - start;

    if (duration > 1000) {
      logger.warn('Slow database query', {
        query: 'Product.find()',
        duration,
        count: products.length
      });
    } else {
      logger.debug('Products fetched', {
        count: products.length,
        duration
      });
    }

    return products;
  } catch (error) {
    logger.error('Failed to fetch products', {
      error: error.message,
      duration: Date.now() - start
    });
    throw error;
  }
}
```

---

## Summary

**Winston provides:**
- Professional logging with timestamps and levels
- Color-coded development output
- Structured JSON production logs
- Automatic file rotation
- HTTP request/response logging

**Remember:**
- Use appropriate log levels
- Include context in log messages
- Never log sensitive data (passwords, tokens, CC numbers)
- Log errors with stack traces
- Use structured data objects

**Log files location:** `logs/combined.log` and `logs/error.log`

---

**Next Steps:**
- Integrate with monitoring service (Datadog, LogDNA, etc.)
- Set up log alerts for critical errors
- Create log dashboards
- Implement log aggregation for multiple servers

---

**Last Updated:** January 2025
