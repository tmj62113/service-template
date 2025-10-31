import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { RecurringBooking } from './RecurringBooking.js';
import { Service } from './Service.js';
import { Staff } from './Staff.js';
import { User } from './User.js';
import { getDatabase } from '../connection.js';
import { ObjectId } from 'mongodb';

describe('RecurringBooking Model', () => {
  let db;
  let testServiceId;
  let testStaffId;
  let testClientId;

  beforeAll(async () => {
    db = await getDatabase();

    // Create test service
    const service = await Service.create({
      name: 'Weekly Coaching Session',
      description: 'Recurring coaching service for tests',
      category: 'Individual',
      duration: 60,
      price: 15000,
      staffIds: [],
    });
    testServiceId = service._id;

    // Create test staff
    const staff = await Staff.create({
      name: 'Test Recurring Coach',
      email: 'recurringcoach@example.com',
      phone: '+1-555-0100',
      bio: 'Test coach for recurring bookings',
      title: 'Senior Coach',
      specialties: ['Recurring Sessions'],
      timeZone: 'America/New_York',
    });
    testStaffId = staff._id;

    // Create test client
    const client = await User.create({
      email: 'recurringclient@example.com',
      password: 'SecurePass123!',
      name: 'Test Recurring Client',
    });
    testClientId = client._id;
  });

  beforeEach(async () => {
    // Clean up recurring_bookings collection before each test
    await db.collection('recurring_bookings').deleteMany({});
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.collection('recurring_bookings').deleteMany({});
    await db.collection('services').deleteMany({});
    await db.collection('staff').deleteMany({});
    await db.collection('users').deleteMany({ email: 'recurringclient@example.com' });
  });

  describe('create', () => {
    it('should create a new weekly recurring booking with all required fields', async () => {
      const recurringData = {
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 2, // Tuesday
        startTime: '14:00',
        duration: 60,
        timeZone: 'America/New_York',
        startDate: new Date('2025-11-01T00:00:00Z'),
        endDate: new Date('2026-01-31T00:00:00Z'),
        paymentPlan: 'per_session',
      };

      const recurring = await RecurringBooking.create(recurringData);

      expect(recurring).toBeDefined();
      expect(recurring._id).toBeDefined();
      expect(recurring.clientId).toEqual(testClientId);
      expect(recurring.staffId).toEqual(testStaffId);
      expect(recurring.serviceId).toEqual(testServiceId);
      expect(recurring.frequency).toBe('weekly');
      expect(recurring.interval).toBe(1);
      expect(recurring.dayOfWeek).toBe(2);
      expect(recurring.startTime).toBe('14:00');
      expect(recurring.duration).toBe(60);
      expect(recurring.timeZone).toBe('America/New_York');
      expect(recurring.startDate).toBeInstanceOf(Date);
      expect(recurring.endDate).toBeInstanceOf(Date);
      expect(recurring.status).toBe('active');
      expect(recurring.paymentPlan).toBe('per_session');
      expect(recurring.bookingIds).toEqual([]);
      expect(recurring.createdAt).toBeInstanceOf(Date);
      expect(recurring.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a biweekly recurring booking', async () => {
      const recurringData = {
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'biweekly',
        interval: 1,
        dayOfWeek: 3, // Wednesday
        startTime: '10:00',
        duration: 90,
        timeZone: 'America/Los_Angeles',
        startDate: new Date('2025-11-01T00:00:00Z'),
        occurrences: 12, // 12 sessions instead of end date
        paymentPlan: 'monthly_subscription',
      };

      const recurring = await RecurringBooking.create(recurringData);

      expect(recurring.frequency).toBe('biweekly');
      expect(recurring.occurrences).toBe(12);
      expect(recurring.endDate).toBeNull();
      expect(recurring.paymentPlan).toBe('monthly_subscription');
    });

    it('should create a monthly recurring booking', async () => {
      const recurringData = {
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15, // 15th of each month
        startTime: '09:00',
        duration: 60,
        timeZone: 'America/Chicago',
        startDate: new Date('2025-11-15T00:00:00Z'),
        endDate: new Date('2026-05-15T00:00:00Z'),
        paymentPlan: 'per_session',
      };

      const recurring = await RecurringBooking.create(recurringData);

      expect(recurring.frequency).toBe('monthly');
      expect(recurring.dayOfMonth).toBe(15);
      expect(recurring.dayOfWeek).toBeNull();
    });

    it('should create recurring booking with default values', async () => {
      const recurringData = {
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 1,
        startTime: '13:00',
        duration: 45,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
      };

      const recurring = await RecurringBooking.create(recurringData);

      expect(recurring.interval).toBe(1);
      expect(recurring.status).toBe('active');
      expect(recurring.paymentPlan).toBe('per_session');
      expect(recurring.endDate).toBeNull();
      expect(recurring.occurrences).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find recurring booking by ID', async () => {
      const created = await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 4,
        startTime: '11:00',
        duration: 60,
        timeZone: 'America/New_York',
        startDate: new Date('2025-11-01T00:00:00Z'),
      });

      const found = await RecurringBooking.findById(created._id.toString());

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.frequency).toBe('weekly');
      expect(found.dayOfWeek).toBe(4);
    });

    it('should return null for non-existent recurring booking', async () => {
      const fakeId = new ObjectId().toString();
      const found = await RecurringBooking.findById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe('findByClient', () => {
    it('should find all recurring bookings for a client', async () => {
      // Create multiple recurring bookings for test client
      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 1,
        startTime: '09:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
      });

      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 3,
        startTime: '14:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-05T00:00:00Z'),
      });

      const bookings = await RecurringBooking.findByClient(testClientId.toString());

      expect(bookings).toHaveLength(2);
      bookings.forEach(booking => {
        expect(booking.clientId.toString()).toBe(testClientId.toString());
      });
    });

    it('should return bookings sorted by startDate descending', async () => {
      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 1,
        startTime: '09:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
      });

      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 2,
        startTime: '10:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-12-01T00:00:00Z'),
      });

      const bookings = await RecurringBooking.findByClient(testClientId.toString());

      expect(bookings[0].startDate.getTime()).toBeGreaterThan(bookings[1].startDate.getTime());
    });
  });

  describe('findByStaff', () => {
    it('should find all recurring bookings for a staff member', async () => {
      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 5,
        startTime: '15:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
      });

      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'biweekly',
        dayOfWeek: 2,
        startTime: '11:00',
        duration: 90,
        timeZone: 'UTC',
        startDate: new Date('2025-11-05T00:00:00Z'),
      });

      const bookings = await RecurringBooking.findByStaff(testStaffId.toString());

      expect(bookings).toHaveLength(2);
      bookings.forEach(booking => {
        expect(booking.staffId.toString()).toBe(testStaffId.toString());
      });
    });
  });

  describe('findActive', () => {
    it('should find all active recurring bookings', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);

      // Create active recurring booking
      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 1,
        startTime: '10:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        endDate: futureDate,
        status: 'active',
      });

      // Create paused recurring booking
      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 2,
        startTime: '11:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        status: 'paused',
      });

      const activeBookings = await RecurringBooking.findActive();

      expect(activeBookings).toHaveLength(1);
      expect(activeBookings[0].status).toBe('active');
    });

    it('should include active recurring bookings with no end date', async () => {
      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 3,
        startTime: '12:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        endDate: null, // Indefinite
        status: 'active',
      });

      const activeBookings = await RecurringBooking.findActive();

      expect(activeBookings.length).toBeGreaterThan(0);
      expect(activeBookings.some(b => b.endDate === null)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update recurring booking fields', async () => {
      const recurring = await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 1,
        startTime: '09:00',
        duration: 60,
        timeZone: 'America/New_York',
        startDate: new Date('2025-11-01T00:00:00Z'),
      });

      const updated = await RecurringBooking.update(recurring._id.toString(), {
        startTime: '10:00',
        duration: 90,
      });

      expect(updated.startTime).toBe('10:00');
      expect(updated.duration).toBe(90);
      expect(updated.frequency).toBe('weekly'); // Unchanged
      expect(updated.updatedAt.getTime()).toBeGreaterThan(recurring.updatedAt.getTime());
    });
  });

  describe('addBooking', () => {
    it('should add a booking ID to the recurring pattern', async () => {
      const recurring = await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 2,
        startTime: '14:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
      });

      const bookingId = new ObjectId().toString();
      const updated = await RecurringBooking.addBooking(recurring._id.toString(), bookingId);

      expect(updated.bookingIds).toHaveLength(1);
      expect(updated.bookingIds[0].toString()).toBe(bookingId);
    });

    it('should add multiple booking IDs', async () => {
      const recurring = await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 3,
        startTime: '15:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
      });

      const bookingId1 = new ObjectId().toString();
      const bookingId2 = new ObjectId().toString();

      await RecurringBooking.addBooking(recurring._id.toString(), bookingId1);
      const updated = await RecurringBooking.addBooking(recurring._id.toString(), bookingId2);

      expect(updated.bookingIds).toHaveLength(2);
    });
  });

  describe('pause', () => {
    it('should pause an active recurring booking', async () => {
      const recurring = await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 4,
        startTime: '11:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        status: 'active',
      });

      const paused = await RecurringBooking.pause(recurring._id.toString());

      expect(paused.status).toBe('paused');
    });
  });

  describe('resume', () => {
    it('should resume a paused recurring booking', async () => {
      const recurring = await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 5,
        startTime: '16:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        status: 'paused',
      });

      const resumed = await RecurringBooking.resume(recurring._id.toString());

      expect(resumed.status).toBe('active');
    });
  });

  describe('cancel', () => {
    it('should cancel recurring booking and set end date to today', async () => {
      const recurring = await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 1,
        startTime: '10:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        endDate: new Date('2026-06-01T00:00:00Z'),
        status: 'active',
      });

      const cancelled = await RecurringBooking.cancel(recurring._id.toString());

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.endDate).toBeInstanceOf(Date);
      expect(cancelled.endDate.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });
  });

  describe('markAsCompleted', () => {
    it('should mark recurring booking as completed', async () => {
      const recurring = await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 2,
        startTime: '13:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        endDate: new Date('2025-12-01T00:00:00Z'),
        status: 'active',
      });

      const completed = await RecurringBooking.markAsCompleted(recurring._id.toString());

      expect(completed.status).toBe('completed');
    });
  });

  describe('delete', () => {
    it('should permanently delete a recurring booking', async () => {
      const recurring = await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 3,
        startTime: '14:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
      });

      const deleted = await RecurringBooking.delete(recurring._id.toString());
      expect(deleted).toBe(true);

      const found = await RecurringBooking.findById(recurring._id.toString());
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent recurring booking', async () => {
      const fakeId = new ObjectId().toString();
      const deleted = await RecurringBooking.delete(fakeId);

      expect(deleted).toBe(false);
    });
  });

  describe('calculateNextOccurrence', () => {
    it('should calculate next weekly occurrence from start date', () => {
      const recurring = {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 2, // Tuesday
        startDate: new Date('2025-11-04T14:00:00Z'), // Tuesday, Nov 4, 2025
        endDate: null,
        occurrences: null,
        bookingIds: [],
      };

      const fromDate = new Date('2025-11-05T00:00:00Z'); // Wednesday
      const next = RecurringBooking.calculateNextOccurrence(recurring, fromDate);

      expect(next).toBeInstanceOf(Date);
      expect(next.getDay()).toBe(2); // Tuesday
      expect(next.getDate()).toBe(11); // Next Tuesday is Nov 11
    });

    it('should calculate next biweekly occurrence', () => {
      const recurring = {
        frequency: 'biweekly',
        interval: 1,
        dayOfWeek: 3, // Wednesday
        startDate: new Date('2025-11-05T10:00:00Z'), // Wednesday, Nov 5, 2025
        endDate: null,
        occurrences: null,
        bookingIds: [],
      };

      const fromDate = new Date('2025-11-06T00:00:00Z');
      const next = RecurringBooking.calculateNextOccurrence(recurring, fromDate);

      expect(next).toBeInstanceOf(Date);
      expect(next.getDay()).toBe(3); // Wednesday
      expect(next.getDate()).toBe(19); // Two weeks later is Nov 19
    });

    it('should calculate next monthly occurrence on specific day', () => {
      const recurring = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 15,
        startDate: new Date('2025-11-15T09:00:00Z'),
        endDate: null,
        occurrences: null,
        bookingIds: [],
      };

      const fromDate = new Date('2025-11-16T00:00:00Z');
      const next = RecurringBooking.calculateNextOccurrence(recurring, fromDate);

      expect(next).toBeInstanceOf(Date);
      expect(next.getDate()).toBe(15);
      expect(next.getMonth()).toBe(11); // December (0-indexed)
    });

    it('should return null when end date is reached', () => {
      const recurring = {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 1,
        startDate: new Date('2025-11-03T10:00:00Z'),
        endDate: new Date('2025-12-01T00:00:00Z'),
        occurrences: null,
        bookingIds: [],
      };

      const fromDate = new Date('2025-12-02T00:00:00Z');
      const next = RecurringBooking.calculateNextOccurrence(recurring, fromDate);

      expect(next).toBeNull();
    });

    it('should return null when max occurrences reached', () => {
      const recurring = {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 2,
        startDate: new Date('2025-11-04T14:00:00Z'),
        endDate: null,
        occurrences: 5,
        bookingIds: [
          new ObjectId(),
          new ObjectId(),
          new ObjectId(),
          new ObjectId(),
          new ObjectId(),
        ],
      };

      const fromDate = new Date('2025-12-09T00:00:00Z');
      const next = RecurringBooking.calculateNextOccurrence(recurring, fromDate);

      expect(next).toBeNull();
    });

    it('should handle edge case for monthly occurrence on day that does not exist', () => {
      const recurring = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 31,
        startDate: new Date('2025-01-31T10:00:00Z'),
        endDate: null,
        occurrences: null,
        bookingIds: [],
      };

      // Calculate next from Feb 1 (Feb has no 31st day)
      const fromDate = new Date('2025-02-01T00:00:00Z');
      const next = RecurringBooking.calculateNextOccurrence(recurring, fromDate);

      expect(next).toBeInstanceOf(Date);
      // Should default to last day of February
      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBeLessThanOrEqual(29);
    });
  });

  describe('generateOccurrenceDates', () => {
    it('should generate all occurrence dates for weekly pattern', () => {
      const recurring = {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 1, // Monday
        startDate: new Date('2025-11-03T10:00:00Z'),
        endDate: new Date('2025-12-01T00:00:00Z'),
        occurrences: null,
        bookingIds: [],
      };

      const dates = RecurringBooking.generateOccurrenceDates(recurring, 10);

      expect(dates.length).toBeGreaterThan(0);
      expect(dates.length).toBeLessThanOrEqual(5); // Approximately 4 weeks
      dates.forEach(date => {
        expect(date.getDay()).toBe(1); // All should be Mondays
      });
    });

    it('should limit generated dates to maxToGenerate parameter', () => {
      const recurring = {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 2,
        startDate: new Date('2025-11-04T14:00:00Z'),
        endDate: null, // No end date
        occurrences: null,
        bookingIds: [],
      };

      const dates = RecurringBooking.generateOccurrenceDates(recurring, 8);

      expect(dates).toHaveLength(8);
    });

    it('should stop at end date even if maxToGenerate is higher', () => {
      const recurring = {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 3,
        startDate: new Date('2025-11-05T11:00:00Z'),
        endDate: new Date('2025-11-26T00:00:00Z'), // 3 weeks only
        occurrences: null,
        bookingIds: [],
      };

      const dates = RecurringBooking.generateOccurrenceDates(recurring, 52);

      expect(dates.length).toBeLessThanOrEqual(4);
    });

    it('should generate correct dates for biweekly pattern', () => {
      const recurring = {
        frequency: 'biweekly',
        interval: 1,
        dayOfWeek: 4, // Thursday
        startDate: new Date('2025-11-06T13:00:00Z'),
        endDate: new Date('2026-01-31T00:00:00Z'),
        occurrences: null,
        bookingIds: [],
      };

      const dates = RecurringBooking.generateOccurrenceDates(recurring, 6);

      expect(dates.length).toBeGreaterThan(0);
      dates.forEach(date => {
        expect(date.getDay()).toBe(4); // All Thursdays
      });

      // Check spacing between dates (should be 14 days)
      if (dates.length > 1) {
        const daysBetween = Math.round((dates[1] - dates[0]) / (1000 * 60 * 60 * 24));
        expect(daysBetween).toBe(14);
      }
    });

    it('should generate correct dates for monthly pattern', () => {
      const recurring = {
        frequency: 'monthly',
        interval: 1,
        dayOfMonth: 10,
        startDate: new Date('2025-11-10T09:00:00Z'),
        endDate: new Date('2026-03-10T00:00:00Z'),
        occurrences: null,
        bookingIds: [],
      };

      const dates = RecurringBooking.generateOccurrenceDates(recurring, 12);

      expect(dates.length).toBeGreaterThan(0);
      dates.forEach(date => {
        expect(date.getDate()).toBe(10); // All on 10th of month
      });
    });

    it('should stop when occurrences limit is reached', () => {
      const recurring = {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 5,
        startDate: new Date('2025-11-07T15:00:00Z'),
        endDate: null,
        occurrences: 10,
        bookingIds: [],
      };

      const dates = RecurringBooking.generateOccurrenceDates(recurring, 10);

      expect(dates).toHaveLength(10);
    });
  });

  describe('getStats', () => {
    it('should return recurring booking statistics', async () => {
      // Create recurring bookings with different statuses
      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 1,
        startTime: '10:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        status: 'active',
      });

      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 2,
        startTime: '11:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        status: 'paused',
      });

      await RecurringBooking.create({
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        serviceId: testServiceId.toString(),
        frequency: 'weekly',
        dayOfWeek: 3,
        startTime: '12:00',
        duration: 60,
        timeZone: 'UTC',
        startDate: new Date('2025-11-01T00:00:00Z'),
        status: 'completed',
      });

      const stats = await RecurringBooking.getStats();

      expect(stats.totalRecurring).toBe(3);
      expect(stats.activeRecurring).toBe(1);
      expect(stats.byStatus).toBeDefined();
      expect(Array.isArray(stats.byStatus)).toBe(true);
      expect(stats.byStatus.length).toBeGreaterThan(0);
    });

    it('should handle empty collection', async () => {
      const stats = await RecurringBooking.getStats();

      expect(stats.totalRecurring).toBe(0);
      expect(stats.activeRecurring).toBe(0);
      expect(stats.byStatus).toEqual([]);
    });
  });
});
