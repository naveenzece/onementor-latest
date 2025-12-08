const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001';

// Book a slot
export async function bookSlot(bookingData) {
  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(bookingData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to book slot' };
    }
    return data;
  } catch (err) {
    console.error('bookSlot error', err);
    return { error: 'Network error' };
  }
}

// Get user bookings
export async function getUserBookings(userId, status = null) {
  try {
    const url = status 
      ? `${API_BASE}/api/bookings/user/${userId}?status=${status}`
      : `${API_BASE}/api/bookings/user/${userId}`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch bookings' };
    }
    return data;
  } catch (err) {
    console.error('getUserBookings error', err);
    return { error: 'Network error' };
  }
}

// Get mentor bookings
export async function getMentorBookings(mentorId, status = null) {
  try {
    const url = status 
      ? `${API_BASE}/api/bookings/mentor/${mentorId}?status=${status}`
      : `${API_BASE}/api/bookings/mentor/${mentorId}`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch bookings' };
    }
    return data;
  } catch (err) {
    console.error('getMentorBookings error', err);
    return { error: 'Network error' };
  }
}

