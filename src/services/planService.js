// Plan Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const planService = {
  // Get all plans
  async getAllPlans(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.plans.getAll, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get plan by ID
  async getPlanById(planId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.plans.getById(planId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create plan (Admin only)
  async createPlan(planData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.plans.create, planData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update plan (Admin only)
  async updatePlan(planId, planData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.plans.update(planId), planData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete plan (Admin only)
  async deletePlan(planId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.plans.delete(planId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get active plans
  async getActivePlans() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.plans.getAll, {
        params: { status: 'Active' }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get plans by user type
  async getPlansByUserType(userType) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.plans.getAll, {
        params: { user_type: userType, status: 'Active' }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Subscribe to plan
  async subscribeToPlan(planId, paymentData) {
    try {
      const response = await apiClient.post(`/plans/${planId}/subscribe`, paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user's current subscription
  async getUserSubscription(userId) {
    try {
      const response = await apiClient.get(`/plans/user/${userId}/subscription`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(userId, subscriptionId) {
    try {
      const response = await apiClient.post(`/plans/user/${userId}/cancel`, {
        subscription_id: subscriptionId
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default planService;



