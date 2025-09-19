// Authentication Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  // Login user
  async login(email, password, role) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.login, {
        email,
        password,
        role
      });
      
      if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.register, userData);
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
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
        token,
        password: newPassword
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
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
