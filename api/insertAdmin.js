// JavaScript file to create admin table and insert default admin
// Run with: node insertAdmin.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function insertAdmin() {
    let connection;

    try {
        console.log('🔄 Starting admin setup...');
        console.log('📁 Loading environment variables...');

        // Debug environment variables
        console.log('🔧 Database Configuration:');
        console.log('   Host:', process.env.DB_HOST || 'localhost');
        console.log('   User:', process.env.DB_USER || 'root');
        console.log('   Database:', process.env.DB_NAME || 'onementor');
        console.log('   Password:', process.env.DB_PASSWORD ? '[SET]' : '[EMPTY]');

        console.log('\n🔄 Connecting to MySQL database...');

        // Create connection using your .env settings
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'onementor',
            connectTimeout: 10000,
            acquireTimeout: 10000,
            timeout: 10000
        });

        console.log('✅ Connected to MySQL database successfully!');

        // Step 1: Create admins table
        console.log('🔄 Creating admins table...');
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`email\` varchar(100) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`role\` varchar(50) DEFAULT 'admin',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

        await connection.execute(createTableSQL);
        console.log('✅ Admins table created successfully!');

        // Step 2: Hash the password
        console.log('🔄 Hashing admin password...');
        const plainPassword = 'prwebinfo@2026';  // This is the actual password to use
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        console.log('✅ Password hashed successfully!');
        console.log('🔐 Password being used:', plainPassword);

        // Step 3: Insert admin user
        console.log('🔄 Inserting admin user...');
        const insertAdminSQL = `
      INSERT INTO \`admins\` (\`name\`, \`email\`, \`password\`, \`role\`) VALUES 
      (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      \`name\` = VALUES(\`name\`),
      \`password\` = VALUES(\`password\`),
      \`role\` = VALUES(\`role\`)
    `;

        const adminData = [
            'Admin User',
            'prwebinfo@gmail.com',
            hashedPassword,
            'admin'
        ];

        const [result] = await connection.execute(insertAdminSQL, adminData);

        if (result.insertId) {
            console.log('✅ New admin user created successfully!');
        } else {
            console.log('✅ Admin user updated successfully!');
        }

        // Step 4: Verify the admin was inserted
        console.log('🔄 Verifying admin insertion...');
        const [rows] = await connection.execute(
            'SELECT id, name, email, role, created_at FROM admins WHERE email = ?',
            ['prwebinfo@gmail.com']
        );

        if (rows.length > 0) {
            console.log('✅ Admin verification successful!');
            console.log('Admin details:', {
                id: rows[0].id,
                name: rows[0].name,
                email: rows[0].email,
                role: rows[0].role,
                created_at: rows[0].created_at
            });
        }

        console.log('\n🎉 Setup completed successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 Admin Login Credentials:');
        console.log('   Email: prwebinfo@gmail.com');
        console.log('   Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Please change the default password after first login!');
        console.log('🌐 You can now login at: http://localhost:3000/admin');

    } catch (error) {
        console.error('❌ Error during admin setup:', error.message);

        // Provide specific error guidance
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Fix: Check your database credentials in .env file');
            console.error('   DB_USER, DB_PASSWORD, DB_HOST should be correct');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 Fix: Create the database first');
            console.error('   Run: CREATE DATABASE onementor;');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 Fix: Start your MySQL server');
            console.error('   Make sure MySQL/XAMPP/WAMP is running');
        } else if (error.code === 'ER_DUP_ENTRY') {
            console.error('💡 Info: Admin already exists, trying to update...');
        }

        console.error('\n🔧 Debug Info:');
        console.error('   Database Host:', process.env.DB_HOST || 'localhost');
        console.error('   Database User:', process.env.DB_USER || 'root');
        console.error('   Database Name:', process.env.DB_NAME || 'onementor');

    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed.');
        }
        process.exit(0);
    }
}

// Run the script
console.log('🚀 Starting Admin Setup...');
insertAdmin();