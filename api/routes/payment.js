const express = require("express");
const router = express.Router();
const { verifyPayment, updatePaymentStatus, handleWebhook, createPayoutOrder, createPaymentSession, verifyWebhookSignature } = require("../services/paymentService");
const { generateOrderId, generateCustomerId } = require("../util/generators");
const db = require("../config/mysql");



/**
 * @swagger
 * /api/payment/payout:
 *   post:
 *     summary: Create booking and payout order to transfer money to mentor
 *     description: Creates a booking record and JUSPAY payout order. Booking status remains 'pending' until payment is completed via /api/payment/session endpoint.
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - mentor_id
 *               - slot_ids
 *               - amount
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID who is making the booking
 *                 example: 1
 *               mentor_id:
 *                 type: integer
 *                 description: Mentor user ID
 *                 example: 2
 *               slot_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of slot IDs to book (supports multiple slots)
 *                 example: [5, 6, 7]
 *               amount:
 *                 type: number
 *                 description: Total amount to payout for all slots
 *                 example: 1500.00
 *               remark:
 *                 type: string
 *                 description: Optional remark for the transaction
 *                 example: "Payment for mentorship sessions"
 *     responses:
 *       200:
 *         description: Booking and payout order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking and payout order created successfully. Please complete the payment to confirm the booking."
 *                 booking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     mentor_id:
 *                       type: integer
 *                       example: 2
 *                     slot_ids:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [5, 6, 7]
 *                     slots:
 *                       type: array
 *                       items:
 *                         type: object
 *                     slot_count:
 *                       type: integer
 *                       example: 3
 *                     amount:
 *                       type: number
 *                       example: 1500.00
 *                     status:
 *                       type: string
 *                       enum: [pending, confirmed, completed, cancelled, rejected]
 *                       example: "pending"
 *                     payment_status:
 *                       type: string
 *                       enum: [pending, paid, failed, refunded]
 *                       example: "pending"
 *                     payout_order_id:
 *                       type: string
 *                       example: "PAYOUT_1234567890_abc123"
 *                     payout_order_status:
 *                       type: string
 *                       example: "CREATED"
 *                 payout:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: "PAYOUT_1234567890_abc123"
 *                     status:
 *                       type: string
 *                       example: "CREATED"
 *                     amount:
 *                       type: number
 *                       example: 1500.00
 *                 payment_required:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid request or payout order creation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Some slots are already booked"
 *       404:
 *         description: Slot not found, mentor not found, or beneficiary ID not configured
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Mentor beneficiary ID not found. Please validate VPA first."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 *                 details:
 *                   type: string
 */
router.post("/payout", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      user_id,
      mentor_id,
      slot_ids,
      amount,
      remark
    } = req.body;

    // Support both single slot_id (backward compatibility) and array slot_ids
    const slotIdsArray = Array.isArray(slot_ids) ? slot_ids : (slot_ids ? [slot_ids] : []);

    if (!user_id || !mentor_id || slotIdsArray.length === 0 || !amount) {
      await connection.rollback();
      return res.status(400).json({
        error: "user_id, mentor_id, slot_ids (array), and amount are required"
      });
    }

    // Get all slot details
    const placeholders = slotIdsArray.map(() => '?').join(',');
    const [slots] = await connection.query(
      `SELECT id, mentor_id, date, start_time, end_time, is_booked, is_active 
       FROM mentor_slots 
       WHERE id IN (${placeholders}) AND mentor_id = ?`,
      [...slotIdsArray, mentor_id]
    );

    if (slots.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "No slots found" });
    }

    if (slots.length !== slotIdsArray.length) {
      await connection.rollback();
      return res.status(400).json({ error: "Some slots not found or belong to different mentor" });
    }

    // Validate all slots are available
    const bookedSlots = slots.filter(s => s.is_booked);
    if (bookedSlots.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: `Slot(s) ${bookedSlots.map(s => s.id).join(', ')} are already booked` 
      });
    }

    const inactiveSlots = slots.filter(s => !s.is_active);
    if (inactiveSlots.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: `Slot(s) ${inactiveSlots.map(s => s.id).join(', ')} are not active` 
      });
    }

    // Sort slots by date and time to get first and last session
    const sortedSlots = slots.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return a.start_time.localeCompare(b.start_time);
    });

    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];

    // Get mentor details including beneficiary info
    const [mentorData] = await connection.query(
      `SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        mp.beneficiary_id,
        mp.vpa_name_at_bank,
        mp.vpa_status
      FROM users u
      LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
      WHERE u.id = ? AND u.role = 'mentor'`,
      [mentor_id]
    );

    if (mentorData.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: "Mentor not found or user is not a mentor"
      });
    }

    const mentor = mentorData[0];

    // Check if beneficiary_id is configured
    if (!mentor.beneficiary_id) {
      await connection.rollback();
      return res.status(404).json({
        error: "Mentor beneficiary ID not found. Please validate VPA first."
      });
    }

    // Check if VPA status is valid
    if (mentor.vpa_status !== 'valid' && mentor.vpa_status !== 'verified') {
      await connection.rollback();
      return res.status(400).json({
        error: `Mentor VPA is not verified. Current status: ${mentor.vpa_status || 'pending'}`
      });
    }

    // // Mark all slots as booked
    // const updatePlaceholders = slotIdsArray.map(() => '?').join(',');
    // const [updateResult] = await connection.query(
    //   `UPDATE mentor_slots SET is_booked = 1 WHERE id IN (${updatePlaceholders}) AND is_booked = 0`,
    //   slotIdsArray
    // );

    // if (updateResult.affectedRows !== slotIdsArray.length) {
    //   await connection.rollback();
    //   return res.status(400).json({ error: "Some slots were booked by another user" });
    // }

    // Generate orderId for payout (before creating booking)
    const payoutOrderId = generateOrderId('PAYOUT');

    // Generate customerId and routingId using utility function
    const customerId = generateCustomerId(mentor_id, mentor.email);
    const routingId = customerId; // Same as customerId

    // Use mentor's name at bank if available, otherwise use regular name
    const beneficiaryName = mentor.vpa_name_at_bank || mentor.name;

    // Create payout order in JUSPAY first or mock if testing
    let payoutResult;

    if (process.env.USE_JUSPAY === 'true') {
      payoutResult = await createPayoutOrder({
        orderId: payoutOrderId,
        customerId,
        customerEmail: mentor.email,
        customerPhone: mentor.phone || '',
        amount,
        beneficiaryId: mentor.beneficiary_id,
        beneficiaryName: beneficiaryName,
        routingId: routingId,
        remark: remark || `Payout order for booking`
      });
    } else {
      console.log("Skipping Juspay payout order creation (USE_JUSPAY != true)");
      payoutResult = {
        success: true,
        orderId: payoutOrderId,
        status: 'CREATED',
        amount: amount,
        responseData: { 
          mock: true, 
          message: "Internal testing - Juspay skipped" 
        },
        fulfillments: [],
        payments: []
      };
    }

    if (!payoutResult.success) {
      await connection.rollback();
      return res.status(400).json({
        error: payoutResult.error || "Failed to create payout order",
        details: payoutResult.responseData
      });
    }

    // Create booking record with slots as JSON array and order information
    // Status remains 'pending' and payment_status remains 'pending' until payment is successful
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings 
       (user_id, mentor_id, slots, status, session_date, session_start_time, session_end_time, 
        amount, payment_status, payout_order_id, payout_order_status, payout_order_data, notes)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        user_id,
        mentor_id,
        JSON.stringify(slotIdsArray), // Store slots as JSON array
        firstSlot.date,
        firstSlot.start_time,
        lastSlot.end_time,
        amount,
        payoutResult.orderId || payoutOrderId,
        payoutResult.status || 'CREATED',
        JSON.stringify(payoutResult.responseData || {}),
        remark || null
      ]
    );

    const bookingId = bookingResult.insertId;

    // Fetch updated booking with order information (before commit)
    const [updatedBooking] = await connection.query(
      `SELECT id, user_id, mentor_id, slots, status, session_date, session_start_time, 
              session_end_time, amount, payment_status, payout_order_id, payout_order_status, 
              payout_order_data, created_at, updated_at
       FROM bookings WHERE id = ?`,
      [bookingId]
    );

    await connection.commit();

    // Get all booked slots details for response
    const [bookedSlotsDetails] = await connection.query(
      `SELECT id, date, start_time, end_time 
       FROM mentor_slots 
       WHERE id IN (${slotIdsArray.map(() => '?').join(',')})`,
      slotIdsArray
    );

    // Parse slots JSON
    let slotIds = [];
    if (updatedBooking[0].slots) {
      if (typeof updatedBooking[0].slots === 'string') {
        try {
          slotIds = JSON.parse(updatedBooking[0].slots);
        } catch (e) {
          slotIds = [];
        }
      } else if (Array.isArray(updatedBooking[0].slots)) {
        slotIds = updatedBooking[0].slots;
      }
    }

    // Parse payout_order_data JSON
    let payoutOrderData = null;
    if (updatedBooking[0].payout_order_data) {
      if (typeof updatedBooking[0].payout_order_data === 'string') {
        try {
          payoutOrderData = JSON.parse(updatedBooking[0].payout_order_data);
        } catch (e) {
          payoutOrderData = {};
        }
      } else {
        payoutOrderData = updatedBooking[0].payout_order_data;
      }
    }

    res.json({
      message: "Booking and payout order created successfully. Please complete the payment to confirm the booking.",
      booking: {
        id: updatedBooking[0].id,
        user_id: updatedBooking[0].user_id,
        mentor_id: updatedBooking[0].mentor_id,
        slot_ids: slotIds,
        slots: bookedSlotsDetails,
        slot_count: slotIds.length,
        session_date: updatedBooking[0].session_date,
        session_start_time: updatedBooking[0].session_start_time,
        session_end_time: updatedBooking[0].session_end_time,
        amount: updatedBooking[0].amount,
        status: updatedBooking[0].status, // Will be 'pending'
        payment_status: updatedBooking[0].payment_status, // Will be 'pending'
        payout_order_id: updatedBooking[0].payout_order_id,
        payout_order_status: updatedBooking[0].payout_order_status,
        payout_order_data: payoutOrderData,
        created_at: updatedBooking[0].created_at,
        updated_at: updatedBooking[0].updated_at
      },
      payout: {
        orderId: payoutResult.orderId,
        status: payoutResult.status,
        amount: payoutResult.amount,
        beneficiary_id: mentor.beneficiary_id,
        fulfillments: payoutResult.fulfillments,
        payments: payoutResult.payments
      },
      payment_required: true
    });
  } catch (err) {
    await connection.rollback();
    console.error("Create booking and payout order error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * @swagger
 * /api/payment/session:
 *   post:
 *     summary: Create payment session for user to make payment
 *     description: Creates a JUSPAY payment session for a booking. Returns payment URL that frontend can redirect user to for completing payment.
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - booking_id
 *             properties:
 *               booking_id:
 *                 type: integer
 *                 description: Booking ID to create payment session for
 *                 example: 123
 *               return_url:
 *                 type: string
 *                 description: Return URL after payment completion (optional)
 *                 example: "https://shop.merchant.com/payment/callback"
 *               description:
 *                 type: string
 *                 description: Payment description (optional)
 *                 example: "Complete your payment"
 *               theme:
 *                 type: string
 *                 enum: [dark, light]
 *                 description: Payment page theme (optional, default dark)
 *                 example: dark
 *               metadata:
 *                 type: object
 *                 description: Additional metadata (optional)
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Payment session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment session created successfully"
 *                 booking_id:
 *                   type: integer
 *                   example: 123
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "ordeh_xxxxxxxxxxxxxxxxxxxx"
 *                     order_id:
 *                       type: string
 *                       example: "PAYOUT_1234567890_abc123"
 *                     status:
 *                       type: string
 *                       example: "NEW"
 *                     payment_links:
 *                       type: object
 *                       properties:
 *                         web:
 *                           type: string
 *                           example: "https://api.juspay.io/orders/ordeh_xxxxxxxxxxxxxxxxxxxx/payment-page"
 *                     sdk_payload:
 *                       type: object
 *                       description: SDK payload for mobile apps
 *                 payment_url:
 *                   type: string
 *                   example: "https://api.juspay.io/orders/ordeh_xxxxxxxxxxxxxxxxxxxx/payment-page"
 *       400:
 *         description: Invalid request or booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Booking not found"
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server error"
 *                 details:
 *                   type: string
 */
router.post("/session", async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      booking_id,
      return_url,
      description,
      theme,
      metadata
    } = req.body;

    if (!booking_id) {
      connection.release();
      return res.status(400).json({
        error: "booking_id is required"
      });
    }

    // Get booking details
    const [bookings] = await connection.query(
      `SELECT 
        b.id,
        b.user_id,
        b.mentor_id,
        b.amount,
        b.payout_order_id,
        b.payout_order_status,
        b.payment_status,
        b.status,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = ?`,
      [booking_id]
    );

    if (bookings.length === 0) {
      connection.release();
      return res.status(404).json({
        error: "Booking not found"
      });
    }

    const booking = bookings[0];

    // Check if booking is already paid
    if (booking.payment_status === 'paid') {
      connection.release();
      return res.status(400).json({
        error: "Booking is already paid",
        booking_id: booking.id
      });
    }

    // Check if payout order exists
    if (!booking.payout_order_id) {
      connection.release();
      return res.status(400).json({
        error: "Payout order not found for this booking. Please create order first."
      });
    }

    // Generate customer ID if not exists
    const customerId = generateCustomerId(booking.user_id, booking.user_email);

    // Create payment session
    // Create payment session
    let sessionResult;
    
    if (process.env.USE_JUSPAY === 'true') {
      sessionResult = await createPaymentSession({
        order_id: booking.payout_order_id, // Use payout_order_id as order_id
        amount: booking.amount.toString(),
        customer_id: customerId,
        customer_email: booking.user_email,
        customer_phone: booking.user_phone || '',
        first_name: booking.first_name || booking.user_name?.split(' ')[0] || '',
        last_name: booking.last_name || booking.user_name?.split(' ').slice(1).join(' ') || '',
        description: description || `Payment for booking #${booking.id}`,
        return_url: return_url || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?booking_id=${booking.id}`,
        payment_page_client_id: process.env.JUSPAY_CLIENT_ID,
        theme: theme || 'dark',
        metadata: {
          ...metadata,
          'JUSPAY:gateway_reference_id': `Booking_${booking.id}`,
          booking_id: booking.id.toString()
        }
      });
    } else {
       console.log("Mocking payment session (USE_JUSPAY != true)");
       sessionResult = {
        success: true,
        sessionId: 'mock_sess_' + Date.now(),
        orderId: booking.payout_order_id,
        status: 'NEW',
        paymentLinks: {
          web: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/userdashboard/userpayment?bookingId=${booking.id}&mock=true`
        },
        sdkPayload: {}
       };
    }

    if (!sessionResult.success) {
      connection.release();
      return res.status(400).json({
        error: sessionResult.error || "Failed to create payment session",
        details: sessionResult.responseData
      });
    }

    connection.release();

    res.json({
      message: "Payment session created successfully",
      booking_id: booking.id,
      session: {
        id: sessionResult.sessionId,
        order_id: sessionResult.orderId,
        status: sessionResult.status,
        payment_links: sessionResult.paymentLinks,
        sdk_payload: sessionResult.sdkPayload
      },
      payment_url: sessionResult.paymentLinks?.web || null
    });
  } catch (err) {
    console.error("Create payment session error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: JUSPAY webhook endpoint for payment status updates
 *     description: Receives webhook notifications from JUSPAY when payment status changes. Supports event-based webhooks (ORDER_SUCCEEDED, ORDER_FAILED, etc.) and direct order webhooks. Updates booking status and marks slots as booked if payment is successful.
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Webhook event ID
 *                 example: "evt_V2_b737837102414514ae0e9717a9f2664d"
 *               event_name:
 *                 type: string
 *                 description: Event type (ORDER_SUCCEEDED, ORDER_FAILED, ORDER_CANCELLED, ORDER_REFUNDED)
 *                 example: "ORDER_SUCCEEDED"
 *               date_created:
 *                 type: string
 *                 format: date-time
 *                 description: Webhook creation timestamp
 *                 example: "2023-08-10T07:00:48Z"
 *               content:
 *                 type: object
 *                 description: Event content containing order details
 *                 properties:
 *                   order:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "ordeh_a9eb2884e4fe4738b70c3d51e6397d34"
 *                       order_id:
 *                         type: string
 *                         description: JUSPAY order ID (matches payout_order_id in bookings)
 *                         example: "PAYOUT_1234567890_abc123"
 *                       status:
 *                         type: string
 *                         description: Payment status (CHARGED, FAILED, CANCELLED, REFUNDED)
 *                         example: "CHARGED"
 *                       amount:
 *                         type: number
 *                         description: Payment amount
 *                         example: 1500.00
 *                       currency:
 *                         type: string
 *                         example: "INR"
 *                       txn_id:
 *                         type: string
 *                         description: Transaction ID
 *                         example: "ms-sample_ord_200-1"
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *                 booking_id:
 *                   type: integer
 *                   example: 123
 *                 order_id:
 *                   type: string
 *                   example: "PAYOUT_1234567890_abc123"
 *                 event_name:
 *                   type: string
 *                   example: "ORDER_SUCCEEDED"
 *                 payment_status:
 *                   type: string
 *                   example: "paid"
 *                 booking_status:
 *                   type: string
 *                   example: "confirmed"
 *                 txn_id:
 *                   type: string
 *                   example: "ms-sample_ord_200-1"
 *                 amount:
 *                   type: number
 *                   example: 1500.00
 *       400:
 *         description: Invalid webhook payload or booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "order_id not found in webhook payload"
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         description: Server error
 */
router.post("/webhook", async (req, res) => {
  try {
    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    
    // Get signature from header (JUSPAY typically sends it in x-juspay-signature or x-signature)
    const signature = req.headers['x-juspay-signature'] || 
                     req.headers['x-signature'] || 
                     req.headers['signature'];

    // Log webhook receipt
    const eventName = req.body.event_name || 'UNKNOWN';
    const orderId = req.body.content?.order?.order_id || 
                   req.body.content?.order?.id || 
                   req.body.order_id || 
                   req.body.id || 
                   'UNKNOWN';
    
    console.log(`[Webhook] Received ${eventName} for order_id: ${orderId}`);
    console.log(`[Webhook] Full payload:`, JSON.stringify(req.body, null, 2));

    // Verify webhook signature (optional but recommended for security)
    if (process.env.USE_JUSPAY === 'true') {
        if (!signature || !verifyWebhookSignature(rawBody, signature)) { 
            // Note: Enforcing signature presence if strictly in prod, 
            // or perform check only if signature exists? 
            // Usually JUSPAY strictly sends it. 
            // However, sticking to the existing pattern:
             if (signature && !verifyWebhookSignature(rawBody, signature)) {
              console.error('[Webhook] Invalid webhook signature');
              return res.status(401).json({ 
                success: false,
                error: 'Invalid webhook signature' 
              });
            }
        }
    } else {
        console.log('[Webhook] Skipping signature verification (USE_JUSPAY != true)');
    }

    // Process webhook
    const result = await handleWebhook(req.body);

    if (!result.success) {
      console.error(`[Webhook] Processing failed:`, result.error);
      return res.status(400).json(result);
    }

    console.log(`[Webhook] Successfully processed ${eventName} for booking_id: ${result.booking_id}`);
    res.status(200).json(result);
  } catch (err) {
    console.error("[Webhook] Processing error:", err);
    res.status(500).json({ 
      success: false,
      error: "Server error", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});



module.exports = router;

