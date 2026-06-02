import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminBannerService } from "../../services/adminBannerService";
import {
  Image,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Upload,
  LayoutGrid,
  Home,
  Briefcase,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  X,
  Loader2,
  ImageOff,
} from "lucide-react";

const PAGE_OPTIONS = [
  { value: "home", label: "Home", icon: Home },
  { value: "job", label: "Job Listings", icon: Briefcase },
];

const resolveBannerList = (payload) => {
  if (Array.isArray(payload)) return { banners: payload, count: payload.length };
  if (Array.isArray(payload?.banners))
    return { banners: payload.banners, count: payload.count ?? payload.banners.length };
  if (Array.isArray(payload?.data)) return { banners: payload.data, count: payload.data.length };
  if (Array.isArray(payload?.result)) return { banners: payload.result, count: payload.result.length };
  return { banners: [], count: 0 };
};

const getBannerId = (banner) =>
  banner?.banner_id || banner?.id || banner?._id || banner?.bannerId;

const getBannerImage = (banner) =>
  banner?.image_url || banner?.image || banner?.banner || banner?.url || "";

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const shortId = (id) => (id ? `${String(id).slice(0, 8)}…` : "—");

const pageLabel = (page) => {
  const p = (page || "").toLowerCase();
  return PAGE_OPTIONS.find((o) => o.value === p)?.label || page || "Unknown";
};

const AdminBanners = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "bg-gray-800/80" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const inputBg = isDark ? "bg-gray-900/50" : "bg-gray-50";
  const hoverCard = isDark ? "hover:border-indigo-500/40 hover:shadow-indigo-500/10" : "hover:border-indigo-300 hover:shadow-lg";

  const [pageFilter, setPageFilter] = useState("all");
  const [banners, setBanners] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const [createPage, setCreatePage] = useState("home");
  const [createImageFile, setCreateImageFile] = useState(null);
  const [createDragOver, setCreateDragOver] = useState(false);

  const [editingBanner, setEditingBanner] = useState(null);
  const [editPage, setEditPage] = useState("home");
  const [editImageFile, setEditImageFile] = useState(null);

  const [viewBanner, setViewBanner] = useState(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminBannerService.getAllBanners(pageFilter);
      const { banners: list, count } = resolveBannerList(response);
      setBanners(list);
      setTotalCount(count);
    } catch (err) {
      setError(err?.message || "Failed to load banners.");
      setBanners([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [pageFilter]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const pageStats = useMemo(() => {
    const stats = { home: 0, job: 0 };
    banners.forEach((b) => {
      const p = (b.page || "").toLowerCase();
      if (stats[p] !== undefined) stats[p] += 1;
    });
    return stats;
  }, [banners]);

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
    if (!window.confirm("Delete this banner? This cannot be undone.")) return;
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
    if (!bannerId) {
      setViewBanner(banner);
      return;
    }
    try {
      setSaving(true);
      const response = await adminBannerService.getBannerById(bannerId);
      const resolved = response?.banner || response?.data || response;
      setViewBanner(resolved?.banner_id ? resolved : banner);
    } catch {
      setViewBanner(banner);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Could not copy to clipboard.");
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

  const onCreateFile = (file) => {
    if (file?.type?.startsWith("image/")) setCreateImageFile(file);
  };

  const PageBadge = ({ page }) => {
    const p = (page || "").toLowerCase();
    const isHome = p === "home";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isHome
            ? isDark
              ? "bg-emerald-900/40 text-emerald-300"
              : "bg-emerald-100 text-emerald-800"
            : isDark
              ? "bg-blue-900/40 text-blue-300"
              : "bg-blue-100 text-blue-800"
        }`}
      >
        {isHome ? <Home size={12} /> : <Briefcase size={12} />}
        {pageLabel(page)}
      </span>
    );
  };

  const FilterTab = ({ value, label, count }) => {
    const active = pageFilter === value;
    return (
      <button
        type="button"
        onClick={() => setPageFilter(value)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          active
            ? "bg-indigo-600 text-white shadow-md"
            : `${textSecondary} ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`
        }`}
      >
        {label}
        {count !== undefined && (
          <span
            className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
              active ? "bg-white/20" : isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gradient-to-b from-slate-50 to-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                <LayoutGrid size={22} />
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${textColor}`}>
                Banner Management
              </h1>
            </div>
            <p className={`text-sm max-w-xl ${textSecondary}`}>
              Manage hero banners for Home and Job pages. Images are stored on S3.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchBanners}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-colors shrink-0"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${
              isDark ? "border-red-800 bg-red-950/50 text-red-300" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <X size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="ml-auto opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}
        {message && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
              isDark ? "border-emerald-800 bg-emerald-950/50 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <Check size={16} />
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total banners", value: totalCount, icon: Image, color: "indigo" },
            { label: "Showing", value: banners.length, icon: LayoutGrid, color: "violet" },
            { label: "Home page", value: pageStats.home, icon: Home, color: "emerald" },
            { label: "Job page", value: pageStats.job, icon: Briefcase, color: "blue" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className={`${cardBg} rounded-xl border ${borderColor} p-4 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-medium uppercase tracking-wide ${textSecondary}`}>{label}</p>
                <div
                  className={`p-2 rounded-lg ${
                    color === "indigo"
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300"
                      : color === "emerald"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : color === "blue"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300"
                          : "bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300"
                  }`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <p className={`text-2xl font-bold mt-2 ${textColor}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Upload panel */}
          <div className="xl:col-span-4">
            <div className={`${cardBg} rounded-2xl border ${borderColor} p-6 shadow-sm sticky top-6`}>
              <h2 className={`text-lg font-semibold ${textColor} mb-1 flex items-center gap-2`}>
                <Plus size={20} className="text-indigo-500" />
                Upload new banner
              </h2>
              <p className={`text-xs ${textSecondary} mb-5`}>JPG, PNG or WebP recommended</p>

              <form onSubmit={handleCreateBanner} className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Target page</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAGE_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCreatePage(value)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                          createPage === value
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                            : `${borderColor} ${textSecondary} ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Banner image</label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setCreateDragOver(true);
                    }}
                    onDragLeave={() => setCreateDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setCreateDragOver(false);
                      onCreateFile(e.dataTransfer.files?.[0]);
                    }}
                    className={`relative rounded-xl border-2 border-dashed transition-colors ${
                      createDragOver
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                        : borderColor
                    } ${previewCreateImage ? "p-0 overflow-hidden" : "p-8"}`}
                  >
                    {previewCreateImage ? (
                      <div className="relative group">
                        <img
                          src={previewCreateImage}
                          alt="Preview"
                          className="w-full aspect-[21/9] object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCreateImageFile(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer text-center">
                        <Upload size={32} className={`mb-2 ${textSecondary}`} />
                        <span className={`text-sm font-medium ${textColor}`}>Drop image or click to browse</span>
                        <span className={`text-xs mt-1 ${textSecondary}`}>Max recommended width 1920px</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => onCreateFile(e.target.files?.[0])}
                        />
                      </label>
                    )}
                    {previewCreateImage && (
                      <label className="absolute inset-0 cursor-pointer opacity-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => onCreateFile(e.target.files?.[0])}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving || !createImageFile}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 shadow-md"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  Upload banner
                </button>
              </form>
            </div>
          </div>

          {/* Banner grid */}
          <div className="xl:col-span-8">
            <div className={`${cardBg} rounded-2xl border ${borderColor} p-6 shadow-sm`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className={`text-lg font-semibold ${textColor} flex items-center gap-2`}>
                  <Image size={20} className="text-indigo-500" />
                  All banners
                </h2>
                <div className="flex flex-wrap gap-2">
                  <FilterTab value="all" label="All" count={totalCount} />
                  <FilterTab value="home" label="Home" count={pageStats.home} />
                  <FilterTab value="job" label="Job" count={pageStats.job} />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className={`rounded-xl border ${borderColor} overflow-hidden animate-pulse`}
                    >
                      <div className={`aspect-[21/9] ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
                      <div className="p-4 space-y-2">
                        <div className={`h-4 w-24 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
                        <div className={`h-3 w-full rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : banners.length === 0 ? (
                <div className={`text-center py-16 rounded-xl border border-dashed ${borderColor}`}>
                  <ImageOff size={48} className={`mx-auto mb-4 ${textSecondary}`} />
                  <p className={`font-medium ${textColor}`}>No banners found</p>
                  <p className={`text-sm mt-1 ${textSecondary}`}>
                    {pageFilter === "all"
                      ? "Upload your first banner using the form on the left."
                      : `No banners for ${pageLabel(pageFilter)}. Try another filter or upload one.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {banners.map((banner) => {
                    const bannerId = getBannerId(banner);
                    const imageUrl = getBannerImage(banner);
                    return (
                      <article
                        key={bannerId}
                        className={`group rounded-xl border ${borderColor} overflow-hidden transition-all shadow-sm ${hoverCard}`}
                      >
                        <div className="relative aspect-[21/9] bg-gray-100 dark:bg-gray-900">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={`${pageLabel(banner.page)} banner`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className={textSecondary} size={32} />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <PageBadge page={banner.page} />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleViewBanner(banner)}
                              className="p-2 rounded-lg bg-white/90 text-gray-800 hover:bg-white shadow"
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(banner)}
                              className="p-2 rounded-lg bg-white/90 text-gray-800 hover:bg-white shadow"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBanner(banner)}
                              disabled={saving}
                              className="p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-600 shadow"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className={`text-xs font-mono ${textSecondary}`} title={bannerId}>
                            ID: {shortId(bannerId)}
                          </p>
                          <div className={`flex items-center gap-1.5 mt-2 text-xs ${textSecondary}`}>
                            <Calendar size={12} />
                            <span>Updated {formatDate(banner.updated_at || banner.created_at)}</span>
                          </div>
                          {imageUrl && (
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Open image <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editingBanner && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !saving && setEditingBanner(null)}
        >
          <div
            className={`${cardBg} w-full max-w-lg rounded-2xl border ${borderColor} shadow-2xl overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${textColor}`}>Edit banner</h3>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className={`p-1 rounded-lg ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X size={20} className={textSecondary} />
              </button>
            </div>
            <form onSubmit={handleUpdateBanner} className="p-6 space-y-5">
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>Page</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAGE_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditPage(value)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        editPage === value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                          : `${borderColor} ${textSecondary}`
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Replace image <span className={textSecondary}>(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  className={`w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:cursor-pointer ${textColor}`}
                />
              </div>
              <img
                src={previewEditImage || getBannerImage(editingBanner)}
                alt="Banner preview"
                className={`w-full aspect-[21/9] object-cover rounded-xl border ${borderColor}`}
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className={`px-4 py-2.5 border ${borderColor} rounded-xl ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewBanner && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewBanner(null)}
        >
          <div
            className={`${cardBg} w-full max-w-2xl rounded-2xl border ${borderColor} shadow-2xl max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-inherit z-10">
              <div>
                <h3 className={`text-lg font-semibold ${textColor}`}>Banner details</h3>
                <PageBadge page={viewBanner.page} />
              </div>
              <button
                type="button"
                onClick={() => setViewBanner(null)}
                className={`p-1 rounded-lg ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X size={20} className={textSecondary} />
              </button>
            </div>

            <div className="p-6">
              <img
                src={getBannerImage(viewBanner)}
                alt=""
                className={`w-full aspect-[21/9] object-cover rounded-xl border ${borderColor} mb-6`}
              />

              <dl className="space-y-4">
                {[
                  { label: "Banner ID", value: getBannerId(viewBanner), mono: true },
                  { label: "Page", value: pageLabel(viewBanner.page) },
                  { label: "S3 Bucket", value: viewBanner.bucket },
                  { label: "Object key", value: viewBanner.key, mono: true, breakAll: true },
                  { label: "Created", value: formatDate(viewBanner.created_at) },
                  { label: "Last updated", value: formatDate(viewBanner.updated_at) },
                ].map(({ label, value, mono, breakAll }) =>
                  value ? (
                    <div key={label} className={`rounded-lg ${inputBg} px-4 py-3`}>
                      <dt className={`text-xs font-medium uppercase tracking-wide ${textSecondary}`}>{label}</dt>
                      <dd
                        className={`mt-1 text-sm ${textColor} ${mono ? "font-mono" : ""} ${breakAll ? "break-all" : ""}`}
                      >
                        {value}
                      </dd>
                    </div>
                  ) : null
                )}

                {getBannerImage(viewBanner) && (
                  <div className={`rounded-lg ${inputBg} px-4 py-3`}>
                    <dt className={`text-xs font-medium uppercase tracking-wide ${textSecondary}`}>Image URL</dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={getBannerImage(viewBanner)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                      >
                        {getBannerImage(viewBanner)}
                        <ExternalLink size={14} className="shrink-0" />
                      </a>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(getBannerImage(viewBanner), "url")}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${borderColor} ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >
                        {copiedId === "url" ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === "url" ? "Copied" : "Copy URL"}
                      </button>
                    </dd>
                  </div>
                )}
              </dl>

              <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setViewBanner(null);
                    openEdit(viewBanner);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewBanner(null)}
                  className={`px-4 py-2.5 border ${borderColor} rounded-xl ${textColor}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
