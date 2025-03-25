import express from 'express';
import authController from '../controllers/auth_controllers.js';
import authMiddleware from '../middleware/auth_middleware.js';

/**
 * Authentication Routes
 * Defines API endpoints for user authentication and account management
 */
const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user account
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/login/admin
 * @desc Authenticate admin user and get token
 * @access Public
 */
router.post('/login/admin', authController.loginAdmin);

/**
 * @route POST /api/auth/logout
 * @desc Invalidate user token
 * @access Private
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route GET /api/auth/profile
 * @desc Get authenticated user's profile
 * @access Private
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @route PUT /api/auth/password
 * @desc Change user password (requires current password)
 * @access Private
 */
router.put('/password', authMiddleware, authController.changePassword);

/**
 * @route POST /api/auth/password/reset-request
 * @desc Request password reset (generates token)
 * @access Public
 */
router.post('/password/reset-request', authController.requestPasswordReset);

/**
 * @route POST /api/auth/password/reset
 * @desc Reset password using token
 * @access Public
 */
router.post('/password/reset', authController.resetPassword);

/**
 * @route POST /api/auth/verify-token
 * @desc Verify if token is valid
 * @access Public
 */
router.post('/verify-token', authController.verifyToken);

export default router;