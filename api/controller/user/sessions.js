const db = require("../../config/mysql");

/* ===========================
   TEST ENDPOINT
=========================== */
exports.testUserSessions = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [userCheck] = await db.query(
      "SELECT id, name FROM users WHERE id = ?",
      [user_id]
    );

    const [bookings] = await db.query(
      "SELECT * FROM bookings WHERE user_id = ?",
      [user_id]
    );

    res.json({
      success: true,
      userExists: userCheck.length > 0,
      totalBookings: bookings.length,
      bookings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   GET UPCOMING SESSIONS
=========================== */
exports.getUpcomingSessions = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "User ID required" });
    }

    const query = `
      SELECT 
        b.id,
        DATE_FORMAT(b.session_date, '%Y-%m-%d') AS sessionDate,
        TIME_FORMAT(b.session_start_time, '%H:%i:%s') AS startTime,
        TIME_FORMAT(b.session_end_time, '%H:%i:%s') AS endTime,
        b.notes,
        b.status,
        b.amount,
        b.payment_status,
        m.name AS coachName,
        m.email AS coachEmail,
        mp.category AS sessionType,
        mp.bio AS coachBio
      FROM bookings b
      JOIN users m ON b.mentor_id = m.id
      LEFT JOIN mentor_profiles mp ON mp.user_id = b.mentor_id
      WHERE 
        b.user_id = ?
        AND (
          b.session_date > CURDATE()
          OR (
            b.session_date = CURDATE()
            AND b.session_start_time > CURTIME()
          )
        )
      ORDER BY b.session_date ASC, b.session_start_time ASC
    `;

    const [sessions] = await db.query(query, [user_id]);

    const formattedSessions = sessions.map(s => ({
      id: s.id,
      date: s.sessionDate,                 // ✅ SAFE STRING
      startTime: s.startTime,
      endTime: s.endTime,
      coachName: s.coachName,
      coachEmail: s.coachEmail,
      sessionType: s.sessionType || "General Coaching",
      description: s.notes,
      status: s.status,
      paymentStatus: s.payment_status,
      amount: s.amount,
      coachBio: s.coachBio
    }));

    res.json({
      success: true,
      count: formattedSessions.length,
      sessions: formattedSessions
    });

  } catch (err) {
    console.error("Upcoming error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
   GET SESSION HISTORY
=========================== */
exports.getSessionHistory = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "User ID required" });
    }

    const query = `
      SELECT 
        b.id,
        DATE_FORMAT(b.session_date, '%Y-%m-%d') AS sessionDate,
        TIME_FORMAT(b.session_start_time, '%H:%i:%s') AS startTime,
        TIME_FORMAT(b.session_end_time, '%H:%i:%s') AS endTime,
        b.notes,
        b.status,
        b.amount,
        b.payment_status,
        b.created_at,
        m.name AS coachName,
        m.email AS coachEmail,
        mp.category AS sessionType,
        mp.bio AS coachBio
      FROM bookings b
      JOIN users m ON b.mentor_id = m.id
      LEFT JOIN mentor_profiles mp ON mp.user_id = b.mentor_id
      WHERE 
        b.user_id = ?
        AND (
          b.session_date < CURDATE()
          OR (
            b.session_date = CURDATE()
            AND b.session_end_time < CURTIME()
          )
        )
      ORDER BY b.session_date DESC, b.session_start_time DESC
      LIMIT ? OFFSET ?
    `;

    const [sessions] = await db.query(query, [
      user_id,
      Number(limit),
      Number(offset)
    ]);

    const [[countResult]] = await db.query(
      `
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE 
          user_id = ?
          AND (
            session_date < CURDATE()
            OR (
              session_date = CURDATE()
              AND session_end_time < CURTIME()
            )
          )
      `,
      [user_id]
    );

    const formattedSessions = sessions.map(s => ({
      id: s.id,
      date: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
      coachName: s.coachName,
      coachEmail: s.coachEmail,
      sessionType: s.sessionType || "General Coaching",
      description: s.notes,
      status: s.status,
      paymentStatus: s.payment_status,
      amount: s.amount,
      coachBio: s.coachBio,
      createdAt: s.created_at
    }));

    res.json({
      success: true,
      count: formattedSessions.length,
      total: countResult.total,
      sessions: formattedSessions
    });

  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: err.message });
  }
};
