import { ObjectId } from 'mongodb';
import { getDatabase } from '../connection.js';

const COLLECTION_NAME = 'sessions';

export class Session {
  /**
   * Create a new session
   * @param {Object} sessionData - Session data
   * @param {string} sessionData.userId - User ID
   * @param {string} sessionData.token - JWT token
   * @param {string} sessionData.ipAddress - IP address
   * @param {string} sessionData.userAgent - User agent string
   * @returns {Promise<Object>} Created session
   */
  static async create(sessionData) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const session = {
      userId: new ObjectId(sessionData.userId),
      token: sessionData.token,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    const result = await collection.insertOne(session);

    return {
      ...session,
      _id: result.insertedId,
    };
  }

  /**
   * Find all active sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of active sessions
   */
  static async findByUserId(userId) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const sessions = await collection
      .find({
        userId: new ObjectId(userId),
        expiresAt: { $gt: new Date() },
      })
      .sort({ lastActivity: -1 })
      .toArray();

    return sessions;
  }

  /**
   * Find session by token
   * @param {string} token - JWT token
   * @returns {Promise<Object|null>} Session object or null
   */
  static async findByToken(token) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    return await collection.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Update session last activity
   * @param {string} token - JWT token
   * @returns {Promise<void>}
   */
  static async updateLastActivity(token) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { token },
      {
        $set: {
          lastActivity: new Date(),
        },
      }
    );
  }

  /**
   * Delete a specific session
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<boolean>} True if deleted, false if not found or unauthorized
   */
  static async deleteById(sessionId, userId) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({
      _id: new ObjectId(sessionId),
      userId: new ObjectId(userId),
    });

    return result.deletedCount > 0;
  }

  /**
   * Delete all sessions for a user except the current one
   * @param {string} userId - User ID
   * @param {string} currentToken - Current session token to keep
   * @returns {Promise<number>} Number of sessions deleted
   */
  static async deleteAllExceptCurrent(userId, currentToken) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteMany({
      userId: new ObjectId(userId),
      token: { $ne: currentToken },
    });

    return result.deletedCount;
  }

  /**
   * Delete session by token
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} True if deleted
   */
  static async deleteByToken(token) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({ token });
    return result.deletedCount > 0;
  }

  /**
   * Clean up expired sessions
   * @returns {Promise<number>} Number of sessions deleted
   */
  static async cleanupExpired() {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    return result.deletedCount;
  }

  /**
   * Get session statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Session statistics
   */
  static async getStats(userId) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const [activeSessions, totalSessions] = await Promise.all([
      collection.countDocuments({
        userId: new ObjectId(userId),
        expiresAt: { $gt: new Date() },
      }),
      collection.countDocuments({
        userId: new ObjectId(userId),
      }),
    ]);

    return {
      activeSessions,
      totalSessions,
    };
  }
}
