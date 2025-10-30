# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **flexible service booking and appointment scheduling platform** for any service-based business. Built on top of an e-commerce template, this system provides custom websites with comprehensive booking, payment processing, and scheduling capabilities.

**Use Cases:**
- Professional services (consulting, coaching, legal, accounting)
- Health & wellness (fitness training, therapy, spa services, medical appointments)
- Personal services (hair salons, barbershops, personal styling)
- Creative services (photography, videography, design consultations)
- Education & tutoring (music lessons, language tutoring, test prep)
- Home services (home inspections, appraisals, installations)
- Any appointment-based business requiring scheduling and payments

**Key Features:**
- Service catalog with flexible categorization
- Calendar-based booking with availability management
- Staff/service provider assignment
- Multiple service durations and pricing options
- Recurring appointments support
- Integrated Stripe payment processing
- Automated email notifications and reminders
- Comprehensive admin dashboard
- Customizable branding for white-label deployment

## White-Label & Customization

This platform is designed to be **fully customizable** for any service-based business:

**Branding Customization:**
- Custom colors, fonts, and logos via theme configuration
- Client-specific CSS overrides
- Custom domain and hosting
- Branded email templates

**Business Model Flexibility:**
- Individual appointments (1-on-1 services)
- Group sessions (fitness classes, workshops)
- Multi-location support
- Multiple service providers per location
- Various pricing models (per session, packages, subscriptions)

**Industry Adaptations:**
The same core system can power websites for:
- Healthcare clinics (doctor appointments, therapy sessions)
- Wellness centers (massage, acupuncture, nutrition counseling)
- Beauty salons (hair, nails, spa treatments)
- Fitness studios (personal training, group classes)
- Professional services (legal consultations, financial planning)
- Creative services (photography shoots, design consultations)
- Education (tutoring, music lessons, test prep)

Each deployment can be customized with industry-specific:
- Terminology (staff vs. practitioners vs. stylists vs. trainers)
- Service categories and types
- Booking policies and rules
- Required client information fields
- Custom metadata and forms

## Architecture Transformation

### From E-commerce to Service Booking

This project was derived from an e-commerce template. Here's the conceptual mapping:

| E-commerce Concept | Service Booking Equivalent |
|-------------------|---------------------------|
| Products | Services (appointments, sessions, consultations) |
| Shopping Cart | Service selection (no cart needed - direct booking) |
| Orders | Bookings/Appointments |
| Checkout | Time slot selection + booking confirmation |
| Inventory/Stock | Provider availability and time slots |
| Product Categories | Service types (individual, group, packages) |

### What's Being Kept from Template

✅ **Core Infrastructure:**
- Express.js backend server
- MongoDB database
- React 19 + Vite frontend
- Zustand state management
- Stripe payment processing
- Resend email service
- User authentication system
- Admin dashboard framework
- Security features (Helmet, rate limiting, CSRF)
- Winston logging
- Sentry error tracking
- Testing infrastructure (Vitest + React Testing Library)

✅ **Reusable Components:**
- Header, Footer, Layout components
- Authentication system
- Admin layout and navigation
- Toast notifications
- Form components
- Email templates structure

### What Needs to Be Replaced/Removed

❌ **E-commerce Specific:**
- Product model → Replace with Service model
- Order model → Replace with Booking model
- Shopping cart store → Replace with booking flow
- Product pages → Replace with service pages
- Gallery view → Replace with service catalog
- Shippo shipping integration → Remove (not needed for services)
- Stock management → Replace with availability management

➕ **New Features to Add:**
- Calendar widget for time slot selection
- Service provider/staff model and management
- Availability scheduling system
- Recurring booking logic
- Time zone handling
- Booking status management (pending, confirmed, completed, cancelled, rescheduled)
- Automated email reminders and notifications

## Technology Stack

### Frontend
- **React 19** with **Vite** (development server)
- **React Router v7** for routing
- **Zustand** for state management (booking flow, notifications)
- **CSS Modules** for component styling
- **Vitest + React Testing Library** for testing
- **Date/Time Library**: TBD (consider date-fns, dayjs, or Luxon for time zones)
- **Calendar Component**: TBD (consider react-big-calendar, FullCalendar, or custom)

### Backend
- **Express.js** (Node.js web server)
- **MongoDB Atlas** (cloud database)
- **Stripe** for payment processing
- **Cloudinary** for image storage (service provider photos, service images)
- **Resend** for transactional emails
- **Winston** for structured logging
- **Sentry** for error monitoring

## Data Models

### Service Model
Replaces the Product model.

```javascript
{
  _id: ObjectId,
  name: String,              // "60-Minute Consultation", "Haircut & Style", "Personal Training Session"
  description: String,       // Full service description
  category: String,          // "Individual", "Group", "Package", "Workshop"
  duration: Number,          // Duration in minutes (30, 60, 90, 120, etc.)
  price: Number,             // Price in cents
  image: String,             // Cloudinary URL
  staffIds: [ObjectId],      // Which service providers can provide this service
  isActive: Boolean,
  bufferTime: Number,        // Minutes between bookings (0, 15, 30)
  maxAdvanceBooking: Number, // Days in advance clients can book (30, 60, 90)
  cancellationPolicy: {
    hoursBeforeStart: Number, // Minimum hours before appointment to cancel
    refundPercentage: Number  // 100 = full refund, 50 = 50% refund
  },
  metadata: Object,          // Additional custom fields (e.g., requires_consultation, location_type)
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
Replaces the Order model.

```javascript
{
  _id: ObjectId,
  serviceId: ObjectId,       // Reference to Service
  clientId: ObjectId,        // Reference to User/Client
  staffId: ObjectId,         // Reference to Staff member

  // Scheduling
  startDateTime: Date,       // When the appointment starts
  endDateTime: Date,         // When the appointment ends
  timeZone: String,          // Client's timezone ("America/New_York")
  duration: Number,          // Duration in minutes

  // Status
  status: String,            // "pending", "confirmed", "completed", "cancelled", "no-show", "rescheduled"
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: ObjectId,     // Service provider or Client who cancelled

  // Payment
  paymentStatus: String,     // "pending", "paid", "refunded", "failed"
  paymentIntentId: String,   // Stripe Payment Intent ID
  amount: Number,            // Amount paid in cents
  currency: String,          // "USD"
  refundAmount: Number,      // If partially refunded

  // Client Info (snapshot at booking time)
  clientInfo: {
    name: String,
    email: String,
    phone: String,
    notes: String            // Special requests or notes
  },

  // Recurring
  isRecurring: Boolean,
  recurringBookingId: ObjectId, // Reference to RecurringBooking if applicable

  // Notifications
  remindersSent: [{
    sentAt: Date,
    type: String             // "24h", "1h", "confirmation"
  }],

  // Metadata
  internalNotes: String,     // Service provider notes (not visible to client)
  metadata: Object,

  createdAt: Date,
  updatedAt: Date
}
```

### Staff Model
New model for service providers (coaches, consultants, stylists, trainers, therapists, etc.).

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  bio: String,
  photo: String,             // Cloudinary URL
  title: String,             // "Master Stylist", "Senior Consultant", "Certified Trainer"
  specialties: [String],     // ["Color Specialist", "Sports Massage", "Tax Planning"]
  serviceIds: [ObjectId],    // Services they can provide

  // User account reference (if staff can login)
  userId: ObjectId,

  // Status
  isActive: Boolean,
  acceptingBookings: Boolean,

  // Settings
  timeZone: String,
  defaultBookingBuffer: Number, // Default buffer between appointments

  createdAt: Date,
  updatedAt: Date
}
```

### Availability Model
New model for managing when service providers are available.

```javascript
{
  _id: ObjectId,
  staffId: ObjectId,

  // Regular weekly schedule
  schedule: [{
    dayOfWeek: Number,       // 0 = Sunday, 1 = Monday, etc.
    timeSlots: [{
      startTime: String,     // "09:00"
      endTime: String,       // "17:00"
    }]
  }],

  // Exceptions (time off, special hours)
  exceptions: [{
    date: Date,              // Specific date
    type: String,            // "unavailable", "custom_hours"
    timeSlots: [{            // If custom_hours
      startTime: String,
      endTime: String
    }],
    reason: String           // "Vacation", "Conference"
  }],

  // Overrides (one-time available slots outside regular schedule)
  overrides: [{
    date: Date,
    timeSlots: [{
      startTime: String,
      endTime: String
    }]
  }],

  // Effective date range
  effectiveFrom: Date,
  effectiveTo: Date,         // null = indefinite

  createdAt: Date,
  updatedAt: Date
}
```

### RecurringBooking Model
For managing recurring appointments.

```javascript
{
  _id: ObjectId,
  clientId: ObjectId,
  staffId: ObjectId,
  serviceId: ObjectId,

  // Recurrence pattern
  frequency: String,         // "weekly", "biweekly", "monthly"
  interval: Number,          // Every N weeks/months (usually 1)
  dayOfWeek: Number,         // For weekly (0-6)
  dayOfMonth: Number,        // For monthly (1-31)

  // Time
  startTime: String,         // "14:00"
  duration: Number,          // Minutes
  timeZone: String,

  // Date range
  startDate: Date,           // First occurrence
  endDate: Date,             // Last occurrence (or null for indefinite)
  occurrences: Number,       // Alternative to endDate

  // Generated bookings
  bookingIds: [ObjectId],    // All bookings generated from this pattern

  // Status
  status: String,            // "active", "paused", "cancelled", "completed"

  // Payment
  paymentPlan: String,       // "per_session", "monthly_subscription"

  createdAt: Date,
  updatedAt: Date
}
```

### Client Model
Extends/enhances the existing User model.

```javascript
// Can extend existing User model or create separate Client model
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  timeZone: String,

  // Preferences
  preferredStaffIds: [ObjectId],    // Preferred service providers
  communicationPreferences: {
    emailReminders: Boolean,
    smsReminders: Boolean,    // For future SMS integration
  },

  // History
  totalBookings: Number,
  completedBookings: Number,
  cancelledBookings: Number,
  noShowCount: Number,

  // Notes
  clientNotes: String,       // Service provider notes about client

  // Status
  isActive: Boolean,
  blockedReason: String,     // If client is blocked from booking

  createdAt: Date,
  updatedAt: Date
}
```

## API Architecture

### New Endpoints to Implement

**Services:**
- `GET /api/services` - List all active services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

**Bookings:**
- `GET /api/bookings` - List bookings (filtered by user role)
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking (reschedule)
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/:id/complete` - Mark booking as completed (provider)
- `POST /api/bookings/:id/no-show` - Mark as no-show (provider)

**Availability:**
- `GET /api/availability/staff/:staffId` - Get service provider availability
- `GET /api/availability/slots` - Get available time slots for a service
- `POST /api/availability/staff/:staffId` - Set provider schedule (admin/provider)
- `POST /api/availability/staff/:staffId/exceptions` - Add time off
- `PUT /api/availability/:id` - Update availability settings

**Staff (Service Providers):**
- `GET /api/staff` - List all active service providers
- `GET /api/staff/:id` - Get service provider profile
- `POST /api/staff` - Create service provider (admin)
- `PUT /api/staff/:id` - Update service provider profile (admin/provider)
- `DELETE /api/staff/:id` - Deactivate service provider (admin)

**Recurring Bookings:**
- `POST /api/bookings/recurring` - Create recurring booking pattern
- `GET /api/bookings/recurring/:id` - Get recurring booking details
- `PUT /api/bookings/recurring/:id` - Update pattern
- `DELETE /api/bookings/recurring/:id` - Cancel all future occurrences

**Clients:**
- `GET /api/clients` - List clients (admin)
- `GET /api/clients/:id` - Get client profile
- `PUT /api/clients/:id` - Update client info

### Endpoints to Replace/Remove

**Replace:**
- `/api/products/*` → `/api/services/*`
- `/api/orders/*` → `/api/bookings/*`
- `/api/create-checkout-session` → Adapt for booking payment
- `/api/webhook` → Update webhook handler for booking completion

**Remove:**
- Shippo shipping endpoints
- Stock management endpoints

## Scheduling System Architecture

### Calendar Widget Requirements

**Frontend Calendar Component:**
- Display monthly/weekly view
- Show available time slots for selected service
- Filter by service provider (optional)
- Handle timezone conversion
- Real-time availability checking
- Visual indicators for:
  - Available slots (clickable)
  - Unavailable slots (grayed out)
  - Already booked slots
  - Current user's bookings

**Availability Calculation Logic:**
1. Get service provider's regular schedule for requested date
2. Check for exceptions (time off, special hours)
3. Get existing bookings for that service provider
4. Calculate service duration + buffer time
5. Generate available time slots (e.g., 9:00 AM, 9:30 AM, 10:00 AM)
6. Filter out slots that conflict with existing bookings
7. Filter out slots outside business hours
8. Return available slots to frontend

### Booking Flow

**User Journey:**
1. Browse services → Select service
2. View available time slots on calendar
3. (Optional) Select preferred service provider
4. Select date and time
5. Enter client information (name, email, phone, notes)
6. Review booking details
7. Payment via Stripe
8. Receive confirmation email
9. Add to calendar (iCal link)

**System Processing:**
1. Validate selected time slot is still available (race condition check)
2. Create Stripe payment intent
3. Reserve time slot (temporary lock for 10 minutes)
4. Process payment
5. Create booking in database (via webhook)
6. Send confirmation email to client and service provider
7. Schedule reminder emails (24h before, 1h before)
8. Update provider's calendar

### Recurring Booking Logic

**Creating Recurring Bookings:**
1. Client selects service and recurrence pattern
2. System calculates all occurrence dates
3. Check availability for ALL occurrences
4. If all slots available → create RecurringBooking pattern
5. Generate individual Booking documents for each occurrence
6. Process payment (single payment or subscription)
7. Send confirmation with all scheduled dates

**Managing Recurring Bookings:**
- Cancelling one occurrence → just that booking
- Cancelling all future → update RecurringBooking status
- Rescheduling one → modify that specific booking
- Service provider unavailability conflict → notify client, offer reschedule

### Time Zone Handling

**Strategy:**
- Store all times in UTC in database
- Store user's timezone preference
- Convert display times based on user timezone
- Show timezone in booking confirmations
- Handle daylight saving time transitions
- Display "Your local time" vs "Provider local time" if different

## Development Commands

### Running the Application (Requires 3 Processes)

**Terminal 1 - Backend Server:**
```bash
node server.js          # Starts Express server on port 3001
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev            # Starts Vite dev server on port 5173
```

**Terminal 3 - Stripe Webhooks (CRITICAL for bookings):**
```bash
stripe listen --forward-to localhost:3001/api/webhook
# Copy the webhook secret (whsec_...) to .env as STRIPE_WEBHOOK_SECRET
```

### Testing Commands

```bash
npm test                # Run tests in watch mode
npm run test:run        # Run all tests once (CI mode)
npm run test:ui         # Open Vitest UI
npm run test:coverage   # Generate coverage report
```

### Other Commands

```bash
npm run build          # Build for production
npm run lint           # Run ESLint
npm run preview        # Preview production build
```

## Implementation Roadmap

### Phase 1: Data Models & API Foundation
**Priority: HIGH - Foundation for everything else**

1. Create new database models:
   - [ ] Service model (replace Product)
   - [ ] Booking model (replace Order)
   - [ ] Staff model (new - represents any service provider)
   - [ ] Availability model (new)
   - [ ] RecurringBooking model (new)
   - [ ] Extend User model for Client features

2. Create API endpoints:
   - [ ] Services CRUD
   - [ ] Staff/Service Providers CRUD
   - [ ] Availability management
   - [ ] Booking creation and management
   - [ ] Available slots calculation endpoint

3. Update authentication:
   - [ ] Add service provider role to auth system
   - [ ] Provider-specific permissions
   - [ ] Client portal access

**Tests:** Write comprehensive tests for all models and API endpoints

**Note:** Throughout the codebase, "Staff" refers to any type of service provider (stylists, coaches, therapists, trainers, consultants, etc.). This generic term allows the same system to work for any service-based business.

### Phase 2: Basic Booking Flow
**Priority: HIGH - Core functionality**

1. Frontend service catalog:
   - [ ] Replace product gallery with service catalog
   - [ ] Service detail page
   - [ ] Service categories/filtering

2. Basic booking flow:
   - [ ] Date selection UI
   - [ ] Time slot selection
   - [ ] Client information form
   - [ ] Booking confirmation page
   - [ ] Payment integration (adapt existing Stripe)

3. Availability calculation:
   - [ ] Algorithm to calculate available slots
   - [ ] Real-time availability checking
   - [ ] Prevent double-booking

4. Email notifications:
   - [ ] Booking confirmation email (client)
   - [ ] Booking notification email (service provider)
   - [ ] Cancellation email template
   - [ ] Rescheduling email template

**Tests:** Test booking flow end-to-end, availability logic, payment integration

### Phase 3: Calendar Widget
**Priority: HIGH - Key differentiator**

1. Choose and integrate calendar library:
   - [ ] Evaluate options (react-big-calendar, FullCalendar, custom)
   - [ ] Install and configure

2. Calendar features:
   - [ ] Monthly/weekly view
   - [ ] Display available slots
   - [ ] Click to select time
   - [ ] Show existing bookings (if logged in)
   - [ ] Filter by service provider

3. Time zone support:
   - [ ] Detect user timezone
   - [ ] Display times in user timezone
   - [ ] Handle DST transitions
   - [ ] Timezone selector

**Tests:** Test calendar rendering, time zone conversions, slot selection

### Phase 4: Service Provider Management
**Priority: MEDIUM - Admin features**

1. Service provider admin pages:
   - [ ] List all service providers
   - [ ] Add/edit/delete service providers
   - [ ] Service provider profile pages (public facing)
   - [ ] Profile photo upload

2. Availability management:
   - [ ] Set regular weekly schedule UI
   - [ ] Add exceptions (time off)
   - [ ] Calendar view of provider availability
   - [ ] Bulk schedule updates

3. Service provider portal (optional):
   - [ ] Provider login
   - [ ] View their bookings
   - [ ] Manage their availability
   - [ ] Client notes

**Tests:** Test service provider CRUD, availability management, provider portal

### Phase 5: Advanced Booking Features
**Priority: MEDIUM - Enhanced functionality**

1. Recurring bookings:
   - [ ] Recurring booking UI
   - [ ] Pattern selection (weekly, biweekly, monthly)
   - [ ] Generate occurrences
   - [ ] Manage recurring series

2. Booking management:
   - [ ] Reschedule functionality
   - [ ] Cancellation with refund logic
   - [ ] No-show tracking
   - [ ] Booking history for clients

3. Email reminders:
   - [ ] Automated reminder system (node-cron)
   - [ ] 24 hours before reminder
   - [ ] 1 hour before reminder
   - [ ] Reminder preferences

4. Calendar export:
   - [ ] Generate iCal files
   - [ ] Add to Google Calendar link
   - [ ] Add to Outlook link

**Tests:** Test recurring logic, rescheduling, reminders, calendar export

### Phase 6: Admin Dashboard
**Priority: MEDIUM - Business management**

1. Dashboard overview:
   - [ ] Today's bookings
   - [ ] Upcoming bookings
   - [ ] Revenue metrics
   - [ ] Popular services
   - [ ] Service provider utilization

2. Booking management:
   - [ ] View all bookings
   - [ ] Filter/search bookings
   - [ ] Booking details modal
   - [ ] Reschedule/cancel from admin
   - [ ] Refund processing

3. Reports:
   - [ ] Booking reports by date range
   - [ ] Revenue reports
   - [ ] Service provider performance
   - [ ] Client booking history
   - [ ] Export to CSV

**Tests:** Test admin pages, filtering, reports, exports

### Phase 7: Polish & Optimization
**Priority: LOW - Nice to have**

1. UI/UX improvements:
   - [ ] Loading states
   - [ ] Error handling
   - [ ] Optimistic UI updates
   - [ ] Mobile responsiveness
   - [ ] Accessibility audit

2. Performance:
   - [ ] Database indexing
   - [ ] API response caching
   - [ ] Calendar data prefetching
   - [ ] Image optimization

3. Additional features:
   - [ ] SMS reminders (Twilio integration)
   - [ ] Video call links (Zoom/Google Meet integration) for virtual appointments
   - [ ] Client self-service reschedule
   - [ ] Waitlist for fully booked times
   - [ ] Package deals and membership options
   - [ ] Multi-location support for businesses with multiple offices/studios
   - [ ] Resource management (rooms, equipment) alongside provider scheduling
   - [ ] Client intake forms and pre-appointment questionnaires
   - [ ] Post-appointment feedback and ratings

**Tests:** Performance testing, accessibility testing, cross-browser testing

## Environment Variables

Required in `.env` file:

```bash
# Database
MONGODB_URI=mongodb+srv://...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# JWT
JWT_SECRET=your_secret_here

# App
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Optional: Sentry
SENTRY_DSN=...

# Optional: Google Calendar API (for future integration)
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...

# Optional: Zoom API (for video call integration)
# ZOOM_CLIENT_ID=...
# ZOOM_CLIENT_SECRET=...
```

## Development Workflow

**⚠️ CRITICAL: Read `.claude/CLAUDE.md` for detailed development workflow**

That file contains the original template's development guidelines, which still apply:
- Testing requirements (TDD approach)
- Git commit message format
- Code quality standards
- Before making changes checklist

**Additional guidelines for this service booking app:**
- Always consider timezone implications when working with dates/times
- Test availability logic thoroughly (edge cases, race conditions)
- Validate booking slots are still available before confirming
- Consider service provider schedule changes and how they affect existing bookings
- Handle cancellations and refunds according to cancellation policy
- Write integration tests for complete booking flows
- Keep the system flexible for various service types and business models

## Key Technical Decisions

### Date/Time Library
**Decision needed:** Choose between:
- **date-fns** - Lightweight, functional, tree-shakeable
- **dayjs** - Moment.js alternative, small bundle size
- **Luxon** - Better timezone support, built on Intl API

**Recommendation:** Luxon for comprehensive timezone support

### Calendar Component
**Decision needed:** Choose between:
- **react-big-calendar** - Popular, flexible, good for scheduling apps
- **FullCalendar** - Feature-rich, commercial license for some features
- **Custom solution** - Maximum control, more development time

**Recommendation:** react-big-calendar for balance of features and flexibility

### Real-time Updates
**Decision needed:** How to handle concurrent booking attempts:
- **Optimistic locking** - Check version/timestamp on update
- **Pessimistic locking** - Reserve slot temporarily during booking flow
- **Websockets** - Real-time availability updates

**Recommendation:** Pessimistic locking with 10-minute reservation window

### Recurring Booking Storage
**Decision needed:** How to store recurring bookings:
- **Option A:** Store pattern + generate bookings on-demand
- **Option B:** Pre-generate all booking instances
- **Option C:** Hybrid - generate X months ahead, create more as needed

**Recommendation:** Option B (pre-generate) for simpler querying and management

## Migration from E-commerce Template

### Files to Remove
- `db/models/Product.js`
- `db/models/Order.js` (replace with Booking.js)
- Product-related pages (Gallery.jsx, ProductDetail.jsx)
- Shopping cart store (cartStore.js)
- Shippo integration files

### Files to Keep & Adapt
- `server.js` - Keep, update routes
- `db/connection.js` - Keep as-is
- `db/models/User.js` - Keep, extend for Client features
- `db/models/Session.js` - Keep for auth
- `db/models/Newsletter.js` - Keep (still useful)
- `db/models/Subscriber.js` - Keep
- Authentication system - Keep
- Admin layout - Keep, update navigation
- Email templates - Keep, create new templates

### Files to Create
- `db/models/Service.js`
- `db/models/Booking.js`
- `db/models/Staff.js` (represents any service provider)
- `db/models/Availability.js`
- `db/models/RecurringBooking.js`
- `src/components/Calendar/`
- `src/components/BookingFlow/`
- `src/pages/Services.jsx`
- `src/pages/BookService.jsx`
- `src/pages/MyBookings.jsx`
- `src/stores/bookingStore.js`
- API routes for services, bookings, service providers, availability

## Documentation

Original template documentation in `/docs` - some still relevant:
- **GETTING_STARTED.md** - Update for service booking context
- **API_DOCUMENTATION.md** - Replace with new API docs
- **DEPLOYMENT.md** - Keep, mostly still applicable
- **STRIPE_SETUP.md** - Keep, still relevant
- **EMAIL_SETUP.md** - Keep, still relevant
- **DOCKER.md** - Keep if using Docker
- **SECURITY_TESTING.md** - Keep

**New documentation needed:**
- Scheduling system architecture
- Timezone handling guide
- Availability calculation logic
- Booking flow diagrams
- Recurring booking patterns

## Quick Links

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Admin Dashboard:** http://localhost:5173/admin

## Next Steps

1. **Review this architecture document**
2. **Make technical decisions** (date library, calendar component)
3. **Start with Phase 1** (Data models and API foundation)
4. **Follow TDD approach** from `.claude/CLAUDE.md`
5. **Iterate through implementation roadmap**

## Support

- **Original Template:** https://github.com/tmj62113/service-template
- **Development Workflow:** `.claude/CLAUDE.md`
- **This Architecture:** This file (CLAUDE.md)
