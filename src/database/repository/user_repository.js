import User from '../models/users.js';

/**
 * User Repository
 * Provides CRUD operations for User model
 */
class UserRepository {
  /**
   * Constructor to initialize User collection
   */
  constructor() {
    this.collection = User;
    console.log('User repository initialized with collection:', this.collection.collection.name);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data to create
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      const user = new this.collection(userData);
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User document
   */
  async findById(userId) {
    try {
      return await this.collection.findOne({ userId });
    } catch (error) {
      console.error('Error finding user by ID:', error.message);
      throw error;
    }
  }

  /**
   * Find user by NIP
   * @param {String} nip - NIP number
   * @returns {Promise<Object>} User document
   */
  async findByNip(nip) {
    try {
      return await this.collection.findOne({ nip });
    } catch (error) {
      console.error('Error finding user by NIP:', error.message);
      throw error;
    }
  }

  /**
   * Get all users
   * @param {Object} filter - Optional filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} Array of users
   */
  async findAll(filter = {}, options = {}) {
    try {
      const { limit = 100, skip = 0, sort = { createdAt: -1 } } = options;
      
      return await this.collection.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error finding users:', error.message);
      throw error;
    }
  }

  /**
   * Update user by ID
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    try {
      // Add updated timestamp
      updateData.updatedAt = Date.now();
      
      return await this.collection.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error('Error updating user:', error.message);
      throw error;
    }
  }

  /**
   * Delete user by ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Deleted user info
   */
  async deleteUser(userId) {
    try {
      return await this.collection.findOneAndDelete({ userId });
    } catch (error) {
      console.error('Error deleting user:', error.message);
      throw error;
    }
  }

  /**
   * Count users by filter
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Number>} Count of matching users
   */
  async countUsers(filter = {}) {
    try {
      return await this.collection.countDocuments(filter);
    } catch (error) {
      console.error('Error counting users:', error.message);
      throw error;
    }
  }
}

export default new UserRepository();