import { API_URL } from "../apiendpoints";

// Signup user (creates account with password)
export async function createUser(userData) {
  try {
    const res = await fetch(`${API_URL}users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Signup failed' };
    }
    return data;
  } catch (err) {
    console.error('createUser error', err);
    return { error: 'Network error' };
  }
}

// Get user profile
export async function getUserProfile(userId) {
  try {
    const res = await fetch(`${API_URL}profile/${userId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to fetch profile' };
    }
    return data;
  } catch (err) {
    console.error('getUserProfile error', err);
    return { error: 'Network error' };
  }
}

// Create/Update user profile
export async function saveUserProfile(formData) {
  try {
    const res = await fetch(`${API_URL}profile`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // FormData with file
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to save profile' };
    }
    return data;
  } catch (err) {
    console.error('saveUserProfile error', err);
    return { error: 'Network error' };
  }
}
