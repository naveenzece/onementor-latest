import { API_URL } from "../apiendpoints";

// Verify payment
export async function verifyPayment(orderId) {
  try {
    const res = await fetch(`${API_URL}payment/verify/${orderId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to verify payment' };
    }
    return data;
  } catch (err) {
    console.error('verifyPayment error', err);
    return { error: 'Network error' };
  }
}

// Get payment by booking ID
export async function getPaymentByBooking(bookingId) {
  try {
    const res = await fetch(`${API_URL}payment/booking/${bookingId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch payment' };
    }
    return data;
  } catch (err) {
    console.error('getPaymentByBooking error', err);
    return { error: 'Network error' };
  }
}

// Create booking and payout order (Old: uses payout API)
export async function createBookingOld(bookingData) {
  try {
    const res = await fetch(`${API_URL}payment/payout`, {
      method: "POST",
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || `HTTP error! status: ${res.status}`, ...data };
    }
    return data;
  } catch (err) {
    console.error("createBooking error:", err);
    return { error: err.message || "Network error" };
  }
}

// Create booking session (New: bypasses payout API)
export async function createBooking(bookingData) {
  try {
    const res = await fetch(`${API_URL}payment/booking-session`, {
      method: "POST",
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || `HTTP error! status: ${res.status}`, ...data };
    }
    return data;
  } catch (err) {
    console.error("createBookingSession error:", err);
    return { error: err.message || "Network error" };
  }
}

// Create payment session
export async function createPaymentSession(bookingId) {
  try {
    const res = await fetch(`${API_URL}payment/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ booking_id: bookingId }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error, alreadyPaid: data.error === 'Booking is already paid', ...data };
    }
    return data;
  } catch (err) {
    console.error("Error creating payment session:", err);
    return { error: "Network error" };
  }
}

// Trigger Payment Webhook (Test Mode)
export async function triggerPaymentWebhook(payload) {
  try {
    const res = await fetch(`${API_URL}payment/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { success: res.ok && data.success, ...data, isOk: res.ok };
  } catch (err) {
    console.error("Payment test error:", err);
    return { error: "Network error", isOk: false };
  }
}

// Redirect to payment URL (handled by booking response)
export function redirectToPayment(paymentUrl) {
  if (paymentUrl) {
    window.location.href = paymentUrl;
  }
}


// Create registration payment session
export async function createRegistrationSession(userId) {
  try {
    const res = await fetch(`${API_URL}coach/registration-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to create registration session', ...data };
    }
    return data;
  } catch (err) {
    console.error("Error creating registration session:", err);
    return { error: "Network error" };
  }
}

// Get order status
export async function getOrderStatus(orderId) {
  try {
    const res = await fetch(`${API_URL}payment/status/${orderId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch order status', ...data };
    }
    return data;
  } catch (err) {
    console.error('getOrderStatus error', err);
    return { error: 'Network error' };
  }
}
