import { ObjectId } from 'mongodb';
import { getDatabase } from '../connection.js';
import bcrypt from 'bcrypt';

const COLLECTION_NAME = 'users';

export class User {
  /**
   * Validate password strength
   * @param {string} password - Plain text password to validate
   * @returns {{valid: boolean, errors: string[]}}
   */
  static validatePasswordStrength(password) {
    const errors = [];

    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length (to prevent DoS via bcrypt)
    if (password.length > 72) {
      errors.push('Password must be no more than 72 characters long');
    }

    // Must contain uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Must contain lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Must contain number
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Must contain special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
    }

    // Check for common passwords (basic check)
    const commonPasswords = ['password', 'password123', 'admin123', '12345678', 'qwerty123'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password is too common. Please choose a stronger password');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a new user (admin or client)
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password (will be hashed)
   * @param {string} userData.name - User's full name
   * @param {string} userData.role - User role ('admin' or 'client')
   * @param {string} userData.phone - Phone number (optional)
   * @param {string} userData.timeZone - Timezone (optional)
   * @returns {Promise<Object>} Created user (without password)
   */
  static async create(userData) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Check if user already exists
    const existingUser = await collection.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength
    const passwordValidation = this.validatePasswordStrength(userData.password);
    if (!passwordValidation.valid) {
      const error = new Error('Password does not meet strength requirements');
      error.validationErrors = passwordValidation.errors;
      throw error;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const user = {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: userData.role || 'client', // Default to 'client' for service booking
      phone: userData.phone || null,
      timeZone: userData.timeZone || 'America/New_York',

      // Client-specific fields
      preferredStaffIds: userData.preferredStaffIds || [],
      communicationPreferences: {
        emailReminders: userData.communicationPreferences?.emailReminders !== false, // Default true
        smsReminders: userData.communicationPreferences?.smsReminders || false,
      },

      // Booking history counters
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      noShowCount: 0,

      // Client notes (staff-facing)
      clientNotes: userData.clientNotes || null,

      // Status
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      blockedReason: null,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(user);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      _id: result.insertedId,
    };
  }

  /**
   * Create a client user (for booking without registration)
   * Simpler version without password - for clients who book services
   * @param {Object} clientData - Client data
   * @param {string} clientData.name - Client's full name
   * @param {string} clientData.email - Client email
   * @param {string} clientData.phone - Client phone number
   * @param {string} clientData.timeZone - Timezone (optional)
   * @returns {Promise<Object>} Created client user
   */
  static async createClient(clientData) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Check if user already exists
    const existingUser = await collection.findOne({ email: clientData.email });
    if (existingUser) {
      // Return existing user if found
      return existingUser;
    }

    const client = {
      email: clientData.email,
      name: clientData.name,
      phone: clientData.phone,
      role: 'client',
      timeZone: clientData.timeZone || 'America/New_York',

      // Client-specific fields
      preferredStaffIds: [],
      communicationPreferences: {
        emailReminders: true,
        smsReminders: false
      },
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      noShowCount: 0,
      clientNotes: '',
      isActive: true,
      blockedReason: null,

      // Security fields
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastLoginAt: null,

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(client);
    return {
      _id: result.insertedId,
      ...client
    };
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    return await collection.findOne({ email });
  }

  /**
   * Verify user password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object|null>} User object (without password) or null
   */
  static async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object (without password) or null
   */
  static async findById(id) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const user = await collection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user's last login time
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  static async updateLastLogin(id) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
          failedLoginAttempts: 0 // Reset failed attempts on successful login
        }
      }
    );
  }

  /**
   * Check if user account is locked
   * @param {string} email - User email
   * @returns {Promise<{isLocked: boolean, lockoutUntil: Date|null}>}
   */
  static async isAccountLocked(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      return { isLocked: false, lockoutUntil: null };
    }

    // Check if lockoutUntil exists and is in the future
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return { isLocked: true, lockoutUntil: user.lockoutUntil };
    }

    // If lockout period has passed, unlock the account
    if (user.lockoutUntil && user.lockoutUntil <= new Date()) {
      await this.unlockAccount(email);
      return { isLocked: false, lockoutUntil: null };
    }

    return { isLocked: false, lockoutUntil: null };
  }

  /**
   * Increment failed login attempts and lock account if threshold reached
   * @param {string} email - User email
   * @returns {Promise<{shouldLock: boolean, attempts: number}>}
   */
  static async incrementFailedAttempts(email) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

    const user = await this.findByEmail(email);
    if (!user) {
      return { shouldLock: false, attempts: 0 };
    }

    const attempts = (user.failedLoginAttempts || 0) + 1;

    if (attempts >= MAX_ATTEMPTS) {
      // Lock the account
      const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);

      await collection.updateOne(
        { email },
        {
          $set: {
            failedLoginAttempts: attempts,
            lockoutUntil,
            updatedAt: new Date()
          }
        }
      );

      return { shouldLock: true, attempts, lockoutUntil };
    } else {
      // Just increment attempts
      await collection.updateOne(
        { email },
        {
          $set: {
            failedLoginAttempts: attempts,
            updatedAt: new Date()
          }
        }
      );

      return { shouldLock: false, attempts };
    }
  }

  /**
   * Unlock a user account
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  static async unlockAccount(email) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { email },
      {
        $set: {
          failedLoginAttempts: 0,
          lockoutUntil: null,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Get account lockout info
   * @param {string} email - User email
   * @returns {Promise<Object>} Lockout information
   */
  static async getLockoutInfo(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      return {
        failedAttempts: 0,
        isLocked: false,
        lockoutUntil: null,
        remainingAttempts: 5
      };
    }

    const { isLocked, lockoutUntil } = await this.isAccountLocked(email);
    const failedAttempts = user.failedLoginAttempts || 0;
    const remainingAttempts = Math.max(0, 5 - failedAttempts);

    return {
      failedAttempts,
      isLocked,
      lockoutUntil,
      remainingAttempts
    };
  }

  /**
   * Increment booking counter for a client
   * @param {string} userId - User ID
   * @param {string} type - Type of counter to increment ('total', 'completed', 'cancelled', 'noShow')
   * @returns {Promise<void>}
   */
  static async incrementBookingCount(userId, type = 'total') {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const fieldMap = {
      total: 'totalBookings',
      completed: 'completedBookings',
      cancelled: 'cancelledBookings',
      noShow: 'noShowCount'
    };

    const field = fieldMap[type];
    if (!field) {
      throw new Error('Invalid booking count type');
    }

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { [field]: 1 },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Add preferred staff member for a client
   * @param {string} userId - User ID
   * @param {string} staffId - Staff ID to add to preferences
   * @returns {Promise<void>}
   */
  static async addPreferredStaff(userId, staffId) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: { preferredStaffIds: new ObjectId(staffId) },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Remove preferred staff member for a client
   * @param {string} userId - User ID
   * @param {string} staffId - Staff ID to remove from preferences
   * @returns {Promise<void>}
   */
  static async removePreferredStaff(userId, staffId) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: { preferredStaffIds: new ObjectId(staffId) },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Update communication preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Communication preferences
   * @returns {Promise<void>}
   */
  static async updateCommunicationPreferences(userId, preferences) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          communicationPreferences: preferences,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Update client notes (staff-facing)
   * @param {string} userId - User ID
   * @param {string} notes - Client notes
   * @returns {Promise<void>}
   */
  static async updateClientNotes(userId, notes) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          clientNotes: notes,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Block a client from booking
   * @param {string} userId - User ID
   * @param {string} reason - Reason for blocking
   * @returns {Promise<void>}
   */
  static async blockClient(userId, reason) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          isActive: false,
          blockedReason: reason,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Unblock a client
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async unblockClient(userId) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          isActive: true,
          blockedReason: null,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Get all clients (users with role='client')
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @returns {Promise<Object>} Clients and pagination info
   */
  static async findAllClients({ page = 1, limit = 20 } = {}) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const query = { role: 'client' };
    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      collection
        .find(query, { projection: { password: 0 } }) // Exclude password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get client statistics
   * @returns {Promise<Object>} Client stats
   */
  static async getClientStats() {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const totalClients = await collection.countDocuments({ role: 'client' });
    const activeClients = await collection.countDocuments({ role: 'client', isActive: true });
    const blockedClients = await collection.countDocuments({ role: 'client', isActive: false });

    return {
      totalClients,
      activeClients,
      blockedClients
    };
  }
}
