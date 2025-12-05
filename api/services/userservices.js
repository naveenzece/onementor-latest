const pool = require('../config/mysql');
const bcrypt = require('bcryptjs');
const { createAndSendOtp } = require('./otpservice');

async function createUser({ name, email, phone, password, role }) {
  const conn = await pool.getConnection();
  try {
    // Check if user already exists
    const [existing] = await conn.query(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );
    
    if (existing.length > 0) {
      return { error: 'Email already exists', status: 400 };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await conn.query(
      `INSERT INTO users (name, email, phone, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?, 0)`,
      [name, email, phone || null, passwordHash, role || 'user']
    );

    // Send OTP for verification
    await createAndSendOtp(email);

    return { 
      message: "User created successfully. Please verify your email with OTP.", 
      id: result.insertId,
      status: 201
    };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return { error: 'Email already exists', status: 400 };
    }
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { createUser };
