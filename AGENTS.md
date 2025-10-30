# Agent Instructions for Service Template

This document provides guidance for AI agents (like ChatGPT Codex) working with this codebase.

## Project Overview

A white-label service booking and appointment scheduling platform built with:
- **Backend:** Node.js + Express + MongoDB
- **Frontend:** React 19 + Vite
- **State Management:** Zustand
- **Testing:** Vitest + React Testing Library
- **Payment:** Stripe
- **Email:** Resend
- **Images:** Cloudinary

## Architecture

This is a **full-stack monorepo** with:
- Express backend serving API endpoints (port 3001)
- React frontend built with Vite (served as static files from `/dist`)
- MongoDB database for data persistence

## Build Commands

### Install Dependencies
```bash
npm ci
```

### Build Frontend (Required for Production)
```bash
npm run build
```
This compiles the React application into static files in the `dist/` directory.

### Production Build (Full)
```bash
npm ci --only=production
npm run build
```

## Test Commands

### Run All Tests (CI Mode)
```bash
npm run test:run
```

### Run Tests in Watch Mode (Development)
```bash
npm test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Start Commands

### Production Server
```bash
node server.js
```
- Starts Express server on port 3001
- Serves API endpoints at `/api/*`
- Serves built React app from `/dist` for all other routes
- Requires frontend to be built first (`npm run build`)

### Development Mode (Local Development Only)

**Requires THREE processes running simultaneously:**

1. **Backend Server** (Terminal 1):
   ```bash
   node server.js
   ```

2. **Frontend Dev Server** (Terminal 2):
   ```bash
   npm run dev
   ```

3. **Stripe Webhooks** (Terminal 3):
   ```bash
   stripe listen --forward-to localhost:3001/api/webhook
   ```

**Note:** Development mode is NOT suitable for cloud deployment. Use production mode.

## Lint Commands

```bash
npm run lint
```

## Environment Variables

### Required for Server to Start:
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `NODE_ENV` - Set to `production` for cloud deployment
- `PORT` - Server port (default: 3001)

### Required for Full Functionality:
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `RESEND_API_KEY` - Resend email API key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary account name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `CLIENT_URL` - Frontend URL (for CORS)

## Database Setup

**MongoDB Atlas IP Whitelist:**
- Ensure cloud environment IPs are whitelisted in MongoDB Atlas Network Access
- For testing: Whitelist `0.0.0.0/0` (all IPs)
- For production: Restrict to specific IP ranges

## Deployment Workflow

For cloud deployment (like Codex Cloud):

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Build frontend:**
   ```bash
   npm run build
   ```

3. **Run tests (optional but recommended):**
   ```bash
   npm run test:run
   ```

4. **Start server:**
   ```bash
   node server.js
   ```

5. **Health Check:**
   - Endpoint: `GET /api/health`
   - Should return `200 OK` with status message

## Important Notes for Agents

### When Making Code Changes:

1. **ALWAYS run tests before and after changes:**
   ```bash
   npm run test:run
   ```

2. **Follow TDD approach** as outlined in `.claude/CLAUDE.md`

3. **Search for existing code** before creating duplicates:
   ```bash
   # Search for similar components
   grep -r "ComponentName" src/

   # Search for similar functions
   grep -r "functionName" src/
   ```

4. **Check for breaking changes:**
   - Search for all files importing the code you're modifying
   - Update tests for modified code
   - Verify dependent features still work

5. **Never commit with failing tests**

### Project Structure:

```
├── server.js              # Express backend entry point
├── db/                    # Database models and connection
│   ├── models/           # MongoDB models
│   └── connection.js     # MongoDB connection
├── src/                   # React frontend source
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── stores/           # Zustand stores
│   └── styles/           # CSS files
├── utils/                 # Backend utilities
├── middleware/            # Express middleware
├── dist/                  # Built frontend (generated)
└── tests/                 # Test files

```

### Data Models:

**Service Booking Models (New):**
- `Service` - Bookable services (replaces Product)
- `Booking` - Appointments (replaces Order)
- `Staff` - Service providers
- `Availability` - Provider schedules
- `RecurringBooking` - Recurring appointments

**Legacy Models (Being Phased Out):**
- `Product` - E-commerce products (being replaced)
- `Order` - E-commerce orders (being replaced)

**Shared Models:**
- `User` - Authentication and clients
- `Newsletter` - Email newsletters
- `Subscriber` - Newsletter subscribers
- `AuditLog` - Security audit logs
- `BlockedIP` - IP blocking

### Code Quality Standards:

- Use existing utility classes from `design-system.css`
- Use CSS variables for styling (no hardcoded values)
- Follow React 19 best practices
- Write tests for all new features
- Use Zustand for state management
- Validate all user inputs

### Security Considerations:

- All API endpoints use Helmet for security headers
- CSRF protection enabled
- Rate limiting on sensitive endpoints
- Input validation with Zod schemas
- Never log sensitive data (passwords, tokens, API keys)

## Common Issues

### MongoDB Connection Fails
- Check `MONGODB_URI` environment variable
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Frontend Not Loading
- Run `npm run build` to generate `/dist` folder
- Check server logs for errors
- Verify `dist/` directory exists

### Tests Failing
- Ensure all dependencies installed: `npm ci`
- Check for conflicting ports
- Review test output for specific errors

### Stripe Webhooks Not Working
- In production: Configure webhook endpoint in Stripe dashboard
- In development: Run `stripe listen --forward-to localhost:3001/api/webhook`
- Set `STRIPE_WEBHOOK_SECRET` environment variable

## Documentation References

- **Project Instructions:** `.claude/CLAUDE.md` - Development workflow and standards
- **Architecture:** `CLAUDE.md` - Full architecture and implementation roadmap
- **API Documentation:** `docs/API_DOCUMENTATION.md`
- **Deployment:** `docs/DEPLOYMENT.md`
- **Security:** `docs/SECURITY_TESTING.md`

## Support

For issues or questions about this codebase:
1. Check documentation in `/docs` directory
2. Review `.claude/CLAUDE.md` for development guidelines
3. Review `CLAUDE.md` for architecture details
