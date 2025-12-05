// File: config/mysql.js
const mysql = require('mysql2/promise'); // ← use promise wrapper

// Create a connection pool (recommended)
// Read credentials from env with sensible defaults for local development.
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345678',
  database: process.env.DB_NAME || 'onementor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log(`MySQL pool created for database: ${process.env.DB_NAME || 'onementor'}`);

module.exports = db;
