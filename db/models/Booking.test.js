import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Booking } from './Booking.js';
import { Service } from './Service.js';
import { Staff } from './Staff.js';
import { User } from './User.js';
import { getDatabase } from '../connection.js';
import { ObjectId } from 'mongodb';

describe('Booking Model', () => {
  let db;
  let testBookingId;
  let testServiceId;
  let testStaffId;
  let testClientId;

  beforeAll(async () => {
    db = await getDatabase();

    // Create test service
    const service = await Service.create({
      name: 'Test Coaching Session',
      description: 'Test service for booking tests',
      category: 'Individual',
      duration: 60,
      price: 15000,
      staffIds: [],
    });
    testServiceId = service._id;

    // Create test staff
    const staff = await Staff.create({
      name: 'Test Coach',
      email: 'testcoach@example.com',
      phone: '+1-555-0100',
      bio: 'Test coach bio',
      title: 'Senior Coach',
      specialties: ['Coaching'],
      timeZone: 'America/New_York',
    });
    testStaffId = staff._id;

    // Create test client
    const client = await User.create({
      email: 'testclient@example.com',
      password: 'SecurePass123!',
      name: 'Test Client',
    });
    testClientId = client._id;
  });

  beforeEach(async () => {
    // Clean up bookings collection before each test
    await db.collection('bookings').deleteMany({});
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.collection('bookings').deleteMany({});
    await db.collection('services').deleteMany({});
    await db.collection('staff').deleteMany({});
    await db.collection('users').deleteMany({ email: 'testclient@example.com' });
  });

  describe('create', () => {
    it('should create a new booking with all required fields', async () => {
      const bookingData = {
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-01T14:00:00Z'),
        endDateTime: new Date('2025-12-01T15:00:00Z'),
        timeZone: 'America/New_York',
        duration: 60,
        clientInfo: {
          name: 'Test Client',
          email: 'testclient@example.com',
          phone: '+1-555-0199',
          notes: 'Test booking notes',
        },
        paymentIntentId: 'pi_test123',
        amount: 15000,
        currency: 'USD',
      };

      const booking = await Booking.create(bookingData);

      expect(booking).toBeDefined();
      expect(booking._id).toBeDefined();
      expect(booking.serviceId).toEqual(testServiceId);
      expect(booking.clientId).toEqual(testClientId);
      expect(booking.staffId).toEqual(testStaffId);
      expect(booking.startDateTime).toBeInstanceOf(Date);
      expect(booking.endDateTime).toBeInstanceOf(Date);
      expect(booking.timeZone).toBe('America/New_York');
      expect(booking.duration).toBe(60);
      expect(booking.status).toBe('pending');
      expect(booking.paymentStatus).toBe('pending');
      expect(booking.amount).toBe(15000);
      expect(booking.currency).toBe('USD');
      expect(booking.clientInfo.name).toBe('Test Client');
      expect(booking.createdAt).toBeInstanceOf(Date);
      expect(booking.updatedAt).toBeInstanceOf(Date);

      testBookingId = booking._id;
    });

    it('should create a booking with default status values', async () => {
      const bookingData = {
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-02T10:00:00Z'),
        endDateTime: new Date('2025-12-02T11:00:00Z'),
        timeZone: 'America/Chicago',
        duration: 60,
        clientInfo: {
          name: 'Another Client',
          email: 'another@example.com',
        },
        amount: 10000,
        currency: 'USD',
      };

      const booking = await Booking.create(bookingData);

      expect(booking.status).toBe('pending');
      expect(booking.paymentStatus).toBe('pending');
      expect(booking.cancellationReason).toBeNull();
      expect(booking.cancelledAt).toBeNull();
      expect(booking.cancelledBy).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a booking by ID with populated references', async () => {
      const created = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-03T09:00:00Z'),
        endDateTime: new Date('2025-12-03T10:00:00Z'),
        timeZone: 'America/Los_Angeles',
        duration: 60,
        clientInfo: { name: 'Find Test', email: 'find@example.com' },
        amount: 12000,
        currency: 'USD',
      });

      const booking = await Booking.findById(created._id.toString());

      expect(booking).toBeDefined();
      expect(booking._id).toEqual(created._id);
      expect(booking.serviceId.name).toBe('Test Coaching Session');
      expect(booking.staffId.name).toBe('Test Coach');
      expect(booking.clientInfo.name).toBe('Find Test');
    });

    it('should return null for non-existent booking', async () => {
      const fakeId = new ObjectId().toString();
      const booking = await Booking.findById(fakeId);
      expect(booking).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all bookings with pagination', async () => {
      // Create multiple bookings
      for (let i = 0; i < 3; i++) {
        await Booking.create({
          serviceId: testServiceId.toString(),
          clientId: testClientId.toString(),
          staffId: testStaffId.toString(),
          startDateTime: new Date(`2025-12-0${i + 4}T10:00:00Z`),
          endDateTime: new Date(`2025-12-0${i + 4}T11:00:00Z`),
          timeZone: 'UTC',
          duration: 60,
          clientInfo: { name: `Client ${i}`, email: `client${i}@example.com` },
          amount: 10000,
          currency: 'USD',
        });
      }

      const bookings = await Booking.findAll(1, 10);

      expect(bookings).toHaveLength(3);
      expect(bookings[0].clientInfo.name).toBe('Client 2'); // Most recent first
    });
  });

  describe('update', () => {
    it('should update booking fields', async () => {
      const booking = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-05T13:00:00Z'),
        endDateTime: new Date('2025-12-05T14:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Update Test', email: 'update@example.com' },
        amount: 15000,
        currency: 'USD',
      });

      const updated = await Booking.update(booking._id.toString(), {
        status: 'confirmed',
        'clientInfo.phone': '+1-555-0188',
      });

      expect(updated.status).toBe('confirmed');
      expect(updated.clientInfo.phone).toBe('+1-555-0188');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(booking.updatedAt.getTime());
    });
  });

  describe('cancel', () => {
    it('should cancel a booking with reason and canceller', async () => {
      const booking = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-06T15:00:00Z'),
        endDateTime: new Date('2025-12-06T16:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Cancel Test', email: 'cancel@example.com' },
        amount: 15000,
        currency: 'USD',
        status: 'confirmed',
      });

      const cancelled = await Booking.cancel(
        booking._id.toString(),
        'Client requested cancellation',
        testClientId.toString()
      );

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancellationReason).toBe('Client requested cancellation');
      expect(cancelled.cancelledBy).toEqual(testClientId);
      expect(cancelled.cancelledAt).toBeInstanceOf(Date);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark booking as completed', async () => {
      const booking = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-07T10:00:00Z'),
        endDateTime: new Date('2025-12-07T11:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Complete Test', email: 'complete@example.com' },
        amount: 15000,
        currency: 'USD',
        status: 'confirmed',
      });

      const completed = await Booking.markAsCompleted(booking._id.toString());

      expect(completed.status).toBe('completed');
    });
  });

  describe('markAsNoShow', () => {
    it('should mark booking as no-show', async () => {
      const booking = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-08T14:00:00Z'),
        endDateTime: new Date('2025-12-08T15:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'No Show Test', email: 'noshow@example.com' },
        amount: 15000,
        currency: 'USD',
        status: 'confirmed',
      });

      const noShow = await Booking.markAsNoShow(booking._id.toString());

      expect(noShow.status).toBe('no-show');
    });
  });

  describe('confirm', () => {
    it('should confirm a pending booking', async () => {
      const booking = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-09T11:00:00Z'),
        endDateTime: new Date('2025-12-09T12:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Confirm Test', email: 'confirm@example.com' },
        amount: 15000,
        currency: 'USD',
        status: 'pending',
      });

      const confirmed = await Booking.confirm(booking._id.toString());

      expect(confirmed.status).toBe('confirmed');
    });
  });

  describe('reschedule', () => {
    it('should reschedule a booking to new date/time', async () => {
      const booking = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-10T09:00:00Z'),
        endDateTime: new Date('2025-12-10T10:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Reschedule Test', email: 'reschedule@example.com' },
        amount: 15000,
        currency: 'USD',
      });

      const newStart = new Date('2025-12-11T14:00:00Z');
      const newEnd = new Date('2025-12-11T15:00:00Z');
      const rescheduled = await Booking.reschedule(booking._id.toString(), newStart, newEnd);

      expect(rescheduled.startDateTime).toEqual(newStart);
      expect(rescheduled.endDateTime).toEqual(newEnd);
      expect(rescheduled.status).toBe('confirmed');
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const booking = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-12T10:00:00Z'),
        endDateTime: new Date('2025-12-12T11:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Payment Test', email: 'payment@example.com' },
        amount: 15000,
        currency: 'USD',
        paymentStatus: 'pending',
      });

      const updated = await Booking.updatePaymentStatus(booking._id.toString(), 'paid');

      expect(updated.paymentStatus).toBe('paid');
    });
  });

  describe('addRefund', () => {
    it('should add refund amount to booking', async () => {
      const booking = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-13T13:00:00Z'),
        endDateTime: new Date('2025-12-13T14:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Refund Test', email: 'refund@example.com' },
        amount: 15000,
        currency: 'USD',
        paymentStatus: 'paid',
      });

      const refunded = await Booking.addRefund(booking._id.toString(), 7500);

      expect(refunded.refundAmount).toBe(7500);
      expect(refunded.paymentStatus).toBe('refunded');
    });
  });

  describe('findByClient', () => {
    it('should find all bookings for a client', async () => {
      // Create bookings for test client
      await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-14T10:00:00Z'),
        endDateTime: new Date('2025-12-14T11:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Client Test 1', email: 'clienttest1@example.com' },
        amount: 15000,
        currency: 'USD',
      });

      await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-15T11:00:00Z'),
        endDateTime: new Date('2025-12-15T12:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Client Test 2', email: 'clienttest2@example.com' },
        amount: 15000,
        currency: 'USD',
      });

      const bookings = await Booking.findByClient(testClientId.toString());

      expect(bookings).toHaveLength(2);
      expect(bookings[0].clientId).toEqual(testClientId);
    });
  });

  describe('findByStaff', () => {
    it('should find all bookings for a staff member', async () => {
      await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-16T09:00:00Z'),
        endDateTime: new Date('2025-12-16T10:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Staff Test 1', email: 'stafftest1@example.com' },
        amount: 15000,
        currency: 'USD',
      });

      const bookings = await Booking.findByStaff(testStaffId.toString());

      expect(bookings.length).toBeGreaterThan(0);
      expect(bookings[0].staffId).toEqual(testStaffId);
    });
  });

  describe('findByDateRange', () => {
    it('should find bookings within a date range', async () => {
      await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-17T10:00:00Z'),
        endDateTime: new Date('2025-12-17T11:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Range Test', email: 'range@example.com' },
        amount: 15000,
        currency: 'USD',
      });

      const bookings = await Booking.findByDateRange(
        new Date('2025-12-17T00:00:00Z'),
        new Date('2025-12-17T23:59:59Z')
      );

      expect(bookings.length).toBeGreaterThan(0);
      expect(bookings[0].startDateTime.getDate()).toBe(17);
    });
  });

  describe('isSlotAvailable', () => {
    it('should return true when slot is available', async () => {
      const available = await Booking.isSlotAvailable(
        testStaffId.toString(),
        new Date('2025-12-25T10:00:00Z'),
        new Date('2025-12-25T11:00:00Z')
      );

      expect(available).toBe(true);
    });

    it('should return false when slot has conflicting booking', async () => {
      await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-26T10:00:00Z'),
        endDateTime: new Date('2025-12-26T11:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Conflict Test', email: 'conflict@example.com' },
        amount: 15000,
        currency: 'USD',
        status: 'confirmed',
      });

      const available = await Booking.isSlotAvailable(
        testStaffId.toString(),
        new Date('2025-12-26T10:30:00Z'),
        new Date('2025-12-26T11:30:00Z')
      );

      expect(available).toBe(false);
    });
  });

  describe('delete', () => {
    it('should permanently delete a booking', async () => {
      const booking = await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-27T10:00:00Z'),
        endDateTime: new Date('2025-12-27T11:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Delete Test', email: 'delete@example.com' },
        amount: 15000,
        currency: 'USD',
      });

      const deleted = await Booking.delete(booking._id.toString());
      expect(deleted).toBe(true);

      const found = await Booking.findById(booking._id.toString());
      expect(found).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return booking statistics', async () => {
      // Create bookings with different statuses
      await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-28T10:00:00Z'),
        endDateTime: new Date('2025-12-28T11:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Stats Test 1', email: 'stats1@example.com' },
        amount: 15000,
        currency: 'USD',
        status: 'confirmed',
      });

      await Booking.create({
        serviceId: testServiceId.toString(),
        clientId: testClientId.toString(),
        staffId: testStaffId.toString(),
        startDateTime: new Date('2025-12-29T10:00:00Z'),
        endDateTime: new Date('2025-12-29T11:00:00Z'),
        timeZone: 'UTC',
        duration: 60,
        clientInfo: { name: 'Stats Test 2', email: 'stats2@example.com' },
        amount: 15000,
        currency: 'USD',
        status: 'completed',
      });

      const stats = await Booking.getStats();

      expect(stats.total).toBeGreaterThanOrEqual(2);
      expect(stats.byStatus).toBeDefined();
      expect(Array.isArray(stats.byStatus)).toBe(true);
    });
  });
});
