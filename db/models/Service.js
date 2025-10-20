import { getCollection } from '../connection.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'services';

/**
 * Service model for database operations
 * Represents bookable services (coaching sessions, consultations, workshops)
 */
export class Service {
  /**
   * Create a new service
   * @param {Object} serviceData - Service data
   * @param {string} serviceData.name - Service name (e.g., "60-Minute Coaching Session")
   * @param {string} serviceData.description - Full service description
   * @param {string} serviceData.category - Service category (e.g., "1-on-1", "Group Session", "Workshop")
   * @param {number} serviceData.duration - Duration in minutes (60, 90, 120, etc.)
   * @param {number} serviceData.price - Price in cents
   * @param {string} serviceData.image - Cloudinary URL for service image
   * @param {Array<string>} serviceData.staffIds - Array of staff ObjectIds who can provide this service
   * @param {number} serviceData.bufferTime - Minutes between bookings (0, 15, 30)
   * @param {number} serviceData.maxAdvanceBooking - Days in advance clients can book (30, 60, 90)
   * @param {Object} serviceData.cancellationPolicy - Cancellation terms
   * @returns {Promise<Object>} Created service with _id
   */
  static async create(serviceData) {
    const collection = await getCollection(COLLECTION_NAME);

    const service = {
      name: serviceData.name,
      description: serviceData.description,
      category: serviceData.category,
      duration: serviceData.duration, // in minutes
      price: serviceData.price, // in cents
      image: serviceData.image || null,

      // Staff assignment
      staffIds: serviceData.staffIds?.map(id => new ObjectId(id)) || [],

      // Booking settings
      bufferTime: serviceData.bufferTime || 0, // Minutes between bookings
      maxAdvanceBooking: serviceData.maxAdvanceBooking || 60, // Days in advance

      // Cancellation policy
      cancellationPolicy: {
        hoursBeforeStart: serviceData.cancellationPolicy?.hoursBeforeStart || 24,
        refundPercentage: serviceData.cancellationPolicy?.refundPercentage || 100
      },

      // Status
      isActive: serviceData.isActive !== undefined ? serviceData.isActive : true,

      // Metadata for custom fields
      metadata: serviceData.metadata || {},

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(service);
    return { _id: result.insertedId, ...service };
  }

  /**
   * Find service by ID
   * @param {string} serviceId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  static async findById(serviceId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ _id: new ObjectId(serviceId) });
  }

  /**
   * Get all services with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.category - Filter by category
   * @param {boolean} options.isActive - Filter by active status
   * @param {string} options.staffId - Filter by staff member who can provide the service
   * @returns {Promise<Object>} Services and pagination info
   */
  static async findAll({
    page = 1,
    limit = 20,
    category = null,
    isActive = null,
    staffId = null
  } = {}) {
    const collection = await getCollection(COLLECTION_NAME);

    const query = {};
    if (category) query.category = category;
    if (isActive !== null) query.isActive = isActive;
    if (staffId) query.staffIds = new ObjectId(staffId);

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update service
   * @param {string} serviceId - MongoDB ObjectId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated service
   */
  static async update(serviceId, updates) {
    const collection = await getCollection(COLLECTION_NAME);

    // Convert staffIds to ObjectIds if provided
    if (updates.staffIds) {
      updates.staffIds = updates.staffIds.map(id =>
        typeof id === 'string' ? new ObjectId(id) : id
      );
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(serviceId) },
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
   * Delete service (soft delete by setting isActive to false)
   * @param {string} serviceId - MongoDB ObjectId
   * @returns {Promise<Object>} Updated service
   */
  static async softDelete(serviceId) {
    return await this.update(serviceId, { isActive: false });
  }

  /**
   * Hard delete service from database
   * @param {string} serviceId - MongoDB ObjectId
   * @returns {Promise<boolean>} Success status
   */
  static async delete(serviceId) {
    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(serviceId) });
    return result.deletedCount > 0;
  }

  /**
   * Get services by category
   * @param {string} category - Category name
   * @returns {Promise<Array>}
   */
  static async findByCategory(category) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({ category, isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Get all unique categories
   * @returns {Promise<Array>} List of category names
   */
  static async getCategories() {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.distinct('category', { isActive: true });
  }

  /**
   * Get services by staff member
   * @param {string} staffId - Staff member ObjectId
   * @returns {Promise<Array>} Services this staff can provide
   */
  static async findByStaff(staffId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({
        staffIds: new ObjectId(staffId),
        isActive: true
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Add staff member to service
   * @param {string} serviceId - Service ObjectId
   * @param {string} staffId - Staff ObjectId
   * @returns {Promise<Object>} Updated service
   */
  static async addStaff(serviceId, staffId) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(serviceId) },
      {
        $addToSet: { staffIds: new ObjectId(staffId) },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Remove staff member from service
   * @param {string} serviceId - Service ObjectId
   * @param {string} staffId - Staff ObjectId
   * @returns {Promise<Object>} Updated service
   */
  static async removeStaff(serviceId, staffId) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(serviceId) },
      {
        $pull: { staffIds: new ObjectId(staffId) },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Search services by name or description
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
          { description: { $regex: searchTerm, $options: 'i' } },
        ],
      })
      .toArray();
  }

  /**
   * Get service statistics
   * @returns {Promise<Object>} Service stats
   */
  static async getStats() {
    const collection = await getCollection(COLLECTION_NAME);

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            avgDuration: { $avg: '$duration' },
          },
        },
      ])
      .toArray();

    const totalServices = await collection.countDocuments({ isActive: true });

    return {
      totalServices,
      byCategory: stats,
    };
  }
}
