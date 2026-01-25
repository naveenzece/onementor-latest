const db = require('../config/mysql');
const bcrypt = require('bcryptjs');

class AdminModel {
  // Find admin by email
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM admins WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding admin by email:', error);
      throw error;
    }
  }

  // Find admin by ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, email, role, created_at FROM admins WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding admin by ID:', error);
      throw error;
    }
  }

  // Create new admin
  static async create(adminData) {
    try {
      const { name, email, password, role = 'admin' } = adminData;
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const [result] = await db.execute(
        'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );

      return {
        id: result.insertId,
        name,
        email,
        role,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  // Update admin password
  static async updatePassword(id, newPassword) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const [result] = await db.execute(
        'UPDATE admins SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating admin password:', error);
      throw error;
    }
  }

  // Get all admins (without passwords)
  static async getAll() {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all admins:', error);
      throw error;
    }
  }
}

module.exports = AdminModel;