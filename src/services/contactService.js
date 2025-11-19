import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const contactService = {
  // Submit contact form - using direct fetch to avoid apiClient baseURL issues
  async submitContact(contactData) {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const response = await fetch('https://api.bigsources.in/contact', {
        method: 'POST',
        headers,
        body: JSON.stringify(contactData)
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

  // Get all contacts (admin) - using /contact endpoint
  async getAllContacts() {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const response = await fetch('https://api.bigsources.in/contact', {
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
