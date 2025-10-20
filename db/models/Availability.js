import { getCollection } from '../connection.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'availability';

/**
 * Availability model for database operations
 * Manages when staff members are available for bookings
 */
export class Availability {
  /**
   * Create availability schedule for a staff member
   * @param {Object} availabilityData - Availability data
   * @param {string} availabilityData.staffId - Staff ObjectId
   * @param {Array<Object>} availabilityData.schedule - Regular weekly schedule
   * @param {Array<Object>} availabilityData.exceptions - Time off or special hours
   * @param {Array<Object>} availabilityData.overrides - One-time available slots
   * @param {Date} availabilityData.effectiveFrom - When this schedule starts
   * @param {Date} availabilityData.effectiveTo - When this schedule ends (null = indefinite)
   * @returns {Promise<Object>} Created availability with _id
   */
  static async create(availabilityData) {
    const collection = await getCollection(COLLECTION_NAME);

    const availability = {
      staffId: new ObjectId(availabilityData.staffId),

      // Regular weekly schedule
      // Format: [{ dayOfWeek: 0-6, timeSlots: [{ startTime: "09:00", endTime: "17:00" }] }]
      schedule: availabilityData.schedule || [],

      // Exceptions (time off, special hours)
      // Format: [{ date: Date, type: "unavailable"|"custom_hours", timeSlots: [...], reason: "" }]
      exceptions: availabilityData.exceptions || [],

      // Overrides (one-time available slots outside regular schedule)
      // Format: [{ date: Date, timeSlots: [{ startTime: "09:00", endTime: "12:00" }] }]
      overrides: availabilityData.overrides || [],

      // Effective date range
      effectiveFrom: availabilityData.effectiveFrom
        ? new Date(availabilityData.effectiveFrom)
        : new Date(),
      effectiveTo: availabilityData.effectiveTo
        ? new Date(availabilityData.effectiveTo)
        : null, // null = indefinite

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(availability);
    return { _id: result.insertedId, ...availability };
  }

  /**
   * Find availability by ID
   * @param {string} availabilityId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  static async findById(availabilityId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ _id: new ObjectId(availabilityId) });
  }

  /**
   * Find current availability for a staff member
   * @param {string} staffId - Staff ObjectId
   * @returns {Promise<Object|null>}
   */
  static async findByStaff(staffId) {
    const collection = await getCollection(COLLECTION_NAME);
    const now = new Date();

    return await collection.findOne({
      staffId: new ObjectId(staffId),
      effectiveFrom: { $lte: now },
      $or: [
        { effectiveTo: null },
        { effectiveTo: { $gte: now } }
      ]
    });
  }

  /**
   * Find all availability schedules for a staff member
   * @param {string} staffId - Staff ObjectId
   * @returns {Promise<Array>}
   */
  static async findAllByStaff(staffId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection
      .find({ staffId: new ObjectId(staffId) })
      .sort({ effectiveFrom: -1 })
      .toArray();
  }

  /**
   * Update availability
   * @param {string} availabilityId - MongoDB ObjectId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated availability
   */
  static async update(availabilityId, updates) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(availabilityId) },
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
   * Update regular weekly schedule
   * @param {string} availabilityId - Availability ObjectId
   * @param {Array<Object>} schedule - New schedule
   * @returns {Promise<Object>} Updated availability
   */
  static async updateSchedule(availabilityId, schedule) {
    return await this.update(availabilityId, { schedule });
  }

  /**
   * Add exception (time off or special hours)
   * @param {string} availabilityId - Availability ObjectId
   * @param {Object} exception - Exception data
   * @param {Date} exception.date - Date of exception
   * @param {string} exception.type - "unavailable" or "custom_hours"
   * @param {Array<Object>} exception.timeSlots - Time slots (if custom_hours)
   * @param {string} exception.reason - Reason for exception
   * @returns {Promise<Object>} Updated availability
   */
  static async addException(availabilityId, exception) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(availabilityId) },
      {
        $push: {
          exceptions: {
            date: new Date(exception.date),
            type: exception.type,
            timeSlots: exception.timeSlots || [],
            reason: exception.reason || ''
          }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Remove exception by date
   * @param {string} availabilityId - Availability ObjectId
   * @param {Date} date - Date of exception to remove
   * @returns {Promise<Object>} Updated availability
   */
  static async removeException(availabilityId, date) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(availabilityId) },
      {
        $pull: {
          exceptions: { date: new Date(date) }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Add override (one-time available slot)
   * @param {string} availabilityId - Availability ObjectId
   * @param {Object} override - Override data
   * @param {Date} override.date - Date of override
   * @param {Array<Object>} override.timeSlots - Available time slots
   * @returns {Promise<Object>} Updated availability
   */
  static async addOverride(availabilityId, override) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(availabilityId) },
      {
        $push: {
          overrides: {
            date: new Date(override.date),
            timeSlots: override.timeSlots
          }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Remove override by date
   * @param {string} availabilityId - Availability ObjectId
   * @param {Date} date - Date of override to remove
   * @returns {Promise<Object>} Updated availability
   */
  static async removeOverride(availabilityId, date) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(availabilityId) },
      {
        $pull: {
          overrides: { date: new Date(date) }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Delete availability schedule
   * @param {string} availabilityId - MongoDB ObjectId
   * @returns {Promise<boolean>} Success status
   */
  static async delete(availabilityId) {
    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(availabilityId) });
    return result.deletedCount > 0;
  }

  /**
   * Get availability for a specific date
   * @param {string} staffId - Staff ObjectId
   * @param {Date} date - Date to check
   * @returns {Promise<Object|null>} Available time slots for that date
   */
  static async getAvailabilityForDate(staffId, date) {
    const availability = await this.findByStaff(staffId);
    if (!availability) {
      return null;
    }

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Check for exceptions first (time off or special hours)
    const exception = availability.exceptions?.find(exc => {
      const excDate = new Date(exc.date);
      return excDate.toDateString() === targetDate.toDateString();
    });

    if (exception) {
      if (exception.type === 'unavailable') {
        return { available: false, reason: exception.reason, timeSlots: [] };
      }
      if (exception.type === 'custom_hours') {
        return { available: true, timeSlots: exception.timeSlots };
      }
    }

    // Check for overrides (one-time availability)
    const override = availability.overrides?.find(ovr => {
      const ovrDate = new Date(ovr.date);
      return ovrDate.toDateString() === targetDate.toDateString();
    });

    if (override) {
      return { available: true, timeSlots: override.timeSlots };
    }

    // Use regular weekly schedule
    const daySchedule = availability.schedule?.find(s => s.dayOfWeek === dayOfWeek);

    if (!daySchedule || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
      return { available: false, reason: 'Not scheduled to work', timeSlots: [] };
    }

    return { available: true, timeSlots: daySchedule.timeSlots };
  }

  /**
   * Check if staff is available at a specific date/time
   * @param {string} staffId - Staff ObjectId
   * @param {Date} startDateTime - Start date/time to check
   * @param {Date} endDateTime - End date/time to check
   * @returns {Promise<boolean>} True if available
   */
  static async isAvailableAtTime(staffId, startDateTime, endDateTime) {
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    const dateAvailability = await this.getAvailabilityForDate(staffId, startDate);

    if (!dateAvailability || !dateAvailability.available) {
      return false;
    }

    // Extract time from startDateTime and endDateTime
    const startTimeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    // Check if the requested time falls within any available time slot
    for (const slot of dateAvailability.timeSlots) {
      if (startTimeStr >= slot.startTime && endTimeStr <= slot.endTime) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get available time slots for a staff member and service on a specific date
   * @param {string} staffId - Staff ObjectId
   * @param {Date} date - Date to check
   * @param {number} duration - Service duration in minutes
   * @param {number} bufferTime - Buffer time between bookings in minutes
   * @returns {Promise<Array>} Array of available time slots
   */
  static async getAvailableSlots(staffId, date, duration, bufferTime = 0) {
    const dateAvailability = await this.getAvailabilityForDate(staffId, date);

    if (!dateAvailability || !dateAvailability.available) {
      return [];
    }

    const availableSlots = [];
    const totalDuration = duration + bufferTime;

    // For each time slot in the schedule, generate possible booking times
    for (const slot of dateAvailability.timeSlots) {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);

      const slotStartMinutes = startHour * 60 + startMin;
      const slotEndMinutes = endHour * 60 + endMin;

      // Generate slots (every 15 minutes by default)
      const slotInterval = 15; // minutes
      for (let time = slotStartMinutes; time + totalDuration <= slotEndMinutes; time += slotInterval) {
        const slotHour = Math.floor(time / 60);
        const slotMin = time % 60;

        availableSlots.push({
          startTime: `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`,
          endTime: `${String(Math.floor((time + duration) / 60)).padStart(2, '0')}:${String((time + duration) % 60).padStart(2, '0')}`
        });
      }
    }

    return availableSlots;
  }
}
