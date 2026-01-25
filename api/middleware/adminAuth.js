const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');

// Middleware to verify admin JWT token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Verify admin still exists
    const admin = await AdminModel.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Admin not found.'
      });
    }

    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    console.error('Admin token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Middleware to check admin session
const verifyAdminSession = (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login as admin.'
      });
    }

    req.admin = req.session.admin;
    next();
  } catch (error) {
    console.error('Admin session verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during session verification.'
    });
  }
};

// Middleware to check if admin has specific role
const requireAdminRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Admin authentication required.'
        });
      }

      if (req.admin.role !== requiredRole && req.admin.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${requiredRole} role required.`
        });
      }

      next();
    } catch (error) {
      console.error('Admin role verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during role verification.'
      });
    }
  };
};

module.exports = {
  verifyAdminToken,
  verifyAdminSession,
  requireAdminRole
};