const axios = require('axios');
const crypto = require('crypto');
const db = require('../config/mysql');

// JUSPAY Configuration
const JUSPAY_MERCHANT_ID = process.env.JUSPAY_MERCHANT_ID || 'ONEMENTOR';
const JUSPAY_API_KEY = process.env.JUSPAY_API_KEY || '770CA820CB74397AD51087EC5CA9F0';
const JUSPAY_BASE_URL = process.env.JUSPAY_BASE_URL || 'https://api.juspay.in';
const JUSPAY_RETURN_URL = process.env.JUSPAY_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`;

/**
 * Generate HMAC signature for JUSPAY requests
 */
function generateJuspaySignature(params, apiKey) {
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  return crypto
    .createHmac('sha256', apiKey)
    .update(queryString)
    .digest('hex');
}

/**
 * Create a payment order with JUSPAY
 * @param {Object} paymentData - Payment details
 * @param {number} paymentData.amount - Amount (e.g., 10.00 for INR)
 * @param {string} paymentData.currency - Currency code (INR, USD, etc.)
 * @param {string} paymentData.order_id - Unique order ID
 * @param {string} paymentData.customer_email - Customer email
 * @param {string} paymentData.customer_name - Customer name
 * @param {string} paymentData.customer_phone - Customer phone (with country code)
 * @param {string} paymentData.return_url - Return URL after payment
 * @param {Object} paymentData.metadata - Additional metadata
 */
async function createPaymentOrder(paymentData) {
  try {
    const { 
      amount, 
      currency, 
      order_id, 
      customer_email, 
      customer_name, 
      customer_phone,
      metadata 
    } = paymentData;

    // Format phone number (JUSPAY expects format: country_code + number)
    let formattedPhone = customer_phone || '';
    if (formattedPhone) {
      formattedPhone = formattedPhone.replace(/[-\s]/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
    }

    // Prepare order parameters
    const orderParams = {
      order_id: order_id,
      amount: (parseFloat(amount) * 100).toString(), // Convert to paise (smallest currency unit)
      currency: currency || 'INR',
      customer_id: customer_email, // Use email as customer ID
      customer_email: customer_email,
      customer_phone: formattedPhone,
      customer_first_name: customer_name?.split(' ')[0] || customer_name,
      customer_last_name: customer_name?.split(' ').slice(1).join(' ') || '',
      return_url: JUSPAY_RETURN_URL,
      ...(metadata && { metadata: JSON.stringify(metadata) })
    };

    // Generate signature
    const signature = generateJuspaySignature(orderParams, JUSPAY_API_KEY);
    orderParams.signature = signature;

    // Convert params to URL-encoded string for JUSPAY
    const formData = new URLSearchParams();
    Object.keys(orderParams).forEach(key => {
      formData.append(key, orderParams[key]);
    });

    // Make API call to JUSPAY
    const response = await axios.post(
      `${JUSPAY_BASE_URL}/orders`,
      formData.toString(),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JUSPAY_MERCHANT_ID}:${JUSPAY_API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-merchant-id': JUSPAY_MERCHANT_ID
        }
      }
    );

    if (response.data && response.data.status === 'CREATED') {
      return {
        success: true,
        payment_id: response.data.order_id || order_id,
        payment_url: response.data.payment_url || response.data.payment_links?.web || '',
        order_id: response.data.order_id || order_id,
        order_data: response.data
      };
    } else {
      return {
        success: false,
        error: response.data?.error_message || 'Payment order creation failed'
      };
    }
  } catch (error) {
    console.error('JUSPAY Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error_message || error.message || 'Payment order creation failed'
    };
  }
}

/**
 * Get transaction details of an order from JUSPAY
 * @param {string} order_id - Order ID from JUSPAY
 */
async function verifyPayment(order_id) {
  try {
    // Prepare verification parameters
    const verifyParams = {
      order_id: order_id
    };

    // Generate signature
    const signature = generateJuspaySignature(verifyParams, JUSPAY_API_KEY);
    verifyParams.signature = signature;

    // Convert params to query string
    const queryString = new URLSearchParams(verifyParams).toString();

    // Make API call to JUSPAY
    const response = await axios.get(
      `${JUSPAY_BASE_URL}/orders/${order_id}?${queryString}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JUSPAY_MERCHANT_ID}:${JUSPAY_API_KEY}`).toString('base64')}`,
          'x-merchant-id': JUSPAY_MERCHANT_ID
        }
      }
    );

    if (response.data) {
      const orderData = response.data;
      
      // Map JUSPAY status to our internal status
      let status = 'pending';
      if (orderData.status === 'CHARGED' || orderData.status === 'SUCCESS') {
        status = 'completed';
      } else if (orderData.status === 'FAILED' || orderData.status === 'CANCELLED') {
        status = 'failed';
      } else if (orderData.status === 'REFUNDED') {
        status = 'refunded';
      }

      return {
        success: true,
        status: status,
        payment_data: orderData,
        transaction_id: orderData.txn_id || orderData.order_id,
        amount: orderData.amount ? (parseFloat(orderData.amount) / 100).toString() : '0',
        currency: orderData.currency || 'INR'
      };
    } else {
      return {
        success: false,
        error: 'Payment verification failed - no data received'
      };
    }
  } catch (error) {
    console.error('JUSPAY Verification Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error_message || error.message || 'Payment verification failed'
    };
  }
}

/**
 * Save payment record to database
 * @param {Object} paymentData - Payment data
 */
async function savePayment(paymentData) {
  const conn = await db.getConnection();
  try {
    const {
      booking_id,
      user_id,
      mentor_id,
      amount,
      currency,
      payment_method,
      transaction_id,
      status,
      metadata
    } = paymentData;

    const [result] = await conn.query(
      `INSERT INTO payments (
        booking_id, user_id, mentor_id, amount, currency, 
        payment_method, transaction_id, status, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking_id,
        user_id,
        mentor_id,
        amount,
        currency || 'INR',
        payment_method || 'juspay',
        transaction_id,
        status || 'pending',
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error('Error saving payment:', error);
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Update payment status in database
 * @param {string} transaction_id - Transaction ID
 * @param {string} status - Payment status
 * @param {Object} payment_data - Additional payment data
 */
async function updatePaymentStatus(transaction_id, status, payment_data = {}) {
  const conn = await db.getConnection();
  try {
    const updateFields = ['status = ?'];
    const updateValues = [status];

    if (payment_data.payment_date) {
      updateFields.push('payment_date = ?');
      updateValues.push(payment_data.payment_date);
    }

    if (payment_data.refund_amount) {
      updateFields.push('refund_amount = ?');
      updateValues.push(payment_data.refund_amount);
    }

    if (payment_data.refund_date) {
      updateFields.push('refund_date = ?');
      updateValues.push(payment_data.refund_date);
    }

    updateValues.push(transaction_id);

    await conn.query(
      `UPDATE payments SET ${updateFields.join(', ')}, updated_at = NOW() WHERE transaction_id = ?`,
      updateValues
    );

    // Also update booking payment status
    const [payment] = await conn.query(
      `SELECT booking_id FROM payments WHERE transaction_id = ?`,
      [transaction_id]
    );

    if (payment.length > 0) {
      const paymentStatusMap = {
        'completed': 'paid',
        'failed': 'failed',
        'refunded': 'refunded'
      };

      await conn.query(
        `UPDATE bookings SET payment_status = ? WHERE id = ?`,
        [paymentStatusMap[status] || 'pending', payment[0].booking_id]
      );
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Handle JUSPAY webhook
 * @param {Object} webhookData - Webhook payload from JUSPAY
 */
async function handleWebhook(webhookData) {
  try {
    const { order_id, status, txn_id, event, payment_status } = webhookData;

    // JUSPAY webhook format
    const orderId = order_id || webhookData.order_id;
    const transId = txn_id || webhookData.txn_id;
    const paymentStatus = status || payment_status || event;

    if (!orderId && !transId) {
      return { success: false, error: 'Missing order_id or txn_id in webhook' };
    }

    // Map JUSPAY status to our internal status
    let internalStatus = 'pending';
    if (paymentStatus === 'CHARGED' || paymentStatus === 'SUCCESS' || paymentStatus === 'charged') {
      internalStatus = 'completed';
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' || paymentStatus === 'failed') {
      internalStatus = 'failed';
    } else if (paymentStatus === 'REFUNDED' || paymentStatus === 'refunded') {
      internalStatus = 'refunded';
    }

    // Find payment by order_id or transaction_id
    const conn = await db.getConnection();
    try {
      let payment;
      if (transId) {
        const [payments] = await conn.query(
          "SELECT transaction_id FROM payments WHERE transaction_id = ?",
          [transId]
        );
        if (payments.length > 0) {
          payment = payments[0];
        }
      }

      if (!payment && orderId) {
        // Try to find by order_id in metadata
        const [payments] = await conn.query(
          "SELECT transaction_id FROM payments WHERE JSON_EXTRACT(metadata, '$.order_id') = ?",
          [orderId]
        );
        if (payments.length > 0) {
          payment = payments[0];
        }
      }

      if (payment) {
        await updatePaymentStatus(
          payment.transaction_id,
          internalStatus,
          {
            payment_date: internalStatus === 'completed' ? new Date() : undefined,
            refund_amount: internalStatus === 'refunded' ? webhookData.refund_amount : undefined,
            refund_date: internalStatus === 'refunded' ? new Date() : undefined
          }
        );
      } else {
        console.warn('Payment not found for webhook:', { orderId, transId });
      }
    } finally {
      conn.release();
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook handling error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  savePayment,
  updatePaymentStatus,
  handleWebhook
};

