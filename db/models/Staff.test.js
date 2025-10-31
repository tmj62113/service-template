import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Staff } from './Staff.js';
import { Service } from './Service.js';
import { getDatabase } from '../connection.js';
import { ObjectId } from 'mongodb';

describe('Staff Model', () => {
  let db;
  let testStaffId;
  let testServiceId1;
  let testServiceId2;

  beforeAll(async () => {
    db = await getDatabase();

    // Create test services for staff assignments
    const service1 = await Service.create({
      name: 'Executive Coaching',
      description: 'One-on-one executive coaching session',
      category: 'Coaching',
      duration: 60,
      price: 20000,
    });
    testServiceId1 = service1._id;

    const service2 = await Service.create({
      name: 'Team Workshop',
      description: 'Team building workshop',
      category: 'Workshop',
      duration: 120,
      price: 50000,
    });
    testServiceId2 = service2._id;
  });

  beforeEach(async () => {
    // Clean up staff collection before each test
    // Use a more targeted approach to avoid timing issues
    try {
      await db.collection('staff').deleteMany({});
    } catch (error) {
      console.error('Error cleaning up staff collection:', error);
    }
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.collection('staff').deleteMany({});
    await db.collection('services').deleteMany({});
  });

  describe('create', () => {
    it('should create a new staff member with all required fields', async () => {
      const staffData = {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1-555-0100',
        bio: 'Experienced executive coach with 15 years in leadership development',
        photo: 'https://cloudinary.com/photos/sarah.jpg',
        title: 'Senior Executive Coach',
        specialties: ['Leadership', 'Career Development', 'Team Building'],
        serviceIds: [testServiceId1.toString()],
        timeZone: 'America/New_York',
        defaultBookingBuffer: 15,
      };

      const staff = await Staff.create(staffData);

      expect(staff).toBeDefined();
      expect(staff._id).toBeDefined();
      expect(staff.name).toBe(staffData.name);
      expect(staff.email).toBe(staffData.email);
      expect(staff.phone).toBe(staffData.phone);
      expect(staff.bio).toBe(staffData.bio);
      expect(staff.photo).toBe(staffData.photo);
      expect(staff.title).toBe(staffData.title);
      expect(staff.specialties).toEqual(staffData.specialties);
      expect(staff.serviceIds).toHaveLength(1);
      expect(staff.serviceIds[0]).toBeInstanceOf(ObjectId);
      expect(staff.timeZone).toBe(staffData.timeZone);
      expect(staff.defaultBookingBuffer).toBe(15);
      expect(staff.isActive).toBe(true);
      expect(staff.acceptingBookings).toBe(true);
      expect(staff.createdAt).toBeInstanceOf(Date);
      expect(staff.updatedAt).toBeInstanceOf(Date);

      testStaffId = staff._id;
    });

    it('should create staff with default values for optional fields', async () => {
      const staffData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      const staff = await Staff.create(staffData);

      expect(staff.phone).toBeNull();
      expect(staff.bio).toBe('');
      expect(staff.photo).toBeNull();
      expect(staff.title).toBe('');
      expect(staff.specialties).toEqual([]);
      expect(staff.serviceIds).toEqual([]);
      expect(staff.userId).toBeNull();
      expect(staff.isActive).toBe(true);
      expect(staff.acceptingBookings).toBe(true);
      expect(staff.timeZone).toBe('America/New_York');
      expect(staff.defaultBookingBuffer).toBe(15);
    });

    it('should throw error when creating staff with duplicate email', async () => {
      const staffData = {
        name: 'Jane Smith',
        email: 'duplicate@example.com',
      };

      await Staff.create(staffData);

      await expect(Staff.create(staffData)).rejects.toThrow(
        'Staff member with this email already exists'
      );
    });

    it('should create staff with userId reference', async () => {
      const userId = new ObjectId();
      const staffData = {
        name: 'Alice Williams',
        email: 'alice@example.com',
        userId: userId.toString(),
      };

      const staff = await Staff.create(staffData);

      expect(staff.userId).toBeInstanceOf(ObjectId);
      expect(staff.userId.toString()).toBe(userId.toString());
    });

    it('should create staff with custom active status', async () => {
      const staffData = {
        name: 'Inactive Staff',
        email: 'inactive@example.com',
        isActive: false,
        acceptingBookings: false,
      };

      const staff = await Staff.create(staffData);

      expect(staff.isActive).toBe(false);
      expect(staff.acceptingBookings).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find staff by ID', async () => {
      const created = await Staff.create({
        name: 'Find Test',
        email: 'findtest@example.com',
        title: 'Test Coach',
      });

      const found = await Staff.findById(created._id.toString());

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.name).toBe(created.name);
      expect(found.email).toBe(created.email);
    });

    it('should return null for non-existent staff ID', async () => {
      const fakeId = new ObjectId().toString();
      const found = await Staff.findById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find staff by email', async () => {
      const created = await Staff.create({
        name: 'Email Test',
        email: 'emailtest@example.com',
      });

      const found = await Staff.findByEmail('emailtest@example.com');

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.email).toBe('emailtest@example.com');
    });

    it('should return null for non-existent email', async () => {
      const found = await Staff.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find staff by user ID', async () => {
      const userId = new ObjectId();
      const created = await Staff.create({
        name: 'User ID Test',
        email: 'useridtest@example.com',
        userId: userId.toString(),
      });

      const found = await Staff.findByUserId(userId.toString());

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.userId.toString()).toBe(userId.toString());
    });

    it('should return null for non-existent user ID', async () => {
      const fakeUserId = new ObjectId().toString();
      const found = await Staff.findByUserId(fakeUserId);

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create multiple staff members for testing
      await Staff.create({
        name: 'Coach 1',
        email: 'coach1@example.com',
        title: 'Senior Coach',
        isActive: true,
        acceptingBookings: true,
        serviceIds: [testServiceId1.toString()],
      });

      await Staff.create({
        name: 'Coach 2',
        email: 'coach2@example.com',
        title: 'Lead Consultant',
        isActive: true,
        acceptingBookings: false,
      });

      await Staff.create({
        name: 'Coach 3',
        email: 'coach3@example.com',
        title: 'Workshop Facilitator',
        isActive: false,
        acceptingBookings: false,
        serviceIds: [testServiceId2.toString()],
      });
    });

    it('should return all staff with pagination', async () => {
      const result = await Staff.findAll({ page: 1, limit: 10 });

      expect(result.staff).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it('should filter staff by isActive status', async () => {
      const result = await Staff.findAll({ isActive: true });

      expect(result.staff).toHaveLength(2);
      result.staff.forEach((staff) => {
        expect(staff.isActive).toBe(true);
      });
    });

    it('should filter staff by acceptingBookings status', async () => {
      const result = await Staff.findAll({ acceptingBookings: true });

      expect(result.staff).toHaveLength(1);
      expect(result.staff[0].acceptingBookings).toBe(true);
    });

    it('should filter staff by serviceId', async () => {
      const result = await Staff.findAll({ serviceId: testServiceId1.toString() });

      expect(result.staff).toHaveLength(1);
      expect(result.staff[0].name).toBe('Coach 1');
    });

    it('should handle pagination correctly', async () => {
      const page1 = await Staff.findAll({ page: 1, limit: 2 });
      expect(page1.staff).toHaveLength(2);
      expect(page1.pagination.pages).toBe(2);

      const page2 = await Staff.findAll({ page: 2, limit: 2 });
      expect(page2.staff).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update staff member fields', async () => {
      const staff = await Staff.create({
        name: 'Original Name',
        email: 'original@example.com',
        title: 'Original Title',
        bio: 'Original bio',
      });

      const updated = await Staff.update(staff._id.toString(), {
        name: 'Updated Name',
        title: 'Updated Title',
        phone: '+1-555-9999',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.title).toBe('Updated Title');
      expect(updated.phone).toBe('+1-555-9999');
      expect(updated.bio).toBe('Original bio'); // Unchanged
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('should update serviceIds array correctly', async () => {
      const staff = await Staff.create({
        name: 'Service Test',
        email: 'servicetest@example.com',
        serviceIds: [],
      });

      const updated = await Staff.update(staff._id.toString(), {
        serviceIds: [testServiceId1.toString(), testServiceId2.toString()],
      });

      expect(updated.serviceIds).toHaveLength(2);
      expect(updated.serviceIds[0]).toBeInstanceOf(ObjectId);
      expect(updated.serviceIds[1]).toBeInstanceOf(ObjectId);
    });

    it('should update userId correctly', async () => {
      const staff = await Staff.create({
        name: 'User ID Update Test',
        email: 'useridupdate@example.com',
      });

      const userId = new ObjectId();
      const updated = await Staff.update(staff._id.toString(), {
        userId: userId.toString(),
      });

      expect(updated.userId).toBeInstanceOf(ObjectId);
      expect(updated.userId.toString()).toBe(userId.toString());
    });
  });

  describe('deactivate', () => {
    it('should deactivate staff member by setting isActive and acceptingBookings to false', async () => {
      const staff = await Staff.create({
        name: 'To Deactivate',
        email: 'deactivate@example.com',
        isActive: true,
        acceptingBookings: true,
      });

      const deactivated = await Staff.deactivate(staff._id.toString());

      expect(deactivated.isActive).toBe(false);
      expect(deactivated.acceptingBookings).toBe(false);
    });
  });

  describe('delete', () => {
    it('should hard delete staff member from database', async () => {
      const staff = await Staff.create({
        name: 'To Delete',
        email: 'delete@example.com',
      });

      const success = await Staff.delete(staff._id.toString());
      expect(success).toBe(true);

      const found = await Staff.findById(staff._id.toString());
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent staff', async () => {
      const fakeId = new ObjectId().toString();
      const success = await Staff.delete(fakeId);

      expect(success).toBe(false);
    });
  });

  describe('addService', () => {
    it('should add service to staff member', async () => {
      const staff = await Staff.create({
        name: 'Add Service Test',
        email: 'addservice@example.com',
        serviceIds: [],
      });

      const updated = await Staff.addService(
        staff._id.toString(),
        testServiceId1.toString()
      );

      expect(updated.serviceIds).toHaveLength(1);
      expect(updated.serviceIds[0].toString()).toBe(testServiceId1.toString());
    });

    it('should not add duplicate services', async () => {
      const staff = await Staff.create({
        name: 'Duplicate Service Test',
        email: 'duplicateservice@example.com',
        serviceIds: [testServiceId1.toString()],
      });

      await Staff.addService(staff._id.toString(), testServiceId1.toString());
      const updated = await Staff.findById(staff._id.toString());

      expect(updated.serviceIds).toHaveLength(1);
    });

    it('should add multiple different services', async () => {
      const staff = await Staff.create({
        name: 'Multiple Services Test',
        email: 'multipleservices@example.com',
        serviceIds: [],
      });

      await Staff.addService(staff._id.toString(), testServiceId1.toString());
      const updated = await Staff.addService(
        staff._id.toString(),
        testServiceId2.toString()
      );

      expect(updated.serviceIds).toHaveLength(2);
    });
  });

  describe('removeService', () => {
    it('should remove service from staff member', async () => {
      const staff = await Staff.create({
        name: 'Remove Service Test',
        email: 'removeservice@example.com',
        serviceIds: [testServiceId1.toString(), testServiceId2.toString()],
      });

      const updated = await Staff.removeService(
        staff._id.toString(),
        testServiceId1.toString()
      );

      expect(updated.serviceIds).toHaveLength(1);
      expect(updated.serviceIds[0].toString()).toBe(testServiceId2.toString());
    });

    it('should handle removing non-existent service gracefully', async () => {
      const staff = await Staff.create({
        name: 'Remove Non-existent Service Test',
        email: 'removenonexistent@example.com',
        serviceIds: [testServiceId1.toString()],
      });

      const fakeServiceId = new ObjectId().toString();
      const updated = await Staff.removeService(staff._id.toString(), fakeServiceId);

      expect(updated.serviceIds).toHaveLength(1);
      expect(updated.serviceIds[0].toString()).toBe(testServiceId1.toString());
    });
  });

  describe('setAcceptingBookings', () => {
    it('should set acceptingBookings to true', async () => {
      const staff = await Staff.create({
        name: 'Accepting Bookings Test',
        email: 'acceptingbookings@example.com',
        acceptingBookings: false,
      });

      const updated = await Staff.setAcceptingBookings(staff._id.toString(), true);

      expect(updated.acceptingBookings).toBe(true);
    });

    it('should set acceptingBookings to false', async () => {
      const staff = await Staff.create({
        name: 'Not Accepting Bookings Test',
        email: 'notacceptingbookings@example.com',
        acceptingBookings: true,
      });

      const updated = await Staff.setAcceptingBookings(staff._id.toString(), false);

      expect(updated.acceptingBookings).toBe(false);
    });
  });

  describe('findByService', () => {
    beforeEach(async () => {
      await Staff.create({
        name: 'Coach A',
        email: 'coacha@example.com',
        serviceIds: [testServiceId1.toString()],
        isActive: true,
        acceptingBookings: true,
      });

      await Staff.create({
        name: 'Coach B',
        email: 'coachb@example.com',
        serviceIds: [testServiceId1.toString(), testServiceId2.toString()],
        isActive: true,
        acceptingBookings: true,
      });

      await Staff.create({
        name: 'Coach C',
        email: 'coachc@example.com',
        serviceIds: [testServiceId2.toString()],
        isActive: true,
        acceptingBookings: false, // Not accepting bookings
      });

      await Staff.create({
        name: 'Coach D',
        email: 'coachd@example.com',
        serviceIds: [testServiceId1.toString()],
        isActive: false, // Inactive
        acceptingBookings: true,
      });
    });

    it('should return only active staff accepting bookings who can provide the service', async () => {
      const staff = await Staff.findByService(testServiceId1.toString());

      expect(staff).toHaveLength(2);
      expect(staff[0].name).toBe('Coach A'); // Sorted by name
      expect(staff[1].name).toBe('Coach B');

      staff.forEach((member) => {
        expect(member.isActive).toBe(true);
        expect(member.acceptingBookings).toBe(true);
      });
    });

    it('should return staff sorted by name', async () => {
      const staff = await Staff.findByService(testServiceId1.toString());

      expect(staff[0].name).toBe('Coach A');
      expect(staff[1].name).toBe('Coach B');
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await Staff.create({
        name: 'Dr. Emily Watson',
        email: 'emily@example.com',
        title: 'Executive Leadership Coach',
        bio: 'Specializes in transformational leadership',
        specialties: ['Leadership', 'Executive Coaching', 'Team Building'],
        isActive: true,
      });

      await Staff.create({
        name: 'Michael Chang',
        email: 'michael@example.com',
        title: 'Career Development Specialist',
        bio: 'Expert in career transitions and development',
        specialties: ['Career Coaching', 'Resume Building'],
        isActive: true,
      });

      await Staff.create({
        name: 'Sarah Thompson',
        email: 'sarah@example.com',
        title: 'Wellness Coach',
        bio: 'Focuses on holistic wellness and mindfulness',
        specialties: ['Wellness', 'Mindfulness', 'Stress Management'],
        isActive: false, // Inactive - should not appear in search
      });
    });

    it('should search staff by name', async () => {
      const results = await Staff.search('Emily');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Dr. Emily Watson');
    });

    it('should search staff by title', async () => {
      const results = await Staff.search('Career Development');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Michael Chang');
    });

    it('should search staff by bio', async () => {
      const results = await Staff.search('transformational');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Dr. Emily Watson');
    });

    it('should search staff by specialties', async () => {
      const results = await Staff.search('Leadership');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Dr. Emily Watson');
    });

    it('should be case-insensitive', async () => {
      const results = await Staff.search('EMILY');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Dr. Emily Watson');
    });

    it('should only return active staff', async () => {
      const results = await Staff.search('Coach');

      // Should not return Sarah Thompson (inactive)
      expect(results).toHaveLength(2);
      const names = results.map((s) => s.name);
      expect(names).toContain('Dr. Emily Watson');
      expect(names).toContain('Michael Chang');
      expect(names).not.toContain('Sarah Thompson');
    });

    it('should return multiple results for broad search', async () => {
      const results = await Staff.search('Coach');

      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      await Staff.create({
        name: 'Active Staff 1',
        email: 'active1@example.com',
        isActive: true,
        acceptingBookings: true,
      });

      await Staff.create({
        name: 'Active Staff 2',
        email: 'active2@example.com',
        isActive: true,
        acceptingBookings: true,
      });

      await Staff.create({
        name: 'Active Not Accepting',
        email: 'activenotaccepting@example.com',
        isActive: true,
        acceptingBookings: false,
      });

      await Staff.create({
        name: 'Inactive Staff',
        email: 'inactive@example.com',
        isActive: false,
        acceptingBookings: false,
      });
    });

    it('should return correct staff statistics', async () => {
      const stats = await Staff.getStats();

      expect(stats.totalStaff).toBe(3); // Only active staff
      expect(stats.activeStaff).toBe(2); // Active and accepting bookings
      expect(stats.inactiveStaff).toBe(1); // Inactive
      expect(stats.notAcceptingBookings).toBe(1); // Active but not accepting bookings
    });

    it('should handle empty collection', async () => {
      await db.collection('staff').deleteMany({});

      const stats = await Staff.getStats();

      expect(stats.totalStaff).toBe(0);
      expect(stats.activeStaff).toBe(0);
      expect(stats.inactiveStaff).toBe(0);
      expect(stats.notAcceptingBookings).toBe(0);
    });
  });
});
