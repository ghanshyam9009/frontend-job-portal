import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const recruiterService = {
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.recruiters.register, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.recruiters.login, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.recruiters.resetPassword, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getProfile(email) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.recruiters.getProfile(email));
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(email, profileData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.recruiters.getProfile(email), profileData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};
