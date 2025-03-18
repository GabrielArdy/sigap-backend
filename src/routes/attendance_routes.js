import express from 'express';
import attendanceController from '../controllers/attendance_controllers.js';
import authMiddleware from '../middleware/auth_middleware.js';

/**
 * Attendance Routes
 * Defines API endpoints for attendance management
 */
const router = express.Router();

/**
 * @route POST /api/attendances
 * @desc Record a new attendance
 * @access Private
 */
router.post('/', authMiddleware, attendanceController.recordAttendance);

/**
 * @route POST /api/attendances/checkIn
 * @desc Check in attendance
 * @access Private
 */
router.post('/checkIn', authMiddleware, attendanceController.checkIn);

/**
 * @route POST /api/attendances/checkOut
 * @desc Check out attendance
 * @access Private
 */
router.post('/checkOut', authMiddleware, attendanceController.checkOut);

/**
 * @route GET /api/attendances/:attendanceId
 * @desc Get attendance by ID
 * @access Private
 */
router.get('/:attendanceId', authMiddleware, attendanceController.getAttendanceById);

/**
 * @route PUT /api/attendances/:attendanceId
 * @desc Update attendance record
 * @access Private
 */
router.put('/:attendanceId', authMiddleware, attendanceController.updateAttendance);

/**
 * @route DELETE /api/attendances/:attendanceId
 * @desc Delete attendance record
 * @access Private
 */
router.delete('/:attendanceId', authMiddleware, attendanceController.deleteAttendance);


/**
 * @route GET /api/attendances/dashboard
 * @desc Get current user's attendance dashboard
 * @access Private
 */
router.get('/dashboard', authMiddleware, attendanceController.getMyDashboard);

/**
 * @route GET /api/attendances/statistics
 * @desc Get attendance statistics
 * @access Private
 */
router.get('/statistics', authMiddleware, attendanceController.getAttendanceStatistics);

/**
 * @route GET /api/attendances/my/records
 * @desc Get current user's attendance records
 * @access Private
 */
router.get('/my/records', authMiddleware, attendanceController.getMyAttendances);

/**
 * @route GET /api/attendances/users/:userId
 * @desc Get attendances for a specific user
 * @access Private
 */
router.get('/users/:userId', authMiddleware, attendanceController.getUserAttendances);

/**
 * @route GET /api/attendances/periods/:periodId
 * @desc Get attendances for a specific period
 * @access Private
 */
router.get('/periods/:periodId', authMiddleware, attendanceController.getAttendancesByPeriod);

/**
 * @route GET /api/attendances/date
 * @desc Get attendances for a specific date
 * @access Private
 */
router.get('/date', authMiddleware, attendanceController.getAttendancesByDate);

/**
 * @route GET /api/attendances/date-range
 * @desc Get attendances for a date range
 * @access Private
 */
router.get('/date-range', authMiddleware, attendanceController.getAttendancesByDateRange);

export default router;