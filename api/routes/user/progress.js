const express = require("express");
const router = express.Router();
const db = require("../../config/mysql");

// Update user progress after session
router.post("/", async (req, res) => {
  try {
    const { user_id, booking_id, notes } = req.body;

    if (!user_id || !notes) {
      return res.status(400).json({ error: "user_id and notes are required" });
    }

    await db.query(
      `INSERT INTO progress (user_id, booking_id, notes)
       VALUES (?, ?, ?)`,
      [user_id, booking_id || null, notes]
    );

    res.json({ message: "Progress updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Fetch user progress
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        p.*, 
        b.session_date,
        b.session_start_time,
        b.session_end_time,
        b.status as booking_status,
        u.name as mentor_name
       FROM progress p
       LEFT JOIN bookings b ON b.id = p.booking_id
       LEFT JOIN users u ON u.id = b.mentor_id
       WHERE p.user_id = ? 
       ORDER BY p.created_at DESC`,
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
