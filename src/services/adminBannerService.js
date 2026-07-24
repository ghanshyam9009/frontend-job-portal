import adminApiClient from "./adminApiClient";

const BASE_PATH = "/admin/banner";
const MAX_BANNER_IMAGES = 10;
const S3_BANNER_HOST = "banner-branding.s3.ap-southeast-1.amazonaws.com";

/** In local Vite dev, fetch S3 via proxy so browser CORS does not block keepExisting */
const toFetchableUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (import.meta.env.DEV && parsed.hostname === S3_BANNER_HOST) {
      return `/s3-banner${parsed.pathname}${parsed.search}`;
    }
  } catch {
    /* keep original */
  }
  return url;
};

const extensionFromType = (mime = "") => {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "jpg";
};

const blobToFile = (blob, index) => {
  if (!blob || blob.size === 0) {
    throw new Error("Existing banner image was empty");
  }
  const type = blob.type?.startsWith("image/") ? blob.type : "image/jpeg";
  const ext = extensionFromType(type);
  return new File([blob], `existing-banner-${index + 1}.${ext}`, { type });
};

/**
 * Download a remote image URL as a File (needed because production upload
 * still replaces the whole page set — we re-send existing + new together).
 */
const urlToFile = async (url, index) => {
  const fetchUrl = toFetchableUrl(url);
  const response = await fetch(fetchUrl, { credentials: "omit" });
  if (!response.ok) {
    throw new Error(`Failed to load existing banner image (${response.status})`);
  }
  return blobToFile(await response.blob(), index);
};

export const adminBannerService = {
  /**
   * Upload banner(s).
   * - home_first / job: new upload replaces existing banners for that page
   * - home_second: pass keepExisting + existingImageUrls so old images are
   *   preserved (API currently replaces the full set on every upload)
   * @param {{
   *   page: string,
   *   imageFile?: File,
   *   imageFiles?: File[],
   *   keepExisting?: boolean,
   *   existingImageUrls?: string[],
   * }}
   */
  async uploadBanner({
    page,
    imageFile,
    imageFiles,
    keepExisting = false,
    existingImageUrls = [],
  }) {
    const newFiles = (Array.isArray(imageFiles) ? imageFiles : [])
      .concat(imageFile ? [imageFile] : [])
      .filter((f) => f instanceof File);

    if (!newFiles.length) {
      throw new Error("At least one image file is required.");
    }

    let files = newFiles;

    // Production API replaces all banners for the page. To "append", re-upload
    // existing images together with the new ones in a single request.
    if (keepExisting && Array.isArray(existingImageUrls) && existingImageUrls.length) {
      const urls = existingImageUrls.filter(Boolean);
      try {
        const existingFiles = await Promise.all(
          urls.map((url, index) => urlToFile(url, index))
        );
        files = [...existingFiles, ...newFiles];
      } catch (err) {
        throw new Error(
          err?.message ||
            "Could not keep previous banners while uploading. Please try again."
        );
      }
    }

    files = files.slice(0, MAX_BANNER_IMAGES);

    if (!files.length) {
      throw new Error("At least one image file is required.");
    }

    const formData = new FormData();
    formData.append("page", page);

    // home_second always uses `images` (even for a single file) so multi-banner flow is consistent
    const useImagesField =
      String(page || "").toLowerCase() === "home_second" || files.length > 1;

    if (useImagesField) {
      files.forEach((file) => {
        formData.append("images", file);
      });
    } else {
      formData.append("image", files[0]);
    }

    const response = await adminApiClient.post(`${BASE_PATH}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
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
