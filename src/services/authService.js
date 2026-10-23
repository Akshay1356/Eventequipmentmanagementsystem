/**
 * AURA Event Gear — Authentication Service
 * Communicates with backend /api/auth or falls back to demo mode.
 */

import { apiRequest, USE_MOCK_DATA } from './apiClient';

const TOKEN_KEY = 'aura_auth_token';
const USER_KEY = 'aura_auth_user';

export const authService = {
  getStoredToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setStoredToken(token, persist = true) {
    try {
      if (persist) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
      }
    } catch (err) {
      console.warn('Storage unavailable for token', err);
    }
  },

  clearStoredToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (err) {
      console.warn('Storage unavailable', err);
    }
  },

  async login(email, password) {
    if (USE_MOCK_DATA) {
      return null; // Signals caller to use local credentials
    }

    try {
      const response = await apiRequest('auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (response && response.data && response.data.token) {
        this.setStoredToken(response.data.token);
        return response.data;
      }
      return null;
    } catch (err) {
      console.warn('Live login endpoint error:', err.message);
      throw err;
    }
  },

  async register(userData) {
    if (USE_MOCK_DATA) {
      return null;
    }

    const response = await apiRequest('auth/register', {
      method: 'POST',
      body: userData,
    });

    if (response && response.data && response.data.token) {
      this.setStoredToken(response.data.token);
      return response.data;
    }
    return null;
  },

  async getProfile() {
    if (USE_MOCK_DATA) {
      return null;
    }

    const response = await apiRequest('auth/me');
    return response.data || response;
  },
};

export default authService;
