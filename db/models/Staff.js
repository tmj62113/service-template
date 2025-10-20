import { getCollection } from '../connection.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'staff';

/**
 * Staff model for database operations
 * Represents coaches, consultants, and service providers
 */
export class Staff {
  /**
   * Create a new staff member
   * @param {Object} staffData - Staff data
   * @param {string} staffData.name - Full name
   * @param {string} staffData.email - Email address
   * @param {string} staffData.phone - Phone number
   * @param {string} staffData.bio - Biography
   * @param {string} staffData.photo - Cloudinary URL for photo
   * @param {string} staffData.title - Job title (e.g., "Senior Coach", "Lead Consultant")
   * @param {Array<string>} staffData.specialties - Areas of expertise
   * @param {Array<string>} staffData.serviceIds - Services they can provide
   * @param {string} staffData.userId - Associated user account ID (if staff can login)
   * @param {string} staffData.timeZone - Staff's timezone (e.g., "America/New_York")
   * @param {number} staffData.defaultBookingBuffer - Default buffer between appointments in minutes
   * @returns {Promise<Object>} Created staff member with _id
   */
  static async create(staffData) {
    const collection = await getCollection(COLLECTION_NAME);

    // Check if email already exists
    const existingStaff = await collection.findOne({ email: staffData.email });
    if (existingStaff) {
      throw new Error('Staff member with this email already exists');
    }

    const staff = {
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone || null,
      bio: staffData.bio || '',
      photo: staffData.photo || null,
      title: staffData.title || '',
      specialties: staffData.specialties || [],

      // Service assignments
      serviceIds: staffData.serviceIds?.map(id => new ObjectId(id)) || [],

      // User account reference (if staff can login)
      userId: staffData.userId ? new ObjectId(staffData.userId) : null,

      // Status
      isActive: staffData.isActive !== undefined ? staffData.isActive : true,
      acceptingBookings: staffData.acceptingBookings !== undefined ? staffData.acceptingBookings : true,

      // Settings
      timeZone: staffData.timeZone || 'America/New_York',
      defaultBookingBuffer: staffData.defaultBookingBuffer || 15, // Minutes

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(staff);
    return { _id: result.insertedId, ...staff };
  }

  /**
   * Find staff by ID
   * @param {string} staffId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  static async findById(staffId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ _id: new ObjectId(staffId) });
  }

  /**
   * Find staff by email
   * @param {string} email - Staff email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ email });
  }

  /**
   * Find staff by user ID
   * @param {string} userId - User account ObjectId
   * @returns {Promise<Object|null>}
   */
  static async findByUserId(userId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ userId: new ObjectId(userId) });
  }

  /**
   * Get all staff members with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {boolean} options.isActive - Filter by active status
   * @param {boolean} options.acceptingBookings - Filter by accepting bookings status
   * @param {string} options.serviceId - Filter by service they can provide
   * @returns {Promise<Object>} Staff members and pagination info
   */
  static async findAll({
    page = 1,
    limit = 20,
    isActive = null,
    acceptingBookings = null,
    serviceId = null
  } = {}) {
    const collection = await getCollection(COLLECTION_NAME);

    const query = {};
    if (isActive !== null) query.isActive = isActive;
    if (acceptingBookings !== null) query.acceptingBookings = acceptingBookings;
    if (serviceId) query.serviceIds = new ObjectId(serviceId);

    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      staff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update staff member
   * @param {string} staffId - MongoDB ObjectId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated staff member
   */
  static async update(staffId, updates) {
    const collection = await getCollection(COLLECTION_NAME);

    // Convert serviceIds to ObjectIds if provided
    if (updates.serviceIds) {
      updates.serviceIds = updates.serviceIds.map(id =>
        typeof id === 'string' ? new ObjectId(id) : id
      );
    }

    // Convert userId to ObjectId if provided
    if (updates.userId) {
      updates.userId = typeof updates.userId === 'string'
        ? new ObjectId(updates.userId)
        : updates.userId;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(staffId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Deactivate staff member (soft delete)
   * @param {string} staffId - MongoDB ObjectId
   * @returns {Promise<Object>} Updated staff member
   */
  static async deactivate(staffId) {
    return await this.update(staffId, {
      isActive: false,
      acceptingBookings: false
    });
  }

  /**
   * Hard delete staff member from database
   * @param {string} staffId - MongoDB ObjectId
   * @returns {Promise<boolean>} Success status
   */
  static async delete(staffId) {
    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(staffId) });
    return result.deletedCount > 0;
  }

  /**
   * Add service to staff member's capabilities
   * @param {string} staffId - Staff ObjectId
   * @param {string} serviceId - Service ObjectId
   * @returns {Promise<Object>} Updated staff member
   */
  static async addService(staffId, serviceId) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(staffId) },
      {
        $addToSet: { serviceIds: new ObjectId(serviceId) },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Remove service from staff member's capabilities
   * @param {string} staffId - Staff ObjectId
   * @param {string} serviceId - Service ObjectId
   * @returns {Promise<Object>} Updated staff member
   */
  static async removeService(staffId, serviceId) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(staffId) },
      {
        $pull: { serviceIds: new ObjectId(serviceId) },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Toggle staff member's accepting bookings status
   * @param {string} staffId - Staff ObjectId
   * @param {boolean} accepting - Whether to accept bookings
   * @returns {Promise<Object>} Updated staff member
   */
  static async setAcceptingBookings(staffId, accepting) {
    return await this.update(staffId, { acceptingBookings: accepting });
  }

  /**
   * Get staff members who can provide a specific service
   * @param {string} serviceId - Service ObjectId
   * @returns {Promise<Array>} Staff members
   */
  static async findByService(serviceId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({
        serviceIds: new ObjectId(serviceId),
        isActive: true,
        acceptingBookings: true
      })
      .sort({ name: 1 })
      .toArray();
  }

  /**
   * Search staff by name, title, or specialties
   * @param {string} searchTerm - Search query
   * @returns {Promise<Array>}
   */
  static async search(searchTerm) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({
        isActive: true,
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { title: { $regex: searchTerm, $options: 'i' } },
          { bio: { $regex: searchTerm, $options: 'i' } },
          { specialties: { $regex: searchTerm, $options: 'i' } },
        ],
      })
      .toArray();
  }

  /**
   * Get staff statistics
   * @returns {Promise<Object>} Staff stats
   */
  static async getStats() {
    const collection = await getCollection(COLLECTION_NAME);

    const totalStaff = await collection.countDocuments({ isActive: true });
    const activeStaff = await collection.countDocuments({
      isActive: true,
      acceptingBookings: true
    });
    const inactiveStaff = await collection.countDocuments({
      isActive: false
    });

    return {
      totalStaff,
      activeStaff,
      inactiveStaff,
      notAcceptingBookings: totalStaff - activeStaff
    };
  }
}
