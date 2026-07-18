import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import {
  adminBannerService,
  MAX_BANNER_IMAGES,
} from "../../services/adminBannerService";
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
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const PAGE_OPTIONS = [
  {
    value: "home_first",
    label: "Home First Banner",
    icon: ChevronUp,
    hint: "Home page — right column (beside jobs)",
  },
  {
    value: "home_second",
    label: "Home Second Banner",
    icon: ChevronDown,
    hint: `Home page — lower section (up to ${MAX_BANNER_IMAGES} images)`,
  },
  {
    value: "job",
    label: "Job Listings",
    icon: Briefcase,
    hint: "Job page — right sidebar",
  },
];

/**
 * Display sizes matching live layout on Home / Job pages.
 * Used in admin so uploads match on-site width × height.
 */
const BANNER_DISPLAY_SPECS = {
  home_first: {
    width: 360,
    height: 480,
    // Home right column (~lg:col-span-4), portrait beside jobs list
    aspectClass: "aspect-[360/480]",
    previewMaxWidth: "max-w-[180px]",
    where: "Home · right column (desktop)",
  },
  home_second: {
    width: 768,
    height: 380,
    // Home lower banner — max-w-3xl / 768×380 box
    aspectClass: "aspect-[768/380]",
    previewMaxWidth: "max-w-md",
    where: "Home · lower banner slider",
  },
  job: {
    width: 256,
    height: 400,
    // JobListings right grid col: 16rem (256px), min-h ~280px
    aspectClass: "aspect-[256/400]",
    previewMaxWidth: "max-w-[128px]",
    where: "Jobs · right sidebar (16rem)",
  },
};

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
  if (p === "home") return "Home (legacy)";
  return PAGE_OPTIONS.find((o) => o.value === p)?.label || page || "Unknown";
};

const normalizeBannerPage = (page) => {
  const p = (page || "home_first").toString().trim().toLowerCase();
  if (["home", "home_page", "homepage", "home-first", "homefirst"].includes(p)) {
    return "home_first";
  }
  if (["home_second", "home-second", "home second", "home2"].includes(p)) {
    return "home_second";
  }
  return PAGE_OPTIONS.some((o) => o.value === p) ? p : "home_first";
};

const getBannerDisplaySpec = (page) =>
  BANNER_DISPLAY_SPECS[normalizeBannerPage(page)] || BANNER_DISPLAY_SPECS.home_first;

const allowsMultipleImages = (page) =>
  (page || "").toLowerCase() === "home_second";

const filterImageFiles = (fileList) =>
  Array.from(fileList || []).filter((f) => f?.type?.startsWith("image/"));

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

  const [createPage, setCreatePage] = useState("home_first");
  const [createImageFiles, setCreateImageFiles] = useState([]);
  const [createDragOver, setCreateDragOver] = useState(false);

  const [editingBanner, setEditingBanner] = useState(null);
  const [editPage, setEditPage] = useState("home_first");
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

  useEffect(() => {
    if (!editingBanner) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setEditingBanner(null);
        setEditImageFile(null);
        setEditPage("home_first");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingBanner]);

  const pageStats = useMemo(() => {
    const stats = { home_first: 0, home_second: 0, job: 0 };
    banners.forEach((b) => {
      const p = (b.page || "").toString().trim().toLowerCase();
      const normalizedPage = normalizeBannerPage(p);
      if (stats[normalizedPage] !== undefined) {
        stats[normalizedPage] += 1;
      }
    });
    return stats;
  }, [banners]);

  const clearCreateForm = () => {
    setCreatePage("home_first");
    setCreateImageFiles([]);
  };

  const isMultiUpload = allowsMultipleImages(createPage);

  const handleCreatePageChange = (page) => {
    setCreatePage(page);
    // Switching away from multi-upload keeps only the first selected file
    if (!allowsMultipleImages(page) && createImageFiles.length > 1) {
      setCreateImageFiles((prev) => prev.slice(0, 1));
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!createImageFiles.length) {
      setError("Please choose at least one image to upload.");
      return;
    }
    if (isMultiUpload && createImageFiles.length > MAX_BANNER_IMAGES) {
      setError(`Maximum ${MAX_BANNER_IMAGES} images allowed.`);
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const result = await adminBannerService.uploadBanner({
        page: createPage,
        imageFiles: createImageFiles,
      });
      const count = result?.count ?? createImageFiles.length;
      setMessage(
        isMultiUpload
          ? `${count} banner${count === 1 ? "" : "s"} uploaded for Home Second (previous banners replaced).`
          : "Banner uploaded successfully."
      );
      clearCreateForm();
      await fetchBanners();
    } catch (err) {
      setError(err?.message || "Failed to upload banner.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (banner) => {
    if (!banner) return;
    setEditingBanner(banner);
    setEditPage(normalizeBannerPage(banner?.page || "home_first"));
    setEditImageFile(null);
    setError("");
    setMessage("");
  };

  const closeEditModal = () => {
    setEditingBanner(null);
    setEditImageFile(null);
    setEditPage("home_first");
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

  const previewCreateImages = useMemo(
    () => createImageFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [createImageFiles]
  );

  useEffect(() => {
    return () => {
      previewCreateImages.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [previewCreateImages]);

  const previewEditImage = useMemo(
    () => (editImageFile ? URL.createObjectURL(editImageFile) : ""),
    [editImageFile]
  );

  const onCreateFiles = (fileList, { append = false } = {}) => {
    const images = filterImageFiles(fileList);
    if (!images.length) return;

    setCreateImageFiles((prev) => {
      if (!allowsMultipleImages(createPage)) {
        return images.slice(0, 1);
      }
      const merged = append ? [...prev, ...images] : images;
      const unique = [];
      const seen = new Set();
      for (const f of merged) {
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(f);
      }
      return unique.slice(0, MAX_BANNER_IMAGES);
    });

    if (allowsMultipleImages(createPage)) {
      const currentCount = append ? createImageFiles.length : 0;
      if (currentCount + images.length > MAX_BANNER_IMAGES) {
        setError(`Maximum ${MAX_BANNER_IMAGES} images allowed. Extra files were ignored.`);
      }
    }
  };

  const removeCreateImageAt = (index) => {
    setCreateImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const createDisplaySpec = getBannerDisplaySpec(createPage);
  const editDisplaySpec = getBannerDisplaySpec(editPage);

  const PlacementSelector = ({ value, onChange, compact = false }) => {
    const options = compact
      ? PAGE_OPTIONS.filter(({ value: optionValue }) => optionValue === value)
      : PAGE_OPTIONS;

    return (
      <div className="space-y-2.5" role="radiogroup" aria-label="Banner placement">
        {options.map(({ value: optionValue, label, icon: Icon, hint }) => {
          const selected = value === optionValue;
          const spec = BANNER_DISPLAY_SPECS[optionValue];
          const content = (
            <>
              <span
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${
                  selected
                    ? "bg-indigo-600 text-white"
                    : isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span
                  className={`block text-sm font-semibold leading-snug break-words ${
                    selected
                      ? "text-indigo-800 dark:text-indigo-200"
                      : textColor
                  }`}
                >
                  {label}
                </span>
                {hint && (
                  <span className={`block text-xs mt-1 leading-relaxed break-words ${textSecondary}`}>
                    {hint}
                  </span>
                )}
                {spec && (
                  <span
                    className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
                      selected
                        ? "bg-indigo-600/15 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-200"
                        : isDark
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {spec.width} × {spec.height} px
                  </span>
                )}
              </span>
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                  selected
                    ? "border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-500"
                    : isDark
                      ? "border-gray-500"
                      : "border-gray-300"
                }`}
                aria-hidden
              >
                {selected && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
            </>
          );

          if (compact) {
            return (
              <div
                key={optionValue}
                className={`w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? "border-indigo-500 bg-indigo-50 shadow-sm dark:bg-indigo-950/50 dark:border-indigo-400"
                    : `${borderColor} ${isDark ? "bg-gray-900/40" : "bg-white"}`
                }`}
                role="radio"
                aria-checked={selected}
              >
                {content}
              </div>
            );
          }

          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange?.(optionValue)}
              className={`w-full flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all ${
                selected
                  ? "border-indigo-500 bg-indigo-50 shadow-sm dark:bg-indigo-950/50 dark:border-indigo-400"
                  : `${borderColor} ${isDark ? "bg-gray-900/40 hover:bg-gray-700/40" : "bg-white hover:bg-gray-50"}`
              }`}
            >
              {content}
            </button>
          );
        })}
      </div>
    );
  };

  const PageBadge = ({ page }) => {
    const p = (page || "").toString().trim().toLowerCase();
    const normalizedPage = normalizeBannerPage(p);
    const isJob = normalizedPage === "job";
    const isFirst = normalizedPage === "home_first";
    const isSecond = normalizedPage === "home_second";
    const BadgeIcon = isJob ? Briefcase : isFirst ? ChevronUp : isSecond ? ChevronDown : Home;
    const badgeClass = isJob
      ? isDark
        ? "bg-blue-900/40 text-blue-300"
        : "bg-blue-100 text-blue-800"
      : isFirst
        ? isDark
          ? "bg-emerald-900/40 text-emerald-300"
          : "bg-emerald-100 text-emerald-800"
        : isDark
          ? "bg-teal-900/40 text-teal-300"
          : "bg-teal-100 text-teal-800";
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
        <BadgeIcon size={12} />
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
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border shrink-0 ${
          active
            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
            : `${borderColor} ${textColor} ${
                isDark ? "bg-gray-800/80 hover:bg-gray-700" : "bg-white hover:bg-gray-50"
              }`
        }`}
      >
        <span>{label}</span>
        {count !== undefined && (
          <span
            className={`min-w-[1.25rem] px-1.5 py-0.5 rounded-md text-xs font-semibold text-center ${
              active
                ? "bg-white/25 text-white"
                : isDark
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-100 text-gray-700"
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
              Manage Home First (upper) and Home Second (lower, multi-image) banners, plus Job page banners. New Home Second uploads replace old ones.
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
            { label: "Home first", value: pageStats.home_first, icon: Home, color: "emerald" },
            { label: "Home second", value: pageStats.home_second, icon: Home, color: "teal" },
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
                        : color === "teal"
                          ? "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300"
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
              <p className={`text-xs ${textSecondary} mb-5`}>
                JPG, PNG or WebP · upload at the size shown for each placement
              </p>

              <form onSubmit={handleCreateBanner} className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Banner placement</label>
                  <PlacementSelector value={createPage} onChange={handleCreatePageChange} />
                </div>

                {/* Live display size guide */}
                <div
                  className={`rounded-xl border ${borderColor} px-3.5 py-3 ${
                    isDark ? "bg-indigo-950/30" : "bg-indigo-50/80"
                  }`}
                >
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${textSecondary} mb-1`}>
                    On-site display size
                  </p>
                  <p className={`text-sm font-bold tabular-nums ${textColor}`}>
                    Width {createDisplaySpec.width}px · Height {createDisplaySpec.height}px
                  </p>
                  <p className={`text-xs mt-1.5 ${textSecondary}`}>{createDisplaySpec.where}</p>
                  <div className="mt-3 flex items-end gap-3">
                    <div
                      className={`rounded-md border-2 border-dashed border-indigo-400/60 bg-indigo-500/10 ${createDisplaySpec.previewMaxWidth} w-full ${createDisplaySpec.aspectClass}`}
                      title={`${createDisplaySpec.width}×${createDisplaySpec.height}`}
                      aria-hidden
                    />
            
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>
                    {isMultiUpload ? "Banner images" : "Banner image"}
                    {isMultiUpload && (
                      <span className={`ml-1 font-normal ${textSecondary}`}>
                        (up to {MAX_BANNER_IMAGES}, replaces existing)
                      </span>
                    )}
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setCreateDragOver(true);
                    }}
                    onDragLeave={() => setCreateDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setCreateDragOver(false);
                      onCreateFiles(e.dataTransfer.files, {
                        append: isMultiUpload && createImageFiles.length > 0,
                      });
                    }}
                    className={`relative rounded-xl border-2 border-dashed transition-colors ${
                      createDragOver
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                        : borderColor
                    } ${previewCreateImages.length ? "p-3" : "p-8"}`}
                  >
                    {previewCreateImages.length > 0 ? (
                      <div className="space-y-3">
                        <div
                          className={
                            isMultiUpload && previewCreateImages.length > 1
                              ? "grid grid-cols-2 gap-2"
                              : "flex justify-center"
                          }
                        >
                          {previewCreateImages.map(({ file, url }, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className={`relative group rounded-lg overflow-hidden ${
                                isMultiUpload && previewCreateImages.length > 1
                                  ? ""
                                  : `${createDisplaySpec.previewMaxWidth} w-full`
                              }`}
                            >
                              <img
                                src={url}
                                alt={file.name}
                                className={`w-full object-cover ${createDisplaySpec.aspectClass}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeCreateImageAt(index)}
                                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                title="Remove"
                              >
                                <X size={14} />
                              </button>
                              {isMultiUpload && (
                                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/55 text-white text-[10px] font-medium">
                                  {index + 1}/{previewCreateImages.length}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        {isMultiUpload && createImageFiles.length < MAX_BANNER_IMAGES && (
                          <label className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed ${borderColor} cursor-pointer text-sm ${textSecondary} hover:border-indigo-400 hover:text-indigo-600`}>
                            <Plus size={16} />
                            Add more images
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="sr-only"
                              onChange={(e) => {
                                onCreateFiles(e.target.files, { append: true });
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer text-center">
                        <Upload size={32} className={`mb-2 ${textSecondary}`} />
                        <span className={`text-sm font-medium ${textColor}`}>
                          {isMultiUpload
                            ? "Drop images or click to browse"
                            : "Drop image or click to browse"}
                        </span>
                        <span className={`text-xs mt-1 ${textSecondary}`}>
                          {`Best size: ${createDisplaySpec.width} × ${createDisplaySpec.height} px`}
                          {isMultiUpload ? ` · max ${MAX_BANNER_IMAGES} images` : ""}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple={isMultiUpload}
                          className="sr-only"
                          onChange={(e) => {
                            onCreateFiles(e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {isMultiUpload && createImageFiles.length > 0 && (
                    <p className={`text-xs mt-2 ${textSecondary}`}>
                      {createImageFiles.length} of {MAX_BANNER_IMAGES} selected · {createDisplaySpec.width}×{createDisplaySpec.height}px · uploading replaces current Home Second banners
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving || !createImageFiles.length}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 shadow-md"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  {isMultiUpload && createImageFiles.length > 1
                    ? `Upload ${createImageFiles.length} banners`
                    : "Upload banner"}
                </button>
              </form>
            </div>
          </div>

          {/* Banner grid */}
          <div className="xl:col-span-8">
            <div className={`${cardBg} rounded-2xl border ${borderColor} p-6 shadow-sm`}>
              <div className="flex flex-col gap-4 mb-6">
                <h2 className={`text-lg font-semibold ${textColor} flex items-center gap-2`}>
                  <Image size={20} className="text-indigo-500" />
                  All banners
                </h2>
                <div className="w-full overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
                  <div className="flex flex-nowrap sm:flex-wrap gap-2 min-w-max sm:min-w-0">
                    <FilterTab value="all" label="All" count={totalCount} />
                    <FilterTab value="home_first" label="Home First" count={pageStats.home_first} />
                    <FilterTab value="home_second" label="Home Second" count={pageStats.home_second} />
                    <FilterTab value="job" label="Job Listings" count={pageStats.job} />
                  </div>
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
                    const displaySpec = getBannerDisplaySpec(banner.page);
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
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <PageBadge page={banner.page} />
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/55 text-white tabular-nums">
                              {displaySpec.width}×{displaySpec.height}
                            </span>
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
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm px-4 py-6 sm:py-8"
          onClick={() => !saving && closeEditModal()}
        >
          <div className="min-h-full flex items-start sm:items-center justify-center">
            <div
              className={`${cardBg} w-full max-w-lg rounded-2xl border ${borderColor} shadow-2xl overflow-hidden max-h-[calc(100vh-3rem)] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${textColor}`}>Edit banner</h3>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={`p-1 rounded-lg ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  <X size={20} className={textSecondary} />
                </button>
              </div>
              <form onSubmit={handleUpdateBanner} className="p-6 space-y-5">
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>Banner placement</label>
                <PlacementSelector value={editPage} onChange={setEditPage} compact />
              </div>
              <div
                className={`rounded-xl border ${borderColor} px-3.5 py-3 ${
                  isDark ? "bg-indigo-950/30" : "bg-indigo-50/80"
                }`}
              >
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${textSecondary}`}>
                  On-site display size
                </p>
                <p className={`text-sm font-bold tabular-nums mt-0.5 ${textColor}`}>
                  Width {editDisplaySpec.width}px · Height {editDisplaySpec.height}px
                </p>
                <p className={`text-xs mt-0.5 ${textSecondary}`}>{editDisplaySpec.where}</p>
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
                <p className={`text-xs mt-1.5 ${textSecondary}`}>
                  {`Best size: ${editDisplaySpec.width} × ${editDisplaySpec.height} px`}
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src={previewEditImage || getBannerImage(editingBanner)}
                  alt="Banner preview"
                  className={`w-full ${editDisplaySpec.previewMaxWidth} ${editDisplaySpec.aspectClass} object-cover rounded-xl border ${borderColor}`}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
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
        </div>
      )}

      {/* View modal */}
      {viewBanner && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm px-4 py-6 sm:py-8"
          onClick={() => setViewBanner(null)}
        >
          <div className="min-h-full flex items-start sm:items-center justify-center">
            <div
              className={`${cardBg} w-full max-w-2xl rounded-2xl border ${borderColor} shadow-2xl max-h-[calc(100vh-3rem)] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
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
                  {
                    label: "Recommended size",
                    value: `${getBannerDisplaySpec(viewBanner.page).width} × ${getBannerDisplaySpec(viewBanner.page).height} px`,
                  },
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
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
