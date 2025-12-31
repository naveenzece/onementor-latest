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

// Create/Update user profile (alias for compatibility)
export async function createUserProfile(formData) {
  return saveUserProfile(formData);
}

// Get user basic info (phone number) - using a working endpoint
export async function getUserBasicInfo(userId) {
  try {
    // Since user endpoints don't exist, let's try to get user info from profile endpoint
    // or create a new endpoint specifically for basic user info
    const res = await fetch(`${API_URL}users/basic/${userId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      // If that doesn't work, try the profile endpoint which might have user info
      return getUserProfile(userId);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('getUserBasicInfo error', err);
    // Fallback to profile endpoint
    return getUserProfile(userId);
  }
}

// Update user basic info (name, email, phone) in the users table
export async function updateUserBasicInfo(userId, userData) {
  try {
    const res = await fetch(`${API_URL}users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to update user info' };
    }
    return data;
  } catch (err) {
    console.error('updateUserBasicInfo error', err);
    return { error: 'Network error' };
  }
}

// Get user data from database (alternative approach using existing endpoints)
export async function getUserFromDatabase(userId) {
  try {
    // First try to get from profile endpoint
    const profileResponse = await getUserProfile(userId);
    
    if (profileResponse && !profileResponse.error) {
      // If profile has user data, return it
      if (profileResponse.name || profileResponse.email || profileResponse.phone) {
        return {
          name: profileResponse.name,
          email: profileResponse.email,
          phone: profileResponse.phone,
          skills: profileResponse.skills,
          interests: profileResponse.interests
        };
      }
    }
    
    // If profile doesn't have user data, we need to create a backend endpoint
    // For now, return what we have from localStorage as fallback
    return { error: 'User data not available from database' };
  } catch (err) {
    console.error('getUserFromDatabase error', err);
    return { error: 'Network error' };
  }
}
