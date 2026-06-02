import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminBannerService } from "../../services/adminBannerService";
import { Image, Plus, RefreshCw, Trash2, Edit, Eye } from "lucide-react";

const PAGE_OPTIONS = ["home", "job"];

const resolveBannerList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.banners)) return payload.banners;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
};

const getBannerId = (banner) =>
  banner?.banner_id || banner?.id || banner?._id || banner?.bannerId;

const getBannerImage = (banner) =>
  banner?.image || banner?.image_url || banner?.banner || banner?.url || "";

const AdminBanners = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  const [pageFilter, setPageFilter] = useState("all");
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [createPage, setCreatePage] = useState("home");
  const [createImageFile, setCreateImageFile] = useState(null);

  const [editingBanner, setEditingBanner] = useState(null);
  const [editPage, setEditPage] = useState("home");
  const [editImageFile, setEditImageFile] = useState(null);

  const [viewBanner, setViewBanner] = useState(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminBannerService.getAllBanners(pageFilter);
      setBanners(resolveBannerList(response));
    } catch (err) {
      setError(err?.message || "Failed to load banners.");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [pageFilter]);

  const clearCreateForm = () => {
    setCreatePage("home");
    setCreateImageFile(null);
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!createImageFile) {
      setError("Please choose an image to upload.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await adminBannerService.uploadBanner({
        page: createPage,
        imageFile: createImageFile,
      });
      setMessage("Banner uploaded successfully.");
      clearCreateForm();
      await fetchBanners();
    } catch (err) {
      setError(err?.message || "Failed to upload banner.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);
    setEditPage((banner?.page || "home").toLowerCase());
    setEditImageFile(null);
  };

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    if (!editingBanner) return;
    const bannerId = getBannerId(editingBanner);
    if (!bannerId) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");
      await adminBannerService.updateBanner(bannerId, {
        page: editPage,
        imageFile: editImageFile,
      });
      setMessage("Banner updated successfully.");
      setEditingBanner(null);
      setEditImageFile(null);
      await fetchBanners();
    } catch (err) {
      setError(err?.message || "Failed to update banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (banner) => {
    const bannerId = getBannerId(banner);
    if (!bannerId) return;
    if (!window.confirm("Delete this banner?")) return;
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await adminBannerService.deleteBanner(bannerId);
      setMessage("Banner deleted successfully.");
      await fetchBanners();
    } catch (err) {
      setError(err?.message || "Failed to delete banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewBanner = async (banner) => {
    const bannerId = getBannerId(banner);
    if (!bannerId) return;
    try {
      setSaving(true);
      const response = await adminBannerService.getBannerById(bannerId);
      const resolved = response?.data || response?.banner || response || banner;
      setViewBanner(resolved);
    } catch (err) {
      setError(err?.message || "Failed to fetch banner details.");
    } finally {
      setSaving(false);
    }
  };

  const previewCreateImage = useMemo(
    () => (createImageFile ? URL.createObjectURL(createImageFile) : ""),
    [createImageFile]
  );
  const previewEditImage = useMemo(
    () => (editImageFile ? URL.createObjectURL(editImageFile) : ""),
    [editImageFile]
  );

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${textColor}`}>Banner Management</h1>
              <p className={`text-sm ${textSecondary}`}>
                Upload, update, view and delete website banners.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchBanners}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg border border-green-300 bg-green-50 text-green-700 px-4 py-3 text-sm">
              {message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${cardBg} rounded-lg border ${borderColor} p-4`}>
            <h2 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}>
              <Plus size={18} />
              Upload Banner
            </h2>
            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Page</label>
                <select
                  value={createPage}
                  onChange={(e) => setCreatePage(e.target.value)}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textColor}`}
                >
                  {PAGE_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateImageFile(e.target.files?.[0] || null)}
                  className={`w-full text-sm ${textColor}`}
                />
              </div>
              {previewCreateImage && (
                <img
                  src={previewCreateImage}
                  alt="Create preview"
                  className={`w-full h-36 object-cover rounded-lg border ${borderColor}`}
                />
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Upload Banner
              </button>
            </form>
          </div>

          <div className={`lg:col-span-2 ${cardBg} rounded-lg border ${borderColor} p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${textColor} flex items-center gap-2`}>
                <Image size={18} />
                All Banners ({banners.length})
              </h2>
              <select
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                className={`px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor}`}
              >
                <option value="all">All Pages</option>
                {PAGE_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <p className={`text-sm ${textSecondary}`}>Loading banners...</p>
            ) : banners.length === 0 ? (
              <p className={`text-sm ${textSecondary}`}>No banners found.</p>
            ) : (
              <div className="space-y-3">
                {banners.map((banner) => {
                  const bannerId = getBannerId(banner);
                  const imageUrl = getBannerImage(banner);
                  return (
                    <div
                      key={bannerId}
                      className={`p-3 rounded-lg border ${borderColor} flex flex-col sm:flex-row gap-3`}
                    >
                      <div className={`w-full sm:w-40 h-24 rounded-lg overflow-hidden border ${borderColor}`}>
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${textSecondary}`}>Banner ID: {bannerId}</p>
                        <p className={`text-sm ${textColor} font-medium`}>
                          Page: {(banner.page || "N/A").toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleViewBanner(banner)}
                          className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(banner)}
                          className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner)}
                          className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingBanner && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setEditingBanner(null)}
        >
          <div
            className={`${cardBg} w-full max-w-lg rounded-lg border ${borderColor} p-5`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Update Banner</h3>
            <form onSubmit={handleUpdateBanner} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Page</label>
                <select
                  value={editPage}
                  onChange={(e) => setEditPage(e.target.value)}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${cardBg} ${textColor}`}
                >
                  {PAGE_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                  New Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  className={`w-full text-sm ${textColor}`}
                />
              </div>
              {previewEditImage ? (
                <img
                  src={previewEditImage}
                  alt="Edit preview"
                  className={`w-full h-36 object-cover rounded-lg border ${borderColor}`}
                />
              ) : (
                <img
                  src={getBannerImage(editingBanner)}
                  alt=""
                  className={`w-full h-36 object-cover rounded-lg border ${borderColor}`}
                />
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className={`px-4 py-2 border ${borderColor} rounded-lg ${textColor}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewBanner && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setViewBanner(null)}
        >
          <div
            className={`${cardBg} w-full max-w-xl rounded-lg border ${borderColor} p-5`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Banner Details</h3>
            <img
              src={getBannerImage(viewBanner)}
              alt=""
              className={`w-full h-52 object-cover rounded-lg border ${borderColor} mb-4`}
            />
            <p className={`text-sm ${textSecondary}`}>Banner ID: {getBannerId(viewBanner)}</p>
            <p className={`text-sm ${textColor} font-medium`}>
              Page: {(viewBanner.page || "N/A").toUpperCase()}
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewBanner(null)}
                className={`px-4 py-2 border ${borderColor} rounded-lg ${textColor}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;

