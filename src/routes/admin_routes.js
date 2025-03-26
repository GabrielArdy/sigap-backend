import express from 'express';
import authMiddleware from '../middlewares/auth_middleware';
import adminController from '../controllers/admin_controller';

const router = express.Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Get all dashboard data
 * @access Private
 */
router.get('/dashboard', adminController.getAllDashboardData);

export default router;