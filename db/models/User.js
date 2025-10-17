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
   * Create a new admin user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password (will be hashed)
   * @param {string} userData.name - User's full name
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
      role: 'admin',
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
}
