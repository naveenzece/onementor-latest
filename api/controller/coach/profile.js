const db = require("../../config/mysql");

// Create or update mentor profile
exports.createMentorProfile = async (req, res) => {
  try {
    // Handle both JSON and FormData
    const { user_id, username, category, bio, skills, other_skills, hourly_rate } = req.body;
    const resume = req.file ? req.file.filename : null;
    
    // Parse JSON strings if they come from FormData
    let parsedSkills = skills;
    let parsedOtherSkills = other_skills;
    
    if (typeof skills === 'string' && skills.trim().startsWith('[')) {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }
    
    if (typeof other_skills === 'string' && other_skills.trim().startsWith('[')) {
      try {
        parsedOtherSkills = JSON.parse(other_skills);
      } catch (e) {
        // Keep as string if parsing fails
      }
    }

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Convert user_id to integer if it's a string (from FormData)
    const userId = parseInt(user_id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    // Check if user is a mentor
    const [userCheck] = await db.query(
      "SELECT id, role FROM users WHERE id = ? AND role = 'mentor'",
      [userId]
    );

    if (userCheck.length === 0) {
      return res.status(403).json({ error: "User is not a mentor" });
    }

    // Check if profile already exists
    const [existing] = await db.query(
      "SELECT id FROM mentor_profiles WHERE user_id = ?",
      [userId]
    );

    let skillsJson = null;
    let otherSkillsJson = null;

    if (parsedSkills) {
      skillsJson = typeof parsedSkills === 'string' ? parsedSkills : JSON.stringify(parsedSkills);
    }
    if (parsedOtherSkills) {
      otherSkillsJson = typeof parsedOtherSkills === 'string' ? parsedOtherSkills : JSON.stringify(parsedOtherSkills);
    }

    // Handle hourly_rate conversion (might come as string from FormData)
    let hourlyRateValue = null;
    if (hourly_rate !== null && hourly_rate !== undefined && hourly_rate !== '') {
      hourlyRateValue = typeof hourly_rate === 'string' ? parseFloat(hourly_rate) : hourly_rate;
      if (isNaN(hourlyRateValue)) {
        hourlyRateValue = null;
      }
    }

    if (existing.length > 0) {
      // Update existing profile
      const [result] = await db.query(
        `UPDATE mentor_profiles 
         SET username = COALESCE(?, username), 
             category = COALESCE(?, category),
             bio = COALESCE(?, bio),
             skills = COALESCE(?, skills),
             other_skills = COALESCE(?, other_skills),
             resume = COALESCE(?, resume),
             hourly_rate = COALESCE(?, hourly_rate),
             updated_at = NOW()
         WHERE user_id = ?`,
        [username, category, bio, skillsJson, otherSkillsJson, resume, hourlyRateValue, userId]
      );

      return res.json({ message: "Mentor profile updated!", id: existing[0].id });
    } else {
      // Create new profile
      const [result] = await db.query(
        `INSERT INTO mentor_profiles 
         (user_id, username, category, bio, skills, other_skills, resume, hourly_rate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, username, category, bio, skillsJson, otherSkillsJson, resume, hourlyRateValue]
      );

      return res.status(201).json({ message: "Mentor profile created!", id: result.insertId });
    }
  } catch (err) {
    console.error("Error creating mentor profile:", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// Get mentor profile
exports.getMentorProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [profiles] = await db.query(
      `SELECT mp.*, u.name, u.email, u.phone 
       FROM mentor_profiles mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.user_id = ?`,
      [user_id]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: "Mentor profile not found" });
    }

    return res.json(profiles[0]);
  } catch (err) {
    console.error("Error getting mentor profile:", err);
    return res.status(500).json({ error: "Database error" });
  }
};
