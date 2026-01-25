// Admin authentication utilities for frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const adminAuth = {
  // Check if admin is logged in
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    return !!(token && adminData);
  },

  // Get admin data from localStorage
  getAdminData() {
    if (typeof window === 'undefined') return null;
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
  },

  // Get admin token
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  },

  // Login admin
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminData', JSON.stringify(data.data.admin));
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  // Logout admin
  async logout() {
    try {
      await fetch(`${API_BASE_URL}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
    }
  },

  // Check session with server
  async checkSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/check-session`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Session check error:', error);
      return { success: false, authenticated: false };
    }
  },

  // Make authenticated API request
  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      credentials: 'include'
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);
      
      // If unauthorized, clear local storage and redirect to login
      if (response.status === 401) {
        this.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
        throw new Error('Authentication expired');
      }

      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }
};

export default adminAuth;