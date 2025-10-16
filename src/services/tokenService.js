// Token Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const tokenService = {
  // Get tokens by user
  async getUserTokens(userId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.tokens.getByUser(userId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Purchase tokens
  async purchaseTokens(tokenData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.tokens.purchase, tokenData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Use token
  async useToken(tokenData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.tokens.useToken, tokenData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get token balance
  async getTokenBalance(userId) {
    try {
      const response = await apiClient.get(`/tokens/balance/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get token usage history
  async getTokenUsageHistory(userId, params = {}) {
    try {
      const response = await apiClient.get(`/tokens/usage/${userId}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get token purchase history
  async getTokenPurchaseHistory(userId, params = {}) {
    try {
      const response = await apiClient.get(`/tokens/purchases/${userId}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Use token for job posting
  async useTokenForJobPosting(userId, jobId) {
    try {
      const response = await this.useToken({
        user_id: userId,
        token_type: 'job_posting',
        count: 1,
        job_id: jobId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Use token for advanced search
  async useTokenForAdvancedSearch(userId, searchId) {
    try {
      const response = await this.useToken({
        user_id: userId,
        token_type: 'advanced_search',
        count: 1,
        search_id: searchId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Use token for analytics
  async useTokenForAnalytics(userId, analyticsId) {
    try {
      const response = await this.useToken({
        user_id: userId,
        token_type: 'analytics',
        count: 1,
        analytics_id: analyticsId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Use token for featured job
  async useTokenForFeaturedJob(userId, jobId) {
    try {
      const response = await this.useToken({
        user_id: userId,
        token_type: 'featured_job',
        count: 1,
        job_id: jobId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check if user has enough tokens
  async checkTokenAvailability(userId, tokenType, count = 1) {
    try {
      const response = await apiClient.get(`/tokens/check/${userId}`, {
        params: { token_type: tokenType, count }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default tokenService;
