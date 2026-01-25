const AdminModel = require('../models/adminModel');
const jwt = require('jsonwebtoken');

class AdminAuthController {
  // Admin login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find admin by email
      const admin = await AdminModel.findByEmail(email);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }

      // Verify password
      const isPasswordValid = await AdminModel.verifyPassword(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email, 
          role: admin.role,
          type: 'admin'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Store admin session
      req.session.admin = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      };

      // Return success response (without password)
      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          },
          token
        }
      });

    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  }

  // Admin logout
  static async logout(req, res) {
    try {
      // Clear admin session
      req.session.admin = null;
      
      res.status(200).json({
        success: true,
        message: 'Admin logout successful'
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during logout'
      });
    }
  }

  // Get current admin profile
  static async getProfile(req, res) {
    try {
      const adminId = req.admin.id;
      
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          admin
        }
      });
    } catch (error) {
      console.error('Get admin profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Check admin session
  static async checkSession(req, res) {
    try {
      if (req.session.admin) {
        res.status(200).json({
          success: true,
          authenticated: true,
          data: {
            admin: req.session.admin
          }
        });
      } else {
        res.status(401).json({
          success: false,
          authenticated: false,
          message: 'No active admin session'
        });
      }
    } catch (error) {
      console.error('Check admin session error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new admin (for super admin)
  static async createAdmin(req, res) {
    try {
      const { name, email, password, role = 'admin' } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      // Check if admin already exists
      const existingAdmin = await AdminModel.findByEmail(email);
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: 'Admin with this email already exists'
        });
      }

      // Create new admin
      const newAdmin = await AdminModel.create({ name, email, password, role });

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: {
          admin: newAdmin
        }
      });

    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during admin creation'
      });
    }
  }
}

module.exports = AdminAuthController;