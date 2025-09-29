// Payment Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const paymentService = {
  // Create payment
  async createPayment(paymentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.payments.create, paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get payments by user
  async getPaymentsByUser(userId, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.payments.getByUser(userId), { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.payments.getById(paymentId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify payment
  async verifyPayment(paymentId, verificationData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.payments.verify(paymentId), verificationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create subscription payment
  async createSubscriptionPayment(userId, planId, paymentMethod) {
    try {
      const response = await this.createPayment({
        user_id: userId,
        payment_type: 'subscription',
        amount: 0, // Will be set based on plan
        plan_id: planId,
        payment_method: paymentMethod,
        status: 'pending'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create token purchase payment
  async createTokenPurchasePayment(userId, tokenPack, paymentMethod) {
    try {
      const response = await this.createPayment({
        user_id: userId,
        payment_type: 'token_purchase',
        amount: tokenPack.price,
        token_pack_id: tokenPack.id,
        payment_method: paymentMethod,
        status: 'pending'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Process Razorpay payment
  async processRazorpayPayment(paymentId, razorpayData) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/razorpay`, razorpayData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Process Stripe payment
  async processStripePayment(paymentId, stripeData) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/stripe`, stripeData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get payment statistics
  async getPaymentStats(params = {}) {
    try {
      const response = await apiClient.get('/payments/stats', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Refund payment
  async refundPayment(paymentId, refundData) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/refund`, refundData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default paymentService;



