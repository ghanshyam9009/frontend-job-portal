// Statistics Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const statsService = {
  // Get dashboard statistics
  async getDashboardStats(userId, userRole) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.stats.dashboard, {
        params: { user_id: userId, user_role: userRole }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get job statistics
  async getJobStats(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.stats.jobs, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get candidate statistics
  async getCandidateStats(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.stats.candidates, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get employer statistics
  async getEmployerStats(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.stats.employers, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get application statistics
  async getApplicationStats(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.stats.applications, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get admin dashboard statistics
  async getAdminDashboardStats() {
    try {
      const response = await apiClient.get('/stats/admin/dashboard');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get recruiter dashboard statistics
  async getRecruiterDashboardStats(employerId) {
    try {
      const response = await apiClient.get('/stats/recruiter/dashboard', {
        params: { employer_id: employerId }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get candidate dashboard statistics
  async getCandidateDashboardStats(candidateId) {
    try {
      const response = await apiClient.get('/stats/candidate/dashboard', {
        params: { candidate_id: candidateId }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get monthly statistics
  async getMonthlyStats(year, month, params = {}) {
    try {
      const response = await apiClient.get('/stats/monthly', {
        params: { year, month, ...params }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get yearly statistics
  async getYearlyStats(year, params = {}) {
    try {
      const response = await apiClient.get('/stats/yearly', {
        params: { year, ...params }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get top skills statistics
  async getTopSkillsStats(limit = 10) {
    try {
      const response = await apiClient.get('/stats/top-skills', {
        params: { limit }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get location statistics
  async getLocationStats(params = {}) {
    try {
      const response = await apiClient.get('/stats/locations', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get salary range statistics
  async getSalaryStats(params = {}) {
    try {
      const response = await apiClient.get('/stats/salary-ranges', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default statsService;
