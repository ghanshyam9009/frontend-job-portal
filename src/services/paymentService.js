// Payment Service
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { RAZORPAY_CONFIG, RAZORPAY_PLANS } from '../config/razorpay';

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
  },

  // Razorpay Subscription Methods

  // Create Razorpay subscription
  async createRazorpaySubscription(planType, userType, userDetails) {
    try {
      const planConfig = RAZORPAY_PLANS[userType]?.[planType];
      if (!planConfig) {
        throw new Error(`Plan configuration not found for ${userType} ${planType}`);
      }

      const response = await apiClient.post('/payments/razorpay/subscription', {
        plan_id: planConfig.plan_id,
        customer: {
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
          contact: userDetails.phone || '',
        },
        user_id: userDetails.id,
        user_type: userType,
        plan_type: planType,
        total_count: planConfig.interval_count,
        quantity: 1,
        customer_notify: 1,
        callback_url: `${window.location.origin}/payment-success`,
        callback_method: 'get'
      });

      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay subscription:', error);
      throw error;
    }
  },

  // Create Razorpay order for one-time payment
  async createRazorpayOrder(amount, currency = 'INR', userDetails, planType, userType) {
    try {
      const response = await apiClient.post('/payments/razorpay/order', {
        amount: amount * 100, // Razorpay expects amount in paisa
        currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
        notes: {
          user_id: userDetails.id,
          user_type: userType,
          plan_type: planType,
          email: userDetails.email
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  },

  // Verify Razorpay payment
  async verifyRazorpayPayment(paymentId, orderId, signature, userDetails) {
    try {
      const response = await apiClient.post('/payments/razorpay/verify', {
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        user_details: userDetails
      });

      return response.data;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await apiClient.post(`/payments/subscription/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  },

  // Get subscription details
  async getSubscriptionDetails(subscriptionId) {
    try {
      const response = await apiClient.get(`/payments/subscription/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting subscription details:', error);
      throw error;
    }
  },

  // Update user membership after successful payment
  async updateUserMembership(userId, planType, userType, paymentDetails) {
    try {
      const endpoint = userType === 'candidate' ? '/premium/mark-student-premium' : '/premium/mark-employer-premium';

      const response = await apiClient.post(endpoint, {
        email: paymentDetails.email,
        is_premium: true,
        plan: planType,
        payment_id: paymentDetails.paymentId,
        subscription_id: paymentDetails.subscriptionId || null,
        user_type: userType
      });

      return response.data;
    } catch (error) {
      console.error('Error updating user membership:', error);
      throw error;
    }
  },

  // Initialize Razorpay checkout
  initializeRazorpayCheckout(options) {
    const rzp = new window.Razorpay({
      key: RAZORPAY_CONFIG.key_id,
      ...options,
    });

    rzp.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      if (options.onFailure) {
        options.onFailure(response);
      }
    });

    rzp.on('payment.success', function (response) {
      console.log('Payment success:', response);
      if (options.onSuccess) {
        options.onSuccess(response);
      }
    });

    return rzp;
  },

  // Get plan details
  getPlanDetails(userType, planType) {
    return RAZORPAY_PLANS[userType]?.[planType] || null;
  }
};

export default paymentService;
