# Production Security Checklist

This document outlines all security measures that must be completed before deploying to production.

## ✅ Already Completed (Development)

- [x] Strong JWT_SECRET set in .env (44+ character random string)
- [x] JWT_SECRET enforcement (server fails if missing)
- [x] Request body size limits (1MB for JSON)
- [x] Zero dependency vulnerabilities
- [x] Helmet.js security headers configured
- [x] Rate limiting on all endpoints
- [x] Account lockout after 5 failed login attempts
- [x] IP blocking system
- [x] Comprehensive audit logging
- [x] Input validation and sanitization
- [x] Honeypot bot detection
- [x] Password hashing with bcrypt
- [x] HttpOnly cookies for JWT tokens

---

## 🚨 Critical - Must Complete Before Launch

### 1. HTTPS Enforcement

**Current State**: Cookies only use `secure` flag in production, but HTTPS not enforced

**Required Changes**:

#### a. Add HTTPS Redirect Middleware (server.js)

Add this after line 106 (after cookie parser):

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

#### b. Enable Trust Proxy (server.js)

Add this before middleware (around line 28):

```javascript
// Trust proxy for HTTPS detection (if behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
}
```

#### c. Add HSTS Header (server.js)

Update Helmet configuration (around line 47):

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  // Add HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));
```

**Testing**: After deployment, verify HTTPS works and redirects are functioning

---

### 2. CSRF Protection

**Current State**: Package installed (`csrf-csrf`) but not implemented

**Required Changes**:

#### a. Install and Configure CSRF Middleware (server.js)

Add this after cookie parser (around line 107):

```javascript
import { doubleCsrf } from 'csrf-csrf';

// CSRF Protection (only in production or if explicitly enabled)
const csrfProtection = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET,
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// Apply CSRF protection to state-changing routes
const { generateToken, doubleCsrfProtection } = csrfProtection;

// Add CSRF token endpoint (so frontend can get token)
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: generateToken(req, res) });
});

// Apply CSRF protection to all POST/PUT/DELETE routes
app.use('/api/', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return doubleCsrfProtection(req, res, next);
  }
  next();
});
```

#### b. Update Frontend to Include CSRF Token

Create a new utility file `src/utils/csrf.js`:

```javascript
// Fetch CSRF token from backend
export async function getCsrfToken() {
  const response = await fetch('http://localhost:3001/api/csrf-token', {
    credentials: 'include'
  });
  const data = await response.json();
  return data.csrfToken;
}

// Add CSRF token to fetch requests
export async function fetchWithCsrf(url, options = {}) {
  const csrfToken = await getCsrfToken();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-csrf-token': csrfToken,
    },
    credentials: 'include'
  });
}
```

**Testing**: Verify all POST/PUT/DELETE requests include CSRF token

---

### 3. CORS Restriction

**Current State**: Allows all requests from `CLIENT_URL` (localhost in dev)

**Required Changes**:

Update CORS configuration (server.js around line 100):

```javascript
// CORS configuration - STRICT for production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CLIENT_URL] // Only production domain
  : [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000']; // Dev flexibility

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));
```

**Environment Variables Needed**:
```
CLIENT_URL=https://yourdomain.com
```

**Testing**: Verify only your production domain can make requests

---

### 4. Environment Variables Validation

**Current State**: Some variables have fallbacks, not all are validated

**Required Changes**:

Create a new file `utils/validateEnv.js`:

```javascript
/**
 * Validate required environment variables
 * Server should fail to start if any are missing
 */
export function validateRequiredEnv() {
  const required = [
    'JWT_SECRET',
    'MONGODB_URI',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'CLIENT_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nServer cannot start without these variables.');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
}
```

Add to server.js (after dotenv.config(), around line 3):

```javascript
import { validateRequiredEnv } from './utils/validateEnv.js';

// Validate environment variables before starting server
if (process.env.NODE_ENV === 'production') {
  validateRequiredEnv();
}
```

**Testing**: Try starting server without each variable to ensure it fails properly

---

### 5. Error Message Sanitization

**Current State**: Some errors may expose stack traces or internal details

**Required Changes**:

Add error handling middleware at the END of server.js (before app.listen()):

```javascript
// Global error handler (must be last middleware)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Log full error details server-side
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }

  // Send sanitized error to client
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred processing your request'
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
```

**Testing**: Trigger various errors and verify production doesn't leak sensitive info

---

### 6. Database Security

**Required Actions**:

#### a. MongoDB Atlas Configuration
- [ ] Create production database user with minimal permissions (readWrite only)
- [ ] Add production server IP to IP whitelist
- [ ] Remove development IPs from whitelist
- [ ] Enable MongoDB encryption at rest
- [ ] Set up automated backups (daily minimum)

#### b. Update Connection String
```
MONGODB_URI=mongodb+srv://prod_user:strong_password@cluster.mongodb.net/prod_db?retryWrites=true&w=majority
```

**Testing**: Verify connection works from production server only

---

### 7. Production Email Configuration

**Current State**: Using Resend test domain (`onboarding@resend.dev`)

**Required Changes**:

#### a. Set Up Custom Domain in Resend
1. Add your domain to Resend
2. Configure DNS records (SPF, DKIM, DMARC)
3. Verify domain

#### b. Update Email Sender Address

Update all `resend.emails.send()` calls to use:
```javascript
from: 'Mark J Peterson Art <noreply@markjpetersonart.com>'
```

Files to update:
- `server.js` (order confirmation, newsletter, contact form)

**Testing**: Send test emails and verify they don't go to spam

---

### 8. Security Headers Enhancement

**Current State**: Basic headers configured

**Required Changes**:

Add additional security headers to Helmet config (server.js):

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  // Additional headers
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' }
}));
```

**Testing**: Use https://securityheaders.com to verify headers

---

### 9. Rate Limiting Review

**Current State**: Rate limits configured for development

**Production Recommendations**:

Review and adjust rate limits in server.js (around line 72):

```javascript
// General API rate limiting - ADJUST FOR PRODUCTION TRAFFIC
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  200, // Increase from 100 for production (adjust based on traffic)
  'Too many requests, please try again later'
);

// Auth limiting - Keep strict
const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  10, // Keep at 10 for security
  'Too many authentication attempts, please try again later'
);

// Contact form - Adjust based on expected volume
const contactLimiter = createRateLimiter(
  60 * 60 * 1000,
  5, // Increase from 3 if getting legitimate complaints
  'Too many contact form submissions, please try again later'
);
```

**Testing**: Monitor rate limit hits in production logs

---

### 10. Logging and Monitoring

**Required Actions**:

#### a. Set Up Error Tracking
Install and configure Sentry or similar:

```bash
npm install @sentry/node
```

```javascript
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 1.0,
  });
}
```

#### b. Add Security Event Alerts
Configure alerts for:
- Multiple failed login attempts from single IP
- Account lockouts
- Blocked IP access attempts
- CSRF token failures
- Unusual number of 500 errors

**Environment Variables**:
```
SENTRY_DSN=your_sentry_dsn_here
```

---

## 📝 Pre-Launch Checklist

Run through this checklist before going live:

### Environment
- [ ] `NODE_ENV=production` is set
- [ ] All required environment variables are set and validated
- [ ] Strong, unique secrets generated for production (not reused from dev)
- [ ] `.env` file is NOT committed to git (in `.gitignore`)

### Security
- [ ] HTTPS is enforced with HSTS headers
- [ ] CSRF protection is active and tested
- [ ] CORS restricted to production domain only
- [ ] Error messages don't expose sensitive information
- [ ] All security headers are configured (test on securityheaders.com)
- [ ] Rate limits reviewed and appropriate for production traffic

### Database
- [ ] Production MongoDB user created with minimal permissions
- [ ] Production server IP whitelisted
- [ ] Development IPs removed from whitelist
- [ ] Automated backups configured
- [ ] Connection string uses production database

### Email
- [ ] Custom domain configured in Resend
- [ ] SPF, DKIM, DMARC records added to DNS
- [ ] Test emails sent and verified (not in spam)
- [ ] All email senders updated from test domain

### Monitoring
- [ ] Error tracking service configured (Sentry, etc.)
- [ ] Security alerts set up
- [ ] Audit logs retention reviewed (currently 90 days)
- [ ] MongoDB Atlas monitoring alerts configured

### Testing
- [ ] HTTPS redirect works
- [ ] CSRF tokens work on all forms
- [ ] Only production domain can make API requests
- [ ] Error handling doesn't leak stack traces
- [ ] Rate limiting works as expected
- [ ] Failed login lockout works
- [ ] IP blocking works
- [ ] All core features work in production environment

### Documentation
- [ ] Production deployment guide created
- [ ] Emergency contact information documented
- [ ] Backup restoration process documented
- [ ] Security incident response plan created

---

## 🔐 Recommended (Phase 2 - Post Launch)

These can be added after initial launch:

### Two-Factor Authentication (2FA)
- Install `speakeasy` for TOTP generation
- Add 2FA setup flow for users
- Make mandatory for admin accounts

### Session Management Dashboard
- Allow users to view active sessions
- "Logout all devices" functionality
- Automatic old session cleanup

### API Versioning
- Add `/api/v1/` prefix to all endpoints
- Maintain backward compatibility

### Advanced Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Application performance monitoring (New Relic, DataDog)
- Real-time security monitoring dashboard

### Password Requirements
- Minimum 12 characters (currently 8)
- Check against common password lists
- Password strength meter on frontend
- Force password change every 90 days for admins

### Additional Security Measures
- Implement WAF (Web Application Firewall)
- Add DDoS protection (Cloudflare)
- Security penetration testing
- Regular security audits

---

## 📞 Support

If you have questions about any of these security measures:
- Review security best practices: https://owasp.org/www-project-top-ten/
- Check deployment platform security docs (Vercel, Railway, AWS, etc.)
- Consider security audit before launch for e-commerce applications

**Remember**: Security is ongoing, not a one-time task. Regularly review and update security measures as threats evolve.
