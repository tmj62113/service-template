# Cloud Agent Test Case Specifications

Comprehensive test cases for validating cloud agent task implementations.

---

## Task 5: Frontend Service Catalog - Test Cases

### Services.test.jsx - Service Listing Page

#### 1. Initial Load & Rendering
```javascript
describe('Services Page - Initial Load', () => {
  it('displays loading state while fetching services', () => {
    // Mock API to delay response
    // Assert: Loading spinner/message visible
  });

  it('fetches and displays services from API', async () => {
    // Mock: GET /api/services returns 5 services
    // Assert: All 5 service cards rendered
    // Assert: Each card shows name, price, duration, description
  });

  it('displays error message when API fetch fails', async () => {
    // Mock: GET /api/services returns 500 error
    // Assert: Error message displayed
    // Assert: Retry button or helpful error text visible
  });

  it('displays empty state when no services exist', async () => {
    // Mock: GET /api/services returns empty array
    // Assert: "No services available" message shown
    // Assert: Helpful text for user
  });

  it('renders service cards with correct data', async () => {
    // Mock: Service with name, price $50, duration 60min
    // Assert: Card shows "$50.00" (formatted currency)
    // Assert: Card shows "60 minutes"
    // Assert: Card shows service name as heading
  });
});
```

#### 2. Filtering by Category
```javascript
describe('Services Page - Category Filtering', () => {
  it('displays category filter dropdown', () => {
    // Assert: Filter dropdown exists
    // Assert: "All Categories" option visible
  });

  it('filters services by selected category', async () => {
    // Mock: 3 "Coaching" services, 2 "Consulting" services
    // User selects "Coaching" from dropdown
    // Assert: Only 3 coaching services displayed
    // Assert: Consulting services hidden
  });

  it('shows all services when "All Categories" selected', async () => {
    // User filters to "Coaching", then selects "All Categories"
    // Assert: All 5 services visible again
  });

  it('shows empty state when filtered category has no services', async () => {
    // User selects category with 0 services
    // Assert: "No services in this category" message
  });

  it('updates URL params when category filter changes', async () => {
    // User selects "Coaching"
    // Assert: URL includes ?category=coaching
  });
});
```

#### 3. Search Functionality
```javascript
describe('Services Page - Search', () => {
  it('displays search input field', () => {
    // Assert: Search input with placeholder text exists
  });

  it('filters services by name search', async () => {
    // Mock: Services named "Life Coaching", "Career Coaching", "Tax Consulting"
    // User types "coaching" in search
    // Assert: 2 coaching services visible
    // Assert: Tax consulting hidden
  });

  it('filters services by description search', async () => {
    // Mock: Service with "stress management" in description
    // User types "stress"
    // Assert: Service with "stress management" visible
  });

  it('search is case-insensitive', async () => {
    // User types "COACHING" (uppercase)
    // Assert: Services with "coaching" (lowercase) shown
  });

  it('clears search results when input cleared', async () => {
    // User searches "coaching", then clears input
    // Assert: All services visible again
  });

  it('shows no results message for non-matching search', async () => {
    // User types "xyz123nonexistent"
    // Assert: "No services match your search" message
  });
});
```

#### 4. Service Cards & Navigation
```javascript
describe('Services Page - Service Cards', () => {
  it('displays service image when available', async () => {
    // Mock: Service with image URL
    // Assert: <img> tag with correct src
    // Assert: Alt text includes service name
  });

  it('displays placeholder when no service image', async () => {
    // Mock: Service with no image
    // Assert: Placeholder div or default image shown
  });

  it('displays "Book Now" button on each card', async () => {
    // Assert: Button with "Book Now" text exists
    // Assert: Button is clickable
  });

  it('navigates to service detail page on card click', async () => {
    // User clicks service card
    // Assert: Navigation to /services/:id
  });

  it('truncates long descriptions to preview length', async () => {
    // Mock: Service with 500 character description
    // Assert: Only ~150 characters shown with "..." ellipsis
  });

  it('displays service price formatted as currency', async () => {
    // Mock: Service price 5000 cents
    // Assert: Displays "$50.00" not "5000"
  });
});
```

#### 5. Responsive Design
```javascript
describe('Services Page - Responsive Layout', () => {
  it('displays grid layout on desktop (3 columns)', () => {
    // Set viewport to 1200px
    // Assert: Grid with 3 columns
  });

  it('displays 2 columns on tablet', () => {
    // Set viewport to 768px
    // Assert: Grid with 2 columns
  });

  it('displays 1 column on mobile', () => {
    // Set viewport to 375px
    // Assert: Single column layout
  });
});
```

### ServiceDetail.test.jsx - Service Detail Page

#### 6. Detail Page Rendering
```javascript
describe('ServiceDetail Page - Rendering', () => {
  it('fetches and displays service details by ID', async () => {
    // Mock: GET /api/services/123 returns service
    // Assert: Service name, full description, price, duration shown
  });

  it('displays loading state while fetching', () => {
    // Mock: Delayed API response
    // Assert: Loading indicator visible
  });

  it('displays 404 error for invalid service ID', async () => {
    // Mock: GET /api/services/999 returns 404
    // Assert: "Service not found" message
    // Assert: Link back to services page
  });

  it('displays service category', async () => {
    // Mock: Service with category "Individual Coaching"
    // Assert: Category badge/chip displayed
  });

  it('displays cancellation policy information', async () => {
    // Mock: Service with 24-hour cancellation policy
    // Assert: "24 hours before appointment" text shown
    // Assert: Refund percentage displayed
  });
});
```

#### 7. Staff Members Display
```javascript
describe('ServiceDetail Page - Staff Members', () => {
  it('fetches and displays staff who provide this service', async () => {
    // Mock: GET /api/staff returns 3 staff with this serviceId
    // Assert: 3 staff members displayed
  });

  it('displays staff member names and photos', async () => {
    // Mock: Staff with name "Jane Doe" and photo URL
    // Assert: Name and photo rendered
  });

  it('shows placeholder when staff has no photo', async () => {
    // Assert: Placeholder avatar displayed
  });

  it('displays message when no staff assigned to service', async () => {
    // Mock: No staff with this serviceId
    // Assert: "All our team members can provide this service"
  });

  it('links to staff profile page on click', async () => {
    // User clicks staff member
    // Assert: Navigation to /staff/:staffId
  });
});
```

#### 8. Booking CTA
```javascript
describe('ServiceDetail Page - Booking', () => {
  it('displays "Book This Service" primary CTA button', () => {
    // Assert: Primary button with "Book This Service" text
  });

  it('navigates to booking flow on CTA click', async () => {
    // User clicks "Book This Service"
    // Assert: Navigation to /book?service=123
  });

  it('pre-selects service when navigating to booking', async () => {
    // User clicks booking CTA
    // Assert: URL includes service ID parameter
  });
});
```

---

## Task 6: Frontend Booking Flow - Test Cases

### bookingStore.test.js - Booking Store State Management

#### 9. Store Initialization
```javascript
describe('bookingStore - Initialization', () => {
  it('initializes with default state', () => {
    // Assert: currentStep = 1
    // Assert: selectedService = null
    // Assert: selectedStaff = null
    // Assert: clientInfo has empty fields
  });

  it('initializes error as null', () => {
    // Assert: error = null
  });
});
```

#### 10. Service Selection
```javascript
describe('bookingStore - Service Selection', () => {
  it('sets selected service', () => {
    // Call: setService({ id: '123', name: 'Coaching' })
    // Assert: selectedService updated
  });

  it('clears previous service when new one selected', () => {
    // Call: setService(serviceA)
    // Call: setService(serviceB)
    // Assert: Only serviceB stored
  });
});
```

#### 11. Staff Selection
```javascript
describe('bookingStore - Staff Selection', () => {
  it('sets selected staff member', () => {
    // Call: setStaff({ id: '456', name: 'Jane' })
    // Assert: selectedStaff updated
  });

  it('allows null staff selection (no preference)', () => {
    // Call: setStaff(null)
    // Assert: selectedStaff = null (valid state)
  });
});
```

#### 12. Date/Time Selection
```javascript
describe('bookingStore - Date/Time Selection', () => {
  it('sets selected date and time', () => {
    // Call: setDateTime({ date: '2024-06-15', time: '10:00' })
    // Assert: selectedDate and selectedTime updated
  });

  it('validates date is in the future', () => {
    // Call: setDateTime({ date: '2020-01-01', time: '10:00' })
    // Assert: error set or validation fails
  });
});
```

#### 13. Client Information
```javascript
describe('bookingStore - Client Info', () => {
  it('updates client name', () => {
    // Call: setClientInfo({ name: 'John Doe' })
    // Assert: clientInfo.name = 'John Doe'
  });

  it('updates client email', () => {
    // Call: setClientInfo({ email: 'john@example.com' })
    // Assert: clientInfo.email updated
  });

  it('validates email format', () => {
    // Call: setClientInfo({ email: 'invalid-email' })
    // Assert: Validation error or email rejected
  });

  it('updates client phone', () => {
    // Call: setClientInfo({ phone: '555-1234' })
    // Assert: clientInfo.phone updated
  });
});
```

#### 14. Step Navigation
```javascript
describe('bookingStore - Step Navigation', () => {
  it('advances to next step', () => {
    // Initial: currentStep = 1
    // Call: nextStep()
    // Assert: currentStep = 2
  });

  it('goes back to previous step', () => {
    // Setup: currentStep = 3
    // Call: previousStep()
    // Assert: currentStep = 2
  });

  it('does not go back below step 1', () => {
    // Setup: currentStep = 1
    // Call: previousStep()
    // Assert: currentStep remains 1
  });

  it('does not advance past step 5', () => {
    // Setup: currentStep = 5
    // Call: nextStep()
    // Assert: currentStep remains 5
  });
});
```

#### 15. Booking Reset
```javascript
describe('bookingStore - Reset', () => {
  it('resets all booking state to defaults', () => {
    // Setup: Fill all fields
    // Call: resetBooking()
    // Assert: currentStep = 1
    // Assert: All selections cleared
    // Assert: clientInfo fields empty
  });
});
```

### BookingFlow.test.jsx - Booking Flow Component

#### 16. Multi-Step Wizard UI
```javascript
describe('BookingFlow - Wizard UI', () => {
  it('renders step indicator showing current step', () => {
    // Assert: "Step 1 of 5" text visible
  });

  it('highlights current step in progress indicator', () => {
    // Setup: Step 2
    // Assert: Step 2 is highlighted/active
    // Assert: Step 1 is completed style
    // Assert: Steps 3-5 are inactive style
  });

  it('displays correct step component based on currentStep', () => {
    // Step 1: Assert StepService component rendered
    // Step 2: Assert StepStaff component rendered
    // etc.
  });
});
```

#### 17. Step 1: Service Selection
```javascript
describe('BookingFlow - Step 1: Service Selection', () => {
  it('displays list of available services', async () => {
    // Mock: GET /api/services returns 5 services
    // Assert: 5 service options displayed
  });

  it('allows selecting a service', async () => {
    // User clicks service card
    // Assert: Service marked as selected (visual indicator)
  });

  it('disables Next button when no service selected', () => {
    // Assert: Next button disabled
  });

  it('enables Next button after service selected', async () => {
    // User selects service
    // Assert: Next button enabled
  });

  it('pre-selects service from URL parameter', () => {
    // URL: /book?service=123
    // Assert: Service 123 auto-selected on load
  });
});
```

#### 18. Step 2: Staff Selection
```javascript
describe('BookingFlow - Step 2: Staff Selection', () => {
  it('displays staff members who provide selected service', async () => {
    // Mock: 3 staff members for selected service
    // Assert: 3 staff options displayed
  });

  it('allows selecting a specific staff member', async () => {
    // User clicks staff card
    // Assert: Staff marked as selected
  });

  it('allows "No Preference" option', () => {
    // Assert: "No Preference" option exists
    // User selects "No Preference"
    // Assert: Can proceed to next step
  });

  it('disables Next when no staff or preference selected', () => {
    // Assert: Next button disabled
  });
});
```

#### 19. Step 3: Date/Time Selection (Placeholder)
```javascript
describe('BookingFlow - Step 3: Date/Time (Part 1 Placeholder)', () => {
  it('displays placeholder calendar UI', () => {
    // Assert: Calendar icon or placeholder visible
    // Assert: "Select Date & Time" button exists
  });

  it('shows message about Part 2 implementation', () => {
    // Assert: Text explaining real calendar coming in Part 2
  });

  it('allows mock date/time selection for testing', () => {
    // User clicks "Select Date & Time" mock button
    // Assert: Mock date/time populated in state
    // Assert: Can proceed to next step
  });
});
```

#### 20. Step 4: Client Information
```javascript
describe('BookingFlow - Step 4: Client Info Form', () => {
  it('renders form with name, email, phone, notes fields', () => {
    // Assert: All 4 input fields exist
  });

  it('validates required fields', async () => {
    // User clicks Next without filling form
    // Assert: Validation errors shown
    // Assert: "Name is required" message
    // Assert: "Email is required" message
  });

  it('validates email format', async () => {
    // User enters "invalid-email"
    // Assert: "Please enter valid email" error
  });

  it('allows proceeding when form valid', async () => {
    // User fills: name, valid email, phone
    // Assert: Next button enabled
    // User clicks Next
    // Assert: Advances to Step 5
  });

  it('preserves form data when going back', async () => {
    // User fills form, clicks Next, then Back
    // Assert: Form still has entered data
  });
});
```

#### 21. Step 5: Review & Confirm
```javascript
describe('BookingFlow - Step 5: Review', () => {
  it('displays summary of all selections', () => {
    // Assert: Selected service name shown
    // Assert: Selected staff name shown (or "No preference")
    // Assert: Selected date/time shown
    // Assert: Client name and email shown
  });

  it('displays "Book Appointment" submit button', () => {
    // Assert: Primary button with "Book Appointment" text
  });

  it('allows editing any step via "Edit" links', async () => {
    // User clicks "Edit" next to service
    // Assert: Navigates back to Step 1
  });

  it('shows placeholder alert on submit (Part 1)', async () => {
    // User clicks "Book Appointment"
    // Assert: Alert/message: "API integration coming in Part 2"
  });
});
```

#### 22. Back/Next Navigation
```javascript
describe('BookingFlow - Navigation', () => {
  it('hides Back button on step 1', () => {
    // Step 1
    // Assert: Back button not visible
  });

  it('shows Back button on steps 2-5', () => {
    // Step 2+
    // Assert: Back button visible
  });

  it('Back button returns to previous step', async () => {
    // Step 3: User clicks Back
    // Assert: currentStep = 2
  });

  it('Next button label changes to "Book Appointment" on step 5', () => {
    // Step 5
    // Assert: Button text is "Book Appointment" not "Next"
  });
});
```

#### 23. Validation & Error States
```javascript
describe('BookingFlow - Validation', () => {
  it('prevents advancing without required data', async () => {
    // Step 1: No service selected, click Next
    // Assert: Remains on Step 1
    // Assert: Validation message shown
  });

  it('displays error message for invalid email', async () => {
    // Step 4: Enter "bad-email", blur field
    // Assert: Error message below email field
  });

  it('clears errors when user corrects input', async () => {
    // Step 4: Invalid email shows error
    // User corrects to valid email
    // Assert: Error message disappears
  });
});
```

---

## Task 7: Staff Management Frontend - Test Cases

### AdminStaff.test.jsx - Admin Staff Listing

#### 24. Staff List Rendering
```javascript
describe('AdminStaff - Staff List', () => {
  it('fetches and displays all staff members', async () => {
    // Mock: GET /api/staff returns 10 staff
    // Assert: 10 rows in staff table
  });

  it('displays staff photo thumbnails', async () => {
    // Mock: Staff with photo URL
    // Assert: <img> with photo displayed in table
  });

  it('displays placeholder for staff without photos', async () => {
    // Mock: Staff with no photo
    // Assert: Default avatar/placeholder shown
  });

  it('displays staff name, title, specialties', async () => {
    // Mock: Staff "Jane Doe", "Senior Coach", ["Leadership"]
    // Assert: All data visible in table row
  });

  it('displays service count or names', async () => {
    // Mock: Staff assigned to 3 services
    // Assert: "3 services" or service names shown
  });

  it('displays active/inactive status badge', async () => {
    // Mock: Active staff and inactive staff
    // Assert: Green "Active" badge for active
    // Assert: Gray "Inactive" badge for inactive
  });
});
```

#### 25. Filtering & Search
```javascript
describe('AdminStaff - Filtering', () => {
  it('filters staff by active status', async () => {
    // Mock: 7 active, 3 inactive staff
    // User selects "Active" filter
    // Assert: Only 7 active staff shown
  });

  it('filters staff by inactive status', async () => {
    // User selects "Inactive" filter
    // Assert: Only 3 inactive staff shown
  });

  it('searches staff by name', async () => {
    // User types "Jane" in search
    // Assert: Only staff with "Jane" in name shown
  });

  it('searches staff by specialty', async () => {
    // User types "Leadership"
    // Assert: Staff with "Leadership" specialty shown
  });

  it('combines filters (active + search)', async () => {
    // User selects "Active" and searches "Jane"
    // Assert: Only active staff named Jane shown
  });
});
```

#### 26. Create New Staff
```javascript
describe('AdminStaff - Create Staff', () => {
  it('displays "Add New Staff" button', () => {
    // Assert: Button exists and is clickable
  });

  it('opens staff edit modal on button click', async () => {
    // User clicks "Add New Staff"
    // Assert: Modal/form appears
    // Assert: Form is empty (new staff)
  });

  it('creates staff via POST API on save', async () => {
    // User fills form, clicks Save
    // Assert: POST /api/staff called with form data
    // Assert: New staff appears in table
  });
});
```

#### 27. Edit Existing Staff
```javascript
describe('AdminStaff - Edit Staff', () => {
  it('opens edit modal with pre-filled data', async () => {
    // User clicks Edit on staff row
    // Assert: Modal opens
    // Assert: Form fields pre-filled with staff data
  });

  it('updates staff via PUT API on save', async () => {
    // User edits name, clicks Save
    // Assert: PUT /api/staff/:id called
    // Assert: Updated data in table
  });
});
```

#### 28. Deactivate Staff
```javascript
describe('AdminStaff - Deactivate', () => {
  it('shows confirmation dialog before deactivating', async () => {
    // User clicks Deactivate button
    // Assert: Confirmation dialog appears
  });

  it('deactivates staff via DELETE API', async () => {
    // User confirms deactivation
    // Assert: DELETE /api/staff/:id called
    // Assert: Staff status updated to inactive
  });

  it('cancels deactivation if user declines', async () => {
    // User clicks Deactivate, then Cancel
    // Assert: No API call made
    // Assert: Staff remains active
  });
});
```

### StaffDetail.test.jsx - Staff Edit Form

#### 29. Form Fields
```javascript
describe('StaffDetail - Form Fields', () => {
  it('renders all required form fields', () => {
    // Assert: Name, Email, Phone, Title inputs exist
  });

  it('renders bio textarea', () => {
    // Assert: Multi-line textarea for bio
  });

  it('renders specialties tag input', () => {
    // Assert: Can add multiple specialty tags
  });

  it('renders services multi-select', () => {
    // Assert: Dropdown/checkboxes for service assignment
  });

  it('renders active status toggle', () => {
    // Assert: Checkbox or switch for active status
  });
});
```

#### 30. Photo Upload
```javascript
describe('StaffDetail - Photo Upload', () => {
  it('displays file upload input', () => {
    // Assert: File input with "Choose Photo" button
  });

  it('uploads photo to Cloudinary on file select', async () => {
    // User selects image file
    // Assert: POST /api/admin/upload called
    // Assert: Loading indicator shown during upload
  });

  it('displays uploaded photo preview', async () => {
    // After upload completes
    // Assert: <img> with uploaded photo URL shown
  });

  it('shows error if upload fails', async () => {
    // Mock: Upload API returns error
    // Assert: Error message displayed
  });

  it('validates file type (images only)', async () => {
    // User selects .pdf file
    // Assert: Error: "Only images allowed"
  });
});
```

#### 31. Service Assignment
```javascript
describe('StaffDetail - Service Assignment', () => {
  it('fetches available services for assignment', async () => {
    // Mock: GET /api/services returns 5 services
    // Assert: 5 services in dropdown/list
  });

  it('allows selecting multiple services', async () => {
    // User selects Service A and Service B
    // Assert: Both services marked as selected
  });

  it('saves service assignments on form submit', async () => {
    // User selects 2 services, clicks Save
    // Assert: serviceIds array with 2 IDs sent to API
  });
});
```

#### 32. Specialty Tags
```javascript
describe('StaffDetail - Specialty Tags', () => {
  it('displays existing specialties as removable tags', () => {
    // Mock: Staff with "Leadership", "Strategy" specialties
    // Assert: 2 tags displayed with X buttons
  });

  it('allows adding new specialty tag', async () => {
    // User types "Coaching", presses Enter
    // Assert: "Coaching" tag added to list
  });

  it('allows removing specialty tag', async () => {
    // User clicks X on "Leadership" tag
    // Assert: "Leadership" removed from list
  });

  it('saves specialty array on form submit', async () => {
    // User adds 3 specialties, clicks Save
    // Assert: specialties array with 3 strings sent to API
  });
});
```

### StaffProfile.test.jsx - Public Profile

#### 33. Public Profile Display
```javascript
describe('StaffProfile - Public View', () => {
  it('fetches and displays staff member profile', async () => {
    // Mock: GET /api/staff/123 returns staff data
    // Assert: Name, title, photo displayed
  });

  it('displays staff bio', async () => {
    // Mock: Staff with bio text
    // Assert: Bio rendered in profile
  });

  it('displays staff specialties', async () => {
    // Mock: Staff with 3 specialties
    // Assert: 3 specialty chips/badges shown
  });

  it('displays services offered by this staff member', async () => {
    // Mock: Staff assigned to 2 services
    // Assert: 2 service names/cards displayed
  });

  it('displays "Book with [Name]" CTA button', () => {
    // Assert: Primary button with staff name in text
  });

  it('navigates to booking flow on CTA click', async () => {
    // User clicks "Book with Jane"
    // Assert: Navigation to /book?staff=123
  });

  it('hides edit controls on public profile', () => {
    // Assert: No Edit button visible
    // Assert: No admin controls
  });
});
```

---

## Task 8: Email Reminder System - Test Cases

### bookingReminders.test.js - Cron Jobs

#### 34. Cron Job Setup
```javascript
describe('bookingReminders - Cron Setup', () => {
  it('schedules 24-hour reminder cron job', () => {
    // Mock: node-cron.schedule
    // Assert: Job scheduled with "0 * * * *" (every hour)
  });

  it('schedules 1-hour reminder cron job', () => {
    // Mock: node-cron.schedule
    // Assert: Job scheduled with "*/15 * * * *" (every 15 min)
  });

  it('does not start cron jobs in test environment', () => {
    // Setup: process.env.NODE_ENV = 'test'
    // Assert: Cron jobs not scheduled
  });
});
```

#### 35. Finding Upcoming Bookings
```javascript
describe('bookingReminders - Finding Bookings', () => {
  it('finds bookings 24 hours away', async () => {
    // Mock: 2 bookings exactly 24h away, 1 booking 25h away
    // Call: findUpcomingForReminders('24h')
    // Assert: Returns 2 bookings (not the 25h one)
  });

  it('finds bookings 1 hour away', async () => {
    // Mock: 1 booking 1h away, 1 booking 2h away
    // Call: findUpcomingForReminders('1h')
    // Assert: Returns 1 booking
  });

  it('filters out cancelled bookings', async () => {
    // Mock: 1 confirmed booking 24h away, 1 cancelled booking 24h away
    // Assert: Only confirmed booking returned
  });

  it('filters out bookings with reminder already sent', async () => {
    // Mock: Booking with remindersSent: [{ type: '24h', sentAt: Date }]
    // Call: findUpcomingForReminders('24h')
    // Assert: Booking not included (already reminded)
  });

  it('includes bookings needing both 24h and 1h reminders separately', async () => {
    // Mock: Booking 24h away with no '24h' reminder sent
    // Later: Same booking 1h away with no '1h' reminder sent
    // Assert: Eligible for both reminder types at different times
  });
});
```

#### 36. Sending Reminder Emails
```javascript
describe('bookingReminders - Sending Emails', () => {
  it('sends 24-hour reminder email via Resend', async () => {
    // Mock: Booking 24h away
    // Call: sendReminder(booking, '24h')
    // Assert: resend.emails.send called with correct data
  });

  it('sends 1-hour reminder email via Resend', async () => {
    // Mock: Booking 1h away
    // Call: sendReminder(booking, '1h')
    // Assert: resend.emails.send called
  });

  it('marks reminder as sent after successful email', async () => {
    // Mock: Email sends successfully
    // Call: sendReminder(booking, '24h')
    // Assert: Booking.markReminderSent called
    // Assert: remindersSent array includes { type: '24h', sentAt }
  });

  it('does not mark sent if email fails', async () => {
    // Mock: Resend throws error
    // Call: sendReminder(booking, '24h')
    // Assert: Booking.markReminderSent NOT called
  });

  it('logs email send failures without crashing', async () => {
    // Mock: Resend throws error
    // Call: sendReminder(booking, '24h')
    // Assert: Error logged via Winston
    // Assert: Function returns without throwing
  });
});
```

#### 37. Email Template Generation
```javascript
describe('bookingReminders - Email Templates', () => {
  it('generates 24-hour reminder with correct data', () => {
    // Mock: Booking with service "Coaching", staff "Jane", time "10:00 AM"
    // Call: generateBookingReminder24h(booking, client, service, staff)
    // Assert: Subject includes "tomorrow at 10:00 AM"
    // Assert: Body includes service name, staff name, client name
  });

  it('generates 1-hour reminder with correct data', () => {
    // Call: generateBookingReminder1h(booking, client, service, staff)
    // Assert: Subject includes "in 1 hour"
    // Assert: Body includes service name and time
  });

  it('formats date/time in client timezone', () => {
    // Mock: Booking with timeZone "America/Los_Angeles"
    // Assert: Time formatted in PST/PDT, not UTC
  });

  it('includes manage booking link', () => {
    // Call: generateBookingReminder24h(...)
    // Assert: Body includes link to /bookings/123
  });

  it('handles missing staff (no preference booking)', () => {
    // Mock: Booking with no staff assigned
    // Call: generateBookingReminder24h(...)
    // Assert: "With: One of our team members" (not null/undefined)
  });
});
```

#### 38. Timezone Handling
```javascript
describe('bookingReminders - Timezones', () => {
  it('calculates 24h window in booking timezone', () => {
    // Mock: Booking in PST, server in UTC
    // Assert: Finds bookings 24h away in PST, not UTC
  });

  it('displays time in client timezone in email', () => {
    // Mock: Booking 10:00 AM PST
    // Assert: Email shows "10:00 AM PST" not "6:00 PM UTC"
  });

  it('handles daylight saving time transitions', () => {
    // Mock: Booking during DST transition
    // Assert: Correct time calculated despite DST
  });
});
```

#### 39. Booking Model Updates
```javascript
describe('Booking Model - Reminder Tracking', () => {
  it('adds remindersSent field to schema', () => {
    // Assert: Booking schema includes remindersSent array
  });

  it('markReminderSent updates booking with timestamp', async () => {
    // Call: Booking.markReminderSent('booking123', '24h')
    // Assert: remindersSent: [{ type: '24h', sentAt: Date }]
  });

  it('allows multiple reminder types on same booking', async () => {
    // Call: markReminderSent('booking123', '24h')
    // Call: markReminderSent('booking123', '1h')
    // Assert: remindersSent has 2 entries
  });
});
```

---

## Test Execution Standards

### Test Coverage Requirements
- **Minimum 80% code coverage** for all new code
- **100% coverage** for critical paths (payment, booking creation, reminders)
- Use `npm run test:coverage` to verify

### Test Data Mocking
```javascript
// Example Mock Data Structure
const mockService = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Life Coaching Session',
  description: 'One-on-one life coaching focused on goals and growth',
  category: 'Individual Coaching',
  duration: 60,
  price: 10000, // cents
  image: 'https://example.com/coaching.jpg',
  isActive: true,
  bufferTime: 15,
  staffIds: ['507f1f77bcf86cd799439012'],
};

const mockStaff = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Jane Doe',
  email: 'jane@example.com',
  title: 'Senior Life Coach',
  bio: 'Certified life coach with 10 years experience...',
  specialties: ['Leadership', 'Career Transitions', 'Life Balance'],
  serviceIds: ['507f1f77bcf86cd799439011'],
  photo: 'https://example.com/jane.jpg',
  isActive: true,
  acceptingBookings: true,
};

const mockBooking = {
  _id: '507f1f77bcf86cd799439013',
  serviceId: '507f1f77bcf86cd799439011',
  clientId: '507f1f77bcf86cd799439014',
  staffId: '507f1f77bcf86cd799439012',
  startDateTime: new Date('2024-06-15T10:00:00Z'),
  endDateTime: new Date('2024-06-15T11:00:00Z'),
  timeZone: 'America/New_York',
  status: 'confirmed',
  paymentStatus: 'paid',
  amount: 10000,
  clientInfo: {
    name: 'John Client',
    email: 'john@example.com',
    phone: '555-1234',
  },
  remindersSent: [],
};
```

### Test Helpers
```javascript
// Reusable test utilities

// Mock API responses
function mockApiSuccess(endpoint, data) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

function mockApiError(endpoint, statusCode, message) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: statusCode,
    json: async () => ({ error: message }),
  });
}

// Render with Router wrapper
function renderWithRouter(component, { route = '/' } = {}) {
  window.history.pushState({}, 'Test', route);
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}

// Wait for async state updates
async function waitForLoadingToFinish() {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
}
```

---

## Acceptance Checklist

Before submitting task completion, verify:

### Functionality
- [ ] All features from requirements implemented
- [ ] API integration working correctly
- [ ] Error states handled gracefully
- [ ] Loading states provide user feedback
- [ ] Empty states have helpful messaging

### Testing
- [ ] All test cases pass (`npm run test:run`)
- [ ] Minimum test count met (specified per task)
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] 80%+ code coverage achieved

### Code Quality
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] No unused imports
- [ ] Meaningful variable names
- [ ] JSDoc comments for complex logic
- [ ] Follows existing code patterns

### Design & UX
- [ ] Responsive on mobile, tablet, desktop
- [ ] Uses design system utilities
- [ ] Accessible (keyboard nav, screen readers)
- [ ] Consistent with existing pages
- [ ] Loading states smooth

### Documentation
- [ ] Code comments where needed
- [ ] README updated if new setup required
- [ ] API endpoints documented

### Git & Deployment
- [ ] Conventional commit message format
- [ ] Tests passing in CI
- [ ] No merge conflicts
- [ ] Deployable to production

---

## Common Test Pitfalls to Avoid

### 1. Flaky Tests
❌ **Bad**: Tests that sometimes pass, sometimes fail
```javascript
it('displays timestamp', () => {
  const now = new Date();
  // Flaky: Time may change between render and assertion
  expect(screen.getByText(now.toLocaleString())).toBeInTheDocument();
});
```

✅ **Good**: Mock time to be deterministic
```javascript
it('displays timestamp', () => {
  const mockDate = new Date('2024-06-15T10:00:00Z');
  vi.setSystemTime(mockDate);
  render(<Component />);
  expect(screen.getByText('Jun 15, 2024, 10:00 AM')).toBeInTheDocument();
});
```

### 2. Testing Implementation Details
❌ **Bad**: Testing internal state/props
```javascript
it('sets loading state', () => {
  const { rerender } = render(<Component />);
  expect(component.state.loading).toBe(true); // Testing internal state
});
```

✅ **Good**: Test user-visible behavior
```javascript
it('displays loading indicator', () => {
  render(<Component />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### 3. Incomplete Mocking
❌ **Bad**: Forgetting to mock dependencies
```javascript
it('fetches data', async () => {
  render(<Component />);
  // Real API call happens - test fails or is slow
});
```

✅ **Good**: Mock all external dependencies
```javascript
it('fetches data', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockData });
  render(<Component />);
  await waitFor(() => expect(screen.getByText('Data')).toBeInTheDocument());
});
```

### 4. Missing Cleanup
❌ **Bad**: Leaving test state/mocks polluting other tests
```javascript
beforeEach(() => {
  global.fetch = vi.fn();
  // Never cleared
});
```

✅ **Good**: Clean up after each test
```javascript
beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
```

---

## Success Criteria Summary

### Task 5 (Service Catalog): ✅ Passing if
- 15+ tests passing
- Services display, filter, and navigate correctly
- Responsive design works
- API integration solid

### Task 6 (Booking Flow Part 1): ✅ Passing if
- 20+ tests passing
- All 5 steps navigate correctly
- Form validation works
- State management via Zustand solid

### Task 7 (Staff Management): ✅ Passing if
- 15+ tests passing
- Admin CRUD operations work
- Photo upload functional
- Public profile displays correctly

### Task 8 (Email Reminders): ✅ Passing if
- 10+ tests passing
- Cron jobs scheduled correctly
- Emails send with correct data
- Reminders tracked in database
- Timezone handling works

---

**All test cases should be automated and run via `npm run test:run` before task submission.**
