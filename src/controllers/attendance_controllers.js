import attendanceService from '../services/attendance_service.js';

/**
 * Attendance Controllers
 * Handles HTTP requests related to attendance management
 */
class AttendanceController {
  /**
   * Record a new attendance
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async recordAttendance(req, res) {
    try {
      const attendanceData = req.body;
      
      // If using authentication middleware, you can get userId from req.user
      // and override any userId sent in the request body for security
      if (req.user) {
        attendanceData.userId = req.user.userId;
      }
      
      const attendance = await attendanceService.recordAttendance(attendanceData);
      
      return res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: attendance
      });
    } catch (error) {
      console.error('Record attendance error:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to record attendance',
        error: error.message
      });
    }
  }

  /**
   * Get attendance by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAttendanceById(req, res) {
    try {
      const { attendanceId } = req.params;
      
      const attendance = await attendanceService.getAttendanceById(attendanceId);
      
      return res.status(200).json({
        success: true,
        data: attendance
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      
      if (error.message === 'Attendance record not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get attendance',
        error: error.message
      });
    }
  }

  /**
   * Get attendances for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserAttendances(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 10, skip = 0, sort } = req.query;
      
      // Parse query parameters
      const options = {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10)
      };
      
      if (sort) {
        options.sort = JSON.parse(sort);
      }
      
      const result = await attendanceService.getUserAttendances(userId, options);
      
      return res.status(200).json({
        success: true,
        data: result.attendances,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user attendances error:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get attendances',
        error: error.message
      });
    }
  }

  /**
   * Get attendances for a period
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAttendancesByPeriod(req, res) {
    try {
      const { periodId } = req.params;
      const { limit = 10, skip = 0, sort } = req.query;
      
      // Parse query parameters
      const options = {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10)
      };
      
      if (sort) {
        options.sort = JSON.parse(sort);
      }
      
      const result = await attendanceService.getAttendancesByPeriod(periodId, options);
      
      return res.status(200).json({
        success: true,
        data: result.attendances,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get period attendances error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get attendances for period',
        error: error.message
      });
    }
  }

  /**
   * Get attendances for a date range
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAttendancesByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const { limit = 10, skip = 0, sort } = req.query;
      
      // Validate date inputs
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }
      
      // Parse query parameters
      const options = {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10)
      };
      
      if (sort) {
        options.sort = JSON.parse(sort);
      }
      
      // Extract additional filters from query params
      const { startDate: _, endDate: __, limit: ___, skip: ____, sort: _____, ...filters } = req.query;
      
      const result = await attendanceService.getAttendancesByDateRange(startDate, endDate, filters, options);
      
      return res.status(200).json({
        success: true,
        data: result.attendances,
        pagination: result.pagination,
        dateRange: result.dateRange
      });
    } catch (error) {
      console.error('Get date range attendances error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get attendances for date range',
        error: error.message
      });
    }
  }

  /**
   * Get attendances for a specific date
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAttendancesByDate(req, res) {
    try {
      const { date } = req.query;
      const { limit = 10, skip = 0, sort } = req.query;
      
      // Validate date input
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required'
        });
      }
      
      // Parse query parameters
      const options = {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10)
      };
      
      if (sort) {
        options.sort = JSON.parse(sort);
      }
      
      // Extract additional filters from query params
      const { date: _, limit: __, skip: ___, sort: ____, ...filters } = req.query;
      
      const result = await attendanceService.getAttendancesByDate(date, filters, options);
      
      return res.status(200).json({
        success: true,
        data: result.attendances,
        pagination: result.pagination,
        date: result.date
      });
    } catch (error) {
      console.error('Get date attendances error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get attendances for date',
        error: error.message
      });
    }
  }

  /**
   * Update attendance
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateAttendance(req, res) {
    try {
      const { attendanceId } = req.params;
      const updateData = req.body;
      
      const updatedAttendance = await attendanceService.updateAttendance(attendanceId, updateData);
      
      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: updatedAttendance
      });
    } catch (error) {
      console.error('Update attendance error:', error);
      
      if (error.message === 'Attendance record not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to update attendance',
        error: error.message
      });
    }
  }

  /**
   * Delete attendance
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteAttendance(req, res) {
    try {
      const { attendanceId } = req.params;
      
      const deletedAttendance = await attendanceService.deleteAttendance(attendanceId);
      
      return res.status(200).json({
        success: true,
        message: 'Attendance deleted successfully',
        data: deletedAttendance
      });
    } catch (error) {
      console.error('Delete attendance error:', error);
      
      if (error.message === 'Attendance record not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to delete attendance',
        error: error.message
      });
    }
  }

  /**
   * Get attendance statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAttendanceStatistics(req, res) {
    try {
      // Extract filters from query params
      const filters = req.query;
      
      const statistics = await attendanceService.getAttendanceStatistics(filters);
      
      return res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Get attendance statistics error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get attendance statistics',
        error: error.message
      });
    }
  }

  /**
   * Get my attendances (for logged-in user)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMyAttendances(req, res) {
    try {
      // This assumes an authentication middleware sets req.user
      const userId = req.user.userId;
      const { limit = 10, skip = 0, sort } = req.query;
      
      // Parse query parameters
      const options = {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10)
      };
      
      if (sort) {
        options.sort = JSON.parse(sort);
      }
      
      const result = await attendanceService.getUserAttendances(userId, options);
      
      return res.status(200).json({
        success: true,
        data: result.attendances,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get my attendances error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get your attendances',
        error: error.message
      });
    }
  }

  /**
   * Get individual dashboard data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getIndividualDashboard(req, res) {
    try {
      const { userId } = req.params;
      
      // Always use today's date
      const dashboardData = await attendanceService.getIndividualDashboardData(
        userId,
        new Date()
      );
      
      return res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Get individual dashboard error:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get dashboard data',
        error: error.message
      });
    }
  }

  /**
   * Get my individual dashboard data (for logged-in user)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMyDashboard(req, res) {
    try {
      // This assumes an authentication middleware sets req.user
      const userId = req.query.id ;
      
      // Always use today's date
      const dashboardData = await attendanceService.getIndividualDashboardData(
        userId,
        new Date()
      );
      
      return res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Get my dashboard error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get your dashboard data',
        error: error.message
      });
    }
  }
}

export default new AttendanceController();