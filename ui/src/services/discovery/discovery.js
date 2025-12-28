import { API_URL } from "../apiendpoints";

// Discover mentors with filters
export async function discoverMentors(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      // Only add non-empty values to query params
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = `${API_URL}mentors${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch mentors' };
    }
    return data;
  } catch (err) {
    console.error('discoverMentors error', err);
    return { error: 'Network error' };
  }
}

