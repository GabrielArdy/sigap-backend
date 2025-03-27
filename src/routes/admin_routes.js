import express from 'express';
import AdminController from '../controllers/admin_controller.js';

const router = express.Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Get all dashboard data
 * @access Private
 */
router.get('/dashboard', AdminController.getAllDashboardData);

/**
 * @route GET /api/admin/report
 * @desc Get all report data
 * @access Private
 */
router.get('/report', AdminController.getMonthlyReport);

/**
 * @route GET /api/admin/users/access
 * @desc Get all users access permissions
 * @access Private
 */
router.get('/users/access', AdminController.getAllUsersAccessPermissions);

/**
 * @route PUT /api/admin/users/access
 * @desc Update user access permissions
 * @access Private
 */
router.put('/users/access', AdminController.updateUserAccessPermissions);

export default router;