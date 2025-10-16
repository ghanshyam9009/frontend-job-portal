import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { withErrorHandling } from '../utils/errorHandler';

export const applicationService = {
  // Apply for a job
  async applyForJob(jobId, applicationData) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.applications.applyToJob(jobId), applicationData);
      return response;
    }, 'Failed to submit application');
  },

  // Get user's applications
  async getUserApplications(userId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByStudent(userId));
      return response;
    }, 'Failed to fetch applications');
  },

  // Get application by ID
  async getApplicationById(applicationId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getById(applicationId));
      return response;
    }, 'Failed to fetch application');
  },

  // Update application
  async updateApplication(applicationId, applicationData) {
    return withErrorHandling(async () => {
      const response = await apiClient.put(API_ENDPOINTS.applications.update(applicationId), applicationData);
      return response;
    }, 'Failed to update application');
  },

  // Get application status
  async getApplicationStatus(applicationId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getById(applicationId));
      return {
        status: response.status,
        message: response.status_message || 'Your application is under review',
        updated_at: response.updated_at
      };
    }, 'Failed to fetch application status');
  },

  // Withdraw application
  async withdrawApplication(applicationId) {
    return withErrorHandling(async () => {
      const response = await apiClient.delete(API_ENDPOINTS.applications.withdraw(applicationId));
      return response;
    }, 'Failed to withdraw application');
  },

  // Get applications by job
  async getApplicationsByJob(jobId, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByJob(jobId), { params });
      return response;
    }, 'Failed to fetch job applications');
  },

  // Get applications by employer
  async getApplicationsByEmployer(employerId, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByEmployer(employerId), { params });
      return response;
    }, 'Failed to fetch employer applications');
  },

  // Update application status (for employers)
  async updateApplicationStatus(applicationId, status, notes = '') {
    return withErrorHandling(async () => {
      const response = await apiClient.put(API_ENDPOINTS.applications.updateStatus(applicationId), {
        status,
        notes
      });
      return response;
    }, 'Failed to update application status');
  },

  // Get all applications (admin)
  async getAllApplications(params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getAll, { params });
      return response;
    }, 'Failed to fetch applications');
  }
};
