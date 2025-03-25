import attendanceService from '../services/attendance_service.js';
import { QRService } from '../services/qr_service.js';
import StationService from '../services/station_service.js';
import calculateDistanceInMeters from '../utils/location.js';

/**
 * Attendance Controllers
 * Handles HTTP requests related to attendance management
 */
class AttendanceController {
  constructor() {
    this.qrService = new QRService();
    this.stationService = new StationService();
    // Removing the hardcoded MAX_ALLOWED_DISTANCE as we'll use station-specific radius
    
    // Bind all methods to preserve 'this' context
    this.recordAttendance = this.recordAttendance.bind(this);
    this.getAttendanceById = this.getAttendanceById.bind(this);
    this.getUserAttendances = this.getUserAttendances.bind(this);
    this.getAttendancesByPeriod = this.getAttendancesByPeriod.bind(this);
    this.getAttendancesByDateRange = this.getAttendancesByDateRange.bind(this);
    this.getAttendancesByDate = this.getAttendancesByDate.bind(this);
    this.updateAttendance = this.updateAttendance.bind(this);
    this.deleteAttendance = this.deleteAttendance.bind(this);
    this.getAttendanceStatistics = this.getAttendanceStatistics.bind(this);
    this.getMyAttendances = this.getMyAttendances.bind(this);
    this.getIndividualDashboard = this.getIndividualDashboard.bind(this);
    this.getMyDashboard = this.getMyDashboard.bind(this);
    this.checkIn = this.checkIn.bind(this);
    this.checkOut = this.checkOut.bind(this);
    this.getAllAttendances = this.getAllAttendances.bind(this);
    this.getUserAttendancesByMonth = this.getUserAttendancesByMonth.bind(this);
  }

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
      const { refresh = 'true' } = req.query; // Add refresh option with default true
      
      // Always use today's date
      const dashboardData = await attendanceService.getIndividualDashboardData(
        userId,
        new Date(),
        refresh === 'true' // Pass refresh flag to service
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
      // Check if user is authenticated
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get userId from query
      const userId = req.query.id;
      const { refresh = 'true' } = req.query; // Add refresh option with default true
      
      // Ensure the requested userId matches the authenticated user's ID
      if (userId !== req.user.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access: You can only view your own dashboard'
        });
      }
      
      // Always use today's date and pass refresh option
      const dashboardData = await attendanceService.getIndividualDashboardData(
        userId,
        new Date(),
        refresh === 'true' // Pass refresh flag to service
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

  /**
   * Record user check-in
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkIn(req, res) {
    try {
      // Extract check-in data from request body
      const { 
        userId, 
        scannedAt, 
        location, 
        qrData 
      } = req.body;
      
      // Validate required fields
      if (!userId || !scannedAt || !location || !qrData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, scannedAt, location, or qrData'
        });
      }

      // Ensure location data is valid
      if (!location.latitude || !location.longitude) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location data: latitude and longitude are required'
        });
      }

      // Ensure QR data is valid
      if (!qrData.stationId || !qrData.expiredAt || !qrData.signature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR data: stationId, expiredAt, and signature are required'
        });
      }

      // Validate QR signature
      if (!this.qrService.verifyQR(qrData)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid QR code signature'
        });
      }

      // Validate QR expiration
      if (!this.qrService.checkQRExpired(qrData.expiredAt, scannedAt)) {
        return res.status(401).json({
          success: false,
          message: 'QR code has expired'
        });
      }

      // Get station data
      const station = await this.stationService.GetStationByStationId(qrData.stationId);
      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Station not found'
        });
      }

      // Validate distance from station using station's specific radius threshold
      const distance = calculateDistanceInMeters(
        location.latitude,
        location.longitude,
        station.stationLocation.latitude,  // Use latitude directly
        station.stationLocation.longitude  // Use longitude directly
      );

      // Use the station's radiusThreshold instead of hardcoded value
      const maxAllowedDistance = station.radiusThreshold;
      if (distance > maxAllowedDistance) {
        return res.status(400).json({
          success: false,
          message: `You are too far from the check-in station (${Math.round(distance)}m away, max allowed: ${maxAllowedDistance}m)`
        });
      }

      // Record check-in with the validated scannedAt time
      const checkInTime = new Date(scannedAt);

      const attData = {
        userId: userId,
        checkInTime: checkInTime,
        attendanceStatus: 'A',
        stationId: qrData.stationId
      }
      const updatedAttendance = await attendanceService.recordCheckIn(attData);
      
      return res.status(200).json({
        success: true,
        message: 'Check-in recorded successfully',
        data: updatedAttendance
      });
    } catch (error) {
      console.error('Check-in error:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to record check-in',
        error: error.message
      });
    }
  }

  /**
   * Record user check-out
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkOut(req, res) {
    try {
      // Extract check-out data from request body
      const { 
        userId, 
        scannedAt, 
        location, 
        qrData 
      } = req.body;
      
      // Validate required fields
      if (!userId || !scannedAt || !location || !qrData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, scannedAt, location, or qrData'
        });
      }

      // Ensure location data is valid
      if (!location.latitude || !location.longitude) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location data: latitude and longitude are required'
        });
      }

      // Ensure QR data is valid
      if (!qrData.stationId || !qrData.expiredAt || !qrData.signature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR data: stationId, expiredAt, and signature are required'
        });
      }

      // Validate QR signature
      if (!this.qrService.verifyQR(qrData)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid QR code signature'
        });
      }

      // Validate QR expiration
      if (!this.qrService.checkQRExpired(qrData.expiredAt, scannedAt)) {
        return res.status(401).json({
          success: false,
          message: 'QR code has expired'
        });
      }

      // Get station data
      const station = await this.stationService.GetStationByStationId(qrData.stationId);
      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Station not found'
        });
      }

      // Validate distance from station using station's specific radius threshold
      const distance = calculateDistanceInMeters(
        location.latitude,
        location.longitude,
        station.stationLocation.latitude,  // Use latitude directly
        station.stationLocation.longitude  // Use longitude directly
      );

      // Use the station's radiusThreshold instead of hardcoded value
      const maxAllowedDistance = station.radiusThreshold;
      if (distance > maxAllowedDistance) {
        return res.status(400).json({
          success: false,
          message: `You are too far from the check-out station (${Math.round(distance)}m away, max allowed: ${maxAllowedDistance}m)`
        });
      }

      // Record check-out with the validated scannedAt time
      const checkOutTime = new Date(scannedAt);
      const attData = {
        userId: userId,
        checkOut: checkOutTime,
        attendanceStatus: 'P',
        stationId: qrData.stationId

      }
      const updatedAttendance = await attendanceService.recordCheckOut(attData);
      
      return res.status(200).json({
        success: true,
        message: 'Check-out recorded successfully',
        data: updatedAttendance
      });
    } catch (error) {
      console.error('Check-out error:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'No attendance record found for today') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to record check-out',
        error: error.message
      });
    }
  }

  /**
   * Get all attendance records with pagination, filtering, and user information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllAttendances(req, res) {
    try {
      // Extract query parameters for pagination and filtering
      const { limit = 10, skip = 0, sort, ...filters } = req.query;
      
      // Parse query parameters
      const options = {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10)
      };
      
      // Parse sort option if provided
      if (sort) {
        options.sort = JSON.parse(sort);
      }
      
      // Get all attendances with enhanced user info
      const result = await attendanceService.getAllAttendances(filters, options);
      
      return res.status(200).json({
        success: true,
        data: result.attendances,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get all attendances error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get attendance records',
        error: error.message
      });
    }
  }

  /**
   * Get attendance records for a specific user by month and year
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserAttendancesByMonth(req, res) {
    try {
      // Extract parameters
      const { userId } = req.params;
      const { month, year, limit = 30, skip = 0, sort } = req.query;
      
      // Validate required parameters
      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: 'Month and year are required query parameters'
        });
      }
      
      // Parse parameters
      const parsedMonth = parseInt(month, 10);
      const parsedYear = parseInt(year, 10);
      
      // Validate month range
      if (parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({
          success: false,
          message: 'Month must be between 1 and 12'
        });
      }
      
      // Validate year range (basic validation)
      if (parsedYear < 1900 || parsedYear > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Year must be between 1900 and 2100'
        });
      }
      
      // Parse query parameters for pagination
      const options = {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10)
      };
      
      // Parse sort option if provided
      if (sort) {
        options.sort = JSON.parse(sort);
      }
      
      // Get attendances for the user by month
      const result = await attendanceService.getUserAttendancesByMonth(
        userId,
        parsedMonth,
        parsedYear,
        options
      );
      
      return res.status(200).json({
        success: true,
        data: result.attendances,
        pagination: result.pagination,
        dateRange: result.dateRange
      });
    } catch (error) {
      console.error('Get user attendances by month error:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('Invalid month')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to get user attendances by month',
        error: error.message
      });
    }
  }
}

// Export an instance with properly bound methods
export default new AttendanceController();