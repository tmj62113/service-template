import { getCollection } from '../connection.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'bookings';

/**
 * Booking model for database operations
 * Represents scheduled appointments/sessions
 */
export class Booking {
  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @param {string} bookingData.serviceId - Service ObjectId
   * @param {string} bookingData.clientId - Client/User ObjectId
   * @param {string} bookingData.staffId - Staff ObjectId
   * @param {Date} bookingData.startDateTime - When the appointment starts
   * @param {Date} bookingData.endDateTime - When the appointment ends
   * @param {string} bookingData.timeZone - Client's timezone
   * @param {number} bookingData.duration - Duration in minutes
   * @param {Object} bookingData.clientInfo - Client information snapshot
   * @param {string} bookingData.paymentIntentId - Stripe Payment Intent ID
   * @param {number} bookingData.amount - Amount paid in cents
   * @param {string} bookingData.currency - Currency code (e.g., "USD")
   * @returns {Promise<Object>} Created booking with _id
   */
  static async create(bookingData) {
    const collection = await getCollection(COLLECTION_NAME);

    const booking = {
      // References
      serviceId: new ObjectId(bookingData.serviceId),
      clientId: new ObjectId(bookingData.clientId),
      staffId: new ObjectId(bookingData.staffId),

      // Scheduling
      startDateTime: new Date(bookingData.startDateTime),
      endDateTime: new Date(bookingData.endDateTime),
      timeZone: bookingData.timeZone,
      duration: bookingData.duration, // in minutes

      // Status
      status: bookingData.status || 'pending', // pending, confirmed, completed, cancelled, no-show, rescheduled
      cancellationReason: null,
      cancelledAt: null,
      cancelledBy: null,

      // Payment
      paymentStatus: bookingData.paymentStatus || 'pending', // pending, paid, refunded, failed
      paymentIntentId: bookingData.paymentIntentId || null,
      sessionId: bookingData.sessionId || null, // Stripe Checkout Session ID
      amount: bookingData.amount,
      currency: bookingData.currency || 'USD',
      refundAmount: 0,

      // Client Info (snapshot at booking time)
      clientInfo: {
        name: bookingData.clientInfo?.name || '',
        email: bookingData.clientInfo?.email || '',
        phone: bookingData.clientInfo?.phone || '',
        notes: bookingData.clientInfo?.notes || ''
      },

      // Recurring
      isRecurring: bookingData.isRecurring || false,
      recurringBookingId: bookingData.recurringBookingId
        ? new ObjectId(bookingData.recurringBookingId)
        : null,

      // Notifications
      remindersSent: [],

      // Notes
      internalNotes: bookingData.internalNotes || null,

      // Metadata
      metadata: bookingData.metadata || {},

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(booking);
    return { _id: result.insertedId, ...booking };
  }

  /**
   * Find booking by ID
   * @param {string} bookingId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  static async findById(bookingId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ _id: new ObjectId(bookingId) });
  }

  /**
   * Find booking by payment intent ID
   * @param {string} paymentIntentId - Stripe Payment Intent ID
   * @returns {Promise<Object|null>}
   */
  static async findByPaymentIntent(paymentIntentId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ paymentIntentId });
  }

  /**
   * Find booking by Stripe session ID
   * @param {string} sessionId - Stripe Checkout Session ID
   * @returns {Promise<Object|null>}
   */
  static async findBySessionId(sessionId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ sessionId });
  }

  /**
   * Get all bookings with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.clientId - Filter by client
   * @param {string} options.staffId - Filter by staff
   * @param {string} options.serviceId - Filter by service
   * @param {string} options.status - Filter by status
   * @param {Date} options.startDate - Filter bookings from this date
   * @param {Date} options.endDate - Filter bookings until this date
   * @returns {Promise<Object>} Bookings and pagination info
   */
  static async findAll({
    page = 1,
    limit = 20,
    clientId = null,
    staffId = null,
    serviceId = null,
    status = null,
    startDate = null,
    endDate = null
  } = {}) {
    const collection = await getCollection(COLLECTION_NAME);

    const query = {};
    if (clientId) query.clientId = new ObjectId(clientId);
    if (staffId) query.staffId = new ObjectId(staffId);
    if (serviceId) query.serviceId = new ObjectId(serviceId);
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.startDateTime = {};
      if (startDate) query.startDateTime.$gte = new Date(startDate);
      if (endDate) query.startDateTime.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      collection
        .find(query)
        .sort({ startDateTime: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update booking
   * @param {string} bookingId - MongoDB ObjectId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated booking
   */
  static async update(bookingId, updates) {
    const collection = await getCollection(COLLECTION_NAME);

    // Convert ObjectIds if needed
    if (updates.serviceId) {
      updates.serviceId = new ObjectId(updates.serviceId);
    }
    if (updates.clientId) {
      updates.clientId = new ObjectId(updates.clientId);
    }
    if (updates.staffId) {
      updates.staffId = new ObjectId(updates.staffId);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(bookingId) },
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
   * Cancel a booking
   * @param {string} bookingId - Booking ObjectId
   * @param {string} cancelledBy - User ObjectId who cancelled
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated booking
   */
  static async cancel(bookingId, cancelledBy, reason = null) {
    return await this.update(bookingId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: new ObjectId(cancelledBy),
      cancellationReason: reason
    });
  }

  /**
   * Mark booking as completed
   * @param {string} bookingId - Booking ObjectId
   * @returns {Promise<Object>} Updated booking
   */
  static async markAsCompleted(bookingId) {
    return await this.update(bookingId, {
      status: 'completed'
    });
  }

  /**
   * Mark booking as no-show
   * @param {string} bookingId - Booking ObjectId
   * @returns {Promise<Object>} Updated booking
   */
  static async markAsNoShow(bookingId) {
    return await this.update(bookingId, {
      status: 'no-show'
    });
  }

  /**
   * Confirm a pending booking
   * @param {string} bookingId - Booking ObjectId
   * @returns {Promise<Object>} Updated booking
   */
  static async confirm(bookingId) {
    return await this.update(bookingId, {
      status: 'confirmed'
    });
  }

  /**
   * Reschedule a booking
   * @param {string} bookingId - Booking ObjectId
   * @param {Date} newStartDateTime - New start date/time
   * @param {Date} newEndDateTime - New end date/time
   * @returns {Promise<Object>} Updated booking
   */
  static async reschedule(bookingId, newStartDateTime, newEndDateTime) {
    return await this.update(bookingId, {
      startDateTime: new Date(newStartDateTime),
      endDateTime: new Date(newEndDateTime),
      status: 'confirmed' // Reset to confirmed after rescheduling
    });
  }

  /**
   * Update payment status
   * @param {string} bookingId - Booking ObjectId
   * @param {string} paymentStatus - New payment status
   * @returns {Promise<Object>} Updated booking
   */
  static async updatePaymentStatus(bookingId, paymentStatus) {
    return await this.update(bookingId, { paymentStatus });
  }

  /**
   * Add refund
   * @param {string} bookingId - Booking ObjectId
   * @param {number} refundAmount - Refund amount in cents
   * @returns {Promise<Object>} Updated booking
   */
  static async addRefund(bookingId, refundAmount) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(bookingId) },
      {
        $inc: { refundAmount: refundAmount },
        $set: {
          paymentStatus: 'refunded',
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Add reminder sent record
   * @param {string} bookingId - Booking ObjectId
   * @param {string} reminderType - Type of reminder (e.g., "24h", "1h", "confirmation")
   * @returns {Promise<Object>} Updated booking
   */
  static async addReminderSent(bookingId, reminderType) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(bookingId) },
      {
        $push: {
          remindersSent: {
            sentAt: new Date(),
            type: reminderType
          }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Get bookings by client
   * @param {string} clientId - Client ObjectId
   * @returns {Promise<Array>}
   */
  static async findByClient(clientId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({ clientId: new ObjectId(clientId) })
      .sort({ startDateTime: -1 })
      .toArray();
  }

  /**
   * Get bookings by staff member
   * @param {string} staffId - Staff ObjectId
   * @returns {Promise<Array>}
   */
  static async findByStaff(staffId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({ staffId: new ObjectId(staffId) })
      .sort({ startDateTime: -1 })
      .toArray();
  }

  /**
   * Get bookings by date range
   * @param {Date} startDate - Start of range
   * @param {Date} endDate - End of range
   * @returns {Promise<Array>}
   */
  static async findByDateRange(startDate, endDate) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({
        startDateTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .sort({ startDateTime: 1 })
      .toArray();
  }

  /**
   * Get upcoming bookings for a staff member
   * @param {string} staffId - Staff ObjectId
   * @param {number} days - Number of days ahead (default: 7)
   * @returns {Promise<Array>}
   */
  static async getUpcomingForStaff(staffId, days = 7) {
    const collection = await getCollection(COLLECTION_NAME);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await collection
      .find({
        staffId: new ObjectId(staffId),
        startDateTime: {
          $gte: now,
          $lte: futureDate
        },
        status: { $nin: ['cancelled', 'completed', 'no-show'] }
      })
      .sort({ startDateTime: 1 })
      .toArray();
  }

  /**
   * Check if a time slot is available for a staff member
   * @param {string} staffId - Staff ObjectId
   * @param {Date} startDateTime - Proposed start time
   * @param {Date} endDateTime - Proposed end time
   * @param {string} excludeBookingId - Optional booking ID to exclude (for rescheduling)
   * @returns {Promise<boolean>} True if available
   */
  static async isSlotAvailable(staffId, startDateTime, endDateTime, excludeBookingId = null) {
    const collection = await getCollection(COLLECTION_NAME);

    const query = {
      staffId: new ObjectId(staffId),
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        // New booking starts during existing booking
        {
          startDateTime: { $lte: new Date(startDateTime) },
          endDateTime: { $gt: new Date(startDateTime) }
        },
        // New booking ends during existing booking
        {
          startDateTime: { $lt: new Date(endDateTime) },
          endDateTime: { $gte: new Date(endDateTime) }
        },
        // New booking completely contains existing booking
        {
          startDateTime: { $gte: new Date(startDateTime) },
          endDateTime: { $lte: new Date(endDateTime) }
        }
      ]
    };

    // Exclude a specific booking (for rescheduling)
    if (excludeBookingId) {
      query._id = { $ne: new ObjectId(excludeBookingId) };
    }

    const conflictingBooking = await collection.findOne(query);
    return !conflictingBooking; // Available if no conflicts found
  }

  /**
   * Get booking statistics
   * @returns {Promise<Object>} Booking stats
   */
  static async getStats() {
    const collection = await getCollection(COLLECTION_NAME);

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$amount' },
          },
        },
      ])
      .toArray();

    const totalBookings = await collection.countDocuments();
    const totalRevenue = await collection
      .aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
      .toArray();

    return {
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      byStatus: stats,
    };
  }

  /**
   * Get bookings that need reminders
   * @param {string} reminderType - Type of reminder ("24h", "1h")
   * @returns {Promise<Array>} Bookings needing reminders
   */
  static async findNeedingReminders(reminderType) {
    const collection = await getCollection(COLLECTION_NAME);
    const now = new Date();

    // Calculate time window based on reminder type
    let hoursAhead;
    if (reminderType === '24h') {
      hoursAhead = 24;
    } else if (reminderType === '1h') {
      hoursAhead = 1;
    } else {
      throw new Error('Invalid reminder type');
    }

    const startTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000));
    const endTime = new Date(startTime.getTime() + (15 * 60 * 1000)); // 15-minute window

    return await collection
      .find({
        startDateTime: {
          $gte: startTime,
          $lte: endTime
        },
        status: { $in: ['pending', 'confirmed'] },
        'remindersSent.type': { $ne: reminderType } // Haven't sent this type yet
      })
      .toArray();
  }

  /**
   * Hard delete booking from database
   * WARNING: This permanently removes the booking. Consider using cancel() instead for audit trail.
   * @param {string} bookingId - MongoDB ObjectId
   * @returns {Promise<boolean>} Success status
   */
  static async delete(bookingId) {
    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(bookingId) });
    return result.deletedCount > 0;
  }
}
