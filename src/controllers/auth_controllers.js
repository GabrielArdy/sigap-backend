import authService from '../services/auth_service.js';

/**
 * Authentication Controllers
 * Handles HTTP requests related to authentication
 */
class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { email, password, ...userData } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
      
      const result = await authService.register(userData, { email, password });
      
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      console.error('Registration error in controller:', error);
      
      if (error.message === 'Email already registered') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to register user',
        error: error.message
      });
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
      
      const result = await authService.login(email, password);
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login error in controller:', error);
      
      if (error.message === 'Invalid email or password' || error.message === 'User not found') {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  /**
   * Login admin user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
      
      const result = await authService.loginAdminUser(email, password);
      
      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: result
      });
    } catch (error) {
      console.error('Admin login error in controller:', error);
      
      if (error.message === 'Invalid email or password' || error.message === 'User not found') {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      if (error.message === 'Access denied: Admin privileges required') {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Admin login failed',
        error: error.message
      });
    }
  }

  /**
   * Change password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId; // Assuming this comes from auth middleware
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password and new password are required' 
        });
      }
      
      await authService.changePassword(userId, currentPassword, newPassword);
      
      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error in controller:', error);
      
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message
      });
    }
  }

  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        });
      }
      
      // This is a placeholder - you'd need to implement this method in your service
      // to generate a reset token and send an email
      await authService.generatePasswordResetToken(email);
      
      return res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } catch (error) {
      console.error('Password reset request error in controller:', error);
      
      // Don't reveal if the email exists for security reasons
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive reset instructions'
      });
    }
  }

  /**
   * Reset password with token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token and new password are required' 
        });
      }
      
      await authService.resetPassword(token, newPassword);
      
      return res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Password reset error in controller:', error);
      
      if (error.message === 'Invalid or expired token') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        error: error.message
      });
    }
  }

  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId; // Assuming this comes from auth middleware
      
      const user = await authService.getUserProfile(userId);
      
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error in controller:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        error: error.message
      });
    }
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      const userId = req.user.userId; // Assuming this comes from auth middleware
      
      await authService.logout(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error in controller:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to logout',
        error: error.message
      });
    }
  }

  /**
   * Verify authentication token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyToken(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token is required' 
        });
      }
      
      const decoded = await authService.verifyToken(token);
      
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: decoded
      });
    } catch (error) {
      console.error('Token verification error in controller:', error);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: error.message
      });
    }
  }
}

export default new AuthController();