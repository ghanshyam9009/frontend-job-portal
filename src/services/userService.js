// User Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const userService = {
  // Get all users (Admin only)
  async getAllUsers(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.users.getAll, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.users.getById(userId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.users.update(userId), userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.users.delete(userId));
      return response;
    } catch (error) {
      throw error;
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
      throw error;
    }
  },

  // Update user status (Admin only)
  async updateUserStatus(userId, status) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.users.updateStatus(userId), {
        status
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get users by role
  async getUsersByRole(role, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.users.getAll, {
        params: { role, ...params }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search users
  async searchUsers(query, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.users.getAll, {
        params: { search: query, ...params }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;
