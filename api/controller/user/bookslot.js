const db = require("../../config/mysql");
const { createPaymentOrder, savePayment } = require("../../services/paymentService");

// Book a slot and initiate payment
exports.bookSlot = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { user_id, mentor_id, slot_id, notes } = req.body;

    if (!user_id || !mentor_id || !slot_id) {
      await connection.rollback();
      return res.status(400).json({ error: "user_id, mentor_id, and slot_id are required" });
    }

    // Get slot details
    const [slots] = await connection.query(
      `SELECT id, mentor_id, date, start_time, end_time, is_booked, is_active 
       FROM mentor_slots 
       WHERE id = ? AND mentor_id = ?`,
      [slot_id, mentor_id]
    );

    if (slots.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Slot not found" });
    }

    const slot = slots[0];

    if (slot.is_booked) {
      await connection.rollback();
      return res.status(400).json({ error: "Slot is already booked" });
    }

    if (!slot.is_active) {
      await connection.rollback();
      return res.status(400).json({ error: "Slot is not active" });
    }

    // Get mentor hourly rate
    const [mentorProfile] = await connection.query(
      "SELECT hourly_rate FROM mentor_profiles WHERE user_id = ?",
      [mentor_id]
    );

    if (mentorProfile.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Mentor profile not found" });
    }

    // Calculate amount based on duration
    const startTime = new Date(`2000-01-01 ${slot.start_time}`);
    const endTime = new Date(`2000-01-01 ${slot.end_time}`);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    const hourlyRate = parseFloat(mentorProfile[0].hourly_rate) || 0;
    const amount = durationHours * hourlyRate;

    if (amount <= 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Invalid amount. Please check mentor's hourly rate." });
    }

    // Mark slot as booked
    const [updateResult] = await connection.query(
      "UPDATE mentor_slots SET is_booked = 1 WHERE id = ? AND is_booked = 0",
      [slot_id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Slot was booked by another user" });
    }

    // Create booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings 
       (user_id, mentor_id, slot_id, status, session_date, session_start_time, session_end_time, amount, payment_status, notes)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, 'pending', ?)`,
      [
        user_id,
        mentor_id,
        slot_id,
        slot.date,
        slot.start_time,
        slot.end_time,
        amount,
        notes || null
      ]
    );

    const bookingId = bookingResult.insertId;

    // Get user details for payment
    const [userData] = await connection.query(
      "SELECT name, email, phone FROM users WHERE id = ?",
      [user_id]
    );

    const [mentorData] = await connection.query(
      "SELECT name, email FROM users WHERE id = ?",
      [mentor_id]
    );

    await connection.commit();

    // Create payment order with JUSPAY
    const orderId = `BOOKING_${bookingId}_${Date.now()}`;
    const paymentOrder = await createPaymentOrder({
      amount: amount,
      currency: 'INR',
      order_id: orderId,
      customer_email: userData[0].email,
      customer_name: userData[0].name,
      customer_phone: userData[0].phone || '',
      payment_modes: 'cc,dc,nb,upi', // Credit card, Debit card, Net Banking, UPI
      metadata: {
        booking_id: bookingId,
        mentor_id: mentor_id,
        slot_id: slot_id
      }
    });

    if (!paymentOrder.success) {
      // If payment creation fails, we still have the booking but need to handle it
      return res.status(500).json({
        error: "Booking created but payment initialization failed",
        booking_id: bookingId,
        payment_error: paymentOrder.error
      });
    }

    // Save payment record
    const paymentId = await savePayment({
      booking_id: bookingId,
      user_id: user_id,
      mentor_id: mentor_id,
      amount: amount,
      currency: 'INR',
      payment_method: 'juspay',
      transaction_id: paymentOrder.payment_id || orderId,
      status: 'pending',
      metadata: {
        order_id: paymentOrder.order_id || orderId,
        payment_url: paymentOrder.payment_url,
        order_data: paymentOrder.order_data
      }
    });

    // Update booking with payment info
    await connection.query(
      "UPDATE bookings SET payment_status = 'pending' WHERE id = ?",
      [bookingId]
    );

    res.status(201).json({
      message: "Booking created successfully. Please complete the payment.",
      booking: {
        id: bookingId,
        user_id: user_id,
        mentor_id: mentor_id,
        slot_id: slot_id,
        session_date: slot.date,
        session_start_time: slot.start_time,
        session_end_time: slot.end_time,
        amount: amount,
        status: 'pending',
        payment_status: 'pending'
      },
      payment: {
        payment_id: paymentId,
        payment_url: paymentOrder.payment_url,
        order_id: paymentOrder.order_id
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error("Booking error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  } finally {
    connection.release();
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status } = req.query;

    let query = `
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        m.name as mentor_name,
        m.email as mentor_email,
        mp.category as mentor_category,
        mp.hourly_rate
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN users m ON b.mentor_id = m.id
      LEFT JOIN mentor_profiles mp ON b.mentor_id = mp.user_id
      WHERE b.user_id = ?
    `;
    const params = [user_id];

    if (status) {
      query += " AND b.status = ?";
      params.push(status);
    }

    query += " ORDER BY b.session_date DESC, b.session_start_time DESC";

    const [bookings] = await db.query(query, params);
    res.json(bookings);
  } catch (err) {
    console.error("Error getting bookings:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Get mentor bookings
exports.getMentorBookings = async (req, res) => {
  try {
    const { mentor_id } = req.params;
    const { status } = req.query;

    let query = `
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        m.name as mentor_name,
        m.email as mentor_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN users m ON b.mentor_id = m.id
      WHERE b.mentor_id = ?
    `;
    const params = [mentor_id];

    if (status) {
      query += " AND b.status = ?";
      params.push(status);
    }

    query += " ORDER BY b.session_date DESC, b.session_start_time DESC";

    const [bookings] = await db.query(query, params);
    res.json(bookings);
  } catch (err) {
    console.error("Error getting bookings:", err);
    res.status(500).json({ error: "Database error" });
  }
};



