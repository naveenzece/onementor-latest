const db = require("../../config/mysql");

/* ===========================
   GET UPCOMING SESSIONS (MENTOR)
=========================== */
exports.getMentorUpcomingSessions = async (req, res) => {
    try {
        const { mentor_id } = req.params;

        if (!mentor_id) {
            return res.status(400).json({ error: "Mentor ID required" });
        }

        const query = `
      SELECT 
        b.id as booking_id,
        ms.id as slot_id,
        DATE_FORMAT(ms.date, '%Y-%m-%d') AS sessionDate,
        ms.date as date,
        TIME_FORMAT(ms.start_time, '%H:%i:%s') AS startTime,
        TIME_FORMAT(ms.end_time, '%H:%i:%s') AS endTime,
        ms.start_time as start_time,
        ms.end_time as end_time,
        b.notes,
        b.status,
        b.amount as total_amount,
        ms.amount as slot_amount,
        b.payment_status,
        b.meeting_link,
        u.name AS user_name,
        u.email AS user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN mentor_slots ms ON JSON_CONTAINS(b.slots, CAST(ms.id AS JSON))
      WHERE 
        b.mentor_id = ?
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

        const [sessions] = await db.query(query, [mentor_id]);

        const formattedSessions = sessions.map(s => ({
            id: s.slot_id,
            booking_id: s.booking_id,
            date: s.sessionDate,
            start_time: s.start_time,
            end_time: s.end_time,
            user_name: s.user_name,
            user_email: s.user_email,
            description: s.notes,
            status: s.status,
            paymentStatus: s.payment_status,
            amount: s.slot_amount || s.total_amount,
            meeting_link: s.meeting_link
        }));

        res.json(formattedSessions);

    } catch (err) {
        console.error("Mentor upcoming error:", err);
        res.status(500).json({ error: err.message });
    }
};
