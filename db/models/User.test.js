import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { User } from './User.js';
import { Staff } from './Staff.js';
import { getDatabase } from '../connection.js';
import { ObjectId } from 'mongodb';

describe('User Model', () => {
  let db;
  let testUserId;
  let testStaffId;

  beforeAll(async () => {
    db = await getDatabase();

    // Create test staff for preferred staff testing
    const staff = await Staff.create({
      name: 'Test Preferred Coach',
      email: 'preferredcoach@example.com',
      phone: '+1-555-0150',
      bio: 'Preferred coach for testing',
      title: 'Senior Coach',
      specialties: ['Life Coaching'],
      timeZone: 'America/New_York',
    });
    testStaffId = staff._id;
  });

  beforeEach(async () => {
    // Clean up users collection before each test
    await db.collection('users').deleteMany({
      email: { $regex: /@test\.com$/ }
    });
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.collection('users').deleteMany({
      email: { $regex: /@test\.com$/ }
    });
    await db.collection('staff').deleteMany({ email: 'preferredcoach@example.com' });
  });

  describe('create', () => {
    it('should create a new user with all required fields', async () => {
      const userData = {
        email: 'john.doe@test.com',
        password: 'SecurePass123!',
        name: 'John Doe',
        role: 'client',
        phone: '+1-555-0100',
        timeZone: 'America/New_York'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user._id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe('client');
      expect(user.phone).toBe(userData.phone);
      expect(user.timeZone).toBe('America/New_York');
      expect(user.password).toBeUndefined(); // Password should not be returned
      expect(user.isActive).toBe(true);
      expect(user.totalBookings).toBe(0);
      expect(user.completedBookings).toBe(0);
      expect(user.cancelledBookings).toBe(0);
      expect(user.noShowCount).toBe(0);
      expect(user.communicationPreferences.emailReminders).toBe(true);
      expect(user.communicationPreferences.smsReminders).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);

      testUserId = user._id;
    });

    it('should create user with default role of client', async () => {
      const userData = {
        email: 'default.role@test.com',
        password: 'SecurePass123!',
        name: 'Default Role User'
      };

      const user = await User.create(userData);

      expect(user.role).toBe('client');
    });

    it('should create user with admin role', async () => {
      const userData = {
        email: 'admin@test.com',
        password: 'AdminPass123!',
        name: 'Admin User',
        role: 'admin'
      };

      const user = await User.create(userData);

      expect(user.role).toBe('admin');
    });

    it('should create user with provider role', async () => {
      const userData = {
        email: 'provider@test.com',
        password: 'ProviderPass123!',
        name: 'Provider User',
        role: 'provider'
      };

      const user = await User.create(userData);

      expect(user.role).toBe('provider');
    });

    it('should hash password before storing', async () => {
      const userData = {
        email: 'password.test@test.com',
        password: 'SecurePass123!',
        name: 'Password Test User'
      };

      const user = await User.create(userData);

      // Fetch raw user from database to check password hash
      const rawUser = await db.collection('users').findOne({ _id: user._id });
      expect(rawUser.password).not.toBe(userData.password);
      expect(rawUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'SecurePass123!',
        name: 'First User'
      };

      await User.create(userData);

      // Try to create another user with same email
      await expect(
        User.create({ ...userData, name: 'Second User' })
      ).rejects.toThrow('User with this email already exists');
    });

    it('should throw error for invalid role', async () => {
      const userData = {
        email: 'invalid.role@test.com',
        password: 'SecurePass123!',
        name: 'Invalid Role User',
        role: 'superuser'
      };

      await expect(User.create(userData)).rejects.toThrow('Invalid role');
    });

    it('should throw error for weak password', async () => {
      const userData = {
        email: 'weak.password@test.com',
        password: 'weak',
        name: 'Weak Password User'
      };

      await expect(User.create(userData)).rejects.toThrow('Password does not meet strength requirements');
    });

    it('should throw error for password without uppercase letter', async () => {
      const userData = {
        email: 'no.uppercase@test.com',
        password: 'securepass123!',
        name: 'No Uppercase User'
      };

      await expect(User.create(userData)).rejects.toThrow('Password does not meet strength requirements');
    });

    it('should throw error for password without number', async () => {
      const userData = {
        email: 'no.number@test.com',
        password: 'SecurePassword!',
        name: 'No Number User'
      };

      await expect(User.create(userData)).rejects.toThrow('Password does not meet strength requirements');
    });

    it('should throw error for password without special character', async () => {
      const userData = {
        email: 'no.special@test.com',
        password: 'SecurePass123',
        name: 'No Special Char User'
      };

      await expect(User.create(userData)).rejects.toThrow('Password does not meet strength requirements');
    });

    it('should throw error for common password', async () => {
      const userData = {
        email: 'common.pass@test.com',
        password: 'Password123!',
        name: 'Common Password User'
      };

      await expect(User.create(userData)).rejects.toThrow('Password does not meet strength requirements');
    });

    it('should create user with preferred staff', async () => {
      const userData = {
        email: 'preferred.staff@test.com',
        password: 'SecurePass123!',
        name: 'Preferred Staff User',
        preferredStaffIds: [testStaffId.toString()]
      };

      const user = await User.create(userData);

      expect(user.preferredStaffIds).toHaveLength(1);
      expect(user.preferredStaffIds[0].toString()).toBe(testStaffId.toString());
    });

    it('should create user with custom communication preferences', async () => {
      const userData = {
        email: 'custom.prefs@test.com',
        password: 'SecurePass123!',
        name: 'Custom Prefs User',
        communicationPreferences: {
          emailReminders: false,
          smsReminders: true
        }
      };

      const user = await User.create(userData);

      expect(user.communicationPreferences.emailReminders).toBe(false);
      expect(user.communicationPreferences.smsReminders).toBe(true);
    });
  });

  describe('createClient', () => {
    it('should create a client without password', async () => {
      const clientData = {
        name: 'Quick Client',
        email: 'quick.client@test.com',
        phone: '+1-555-0101',
        timeZone: 'America/Chicago'
      };

      const client = await User.createClient(clientData);

      expect(client).toBeDefined();
      expect(client._id).toBeDefined();
      expect(client.email).toBe(clientData.email);
      expect(client.name).toBe(clientData.name);
      expect(client.phone).toBe(clientData.phone);
      expect(client.role).toBe('client');
      expect(client.timeZone).toBe('America/Chicago');
      expect(client.isActive).toBe(true);
      expect(client.totalBookings).toBe(0);
    });

    it('should return existing client if email already exists', async () => {
      const clientData = {
        name: 'Existing Client',
        email: 'existing.client@test.com',
        phone: '+1-555-0102'
      };

      const client1 = await User.createClient(clientData);
      const client2 = await User.createClient(clientData);

      expect(client1._id.toString()).toBe(client2._id.toString());
    });

    it('should create client with default timezone', async () => {
      const clientData = {
        name: 'Default TZ Client',
        email: 'default.tz@test.com',
        phone: '+1-555-0103'
      };

      const client = await User.createClient(clientData);

      expect(client.timeZone).toBe('America/New_York');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const created = await User.create({
        email: 'findme@test.com',
        password: 'SecurePass123!',
        name: 'Find Me'
      });

      const found = await User.findByEmail('findme@test.com');

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.email).toBe('findme@test.com');
      expect(found.password).toBeDefined(); // findByEmail returns password
    });

    it('should return null for non-existent email', async () => {
      const found = await User.findByEmail('nonexistent@test.com');
      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by ID without password', async () => {
      const created = await User.create({
        email: 'findbyid@test.com',
        password: 'SecurePass123!',
        name: 'Find By ID'
      });

      const found = await User.findById(created._id.toString());

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.email).toBe('findbyid@test.com');
      expect(found.password).toBeUndefined(); // Should not return password
    });

    it('should return null for non-existent ID', async () => {
      const fakeId = new ObjectId().toString();
      const found = await User.findById(fakeId);
      expect(found).toBeNull();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      await User.create({
        email: 'verify@test.com',
        password: 'SecurePass123!',
        name: 'Verify User'
      });

      const user = await User.verifyPassword('verify@test.com', 'SecurePass123!');

      expect(user).toBeDefined();
      expect(user.email).toBe('verify@test.com');
      expect(user.password).toBeUndefined(); // Should not return password
    });

    it('should return null for incorrect password', async () => {
      await User.create({
        email: 'wrongpass@test.com',
        password: 'SecurePass123!',
        name: 'Wrong Pass User'
      });

      const user = await User.verifyPassword('wrongpass@test.com', 'WrongPassword123!');

      expect(user).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const user = await User.verifyPassword('notexist@test.com', 'SecurePass123!');
      expect(user).toBeNull();
    });
  });

  describe('incrementBookingCount', () => {
    it('should increment total bookings counter', async () => {
      const user = await User.create({
        email: 'counter@test.com',
        password: 'SecurePass123!',
        name: 'Counter User'
      });

      await User.incrementBookingCount(user._id.toString(), 'total');

      const updated = await User.findById(user._id.toString());
      expect(updated.totalBookings).toBe(1);
    });

    it('should increment completed bookings counter', async () => {
      const user = await User.create({
        email: 'completed@test.com',
        password: 'SecurePass123!',
        name: 'Completed User'
      });

      await User.incrementBookingCount(user._id.toString(), 'completed');

      const updated = await User.findById(user._id.toString());
      expect(updated.completedBookings).toBe(1);
    });

    it('should increment cancelled bookings counter', async () => {
      const user = await User.create({
        email: 'cancelled@test.com',
        password: 'SecurePass123!',
        name: 'Cancelled User'
      });

      await User.incrementBookingCount(user._id.toString(), 'cancelled');

      const updated = await User.findById(user._id.toString());
      expect(updated.cancelledBookings).toBe(1);
    });

    it('should increment no-show counter', async () => {
      const user = await User.create({
        email: 'noshow@test.com',
        password: 'SecurePass123!',
        name: 'No Show User'
      });

      await User.incrementBookingCount(user._id.toString(), 'noShow');

      const updated = await User.findById(user._id.toString());
      expect(updated.noShowCount).toBe(1);
    });

    it('should throw error for invalid counter type', async () => {
      const user = await User.create({
        email: 'invalid.counter@test.com',
        password: 'SecurePass123!',
        name: 'Invalid Counter User'
      });

      await expect(
        User.incrementBookingCount(user._id.toString(), 'invalid')
      ).rejects.toThrow('Invalid booking count type');
    });
  });

  describe('addPreferredStaff', () => {
    it('should add staff to preferred list', async () => {
      const user = await User.create({
        email: 'addstaff@test.com',
        password: 'SecurePass123!',
        name: 'Add Staff User'
      });

      await User.addPreferredStaff(user._id.toString(), testStaffId.toString());

      const updated = await User.findById(user._id.toString());
      expect(updated.preferredStaffIds).toHaveLength(1);
      expect(updated.preferredStaffIds[0].toString()).toBe(testStaffId.toString());
    });

    it('should not add duplicate staff', async () => {
      const user = await User.create({
        email: 'duplicate.staff@test.com',
        password: 'SecurePass123!',
        name: 'Duplicate Staff User'
      });

      // Add staff twice
      await User.addPreferredStaff(user._id.toString(), testStaffId.toString());
      await User.addPreferredStaff(user._id.toString(), testStaffId.toString());

      const updated = await User.findById(user._id.toString());
      expect(updated.preferredStaffIds).toHaveLength(1);
    });
  });

  describe('removePreferredStaff', () => {
    it('should remove staff from preferred list', async () => {
      const user = await User.create({
        email: 'removestaff@test.com',
        password: 'SecurePass123!',
        name: 'Remove Staff User'
      });

      // First add the staff
      await User.addPreferredStaff(user._id.toString(), testStaffId.toString());

      // Verify it was added
      let updated = await User.findById(user._id.toString());
      expect(updated.preferredStaffIds).toHaveLength(1);

      // Now remove it
      await User.removePreferredStaff(user._id.toString(), testStaffId.toString());

      updated = await User.findById(user._id.toString());
      expect(updated.preferredStaffIds).toHaveLength(0);
    });
  });

  describe('updateCommunicationPreferences', () => {
    it('should update communication preferences', async () => {
      const user = await User.create({
        email: 'updateprefs@test.com',
        password: 'SecurePass123!',
        name: 'Update Prefs User'
      });

      await User.updateCommunicationPreferences(user._id.toString(), {
        emailReminders: false,
        smsReminders: true
      });

      const updated = await User.findById(user._id.toString());
      expect(updated.communicationPreferences.emailReminders).toBe(false);
      expect(updated.communicationPreferences.smsReminders).toBe(true);
    });
  });

  describe('updateClientNotes', () => {
    it('should update client notes', async () => {
      const user = await User.create({
        email: 'notes@test.com',
        password: 'SecurePass123!',
        name: 'Notes User'
      });

      await User.updateClientNotes(user._id.toString(), 'Client prefers morning appointments');

      const updated = await User.findById(user._id.toString());
      expect(updated.clientNotes).toBe('Client prefers morning appointments');
    });
  });

  describe('blockClient and unblockClient', () => {
    it('should block a client with reason', async () => {
      const user = await User.create({
        email: 'block@test.com',
        password: 'SecurePass123!',
        name: 'Block User'
      });

      await User.blockClient(user._id.toString(), 'Repeated no-shows');

      const updated = await User.findById(user._id.toString());
      expect(updated.isActive).toBe(false);
      expect(updated.blockedReason).toBe('Repeated no-shows');
    });

    it('should unblock a client', async () => {
      const user = await User.create({
        email: 'unblock@test.com',
        password: 'SecurePass123!',
        name: 'Unblock User',
        isActive: false
      });

      // Block first
      await User.blockClient(user._id.toString(), 'Test block');

      // Then unblock
      await User.unblockClient(user._id.toString());

      const updated = await User.findById(user._id.toString());
      expect(updated.isActive).toBe(true);
      expect(updated.blockedReason).toBeNull();
    });
  });

  describe('account locking and security', () => {
    it('should lock account after 5 failed login attempts', async () => {
      await User.create({
        email: 'locktest@test.com',
        password: 'SecurePass123!',
        name: 'Lock Test User'
      });

      // Simulate 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await User.incrementFailedAttempts('locktest@test.com');
      }

      const lockStatus = await User.isAccountLocked('locktest@test.com');
      expect(lockStatus.isLocked).toBe(true);
      expect(lockStatus.lockoutUntil).toBeInstanceOf(Date);
    });

    it('should track failed login attempts', async () => {
      await User.create({
        email: 'failcount@test.com',
        password: 'SecurePass123!',
        name: 'Fail Count User'
      });

      const result1 = await User.incrementFailedAttempts('failcount@test.com');
      expect(result1.attempts).toBe(1);
      expect(result1.shouldLock).toBe(false);

      const result2 = await User.incrementFailedAttempts('failcount@test.com');
      expect(result2.attempts).toBe(2);
      expect(result2.shouldLock).toBe(false);
    });

    it('should unlock account manually', async () => {
      await User.create({
        email: 'unlock@test.com',
        password: 'SecurePass123!',
        name: 'Unlock User'
      });

      // Lock account
      for (let i = 0; i < 5; i++) {
        await User.incrementFailedAttempts('unlock@test.com');
      }

      // Verify locked
      let lockStatus = await User.isAccountLocked('unlock@test.com');
      expect(lockStatus.isLocked).toBe(true);

      // Unlock
      await User.unlockAccount('unlock@test.com');

      // Verify unlocked
      lockStatus = await User.isAccountLocked('unlock@test.com');
      expect(lockStatus.isLocked).toBe(false);
    });

    it('should get lockout info with remaining attempts', async () => {
      await User.create({
        email: 'lockinfo@test.com',
        password: 'SecurePass123!',
        name: 'Lock Info User'
      });

      await User.incrementFailedAttempts('lockinfo@test.com');
      await User.incrementFailedAttempts('lockinfo@test.com');

      const info = await User.getLockoutInfo('lockinfo@test.com');
      expect(info.failedAttempts).toBe(2);
      expect(info.remainingAttempts).toBe(3);
      expect(info.isLocked).toBe(false);
    });

    it('should reset failed attempts on successful login', async () => {
      const user = await User.create({
        email: 'resetattempts@test.com',
        password: 'SecurePass123!',
        name: 'Reset Attempts User'
      });

      // Increment failed attempts
      await User.incrementFailedAttempts('resetattempts@test.com');
      await User.incrementFailedAttempts('resetattempts@test.com');

      // Update last login (simulates successful login)
      await User.updateLastLogin(user._id.toString());

      // Check that failed attempts were reset
      const rawUser = await db.collection('users').findOne({ _id: user._id });
      expect(rawUser.failedLoginAttempts).toBe(0);
    });
  });

  describe('findAllClients', () => {
    it('should return all clients with pagination', async () => {
      // Create multiple clients
      for (let i = 0; i < 3; i++) {
        await User.create({
          email: `client${i}@test.com`,
          password: 'SecurePass123!',
          name: `Client ${i}`,
          role: 'client'
        });
      }

      const result = await User.findAllClients({ page: 1, limit: 10 });

      expect(result.clients.length).toBeGreaterThanOrEqual(3);
      expect(result.pagination.total).toBeGreaterThanOrEqual(3);
      result.clients.forEach(client => {
        expect(client.role).toBe('client');
        expect(client.password).toBeUndefined(); // Should not include password
      });
    });

    it('should handle pagination correctly', async () => {
      // Create clients
      for (let i = 0; i < 5; i++) {
        await User.create({
          email: `pageclient${i}@test.com`,
          password: 'SecurePass123!',
          name: `Page Client ${i}`,
          role: 'client'
        });
      }

      const page1 = await User.findAllClients({ page: 1, limit: 2 });
      expect(page1.clients.length).toBe(2);
      expect(page1.pagination.pages).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getClientStats', () => {
    it('should return client statistics', async () => {
      // Create active client
      await User.create({
        email: 'activeclient@test.com',
        password: 'SecurePass123!',
        name: 'Active Client',
        role: 'client'
      });

      // Create blocked client
      const blockedUser = await User.create({
        email: 'blockedclient@test.com',
        password: 'SecurePass123!',
        name: 'Blocked Client',
        role: 'client'
      });
      await User.blockClient(blockedUser._id.toString(), 'Test block');

      const stats = await User.getClientStats();

      expect(stats.totalClients).toBeGreaterThanOrEqual(2);
      expect(stats.activeClients).toBeGreaterThanOrEqual(1);
      expect(stats.blockedClients).toBeGreaterThanOrEqual(1);
    });
  });

  describe('findAllProviders', () => {
    it('should return all providers with pagination', async () => {
      // Create providers
      await User.create({
        email: 'provider1@test.com',
        password: 'SecurePass123!',
        name: 'Provider 1',
        role: 'provider'
      });

      await User.create({
        email: 'provider2@test.com',
        password: 'SecurePass123!',
        name: 'Provider 2',
        role: 'provider'
      });

      const result = await User.findAllProviders({ page: 1, limit: 10 });

      expect(result.providers.length).toBeGreaterThanOrEqual(2);
      result.providers.forEach(provider => {
        expect(provider.role).toBe('provider');
        expect(provider.password).toBeUndefined();
      });
    });
  });

  describe('getProviderStats', () => {
    it('should return provider statistics', async () => {
      await User.create({
        email: 'activeprovider@test.com',
        password: 'SecurePass123!',
        name: 'Active Provider',
        role: 'provider'
      });

      const stats = await User.getProviderStats();

      expect(stats.totalProviders).toBeGreaterThanOrEqual(1);
      expect(stats.activeProviders).toBeGreaterThanOrEqual(1);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      const user = await User.create({
        email: 'lastlogin@test.com',
        password: 'SecurePass123!',
        name: 'Last Login User'
      });

      await User.updateLastLogin(user._id.toString());

      const rawUser = await db.collection('users').findOne({ _id: user._id });
      expect(rawUser.lastLoginAt).toBeInstanceOf(Date);
    });
  });
});
