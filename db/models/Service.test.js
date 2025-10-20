import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Service } from './Service.js';
import { getDatabase } from '../connection.js';
import { ObjectId } from 'mongodb';

describe('Service Model', () => {
  let db;
  let testServiceId;

  beforeAll(async () => {
    db = await getDatabase();
  });

  beforeEach(async () => {
    // Clean up services collection before each test
    await db.collection('services').deleteMany({});
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.collection('services').deleteMany({});
  });

  describe('create', () => {
    it('should create a new service with all required fields', async () => {
      const serviceData = {
        name: '60-Minute Coaching Session',
        description: 'One-on-one coaching session',
        category: '1-on-1',
        duration: 60,
        price: 15000, // $150.00 in cents
        image: 'https://example.com/image.jpg',
        staffIds: [new ObjectId().toString()],
        bufferTime: 15,
        maxAdvanceBooking: 30,
        cancellationPolicy: {
          hoursBeforeStart: 24,
          refundPercentage: 100
        }
      };

      const service = await Service.create(serviceData);

      expect(service).toBeDefined();
      expect(service._id).toBeDefined();
      expect(service.name).toBe(serviceData.name);
      expect(service.description).toBe(serviceData.description);
      expect(service.category).toBe(serviceData.category);
      expect(service.duration).toBe(serviceData.duration);
      expect(service.price).toBe(serviceData.price);
      expect(service.image).toBe(serviceData.image);
      expect(service.bufferTime).toBe(serviceData.bufferTime);
      expect(service.maxAdvanceBooking).toBe(serviceData.maxAdvanceBooking);
      expect(service.isActive).toBe(true);
      expect(service.createdAt).toBeInstanceOf(Date);
      expect(service.updatedAt).toBeInstanceOf(Date);

      testServiceId = service._id;
    });

    it('should create a service with default values for optional fields', async () => {
      const serviceData = {
        name: 'Basic Consultation',
        description: 'Basic consultation service',
        category: 'Consultation',
        duration: 30,
        price: 5000
      };

      const service = await Service.create(serviceData);

      expect(service.bufferTime).toBe(0);
      expect(service.maxAdvanceBooking).toBe(60);
      expect(service.isActive).toBe(true);
      expect(service.staffIds).toEqual([]);
      expect(service.cancellationPolicy.hoursBeforeStart).toBe(24);
      expect(service.cancellationPolicy.refundPercentage).toBe(100);
    });
  });

  describe('findById', () => {
    it('should find a service by ID', async () => {
      const created = await Service.create({
        name: 'Test Service',
        description: 'Test description',
        category: 'Test',
        duration: 60,
        price: 10000
      });

      const found = await Service.findById(created._id.toString());

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.name).toBe(created.name);
    });

    it('should return null for non-existent service ID', async () => {
      const fakeId = new ObjectId().toString();
      const found = await Service.findById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create multiple services for testing
      await Service.create({
        name: 'Service 1',
        description: 'Description 1',
        category: 'Coaching',
        duration: 60,
        price: 10000,
        isActive: true
      });

      await Service.create({
        name: 'Service 2',
        description: 'Description 2',
        category: 'Consulting',
        duration: 90,
        price: 15000,
        isActive: true
      });

      await Service.create({
        name: 'Service 3',
        description: 'Description 3',
        category: 'Coaching',
        duration: 30,
        price: 5000,
        isActive: false
      });
    });

    it('should return all services with pagination', async () => {
      const result = await Service.findAll({ page: 1, limit: 10 });

      expect(result.services).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it('should filter services by category', async () => {
      const result = await Service.findAll({ category: 'Coaching' });

      expect(result.services).toHaveLength(2);
      result.services.forEach(service => {
        expect(service.category).toBe('Coaching');
      });
    });

    it('should filter services by isActive status', async () => {
      const result = await Service.findAll({ isActive: true });

      expect(result.services).toHaveLength(2);
      result.services.forEach(service => {
        expect(service.isActive).toBe(true);
      });
    });

    it('should handle pagination correctly', async () => {
      const page1 = await Service.findAll({ page: 1, limit: 2 });
      expect(page1.services).toHaveLength(2);
      expect(page1.pagination.pages).toBe(2);

      const page2 = await Service.findAll({ page: 2, limit: 2 });
      expect(page2.services).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a service', async () => {
      const service = await Service.create({
        name: 'Original Name',
        description: 'Original description',
        category: 'Original',
        duration: 60,
        price: 10000
      });

      const updated = await Service.update(service._id.toString(), {
        name: 'Updated Name',
        price: 12000
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.price).toBe(12000);
      expect(updated.description).toBe('Original description'); // Unchanged
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('should update staffIds array correctly', async () => {
      const service = await Service.create({
        name: 'Test Service',
        description: 'Test',
        category: 'Test',
        duration: 60,
        price: 10000,
        staffIds: []
      });

      const staffId1 = new ObjectId().toString();
      const staffId2 = new ObjectId().toString();

      const updated = await Service.update(service._id.toString(), {
        staffIds: [staffId1, staffId2]
      });

      expect(updated.staffIds).toHaveLength(2);
      expect(updated.staffIds[0]).toBeInstanceOf(ObjectId);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a service by setting isActive to false', async () => {
      const service = await Service.create({
        name: 'To Delete',
        description: 'Test',
        category: 'Test',
        duration: 60,
        price: 10000,
        isActive: true
      });

      const deleted = await Service.softDelete(service._id.toString());

      expect(deleted.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should hard delete a service from database', async () => {
      const service = await Service.create({
        name: 'To Delete',
        description: 'Test',
        category: 'Test',
        duration: 60,
        price: 10000
      });

      const success = await Service.delete(service._id.toString());
      expect(success).toBe(true);

      const found = await Service.findById(service._id.toString());
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent service', async () => {
      const fakeId = new ObjectId().toString();
      const success = await Service.delete(fakeId);

      expect(success).toBe(false);
    });
  });

  describe('findByCategory', () => {
    beforeEach(async () => {
      await Service.create({
        name: 'Coaching 1',
        description: 'Test',
        category: 'Coaching',
        duration: 60,
        price: 10000,
        isActive: true
      });

      await Service.create({
        name: 'Coaching 2',
        description: 'Test',
        category: 'Coaching',
        duration: 90,
        price: 15000,
        isActive: true
      });

      await Service.create({
        name: 'Consulting',
        description: 'Test',
        category: 'Consulting',
        duration: 60,
        price: 10000,
        isActive: true
      });
    });

    it('should return all services in a category', async () => {
      const services = await Service.findByCategory('Coaching');

      expect(services).toHaveLength(2);
      services.forEach(service => {
        expect(service.category).toBe('Coaching');
        expect(service.isActive).toBe(true);
      });
    });
  });

  describe('getCategories', () => {
    beforeEach(async () => {
      await Service.create({
        name: 'Service 1',
        description: 'Test',
        category: 'Coaching',
        duration: 60,
        price: 10000,
        isActive: true
      });

      await Service.create({
        name: 'Service 2',
        description: 'Test',
        category: 'Consulting',
        duration: 60,
        price: 10000,
        isActive: true
      });

      await Service.create({
        name: 'Service 3',
        description: 'Test',
        category: 'Coaching',
        duration: 60,
        price: 10000,
        isActive: true
      });
    });

    it('should return unique categories', async () => {
      const categories = await Service.getCategories();

      expect(categories).toHaveLength(2);
      expect(categories).toContain('Coaching');
      expect(categories).toContain('Consulting');
    });
  });

  describe('addStaff and removeStaff', () => {
    it('should add a staff member to a service', async () => {
      const service = await Service.create({
        name: 'Test Service',
        description: 'Test',
        category: 'Test',
        duration: 60,
        price: 10000,
        staffIds: []
      });

      const staffId = new ObjectId().toString();
      const updated = await Service.addStaff(service._id.toString(), staffId);

      expect(updated.staffIds).toHaveLength(1);
      expect(updated.staffIds[0].toString()).toBe(staffId);
    });

    it('should not add duplicate staff members', async () => {
      const staffId = new ObjectId().toString();
      const service = await Service.create({
        name: 'Test Service',
        description: 'Test',
        category: 'Test',
        duration: 60,
        price: 10000,
        staffIds: [staffId]
      });

      await Service.addStaff(service._id.toString(), staffId);
      const updated = await Service.findById(service._id.toString());

      expect(updated.staffIds).toHaveLength(1);
    });

    it('should remove a staff member from a service', async () => {
      const staffId1 = new ObjectId().toString();
      const staffId2 = new ObjectId().toString();

      const service = await Service.create({
        name: 'Test Service',
        description: 'Test',
        category: 'Test',
        duration: 60,
        price: 10000,
        staffIds: [staffId1, staffId2]
      });

      const updated = await Service.removeStaff(service._id.toString(), staffId1);

      expect(updated.staffIds).toHaveLength(1);
      expect(updated.staffIds[0].toString()).toBe(staffId2);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await Service.create({
        name: 'Executive Coaching',
        description: 'One-on-one executive coaching',
        category: 'Coaching',
        duration: 60,
        price: 20000,
        isActive: true
      });

      await Service.create({
        name: 'Team Workshop',
        description: 'Group workshop for teams',
        category: 'Workshop',
        duration: 120,
        price: 50000,
        isActive: true
      });
    });

    it('should search services by name', async () => {
      const results = await Service.search('Executive');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Executive Coaching');
    });

    it('should search services by description', async () => {
      const results = await Service.search('workshop');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Team Workshop');
    });

    it('should be case-insensitive', async () => {
      const results = await Service.search('EXECUTIVE');

      expect(results).toHaveLength(1);
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      await Service.create({
        name: 'Coaching 1',
        description: 'Test',
        category: 'Coaching',
        duration: 60,
        price: 10000,
        isActive: true
      });

      await Service.create({
        name: 'Coaching 2',
        description: 'Test',
        category: 'Coaching',
        duration: 90,
        price: 15000,
        isActive: true
      });

      await Service.create({
        name: 'Consulting',
        description: 'Test',
        category: 'Consulting',
        duration: 60,
        price: 20000,
        isActive: true
      });
    });

    it('should return service statistics', async () => {
      const stats = await Service.getStats();

      expect(stats.totalServices).toBe(3);
      expect(stats.byCategory).toHaveLength(2);

      const coachingStats = stats.byCategory.find(s => s._id === 'Coaching');
      expect(coachingStats.count).toBe(2);
      expect(coachingStats.avgPrice).toBe(12500);
      expect(coachingStats.avgDuration).toBe(75);
    });
  });
});
