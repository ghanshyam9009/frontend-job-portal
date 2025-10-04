// Employer Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const employerService = {
  // Get all employers
  async getAllEmployers(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.employers.getAll, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get employer by ID
  async getEmployerById(employerId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.employers.getById(employerId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update employer profile
  async updateEmployer(employerId, employerData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.employers.update(employerId), employerData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get employer's jobs
  async getEmployerJobs(employerId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.employers.getJobs(employerId), { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get employer's job applications
  async getEmployerApplications(employerId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.employers.getApplications(employerId), { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search employers
  async searchEmployers(searchParams) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.employers.getAll, {
        params: searchParams
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get employer statistics
  async getEmployerStats(employerId) {
    try {
      const response = await apiClient.get(`/employers/${employerId}/stats`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload company logo
  async uploadCompanyLogo(employerId, logoFile) {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await apiClient.post(`/employers/${employerId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default employerService;




