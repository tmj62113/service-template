import { getCollection } from '../connection.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'recurring_bookings';

/**
 * RecurringBooking model for database operations
 * Manages recurring appointment patterns
 */
export class RecurringBooking {
  /**
   * Create a new recurring booking pattern
   * @param {Object} recurringData - Recurring booking data
   * @param {string} recurringData.clientId - Client ObjectId
   * @param {string} recurringData.staffId - Staff ObjectId
   * @param {string} recurringData.serviceId - Service ObjectId
   * @param {string} recurringData.frequency - "weekly", "biweekly", "monthly"
   * @param {number} recurringData.interval - Every N weeks/months (usually 1)
   * @param {number} recurringData.dayOfWeek - For weekly (0-6, 0=Sunday)
   * @param {number} recurringData.dayOfMonth - For monthly (1-31)
   * @param {string} recurringData.startTime - Time of day (e.g., "14:00")
   * @param {number} recurringData.duration - Duration in minutes
   * @param {string} recurringData.timeZone - Timezone
   * @param {Date} recurringData.startDate - First occurrence
   * @param {Date} recurringData.endDate - Last occurrence (or null for indefinite)
   * @param {number} recurringData.occurrences - Alternative to endDate
   * @param {string} recurringData.paymentPlan - "per_session" or "monthly_subscription"
   * @returns {Promise<Object>} Created recurring booking with _id
   */
  static async create(recurringData) {
    const collection = await getCollection(COLLECTION_NAME);

    const recurringBooking = {
      clientId: new ObjectId(recurringData.clientId),
      staffId: new ObjectId(recurringData.staffId),
      serviceId: new ObjectId(recurringData.serviceId),

      // Recurrence pattern
      frequency: recurringData.frequency, // "weekly", "biweekly", "monthly"
      interval: recurringData.interval || 1, // Every N weeks/months
      dayOfWeek: recurringData.dayOfWeek || null, // For weekly (0-6)
      dayOfMonth: recurringData.dayOfMonth || null, // For monthly (1-31)

      // Time
      startTime: recurringData.startTime, // e.g., "14:00"
      duration: recurringData.duration, // Minutes
      timeZone: recurringData.timeZone,

      // Date range
      startDate: new Date(recurringData.startDate), // First occurrence
      endDate: recurringData.endDate ? new Date(recurringData.endDate) : null, // Last occurrence
      occurrences: recurringData.occurrences || null, // Alternative to endDate

      // Generated bookings
      bookingIds: [], // Will be populated as bookings are created

      // Status
      status: recurringData.status || 'active', // active, paused, cancelled, completed

      // Payment
      paymentPlan: recurringData.paymentPlan || 'per_session', // "per_session", "monthly_subscription"

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(recurringBooking);
    return { _id: result.insertedId, ...recurringBooking };
  }

  /**
   * Find recurring booking by ID
   * @param {string} recurringBookingId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  static async findById(recurringBookingId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ _id: new ObjectId(recurringBookingId) });
  }

  /**
   * Get all recurring bookings for a client
   * @param {string} clientId - Client ObjectId
   * @returns {Promise<Array>}
   */
  static async findByClient(clientId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({ clientId: new ObjectId(clientId) })
      .sort({ startDate: -1 })
      .toArray();
  }

  /**
   * Get all recurring bookings for a staff member
   * @param {string} staffId - Staff ObjectId
   * @returns {Promise<Array>}
   */
  static async findByStaff(staffId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({ staffId: new ObjectId(staffId) })
      .sort({ startDate: -1 })
      .toArray();
  }

  /**
   * Get all active recurring bookings
   * @returns {Promise<Array>}
   */
  static async findActive() {
    const collection = await getCollection(COLLECTION_NAME);
    const now = new Date();

    return await collection
      .find({
        status: 'active',
        $or: [
          { endDate: null },
          { endDate: { $gte: now } }
        ]
      })
      .toArray();
  }

  /**
   * Update recurring booking
   * @param {string} recurringBookingId - MongoDB ObjectId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated recurring booking
   */
  static async update(recurringBookingId, updates) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(recurringBookingId) },
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
   * Add a booking ID to the recurring pattern
   * @param {string} recurringBookingId - Recurring booking ObjectId
   * @param {string} bookingId - Booking ObjectId
   * @returns {Promise<Object>} Updated recurring booking
   */
  static async addBooking(recurringBookingId, bookingId) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(recurringBookingId) },
      {
        $push: { bookingIds: new ObjectId(bookingId) },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Pause recurring booking
   * @param {string} recurringBookingId - Recurring booking ObjectId
   * @returns {Promise<Object>} Updated recurring booking
   */
  static async pause(recurringBookingId) {
    return await this.update(recurringBookingId, { status: 'paused' });
  }

  /**
   * Resume paused recurring booking
   * @param {string} recurringBookingId - Recurring booking ObjectId
   * @returns {Promise<Object>} Updated recurring booking
   */
  static async resume(recurringBookingId) {
    return await this.update(recurringBookingId, { status: 'active' });
  }

  /**
   * Cancel recurring booking (cancels all future occurrences)
   * @param {string} recurringBookingId - Recurring booking ObjectId
   * @returns {Promise<Object>} Updated recurring booking
   */
  static async cancel(recurringBookingId) {
    return await this.update(recurringBookingId, {
      status: 'cancelled',
      endDate: new Date() // End it today
    });
  }

  /**
   * Mark recurring booking as completed
   * @param {string} recurringBookingId - Recurring booking ObjectId
   * @returns {Promise<Object>} Updated recurring booking
   */
  static async markAsCompleted(recurringBookingId) {
    return await this.update(recurringBookingId, { status: 'completed' });
  }

  /**
   * Delete recurring booking
   * @param {string} recurringBookingId - MongoDB ObjectId
   * @returns {Promise<boolean>} Success status
   */
  static async delete(recurringBookingId) {
    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(recurringBookingId) });
    return result.deletedCount > 0;
  }

  /**
   * Calculate next occurrence date based on recurrence pattern
   * @param {Object} recurringBooking - Recurring booking object
   * @param {Date} fromDate - Calculate from this date
   * @returns {Date|null} Next occurrence date or null if series ended
   */
  static calculateNextOccurrence(recurringBooking, fromDate = new Date()) {
    const { frequency, interval, dayOfWeek, dayOfMonth, startDate, endDate, occurrences, bookingIds } = recurringBooking;

    // Check if series has ended
    if (endDate && fromDate >= endDate) {
      return null;
    }

    // Check if max occurrences reached
    if (occurrences && bookingIds && bookingIds.length >= occurrences) {
      return null;
    }

    const nextDate = new Date(fromDate);

    switch (frequency) {
      case 'weekly':
        // Find next occurrence of the specified day of week
        const daysUntilNext = (dayOfWeek - nextDate.getDay() + 7) % 7;
        nextDate.setDate(nextDate.getDate() + (daysUntilNext || 7 * interval));
        break;

      case 'biweekly':
        // Every 2 weeks on the specified day
        const daysUntilNextBiweekly = (dayOfWeek - nextDate.getDay() + 7) % 7;
        nextDate.setDate(nextDate.getDate() + (daysUntilNextBiweekly || 14));
        break;

      case 'monthly':
        // Same day of month, every N months
        nextDate.setMonth(nextDate.getMonth() + interval);
        nextDate.setDate(dayOfMonth);

        // Handle edge case where day doesn't exist in month (e.g., Feb 31)
        if (nextDate.getDate() !== dayOfMonth) {
          // Set to last day of previous month
          nextDate.setDate(0);
        }
        break;

      default:
        return null;
    }

    // Don't go before start date
    if (nextDate < startDate) {
      return this.calculateNextOccurrence(recurringBooking, new Date(startDate));
    }

    // Don't go past end date
    if (endDate && nextDate > endDate) {
      return null;
    }

    return nextDate;
  }

  /**
   * Generate all occurrence dates for the recurring booking
   * @param {Object} recurringBooking - Recurring booking object
   * @param {number} maxToGenerate - Maximum number to generate (default: 52 for 1 year)
   * @returns {Array<Date>} Array of occurrence dates
   */
  static generateOccurrenceDates(recurringBooking, maxToGenerate = 52) {
    const dates = [];
    let currentDate = new Date(recurringBooking.startDate);

    while (dates.length < maxToGenerate) {
      const nextDate = this.calculateNextOccurrence(recurringBooking, currentDate);

      if (!nextDate) {
        break; // Series ended
      }

      dates.push(nextDate);
      currentDate = new Date(nextDate);
      currentDate.setDate(currentDate.getDate() + 1); // Move to next day to find next occurrence
    }

    return dates;
  }

  /**
   * Get recurring booking statistics
   * @returns {Promise<Object>} Recurring booking stats
   */
  static async getStats() {
    const collection = await getCollection(COLLECTION_NAME);

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const totalRecurring = await collection.countDocuments();
    const activeRecurring = await collection.countDocuments({ status: 'active' });

    return {
      totalRecurring,
      activeRecurring,
      byStatus: stats,
    };
  }
}
