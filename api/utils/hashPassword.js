const bcrypt = require('bcryptjs');

// Utility script to hash passwords for manual admin creation
async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Original password: ${password}`);
    console.log(`Hashed password: ${hashedPassword}`);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

// Example usage - uncomment and run with node to hash a password
// hashPassword('admin123');

module.exports = { hashPassword };