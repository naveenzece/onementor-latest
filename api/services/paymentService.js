const axios = require('axios');
const crypto = require('crypto');
const db = require('../config/mysql');

// JUSPAY Configuration
const JUSPAY_MERCHANT_ID = 'ONEMENTORS';
const JUSPAY_API_KEY = '68757B44F6447DE8D36E9C484504B2'
//'770CA820CB74397AD51087EC5CA9F0';
const JUSPAY_CLIENT_ID = 'MIIEpQIBAAKCAQEA2R+5+b1HZSNNMotnr7Z/5By4NSTZW4dDMGDy2huOSLn1EF6v75sssdY5kRkFoihLIeNQA+yzsi0kzpz3rCCCmo1DJwgoqA48JVQwwBjZ9SHeC0nE66VODmMJJGNWe1quHWQb3otIzS+U+rtd1Alzo9up8u8e+FrecyjO6fBMZfd32iO7qPtExtA1XDtKMqoRbHMiAz940xA5+BLmJC+gp1IYsVce2KA5BW1laPxbku42aQR7eZipSa3BYRY8m964Aj6vLj4kTeTbrc4OH7yatRdWbVbrwVWpg936g8Q3Qf3jQY+HMu76l1WeXK4GkPkA+oJXY6ag1XhhqtOrLw3rJwIDAQABAoIBAQCjy2thG4lgouD54HC3/dU9IO1WKhZPFht5w6lxIJiWBLL7RnMzLrzo69NBwr6dNgh36CPU0hw9rhC2TXQKRfxA25BtQZpqLVLyVjDwuc6zPnljyqLjojDgaZXb/ZSgOihfw8XCfRDOubaJ8A84hmjWlEABJKMYeHSYK5Dsqnr37/Oj4OT2NWLaRx8Kk0HPuv/bxx3MHurIHRtG514UJZcOfN8Ti69/DoYbtb/Mpg/djXr5s47TafxPa8jyT2E8nWboPvYPDQcdu2CIE0mbrj2C0Ak7g20ZYzm9HCbJHVG+2rPSjVgXKW2ZgXoZflte+G5vRfDrZH+TZuo+ja0pVlIBAoGBAP4ZEtdpRJp5kvj7bUIkXd5E6lrxd2M0VprfMhHk0i+Z1p1nF8StF6p9uIGuRIEthvdRZVy56fWCHXOfmquRJDHazQZVnnXcRaqhuMYdZoJ3i1KkmSL4X/SdBsB4rY4FQZWNtwKoSeDugQeJzf4bhyn0iZGbWPq+XO70MxXya8CfAoGBANq/zL6ul+G6i/nXrfzwUr83EtXh6Zoj51YBK4g3ZIIuWkWvbo9NguV3p9KmeRKMWwYORHC7aVwpHdjzOyzmSFdmC+5dqVe6rkdl9AzxpKt0p0rOznmZUhDcdElCk0p6pC5RQDAt2PA4aR3kT+9z2dPV0IHsUGiouF/LtmTmdCB5AoGAIShUdRefhCjpLORiVYc5WI/VpRhtY9yokH0fo4Ygh2Wjw9Z4G4oa1HyjXwjGl7TBL/THLVp1VTwta7EgFdNSzc6ngnQZwXeE/8cqvW+IuO2wmJAyC4Ytv1XeU69rtmSpMkLT5tzfByMYY0twPgCJmsf2S7Hh4paEugnTwMFpnjECgYEAoTqc/i5RY97LLOr7ImM/mhBNobdRJnswFwPlwhCR1CG2B4a2Rokq4VbAK1LoCfPJYz1A1JZNoc/sX+tmwkE5MLHWOWpvVmoR6i4LIz83z+e7JjgnlxialDLowtZ/GXYrbLgWR2yDaQsq7w1InYUWGDyP4jL7USiKPJE5bkUtcoECgYEAwhbb1NxzteIr8zlytMj52sgeiJPQRjbU5CoMAJuiHvYHT8jQwso7lfbz+fXdQamU29v1Hdhc2JR1xWxrTz4bAt1l9lWK8zQBTK3SOlhyvrvNkKtTwjansR6+uwB9KY5mrF++pRA8IL2f0yhx2uqwDkX/Og6ZnFHJn3BvQM/DWPg=';
const JUSPAY_BASE_URL = 'https://sandbox.juspay.in';
const JUSPAY_SANDBOX_URL = 'https://sandbox.juspay.in';
const JUSPAY_RETURN_URL = 'http://localhost:3000/payment/callback';
const JUSPAY_PAYOUT_BASE_URL = JUSPAY_SANDBOX_URL; // Use sandbox for payout API

/**
 * Validate VPA (UPI ID) using JUSPAY payout API
 * @param {Object} vpaData - VPA validation details
 * @param {string} vpaData.vpa - UPI VPA ID (e.g., "name@upi")
 * @param {string} vpaData.name - Account holder name
 * @param {string} vpaData.email - Mentor email
 * @param {string} vpaData.phone - Mentor phone
 * @param {string} vpaData.customerId - Customer ID (optional, will be generated if not provided)
 * @param {string} vpaData.beneId - Beneficiary ID (optional, for existing beneficiary)
 */
async function validateVPA(vpaData) {
  try {
    const {
      vpa,
      name,
      email,
      phone,
      customerId,
      beneId
    } = vpaData;

    if (!vpa || !email || !phone) {
      return {
        success: false,
        error: 'VPA, email, and phone are required'
      };
    }

    // Format phone number
    let formattedPhone = phone.replace(/[-\s]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // Generate unique beneficiary ID if not provided
    // Use customerId to derive a unique beneId to ensure consistency
    const finalCustomerId = customerId || `customer_${Date.now()}`;
    const finalBeneId = beneId || finalCustomerId.replace('customer_', 'bene_');

    // Prepare request payload
    const payload = {
      command: 'CREATE',
      customerId: finalCustomerId,
      email: email,
      phone: formattedPhone,
      beneDetails: {
        details: {
          name: name || email.split('@')[0],
          vpa: vpa
        },
        type: 'UPI_ID'
      },
      beneId: finalBeneId
    };

    // Make API call to JUSPAY payout API
    // Basic Auth format: Username = API Key, Password = Empty string
    const authHeader = `Basic ${Buffer.from(JUSPAY_API_KEY + ':').toString('base64')}`;
    console.log(authHeader, JUSPAY_PAYOUT_BASE_URL, payload);

    const response = await axios.post(
      `${JUSPAY_PAYOUT_BASE_URL}/payout/merchant/v2/benedetails`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-merchantid': JUSPAY_MERCHANT_ID,
          'Authorization': authHeader
        }
      }
    );

    if (response.data && response.data.status === 'VALID') {
      return {
        success: true,
        status: 'valid',
        uniqueId: response.data.uniqueId || response.data.beneId,
        beneId: response.data.uniqueId || response.data.beneId,
        nameAtBank: response.data.nameAtBank,
        responseCode: response.data.responseCode,
        responseMessage: response.data.responseMessage,
        validationType: response.data.validationType,
        beneDetails: response.data.beneDetails,
        responseData: response.data
      };
    } else {
      return {
        success: false,
        status: response.data?.status || 'invalid',
        error: response.data?.responseMessage || 'VPA validation failed',
        responseCode: response.data?.responseCode,
        responseData: response.data
      };
    }
  } catch (error) {
    console.error('JUSPAY VPA Validation Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.responseMessage || error.message || 'VPA validation failed',
      responseData: error.response?.data
    };
  }
}

/**
 * Get beneficiary details and status from JUSPAY
 * @param {string} customerId - Customer ID
 * @param {string} beneId - Beneficiary ID
 */
async function getBeneficiaryStatus(customerId, beneId) {
  try {
    if (!customerId || !beneId) {
      return {
        success: false,
        error: 'customerId and beneId are required'
      };
    }

    // Basic Auth format: Username = API Key, Password = Empty string
    const authHeader = `Basic ${Buffer.from(JUSPAY_API_KEY + ':').toString('base64')}`;

    // Make API call to JUSPAY payout API
    const response = await axios.get(
      `${JUSPAY_PAYOUT_BASE_URL}/payout/merchant/v2/benedetails/${customerId}/${beneId}`,
      {
        headers: {
          'x-merchantid': JUSPAY_MERCHANT_ID,
          'Authorization': authHeader
        }
      }
    );

    if (response.data) {
      return {
        success: true,
        status: response.data.status,
        uniqueId: response.data.uniqueId || beneId,
        beneDetails: response.data.beneDetails,
        nameAtBank: response.data.nameAtBank,
        responseCode: response.data.responseCode,
        responseMessage: response.data.responseMessage,
        validationType: response.data.validationType,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
        transactions: response.data.transactions || [],
        responseData: response.data
      };
    } else {
      return {
        success: false,
        error: 'No data received from JUSPAY',
        responseData: response.data
      };
    }
  } catch (error) {
    console.error('JUSPAY Get Beneficiary Status Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.responseMessage || error.message || 'Failed to get beneficiary status',
      responseData: error.response?.data
    };
  }
}

/**
 * Create payout order using JUSPAY payout API
 * @param {Object} payoutData - Payout order details
 * @param {string} payoutData.orderId - Unique order ID
 * @param {string} payoutData.customerId - Customer ID
 * @param {string} payoutData.customerEmail - Customer email
 * @param {string} payoutData.customerPhone - Customer phone
 * @param {number} payoutData.amount - Total payout amount
 * @param {string} payoutData.beneficiaryId - Beneficiary ID (beneId) to receive payout
 * @param {string} payoutData.beneficiaryName - Beneficiary name
 * @param {string} payoutData.routingId - Optional routing ID for customer grouping
 * @param {string} payoutData.remark - Optional remark/note for the transaction
 */
async function createPayoutOrder(payoutData) {
  try {
    const {
      orderId,
      customerId,
      customerEmail,
      customerPhone,
      amount,
      beneficiaryId,
      beneficiaryName,
      routingId,
      remark
    } = payoutData;

    if (!orderId || !customerId || !amount || !beneficiaryId) {
      return {
        success: false,
        error: 'orderId, customerId, amount, and beneficiaryId are required'
      };
    }

    // Format phone number
    let formattedPhone = customerPhone || '';
    if (formattedPhone) {
      formattedPhone = formattedPhone.replace(/[-\s]/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
    }

    // Prepare request payload
    const payload = {
      orderId: orderId,
      customerId: customerId,
      customerEmail: customerEmail || '',
      customerPhone: formattedPhone || '',
      amount: parseFloat(amount).toFixed(2), // Ensure 2 decimal places
      type: 'FULFILL_ONLY',
      fulfillments: [
        {
          amount: parseFloat(amount).toFixed(2),
          beneficiaryDetails: {
            details: {
              name: beneficiaryName || 'Beneficiary',
              id: beneficiaryId
            },
            type: 'BENE_ID'
          }
        }
      ]
    };

    // Add optional remark
    if (remark) {
      payload.fulfillments[0].additionalInfo = {
        remark: remark
      };
    }

    // Basic Auth format: Username = API Key, Password = Empty string
    const authHeader = `Basic ${Buffer.from(JUSPAY_API_KEY + ':').toString('base64')}`;

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'x-merchantid': JUSPAY_MERCHANT_ID,
      'Authorization': authHeader
    };

    // Add routing ID if provided
    if (routingId) {
      headers['x-routing-id'] = routingId;
    }

    // Make API call to JUSPAY payout API
    const response = await axios.post(
      `${JUSPAY_PAYOUT_BASE_URL}/payout/merchant/v1/orders`,
      payload,
      {
        headers: headers
      }
    );

    if (response.data && response.data.orderId) {
      return {
        success: true,
        orderId: response.data.orderId,
        status: response.data.status,
        amount: response.data.amount,
        fulfillments: response.data.fulfillments || [],
        payments: response.data.payments || [],
        responseData: response.data
      };
    } else {
      return {
        success: false,
        error: 'Failed to create payout order',
        responseData: response.data
      };
    }
  } catch (error) {
    console.error('JUSPAY Create Payout Order Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error_message || error.response?.data?.message || error.message || 'Failed to create payout order',
      responseData: error.response?.data
    };
  }
}

/**
 * Create payment session for user to make payment
 * @param {Object} sessionData - Payment session details
 * @param {string} sessionData.order_id - Order ID (usually booking payout_order_id)
 * @param {string} sessionData.amount - Payment amount
 * @param {string} sessionData.customer_id - Customer ID
 * @param {string} sessionData.customer_email - Customer email
 * @param {string} sessionData.customer_phone - Customer phone
 * @param {string} sessionData.first_name - Customer first name
 * @param {string} sessionData.last_name - Customer last name
 * @param {string} sessionData.description - Payment description
 * @param {string} sessionData.return_url - Return URL after payment
 * @param {string} sessionData.payment_page_client_id - Payment page client ID
 * @param {Object} sessionData.metadata - Additional metadata
 */
async function createPaymentSession(sessionData) {
  try {
    const {
      order_id,
      amount,
      customer_id,
      customer_email,
      customer_phone,
      first_name,
      last_name,
      description,
      return_url,
      payment_page_client_id,
      metadata = {},
      theme = 'dark',
      action = 'paymentPage'
    } = sessionData;

    if (!order_id || !amount || !customer_id || !customer_email) {
      return {
        success: false,
        error: 'order_id, amount, customer_id, customer_email, and customer_phone are required'
      };
    }

    // Prepare request payload
    const payload = {
      order_id,
      amount: amount.toString(),
      customer_id,
      customer_email,
      customer_phone,
      payment_page_client_id: payment_page_client_id || JUSPAY_CLIENT_ID,
      action,
      return_url: return_url || JUSPAY_RETURN_URL,
      description: description || 'Complete your payment',
      theme,
      "payment_filter": {
        "allowDefaultOptions": false,
        "options": [
          {
            "paymentMethodType": "UPI",
            "enable": true
          },
          {
            "paymentMethodType": "CARD",
            "enable": true
          }
        ]
      }
    };

    // Add optional fields
    if (first_name) payload.first_name = first_name;
    if (last_name) payload.last_name = last_name;

    // Add metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      Object.keys(metadata).forEach(key => {
        payload[`metadata.${key}`] = metadata[key];
      });
    }

    // Basic Auth format: Username = API Key, Password = Empty string
    const authHeader = `Basic ${Buffer.from(JUSPAY_API_KEY + ':').toString('base64')}`;

    // Prepare headers
    const headers = {
      'Authorization': authHeader,
      'x-merchantid': JUSPAY_MERCHANT_ID,
      'Content-Type': 'application/json'
    };

    // For debugging: Log the payload
    console.log("JUSPAY Session Request Payload:", JSON.stringify(payload, null, 2));

    // Make API call to JUSPAY session API
    const response = await axios.post(
      `${JUSPAY_BASE_URL}/session`,
      payload,
      {
        headers: headers
      }
    );

    console.log("JUSPAY Session Response Data:", JSON.stringify(response.data, null, 2));

    if (response.data && response.data.id) {
      return {
        success: true,
        sessionId: response.data.id,
        orderId: response.data.order_id,
        status: response.data.status,
        paymentLinks: response.data.payment_links || {},
        sdkPayload: response.data.sdk_payload || {},
        responseData: response.data
      };
    } else {
      return {
        success: false,
        error: 'Failed to create payment session',
        responseData: response.data
      };
    }
  } catch (error) {
    console.error('JUSPAY Create Payment Session Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error_message || error.response?.data?.message || error.message || 'Failed to create payment session',
      responseData: error.response?.data
    };
  }
}


/**
 * Create registration fee payment session for mentor onboarding
 * @param {Object} sessionData - Payment session details
 */
async function createRegistrationFeeSession(sessionData) {
  try {
    const {
      order_id,
      amount,
      customer_id,
      customer_email,
      customer_phone,
      first_name,
      last_name,
      description,
      return_url,
      metadata = {}
    } = sessionData;

    if (!order_id || !amount || !customer_id || !customer_email) {
      return {
        success: false,
        error: 'order_id, amount, customer_id, and customer_email are required'
      };
    }

    // Basic Auth format: Username = API Key, Password = Empty string
    const authHeader = `Basic ${Buffer.from(JUSPAY_API_KEY + ':').toString('base64')}`;

    // Prepare request payload
    const payload = {
      order_id,
      amount: amount.toString(),
      customer_id,
      customer_email,
      customer_phone: customer_phone || '',
      payment_page_client_id: JUSPAY_CLIENT_ID,
      action: 'paymentPage',
      return_url: return_url || JUSPAY_RETURN_URL,
      description: description || 'Mentor Registration Fee',
      theme: 'dark',
      first_name: first_name || '',
      last_name: last_name || '',
      ...(metadata && Object.keys(metadata).length > 0 && {
        ...Object.keys(metadata).reduce((acc, key) => {
          acc[`metadata.${key}`] = metadata[key];
          return acc;
        }, {})
      }),
      "payment_filter": { "allowDefaultOptions": false, "options": [{ "paymentMethodType": "UPI", "enable": true }, { "paymentMethodType": "CARD", "enable": true }] }
    };

    console.log("JUSPAY Registration Session Request Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${JUSPAY_BASE_URL}/session`,
      payload,
      {
        headers: {
          'Authorization': authHeader,
          'x-merchantid': JUSPAY_MERCHANT_ID,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("JUSPAY Registration Session Response Data:", JSON.stringify(response.data, null, 2));

    if (response.data && response.data.id) {
      return {
        success: true,
        sessionId: response.data.id,
        orderId: response.data.order_id,
        status: response.data.status,
        paymentLinks: response.data.payment_links || {},
        sdkPayload: response.data.sdk_payload || {},
        responseData: response.data
      };
    } else {
      return {
        success: false,
        error: 'Failed to create registration fee session',
        responseData: response.data
      };
    }
  } catch (error) {
    console.error('JUSPAY Create Registration Session Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error_message || error.response?.data?.message || error.message || 'Failed to create registration fee session',
      responseData: error.response?.data
    };
  }
}
/**
 * Get order status from JUSPAY
 * @param {string} orderId - Order ID to check
 */
async function getOrderStatus(orderId) {
  try {
    if (!orderId) {
      return {
        success: false,
        error: 'orderId is required'
      };
    }

    // Basic Auth format: Username = API Key, Password = Empty string
    const authHeader = `Basic ${Buffer.from(JUSPAY_API_KEY + ':').toString('base64')}`;

    // Make API call to JUSPAY order status API
    const response = await axios.get(
      `${JUSPAY_BASE_URL}/orders/${orderId}`,
      {
        headers: {
          'Authorization': authHeader,
          'x-merchantid': JUSPAY_MERCHANT_ID,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data) {
      return {
        success: true,
        orderId: response.data.order_id,
        status: response.data.status,
        statusId: response.data.status_id,
        amount: response.data.amount,
        currency: response.data.currency,
        paymentMethod: response.data.payment_method,
        paymentMethodType: response.data.payment_method_type,
        txnId: response.data.txn_id,
        respCode: response.data.resp_code,
        respMessage: response.data.resp_message,
        bankErrorCode: response.data.bank_error_code,
        bankErrorMessage: response.data.bank_error_message,
        metadata: response.data.metadata,
        paymentLinks: response.data.payment_links,
        txnDetail: response.data.txn_detail,
        responseData: response.data
      };
    } else {
      return {
        success: false,
        error: 'No data received from JUSPAY',
        responseData: response.data
      };
    }
  } catch (error) {
    console.error('JUSPAY Get Order Status Error:', error.response?.data || error.message);

    // Handle 404 specially as "NOT_FOUND" 
    if (error.response?.status === 404) {
      return {
        success: false,
        status: 'NOT_FOUND',
        statusId: 40,
        error: 'Order not found',
        responseData: error.response?.data
      };
    }

    return {
      success: false,
      error: error.response?.data?.error_message || error.response?.data?.message || error.message || 'Failed to get order status',
      responseData: error.response?.data
    };
  }
}

/**
 * Verify JUSPAY webhook signature
 * @param {string} payload - Raw request body as string
 * @param {string} signature - HMAC signature from x-juspay-signature header
 * @returns {boolean} - True if signature is valid
 */
function verifyWebhookSignature(payload, signature) {
  try {
    if (!signature || !payload) {
      return false;
    }

    // JUSPAY uses HMAC SHA256 with API key as secret
    const hmac = crypto.createHmac('sha256', JUSPAY_API_KEY);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');

    // Compare signatures (use constant-time comparison to prevent timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Handle JUSPAY webhook for payment status updates
 * Supports both event-based webhooks (with event_name and content.order) and direct order webhooks
 * @param {Object} webhookData - Webhook payload from JUSPAY
 * @returns {Object} - Result of webhook processing
 */
async function handleWebhook(webhookData) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Handle event-based webhook structure (ORDER_SUCCEEDED, ORDER_FAILED, etc.)
    let orderData = null;
    let eventName = null;

    if (webhookData.event_name && webhookData.content && webhookData.content.order) {
      // Event-based webhook structure
      eventName = webhookData.event_name;
      orderData = webhookData.content.order;
      console.log(`Processing webhook event: ${eventName}`);
    } else if (webhookData.order || webhookData.order_id || webhookData.id) {
      // Direct order webhook structure (backward compatibility)
      orderData = webhookData.order || webhookData;
      console.log('Processing direct order webhook');
    } else {
      await connection.rollback();
      return {
        success: false,
        error: 'Invalid webhook payload structure. Expected event_name with content.order or order data directly.'
      };
    }

    // Extract order_id from order data (could be in different fields)
    const orderId = orderData.order_id || orderData.id || webhookData.order_id || webhookData.id;
    const status = orderData.status || webhookData.status;
    const paymentStatus = orderData.payment_status || status;
    const txnId = orderData.txn_id || orderData.txn_detail?.txn_id;
    const amount = orderData.amount || orderData.effective_amount;
    const currency = orderData.currency || 'INR';

    if (!orderId) {
      await connection.rollback();
      return {
        success: false,
        error: 'order_id not found in webhook payload'
      };
    }

    console.log(`Processing webhook for order_id: ${orderId}, status: ${status}`);

    // Find booking by payout_order_id
    const [bookings] = await connection.query(
      `SELECT id, user_id, mentor_id, slots, payment_status, status, payout_order_id, amount
       FROM bookings
       WHERE payout_order_id = ?`,
      [orderId]
    );

    if (bookings.length === 0) {
      // Check if it's a registration payment
      const [regPayments] = await connection.query(
        `SELECT id, mentor_id, status FROM registration_payments WHERE order_id = ?`,
        [orderId]
      );

      if (regPayments.length > 0) {
        const regPayment = regPayments[0];
        console.log(`Processing registration payment for mentor_id: ${regPayment.mentor_id}`);

        if (regPayment.status === 'completed' && (status === 'CHARGED' || eventName === 'ORDER_SUCCEEDED')) {
          await connection.rollback();
          return { success: true, message: 'Registration payment already processed' };
        }

        let newRegStatus = 'pending';
        if (eventName === 'ORDER_SUCCEEDED' || status === 'CHARGED' || status === 'SUCCESS') {
          newRegStatus = 'completed';
          // Update mentor profile to 'registered = 1'
          await connection.query(
            "UPDATE mentor_profiles SET registered = 1 WHERE user_id = ?",
            [regPayment.mentor_id]
          );
        } else if (eventName === 'ORDER_FAILED' || status === 'FAILED') {
          newRegStatus = 'failed';
        }

        await connection.query(
          "UPDATE registration_payments SET status = ?, transaction_id = ?, updated_at = NOW() WHERE id = ?",
          [newRegStatus, txnId, regPayment.id]
        );

        await connection.commit();
        return {
          success: true,
          message: 'Registration payment processed',
          mentor_id: regPayment.mentor_id,
          status: newRegStatus
        };
      }

      await connection.rollback();
      console.log(`Order not found for order_id: ${orderId}`);
      return {
        success: false,
        error: 'Order not found for this order_id',
        order_id: orderId
      };
    }

    const booking = bookings[0];

    // Check if already processed (idempotency check)
    if (booking.payment_status === 'paid' && (status === 'CHARGED' || eventName === 'ORDER_SUCCEEDED')) {
      await connection.rollback();
      return {
        success: true,
        message: 'Payment already processed',
        booking_id: booking.id,
        payment_status: booking.payment_status,
        booking_status: booking.status
      };
    }

    // Map JUSPAY status to internal payment status
    let newPaymentStatus = booking.payment_status;
    let newBookingStatus = booking.status;

    // Handle different event types and statuses
    if (eventName === 'ORDER_SUCCEEDED' || status === 'CHARGED' || status === 'SUCCESS' || paymentStatus === 'CHARGED') {
      newPaymentStatus = 'paid';
      newBookingStatus = 'confirmed';
    } else if (eventName === 'ORDER_FAILED' || status === 'FAILED' || paymentStatus === 'FAILED') {
      newPaymentStatus = 'failed';
      newBookingStatus = 'cancelled';
    } else if (eventName === 'ORDER_CANCELLED' || status === 'CANCELLED') {
      newPaymentStatus = 'failed';
      newBookingStatus = 'cancelled';
    } else if (eventName === 'ORDER_REFUNDED' || status === 'REFUNDED' || paymentStatus === 'REFUNDED') {
      newPaymentStatus = 'refunded';
      newBookingStatus = 'cancelled';
    } else if (status === 'PENDING' || status === 'NEW') {
      // Keep current status for pending orders
      newPaymentStatus = booking.payment_status;
      newBookingStatus = booking.status;
    }

    // Prepare webhook data to store (store full webhook payload)
    const webhookPayload = {
      event_name: eventName,
      date_created: webhookData.date_created,
      order_data: orderData,
      full_payload: webhookData
    };

    // Update booking status
    await connection.query(
      `UPDATE bookings 
       SET payment_status = ?,
           status = ?,
           payout_order_status = ?,
           payout_order_data = JSON_MERGE_PATCH(COALESCE(payout_order_data, '{}'), ?),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        newPaymentStatus,
        newBookingStatus,
        status || eventName,
        JSON.stringify(webhookPayload),
        booking.id
      ]
    );

    // Only mark slots as booked if payment is successful
    if (newPaymentStatus === 'paid' && newBookingStatus === 'confirmed') {
      // Parse slots JSON array
      let slotIds = [];
      if (booking.slots) {
        if (typeof booking.slots === 'string') {
          try {
            slotIds = JSON.parse(booking.slots);
          } catch (e) {
            console.error('Error parsing slots JSON:', e);
            slotIds = [];
          }
        } else if (Array.isArray(booking.slots)) {
          slotIds = booking.slots;
        }
      }

      // Mark all slots as booked
      if (slotIds.length > 0) {
        const placeholders = slotIds.map(() => '?').join(',');
        const [updateResult] = await connection.query(
          `UPDATE mentor_slots 
           SET is_booked = 1, updated_at = CURRENT_TIMESTAMP
           WHERE id IN (${placeholders}) AND is_booked = 0`,
          slotIds
        );
        console.log(`Marked ${updateResult.affectedRows} slot(s) as booked`);

        // --- CALENDAR & EMAIL INTEGRATION START ---

        // 1. Fetch User and Mentor Details
        const [userDetails] = await connection.query(
          `SELECT name, email, google_calendar_refresh_token FROM users WHERE id = ?`,
          [booking.user_id]
        );
        const [mentorDetails] = await connection.query(
          `SELECT name, email, google_calendar_refresh_token FROM users WHERE id = ?`,
          [booking.mentor_id]
        );

        if (userDetails.length && mentorDetails.length) {
          const student = userDetails[0];
          const mentor = mentorDetails[0];

          // 2. Fetch Slot Times for Event
          const [slotsData] = await connection.query(
            `SELECT date, start_time, end_time FROM mentor_slots WHERE id IN (${placeholders}) ORDER BY date, start_time`,
            slotIds
          );

          if (slotsData.length > 0) {
            const firstSlot = slotsData[0];
            const lastSlot = slotsData[slotsData.length - 1];

            // Construct Start/End Dates
            // Assumption: slots are on the same day or sequential. 
            // For now, taking First Slot Start and Last Slot End. 
            // Careful with Date + Time string construction.

            const startDateTime = new Date(`${firstSlot.date.toISOString().split('T')[0]}T${firstSlot.start_time}`);
            const endDateTime = new Date(`${lastSlot.date.toISOString().split('T')[0]}T${lastSlot.end_time}`);

            const timeSlotsList = slotsData.map(s => `${s.start_time} - ${s.end_time}`);

            // 3. Create Google Calendar Event
            const calendarService = require('../services/calendarService'); // Lazy load to avoid circular deps if any

            const eventData = {
              summary: `Mentorship Session: ${student.name} with ${mentor.name}`,
              description: `OneMentor Session.\n\nStudent: ${student.name}\nMentor: ${mentor.name}\n\n Slots: ${timeSlotsList.join(', ')}`,
              start: startDateTime,
              end: endDateTime,
              attendees: [student.email, mentor.email]
            };

            try {
              // Create event on Mentor's Calendar (Assuming Mentor connected structure logic)
              // Or prioritize System Admin Calendar? 
              // Prompt implies "add the event in mentor google calendar and user google calendar"
              // We can create it using the Mentor's credential if present.

              let calendarResult = null;
              if (mentor.google_calendar_refresh_token) {
                calendarResult = await calendarService.createCalendarEvent(booking.mentor_id, eventData, 'mentor');
              } else if (student.google_calendar_refresh_token) {
                // Fallback to student if mentor not connected? Usually Mentor hosts.
                // Or just skip if no one connected?
                console.log("Mentor calendar not connected, trying student...");
                calendarResult = await calendarService.createCalendarEvent(booking.user_id, eventData, 'user');
              } else {
                console.log("No calendar credentials found for event creation.");
              }

              if (calendarResult && calendarResult.meetLink) {
                const meetLink = calendarResult.meetLink;
                console.log("Google Meet Link Generated:", meetLink);

                // 4. Update Booking with Meet Link
                await connection.query(
                  `UPDATE bookings SET meeting_link = ? WHERE id = ?`,
                  [meetLink, booking.id]
                );

                // 5. Send Emails
                const { sendEmail } = require('../services/mailer');
                const { generateSessionConfirmationEmail } = require('../utils/emailTemplates/sessionConfirmation');

                const emailContent = generateSessionConfirmationEmail({
                  studentName: student.name,
                  mentorName: mentor.name,
                  date: firstSlot.date.toDateString(),
                  timeSlots: timeSlotsList,
                  meetLink: meetLink,
                  amount: booking.amount
                });

                // Send to Student
                await sendEmail({
                  to: student.email,
                  subject: emailContent.subject,
                  html: emailContent.html
                });

                // Send to Mentor
                await sendEmail({
                  to: mentor.email,
                  subject: emailContent.subject,
                  html: emailContent.html
                });

                console.log("Confirmation emails sent.");

              }

            } catch (calErr) {
              console.error("Calendar/Email Automation Error:", calErr);
              // Don't rollback payment for this, just log it.
            }
          }
        }
        // --- CALENDAR & EMAIL INTEGRATION END ---
      }
    }

    await connection.commit();

    return {
      success: true,
      message: 'Webhook processed successfully',
      booking_id: booking.id,
      order_id: orderId,
      event_name: eventName,
      payment_status: newPaymentStatus,
      booking_status: newBookingStatus,
      txn_id: txnId,
      amount: amount
    };
  } catch (error) {
    await connection.rollback();
    console.error('Webhook processing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process webhook',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  } finally {
    connection.release();
  }
}

module.exports = {
  validateVPA,
  getBeneficiaryStatus,
  createPayoutOrder,
  createPaymentSession,
  createRegistrationFeeSession,
  getOrderStatus,
  handleWebhook,
  verifyWebhookSignature
};
