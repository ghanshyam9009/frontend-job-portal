import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { withErrorHandling } from '../utils/errorHandler';

export const appliedJobService = {
  // Get all applied jobs for a user
  async getAppliedJobs(userId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.appliedJobs.getByUser(userId));
      return response;
    }, 'Failed to fetch applied jobs');
  },

  // Get applied jobs by job ID
  async getAppliedJobsByJob(jobId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.appliedJobs.getByJob(jobId));
      return response;
    }, 'Failed to fetch applied jobs for job');
  },

  // Create applied job record
  async createAppliedJob(appliedJobData) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.appliedJobs.create, appliedJobData);
      return response;
    }, 'Failed to create applied job record');
  },

  // Update applied job
  async updateAppliedJob(appliedJobId, appliedJobData) {
    return withErrorHandling(async () => {
      const response = await apiClient.put(API_ENDPOINTS.appliedJobs.update(appliedJobId), appliedJobData);
      return response;
    }, 'Failed to update applied job');
  },

  // Delete applied job
  async deleteAppliedJob(appliedJobId) {
    return withErrorHandling(async () => {
      const response = await apiClient.delete(API_ENDPOINTS.appliedJobs.delete(appliedJobId));
      return response;
    }, 'Failed to delete applied job');
  },

  // Get applied job statistics for user
  async getAppliedJobStats(userId) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.appliedJobs.getStats(userId));
      return response;
    }, 'Failed to fetch applied job statistics');
  },

  // Get all applied jobs (admin)
  async getAllAppliedJobs(params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.appliedJobs.getAll, { params });
      return response;
    }, 'Failed to fetch all applied jobs');
  }
};

export default appliedJobService;

