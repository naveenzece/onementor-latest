const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001';

// Discover mentors with filters
export async function discoverMentors(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `${API_BASE}/api/mentors${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
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

