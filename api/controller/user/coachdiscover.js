const pool = require('../../config/mysql');

const getMentors = async (req, res) => {
  try {
    const { category, skill, date, min_rating, max_price } = req.query;

    let query = `
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.is_verified,
        u.is_active,
        mp.username,
        mp.category,
        mp.bio,
        mp.skills,
        mp.other_skills,
        mp.resume,
        mp.rating,
        mp.total_sessions,
        mp.hourly_rate,
        COUNT(DISTINCT ms.id) as available_slots_count
      FROM users u
      LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
      LEFT JOIN mentor_slots ms ON u.id = ms.mentor_id 
        AND ms.is_booked = 0 
        AND (ms.is_active = 1 OR ms.is_active IS NULL)
        AND ms.date >= CURDATE()
      WHERE u.role = 'mentor' 
        AND u.is_active = 1
    `;

    const params = [];

    if (category) {
      query += ` AND mp.category LIKE ?`;
      params.push(`%${category}%`);
    }

    if (skill) {
      query += ` AND (mp.skills LIKE ? OR mp.other_skills LIKE ?)`;
      params.push(`%${skill}%`, `%${skill}%`);
    }

    if (date) {
      query += ` AND ms.date = ?`;
      params.push(date);
    }

    if (min_rating) {
      query += ` AND mp.rating >= ?`;
      params.push(parseFloat(min_rating));
    }

    if (max_price) {
      query += ` AND mp.hourly_rate <= ?`;
      params.push(parseFloat(max_price));
    }

    query += ` GROUP BY u.id, u.name, u.email, u.is_verified, u.is_active, mp.username, mp.category, mp.bio, 
               mp.skills, mp.other_skills, mp.resume, mp.rating, mp.total_sessions, mp.hourly_rate
               ORDER BY mp.rating DESC, mp.total_sessions DESC, mp.hourly_rate ASC`;

    console.log('Mentor Discovery Query:', query);
    console.log('Query Params:', params);

    const [rows] = await pool.query(query, params);
    
    console.log(`Found ${rows.length} mentors`);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getMentors };
