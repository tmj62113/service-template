# Security Features Testing Guide

This document explains how to test all the universal security features implemented in this e-commerce template.

## Prerequisites

- Server running on http://localhost:3001
- Frontend running on http://localhost:5173
- Tools: `curl`, browser developer tools, or Postman

## 1. CORS (Cross-Origin Resource Sharing) Testing

### Test 1: Allowed Origin (Should Work)
```bash
# Test from allowed origin (development)
curl -X GET http://localhost:3001/api/health \
  -H "Origin: http://localhost:5173" \
  -v
```
**Expected**: Request succeeds, response includes CORS headers

### Test 2: Unauthorized Origin (Should Fail)
```bash
# Test from unauthorized origin
curl -X GET http://localhost:3001/api/health \
  -H "Origin: http://malicious-site.com" \
  -v
```
**Expected**: Request fails with CORS error, server logs warning about blocked origin

### Test 3: Preflight Request
```bash
# OPTIONS preflight request
curl -X OPTIONS http://localhost:3001/api/products \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```
**Expected**: Preflight succeeds with allowed methods and headers

---

## 2. CSRF (Cross-Site Request Forgery) Protection Testing

### Test 1: Get CSRF Token
```bash
curl -X GET http://localhost:3001/api/csrf-token \
  -c cookies.txt \
  -v
```
**Expected**: Returns JSON with `csrfToken` and sets `__Host-mjp.csrf` cookie

### Test 2: POST Without CSRF Token (Should Fail)
```bash
# Try to create a newsletter subscription without CSRF token
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  -v
```
**Expected**: Request fails with 403 Forbidden or CSRF error

### Test 3: POST With Valid CSRF Token (Should Work)
```bash
# First get the token
TOKEN=$(curl -s -X GET http://localhost:3001/api/csrf-token -c cookies.txt | jq -r '.csrfToken')

# Then use it in a POST request
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $TOKEN" \
  -b cookies.txt \
  -d '{"email":"test@example.com","source":"test"}' \
  -v
```
**Expected**: Request succeeds (rate limit permitting)

### Test 4: GET Requests (Should Work Without CSRF)
```bash
# GET requests don't require CSRF tokens
curl -X GET http://localhost:3001/api/products \
  -v
```
**Expected**: Request succeeds without CSRF token

---

## 3. Security Headers Testing

### Test: Check All Security Headers
```bash
curl -I http://localhost:3001/api/health
```

**Expected Headers**:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HSTS)
- `X-Frame-Options: DENY` (Clickjacking protection)
- `X-Content-Type-Options: nosniff` (MIME sniffing protection)
- `X-XSS-Protection: 1; mode=block` (XSS filter)
- `Content-Security-Policy: ...` (CSP directives)

**Browser Test**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit http://localhost:5173
4. Click on any request to the API
5. Check the "Response Headers" section
6. Verify all security headers are present

---

## 4. Error Sanitization Testing

### Test 1: Trigger an Error in Development
```bash
# Try to access non-existent order
curl -X GET http://localhost:3001/api/orders/invalid-id \
  -H "Cookie: authToken=invalid" \
  -v
```
**Expected (Development)**: Detailed error with stack trace

### Test 2: Trigger an Error in Production
```bash
# Set NODE_ENV=production and restart server, then:
NODE_ENV=production curl -X GET http://localhost:3001/api/orders/invalid-id \
  -v
```
**Expected (Production)**: Generic error message, NO stack trace

### Test 3: Authentication Error
```bash
# Try authenticated endpoint without token
curl -X GET http://localhost:3001/api/orders \
  -v
```
**Expected**: Generic "Authentication failed" message (no details about JWT or internals)

---

## 5. HTTPS Enforcement Testing

**Note**: This only works in production with actual HTTPS setup

### Simulated Test (Development)
```bash
# Check that the redirect middleware exists
curl -v http://localhost:3001/api/health \
  -H "x-forwarded-proto: http"
```
**Expected (Development)**: Works normally (redirect disabled in dev)

**Expected (Production)**: Would redirect to HTTPS

---

## 6. Rate Limiting Testing

### Test 1: General API Rate Limit
```bash
# Send 101 requests in quick succession (limit is 100/15min)
for i in {1..101}; do
  curl -s http://localhost:3001/api/products > /dev/null
  echo "Request $i"
done
```
**Expected**: First 100 succeed, 101st fails with "Too many requests"

### Test 2: Authentication Rate Limit
```bash
# Try 11 login attempts (limit is 10/15min)
for i in {1..11}; do
  curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' > /dev/null
  echo "Attempt $i"
done
```
**Expected**: First 10 attempts allowed, 11th blocked with rate limit error

### Test 3: Contact Form Rate Limit
```bash
# Try 4 contact form submissions (limit is 3/hour)
for i in {1..4}; do
  curl -s -X POST http://localhost:3001/api/messages \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","subject":"Test","message":"Test"}' > /dev/null
  echo "Submission $i"
done
```
**Expected**: First 3 succeed, 4th blocked

---

## 7. Environment Variable Validation Testing

### Test: Missing Required Variable
```bash
# Temporarily rename .env file
mv .env .env.backup

# Try to start server
node server.js
```
**Expected**: Server fails to start with clear error message listing missing variables

```bash
# Restore .env
mv .env.backup .env
```

### Test: Weak JWT Secret in Production
```bash
# Create .env with weak secret
echo "JWT_SECRET=weak" > .env.test

# Try to start in production mode
NODE_ENV=production dotenv -e .env.test node server.js
```
**Expected**: Server fails with error about JWT_SECRET being too short (< 32 chars)

---

## 8. Browser-Based Security Testing

### Test 1: Content Security Policy (CSP)
1. Open browser to http://localhost:5173
2. Open DevTools Console
3. Try to execute inline script:
```javascript
eval('console.log("testing CSP")')
```
**Expected**: CSP violation error (if strict CSP enabled)

### Test 2: Frame Protection
1. Create a simple HTML file:
```html
<iframe src="http://localhost:3001/api/health"></iframe>
```
2. Open in browser
**Expected**: Frame blocked by X-Frame-Options header

### Test 3: CORS in Browser
1. Open browser console on http://localhost:5173
2. Try to fetch from different origin:
```javascript
fetch('http://malicious-site.com/api/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
```
**Expected**: CORS error in console

---

## 9. Production Readiness Checklist

Before deploying to production, verify:

- [ ] `.env` file has all required variables set
- [ ] `JWT_SECRET` is at least 32 characters (strong)
- [ ] `NODE_ENV=production` is set
- [ ] `CLIENT_URL` points to production domain
- [ ] HTTPS is properly configured on hosting platform
- [ ] All security headers are present (check with curl -I)
- [ ] Rate limits are appropriate for production traffic
- [ ] Error responses don't leak sensitive information
- [ ] CORS only allows production domain
- [ ] Stripe webhook secret is configured

---

## 10. Automated Security Testing

### Quick Security Audit Script
```bash
#!/bin/bash
echo "=== Security Features Test ==="

echo "\n1. Testing CORS..."
curl -s -X GET http://localhost:3001/api/health \
  -H "Origin: http://malicious.com" | grep -q "error" && echo "✅ CORS blocking works" || echo "❌ CORS blocking failed"

echo "\n2. Testing Security Headers..."
curl -I http://localhost:3001/api/health 2>&1 | grep -q "Strict-Transport-Security" && echo "✅ HSTS header present" || echo "❌ HSTS header missing"
curl -I http://localhost:3001/api/health 2>&1 | grep -q "X-Frame-Options" && echo "✅ Frame protection present" || echo "❌ Frame protection missing"

echo "\n3. Testing CSRF Token Endpoint..."
curl -s http://localhost:3001/api/csrf-token | grep -q "csrfToken" && echo "✅ CSRF endpoint works" || echo "❌ CSRF endpoint failed"

echo "\n4. Testing Error Sanitization..."
curl -s -X GET http://localhost:3001/api/orders/invalid 2>&1 | grep -q "stack" && echo "⚠️  Stack traces exposed (dev mode)" || echo "✅ Errors sanitized (prod mode)"

echo "\nSecurity test complete!"
```

Save as `test-security.sh`, make executable (`chmod +x test-security.sh`), and run (`./test-security.sh`)

---

## Troubleshooting

### CSRF Token Issues
- Ensure cookies are enabled
- Check that `__Host-mjp.csrf` cookie is being set
- Verify the token is being sent in the `x-csrf-token` header
- Make sure domain matches (localhost:3001 for API)

### CORS Issues
- Check browser console for specific CORS error
- Verify `Origin` header matches allowed origins
- Ensure `credentials: true` in fetch requests if using cookies
- Check server logs for CORS blocking warnings

### Rate Limiting Issues
- Wait for rate limit window to expire (15 minutes for general, 1 hour for contact)
- Check server logs for rate limit messages
- Clear cookies/cache if testing auth rate limits

### Security Headers Not Present
- Verify Helmet middleware is loaded before routes
- Check for conflicts with other security middleware
- Ensure NODE_ENV is set correctly

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
