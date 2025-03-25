import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import authRepository from '../database/repository/auth_repository.js';
import userRepository from '../database/repository/user_repository.js';

/**
 * Authentication Service
 * Handles user authentication operations using Auth and User repositories
 */
class AuthService {
  constructor() {
    this.saltRounds = 10;
    this.tokenSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.tokenExpiry = process.env.JWT_EXPIRY || '24h';
  }

  /**
   * Register a new user with authentication credentials
   * @param {Object} userData - User profile data
   * @param {Object} authData - User authentication data (email, password)
   * @returns {Promise<Object>} Created user with token
   */
  async register(userData, authData) {
    try {
      // Check if email already exists
      const emailExists = await authRepository.emailExists(authData.email);
      if (emailExists) {
        throw new Error('Email already registered');
      }

      // Generate userId
      const userId = uuidv4();

      // Hash password
      const hashedPassword = await bcrypt.hash(authData.password, this.saltRounds);

      // Create user record
      const userToCreate = {
        ...userData,
        userId
      };
      const user = await userRepository.createUser(userToCreate);

      // Create auth record
      const authToCreate = {
        email: authData.email,
        password: hashedPassword,
        role: authData.role || 'user',
        userId,
        isAdmin: authData.role === 'admin' ? true : false
      };
      await authRepository.createAuth(authToCreate);

      // Generate token
      const token = this._generateToken({ userId, email: authData.email });

      return {
        user: this._sanitizeUser(user),
        token
      };
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  }

  /**
   * Login user with email and password
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Promise<Object>} User data with access token
   */
  async login(email, password) {
    try {
      // Find auth record by email
      const auth = await authRepository.findByEmail(email);
      if (!auth) {
        throw new Error('Invalid email or password');
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, auth.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Get user data
      const user = await userRepository.findById(auth.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate token
      const token = this._generateToken({ userId: auth.userId, email: auth.email });

      // Update token in database
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours from now
      
      await authRepository.updateAuth(auth.userId, {
        token,
        token_expired: tokenExpiry
      });

      return {
        user: this._sanitizeUser(user),
        token
      };
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Promise<Boolean>} True if password changed successfully
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find auth record by userId
      const auth = await authRepository.findByUserId(userId);
      if (!auth) {
        throw new Error('User not found');
      }

      // Compare current password
      const isPasswordValid = await bcrypt.compare(currentPassword, auth.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await authRepository.updatePassword(userId, hashedPassword);

      return true;
    } catch (error) {
      console.error('Change password error:', error.message);
      throw error;
    }
  }

  /**
   * Reset password using token
   * @param {String} token - Password reset token
   * @param {String} newPassword - New password
   * @returns {Promise<Boolean>} True if reset successful
   */
  async resetPassword(token, newPassword) {
    try {
      // Find user by token
      const auth = await authRepository.findOne({ token, token_expired: { $gt: new Date() } });
      if (!auth) {
        throw new Error('Invalid or expired token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password and remove token
      await authRepository.updateAuth(auth.userId, {
        password: hashedPassword,
        token: null,
        token_expired: null
      });

      return true;
    } catch (error) {
      console.error('Reset password error:', error.message);
      throw error;
    }
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyToken(token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.tokenSecret);

      // Check if token exists in database
      const auth = await authRepository.findByUserId(decoded.userId);
      if (!auth || auth.token !== token) {
        throw new Error('Invalid token');
      }

      // Check if token is expired in database
      if (auth.token_expired && new Date() > auth.token_expired) {
        throw new Error('Token expired');
      }

      return decoded;
    } catch (error) {
      console.error('Token verification error:', error.message);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserProfile(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return this._sanitizeUser(user);
    } catch (error) {
      console.error('Get user profile error:', error.message);
      throw error;
    }
  }

  /**
   * Login for admin access
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Promise<Object>} User data with access token if admin
   * @throws {Error} If user is not an admin or credentials are invalid
   */
  async loginAdminUser(email, password) {
    try {
      // Find auth record by email
      const auth = await authRepository.findByEmail(email);
      if (!auth) {
        throw new Error('Invalid email or password');
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, auth.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if user has admin privileges
      if (auth.role === 'admin' || (auth.role === 'user' && auth.isAdmin === true)) {
        // Get user data
        const user = await userRepository.findById(auth.userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Generate token
        const token = this._generateToken({ userId: auth.userId, email: auth.email, isAdmin: true });

        // Update token in database
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours from now
        
        await authRepository.updateAuth(auth.userId, {
          token,
          token_expired: tokenExpiry
        });

        return {
          user: this._sanitizeUser(user),
          token
        };
      } else {
        throw new Error('Access denied: Admin privileges required');
      }
    } catch (error) {
      console.error('Admin login error:', error.message);
      throw error;
    }
  }

  /**
   * Logout user
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} True if logout successful
   */
  async logout(userId) {
    try {
      await authRepository.updateAuth(userId, {
        token: null,
        token_expired: null
      });
      
      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @returns {String} JWT token
   * @private
   */
  _generateToken(payload) {
    return jwt.sign(payload, this.tokenSecret, { expiresIn: this.tokenExpiry });
  }

  /**
   * Remove sensitive data from user object
   * @param {Object} user - User object
   * @returns {Object} Sanitized user object
   * @private
   */
  _sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : { ...user };
    
    // Remove sensitive fields
    return userObj;
  }
}

export default new AuthService();