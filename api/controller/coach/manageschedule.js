const db = require("../../config/mysql");

// Get available slots for a mentor
exports.getSlotsByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { date, is_booked, is_active } = req.query;

    console.log("getSlotsByMentor - mentorId:", mentorId);
    console.log("getSlotsByMentor - query params:", { date, is_booked, is_active });

    let query = `
      SELECT 
        ms.id, 
        ms.date, 
        ms.start_time, 
        ms.end_time, 
        ms.is_booked, 
        ms.is_active, 
        ms.created_at, 
        ms.amount, 
        ms.currency,
        b.meeting_link,
        b.user_id as booked_by,
        u.name as user_name,
        u.email as user_email
      FROM mentor_slots ms
      LEFT JOIN bookings b ON ms.id = b.slot_id AND b.status IN ('confirmed', 'completed')
      LEFT JOIN users u ON b.user_id = u.id
      WHERE ms.mentor_id = ?
    `;
    const params = [mentorId];

    if (date) {
      query += " AND ms.date = ?";
      params.push(date);
    }

    if (is_booked !== undefined && is_booked !== '') {
      // Handle both string and number values: '0', 0, 'false', 'true', '1', 1
      const bookedValue = (is_booked === 'true' || is_booked === '1' || is_booked === 1) ? 1 : 0;
      query += " AND ms.is_booked = ?";
      params.push(bookedValue);
    }

    if (is_active !== undefined && is_active !== '') {
      // Handle both string and number values: '0', 0, 'false', 'true', '1', 1
      const activeValue = (is_active === 'true' || is_active === '1' || is_active === 1) ? 1 : 0;
      query += " AND ms.is_active = ?";
      params.push(activeValue);
    }

    query += " ORDER BY ms.date, ms.start_time";

    console.log("Final query:", query);
    console.log("Query params:", params);

    const [results] = await db.query(query, params);

    console.log(`Found ${results.length} slots for mentor ${mentorId}`);

    // Also check if mentor has any slots at all (for debugging)
    if (results.length === 0) {
      const [allSlots] = await db.query(
        "SELECT COUNT(*) as total FROM mentor_slots WHERE mentor_id = ?",
        [mentorId]
      );
      console.log(`Total slots for mentor ${mentorId}:`, allSlots[0]?.total || 0);
    }

    // Format dates to ensure YYYY-MM-DD format (avoid timezone issues)
    const formattedResults = results.map(slot => {
      let formattedDate = slot.date;

      // If date is a Date object, format it as YYYY-MM-DD
      if (slot.date instanceof Date) {
        const year = slot.date.getFullYear();
        const month = String(slot.date.getMonth() + 1).padStart(2, '0');
        const day = String(slot.date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }
      // If date is a string in ISO format, extract YYYY-MM-DD part
      else if (typeof slot.date === 'string' && slot.date.includes('T')) {
        formattedDate = slot.date.split('T')[0];
      }
      // If date is already in YYYY-MM-DD format, use it as is
      else if (typeof slot.date === 'string' && slot.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDate = slot.date;
      }
      // If date has space separator, take first part
      else if (typeof slot.date === 'string') {
        formattedDate = slot.date.split(' ')[0];
      }

      return {
        ...slot,
        date: formattedDate
      };
    });

    console.log("Formatted results:", JSON.stringify(formattedResults, null, 2));

    res.json(formattedResults);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Create a new slot
exports.createSlot = async (req, res) => {
  try {
    const { mentor_id, date, start_time, end_time } = req.body;

    if (!mentor_id || !date || !start_time || !end_time) {
      return res.status(400).json({ error: "mentor_id, date, start_time, and end_time are required" });
    }

    // Validate that user is a mentor
    const [userCheck] = await db.query(
      "SELECT id FROM users WHERE id = ? AND role = 'mentor'",
      [mentor_id]
    );

    if (userCheck.length === 0) {
      return res.status(403).json({ error: "User is not a mentor" });
    }

    // Validate time
    if (start_time >= end_time) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    // Check for overlapping slots
    const [overlapping] = await db.query(
      `SELECT id FROM mentor_slots 
       WHERE mentor_id = ? AND date = ? AND is_active = 1
       AND (
         (start_time <= ? AND end_time > ?) OR
         (start_time < ? AND end_time >= ?) OR
         (start_time >= ? AND end_time <= ?)
       )`,
      [mentor_id, date, start_time, start_time, end_time, end_time, start_time, end_time]
    );

    if (overlapping.length > 0) {
      return res.status(400).json({ error: "Slot overlaps with existing slot" });
    }

    const [result] = await db.query(
      "INSERT INTO mentor_slots (mentor_id, date, start_time, end_time) VALUES (?, ?, ?, ?)",
      [mentor_id, date, start_time, end_time]
    );

    res.status(201).json({
      message: "Slot created successfully",
      id: result.insertId
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Update a slot
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, start_time, end_time, is_active } = req.body;

    const updateFields = [];
    const params = [];

    if (date) {
      updateFields.push("date = ?");
      params.push(date);
    }
    if (start_time) {
      updateFields.push("start_time = ?");
      params.push(start_time);
    }
    if (end_time) {
      updateFields.push("end_time = ?");
      params.push(end_time);
    }
    if (is_active !== undefined) {
      updateFields.push("is_active = ?");
      params.push(is_active ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    params.push(id);

    const [result] = await db.query(
      `UPDATE mentor_slots SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }

    res.json({ message: "Slot updated successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Delete a slot (soft delete by setting is_active = 0)
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if slot is booked
    const [slot] = await db.query(
      "SELECT is_booked FROM mentor_slots WHERE id = ?",
      [id]
    );

    if (slot.length === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slot[0].is_booked) {
      return res.status(400).json({ error: "Cannot delete a booked slot" });
    }

    await db.query(
      "UPDATE mentor_slots SET is_active = 0, updated_at = NOW() WHERE id = ?",
      [id]
    );

    res.json({ message: "Slot deleted successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Database error" });
  }
};
