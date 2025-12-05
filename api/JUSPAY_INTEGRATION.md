# JUSPAY Payment Integration Guide

## Overview
The payment system has been integrated with JUSPAY payment gateway. This document provides details on how to configure and use JUSPAY.

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# JUSPAY Configuration
JUSPAY_MERCHANT_ID=your_merchant_id
JUSPAY_API_KEY=your_api_key
JUSPAY_BASE_URL=https://api.juspay.in
JUSPAY_RETURN_URL=http://localhost:3000/payment/callback
```

### Getting JUSPAY Credentials

1. Sign up at https://dashboard.juspay.in
2. Get your Merchant ID and API Key from the dashboard
3. Configure webhook URL in JUSPAY dashboard: `https://yourdomain.com/api/payment/webhook`

## API Endpoints

### Create Payment Order
- **Endpoint**: `POST /api/bookings`
- **Response**: Returns `payment_url` to redirect user for payment

### Verify Payment
- **Endpoint**: `GET /api/payment/verify/:order_id`
- **Purpose**: Verify payment status by order ID

### Payment Callback
- **Endpoint**: `GET /api/payment/callback`
- **Purpose**: Handle redirect after payment completion
- **Query Params**: `order_id`, `status`, `txn_id`

### Payment Webhook
- **Endpoint**: `POST /api/payment/webhook`
- **Purpose**: Receive payment status updates from JUSPAY
- **Note**: Configure this URL in JUSPAY dashboard

## Payment Flow

1. **User Books Slot**: Booking created with `payment_status: 'pending'`
2. **Create Payment Order**: JUSPAY order created, returns `payment_url`
3. **Redirect to Payment**: User redirected to JUSPAY payment page
4. **Payment Completion**: User completes payment on JUSPAY
5. **Callback/Webhook**: JUSPAY sends callback or webhook with payment status
6. **Update Booking**: Booking status updated to `confirmed` when payment is `paid`

## Payment Status Mapping

JUSPAY Status → Internal Status:
- `CHARGED` / `SUCCESS` → `completed`
- `FAILED` / `CANCELLED` → `failed`
- `REFUNDED` → `refunded`
- Others → `pending`

## Testing

### Test Mode
JUSPAY provides test credentials for development. Use test Merchant ID and API Key.

### Test Cards
JUSPAY provides test card numbers for testing:
- Success: Use test card numbers from JUSPAY dashboard
- Failure: Use specific test card numbers that trigger failures

## Security

- All API calls use Basic Authentication with Merchant ID and API Key
- HMAC signature verification for webhooks (recommended)
- HTTPS required for production

## Error Handling

The payment service handles:
- Network errors
- Invalid credentials
- Payment failures
- Webhook verification failures

## Support

For JUSPAY API documentation: https://docs.juspay.in
For support: Contact JUSPAY support through dashboard

