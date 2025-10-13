import { getCollection } from '../connection.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'orders';

/**
 * Order model for database operations
 */
export class Order {
  /**
   * Create a new order
   * @param {Object} orderData - Order data from Stripe webhook
   * @returns {Promise<Object>} Created order with _id
   */
  static async create(orderData) {
    const collection = await getCollection(COLLECTION_NAME);

    const order = {
      // Stripe identifiers
      stripeSessionId: orderData.sessionId,
      stripePaymentIntentId: orderData.paymentIntentId,
      stripeCustomerId: orderData.customerId,

      // Customer information
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName,

      // Addresses
      shippingAddress: orderData.shippingAddress || null,
      shippingName: orderData.shippingName || null,
      billingAddress: orderData.billingAddress || null,

      // Order items
      items: orderData.items,

      // Pricing
      subtotal: orderData.subtotal,
      total: orderData.total,
      currency: orderData.currency,

      // Status
      paymentStatus: orderData.paymentStatus,
      orderStatus: 'processing', // pending, processing, shipped, delivered, cancelled
      fulfillmentStatus: 'unfulfilled', // unfulfilled, fulfilled, partially_fulfilled

      // Timestamps
      createdAt: orderData.createdAt || new Date(),
      updatedAt: new Date(),
      paidAt: orderData.paymentStatus === 'paid' ? new Date() : null,
      shippedAt: null,
      deliveredAt: null,

      // Tracking
      trackingNumber: null,
      carrier: null,
      shippingLabelUrl: null,
      shippoTransactionId: null,
      trackingUrlProvider: null,

      // Notes
      customerNotes: null,
      internalNotes: null,
    };

    const result = await collection.insertOne(order);
    return { _id: result.insertedId, ...order };
  }

  /**
   * Find order by ID
   * @param {string} orderId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  static async findById(orderId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ _id: new ObjectId(orderId) });
  }

  /**
   * Find order by Stripe session ID
   * @param {string} sessionId - Stripe checkout session ID
   * @returns {Promise<Object|null>}
   */
  static async findBySessionId(sessionId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ stripeSessionId: sessionId });
  }

  /**
   * Find order by customer email
   * @param {string} email - Customer email
   * @returns {Promise<Array>}
   */
  static async findByCustomerEmail(email) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({ customerEmail: email })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Get all orders with pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.status - Filter by order status
   * @returns {Promise<Object>} Orders and pagination info
   */
  static async findAll({ page = 1, limit = 20, status = null } = {}) {
    const collection = await getCollection(COLLECTION_NAME);

    const query = status ? { orderStatus: status } : {};
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update order status
   * @param {string} orderId - MongoDB ObjectId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated order
   */
  static async update(orderId, updates) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
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
   * Update fulfillment status and tracking
   * @param {string} orderId - MongoDB ObjectId
   * @param {Object} fulfillmentData - Tracking and fulfillment info
   * @returns {Promise<Object>} Updated order
   */
  static async updateFulfillment(orderId, fulfillmentData) {
    const updates = {
      fulfillmentStatus: fulfillmentData.status,
      trackingNumber: fulfillmentData.trackingNumber,
      carrier: fulfillmentData.carrier,
    };

    if (fulfillmentData.status === 'fulfilled') {
      updates.shippedAt = new Date();
    }

    return await this.update(orderId, updates);
  }

  /**
   * Mark order as delivered
   * @param {string} orderId - MongoDB ObjectId
   * @returns {Promise<Object>} Updated order
   */
  static async markAsDelivered(orderId) {
    return await this.update(orderId, {
      orderStatus: 'delivered',
      deliveredAt: new Date(),
    });
  }

  /**
   * Get orders by date range
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Array>}
   */
  static async findByDateRange(startDate, endDate) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Get order statistics
   * @returns {Promise<Object>} Order stats
   */
  static async getStats() {
    const collection = await getCollection(COLLECTION_NAME);

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
          },
        },
      ])
      .toArray();

    const totalOrders = await collection.countDocuments();
    const totalRevenue = await collection
      .aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }])
      .toArray();

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      byStatus: stats,
    };
  }
}
