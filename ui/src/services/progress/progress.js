import { API_URL } from "../apiendpoints";

/**
 * Add progress note for a booking
 * @param {Object} payload - { userId, bookingId, progressNotes }
 * @returns {Promise<Object>} Response
 */
export async function addProgress(payload) {
    try {
        const res = await fetch(`${API_URL}progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || 'Failed to add progress' };
        }
        return data;
    } catch (err) {
        console.error('addProgress error', err);
        return { error: 'Network error' };
    }
}

/**
 * Get progress for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response
 */
export async function getUserProgress(userId) {
    try {
        const res = await fetch(`${API_URL}progress?userId=${userId}`, {
            method: 'GET',
            credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
            return { error: data.error || 'Failed to fetch progress' };
        }
        return data;
    } catch (err) {
        console.error('getUserProgress error', err);
        return { error: 'Network error' };
    }
}
