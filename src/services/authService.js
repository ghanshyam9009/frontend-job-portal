// Authentication Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { handleApiError, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/errorHandler';

export const authService = {
  // Login user
  async login(email, password, role) {
    try {
      let endpoint;
      switch (role) {
        case 'candidate':
        case 'student':
          endpoint = API_ENDPOINTS.students.login;
          break;
        case 'recruiter':
        case 'employer':
          endpoint = API_ENDPOINTS.recruiters.login;
          break;
        case 'admin':
          endpoint = API_ENDPOINTS.admin.login;
          break;
        default:
          throw new Error('Invalid user role for login.');
      }

      const response = await apiClient.post(endpoint, { email, password });

      if (response.token) {
        const user = response.admin || response.user || response.employer || response.student;
        user.role = role; // Add role to user object

        // Store login timestamp for 24-hour auto logout
        const loginTimestamp = Date.now();
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('loginTimestamp', loginTimestamp.toString());

        return { success: true, data: { ...response, user: user } };
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  },

  // Register user
  async register(userData) {
    try {
      let endpoint;
      switch (userData.role) {
        case 'candidate':
        case 'student':
          endpoint = API_ENDPOINTS.students.register;
          break;
        case 'recruiter':
        case 'employer':
          endpoint = API_ENDPOINTS.recruiters.register;
          break;
        case 'admin':
          endpoint = API_ENDPOINTS.admin.register;
          break;
        default:
          throw new Error('Invalid user role for registration.');
      }
      const response = await apiClient.post(endpoint, userData);
      return response;
    } catch (error) {
      throw handleApiError(error, ERROR_MESSAGES.REGISTRATION_FAILED);
    }
  },

  // Logout user
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
      this.clearAuthData();
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local storage
      this.clearAuthData();
      return { success: true };
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.refresh);
      if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        return response;
      }
      throw new Error('Token refresh failed');
    } catch (error) {
      throw handleApiError(error, 'Token refresh failed');
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email });
      return response;
    } catch (error) {
      throw handleApiError(error, 'Failed to send password reset email');
    }
  },

  // Reset password
  async resetPassword(token, newPassword, role, otp) {
    try {
      let endpoint;
      let payload = { token, password: newPassword };

      switch (role) {
        case 'candidate':
        case 'student':
          endpoint = API_ENDPOINTS.students.resetPassword;
          break;
        case 'recruiter':
        case 'employer':
          endpoint = API_ENDPOINTS.recruiters.resetPassword;
          break;
        case 'admin':
          endpoint = API_ENDPOINTS.admin.resetPassword;
          payload.otp = otp;
          break;
        default:
          throw new Error('Invalid user role for password reset.');
      }

      const response = await apiClient.post(endpoint, payload);
      return response;
    } catch (error) {
      throw handleApiError(error, ERROR_MESSAGES.PASSWORD_RESET_FAILED);
    }
  },

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.users.changePassword(userId), {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      throw handleApiError(error, 'Failed to change password');
    }
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Get login timestamp
  getLoginTimestamp() {
    return localStorage.getItem('loginTimestamp');
  },

  // Check if session has expired (24 hours)
  isSessionExpired() {
    const loginTimestamp = this.getLoginTimestamp();
    if (!loginTimestamp) return true; // No timestamp means expired

    const currentTime = Date.now();
    const sessionDuration = currentTime - parseInt(loginTimestamp);
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    return sessionDuration >= twentyFourHours;
  },

  // Clear all auth data
  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTimestamp');
  },

  // Check authentication with session expiry
  checkAuthWithExpiry() {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.isSessionExpired()) {
      this.clearAuthData();
      return false;
    }

    return true;
  },

  // Get remaining session time in milliseconds
  getRemainingSessionTime() {
    const loginTimestamp = this.getLoginTimestamp();
    if (!loginTimestamp) return 0;

    const currentTime = Date.now();
    const sessionDuration = currentTime - parseInt(loginTimestamp);
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    return Math.max(0, twentyFourHours - sessionDuration);
  },

  // Get formatted remaining session time
  getFormattedRemainingTime() {
    const remainingMs = this.getRemainingSessionTime();
    if (remainingMs === 0) return 'Session expired';

    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }
};

export default authService;
