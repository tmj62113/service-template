import { getCollection } from '../connection.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'products';

/**
 * Product model for database operations
 */
export class Product {
  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product with _id
   */
  static async create(productData) {
    const collection = await getCollection(COLLECTION_NAME);

    const product = {
      name: productData.name,
      price: productData.price,
      image: productData.image,
      category: productData.category,
      description: productData.description,
      stock: productData.stock || 0,
      rating: productData.rating !== undefined ? productData.rating : 4.5,
      reviews: productData.reviews !== undefined ? productData.reviews : 0,
      status: productData.status || 'Available', // Available, In Review, Sold Out, Preorder
      isActive: productData.isActive !== undefined ? productData.isActive : true,

      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(product);
    return { _id: result.insertedId, ...product };
  }

  /**
   * Find product by ID
   * @param {string} productId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  static async findById(productId) {
    const collection = await getCollection(COLLECTION_NAME);
    return await collection.findOne({ _id: new ObjectId(productId) });
  }

  /**
   * Get all products with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.category - Filter by category
   * @param {string} options.status - Filter by status
   * @param {boolean} options.isActive - Filter by active status
   * @returns {Promise<Object>} Products and pagination info
   */
  static async findAll({ page = 1, limit = 20, category = null, status = null, isActive = null } = {}) {
    const collection = await getCollection(COLLECTION_NAME);

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (isActive !== null) query.isActive = isActive;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update product
   * @param {string} productId - MongoDB ObjectId
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated product
   */
  static async update(productId, updates) {
    const collection = await getCollection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(productId) },
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
   * Delete product (soft delete by setting isActive to false)
   * @param {string} productId - MongoDB ObjectId
   * @returns {Promise<Object>} Updated product
   */
  static async softDelete(productId) {
    return await this.update(productId, { isActive: false });
  }

  /**
   * Hard delete product from database
   * @param {string} productId - MongoDB ObjectId
   * @returns {Promise<boolean>} Success status
   */
  static async delete(productId) {
    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(productId) });
    return result.deletedCount > 0;
  }

  /**
   * Update product stock
   * @param {string} productId - MongoDB ObjectId
   * @param {number} quantity - Quantity to add (positive) or remove (negative)
   * @returns {Promise<Object>} Updated product
   */
  static async updateStock(productId, quantity) {
    const collection = await getCollection(COLLECTION_NAME);

    // First get the current product to check stock after update
    const product = await collection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      throw new Error('Product not found');
    }

    const newStock = product.stock + quantity;
    const updateFields = {
      $inc: { stock: quantity },
      $set: { updatedAt: new Date() },
    };

    // If stock reaches 0 or below, set status to "Sold Out"
    if (newStock <= 0) {
      updateFields.$set.status = 'Sold Out';
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(productId) },
      updateFields,
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Get products by category
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
   * Search products by name or description
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
   * Get product statistics
   * @returns {Promise<Object>} Product stats
   */
  static async getStats() {
    const collection = await getCollection(COLLECTION_NAME);

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          },
        },
      ])
      .toArray();

    const totalProducts = await collection.countDocuments({ isActive: true });
    const lowStock = await collection.countDocuments({ stock: { $lt: 10 }, isActive: true });

    return {
      totalProducts,
      lowStock,
      byCategory: stats,
    };
  }
}
