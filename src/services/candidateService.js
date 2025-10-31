// Candidate Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const candidateService = {
  // Get all candidates
  async getAllCandidates(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.candidates.getAll, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get candidate by ID
  async getCandidateById(candidateId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.candidates.getById(candidateId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update candidate profile
  async updateCandidate(candidateId, candidateData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.candidates.update(candidateId), candidateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Upload resume
  async uploadResume(candidateId, resumeFile) {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const response = await apiClient.post(API_ENDPOINTS.candidates.uploadResume(candidateId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get candidate skills
  async getCandidateSkills(candidateId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.candidates.getSkills(candidateId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update candidate skills
  async updateCandidateSkills(candidateId, skills) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.candidates.updateSkills(candidateId), {
        skills
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search candidates
  async searchCandidates(searchParams) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.candidates.getAll, {
        params: searchParams
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get candidate applications
  async getCandidateApplications(candidateId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.applications.getByCandidate(candidateId), {
        params
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get candidate saved jobs
  async getCandidateSavedJobs(candidateId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.savedJobs.getByUser(candidateId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark job as premium
  async markJobPremium(jobData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.premium.markJobPremium, jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mark student as premium
  async markStudentPremium(studentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.premium.markStudentPremium, studentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get premium prices
  async getPremiumPrices() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.premium.getPremiumPrices);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user premium status
  async getUserPremiumStatus(email) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.students.getProfile(email));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update premium prices (admin only)
  async updatePremiumPrices(priceData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.premium.updatePremiumPrices, priceData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default candidateService;
