import { getCollection } from '../connection.js';
import { ObjectId } from 'mongodb';

/**
 * Newsletter Model
 * Manages newsletter drafts and sent newsletters
 */
export const Newsletter = {
  /**
   * Create a new newsletter (draft or sent)
   * @param {Object} newsletterData - Newsletter information
   * @returns {Promise<Object>} Created newsletter
   */
  async create(newsletterData) {
    const collection = await getCollection('newsletters');

    const newsletter = {
      subject: newsletterData.subject,
      message: newsletterData.message,
      status: newsletterData.status || 'draft', // 'draft' or 'sent'
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: newsletterData.createdBy || null, // Admin user ID
      sentAt: newsletterData.status === 'sent' ? new Date() : null,
      recipientCount: newsletterData.recipientCount || 0,
      metadata: newsletterData.metadata || {},
    };

    const result = await collection.insertOne(newsletter);
    return { ...newsletter, _id: result.insertedId };
  },

  /**
   * Find newsletter by ID
   * @param {string} id - Newsletter ID
   * @returns {Promise<Object|null>} Newsletter or null
   */
  async findById(id) {
    const collection = await getCollection('newsletters');
    return await collection.findOne({ _id: new ObjectId(id) });
  },

  /**
   * Get all newsletters with filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Newsletters and metadata
   */
  async findAll(options = {}) {
    const collection = await getCollection('newsletters');
    const {
      page = 1,
      limit = 20,
      status, // 'draft' or 'sent'
      sortBy = 'createdAt',
      sortOrder = -1,
    } = options;

    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [newsletters, total] = await Promise.all([
      collection
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      newsletters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get all drafts
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Drafts and metadata
   */
  async findDrafts(options = {}) {
    return await this.findAll({ ...options, status: 'draft' });
  },

  /**
   * Get all sent newsletters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Sent newsletters and metadata
   */
  async findSent(options = {}) {
    return await this.findAll({ ...options, status: 'sent' });
  },

  /**
   * Update a newsletter (for editing drafts)
   * @param {string} id - Newsletter ID
   * @param {Object} updateData - Updated newsletter data
   * @returns {Promise<Object|null>} Updated newsletter or null
   */
  async update(id, updateData) {
    const collection = await getCollection('newsletters');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result;
  },

  /**
   * Mark a draft as sent
   * @param {string} id - Newsletter ID
   * @param {number} recipientCount - Number of recipients
   * @returns {Promise<Object|null>} Updated newsletter or null
   */
  async markAsSent(id, recipientCount) {
    const collection = await getCollection('newsletters');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'sent',
          sentAt: new Date(),
          recipientCount,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result;
  },

  /**
   * Delete a newsletter
   * @param {string} id - Newsletter ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const collection = await getCollection('newsletters');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  /**
   * Get newsletter statistics
   * @returns {Promise<Object>} Stats object
   */
  async getStats() {
    const collection = await getCollection('newsletters');

    const [total, drafts, sent, totalRecipients] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ status: 'draft' }),
      collection.countDocuments({ status: 'sent' }),
      collection.aggregate([
        { $match: { status: 'sent' } },
        { $group: { _id: null, total: { $sum: '$recipientCount' } } },
      ]).toArray(),
    ]);

    return {
      total,
      drafts,
      sent,
      totalRecipients: totalRecipients[0]?.total || 0,
    };
  },
};
