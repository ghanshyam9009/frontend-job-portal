import adminApiClient from './adminApiClient';

const BASE_PATH = '/plans';

export const getPlanId = (plan) => plan?.plan_id ?? plan?.id;

export const normalizePlansList = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.plans)) return payload.plans;
  return [];
};

export const adminPlanService = {
  async getAllPlans(type) {
    const params = type ? { type } : {};
    const response = await adminApiClient.get(BASE_PATH, { params });
    return response;
  },

  async getPlanById(planId) {
    const response = await adminApiClient.get(`${BASE_PATH}/${planId}`);
    return response;
  },

  async createPlan(planData) {
    const response = await adminApiClient.post(BASE_PATH, planData);
    return response;
  },

  async updatePlan(planId, planData) {
    const response = await adminApiClient.put(`${BASE_PATH}/${planId}`, planData);
    return response;
  },

  async deletePlan(planId) {
    const response = await adminApiClient.delete(`${BASE_PATH}/${planId}`);
    return response;
  },
};

export default adminPlanService;
