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

      // Don't reset check-in time to midnight - keep the actual time
      // if (!attendanceData.checkIn) {
      //   attendanceData.checkIn = new Date().setHours(0, 0, 0, 0);
      // }

      // Set default check-out time if not provided
      if (!attendanceData.checkOut) {
        attendanceData.checkOut = new Date(0); // Unix epoch time
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
   * Get individual user dashboard data
   * @param {String} userId - User ID
   * @param {Date|String} date - The date to get attendance data for (defaults to current date)
   * @param {Boolean} refresh - Whether to force a fresh fetch from database
   * @returns {Promise<Object>} User and attendance data for dashboard
   */
  async getIndividualDashboardData(userId, date = new Date(), refresh = true) {
    try {
      // Validate user exists and get user data
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Convert string date to Date object if needed
      const targetDate = typeof date === 'string' ? new Date(date) : date;
      
      // Get attendance for the user on the specified date
      // Use a direct query with no caching if refresh is true
      let attendanceRecords = [];
      if (refresh) {
        // Create start and end of day for precise querying
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Use a more direct query with explicit date range
        attendanceRecords = await attendanceRepository.findByDateAndUserId(
          startOfDay, 
          userId, 
          { 
            date: { 
              $gte: startOfDay,
              $lte: endOfDay
            }
          }, 
          { limit: 1 }
        );
      } else {
        // Use the existing implementation if not refreshing
        attendanceRecords = await attendanceRepository.findByDateAndUserId(
          targetDate, 
          userId, 
          {}, 
          { limit: 1 }
        );
      }
      
      // Double-check records exist before using them
      const hasValidRecord = attendanceRecords && 
                           attendanceRecords.length > 0 && 
                           attendanceRecords[0] && 
                           attendanceRecords[0].checkIn;
      
      // Format the response
      const dashboardData = {
        user: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          nip: user.nip || ''
        },
        attendanceData: {
          checkIn: hasValidRecord ? attendanceRecords[0].checkIn : null,
          checkOut: hasValidRecord && 
                    attendanceRecords[0].checkOut && 
                    attendanceRecords[0].checkOut.getTime() !== new Date(0).getTime() 
                    ? attendanceRecords[0].checkOut 
                    : null
        }
      };
      
      return dashboardData;
    } catch (error) {
      console.error('Error getting individual dashboard data:', error.message);
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

  /**
   * Record check-in time for a user's attendance
   * @param {String} userId - User ID
   * @param {Date} checkInTime - Check-in time (defaults to current time)
   * @returns {Promise<Object>} Updated attendance record
   */
  async recordCheckIn(attendanceData) {
    try {
      // Validate user exists
      const user = await userRepository.findById(attendanceData.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get today's date with time set to midnight (00:00:00.000)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Use scannedAt from request as check-in time, or current time if not available
      let checkInTime;
      if (attendanceData.scannedAt) {
        checkInTime = new Date(attendanceData.scannedAt);
      } else if (attendanceData.checkIn) {
        checkInTime = new Date(attendanceData.checkIn);
      } else {
        checkInTime = new Date();
      }
      
      // Find today's attendance record for the user
      const attendanceRecords = await attendanceRepository.findByDateAndUserId(
        today, 
        attendanceData.userId, 
        {}, 
        { limit: 1 }
      );
      
      // If no attendance record exists for today, create a new one
      let attendanceId;
      if (attendanceRecords.length === 0) {
        // Create a new attendance record with check-in and unix epoch for check-out
        const newAttendanceData = {
          userId: attendanceData.userId,
          date: today,
          checkIn: checkInTime,
          checkOut: new Date(0), // Unix epoch (January 1, 1970, 00:00:00 GMT)
          attendanceStatus: 'A', // Set status to "A"
          stationId: attendanceData.qrData?.stationId || attendanceData.stationId,
        };
        
        const newAttendance = await this.recordAttendance(newAttendanceData);
        attendanceId = newAttendance.attendanceId;
      } else {
        attendanceId = attendanceRecords[0].attendanceId;
      }
      
      // Update the check-in time and status
      const updatedAttendance = await this.updateAttendance(attendanceId, {
        checkIn: checkInTime,
        attendanceStatus: 'A' // Set status to "A"
      });
      
      return updatedAttendance;
    } catch (error) {
      console.error('Error recording check-in:', error.message);
      throw error;
    }
  }

  /**
   * Record check-out time for a user's attendance
   * @param {Object} attendanceData - Attendance data including userId and checkOut time
   * @returns {Promise<Object>} Updated attendance record
   */
  async recordCheckOut(attendanceData) {
    try {
      // Validate user exists
      const user = await userRepository.findById(attendanceData.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get today's date with time set to midnight (00:00:00.000)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find today's attendance record for the user
      const attendanceRecords = await attendanceRepository.findByDateAndUserId(
        today, 
        attendanceData.userId, 
        {}, 
        { limit: 1 }
      );
      
      // If no attendance record exists for today, throw an error
      if (attendanceRecords.length === 0) {
        throw new Error('No attendance record found for today');
      }
      
      const attendanceId = attendanceRecords[0].attendanceId;
      
      // Update the check-out time while preserving the "A" attendance status
      const updatedAttendance = await this.updateAttendance(attendanceId, {
        checkOut: attendanceData.checkOut,
        attendanceStatus: 'P' 
      });
      
      return updatedAttendance;
    } catch (error) {
      console.error('Error recording check-out:', error.message);
      throw error;
    }
  }

  /**
   * Get today's attendance for a specific user
   * @param {String} userId - User ID
   * @returns {Promise<Object|null>} Attendance record for today or null if not found
   */
  async getTodayAttendance(userId) {
    try {
      // Validate user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get today's date with time set to midnight (00:00:00.000)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Find today's attendance record for the user
      const attendanceRecords = await attendanceRepository.findByDateAndUserId(
        today, 
        userId, 
        {}, 
        { limit: 1 }
      );
      
      // Return the attendance record or null if not found
      return attendanceRecords.length > 0 ? attendanceRecords[0] : null;
    } catch (error) {
      console.error('Error getting today\'s attendance:', error.message);
      throw error;
    }
  }

  /**
   * Get all attendance records with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} Attendance records and pagination info
   */
  async getAllAttendances(filters = {}, options = {}) {
    try {
      // Get attendances with filters and pagination
      const attendances = await attendanceRepository.findAttendances(filters, options);
      
      // Get total count for pagination
      const totalCount = await attendanceRepository.countAttendances(filters);
      
      // Enhance attendance records with user information
      const enhancedAttendances = await Promise.all(
        attendances.map(async (attendance) => {
          // Find the associated user
          const user = await userRepository.findById(attendance.userId);
          
          // Combine first and last name to create fullName
          const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
          
          // Return formatted attendance object
          return {
            attendanceId: attendance.attendanceId,
            date: attendance.date,
            checkIn: attendance.checkIn,
            checkOut: attendance.checkOut,
            attendanceStatus: attendance.attendanceStatus,
            fullName: fullName
          };
        })
      );
      
      return {
        attendances: enhancedAttendances,
        pagination: {
          total: totalCount,
          limit: options.limit || 10,
          skip: options.skip || 0
        }
      };
    } catch (error) {
      console.error('Error getting all attendances:', error.message);
      throw error;
    }
  }

  /**
   * Get attendance records for a specific user by month and year
   * @param {String} userId - User ID
   * @param {Number} month - Month (1-12)
   * @param {Number} year - Year (e.g., 2023)
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} Attendance records and pagination info
   */
  async getUserAttendancesByMonth(userId, month, year, options = {}) {
    try {
      // Validate user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate month (1-12)
      if (month < 1 || month > 12) {
        throw new Error('Invalid month. Month must be between 1 and 12');
      }

      // Calculate start and end dates for the specified month
      const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JavaScript Date
      startDate.setHours(0, 0, 0, 0);
      
      // Get the last day of the month by going to the first day of next month and subtracting one day
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // Create filter combining userId and date range
      const filters = {
        userId: userId
      };
      
      // Get attendances for the user within the specified month
      const attendances = await attendanceRepository.findByDateRange(
        startDate,
        endDate,
        filters,
        options
      );
      
      // Combined filter for count
      const countFilter = {
        userId: userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
      
      // Get total count for pagination
      const totalCount = await attendanceRepository.countAttendances(countFilter);
      
      return {
        attendances,
        pagination: {
          total: totalCount,
          limit: options.limit || 10,
          skip: options.skip || 0
        },
        dateRange: {
          start: startDate,
          end: endDate,
          month: month,
          year: year
        }
      };
    } catch (error) {
      console.error('Error getting user attendances by month:', error.message);
      throw error;
    }
  }
}

export default new AttendanceService();