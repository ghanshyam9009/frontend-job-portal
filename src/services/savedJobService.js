import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { withErrorHandling } from '../utils/errorHandler';

export const savedJobService = {
  // Get all saved jobs for a user
  async getSavedJobs(userId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.savedJobs.getByUser(userId));
      return response;
    }, 'Failed to fetch saved jobs');
  },

  // Save a job
  async saveJob(jobId, userId) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.savedJobs.save, {
        job_id: jobId,
        user_id: userId
      });
      return response;
    }, 'Failed to save job');
  },

  // Unsave a job
  async unsaveJob(jobId, userId) {
    return withErrorHandling(async () => {
      const response = await apiClient.delete(API_ENDPOINTS.savedJobs.unsave(jobId, userId));
      return response;
    }, 'Failed to unsave job');
  },

  // Check if job is saved
  async isJobSaved(jobId, userId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.savedJobs.checkSaved(jobId, userId));
      return response.isSaved || false;
    }, 'Failed to check saved status');
  },

  // Toggle save status
  async toggleSaveJob(jobId, userId, isCurrentlySaved) {
    if (isCurrentlySaved) {
      return await this.unsaveJob(jobId, userId);
    } else {
      return await this.saveJob(jobId, userId);
    }
  },

  // Get all saved jobs (admin)
  async getAllSavedJobs(params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.savedJobs.getAll, { params });
      return response;
    }, 'Failed to fetch all saved jobs');
  }
};

export default savedJobService;