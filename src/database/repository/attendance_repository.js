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
   * Find attendances by specific date and user ID
   * @param {Date} date - The specific date to find attendances for
   * @param {String} userId - User ID
   * @param {Object} additionalFilter - Additional filtering criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} Array of attendance records
   */
  async findByDateAndUserId(date, userId, additionalFilter = {}, options = {}) {
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
        userId,
        ...additionalFilter
      };
      
      return await Attendance.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error finding attendances by date and user ID:', error.message);
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

  /**
   * Get dashboard attendance data for a specific user within a date range
   * @param {String} userId - User ID
   * @param {Date} startDate - Start date for dashboard data
   * @param {Date} endDate - End date for dashboard data
   * @returns {Promise<Object>} Dashboard attendance statistics
   */
  async getDashboardAttendanceByUserId(userId, startDate, endDate) {
    try {
      // Ensure we have proper date objects
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      // Find all attendance records for this user in the date range
      const attendanceRecords = await Attendance.find({
        userId,
        date: {
          $gte: start,
          $lte: end
        }
      }).sort({ date: 1 });
      
      // Prepare summary statistics
      const summary = {
        totalAttendance: attendanceRecords.length,
        onTimeCount: 0,
        lateCount: 0,
        absentCount: 0,
        attendanceByDay: {},
        attendanceTimeline: [],
      };
      
      // Process each record for statistics
      attendanceRecords.forEach(record => {
        // Categorize by status
        if (record.status === 'present' && !record.isLate) {
          summary.onTimeCount++;
        } else if (record.status === 'present' && record.isLate) {
          summary.lateCount++;
        } else if (record.status === 'absent') {
          summary.absentCount++;
        }
        
        // Organize by date
        const dateStr = record.date.toISOString().split('T')[0];
        if (!summary.attendanceByDay[dateStr]) {
          summary.attendanceByDay[dateStr] = [];
        }
        summary.attendanceByDay[dateStr].push(record);
        
        // Add to timeline
        summary.attendanceTimeline.push({
          date: record.date,
          status: record.status,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          isLate: record.isLate,
          workHours: record.workHours || 0
        });
      });
      
      return summary;
    } catch (error) {
      console.error('Error getting dashboard attendance data:', error.message);
      throw error;
    }
  }

  /**
   * Get individual user dashboard attendance summary
   * @param {String} userId - User ID
   * @param {Date} date - The date to find attendance for (defaults to current date)
   * @returns {Promise<Object>} Single attendance document with dashboard data
   */
  async getIndividualDashboardAttendance(userId, date = new Date()) {
    try {
      // Create start and end of the day to cover the full day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Find the user's attendance record for this day
      const attendanceRecord = await Attendance.findOne({
        userId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      return attendanceRecord;
    } catch (error) {
      console.error('Error getting individual dashboard attendance:', error.message);
      throw error;
    }
  }

  async CountTodayCheckIn(date = new Date()) {
    try {
      // Create start and end of the day to cover the full day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Count all attendance records for this day
      const checkInCount = await Attendance.countDocuments({
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        checkIn: {
          $ne: new Date(0) // Not equal to default/epoch time
        }
      });
      
      return checkInCount;
    } catch (error) {
      console.error('Error counting today\'s check-ins:', error.message);
      throw error;
    }
  }

  /**
   * Count today's check-outs (where checkOut is not default/epoch time)
   * @param {Date} date - The date to count check-outs for (defaults to current date)
   * @returns {Promise<Number>} Count of check-outs for the day
   */
  async countTodayCheckOut(date = new Date()) {
    try {
      // Create start and end of the day to cover the full day
      const today = new Date(date);
      today.setHours(0, 0, 0, 0);
      
      // Epoch time reference (1970-01-01)
      const epochTime = new Date(0);
      
      // Count attendance records with valid checkout times
      const checkOutCount = await Attendance.countDocuments({
        date: {
          $eq: today // Equal to today's date
        },
        checkOut: { 
          $ne: epochTime // Not equal to epoch time (1970-01-01)
        }
      });
      
      return checkOutCount;
    } catch (error) {
      console.error('Error counting today\'s check-outs:', error.message);
      throw error;
    }
  }
  
}

export default new AttendanceRepository();