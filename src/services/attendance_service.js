import { v4 as uuidv4 } from 'uuid';
import attendanceRepository from '../database/repository/attendance_repository.js';
import userRepository from '../database/repository/user_repository.js';

/**
 * Attendance Service
 * Handles business logic for attendance management
 */
class AttendanceService {
  /**
   * Record a new attendance
   * @param {Object} attendanceData - Attendance data
   * @returns {Promise<Object>} Created attendance record
   */
  async recordAttendance(attendanceData) {
    try {
      // Validate user exists
      const user = await userRepository.findById(attendanceData.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate attendanceId if not provided
      if (!attendanceData.attendanceId) {
        attendanceData.attendanceId = uuidv4();
      }

      // Set current date if not provided
      if (!attendanceData.date) {
        attendanceData.date = new Date();
      }

      // Create attendance record
      const attendance = await attendanceRepository.createAttendance(attendanceData);
      return attendance;
    } catch (error) {
      console.error('Error recording attendance:', error.message);
      throw error;
    }
  }

  /**
   * Get attendance by ID
   * @param {String} attendanceId - Attendance ID
   * @returns {Promise<Object>} Attendance record
   */
  async getAttendanceById(attendanceId) {
    try {
      const attendance = await attendanceRepository.findById(attendanceId);
      if (!attendance) {
        throw new Error('Attendance record not found');
      }
      return attendance;
    } catch (error) {
      console.error('Error getting attendance by ID:', error.message);
      throw error;
    }
  }

  /**
   * Get attendances for a specific user
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Attendance records and pagination info
   */
  async getUserAttendances(userId, options = {}) {
    try {
      // Validate user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get attendances
      const attendances = await attendanceRepository.findByUserId(userId, options);
      
      // Get total count for pagination
      const totalCount = await attendanceRepository.countAttendances({ userId });
      
      return {
        attendances,
        pagination: {
          total: totalCount,
          limit: options.limit || 10,
          skip: options.skip || 0
        }
      };
    } catch (error) {
      console.error('Error getting user attendances:', error.message);
      throw error;
    }
  }

  /**
   * Get attendance records by period ID
   * @param {String} periodId - Period ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Attendance records and pagination info
   */
  async getAttendancesByPeriod(periodId, options = {}) {
    try {
      const attendances = await attendanceRepository.findByPeriodId(periodId, options);
      
      const totalCount = await attendanceRepository.countAttendances({ attendancePeriodId: periodId });
      
      return {
        attendances,
        pagination: {
          total: totalCount,
          limit: options.limit || 10,
          skip: options.skip || 0
        }
      };
    } catch (error) {
      console.error('Error getting attendances by period:', error.message);
      throw error;
    }
  }

  /**
   * Get attendance records for a date range
   * @param {Date|String} startDate - Start date
   * @param {Date|String} endDate - End date
   * @param {Object} filters - Additional filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Attendance records and pagination info
   */
  async getAttendancesByDateRange(startDate, endDate, filters = {}, options = {}) {
    try {
      // Convert string dates to Date objects if needed
      const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
      
      const attendances = await attendanceRepository.findByDateRange(start, end, filters, options);
      
      // Combined filter for count
      const countFilter = {
        date: {
          $gte: start,
          $lte: end
        },
        ...filters
      };
      
      const totalCount = await attendanceRepository.countAttendances(countFilter);
      
      return {
        attendances,
        pagination: {
          total: totalCount,
          limit: options.limit || 10,
          skip: options.skip || 0
        },
        dateRange: {
          start,
          end
        }
      };
    } catch (error) {
      console.error('Error getting attendances by date range:', error.message);
      throw error;
    }
  }

  /**
   * Get attendance records for a specific date
   * @param {Date|String} date - The date
   * @param {Object} filters - Additional filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Attendance records and pagination info
   */
  async getAttendancesByDate(date, filters = {}, options = {}) {
    try {
      // Convert string date to Date object if needed
      const targetDate = typeof date === 'string' ? new Date(date) : date;
      
      const attendances = await attendanceRepository.findByDate(targetDate, filters, options);
      
      // Create start and end of day for count
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Combined filter for count
      const countFilter = {
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        ...filters
      };
      
      const totalCount = await attendanceRepository.countAttendances(countFilter);
      
      return {
        attendances,
        pagination: {
          total: totalCount,
          limit: options.limit || 10,
          skip: options.skip || 0
        },
        date: targetDate
      };
    } catch (error) {
      console.error('Error getting attendances by date:', error.message);
      throw error;
    }
  }

  /**
   * Update attendance record
   * @param {String} attendanceId - Attendance ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated attendance record
   */
  async updateAttendance(attendanceId, updateData) {
    try {
      // Check if attendance exists
      const existingAttendance = await attendanceRepository.findById(attendanceId);
      if (!existingAttendance) {
        throw new Error('Attendance record not found');
      }
      
      // Update attendance
      const updatedAttendance = await attendanceRepository.updateAttendance(attendanceId, updateData);
      return updatedAttendance;
    } catch (error) {
      console.error('Error updating attendance:', error.message);
      throw error;
    }
  }

  /**
   * Delete attendance record
   * @param {String} attendanceId - Attendance ID
   * @returns {Promise<Object>} Deleted attendance info
   */
  async deleteAttendance(attendanceId) {
    try {
      // Check if attendance exists
      const existingAttendance = await attendanceRepository.findById(attendanceId);
      if (!existingAttendance) {
        throw new Error('Attendance record not found');
      }
      
      // Delete attendance
      const deletedAttendance = await attendanceRepository.deleteAttendance(attendanceId);
      return deletedAttendance;
    } catch (error) {
      console.error('Error deleting attendance:', error.message);
      throw error;
    }
  }

  /**
   * Get attendance statistics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Attendance statistics
   */
  async getAttendanceStatistics(filters = {}) {
    try {
      const totalAttendances = await attendanceRepository.countAttendances(filters);
      
      // You can add more complex statistics here based on your requirements
      // For example, count by attendance status, average check-in time, etc.
      
      return {
        total: totalAttendances,
        // Add more statistics as needed
      };
    } catch (error) {
      console.error('Error getting attendance statistics:', error.message);
      throw error;
    }
  }
}

export default new AttendanceService();