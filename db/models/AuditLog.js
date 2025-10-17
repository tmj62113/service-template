import { ObjectId } from 'mongodb';
import { getDatabase } from '../connection.js';

const COLLECTION_NAME = 'auditLogs';

/**
 * Audit Log Event Types
 */
export const AuditEventType = {
  // Authentication events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  TWO_FA_ENABLED: 'two_fa_enabled',
  TWO_FA_DISABLED: 'two_fa_disabled',
  TWO_FA_CODE_SENT: 'two_fa_code_sent',
  TWO_FA_VERIFIED: 'two_fa_verified',

  // Session events
  SESSION_CREATED: 'session_created',
  SESSION_DELETED: 'session_deleted',
  ALL_SESSIONS_DELETED: 'all_sessions_deleted',

  // Product events
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  PRODUCT_DELETED: 'product_deleted',
  PRODUCT_IMAGE_UPLOADED: 'product_image_uploaded',

  // Order events
  ORDER_STATUS_CHANGED: 'order_status_changed',
  ORDER_FULFILLED: 'order_fulfilled',
  SHIPMENT_CREATED: 'shipment_created',

  // Customer events
  CUSTOMER_UPDATED: 'customer_updated',

  // Message events
  MESSAGE_STATUS_CHANGED: 'message_status_changed',
  MESSAGE_DELETED: 'message_deleted',
  MESSAGE_EMAIL_SENT: 'message_email_sent',

  // Newsletter events
  NEWSLETTER_SENT: 'newsletter_sent',
  NEWSLETTER_DRAFT_CREATED: 'newsletter_draft_created',
  NEWSLETTER_DRAFT_UPDATED: 'newsletter_draft_updated',
  NEWSLETTER_DRAFT_DELETED: 'newsletter_draft_deleted',
  SUBSCRIBER_DELETED: 'subscriber_deleted',

  // Security events
  ACCOUNT_LOCKED: 'account_locked',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  CSRF_TOKEN_INVALID: 'csrf_token_invalid',
};

export class AuditLog {
  /**
   * Create an audit log entry
   * @param {Object} logData - Audit log data
   * @param {string} logData.eventType - Type of event (from AuditEventType)
   * @param {string} logData.userId - User ID who performed the action
   * @param {string} logData.ipAddress - IP address of the requester
   * @param {string} logData.userAgent - User agent string
   * @param {Object} logData.metadata - Additional event-specific data
   * @param {string} logData.resource - Resource affected (e.g., 'product:123', 'order:456')
   * @param {string} logData.action - Action performed (e.g., 'create', 'update', 'delete')
   * @param {boolean} logData.success - Whether the action was successful
   * @returns {Promise<Object>} Created audit log entry
   */
  static async create(logData) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const auditLog = {
      eventType: logData.eventType,
      userId: logData.userId ? new ObjectId(logData.userId) : null,
      ipAddress: logData.ipAddress || 'unknown',
      userAgent: logData.userAgent || 'unknown',
      metadata: logData.metadata || {},
      resource: logData.resource || null,
      action: logData.action || null,
      success: logData.success !== undefined ? logData.success : true,
      timestamp: new Date(),
    };

    const result = await collection.insertOne(auditLog);

    return {
      ...auditLog,
      _id: result.insertedId,
    };
  }

  /**
   * Find audit logs with filters
   * @param {Object} filters - Filter options
   * @param {string} filters.userId - Filter by user ID
   * @param {string} filters.eventType - Filter by event type
   * @param {Date} filters.startDate - Filter logs after this date
   * @param {Date} filters.endDate - Filter logs before this date
   * @param {string} filters.ipAddress - Filter by IP address
   * @param {number} filters.limit - Maximum number of results (default 100)
   * @param {number} filters.skip - Number of results to skip (for pagination)
   * @returns {Promise<Array>} Array of audit logs
   */
  static async find(filters = {}) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const query = {};

    if (filters.userId) {
      query.userId = new ObjectId(filters.userId);
    }

    if (filters.eventType) {
      query.eventType = filters.eventType;
    }

    if (filters.ipAddress) {
      query.ipAddress = filters.ipAddress;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.timestamp.$lte = new Date(filters.endDate);
      }
    }

    const limit = filters.limit || 100;
    const skip = filters.skip || 0;

    const logs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    return logs;
  }

  /**
   * Get audit log statistics
   * @param {Object} filters - Filter options
   * @param {string} filters.userId - Filter by user ID
   * @param {Date} filters.startDate - Start date
   * @param {Date} filters.endDate - End date
   * @returns {Promise<Object>} Audit log statistics
   */
  static async getStats(filters = {}) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const query = {};

    if (filters.userId) {
      query.userId = new ObjectId(filters.userId);
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.timestamp.$lte = new Date(filters.endDate);
      }
    }

    const [totalLogs, eventTypeCounts, successRate] = await Promise.all([
      collection.countDocuments(query),
      collection.aggregate([
        { $match: query },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      collection.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            successful: {
              $sum: { $cond: ['$success', 1, 0] }
            }
          }
        }
      ]).toArray()
    ]);

    const successRatePercentage = successRate.length > 0
      ? (successRate[0].successful / successRate[0].total) * 100
      : 0;

    return {
      totalLogs,
      eventTypeCounts: eventTypeCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      successRate: successRatePercentage,
    };
  }

  /**
   * Get recent security events
   * @param {Object} options - Options for filtering and pagination
   * @param {number} options.limit - Number of events to retrieve (default 50)
   * @param {Date} options.startDate - Filter events after this date
   * @param {Date} options.endDate - Filter events before this date
   * @returns {Promise<Array>} Recent security events
   */
  static async getRecentSecurityEvents(options = {}) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const securityEventTypes = [
      AuditEventType.LOGIN_SUCCESS,
      AuditEventType.LOGIN_FAILED,
      AuditEventType.LOGOUT,
      AuditEventType.ACCOUNT_LOCKED,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditEventType.CSRF_TOKEN_INVALID,
      AuditEventType.TWO_FA_ENABLED,
      AuditEventType.TWO_FA_DISABLED,
      AuditEventType.PASSWORD_CHANGED,
      AuditEventType.PASSWORD_RESET_REQUESTED,
      AuditEventType.PASSWORD_RESET_COMPLETED,
    ];

    const query = {
      eventType: { $in: securityEventTypes }
    };

    // Add date range filter if provided
    if (options.startDate || options.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        query.timestamp.$gte = new Date(options.startDate);
      }
      if (options.endDate) {
        query.timestamp.$lte = new Date(options.endDate);
      }
    }

    const limit = options.limit || 50;

    const logs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return logs;
  }

  /**
   * Get failed login attempts for an IP address
   * @param {string} ipAddress - IP address
   * @param {Date} since - Count attempts since this time
   * @returns {Promise<number>} Number of failed attempts
   */
  static async getFailedLoginAttempts(ipAddress, since = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const count = await collection.countDocuments({
      eventType: AuditEventType.LOGIN_FAILED,
      ipAddress,
      timestamp: { $gte: since }
    });

    return count;
  }

  /**
   * Clean up old audit logs (older than specified days)
   * @param {number} days - Delete logs older than this many days
   * @returns {Promise<number>} Number of logs deleted
   */
  static async cleanupOldLogs(days = 90) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await collection.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return result.deletedCount;
  }
}
