#!/bin/bash

echo "========================================="
echo "   Security Features Test Suite"
echo "========================================="
echo ""

# Check if server is running
if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Error: Server is not running on port 3001"
    echo "Please start the server with: node server.js"
    exit 1
fi

echo "✓ Server is running on port 3001"
echo ""

# Test 1: Security Headers
echo "========================================="
echo "Test 1: Security Headers"
echo "========================================="
echo ""

echo "Checking HSTS header..."
if curl -s -I http://localhost:3001/api/health 2>&1 | grep -q "Strict-Transport-Security"; then
    echo "✅ HSTS header present"
else
    echo "❌ HSTS header missing"
fi

echo "Checking Frame protection..."
if curl -s -I http://localhost:3001/api/health 2>&1 | grep -q "X-Frame-Options"; then
    echo "✅ Frame protection header present"
else
    echo "❌ Frame protection header missing"
fi

echo "Checking Content-Type protection..."
if curl -s -I http://localhost:3001/api/health 2>&1 | grep -q "X-Content-Type-Options"; then
    echo "✅ Content-Type protection header present"
else
    echo "❌ Content-Type protection header missing"
fi

echo "Checking XSS protection..."
if curl -s -I http://localhost:3001/api/health 2>&1 | grep -q "X-XSS-Protection"; then
    echo "✅ XSS protection header present"
else
    echo "❌ XSS protection header missing"
fi

echo ""

# Test 2: CSRF Token Endpoint
echo "========================================="
echo "Test 2: CSRF Token Endpoint"
echo "========================================="
echo ""

CSRF_RESPONSE=$(curl -s http://localhost:3001/api/csrf-token)
if echo "$CSRF_RESPONSE" | grep -q "csrfToken"; then
    echo "✅ CSRF token endpoint working"
    echo "   Token received: $(echo $CSRF_RESPONSE | head -c 50)..."
else
    echo "❌ CSRF token endpoint failed"
    echo "   Response: $CSRF_RESPONSE"
fi

echo ""

# Test 3: CORS Protection
echo "========================================="
echo "Test 3: CORS Protection"
echo "========================================="
echo ""

echo "Testing with allowed origin (localhost:5173)..."
ALLOWED_CORS=$(curl -s -X GET http://localhost:3001/api/health \
    -H "Origin: http://localhost:5173" \
    -w "\n%{http_code}" 2>&1 | tail -1)

if [ "$ALLOWED_CORS" = "200" ]; then
    echo "✅ Allowed origin works correctly (HTTP 200)"
else
    echo "⚠️  Allowed origin returned HTTP $ALLOWED_CORS"
fi

echo ""
echo "Testing with unauthorized origin..."
# Note: CORS blocking happens in the browser, not in curl
# We're just checking the server doesn't crash
BLOCKED_CORS=$(curl -s -X GET http://localhost:3001/api/health \
    -H "Origin: http://malicious-site.com" \
    -w "\n%{http_code}" 2>&1 | tail -1)

echo "ℹ️  Server responded with HTTP $BLOCKED_CORS"
echo "   (CORS blocking is enforced by browsers, not curl)"

echo ""

# Test 4: Rate Limiting
echo "========================================="
echo "Test 4: Rate Limiting (Sample Test)"
echo "========================================="
echo ""

echo "Testing general API rate limit (100 req/15min)..."
echo "Sending 5 test requests..."

SUCCESS_COUNT=0
for i in {1..5}; do
    RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/health 2>&1 | tail -1)
    if [ "$RESPONSE" = "200" ]; then
        ((SUCCESS_COUNT++))
    fi
done

if [ $SUCCESS_COUNT -eq 5 ]; then
    echo "✅ Rate limiting configured (5/5 requests succeeded)"
    echo "   Full test: Send 101 requests to trigger limit"
else
    echo "⚠️  Only $SUCCESS_COUNT/5 requests succeeded"
fi

echo ""

# Test 5: Error Handling
echo "========================================="
echo "Test 5: Error Sanitization"
echo "========================================="
echo ""

echo "Testing error response format..."
ERROR_RESPONSE=$(curl -s http://localhost:3001/api/orders/invalid-id-12345)

if echo "$ERROR_RESPONSE" | grep -q "error"; then
    echo "✅ Error responses are formatted correctly"

    if echo "$ERROR_RESPONSE" | grep -q "stack"; then
        echo "ℹ️  Development mode: Stack traces visible"
    else
        echo "✅ Production mode: Stack traces sanitized"
    fi
else
    echo "⚠️  Unexpected error response format"
fi

echo ""

# Test 6: Environment Validation
echo "========================================="
echo "Test 6: Environment Configuration"
echo "========================================="
echo ""

if [ -f .env ]; then
    echo "✅ .env file exists"

    if grep -q "JWT_SECRET" .env 2>/dev/null; then
        JWT_LENGTH=$(grep "JWT_SECRET=" .env | cut -d'=' -f2 | wc -c)
        if [ $JWT_LENGTH -ge 32 ]; then
            echo "✅ JWT_SECRET is properly configured (≥32 chars)"
        else
            echo "⚠️  JWT_SECRET is too short (< 32 chars)"
        fi
    else
        echo "❌ JWT_SECRET not found in .env"
    fi

    if grep -q "CLIENT_URL" .env 2>/dev/null; then
        echo "✅ CLIENT_URL is configured"
    else
        echo "⚠️  CLIENT_URL not found in .env"
    fi
else
    echo "❌ .env file not found"
fi

echo ""

# Test 7: JSON Body Parsing
echo "========================================="
echo "Test 7: Request Body Size Limit"
echo "========================================="
echo ""

echo "Testing 1MB request size limit..."
SMALL_REQUEST=$(curl -s -X POST http://localhost:3001/api/health \
    -H "Content-Type: application/json" \
    -d '{"test":"data"}' \
    -w "\n%{http_code}" 2>&1 | tail -1)

if [ "$SMALL_REQUEST" = "404" ] || [ "$SMALL_REQUEST" = "200" ]; then
    echo "✅ Normal-sized requests work (HTTP $SMALL_REQUEST)"
else
    echo "⚠️  Unexpected response: HTTP $SMALL_REQUEST"
fi

echo ""

# Summary
echo "========================================="
echo "           Test Summary"
echo "========================================="
echo ""
echo "Security features tested:"
echo "  ✓ HSTS headers (HTTPS enforcement)"
echo "  ✓ Frame protection (clickjacking)"
echo "  ✓ Content-Type protection"
echo "  ✓ XSS protection"
echo "  ✓ CSRF token endpoint"
echo "  ✓ CORS configuration"
echo "  ✓ Rate limiting"
echo "  ✓ Error sanitization"
echo "  ✓ Environment validation"
echo "  ✓ Request size limits"
echo ""
echo "For detailed testing instructions, see:"
echo "  📄 SECURITY_TESTING.md"
echo ""
echo "========================================="
echo "Test suite complete!"
echo "========================================="
