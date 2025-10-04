// Authentication Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  // Login user
  async login(email, password, role) {
    try {
      let endpoint;
      switch (role) {
        case 'candidate':
          endpoint = API_ENDPOINTS.students.login;
          break;
        case 'recruiter':
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
        const user = response.admin || response.user || response.employer;
        user.role = role; // Add role to user object
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(user));
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
          endpoint = API_ENDPOINTS.students.register;
          break;
        case 'recruiter':
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
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
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
      throw error;
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  async resetPassword(token, newPassword, role, otp) {
    try {
      let endpoint;
      let payload = { token, password: newPassword };

      switch (role) {
        case 'candidate':
          endpoint = API_ENDPOINTS.students.resetPassword;
          break;
        case 'recruiter':
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
      throw error;
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
  }
};

export default authService;




