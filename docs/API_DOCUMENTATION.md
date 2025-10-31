# API Documentation

Complete API reference for the E-Commerce Template backend.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication via HTTP-only cookies.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Logout
```http
POST /api/auth/logout
```

### Check Auth Status
```http
GET /api/auth/me
```

---

## Products

### Get All Products
```http
GET /api/products
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "category": "art",
    "images": ["https://cloudinary.com/..."],
    "stock": 10,
    "featured": true,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]
```

### Get Single Product
```http
GET /api/products/:id
```

### Create Product (Admin Only)
```http
POST /api/admin/products
Content-Type: application/json
Authorization: Required (Admin)

{
  "name": "New Product",
  "description": "Description",
  "price": 149.99,
  "category": "art",
  "stock": 5,
  "featured": false,
  "images": []
}
```

### Update Product (Admin Only)
```http
PUT /api/admin/products/:id
Content-Type: application/json
Authorization: Required (Admin)

{
  "name": "Updated Name",
  "price": 159.99
}
```

### Delete Product (Admin Only)
```http
DELETE /api/admin/products/:id
Authorization: Required (Admin)
```

---

## Orders

### Create Order (Stripe Checkout)
```http
POST /api/create-checkout-session
Content-Type: application/json

{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "shippingInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "sessionId": "cs_test_..."
}
```

### Get All Orders (Admin Only)
```http
GET /api/admin/orders
Authorization: Required (Admin)
```

### Get Single Order (Admin Only)
```http
GET /api/admin/orders/:id
Authorization: Required (Admin)
```

### Update Order Status (Admin Only)
```http
PATCH /api/admin/orders/:id/status
Content-Type: application/json
Authorization: Required (Admin)

{
  "status": "shipped"
}
```

---

## Newsletter

### Subscribe
```http
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "subscriber@example.com",
  "source": "homepage"
}
```

### Send Newsletter (Admin Only)
```http
POST /api/admin/newsletter/send
Content-Type: application/json
Authorization: Required (Admin)

{
  "subject": "Monthly Newsletter",
  "htmlContent": "<html>...</html>",
"textContent": "Plain text version"
}
```

---

## Recurring Bookings

Manage automated booking patterns for clients. All endpoints require authentication via the session cookie.

### Create Recurring Booking
```http
POST /api/bookings/recurring
Cookie: authToken=...
Content-Type: application/json

{
  "staffId": "6645f5da3f5f1c0012ab1234",
  "serviceId": "6645f6103f5f1c0012ab5678",
  "frequency": "weekly",
  "interval": 1,
  "dayOfWeek": 2,
  "startTime": "14:00",
  "duration": 60,
  "timeZone": "America/New_York",
  "startDate": "2025-06-01T14:00:00.000Z",
  "paymentPlan": "per_session"
}
```

**Description:**
- Clients create recurring patterns for themselves.
- Providers and admins must include a `clientId` in the request body.

**Response:**
```json
{
  "_id": "6650adf23f5f1c0012ff1122",
  "clientId": "663fd2b53f5f1c0012aa9090",
  "staffId": "6645f5da3f5f1c0012ab1234",
  "serviceId": "6645f6103f5f1c0012ab5678",
  "frequency": "weekly",
  "interval": 1,
  "dayOfWeek": 2,
  "startTime": "14:00",
  "duration": 60,
  "timeZone": "America/New_York",
  "startDate": "2025-06-01T14:00:00.000Z",
  "status": "active",
  "paymentPlan": "per_session",
  "createdAt": "2025-05-24T16:15:23.000Z",
  "updatedAt": "2025-05-24T16:15:23.000Z"
}
```

### Get Recurring Booking by ID
```http
GET /api/bookings/recurring/:id
Cookie: authToken=...
```

**Description:**
- Admins can fetch any recurring pattern.
- Clients can fetch their own patterns.
- Providers can fetch patterns assigned to them.

**Response:** Same payload as the creation response.

### List Recurring Bookings
```http
GET /api/bookings/recurring?status=active
Cookie: authToken=...
```

**Description:**
- Clients automatically receive only their patterns.
- Providers automatically receive patterns for their staff record.
- Admins can filter with `clientId`, `staffId`, `serviceId`, and `status` query parameters.

**Response:**
```json
[
  {
    "_id": "6650adf23f5f1c0012ff1122",
    "clientId": "663fd2b53f5f1c0012aa9090",
    "staffId": "6645f5da3f5f1c0012ab1234",
    "serviceId": "6645f6103f5f1c0012ab5678",
    "frequency": "weekly",
    "interval": 1,
    "dayOfWeek": 2,
    "startTime": "14:00",
    "duration": 60,
    "timeZone": "America/New_York",
    "startDate": "2025-06-01T14:00:00.000Z",
    "status": "active",
    "paymentPlan": "per_session",
    "createdAt": "2025-05-24T16:15:23.000Z",
    "updatedAt": "2025-05-24T16:15:23.000Z"
  }
]
```

### Update Recurring Booking
```http
PUT /api/bookings/recurring/:id
Cookie: authToken=...
Content-Type: application/json

{
  "startTime": "15:30",
  "duration": 75,
  "dayOfWeek": 3
}
```

**Description:**
- Admins, the owning client, and assigned providers can update schedule-related fields.
- Admins may additionally adjust the recurring `status`.

**Response:** Updated recurring booking document.

### Cancel Recurring Booking
```http
DELETE /api/bookings/recurring/:id
Cookie: authToken=...
```

**Description:**
- Marks the series as `cancelled` and stops future occurrences.
- Same role-based access rules as other endpoints.

**Response:**
```json
{
  "message": "Recurring booking cancelled successfully",
  "recurring": {
    "_id": "6650adf23f5f1c0012ff1122",
    "status": "cancelled",
    "endDate": "2025-05-24T16:20:00.000Z"
  }
}
```

### Pause Recurring Booking
```http
POST /api/bookings/recurring/:id/pause
Cookie: authToken=...
```

**Description:** Sets status to `paused` without cancelling the series.

**Response:** Updated recurring booking document.

### Resume Recurring Booking
```http
POST /api/bookings/recurring/:id/resume
Cookie: authToken=...
```

**Description:** Reactivates a paused recurring booking.

**Response:** Updated recurring booking document.

### Get Upcoming Occurrences
```http
GET /api/bookings/recurring/:id/upcoming?count=3
Cookie: authToken=...
```

**Description:** Returns the next N occurrences (default 5, maximum 50) relative to the current time.

**Response:**
```json
{
  "occurrences": [
    "2025-06-01T14:00:00.000Z",
    "2025-06-08T14:00:00.000Z",
    "2025-06-15T14:00:00.000Z"
  ]
}
```

### Get Subscribers (Admin Only)
```http
GET /api/admin/newsletter/subscribers
Authorization: Required (Admin)
```

---

## Contact

### Submit Contact Form
```http
POST /api/messages
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question",
  "message": "Message content",
  "honeypot": ""
}
```

**Note:** `honeypot` field must be empty (spam protection)

### Get Messages (Admin Only)
```http
GET /api/admin/messages
Authorization: Required (Admin)
```

---

## Image Upload

### Upload Product Image (Admin Only)
```http
POST /api/admin/upload
Content-Type: multipart/form-data
Authorization: Required (Admin)

Form Data:
- image: (file)
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/..."
}
```

---

## Analytics (Admin Only)

### Get Dashboard Stats
```http
GET /api/admin/analytics/dashboard
Authorization: Required (Admin)
```

**Response:**
```json
{
  "totalRevenue": 15234.50,
  "totalOrders": 145,
  "totalCustomers": 98,
  "recentOrders": [...],
  "topProducts": [...],
  "revenueByMonth": [...]
}
```

---

## Webhooks

### Stripe Webhook
```http
POST /api/webhook
Content-Type: application/json
Stripe-Signature: (required)

// Stripe sends webhook events here
```

### Shippo Webhook
```http
POST /api/shippo-webhook
Content-Type: application/json

// Shippo tracking updates
```

---

## CSRF Protection

All state-changing requests (POST, PUT, DELETE, PATCH) require a CSRF token.

### Get CSRF Token
```http
GET /api/csrf-token
```

**Response:**
```json
{
  "csrfToken": "token-value"
}
```

Include the token in requests:
```http
POST /api/endpoint
Content-Type: application/json
x-csrf-token: token-value

{...}
```

---

## Rate Limits

- General API: 100 requests / 15 minutes
- Authentication: 10 requests / 15 minutes
- Contact Form: 3 requests / hour
- Newsletter: 5 requests / hour

---

## Error Responses

### Error Format
```json
{
  "error": "Error message",
  "message": "Additional context"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Development Tips

1. **Authentication Testing:**
   ```bash
   # Login and save cookie
   curl -c cookies.txt -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}'

   # Use cookie in subsequent requests
   curl -b cookies.txt http://localhost:3001/api/admin/products
   ```

2. **CSRF Token Testing:**
   ```bash
   # Get token
   TOKEN=$(curl -s http://localhost:3001/api/csrf-token | jq -r '.csrfToken')

   # Use in request
   curl -X POST http://localhost:3001/api/messages \
     -H "x-csrf-token: $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com",...}'
   ```

3. **Testing with Postman:**
   - Import the API collection
   - Set base URL as environment variable
   - Use cookie auth for authenticated requests
   - Add CSRF token to headers for state-changing requests

---

## WebSocket Support

Currently not implemented. Future consideration for real-time features.

---

## API Versioning

Current version: v1 (implicit, no version in URL)

Future versions will use URL versioning: `/api/v2/...`

---

## Support

For API issues or questions:
- Check `SECURITY_TESTING.md` for testing examples
- Review `DEPLOYMENT.md` for production configuration
- See `SECURITY_IMPROVEMENTS.md` for security features

---

**Last Updated:** January 2025
**Template Version:** 1.0.0
