// Simple admin insertion script
// Run with: node simpleInsertAdmin.js

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  console.log('🚀 Starting simple admin creation...');
  
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'onementor'
    });
    
    console.log('✅ Database connected');

    // Create table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Table created');

    // Hash password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('✅ Password hashed');

    // Insert admin
    await connection.execute(`
      INSERT INTO admins (name, email, password, role) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, ['Admin User', 'prwebinfo@gmail.com', hashedPassword, 'admin']);
    
    console.log('✅ Admin inserted');

    // Verify
    const [rows] = await connection.execute(
      'SELECT id, name, email, role FROM admins WHERE email = ?',
      ['prwebinfo@gmail.com']
    );
    
    console.log('✅ Admin verified:', rows[0]);
    
    await connection.end();
    
    console.log('\n🎉 SUCCESS!');
    console.log('Login with:');
    console.log('Email: prwebinfo@gmail.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure MySQL is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Check database credentials in .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Create database: CREATE DATABASE onementor;');
    }
  }
  
  process.exit(0);
}

createAdmin();