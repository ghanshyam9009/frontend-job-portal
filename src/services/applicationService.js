// Application Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const applicationService = {
  // Get all applications
  async getAllApplications(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.applications.getAll, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get application by ID
  async getApplicationById(applicationId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.applications.getById(applicationId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new application
  async createApplication(applicationData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.applications.create, applicationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update application
  async updateApplication(applicationId, applicationData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.applications.update(applicationId), applicationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get applications by job
  async getApplicationsByJob(jobId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByJob(jobId), { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get applications by candidate
  async getApplicationsByCandidate(candidateId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByCandidate(candidateId), { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update application status
  async updateApplicationStatus(applicationId, status, remarks = '') {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.applications.updateStatus(applicationId), {
        status,
        remarks
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Shortlist candidate
  async shortlistCandidate(applicationId, remarks = '') {
    try {
      const response = await this.updateApplicationStatus(applicationId, 'Shortlisted', remarks);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reject candidate
  async rejectCandidate(applicationId, remarks = '') {
    try {
      const response = await this.updateApplicationStatus(applicationId, 'Rejected', remarks);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Hire candidate
  async hireCandidate(applicationId, remarks = '') {
    try {
      const response = await this.updateApplicationStatus(applicationId, 'Hired', remarks);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get application statistics
  async getApplicationStats(params = {}) {
    try {
      const response = await apiClient.get('/applications/stats', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check if candidate already applied
  async checkExistingApplication(jobId, candidateId) {
    try {
      const response = await apiClient.get(`/applications/check/${jobId}/${candidateId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default applicationService;
