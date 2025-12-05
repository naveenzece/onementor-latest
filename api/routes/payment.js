const express = require("express");
const router = express.Router();
const { verifyPayment, updatePaymentStatus, handleWebhook } = require("../services/paymentService");
const db = require("../config/mysql");

// Payment webhook from JUSPAY
router.post("/webhook", async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature (optional but recommended)
    // JUSPAY sends webhook with signature for verification
    
    const result = await handleWebhook(webhookData);

    if (result.success) {
      return res.status(200).json({ message: "Webhook processed successfully" });
    } else {
      return res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Verify payment status (by order_id)
router.get("/verify/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;
    const result = await verifyPayment(order_id);

    if (result.success) {
      // Find payment by order_id in metadata
      const [payments] = await db.query(
        "SELECT transaction_id FROM payments WHERE JSON_EXTRACT(metadata, '$.order_id') = ? OR transaction_id = ?",
        [order_id, order_id]
      );

      if (payments.length > 0) {
        // Update payment status in database
        await updatePaymentStatus(payments[0].transaction_id, result.status, {
          payment_date: result.status === 'completed' ? new Date() : undefined
        });
      }

      return res.json({
        success: true,
        status: result.status,
        payment_data: result.payment_data,
        transaction_id: result.transaction_id
      });
    } else {
      return res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    return res.status(500).json({ error: "Payment verification failed" });
  }
});

// Get payment details by booking ID
router.get("/booking/:booking_id", async (req, res) => {
  try {
    const { booking_id } = req.params;

    const [payments] = await db.query(
      `SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1`,
      [booking_id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payments[0]);
  } catch (err) {
    console.error("Error getting payment:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Payment callback (after user completes payment)
router.get("/callback", async (req, res) => {
  try {
    const { order_id, transaction_id, status } = req.query;

    // JUSPAY typically returns order_id in callback
    const orderId = order_id || transaction_id;

    if (!orderId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=missing_order_id`);
    }

    // Verify payment using order_id
    const result = await verifyPayment(orderId);

    if (result.success) {
      // Find payment record
      const [payments] = await db.query(
        "SELECT booking_id, transaction_id FROM payments WHERE JSON_EXTRACT(metadata, '$.order_id') = ? OR transaction_id = ?",
        [orderId, orderId]
      );

      if (payments.length > 0) {
        // Update payment status
        await updatePaymentStatus(payments[0].transaction_id, result.status, {
          payment_date: result.status === 'completed' ? new Date() : undefined
        });

        // Update booking status if payment is completed
        if (result.status === 'completed') {
          await db.query(
            "UPDATE bookings SET status = 'confirmed', payment_status = 'paid' WHERE id = ?",
            [payments[0].booking_id]
          );
        }

        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?order_id=${orderId}`);
      } else {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=payment_not_found`);
      }
    } else {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=${encodeURIComponent(result.error)}`);
    }
  } catch (err) {
    console.error("Payment callback error:", err);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?error=server_error`);
  }
});

module.exports = router;

