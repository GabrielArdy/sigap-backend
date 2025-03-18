import Attendance from '../models/attendance.js';

/**
 * Attendance Repository
 * Provides CRUD operations and specialized queries for Attendance model
 */
class AttendanceRepository {
  /**
   * Create a new attendance record
   * @param {Object} attendanceData - Attendance data to create
   * @returns {Promise<Object>} Created attendance
   */
  async createAttendance(attendanceData) {
    try {
      const attendance = new Attendance(attendanceData);
      return await attendance.save();
    } catch (error) {
      console.error('Error creating attendance:', error.message);
      throw error;
    }
  }

  /**
   * Find attendance by ID
   * @param {String} attendanceId - Attendance ID
   * @returns {Promise<Object>} Attendance document
   */
  async findById(attendanceId) {
    try {
      return await Attendance.findOne({ attendanceId });
    } catch (error) {
      console.error('Error finding attendance by ID:', error.message);
      throw error;
    }
  }

  /**
   * Find attendances by user ID
   * @param {String} userId - User ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} Array of attendance records
   */
  async findByUserId(userId, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { date: -1 } } = options;
      
      return await Attendance.find({ userId })
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error finding attendances by user ID:', error.message);
      throw error;
    }
  }

  /**
   * Find attendances by period ID
   * @param {String} attendancePeriodId - Period ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} Array of attendance records
   */
  async findByPeriodId(attendancePeriodId, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { date: -1 } } = options;
      
      return await Attendance.find({ attendancePeriodId })
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error finding attendances by period ID:', error.message);
      throw error;
    }
  }

  /**
   * Find attendances by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} additionalFilter - Additional filtering criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} Array of attendance records
   */
  async findByDateRange(startDate, endDate, additionalFilter = {}, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { date: -1 } } = options;
      
      const filter = {
        date: {
          $gte: startDate,
          $lte: endDate
        },
        ...additionalFilter
      };
      
      return await Attendance.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error finding attendances by date range:', error.message);
      throw error;
    }
  }

  /**
   * Find attendances by specific date
   * @param {Date} date - The specific date to find attendances for
   * @param {Object} additionalFilter - Additional filtering criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} Array of attendance records
   */
  async findByDate(date, additionalFilter = {}, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { date: -1 } } = options;
      
      // Create start and end of the day to cover the full day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const filter = {
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        ...additionalFilter
      };
      
      return await Attendance.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error finding attendances by date:', error.message);
      throw error;
    }
  }

  /**
   * Get all attendances
   * @param {Object} filter - Optional filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} Array of attendances
   */
  async findAll(filter = {}, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { date: -1 } } = options;
      
      return await Attendance.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error finding attendances:', error.message);
      throw error;
    }
  }

  /**
   * Update attendance by ID
   * @param {String} attendanceId - Attendance ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated attendance
   */
  async updateAttendance(attendanceId, updateData) {
    try {
      // Add updated timestamp
      updateData.updatedAt = Date.now();
      
      return await Attendance.findOneAndUpdate(
        { attendanceId },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error('Error updating attendance:', error.message);
      throw error;
    }
  }

  /**
   * Delete attendance by ID
   * @param {String} attendanceId - Attendance ID
   * @returns {Promise<Object>} Deleted attendance info
   */
  async deleteAttendance(attendanceId) {
    try {
      return await Attendance.findOneAndDelete({ attendanceId });
    } catch (error) {
      console.error('Error deleting attendance:', error.message);
      throw error;
    }
  }

  /**
   * Count attendances by filter
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Number>} Count of matching attendances
   */
  async countAttendances(filter = {}) {
    try {
      return await Attendance.countDocuments(filter);
    } catch (error) {
      console.error('Error counting attendances:', error.message);
      throw error;
    }
  }
}

export default new AttendanceRepository();