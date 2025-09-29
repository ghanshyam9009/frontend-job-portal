import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const demoService = {
  async requestDemo(demoData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.requestDemo, demoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
