import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Availability } from './Availability.js';
import { Staff } from './Staff.js';
import { getDatabase } from '../connection.js';
import { ObjectId } from 'mongodb';

describe('Availability Model', () => {
  let db;
  let testStaffId;
  let testAvailabilityId;

  beforeAll(async () => {
    db = await getDatabase();

    // Create test staff member
    const staff = await Staff.create({
      name: 'Test Staff',
      email: 'testavailability@example.com',
      phone: '+1-555-0150',
      bio: 'Test staff for availability tests',
      title: 'Test Coach',
      specialties: ['Testing'],
      timeZone: 'America/New_York',
    });
    testStaffId = staff._id;
  });

  beforeEach(async () => {
    // Clean up availability collection before each test
    await db.collection('availability').deleteMany({});
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.collection('availability').deleteMany({});
    await db.collection('staff').deleteMany({ email: 'testavailability@example.com' });
  });

  describe('create', () => {
    it('should create a new availability schedule with all required fields', async () => {
      const availabilityData = {
        staffId: testStaffId.toString(),
        schedule: [
          {
            dayOfWeek: 1, // Monday
            timeSlots: [
              { startTime: '09:00', endTime: '17:00' }
            ]
          },
          {
            dayOfWeek: 2, // Tuesday
            timeSlots: [
              { startTime: '09:00', endTime: '12:00' },
              { startTime: '13:00', endTime: '17:00' }
            ]
          }
        ],
        exceptions: [],
        overrides: [],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      };

      const availability = await Availability.create(availabilityData);

      expect(availability).toBeDefined();
      expect(availability._id).toBeDefined();
      expect(availability.staffId).toEqual(testStaffId);
      expect(availability.schedule).toHaveLength(2);
      expect(availability.schedule[0].dayOfWeek).toBe(1);
      expect(availability.schedule[0].timeSlots).toHaveLength(1);
      expect(availability.schedule[1].timeSlots).toHaveLength(2);
      expect(availability.exceptions).toEqual([]);
      expect(availability.overrides).toEqual([]);
      expect(availability.effectiveFrom).toBeInstanceOf(Date);
      expect(availability.effectiveTo).toBeNull();
      expect(availability.createdAt).toBeInstanceOf(Date);
      expect(availability.updatedAt).toBeInstanceOf(Date);

      testAvailabilityId = availability._id;
    });

    it('should create availability with default values for optional fields', async () => {
      const availabilityData = {
        staffId: testStaffId.toString(),
      };

      const availability = await Availability.create(availabilityData);

      expect(availability.schedule).toEqual([]);
      expect(availability.exceptions).toEqual([]);
      expect(availability.overrides).toEqual([]);
      expect(availability.effectiveFrom).toBeInstanceOf(Date);
      expect(availability.effectiveTo).toBeNull();
    });

    it('should create availability with complex weekly schedule', async () => {
      const availabilityData = {
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] },
          { dayOfWeek: 2, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] },
          { dayOfWeek: 3, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] },
          { dayOfWeek: 4, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] },
          { dayOfWeek: 5, timeSlots: [{ startTime: '09:00', endTime: '15:00' }] }
        ]
      };

      const availability = await Availability.create(availabilityData);

      expect(availability.schedule).toHaveLength(5);
      expect(availability.schedule[4].dayOfWeek).toBe(5); // Friday
      expect(availability.schedule[4].timeSlots[0].endTime).toBe('15:00');
    });
  });

  describe('findById', () => {
    it('should find availability by ID', async () => {
      const created = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }
        ]
      });

      const found = await Availability.findById(created._id.toString());

      expect(found).toBeDefined();
      expect(found._id).toEqual(created._id);
      expect(found.staffId).toEqual(testStaffId);
    });

    it('should return null for non-existent availability ID', async () => {
      const fakeId = new ObjectId().toString();
      const found = await Availability.findById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe('findByStaff', () => {
    it('should find current availability for a staff member', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }
        ],
        effectiveFrom: yesterday,
        effectiveTo: null
      });

      const found = await Availability.findByStaff(testStaffId.toString());

      expect(found).toBeDefined();
      expect(found.staffId).toEqual(testStaffId);
    });

    it('should return null if no current availability exists', async () => {
      const futureDate = new Date('2026-01-01');

      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [],
        effectiveFrom: futureDate,
        effectiveTo: null
      });

      const found = await Availability.findByStaff(testStaffId.toString());

      expect(found).toBeNull();
    });

    it('should not return expired availability', async () => {
      const pastStart = new Date('2024-01-01');
      const pastEnd = new Date('2024-12-31');

      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }
        ],
        effectiveFrom: pastStart,
        effectiveTo: pastEnd
      });

      const found = await Availability.findByStaff(testStaffId.toString());

      expect(found).toBeNull();
    });
  });

  describe('findAllByStaff', () => {
    it('should find all availability schedules for a staff member', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [{ dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [{ dayOfWeek: 1, timeSlots: [{ startTime: '10:00', endTime: '18:00' }] }],
        effectiveFrom: new Date('2025-06-01'),
        effectiveTo: null
      });

      const schedules = await Availability.findAllByStaff(testStaffId.toString());

      expect(schedules).toHaveLength(2);
      expect(schedules[0].staffId).toEqual(testStaffId);
    });

    it('should return schedules sorted by effectiveFrom date descending', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [],
        effectiveFrom: new Date('2025-01-01')
      });

      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [],
        effectiveFrom: new Date('2025-06-01')
      });

      const schedules = await Availability.findAllByStaff(testStaffId.toString());

      expect(schedules[0].effectiveFrom.getTime()).toBeGreaterThan(
        schedules[1].effectiveFrom.getTime()
      );
    });
  });

  describe('update', () => {
    it('should update availability fields', async () => {
      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [{ dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }]
      });

      const newSchedule = [
        { dayOfWeek: 1, timeSlots: [{ startTime: '10:00', endTime: '18:00' }] }
      ];

      const updated = await Availability.update(availability._id.toString(), {
        schedule: newSchedule
      });

      expect(updated.schedule[0].timeSlots[0].startTime).toBe('10:00');
      expect(updated.schedule[0].timeSlots[0].endTime).toBe('18:00');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(availability.updatedAt.getTime());
    });
  });

  describe('updateSchedule', () => {
    it('should update the regular weekly schedule', async () => {
      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [{ dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }]
      });

      const newSchedule = [
        { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] },
        { dayOfWeek: 3, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] },
        { dayOfWeek: 5, timeSlots: [{ startTime: '09:00', endTime: '15:00' }] }
      ];

      const updated = await Availability.updateSchedule(availability._id.toString(), newSchedule);

      expect(updated.schedule).toHaveLength(3);
      expect(updated.schedule[2].dayOfWeek).toBe(5);
    });
  });

  describe('addException', () => {
    it('should add an unavailable exception (time off)', async () => {
      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [{ dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }]
      });

      const exception = {
        date: new Date('2025-12-25'),
        type: 'unavailable',
        reason: 'Christmas Holiday'
      };

      const updated = await Availability.addException(availability._id.toString(), exception);

      expect(updated.exceptions).toHaveLength(1);
      expect(updated.exceptions[0].type).toBe('unavailable');
      expect(updated.exceptions[0].reason).toBe('Christmas Holiday');
      expect(updated.exceptions[0].date).toBeInstanceOf(Date);
    });

    it('should add a custom_hours exception', async () => {
      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [{ dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }]
      });

      const exception = {
        date: new Date('2025-11-28'),
        type: 'custom_hours',
        timeSlots: [{ startTime: '09:00', endTime: '12:00' }],
        reason: 'Half day - Thanksgiving'
      };

      const updated = await Availability.addException(availability._id.toString(), exception);

      expect(updated.exceptions).toHaveLength(1);
      expect(updated.exceptions[0].type).toBe('custom_hours');
      expect(updated.exceptions[0].timeSlots).toHaveLength(1);
      expect(updated.exceptions[0].timeSlots[0].endTime).toBe('12:00');
    });

    it('should add multiple exceptions', async () => {
      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [{ dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }]
      });

      await Availability.addException(availability._id.toString(), {
        date: new Date('2025-12-25'),
        type: 'unavailable',
        reason: 'Christmas'
      });

      const updated = await Availability.addException(availability._id.toString(), {
        date: new Date('2025-12-26'),
        type: 'unavailable',
        reason: 'Boxing Day'
      });

      expect(updated.exceptions).toHaveLength(2);
    });
  });

  describe('removeException', () => {
    it('should remove an exception by date', async () => {
      const exceptionDate = new Date('2025-12-25');

      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [{ dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }],
        exceptions: [
          { date: exceptionDate, type: 'unavailable', reason: 'Holiday' }
        ]
      });

      expect(availability.exceptions).toHaveLength(1);

      const updated = await Availability.removeException(
        availability._id.toString(),
        exceptionDate
      );

      expect(updated.exceptions).toHaveLength(0);
    });
  });

  describe('addOverride', () => {
    it('should add a one-time availability override', async () => {
      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [] // No regular schedule
      });

      const override = {
        date: new Date('2025-12-15'),
        timeSlots: [
          { startTime: '14:00', endTime: '18:00' }
        ]
      };

      const updated = await Availability.addOverride(availability._id.toString(), override);

      expect(updated.overrides).toHaveLength(1);
      expect(updated.overrides[0].date).toBeInstanceOf(Date);
      expect(updated.overrides[0].timeSlots).toHaveLength(1);
      expect(updated.overrides[0].timeSlots[0].startTime).toBe('14:00');
    });

    it('should add multiple overrides', async () => {
      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: []
      });

      await Availability.addOverride(availability._id.toString(), {
        date: new Date('2025-12-15'),
        timeSlots: [{ startTime: '14:00', endTime: '18:00' }]
      });

      const updated = await Availability.addOverride(availability._id.toString(), {
        date: new Date('2025-12-22'),
        timeSlots: [{ startTime: '09:00', endTime: '13:00' }]
      });

      expect(updated.overrides).toHaveLength(2);
    });
  });

  describe('removeOverride', () => {
    it('should remove an override by date', async () => {
      const overrideDate = new Date('2025-12-15');

      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [],
        overrides: [
          { date: overrideDate, timeSlots: [{ startTime: '14:00', endTime: '18:00' }] }
        ]
      });

      expect(availability.overrides).toHaveLength(1);

      const updated = await Availability.removeOverride(
        availability._id.toString(),
        overrideDate
      );

      expect(updated.overrides).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should permanently delete availability from database', async () => {
      const availability = await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [{ dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }]
      });

      const deleted = await Availability.delete(availability._id.toString());
      expect(deleted).toBe(true);

      const found = await Availability.findById(availability._id.toString());
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent availability', async () => {
      const fakeId = new ObjectId().toString();
      const deleted = await Availability.delete(fakeId);

      expect(deleted).toBe(false);
    });
  });

  describe('getAvailabilityForDate', () => {
    it('should return regular schedule for a weekday', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] },
          { dayOfWeek: 2, timeSlots: [{ startTime: '10:00', endTime: '18:00' }] }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // Use a known future Monday: December 1, 2025
      const monday = new Date(2025, 11, 1); // Month is 0-indexed, so 11 = December

      const result = await Availability.getAvailabilityForDate(testStaffId.toString(), monday);

      expect(result).toBeDefined();
      expect(result.available).toBe(true);
      expect(result.timeSlots).toHaveLength(1);
      expect(result.timeSlots[0].startTime).toBe('09:00');
      expect(result.timeSlots[0].endTime).toBe('17:00');
    });

    it('should return unavailable for days not in schedule', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] } // Monday only
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // Use a known future Saturday: December 6, 2025
      const saturday = new Date(2025, 11, 6); // Month is 0-indexed, so 11 = December

      const result = await Availability.getAvailabilityForDate(testStaffId.toString(), saturday);

      expect(result).toBeDefined();
      expect(result.available).toBe(false);
      expect(result.reason).toBe('Not scheduled to work');
      expect(result.timeSlots).toEqual([]);
    });

    it('should prioritize exception over regular schedule (unavailable)', async () => {
      const exceptionDate = new Date('2025-12-01'); // Monday

      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }
        ],
        exceptions: [
          { date: exceptionDate, type: 'unavailable', reason: 'Personal day' }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      const result = await Availability.getAvailabilityForDate(testStaffId.toString(), exceptionDate);

      expect(result.available).toBe(false);
      expect(result.reason).toBe('Personal day');
      expect(result.timeSlots).toEqual([]);
    });

    it('should prioritize exception over regular schedule (custom hours)', async () => {
      const exceptionDate = new Date('2025-12-01'); // Monday

      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }
        ],
        exceptions: [
          {
            date: exceptionDate,
            type: 'custom_hours',
            timeSlots: [{ startTime: '09:00', endTime: '12:00' }],
            reason: 'Half day'
          }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      const result = await Availability.getAvailabilityForDate(testStaffId.toString(), exceptionDate);

      expect(result.available).toBe(true);
      expect(result.timeSlots).toHaveLength(1);
      expect(result.timeSlots[0].endTime).toBe('12:00');
    });

    it('should prioritize override over regular schedule', async () => {
      const overrideDate = new Date('2025-12-06'); // Saturday (normally not working)

      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] } // Monday only
        ],
        overrides: [
          {
            date: overrideDate,
            timeSlots: [{ startTime: '10:00', endTime: '14:00' }]
          }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      const result = await Availability.getAvailabilityForDate(testStaffId.toString(), overrideDate);

      expect(result.available).toBe(true);
      expect(result.timeSlots).toHaveLength(1);
      expect(result.timeSlots[0].startTime).toBe('10:00');
      expect(result.timeSlots[0].endTime).toBe('14:00');
    });

    it('should return null if no availability schedule exists', async () => {
      const randomStaffId = new ObjectId().toString();
      const result = await Availability.getAvailabilityForDate(randomStaffId, new Date());

      expect(result).toBeNull();
    });
  });

  describe('isAvailableAtTime', () => {
    it('should return true if staff is available at requested time', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // December 1, 2025 at 2 PM - 3 PM
      const startTime = new Date(2025, 11, 1, 14, 0, 0);
      const endTime = new Date(2025, 11, 1, 15, 0, 0);

      const available = await Availability.isAvailableAtTime(
        testStaffId.toString(),
        startTime,
        endTime
      );

      expect(available).toBe(true);
    });

    it('should return false if time is outside available slots', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // December 1, 2025 at 6 PM - 7 PM (outside 9-5 schedule)
      const startTime = new Date(2025, 11, 1, 18, 0, 0);
      const endTime = new Date(2025, 11, 1, 19, 0, 0);

      const available = await Availability.isAvailableAtTime(
        testStaffId.toString(),
        startTime,
        endTime
      );

      expect(available).toBe(false);
    });

    it('should return false if staff is not working that day', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] } // Monday only
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // December 6, 2025 (Saturday) at 10 AM - 11 AM
      const startTime = new Date(2025, 11, 6, 10, 0, 0);
      const endTime = new Date(2025, 11, 6, 11, 0, 0);

      const available = await Availability.isAvailableAtTime(
        testStaffId.toString(),
        startTime,
        endTime
      );

      expect(available).toBe(false);
    });

    it('should handle time spanning across two slots', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          {
            dayOfWeek: 1,
            timeSlots: [
              { startTime: '09:00', endTime: '12:00' },
              { startTime: '13:00', endTime: '17:00' }
            ]
          }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // December 1, 2025 is a Monday, requesting time that spans lunch break
      const startTime = new Date('2025-12-01T11:30:00Z');
      const endTime = new Date('2025-12-01T13:30:00Z');

      const available = await Availability.isAvailableAtTime(
        testStaffId.toString(),
        startTime,
        endTime
      );

      // Should be false because it spans the lunch break gap
      expect(available).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
    it('should generate available time slots for a service duration', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '12:00' }] }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // December 1, 2025 (Monday)
      const monday = new Date(2025, 11, 1);
      const duration = 60; // 1 hour service
      const bufferTime = 0;

      const slots = await Availability.getAvailableSlots(
        testStaffId.toString(),
        monday,
        duration,
        bufferTime
      );

      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0].startTime).toBe('09:00');
      expect(slots[0].endTime).toBe('10:00');
      // Should have slots: 09:00-10:00, 09:15-10:15, 09:30-10:30, 09:45-10:45, 10:00-11:00, 10:15-11:15, 10:30-11:30, 10:45-11:45, 11:00-12:00
      expect(slots.length).toBe(9);
    });

    it('should account for buffer time when generating slots', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '12:00' }] }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // December 1, 2025 (Monday)
      const monday = new Date(2025, 11, 1);
      const duration = 60; // 1 hour service
      const bufferTime = 15; // 15 minute buffer

      const slots = await Availability.getAvailableSlots(
        testStaffId.toString(),
        monday,
        duration,
        bufferTime
      );

      // With 75 minutes total (60 + 15 buffer), fewer slots should fit
      expect(slots.length).toBeLessThan(9);
      expect(slots.length).toBeGreaterThan(0);
    });

    it('should return empty array if no availability', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] } // Monday only
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // December 6, 2025 (Saturday)
      const saturday = new Date(2025, 11, 6);
      const slots = await Availability.getAvailableSlots(testStaffId.toString(), saturday, 60);

      expect(slots).toEqual([]);
    });

    it('should handle multiple time slots in a day', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          {
            dayOfWeek: 1,
            timeSlots: [
              { startTime: '09:00', endTime: '12:00' },
              { startTime: '14:00', endTime: '17:00' }
            ]
          }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // December 1, 2025 (Monday)
      const monday = new Date(2025, 11, 1);
      const slots = await Availability.getAvailableSlots(testStaffId.toString(), monday, 60);

      // Should have slots in both morning and afternoon
      expect(slots.length).toBeGreaterThan(10);

      const morningSlots = slots.filter(s => s.startTime < '12:00');
      const afternoonSlots = slots.filter(s => s.startTime >= '14:00');

      expect(morningSlots.length).toBeGreaterThan(0);
      expect(afternoonSlots.length).toBeGreaterThan(0);
    });

    it('should not generate slots if service is too long for available time', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '10:00' }] }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      const date = new Date('2025-12-01');
      const duration = 120; // 2 hour service, but only 1 hour available

      const slots = await Availability.getAvailableSlots(testStaffId.toString(), date, duration);

      expect(slots).toEqual([]);
    });

    it('should generate slots in 15-minute intervals', async () => {
      await Availability.create({
        staffId: testStaffId.toString(),
        schedule: [
          { dayOfWeek: 1, timeSlots: [{ startTime: '10:00', endTime: '11:00' }] }
        ],
        effectiveFrom: new Date('2025-01-01'),
        effectiveTo: null
      });

      // December 1, 2025 (Monday)
      const monday = new Date(2025, 11, 1);
      const duration = 30; // 30 minute service

      const slots = await Availability.getAvailableSlots(testStaffId.toString(), monday, duration);

      // Should have: 10:00-10:30, 10:15-10:45, 10:30-11:00
      expect(slots).toHaveLength(3);
      expect(slots[0].startTime).toBe('10:00');
      expect(slots[1].startTime).toBe('10:15');
      expect(slots[2].startTime).toBe('10:30');
    });
  });
});
