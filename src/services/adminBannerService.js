import adminApiClient from "./adminApiClient";

const BASE_PATH = "/admin/banner";
const MAX_BANNER_IMAGES = 10;

export const adminBannerService = {
  /**
   * Upload banner(s). New uploads replace existing banners for that page.
   * @param {{ page: string, imageFile?: File, imageFiles?: File[] }}
   */
  async uploadBanner({ page, imageFile, imageFiles }) {
    const files = (Array.isArray(imageFiles) ? imageFiles : [])
      .concat(imageFile ? [imageFile] : [])
      .filter((f) => f instanceof File)
      .slice(0, MAX_BANNER_IMAGES);

    if (!files.length) {
      throw new Error("At least one image file is required.");
    }

    const formData = new FormData();
    formData.append("page", page);

    if (files.length === 1) {
      formData.append("image", files[0]);
    } else {
      // Only `images` — do not also append `image` or backend saves duplicates
      files.forEach((file) => {
        formData.append("images", file);
      });
    }

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

  /** Update API still accepts a single image only */
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

export { MAX_BANNER_IMAGES };
