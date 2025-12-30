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
        b.id AS booking_id,
        ms.id AS slot_id,
        DATE_FORMAT(ms.date, '%Y-%m-%d') AS sessionDate,
        TIME_FORMAT(ms.start_time, '%H:%i:%s') AS startTime,
        TIME_FORMAT(ms.end_time, '%H:%i:%s') AS endTime,
        b.notes,
        b.status,
        b.amount AS total_amount,
        ms.amount AS slot_amount,
        b.payment_status,
        b.meeting_link,
        m.name AS coachName,
        m.email AS coachEmail,
        mp.category AS sessionType,
        mp.bio AS coachBio
      FROM bookings b
      JOIN users m ON b.mentor_id = m.id
      JOIN mentor_slots ms ON JSON_CONTAINS(b.slots, CAST(ms.id AS JSON))
      LEFT JOIN mentor_profiles mp ON mp.user_id = b.mentor_id
      WHERE 
        b.user_id = ?
        AND b.status IN ('confirmed', 'completed')
        AND (
          ms.date > CURDATE()
          OR (
            ms.date = CURDATE()
            AND ms.start_time > CURTIME()
          )
        )
      ORDER BY ms.date ASC, ms.start_time ASC
    `;

    const [sessions] = await db.query(query, [user_id]);

    const formattedSessions = sessions.map(s => ({
      id: s.slot_id,
      booking_id: s.booking_id,
      date: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
      coachName: s.coachName,
      coachEmail: s.coachEmail,
      sessionType: s.sessionType || "General Coaching",
      description: s.notes,
      status: s.status,
      paymentStatus: s.payment_status,
      amount: s.slot_amount || (s.total_amount / (sessions.filter(x => x.booking_id === s.booking_id).length || 1)),
      coachBio: s.coachBio,
      meetingLink: s.meeting_link
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
        b.id AS booking_id,
        ms.id AS slot_id,
        DATE_FORMAT(ms.date, '%Y-%m-%d') AS sessionDate,
        TIME_FORMAT(ms.start_time, '%H:%i:%s') AS startTime,
        TIME_FORMAT(ms.end_time, '%H:%i:%s') AS endTime,
        b.notes,
        b.status,
        b.amount AS total_amount,
        ms.amount AS slot_amount,
        b.payment_status,
        b.meeting_link,
        b.created_at,
        m.name AS coachName,
        m.email AS coachEmail,
        mp.category AS sessionType,
        mp.bio AS coachBio
      FROM bookings b
      JOIN users m ON b.mentor_id = m.id
      JOIN mentor_slots ms ON JSON_CONTAINS(b.slots, CAST(ms.id AS JSON))
      LEFT JOIN mentor_profiles mp ON mp.user_id = b.mentor_id
      WHERE 
        b.user_id = ?
        AND b.status IN ('confirmed', 'completed')
        AND (
          ms.date < CURDATE()
          OR (
            ms.date = CURDATE()
            AND ms.end_time < CURTIME()
          )
        )
      ORDER BY ms.date DESC, ms.start_time DESC
      LIMIT ? OFFSET ?
    `;

    const [sessions] = await db.query(query, [
      user_id,
      Number(limit),
      Number(offset)
    ]);

    const [[countResult]] = await db.query(
      `
        SELECT COUNT(ms.id) AS total
        FROM bookings b
        JOIN mentor_slots ms ON JSON_CONTAINS(b.slots, CAST(ms.id AS JSON))
        WHERE 
          b.user_id = ?
          AND b.status IN ('confirmed', 'completed')
          AND (
            ms.date < CURDATE()
            OR (
              ms.date = CURDATE()
              AND ms.end_time < CURTIME()
            )
          )
      `,
      [user_id]
    );

    const formattedSessions = sessions.map(s => ({
      id: s.slot_id,
      booking_id: s.booking_id,
      date: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
      coachName: s.coachName,
      coachEmail: s.coachEmail,
      sessionType: s.sessionType || "General Coaching",
      description: s.notes,
      status: s.status,
      paymentStatus: s.payment_status,
      amount: s.slot_amount || (s.total_amount / (sessions.filter(x => x.booking_id === s.booking_id).length || 1)),
      coachBio: s.coachBio,
      createdAt: s.created_at,
      meetingLink: s.meeting_link
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

/* ===========================
   GET USER DASHBOARD STATS
=========================== */
exports.getUserStats = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ error: "User ID required" });
    }

    // 1. Total Sessions (Count individual slots)
    const [[totalResult]] = await db.query(
      `SELECT COUNT(ms.id) AS total 
       FROM bookings b
       JOIN mentor_slots ms ON JSON_CONTAINS(b.slots, CAST(ms.id AS JSON))
       WHERE b.user_id = ? AND b.status IN ('confirmed', 'completed')`,
      [user_id]
    );

    // 2. Active Coaches (Distinct mentors)
    const [[coachResult]] = await db.query(
      `SELECT COUNT(DISTINCT mentor_id) AS activeCoaches FROM bookings WHERE user_id = ? AND status IN ('confirmed', 'completed')`,
      [user_id]
    );

    // 3. Upcoming Sessions (Count individual slots)
    const [[upcomingResult]] = await db.query(
      `SELECT COUNT(ms.id) AS upcoming 
       FROM bookings b
       JOIN mentor_slots ms ON JSON_CONTAINS(b.slots, CAST(ms.id AS JSON))
       WHERE b.user_id = ? 
       AND b.status = 'confirmed' 
       AND (ms.date > CURDATE() OR (ms.date = CURDATE() AND ms.start_time > CURTIME()))`,
      [user_id]
    );

    // 4. Progress (Completed slots / Total slots)
    const [[completedResult]] = await db.query(
      `SELECT COUNT(ms.id) AS completed 
       FROM bookings b
       JOIN mentor_slots ms ON JSON_CONTAINS(b.slots, CAST(ms.id AS JSON))
       WHERE b.user_id = ? AND b.status = 'completed'`,
      [user_id]
    );

    const total = totalResult.total || 0;
    const completed = completedResult.completed || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalSessions: total,
        activeCoaches: coachResult.activeCoaches || 0,
        upcoming: upcomingResult.upcoming || 0,
        progress: progress
      }
    });

  } catch (err) {
    console.error("User stats error:", err);
    res.status(500).json({ error: err.message });
  }
};
