import { ObjectId } from 'mongodb';
import { getDatabase } from '../connection.js';

const COLLECTION_NAME = 'blockedIPs';

export class BlockedIP {
  /**
   * Block an IP address
   * @param {Object} blockData - Block data
   * @param {string} blockData.ipAddress - IP address to block
   * @param {string} blockData.reason - Reason for blocking
   * @param {string} blockData.blockedBy - Admin user ID who blocked this IP
   * @param {Date} blockData.expiresAt - Optional expiration date (null for permanent)
   * @returns {Promise<Object>} Created block entry
   */
  static async create(blockData) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Check if IP is already blocked
    const existing = await collection.findOne({
      ipAddress: blockData.ipAddress,
      $or: [
        { expiresAt: null }, // permanent block
        { expiresAt: { $gt: new Date() } } // not expired
      ]
    });

    if (existing) {
      throw new Error('IP address is already blocked');
    }

    const block = {
      ipAddress: blockData.ipAddress,
      reason: blockData.reason || 'No reason provided',
      blockedBy: new ObjectId(blockData.blockedBy),
      createdAt: new Date(),
      expiresAt: blockData.expiresAt || null, // null means permanent
    };

    const result = await collection.insertOne(block);

    return {
      ...block,
      _id: result.insertedId,
    };
  }

  /**
   * Check if an IP address is blocked
   * @param {string} ipAddress - IP address to check
   * @returns {Promise<boolean>} True if blocked, false otherwise
   */
  static async isBlocked(ipAddress) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const block = await collection.findOne({
      ipAddress,
      $or: [
        { expiresAt: null }, // permanent block
        { expiresAt: { $gt: new Date() } } // not expired
      ]
    });

    return block !== null;
  }

  /**
   * Get all blocked IPs
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of results (default 100)
   * @param {number} options.skip - Number of results to skip (for pagination)
   * @param {boolean} options.includeExpired - Include expired blocks (default false)
   * @returns {Promise<Array>} Array of blocked IPs
   */
  static async getAll(options = {}) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const query = options.includeExpired
      ? {}
      : {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
          ]
        };

    const limit = options.limit || 100;
    const skip = options.skip || 0;

    const blocks = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    return blocks;
  }

  /**
   * Unblock an IP address
   * @param {string} blockId - Block ID to remove
   * @returns {Promise<boolean>} True if unblocked, false if not found
   */
  static async unblock(blockId) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({
      _id: new ObjectId(blockId),
    });

    return result.deletedCount > 0;
  }

  /**
   * Clean up expired blocks
   * @returns {Promise<number>} Number of blocks deleted
   */
  static async cleanupExpired() {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteMany({
      expiresAt: { $ne: null, $lt: new Date() },
    });

    return result.deletedCount;
  }

  /**
   * Get block details by IP address
   * @param {string} ipAddress - IP address
   * @returns {Promise<Object|null>} Block details or null
   */
  static async getByIP(ipAddress) {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    return await collection.findOne({
      ipAddress,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });
  }

  /**
   * Get statistics
   * @returns {Promise<Object>} Block statistics
   */
  static async getStats() {
    const db = await getDatabase();
    const collection = db.collection(COLLECTION_NAME);

    const [totalBlocks, permanentBlocks, temporaryBlocks, expiredBlocks] = await Promise.all([
      collection.countDocuments({
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      }),
      collection.countDocuments({ expiresAt: null }),
      collection.countDocuments({
        expiresAt: { $ne: null, $gt: new Date() }
      }),
      collection.countDocuments({
        expiresAt: { $ne: null, $lt: new Date() }
      })
    ]);

    return {
      totalBlocks,
      permanentBlocks,
      temporaryBlocks,
      expiredBlocks,
    };
  }
}
