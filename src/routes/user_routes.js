import express from 'express';
import userController from '../controllers/user_controller.js';
// You may need to import auth middleware if you have one
// import { authenticate } from '../middlewares/auth_middleware.js';

const router = express.Router();

/**
 * User routes
 */

// Get all users with pagination
router.get('/users', userController.getAllUsers);

// Update a user
router.put('/users/update', userController.updateUser);

// Delete a user
router.delete('/users/delete', userController.deleteUser);

export default router;
