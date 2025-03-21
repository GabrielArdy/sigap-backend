import userRepository from '../database/repository/user_repository.js';

/**
 * User Service
 * Provides business logic for user management
 */
class UserService {
  /**
   * Get all users with pagination
   * @param {Object} options - Query options for pagination and sorting
   * @param {Object} filter - Optional filter criteria
   * @returns {Promise<Array>} Array of users
   */
  async getAllUsers(options = {}, filter = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;
      
      const users = await userRepository.findAll(filter, { limit, skip, sort });
      const total = await userRepository.countUsers(filter);
      
      return {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAllUsers service:', error.message);
      throw error;
    }
  }

  /**
   * Delete user by userId
   * @param {String} userId - User ID to delete
   * @returns {Promise<Object>} Deleted user information
   */
  async deleteUser(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const user = await userRepository.deleteUser(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return { success: true, message: 'User deleted successfully', user };
    } catch (error) {
      console.error('Error in deleteUser service:', error.message);
      throw error;
    }
  }

  /**
   * Update user by userId
   * @param {String} userId - User ID to update
   * @param {Object} updateData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, updateData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Check if user exists
      const existingUser = await userRepository.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      // Perform update
      const updatedUser = await userRepository.updateUser(userId, updateData);
      
      return updatedUser;
    } catch (error) {
      console.error('Error in updateUser service:', error.message);
      throw error;
    }
  }
}

export default new UserService();
