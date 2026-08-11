import apiClient from "./apiClient";

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.referrals)) return response.referrals;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export const referralService = {
  async getReferralById(referralId) {
    const response = await apiClient.get(`/referrals/${referralId}`);
    return response?.data ?? response?.referral ?? response;
  },

  async getReferralsByRecruiterId(recruiterId) {
    const response = await apiClient.get(`/referrals/recruiter/${recruiterId}`);
    return normalizeList(response);
  },
};

export default referralService;
