// Saved Job Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const savedJobService = {
  // Get all saved jobs
  async getAllSavedJobs(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.savedJobs.getAll, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get saved jobs by candidate
  async getSavedJobsByCandidate(candidateId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.savedJobs.getByCandidate(candidateId), { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Save job
  async saveJob(jobId, candidateId) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.savedJobs.save, {
        job_id: jobId,
        candidate_id: candidateId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Unsave job
  async unsaveJob(jobId, candidateId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.savedJobs.unsave(jobId, candidateId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check if job is saved
  async isJobSaved(jobId, candidateId) {
    try {
      const response = await apiClient.get(`/saved-jobs/check/${jobId}/${candidateId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Toggle save/unsave job
  async toggleSaveJob(jobId, candidateId) {
    try {
      // First check if job is already saved
      const isSaved = await this.isJobSaved(jobId, candidateId);
      
      if (isSaved.data.isSaved) {
        // If saved, unsave it
        return await this.unsaveJob(jobId, candidateId);
      } else {
        // If not saved, save it
        return await this.saveJob(jobId, candidateId);
      }
    } catch (error) {
      throw error;
    }
  },

  // Get saved jobs count for candidate
  async getSavedJobsCount(candidateId) {
    try {
      const response = await apiClient.get(`/saved-jobs/count/${candidateId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default savedJobService;



