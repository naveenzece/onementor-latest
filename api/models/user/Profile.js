const db = require('../../config/mysql.js');

const saveProfile = async (user_id, skills, interests, resumePath) => {
  const conn = await db.getConnection();
  try {
    // Validate user_id
    if (!user_id) {
      throw new Error('user_id is required');
    }

    // Check if user exists
    const [userCheck] = await conn.query(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );

    if (userCheck.length === 0) {
      throw new Error('User not found');
    }

    // Check if profile exists
    const [existing] = await conn.query(
      "SELECT id FROM user_profiles WHERE user_id = ?",
      [user_id]
    );

    let skillsJson = typeof skills === 'string' ? skills : JSON.stringify(skills);
    let interestsJson = typeof interests === 'string' ? interests : JSON.stringify(interests);

    if (existing.length > 0) {
      // Update existing profile
      if (resumePath) {
        await conn.query(
          `UPDATE user_profiles 
           SET skills = ?, interests = ?, resume = ?, updated_at = NOW()
           WHERE user_id = ?`,
          [skillsJson, interestsJson, resumePath, user_id]
        );
      } else {
        // Update without changing resume
        await conn.query(
          `UPDATE user_profiles 
           SET skills = ?, interests = ?, updated_at = NOW()
           WHERE user_id = ?`,
          [skillsJson, interestsJson, user_id]
        );
      }
      return { message: "Profile updated successfully", id: existing[0].id };
    } else {
      // Create new profile (resume is optional for creation too)
      if (resumePath) {
        const [result] = await conn.query(
          `INSERT INTO user_profiles (user_id, skills, interests, resume) 
           VALUES (?, ?, ?, ?)`,
          [user_id, skillsJson, interestsJson, resumePath]
        );
        return { message: "Profile saved successfully", id: result.insertId };
      } else {
        const [result] = await conn.query(
          `INSERT INTO user_profiles (user_id, skills, interests) 
           VALUES (?, ?, ?)`,
          [user_id, skillsJson, interestsJson]
        );
        return { message: "Profile saved successfully", id: result.insertId };
      }
    }
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};

const getProfile = async (user_id) => {
  const [rows] = await db.query(
    "SELECT * FROM user_profiles WHERE user_id = ?",
    [user_id]
  );
  return rows[0] || null;
};

module.exports = { saveProfile, getProfile };
