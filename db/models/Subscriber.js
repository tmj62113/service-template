import { getCollection } from '../connection.js';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

/**
 * Subscriber Model
 * Manages newsletter subscriber data and operations
 */
export const Subscriber = {
  /**
   * Create a new subscriber
   * @param {Object} subscriberData - Subscriber information
   * @returns {Promise<Object>} Created subscriber
   */
  async create(subscriberData) {
    const collection = await getCollection('subscribers');

    // Check if email already exists
    const existing = await collection.findOne({ email: subscriberData.email.toLowerCase() });
    if (existing) {
      // If already subscribed and active, return existing
      if (existing.status === 'active') {
        return existing;
      }
      // If previously unsubscribed, reactivate
      if (existing.status === 'unsubscribed') {
        return await this.resubscribe(existing._id.toString());
      }
    }

    // Generate unique unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    const subscriber = {
      email: subscriberData.email.toLowerCase().trim(),
      source: subscriberData.source || 'unknown', // 'contact-form', 'footer', 'admin'
      status: 'active', // 'active', 'unsubscribed'
      subscribedAt: new Date(),
      unsubscribedAt: null,
      unsubscribeToken,
      metadata: subscriberData.metadata || {},
    };

    const result = await collection.insertOne(subscriber);
    return { ...subscriber, _id: result.insertedId };
  },

  /**
   * Find subscriber by ID
   * @param {string} id - Subscriber ID
   * @returns {Promise<Object|null>} Subscriber or null
   */
  async findById(id) {
    const collection = await getCollection('subscribers');
    return await collection.findOne({ _id: new ObjectId(id) });
  },

  /**
   * Find subscriber by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} Subscriber or null
   */
  async findByEmail(email) {
    const collection = await getCollection('subscribers');
    return await collection.findOne({ email: email.toLowerCase().trim() });
  },

  /**
   * Find subscriber by unsubscribe token
   * @param {string} token - Unsubscribe token
   * @returns {Promise<Object|null>} Subscriber or null
   */
  async findByToken(token) {
    const collection = await getCollection('subscribers');
    return await collection.findOne({ unsubscribeToken: token });
  },

  /**
   * Get all subscribers with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Subscribers and metadata
   */
  async findAll(options = {}) {
    const collection = await getCollection('subscribers');
    const {
      page = 1,
      limit = 100,
      status,
      source,
      sortBy = 'subscribedAt',
      sortOrder = -1,
    } = options;

    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;

    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      collection
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Unsubscribe a subscriber
   * @param {string} id - Subscriber ID or unsubscribe token
   * @param {boolean} isToken - Whether the id is a token
   * @returns {Promise<Object|null>} Updated subscriber or null
   */
  async unsubscribe(id, isToken = false) {
    const collection = await getCollection('subscribers');

    const query = isToken
      ? { unsubscribeToken: id }
      : { _id: new ObjectId(id) };

    const result = await collection.findOneAndUpdate(
      query,
      {
        $set: {
          status: 'unsubscribed',
          unsubscribedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result;
  },

  /**
   * Resubscribe a previously unsubscribed user
   * @param {string} id - Subscriber ID
   * @returns {Promise<Object|null>} Updated subscriber or null
   */
  async resubscribe(id) {
    const collection = await getCollection('subscribers');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'active',
          subscribedAt: new Date(), // Update to current date
          unsubscribedAt: null,
        },
      },
      { returnDocument: 'after' }
    );

    return result;
  },

  /**
   * Delete a subscriber permanently
   * @param {string} id - Subscriber ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    const collection = await getCollection('subscribers');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  /**
   * Get subscriber statistics
   * @returns {Promise<Object>} Stats object
   */
  async getStats() {
    const collection = await getCollection('subscribers');

    const [total, active, unsubscribed, bySource] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ status: 'active' }),
      collection.countDocuments({ status: 'unsubscribed' }),
      collection.aggregate([
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 },
          },
        },
      ]).toArray(),
    ]);

    return {
      total,
      active,
      unsubscribed,
      bySource: bySource.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  },

  /**
   * Get active subscriber emails (for sending newsletters)
   * @returns {Promise<Array>} Array of email addresses
   */
  async getActiveEmails() {
    const collection = await getCollection('subscribers');
    const subscribers = await collection
      .find({ status: 'active' })
      .project({ email: 1, _id: 0 })
      .toArray();

    return subscribers.map(s => s.email);
  },
};
