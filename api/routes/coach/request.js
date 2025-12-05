const express = require("express");
const router = express.Router();
const db = require("../../config/mysql");

// Get all booking requests for a mentor
router.get("/:mentor_id", async (req, res) => {
  try {
    const { mentor_id } = req.params;
    const { status } = req.query;

    let query = `
      SELECT 
        b.id as booking_id,
        b.status,
        b.payment_status,
        b.session_date,
        b.session_start_time,
        b.session_end_time,
        b.amount,
        b.created_at,
        u.id as user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        ms.id as slot_id
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN mentor_slots ms ON b.slot_id = ms.id
      WHERE b.mentor_id = ?
    `;
    const params = [mentor_id];

    if (status) {
      query += " AND b.status = ?";
      params.push(status);
    }

    query += " ORDER BY b.created_at DESC LIMIT 1000";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update booking status (accept/reject)
router.patch("/:booking_id", async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { status, meeting_link } = req.body;
    const { mentor_id } = req.query; // Get mentor_id from query to verify ownership

    if (!status || !['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'confirmed', 'rejected', or 'cancelled'" });
    }

    // Verify booking belongs to mentor
    const [booking] = await db.query(
      "SELECT id, mentor_id, status FROM bookings WHERE id = ? AND mentor_id = ?",
      [booking_id, mentor_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({ error: "Booking not found or access denied" });
    }

    const updateFields = ["status = ?"];
    const params = [status];

    if (meeting_link && status === 'confirmed') {
      updateFields.push("meeting_link = ?");
      params.push(meeting_link);
    }

    params.push(booking_id);

    await db.query(
      `UPDATE bookings SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params
    );

    res.json({ message: `Booking ${status} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
