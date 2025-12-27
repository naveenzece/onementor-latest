const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001';

// Login with email and password
export async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        error: data.error || 'Login failed',
        requiresVerification: data.requiresVerification || false,
        email: data.email,
        role: data.role
      };
    }
    return data;
  } catch (err) {
    console.error('login error', err);
    return { error: 'Network error' };
  }
}

// Send OTP for email verification
export async function sendOTP(email) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Failed to send OTP' };
    }
    return data;
  } catch (err) {
    console.error('sendOTP error', err);
    return { error: 'Network error' };
  }
}

// Verify OTP
export async function verifyOTP(email, otp) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Invalid OTP' };
    }
    return data;
  } catch (err) {
    console.error('verifyOTP error', err);
    return { error: 'Network error' };
  }
}

// Logout
export async function logout() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('logout error', err);
    return { error: 'Network error' };
  }
}

// Check session
export async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/check-session`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('checkSession error', err);
    return { authenticated: false };
  }
}

// Initiate Google Login
export async function initiateGoogleLogin(role = 'user', intent = 'signup') {
  try {
    const res = await fetch(`${API_BASE}/api/auth/google/url?role=${role}&intent=${intent}`, {
      method: 'GET',
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      return { error: 'Failed to get Google Auth URL' };
    }
  } catch (err) {
    console.error('initiateGoogleLogin error', err);
    return { error: 'Network error' };
  }
}
