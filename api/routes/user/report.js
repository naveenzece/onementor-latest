const express = require("express");
const router = express.Router();
const db = require("../../config/mysql");

// Submit feedback after session
router.post("/", async (req, res) => {
  try {
    const { booking_id, user_id, mentor_id, rating, comments } = req.body;

    if (!booking_id || !user_id || !mentor_id || !rating) {
      return res.status(400).json({ error: "booking_id, user_id, mentor_id, and rating are required" });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if booking exists and belongs to user
    const [booking] = await db.query(
      "SELECT id, user_id, mentor_id, status FROM bookings WHERE id = ? AND user_id = ?",
      [booking_id, user_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if feedback already exists
    const [existing] = await db.query(
      "SELECT id FROM session_reports WHERE booking_id = ?",
      [booking_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Feedback already submitted for this booking" });
    }

    await db.query(
      `INSERT INTO session_reports (booking_id, user_id, mentor_id, rating, comments)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, user_id, mentor_id, rating, comments || null]
    );

    // Update mentor rating
    const [reports] = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews 
       FROM session_reports WHERE mentor_id = ?`,
      [mentor_id]
    );

    if (reports.length > 0) {
      await db.query(
        `UPDATE mentor_profiles 
         SET rating = ?, total_sessions = ? 
         WHERE user_id = ?`,
        [reports[0].avg_rating, reports[0].total_reviews, mentor_id]
      );
    }

    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get feedback for a mentor
router.get("/mentor/:mentor_id", async (req, res) => {
  try {
    const { mentor_id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        sr.*, 
        u.name AS user_name,
        u.email AS user_email,
        b.session_date,
        b.session_start_time,
        b.session_end_time
       FROM session_reports sr
       JOIN users u ON u.id = sr.user_id
       JOIN bookings b ON b.id = sr.booking_id
       WHERE sr.mentor_id = ?
       ORDER BY sr.created_at DESC`,
      [mentor_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get feedback for a booking
router.get("/booking/:booking_id", async (req, res) => {
  try {
    const { booking_id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM session_reports WHERE booking_id = ?`,
      [booking_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
