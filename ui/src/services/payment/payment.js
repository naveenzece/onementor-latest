const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001';

// Verify payment
export async function verifyPayment(orderId) {
  try {
    const res = await fetch(`${API_BASE}/api/payment/verify/${orderId}`, {
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
    const res = await fetch(`${API_BASE}/api/payment/booking/${bookingId}`, {
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

// Redirect to payment URL (handled by booking response)
export function redirectToPayment(paymentUrl) {
  if (paymentUrl) {
    window.location.href = paymentUrl;
  }
}

