const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Protects routes by verifying the JSON Web Token in the Authorization header.
 * Attaches the authenticated user document to req.user (excluding password).
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Bearer token is provided in the headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token after "Bearer "
      token = req.headers.authorization.split(' ')[1];

      // Verify the token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from database and attach to request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found or account removed' });
      }

      next();
    } catch (error) {
      console.error('Authentication error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Role-based Authorization Middleware
 * Restricts access to specified user roles (e.g., 'admin').
 *
 * @param  {...string} roles - Array of allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied: You do not have permission to perform this action'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
