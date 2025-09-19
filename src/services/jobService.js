// Job Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const jobService = {
  // Get all jobs
  async getAllJobs(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getAll, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get job by ID
  async getJobById(jobId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getById(jobId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new job
  async createJob(jobData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.jobs.create, jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update job
  async updateJob(jobId, jobData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.jobs.update(jobId), jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete job
  async deleteJob(jobId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.jobs.delete(jobId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search jobs
  async searchJobs(searchParams) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.jobs.search, {
        params: searchParams
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get jobs by employer
  async getJobsByEmployer(employerId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getByEmployer(employerId), { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update job status
  async updateJobStatus(jobId, status) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.jobs.updateStatus(jobId), { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get job applications
  async getJobApplications(jobId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByJob(jobId), { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get featured jobs
  async getFeaturedJobs(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getAll, {
        params: { featured: true, ...params }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get recent jobs
  async getRecentJobs(limit = 10) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getAll, {
        params: { limit, sort: 'posted_date', order: 'desc' }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get jobs by location
  async getJobsByLocation(location, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getAll, {
        params: { location, ...params }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get jobs by skills
  async getJobsBySkills(skills, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getAll, {
        params: { skills: skills.join(','), ...params }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default jobService;
