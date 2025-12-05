const db = require('../config/mysql.js');
const bcrypt = require('bcryptjs');

// Create new user with password hash
const createUser = async (data) => {
  const { name, email, phone, password, role } = data;
  const passwordHash = await bcrypt.hash(password, 10);
  const query = "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)";
  const [result] = await db.query(query, [name, email, phone || null, passwordHash, role || 'user']);
  return result;
};

// Find user by email
const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = ?";
  const [rows] = await db.query(query, [email]);
  return rows[0] || null;
};

// Find user by ID
const findUserById = async (id) => {
  const query = "SELECT id, name, email, phone, role, is_verified, is_active, created_at FROM users WHERE id = ?";
  const [rows] = await db.query(query, [id]);
  return rows[0] || null;
};

// Verify password
const verifyPassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};

// Update user verification status
const updateUserVerification = async (email, isVerified = true) => {
  const query = "UPDATE users SET is_verified = ? WHERE email = ?";
  await db.query(query, [isVerified ? 1 : 0, email]);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  updateUserVerification
};
