// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  key_id: 'rzp_test_RNj6wvo7aRv2Zf', // Test Key ID provided by user
  key_secret: 'KeySLEDDc94B7ZxlGCwS26G9', // Test Key Secret provided by user
  // Note: For production, use environment variables and move to env files
  // key_id: import.meta.env.VITE_RAZORPAY_KEY_ID,
  // key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET,
};

// Razorpay Plan IDs (You need to create these in your Razorpay dashboard)
export const RAZORPAY_PLANS = {
  // Candidate Plans
  candidate: {
    silver: {
      plan_id: 'plan_silver_candidate', // Create in Razorpay dashboard
      price: 200, // ₹200 for 1 month
      currency: 'INR',
      interval: 'month',
      interval_count: 1,
      description: 'Silver Plan - 1 Month'
    },
    gold: {
      plan_id: 'plan_gold_candidate',
      price: 500,
      currency: 'INR',
      interval: 'month',
      interval_count: 3,
      description: 'Gold Plan - 3 Months'
    },
    platinum: {
      plan_id: 'plan_platinum_candidate',
      price: 1000,
      currency: 'INR',
      interval: 'month',
      interval_count: 6,
      description: 'Platinum Plan - 6 Months'
    }
  },
  // Recruiter Plans - Pay per post model
  recruiter: {
    job_post: {
      plan_id: 'plan_job_post_recruiter',
      price: 300, // ₹300 per job post
      currency: 'INR',
      description: 'Job Post Payment'
    },
    // For future subscription plans if needed
    monthly_basic: {
      plan_id: 'plan_monthly_basic_recruiter',
      price: 29,
      currency: 'INR',
      interval: 'month',
      interval_count: 1,
      description: 'Basic Monthly Plan'
    },
    monthly_premium: {
      plan_id: 'plan_monthly_premium_recruiter',
      price: 59,
      currency: 'INR',
      interval: 'month',
      interval_count: 1,
      description: 'Premium Monthly Plan'
    }
  }
};

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
  active: 'active',
  past_due: 'past_due',
  cancelled: 'cancelled',
  pending: 'pending',
  expired: 'expired'
};
