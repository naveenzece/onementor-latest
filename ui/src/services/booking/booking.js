import { API_URL } from "../apiendpoints";

// Book a slot
export async function bookSlot(bookingData) {
  try {
    const res = await fetch(`${API_URL}bookings`, {
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
      ? `${API_URL}bookings/user/${userId}?status=${status}`
      : `${API_URL}bookings/user/${userId}`;
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
      ? `${API_URL}bookings/mentor/${mentorId}?status=${status}`
      : `${API_URL}bookings/mentor/${mentorId}`;
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

// Get user upcoming sessions
export async function getUserUpcomingSessions(userId) {
  try {
    const res = await fetch(`${API_URL}user/sessions/upcoming/${userId}`, {
      method: 'GET',
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch upcoming sessions' };
    }
    return data;
  } catch (err) {
    console.error('getUserUpcomingSessions error', err);
    return { error: 'Network error' };
  }
}

// Get user session history
export async function getUserSessionHistory(userId) {
  try {
    const res = await fetch(`${API_URL}user/sessions/history/${userId}`, {
      method: 'GET',
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch session history' };
    }
    return data;
  } catch (err) {
    console.error('getUserSessionHistory error', err);
    return { error: 'Network error' };
  }
}

