import UserAuth from '../models/user_auth.js';

/**
 * User Authentication Repository
 * Provides operations for user authentication data management
 */
class AuthRepository {

  constructor() {
    this.collection = UserAuth;
    console.log('Auth repository initialized with collection:', this.collection.collection.name);
  }
  /**
   * Create a new user authentication record
   * @param {Object} authData - User authentication data
   * @returns {Promise<Object>} Created user authentication record
   */
  async createAuth(authData) {
    try {
      const auth = new UserAuth(authData);
      return await auth.save();
    } catch (error) {
      console.error('Error creating user authentication:', error.message);
      throw error;
    }
  }

  /**
   * Find user authentication by email
   * @param {String} email - User email
   * @returns {Promise<Object>} User authentication document
   */
  async findByEmail(email) {
    try {
      return await UserAuth.findOne({ email });
    } catch (error) {
      console.error('Error finding user authentication by email:', error.message);
      throw error;
    }
  }

  /**
   * Find user authentication by user ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User authentication document
   */
  async findByUserId(userId) {
    try {
      return await UserAuth.findOne({ userId });
    } catch (error) {
      console.error('Error finding user authentication by user ID:', error.message);
      throw error;
    }
  }

  /**
   * Update user authentication by user ID
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user authentication
   */
  async updateAuth(userId, updateData) {
    try {
      // Add updated timestamp
      updateData.updatedAt = Date.now();
      
      return await UserAuth.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error('Error updating user authentication:', error.message);
      throw error;
    }
  }

  /**
   * Update password by user ID
   * @param {String} userId - User ID
   * @param {String} newPassword - New password (should be hashed before calling this method)
   * @returns {Promise<Object>} Updated user authentication
   */
  async updatePassword(userId, newPassword) {
    try {
      return await this.updateAuth(userId, {
        password: newPassword
      });
    } catch (error) {
      console.error('Error updating password:', error.message);
      throw error;
    }
  }

  /**
   * Update email by user ID
   * @param {String} userId - User ID
   * @param {String} newEmail - New email address
   * @returns {Promise<Object>} Updated user authentication
   */
  async updateEmail(userId, newEmail) {
    try {
      return await this.updateAuth(userId, {
        email: newEmail
      });
    } catch (error) {
      console.error('Error updating email:', error.message);
      throw error;
    }
  }

  /**
   * Delete user authentication by user ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Deleted user authentication info
   */
  async deleteAuth(userId) {
    try {
      return await UserAuth.findOneAndDelete({ userId });
    } catch (error) {
      console.error('Error deleting user authentication:', error.message);
      throw error;
    }
  }

  /**
   * Check if email already exists
   * @param {String} email - Email to check
   * @returns {Promise<Boolean>} True if email exists, false otherwise
   */
  async emailExists(email) {
    try {
      const count = await UserAuth.countDocuments({ email });
      return count > 0;
    } catch (error) {
      console.error('Error checking if email exists:', error.message);
      throw error;
    }
  }
}

export default new AuthRepository();