import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const demoService = {
  // Request demo/form submission - using direct fetch to /query
  async requestDemo(demoData) {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const response = await fetch('https://api.bigsources.in/query', {
        method: 'POST',
        headers,
        body: JSON.stringify(demoData)
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      throw error;
    }
  },

  // Get all demo requests (admin) - using /query endpoint
  async getAllDemoRequests() {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const response = await fetch('https://api.bigsources.in/query', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      throw error;
    }
  }
};

export default demoService;