import adminApiClient from './adminApiClient';
import { API_ENDPOINTS } from '../config/api';
import { adminExternalService } from './adminExternalService';

export const adminService = {
  async register(userData) {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.admin.register, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.admin.login, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email, password) {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.admin.resetPassword, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getProfile(email) {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.admin.getProfile(email));
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(email, profileData) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.admin.getProfile(email), profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Job Management Functions
  async getPendingJobs() {
    try {
      // Using the external service to get all tasks
      return await adminExternalService.getAllTasks();
    } catch (error) {
      throw error;
    }
  },

  async approveJob(jobId) {
    try {
      // Using the external service for job posting approval
      return await adminExternalService.approveJobPosting(jobId);
    } catch (error) {
      throw error;
    }
  },

  async rejectJob(jobId) {
    try {
      // TODO: Replace with a real API endpoint for rejecting jobs
      console.warn(`Mock rejectJob called for jobId: ${jobId}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Job rejected successfully (mock)' };
    } catch (error) {
      throw error;
    }
  },

  // Candidate Management Functions
  async getCandidates() {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.candidates.getAll);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Employer Management Functions
  async getEmployers() {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.employers.getAll);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Government Jobs Management Functions
  async createGovernmentJob(jobData) {
    try {
      const response = await adminApiClient.post('/job/Govtjobs', jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateGovernmentJob(jobId, jobData) {
    try {
      const response = await adminApiClient.put(`/job/updateGovtjobs/${jobId}`, jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getGovernmentJobs() {
    try {
      // TODO: Replace with a real API endpoint for getting government jobs
      console.warn('Mock getGovernmentJobs called');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [];
    } catch (error) {
      throw error;
    }
  },

  // Application Management Functions
  async getJobApplications() {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.applications.getAll);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async approveApplication(applicationId) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.applications.updateStatus(applicationId), { status: 'approved' });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async rejectApplication(applicationId) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.applications.updateStatus(applicationId), { status: 'rejected' });
      return response;
    } catch (error) {
      throw error;
    }
  }
};
