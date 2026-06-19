const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
  // import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const BASE_PATH = "/admin/banner";

const resolveBannerList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.banners)) return payload.banners;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const getBannerImage = (banner) =>
  banner?.image_url || banner?.image || banner?.banner || banner?.url || "";

export const bannerService = {
  async getBanners(pageFilter) {
    const url = new URL(`${API_BASE_URL}${BASE_PATH}`);
    if (pageFilter) url.searchParams.set("page", pageFilter);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.message || "Failed to load banners");
    }

    const data = await response.json();
    return resolveBannerList(data);
  },

  getBannerImage,
};
