// Job Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { withErrorHandling } from '../utils/errorHandler';

export const jobService = {
  // Get all jobs
  async getAllJobs(params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getAll, { params });
      return response;
    }, 'Failed to fetch jobs');
  },

  // Get job by ID (Recruiter jobs API — /jobs/:id is not available on backend)
  async getJobById(jobId) {
    return withErrorHandling(async () => {
      if (jobId == null || jobId === "") {
        throw new Error('Job ID is required');
      }

      const idNorm = String(jobId).trim();
      const response = await apiClient.get('/Recruiter/jobs', {
        params: { job_id: idNorm },
      });

      const jobs = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.jobs)
          ? response.jobs
          : [];

      const match = jobs.find((job) => {
        const jid = job.job_id ?? job.id;
        if (jid == null) return false;
        return String(jid) === idNorm;
      });

      if (match) return match;
      if (jobs.length === 1) return jobs[0];

      throw new Error(`Job not found: ${idNorm}`);
    }, 'Failed to fetch job');
  },

  // Create new job
  async createJob(jobData) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.jobs.create, jobData);
      return response;
    }, 'Failed to create job');
  },

  // Update job
  async updateJob(jobId, jobData) {
    return withErrorHandling(async () => {
      const response = await apiClient.put(API_ENDPOINTS.jobs.update(jobId), jobData);
      return response;
    }, 'Failed to update job');
  },

  // Delete job
  async deleteJob(jobId) {
    return withErrorHandling(async () => {
      const response = await apiClient.delete(API_ENDPOINTS.jobs.delete(jobId));
      return response;
    }, 'Failed to delete job');
  },

  // Search jobs
  async searchJobs(searchParams) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.jobs.search, {
        params: searchParams
      });
      return response;
    }, 'Job search failed');
  },

  // Get jobs by employer
  async getJobsByEmployer(employerId, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getByEmployer(employerId), { params });
      return response;
    }, 'Failed to fetch employer jobs');
  },

  // Update job status
  async updateJobStatus(jobId, status) {
    return withErrorHandling(async () => {
      const response = await apiClient.patch(API_ENDPOINTS.jobs.updateStatus(jobId), { status });
      return response;
    }, 'Failed to update job status');
  },

  // Get job applications
  async getJobApplications(jobId, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByJob(jobId), { params });
      return response;
    }, 'Failed to fetch job applications');
  },

  // Get featured jobs
  async getFeaturedJobs(params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getFeatured, { params });
      return response;
    }, 'Failed to fetch featured jobs');
  },

  // Get recent jobs
  async getRecentJobs(limit = 10) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getRecent, {
        params: { limit }
      });
      return response;
    }, 'Failed to fetch recent jobs');
  },

  // Get jobs by location
  async getJobsByLocation(location, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getByLocation(location), { params });
      return response;
    }, 'Failed to fetch jobs by location');
  },

  // Get jobs by skills
  async getJobsBySkills(skills, params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getBySkills, {
        params: { skills: skills.join(','), ...params }
      });
      return response;
    }, 'Failed to fetch jobs by skills');
  },

  // Government Jobs
  async getGovernmentJobs(params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getGovernmentJobs, { params });
      return response;
    }, 'Failed to fetch government jobs');
  },

  async createGovernmentJob(jobData) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.jobs.createGovernmentJob, jobData);
      return response;
    }, 'Failed to create government job');
  },

  async updateGovernmentJob(jobId, jobData) {
    return withErrorHandling(async () => {
      const response = await apiClient.put(API_ENDPOINTS.jobs.updateGovernmentJob(jobId), jobData);
      return response;
    }, 'Failed to update government job');
  },

  // Upload job logo
  async uploadJobLogo(jobId, logoFile) {
    return withErrorHandling(async () => {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await apiClient.put(`job/jobs/${jobId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    }, 'Failed to upload job logo');
  }
};

export default jobService;
