# Cloud Agent Task Specifications

This document contains detailed specifications for tasks to be executed by cloud agents in parallel.

## Task 5: Frontend Service Catalog

### Objective
Create a user-facing service catalog page that displays all available services, allows filtering by category, and links to detailed service views.

### Requirements

**Pages to Create:**
1. `src/pages/Services.jsx` - Main service listing page
2. `src/pages/ServiceDetail.jsx` - Individual service detail page/modal

**Features:**
- Display grid/list of all active services
- Filter by service category
- Search by service name/description
- Service cards showing:
  - Service name
  - Duration
  - Price (formatted as currency)
  - Image (if available)
  - Brief description
  - "Book Now" button
- Service detail view showing:
  - Full description
  - Duration and price
  - Available staff members who provide this service
  - Service category
  - Booking policies (cancellation, advance booking limits)
  - "Book This Service" CTA button

**API Endpoints to Use:**
- `GET /api/services` - Fetch all services
- `GET /api/services/:id` - Fetch single service details
- `GET /api/staff` - Fetch staff members (for service detail page)

**Design Requirements:**
- Use existing design system from `src/styles/design-system.css`
- Responsive layout (desktop, tablet, mobile)
- Use `.card` utility classes for service cards
- Use `.btn--primary` for booking CTAs
- Follow existing page layouts (see `src/pages/Home.jsx` for reference)

**State Management:**
- Use React hooks (useState, useEffect)
- No Zustand store needed for basic implementation
- Handle loading states
- Handle empty states (no services available)
- Handle error states (API failures)

**Routing:**
- Add routes to `src/App.jsx`:
  - `/services` → Services page
  - `/services/:id` → ServiceDetail page
- Add "Services" link to header navigation

**Testing Requirements:**
- Create `src/pages/Services.test.jsx`
- Test service list rendering
- Test filtering by category
- Test search functionality
- Test loading states
- Test empty states
- Test navigation to service detail
- Minimum 8 tests

**Acceptance Criteria:**
- [ ] Services page displays all services in grid layout
- [ ] Filtering by category works
- [ ] Search filters services by name/description
- [ ] Clicking service card navigates to detail page
- [ ] Detail page shows full service information
- [ ] "Book Now" button navigates to booking flow (link only, booking flow in Task 6)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Loading, empty, and error states handled
- [ ] All tests passing
- [ ] Code follows existing patterns in codebase

**Files to Create:**
```
src/pages/Services.jsx
src/pages/Services.test.jsx
src/pages/ServiceDetail.jsx
src/pages/ServiceDetail.test.jsx
src/styles/Services.css (if needed beyond design system)
```

**Dependencies:**
- Existing API: `/api/services` (already implemented)
- Design system: `src/styles/design-system.css`
- API config: `src/config/api.js` (use `API_ENDPOINTS.SERVICES`)

---

## Task 6: Frontend Booking Flow (Part 1 - UI Skeleton)

### Objective
Create the multi-step booking flow UI structure and basic state management for booking appointments. This is Part 1 (UI skeleton); Part 2 will add calendar/time slot integration.

### Requirements

**Component to Create:**
`src/components/BookingFlow/BookingFlow.jsx` - Multi-step wizard component

**Steps in Booking Flow:**
1. **Select Service** - Choose which service to book
2. **Select Staff** (optional) - Pick preferred provider or "No Preference"
3. **Select Date & Time** - Calendar and time slot picker (placeholder UI for Part 1)
4. **Enter Information** - Client contact details and notes
5. **Review & Confirm** - Summary of booking before submission

**State Management:**
- Create `src/stores/bookingStore.js` using Zustand
- Store booking flow state:
  ```javascript
  {
    currentStep: 1,
    selectedService: null,
    selectedStaff: null,
    selectedDate: null,
    selectedTime: null,
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      notes: ''
    },
    isSubmitting: false,
    error: null
  }
  ```
- Actions: `setService`, `setStaff`, `setDateTime`, `setClientInfo`, `nextStep`, `previousStep`, `resetBooking`, `submitBooking`

**UI Components:**
1. `BookingFlow.jsx` - Main container with step indicator
2. `StepService.jsx` - Service selection step
3. `StepStaff.jsx` - Staff selection step
4. `StepDateTime.jsx` - Date/time picker step (placeholder UI for Part 1)
5. `StepClientInfo.jsx` - Client information form
6. `StepReview.jsx` - Review and confirm step

**Step Navigation:**
- Progress indicator showing current step (1 of 5, 2 of 5, etc.)
- "Back" and "Next" buttons
- Disable "Next" if current step invalid
- "Book Appointment" button on final step

**Form Validation:**
- Service required
- Date/time required
- Client name required
- Client email required (with email format validation)
- Client phone required

**API Endpoints (for future integration):**
- `GET /api/services` - Fetch services
- `GET /api/staff` - Fetch staff members
- `GET /api/availability/slots` - Get available time slots (Part 2)
- `POST /api/bookings` - Create booking (Part 2)

**For Part 1 (This Task):**
- Step 1-2: Fully functional (service/staff selection)
- Step 3: Placeholder UI with mock date picker (show calendar icon, "Select Date & Time" button)
- Step 4: Fully functional form
- Step 5: Display selected data
- Submit button: Show alert "Booking flow will integrate with API in Part 2"

**Design Requirements:**
- Use `.card` for step containers
- Use form utilities from design system
- Progress indicator at top
- Mobile-friendly navigation
- Clear visual hierarchy

**Routing:**
- Add route: `/book` → BookingFlow page
- Optional: `/book/:serviceId` → Pre-select service

**Testing Requirements:**
- Create `src/stores/bookingStore.test.js`
- Create `src/components/BookingFlow/BookingFlow.test.jsx`
- Test step navigation (next/back)
- Test service selection
- Test staff selection
- Test form validation
- Test store state updates
- Minimum 12 tests

**Acceptance Criteria:**
- [ ] Multi-step wizard UI displays correctly
- [ ] Progress indicator shows current step
- [ ] Step 1: Can select service from list
- [ ] Step 2: Can select staff or skip
- [ ] Step 3: Placeholder date/time UI shown
- [ ] Step 4: Client info form validates input
- [ ] Step 5: Review shows all selected data
- [ ] Back/Next navigation works correctly
- [ ] Cannot proceed past step without valid data
- [ ] Booking store manages state correctly
- [ ] Mobile responsive design
- [ ] All tests passing

**Files to Create:**
```
src/components/BookingFlow/BookingFlow.jsx
src/components/BookingFlow/StepService.jsx
src/components/BookingFlow/StepStaff.jsx
src/components/BookingFlow/StepDateTime.jsx
src/components/BookingFlow/StepClientInfo.jsx
src/components/BookingFlow/StepReview.jsx
src/components/BookingFlow/BookingFlow.test.jsx
src/stores/bookingStore.js
src/stores/bookingStore.test.js
src/styles/BookingFlow.css (if needed)
```

**Dependencies:**
- Zustand (already installed)
- React Router (already installed)
- Existing API endpoints for services and staff
- Design system CSS

**Notes:**
- Part 2 (separate task) will add:
  - Calendar widget integration
  - Real-time availability checking
  - Actual API submission
  - Payment integration

---

## Task 7: Staff Management Frontend

### Objective
Create admin pages for managing service providers (staff members), including listing, creating, editing, and viewing staff profiles.

### Requirements

**Pages to Create:**
1. `src/pages/AdminStaff.jsx` - Staff listing page (admin only)
2. `src/pages/StaffDetail.jsx` - Staff detail/edit page (admin only)
3. `src/pages/StaffProfile.jsx` - Public staff profile view

**Features - Admin Staff List:**
- Display table of all staff members
- Columns: Photo, Name, Title, Specialties, Services, Status, Actions
- Filter by active/inactive status
- Search by name or specialty
- "Add New Staff" button
- Actions: View, Edit, Deactivate/Activate
- Show total count

**Features - Staff Detail/Edit:**
- Form fields:
  - Name (required)
  - Email (required)
  - Phone
  - Title/Position (e.g., "Senior Consultant")
  - Bio/Description
  - Photo upload (Cloudinary integration)
  - Specialties (multi-select tags)
  - Services (multi-select from available services)
  - Active status toggle
  - Default booking buffer time
  - Time zone
- Save/Cancel buttons
- Delete button (with confirmation)
- "View Public Profile" link

**Features - Public Profile:**
- Display staff photo
- Name and title
- Bio
- Specialties
- Services they provide
- "Book with [Name]" button
- No edit capabilities

**API Endpoints to Use:**
- `GET /api/staff` - List all staff
- `GET /api/staff/:id` - Get staff details
- `POST /api/staff` - Create new staff (admin)
- `PUT /api/staff/:id` - Update staff (admin)
- `DELETE /api/staff/:id` - Deactivate staff (admin)
- `GET /api/services` - For service assignment dropdown

**Image Upload:**
- Use existing Cloudinary integration
- Reference `src/pages/AdminProducts.jsx` for image upload pattern
- Upload endpoint: `POST /api/admin/upload`
- Show image preview after upload
- Default placeholder if no photo

**Authorization:**
- Admin staff pages require admin role
- Use existing `authenticateToken` middleware
- Redirect non-admins to home page
- Public profile page is accessible to all

**Design Requirements:**
- Follow existing admin page patterns (see `AdminServices.jsx`)
- Use admin layout wrapper
- Use form components from design system
- Table styling consistent with other admin tables
- Responsive forms

**Routing:**
- Add routes to `src/App.jsx`:
  - `/admin/staff` → AdminStaff (admin only)
  - `/admin/staff/:id` → StaffDetail (admin only)
  - `/staff/:id` → StaffProfile (public)
- Add "Staff" link to admin navigation sidebar

**Testing Requirements:**
- Create `src/pages/AdminStaff.test.jsx`
- Create `src/pages/StaffDetail.test.jsx`
- Test staff list rendering
- Test filtering and search
- Test create/edit form
- Test form validation
- Test image upload
- Test authorization (admin only)
- Minimum 10 tests

**Acceptance Criteria:**
- [ ] Admin staff list displays all staff members
- [ ] Filtering by status works
- [ ] Search filters by name/specialty
- [ ] Create new staff form works
- [ ] Edit staff form pre-fills data
- [ ] Photo upload works (Cloudinary)
- [ ] Service assignment multi-select works
- [ ] Specialty tags can be added/removed
- [ ] Save creates/updates staff via API
- [ ] Delete deactivates staff (soft delete)
- [ ] Public profile displays correctly
- [ ] Authorization enforced (admin only for admin pages)
- [ ] All tests passing
- [ ] Mobile responsive

**Files to Create:**
```
src/pages/AdminStaff.jsx
src/pages/AdminStaff.test.jsx
src/pages/StaffDetail.jsx
src/pages/StaffDetail.test.jsx
src/pages/StaffProfile.jsx
src/pages/StaffProfile.test.jsx
src/styles/AdminStaff.css (if needed)
```

**Dependencies:**
- Existing API: `/api/staff/*` (already implemented)
- Existing Cloudinary upload: `/api/admin/upload`
- Admin layout: `src/components/AdminLayout.jsx`
- Auth middleware: Already implemented

---

## Task 8: Email Reminder System

### Objective
Implement automated email reminder system using cron jobs to send booking reminders 24 hours and 1 hour before appointments.

### Requirements

**Cron Job Setup:**
- Create `src/jobs/bookingReminders.js`
- Use `node-cron` (already installed)
- Two scheduled jobs:
  1. Every hour: Check for bookings 24 hours away
  2. Every 15 minutes: Check for bookings 1 hour away

**Reminder Logic:**
- Query bookings from database
- Filter criteria:
  - Status: "confirmed" (not cancelled, completed, or no-show)
  - Start time in future
  - Reminder not already sent for this time window
- Send email via Resend
- Update booking record with reminder sent timestamp
- Handle timezone conversions correctly

**Email Templates:**
- Create `utils/emailTemplates.js` exports:
  - `generateBookingReminder24h(booking, client, service, staff)` - 24-hour reminder
  - `generateBookingReminder1h(booking, client, service, staff)` - 1-hour reminder

**Email Content (24-hour):**
```
Subject: Reminder: Your appointment tomorrow at [TIME]

Hi [CLIENT NAME],

This is a friendly reminder about your upcoming appointment:

Service: [SERVICE NAME]
Date & Time: [FORMATTED DATE/TIME]
Duration: [DURATION] minutes
With: [STAFF NAME]

Location/Details: [if applicable]

Need to reschedule or cancel? [LINK TO MANAGE BOOKING]

See you soon!

[BUSINESS NAME]
```

**Email Content (1-hour):**
```
Subject: Your appointment is in 1 hour

Hi [CLIENT NAME],

Your appointment is coming up soon:

Service: [SERVICE NAME]
Time: [FORMATTED TIME] (in about 1 hour)
With: [STAFF NAME]

We look forward to seeing you!

[BUSINESS NAME]
```

**Booking Model Updates:**
- Update `db/models/Booking.js` schema to track reminders:
  ```javascript
  remindersSent: [{
    type: String, // "24h" or "1h"
    sentAt: Date
  }]
  ```
- Add method: `Booking.findUpcomingForReminders(timeWindow)`
- Add method: `Booking.markReminderSent(bookingId, reminderType)`

**Integration with server.js:**
- Import and start cron jobs in `server.js`
- Only run cron jobs in production/development (not in tests)
- Add condition: `if (process.env.NODE_ENV !== 'test')`

**Error Handling:**
- Catch and log email send failures
- Don't retry immediately (will retry on next cron run)
- Don't mark reminder as sent if email fails
- Log all reminder activity with Winston logger

**Testing Requirements:**
- Create `src/jobs/bookingReminders.test.js`
- Mock `node-cron` scheduler
- Mock Resend email sending
- Mock database queries
- Test reminder filtering logic
- Test email template generation
- Test reminder marking
- Test timezone handling
- Minimum 8 tests

**Acceptance Criteria:**
- [ ] Cron jobs scheduled correctly
- [ ] 24-hour reminder cron runs hourly
- [ ] 1-hour reminder cron runs every 15 minutes
- [ ] Bookings queried with correct time filters
- [ ] Timezone conversions handled correctly
- [ ] Emails sent via Resend
- [ ] Email templates render correctly with booking data
- [ ] Booking model tracks sent reminders
- [ ] Reminders not sent duplicate
- [ ] Email failures logged but don't crash server
- [ ] Cron jobs don't run in test environment
- [ ] All tests passing

**Files to Create:**
```
src/jobs/bookingReminders.js
src/jobs/bookingReminders.test.js
```

**Files to Modify:**
```
server.js (add cron job startup)
db/models/Booking.js (add remindersSent field and methods)
utils/emailTemplates.js (add reminder templates)
```

**Dependencies:**
- `node-cron` (already installed)
- `resend` (already installed)
- Existing Booking model
- Existing Winston logger

**Environment Variables Required:**
- `RESEND_API_KEY` (already configured)
- Optional: `REMINDER_FROM_EMAIL` (default to business email)

**Notes:**
- Consider rate limits: Resend allows 100 emails/hour on free tier
- Batch reminder sending if many bookings
- Add admin setting to enable/disable reminders (future enhancement)

---

## General Guidelines for All Tasks

### Code Quality Standards
1. Follow existing code patterns in the codebase
2. Use ES6+ JavaScript (async/await, destructuring, etc.)
3. Proper error handling with try/catch
4. Meaningful variable and function names
5. Add JSDoc comments for complex functions
6. No console.log statements (use logger for backend)

### Testing Standards
1. Use Vitest + React Testing Library
2. Test file naming: `ComponentName.test.jsx`
3. Mock external dependencies (APIs, databases)
4. Test happy path + edge cases + error states
5. Minimum 80% code coverage for new code
6. All tests must pass before submitting

### Git Commit Standards
1. Follow conventional commit format
2. Include "Tests Added:" section in commit message
3. Reference issue/task number if applicable
4. Add co-author footer:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

### Design Standards
1. Use design system from `src/styles/design-system.css`
2. Only add custom CSS if design system insufficient
3. Mobile-first responsive design
4. Accessible (WCAG 2.1 AA compliance)
5. Consistent with existing pages

### Before Submitting
- [ ] All tests passing (`npm run test:run`)
- [ ] No linting errors (`npm run lint` if available)
- [ ] Code formatted consistently
- [ ] No commented-out code
- [ ] No unused imports
- [ ] Documentation updated if needed
- [ ] Git commit message follows standards

---

## Task Prioritization

**Recommended execution order:**
1. Task 8 (Email Reminders) - Backend, no UI dependencies
2. Task 5 (Service Catalog) - Frontend foundation
3. Task 6 (Booking Flow Part 1) - Depends on Task 5
4. Task 7 (Staff Management) - Independent, can run parallel

**Estimated Complexity:**
- Task 5: Medium (2-3 hours)
- Task 6: High (4-5 hours)
- Task 7: High (4-5 hours)
- Task 8: Medium (2-3 hours)

**Dependencies:**
- Task 6 can reference Task 5 (service selection in booking flow)
- All tasks are otherwise independent

---

## Questions or Issues?

If you encounter:
- **Missing API endpoints**: Check if endpoint exists, may need to create it
- **Unclear requirements**: Make reasonable assumptions, document in code comments
- **Design ambiguity**: Follow existing patterns (Home.jsx, AdminServices.jsx)
- **Test failures**: Debug thoroughly, ensure mocks are correct
- **Merge conflicts**: Rebase on latest main branch

**Contact:** Document any blockers or questions in the task submission.
