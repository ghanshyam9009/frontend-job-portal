import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const studentService = {
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.students.register, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.students.login, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.students.resetPassword, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getProfile(email) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.students.getProfile(email));
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(email, profileData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.students.getProfile(email), profileData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};
