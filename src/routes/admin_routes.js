import express from 'express';
import AdminController from '../controllers/admin_controller.js';

const router = express.Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Get all dashboard data
 * @access Private
 */
router.get('/dashboard', AdminController.getAllDashboardData);

export default router;