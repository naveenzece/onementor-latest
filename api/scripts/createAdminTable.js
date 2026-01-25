const db = require('../config/mysql');
const fs = require('fs');
const path = require('path');

async function createAdminTable() {
  try {
    console.log('Creating admin table...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '../db/admins.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL statements (in case there are multiple)
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(statement);
        console.log('Executed SQL statement successfully');
      }
    }
    
    console.log('✅ Admin table created successfully!');
    console.log('Default admin credentials:');
    console.log('Email: prwebinfo@gmail.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin table:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createAdminTable();