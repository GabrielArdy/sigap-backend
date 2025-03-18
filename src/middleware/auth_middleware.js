import authService from '../services/auth_service.js';

/**
 * Authentication Middleware
 * Verifies JWT token and adds user data to request object
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }
    
    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    try {
      // Verify token using auth service
      const decoded = await authService.verifyToken(token);
      
      // Add user data to request object
      req.user = decoded;
      
      // Proceed to the next middleware/route handler
      next();
    } catch (error) {
      // Token verification failed
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Verifies if the authenticated user has the required role
 * 
 * @param {String|Array} roles - Required role(s) for access
 * @returns {Function} Middleware function
 */
export const roleAuth = (roles) => {
  return (req, res, next) => {
    // First ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }
    
    // Convert single role to array for consistent handling
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has one of the required roles
    if (allowedRoles.includes(req.user.role)) {
      return next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Insufficient permissions.'
      });
    }
  };
};

/**
 * Optional Authentication Middleware
 * Verifies JWT token if provided, but doesn't require it
 * Useful for routes that behave differently for authenticated vs anonymous users
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // If no token is provided, continue without setting req.user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }
    
    try {
      // Verify token using auth service
      const decoded = await authService.verifyToken(token);
      
      // Add user data to request object
      req.user = decoded;
    } catch (error) {
      // Token verification failed, but we don't return an error
      // Just continue without setting req.user
      console.log('Optional auth: Invalid token provided error:', error.message);
    }
    
    // Always proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Continue without authentication in case of errors
    console.error('Optional authentication middleware error:', error);
    next();
  }
};

export default authMiddleware;