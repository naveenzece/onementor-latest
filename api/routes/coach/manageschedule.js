const express = require("express");
const router = express.Router();
const slotsController = require("../../controller/coach/manageschedule");
const db = require('../../config/mysql');

// Get slots by mentor ID
router.get("/mentor/:mentorId", slotsController.getSlotsByMentor);

// Get all slots (with optional filters)
router.get("/", async (req, res) => {
  try {
    const { mentor_id, date, is_booked, is_active } = req.query;

    let query = `
      SELECT ms.*, u.name as mentor_name, u.email as mentor_email
      FROM mentor_slots ms
      JOIN users u ON ms.mentor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (mentor_id) {
      query += " AND ms.mentor_id = ?";
      params.push(mentor_id);
    }

    if (date) {
      query += " AND ms.date = ?";
      params.push(date);
    }

    if (is_booked !== undefined) {
      query += " AND ms.is_booked = ?";
      params.push(is_booked === 'true' ? 1 : 0);
    }

    if (is_active !== undefined) {
      query += " AND ms.is_active = ?";
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += " ORDER BY ms.date, ms.start_time";

    const [slots] = await db.query(query, params);
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create a new slot
router.post("/", slotsController.createSlot);

// Update a slot
router.put("/:id", slotsController.updateSlot);

// Delete a slot
router.delete("/:id", slotsController.deleteSlot);

module.exports = router;
