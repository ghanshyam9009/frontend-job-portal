import adminApiClient from "./adminApiClient";

const BASE_PATH = "/admin/banner";

export const adminBannerService = {
  async uploadBanner({ page, imageFile }) {
    const formData = new FormData();
    formData.append("page", page);
    formData.append("image", imageFile);

    const response = await adminApiClient.post(`${BASE_PATH}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async getAllBanners(pageFilter) {
    const params = {};
    if (pageFilter && pageFilter !== "all") params.page = pageFilter;
    const response = await adminApiClient.get(BASE_PATH, { params });
    return response.data;
  },

  async getBannerById(bannerId) {
    const response = await adminApiClient.get(`${BASE_PATH}/${bannerId}`);
    return response.data;
  },

  async updateBanner(bannerId, { page, imageFile }) {
    const formData = new FormData();
    if (page) formData.append("page", page);
    if (imageFile) formData.append("image", imageFile);

    const response = await adminApiClient.put(`${BASE_PATH}/${bannerId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async deleteBanner(bannerId) {
    const response = await adminApiClient.delete(`${BASE_PATH}/${bannerId}`);
    return response.data;
  },
};

