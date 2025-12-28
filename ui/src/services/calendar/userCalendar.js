import { API_URL } from "../apiendpoints";

/**
 * Get Google Calendar OAuth authorization URL for users
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Response with authUrl
 */
export async function getCalendarAuthUrl(userId, opts = {}) {
  try {
    const params = new URLSearchParams({ user_id: userId });
    if (opts.returnTo) params.set('return_to', opts.returnTo);
    if (opts.coachId) params.set('coachId', opts.coachId);
    if (opts.selectedDate) params.set('selectedDate', opts.selectedDate);
    if (opts.selectedSlotId) params.set('selectedSlotId', opts.selectedSlotId);
    if (opts.sessionType) params.set('sessionType', opts.sessionType);

    const res = await fetch(`${API_URL}user/calendar/auth-url?${params.toString()}`, {
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
    const res = await fetch(`${API_URL}user/calendar/status?user_id=${userId}`, {
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
    const res = await fetch(`${API_URL}user/calendar/disconnect`, {
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

