import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { withErrorHandling } from '../utils/errorHandler';
import { isAdminPostedJob } from '../utils/jobApplicationRules';

export const applicationService = {
  /**
   * Apply for a job. Route depends on who posted the job:
   * - ADMIN → POST /application/Adminjobs/:job_id/apply
   * - RECRUITER (etc.) → POST /application/jobs/:job_id/apply
   */
  async applyForJob(jobId, applicationData, options = {}) {
    return withErrorHandling(async () => {
      const postedBy = options.postedBy ?? options.posted_by;
      const useAdminRoute =
        options.useAdminRoute !== undefined
          ? options.useAdminRoute
          : isAdminPostedJob({ posted_by: postedBy });

      const endpoint = useAdminRoute
        ? API_ENDPOINTS.applications.applyAdminJob(jobId)
        : API_ENDPOINTS.applications.applyRecruiterJob(jobId);

      const response = await apiClient.post(endpoint, applicationData);
      return response;
    }, 'Failed to submit application');
  },

  async getUserApplications(userId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByStudent(userId));
      return response;
    }, 'Failed to fetch applications');
  },

  async getApplicationById(applicationId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getById(applicationId));
      return response;
    }, 'Failed to fetch application');
  },

  async updateApplication(applicationId, applicationData) {
    return withErrorHandling(async () => {
      const response = await apiClient.put(
        API_ENDPOINTS.applications.update(applicationId),
        applicationData
      );
      return response;
    }, 'Failed to update application');
  },

  async getApplicationStatus(applicationId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getById(applicationId));
      return {
        status: response.status,
        message: response.status_message || 'Your application is under review',
        updated_at: response.updated_at,
      };
    }, 'Failed to fetch application status');
  },

  async withdrawApplication(applicationId) {
    return withErrorHandling(async () => {
      const response = await apiClient.delete(API_ENDPOINTS.applications.withdraw(applicationId));
      return response;
    }, 'Failed to withdraw application');
  },

  async getApplicationsByJob(jobId, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByJob(jobId), { params });
      return response;
    }, 'Failed to fetch job applications');
  },

  async getApplicationsByEmployer(employerId, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(
        API_ENDPOINTS.applications.getByEmployer(employerId),
        { params }
      );
      return response;
    }, 'Failed to fetch employer applications');
  },

  async updateApplicationStatus(applicationId, status, notes = '') {
    return withErrorHandling(async () => {
      const response = await apiClient.put(API_ENDPOINTS.applications.updateStatus(applicationId), {
        status,
        notes,
      });
      return response;
    }, 'Failed to update application status');
  },

  async getAllApplications(params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getAll, { params });
      return response;
    }, 'Failed to fetch applications');
  },
};
