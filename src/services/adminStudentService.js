import adminApiClient from './adminApiClient';
import { API_ENDPOINTS } from '../config/api';

const adminStudentService = {
  async getUsers(params = {}) {
    const response = await adminApiClient.get('/students/users', { params });
    return response.data ?? response;
  },

  async sendManualPlanOtp(admin_email) {
    const response = await adminApiClient.post(API_ENDPOINTS.students.manualPlanSendOtp, {
      admin_email,
    });
    return response.data ?? response;
  },

  async verifyManualPlanOtp(admin_email, otp) {
    const response = await adminApiClient.post(API_ENDPOINTS.students.manualPlanVerifyOtp, {
      admin_email,
      otp,
    });
    return response.data ?? response;
  },

  async updateManualPlan({ email, is_manual_plan, admin_email, verification_token }) {
    const response = await adminApiClient.put(API_ENDPOINTS.students.manualPlan, {
      email,
      is_manual_plan,
      admin_email,
      verification_token,
    });
    return response.data ?? response;
  },
};

export default adminStudentService;
