import adminApiClient from './adminApiClient';

const adminStudentService = {
  async getUsers(params = {}) {
    const response = await adminApiClient.get('/students/users', { params });
    return response.data ?? response;
  },

  async updateManualPlan(email, is_manual_plan) {
    const response = await adminApiClient.put('/students/manual-plan', {
      email,
      is_manual_plan,
    });
    return response.data ?? response;
  },
};

export default adminStudentService;
