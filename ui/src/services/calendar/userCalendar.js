const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001';

/**
 * Get Google Calendar OAuth authorization URL for users
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Response with authUrl
 */
export async function getCalendarAuthUrl(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/user/calendar/auth-url?user_id=${userId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to get authorization URL' };
    }
    return data;
  } catch (err) {
    console.error('getCalendarAuthUrl error', err);
    return { error: 'Network error' };
  }
}

/**
 * Get Google Calendar connection status for users
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Connection status
 */
export async function getCalendarStatus(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/user/calendar/status?user_id=${userId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to get calendar status' };
    }
    return data;
  } catch (err) {
    console.error('getCalendarStatus error', err);
    return { error: 'Network error' };
  }
}


/**
 * Disconnect Google Calendar for users
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Disconnect result
 */
export async function disconnectCalendar(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/user/calendar/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to disconnect calendar' };
    }
    return data;
  } catch (err) {
    console.error('disconnectCalendar error', err);
    return { error: 'Network error' };
  }
}

