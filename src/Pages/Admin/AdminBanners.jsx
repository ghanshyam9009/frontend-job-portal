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
    hint: `Home page — lower section (adds images, up to ${MAX_BANNER_IMAGES})`,
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

  const clearCreateForm = ({ keepPage = false } = {}) => {
    if (!keepPage) setCreatePage("home_first");
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

  // Live banners for the selected placement (so left panel can show/remove them)
  const [placementBanners, setPlacementBanners] = useState([]);
  const [placementLoading, setPlacementLoading] = useState(false);

  const fetchPlacementBanners = async (page) => {
    try {
      setPlacementLoading(true);
      const response = await adminBannerService.getAllBanners(page);
      setPlacementBanners(resolveBannerList(response).banners);
    } catch {
      setPlacementBanners([]);
    } finally {
      setPlacementLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementBanners(createPage);
  }, [createPage]);

  const existingHomeSecondCount = isMultiUpload
    ? placementBanners.length
    : pageStats.home_second;
  const homeSecondSlotsLeft = Math.max(0, MAX_BANNER_IMAGES - existingHomeSecondCount);

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!createImageFiles.length) {
      setError("Please choose at least one image to upload.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (isMultiUpload) {
        const liveCount = placementBanners.length;
        const remainingSlots = MAX_BANNER_IMAGES - liveCount;
        if (remainingSlots <= 0) {
          setError(
            `Home Second already has ${MAX_BANNER_IMAGES} banners. Delete some before uploading more.`
          );
          return;
        }
        if (createImageFiles.length > remainingSlots) {
          setError(
            `Home Second can have at most ${MAX_BANNER_IMAGES} banners. You can add ${remainingSlots} more.`
          );
          return;
        }
      }

      const result = await adminBannerService.uploadBanner({
        page: createPage,
        imageFiles: createImageFiles,
        // Production API replaces the page set — re-send current images so they stay
        keepExisting: isMultiUpload,
        existingImageUrls: isMultiUpload
          ? placementBanners.map(getBannerImage).filter(Boolean)
          : [],
      });
      const addedCount = createImageFiles.length;
      const total =
        result?.total ??
        (isMultiUpload
          ? placementBanners.length + addedCount
          : result?.count ?? addedCount);
      setMessage(
        isMultiUpload
          ? `${addedCount} image${addedCount === 1 ? "" : "s"} added to Home Second (${Math.min(total, MAX_BANNER_IMAGES)} total).`
          : "Banner uploaded successfully."
      );
      clearCreateForm({ keepPage: isMultiUpload });
      await Promise.all([fetchBanners(), fetchPlacementBanners(createPage)]);
    } catch (err) {
      setError(err?.error || err?.message || "Failed to upload banner.");
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
      await Promise.all([fetchBanners(), fetchPlacementBanners(createPage)]);
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
      await Promise.all([fetchBanners(), fetchPlacementBanners(createPage)]);
    } catch (err) {
      setError(err?.error || err?.message || "Failed to delete banner.");
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
      // Cap selection so existing live banners + new files stay within max
      const maxNew = Math.max(0, MAX_BANNER_IMAGES - existingHomeSecondCount);
      const merged = append ? [...prev, ...images] : images;
      const unique = [];
      const seen = new Set();
      for (const f of merged) {
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(f);
      }
      return unique.slice(0, maxNew);
    });

    if (allowsMultipleImages(createPage)) {
      const maxNew = Math.max(0, MAX_BANNER_IMAGES - existingHomeSecondCount);
      const currentCount = append ? createImageFiles.length : 0;
      if (maxNew <= 0) {
        setError(
          `Home Second already has ${MAX_BANNER_IMAGES} banners. Delete some before uploading more.`
        );
      } else if (currentCount + images.length > maxNew) {
        setError(
          `You can add at most ${maxNew} more image${maxNew === 1 ? "" : "s"} (${MAX_BANNER_IMAGES} total). Extra files were ignored.`
        );
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

    if (compact) {
      const option = options[0];
      if (!option) return null;
      const Icon = option.icon;
      const spec = BANNER_DISPLAY_SPECS[option.value];
      return (
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border ${borderColor} ${
            isDark ? "bg-gray-900/40" : "bg-slate-50"
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${textColor}`}>{option.label}</p>
            <p className={`text-xs ${textSecondary}`}>
              {spec ? `${spec.width}×${spec.height}px` : option.hint}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Banner placement">
        {options.map(({ value: optionValue, label, icon: Icon, hint }) => {
          const selected = value === optionValue;
          const spec = BANNER_DISPLAY_SPECS[optionValue];
          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange?.(optionValue)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                selected
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/30 dark:bg-indigo-950/40 dark:border-indigo-400"
                  : `${borderColor} ${isDark ? "bg-gray-900/30 hover:bg-gray-800/60" : "bg-white hover:bg-slate-50"}`
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  selected
                    ? "bg-indigo-600 text-white"
                    : isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold truncate ${selected ? "text-indigo-800 dark:text-indigo-200" : textColor}`}>
                  {label}
                </span>
                <span className={`block text-[11px] truncate ${textSecondary}`}>
                  {spec ? `${spec.width}×${spec.height} · ${spec.where}` : hint}
                </span>
              </span>
              <span
                className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                  selected
                    ? "border-indigo-600 bg-indigo-600"
                    : isDark
                      ? "border-gray-500"
                      : "border-gray-300"
                }`}
              >
                {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
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
      ? "bg-sky-500/90 text-white"
      : isFirst
        ? "bg-emerald-500/90 text-white"
        : "bg-teal-500/90 text-white";
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-sm ${badgeClass}`}>
        <BadgeIcon size={11} />
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
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          active
            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
            : `${textSecondary} ${isDark ? "hover:bg-gray-700 hover:text-white" : "hover:bg-slate-100 hover:text-slate-900"}`
        }`}
      >
        <span>{label}</span>
        {count !== undefined && (
          <span
            className={`min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-[11px] font-semibold text-center ${
              active
                ? "bg-white/20 text-white"
                : isDark
                  ? "bg-gray-700 text-gray-300"
                  : "bg-slate-200/80 text-slate-700"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-[#f4f6f9]"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl sm:text-[1.75rem] font-bold tracking-tight ${textColor}`}>
              Banners
            </h1>
            <p className={`text-sm mt-1 ${textSecondary}`}>
              Upload and manage Home & Job page banners
            </p>
          </div>
          <button
            type="button"
            onClick={fetchBanners}
            disabled={loading || saving}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors shrink-0 disabled:opacity-50 ${
              isDark
                ? "border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${
              isDark ? "border-red-800 bg-red-950/50 text-red-300" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <X size={16} className="shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError("")} className="opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}
        {message && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${
              isDark ? "border-emerald-800 bg-emerald-950/50 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <Check size={16} />
            {message}
          </div>
        )}

        {/* Stats — clickable filters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "All", value: totalCount, filter: "all", icon: Image, accent: "indigo" },
            { label: "Home First", value: pageStats.home_first, filter: "home_first", icon: ChevronUp, accent: "emerald" },
            { label: "Home Second", value: pageStats.home_second, filter: "home_second", icon: ChevronDown, accent: "teal" },
            { label: "Job Page", value: pageStats.job, filter: "job", icon: Briefcase, accent: "sky" },
          ].map(({ label, value, filter, icon: Icon, accent }) => {
            const active = pageFilter === filter;
            const accentMap = {
              indigo: active ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "",
              emerald: active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "",
              teal: active ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40" : "",
              sky: active ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40" : "",
            };
            const iconMap = {
              indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300",
              emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300",
              teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300",
              sky: "bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300",
            };
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setPageFilter(filter)}
                className={`text-left rounded-2xl border p-4 shadow-sm transition-all ${cardBg} ${
                  active ? accentMap[accent] : `${borderColor} hover:border-slate-300 dark:hover:border-gray-600`
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-medium ${textSecondary}`}>{label}</p>
                  <span className={`p-1.5 rounded-lg ${iconMap[accent]}`}>
                    <Icon size={14} />
                  </span>
                </div>
                <p className={`text-2xl font-bold mt-2 tabular-nums ${textColor}`}>{value}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Upload panel */}
          <div className="xl:col-span-4">
            <div className={`${cardBg} rounded-2xl border ${borderColor} shadow-sm sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto`}>
              <div className={`px-5 py-4 border-b ${borderColor} sticky top-0 z-10 ${cardBg}`}>
                <h2 className={`text-base font-semibold flex items-center gap-2 ${textColor}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <Plus size={16} />
                  </span>
                  Upload banner
                </h2>
                <p className={`text-xs mt-1.5 ml-10 ${textSecondary}`}>
                  JPG, PNG or WebP · match the size below
                </p>
              </div>

              <form onSubmit={handleCreateBanner} className="p-5 space-y-5">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${textSecondary}`}>
                    Placement
                  </label>
                  <PlacementSelector value={createPage} onChange={handleCreatePageChange} />
                </div>

                <div
                  className={`rounded-xl px-3.5 py-3 border ${
                    isDark ? "border-indigo-800/50 bg-indigo-950/25" : "border-indigo-100 bg-indigo-50/70"
                  }`}
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>
                    Display size
                  </p>
                  <p className={`text-sm font-bold tabular-nums mt-0.5 ${textColor}`}>
                    {createDisplaySpec.width} × {createDisplaySpec.height} px
                  </p>
                  <p className={`text-xs mt-1 ${textSecondary}`}>{createDisplaySpec.where}</p>
                </div>

                {/* Existing + new images for Home Second */}
                {isMultiUpload ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <label className={`text-xs font-semibold uppercase tracking-wide ${textSecondary}`}>
                          Current · {placementBanners.length}/{MAX_BANNER_IMAGES}
                        </label>
                        {placementLoading && (
                          <Loader2 size={14} className={`animate-spin ${textSecondary}`} />
                        )}
                      </div>

                      {placementBanners.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {placementBanners.map((banner, index) => {
                            const imageUrl = getBannerImage(banner);
                            const bannerId = getBannerId(banner);
                            return (
                              <div
                                key={bannerId || index}
                                className={`relative rounded-xl overflow-hidden border ${borderColor} bg-slate-100 dark:bg-gray-900`}
                              >
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={`Current banner ${index + 1}`}
                                    className={`w-full object-cover ${createDisplaySpec.aspectClass}`}
                                  />
                                ) : (
                                  <div
                                    className={`w-full flex items-center justify-center ${createDisplaySpec.aspectClass}`}
                                  >
                                    <ImageOff size={18} className={textSecondary} />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBanner(banner)}
                                  disabled={saving}
                                  className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-red-500 text-white shadow hover:bg-red-600 disabled:opacity-50"
                                  title="Remove"
                                >
                                  <Trash2 size={13} />
                                </button>
                                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium">
                                  {index + 1}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        !placementLoading && (
                          <div
                            className={`rounded-xl border border-dashed px-3 py-6 text-center text-xs ${borderColor} ${textSecondary}`}
                          >
                            No images yet — add below
                          </div>
                        )
                      )}
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${textSecondary}`}>
                        Add new · {homeSecondSlotsLeft} left
                      </label>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (homeSecondSlotsLeft > 0) setCreateDragOver(true);
                        }}
                        onDragLeave={() => setCreateDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setCreateDragOver(false);
                          if (homeSecondSlotsLeft <= 0) return;
                          onCreateFiles(e.dataTransfer.files, {
                            append: createImageFiles.length > 0,
                          });
                        }}
                        className={`relative rounded-xl border-2 border-dashed transition-all ${
                          createDragOver
                            ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20 scale-[1.01]"
                            : borderColor
                        } ${previewCreateImages.length ? "p-2.5" : "p-5"}`}
                      >
                        {previewCreateImages.length > 0 ? (
                          <div className="space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              {previewCreateImages.map(({ file, url }, index) => (
                                <div
                                  key={`${file.name}-${index}`}
                                  className="relative rounded-lg overflow-hidden"
                                >
                                  <img
                                    src={url}
                                    alt={file.name}
                                    className={`w-full object-cover ${createDisplaySpec.aspectClass}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeCreateImageAt(index)}
                                    className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-white"
                                    title="Remove"
                                  >
                                    <X size={13} />
                                  </button>
                                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-medium">
                                    New
                                  </span>
                                </div>
                              ))}
                            </div>
                            {createImageFiles.length < homeSecondSlotsLeft && (
                              <label
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed cursor-pointer text-sm transition-colors ${borderColor} ${textSecondary} hover:border-indigo-400 hover:text-indigo-600`}
                              >
                                <Plus size={15} />
                                Add more
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
                        ) : homeSecondSlotsLeft > 0 ? (
                          <label className="flex flex-col items-center cursor-pointer text-center">
                            <span className={`mb-2 flex h-11 w-11 items-center justify-center rounded-full ${isDark ? "bg-gray-700" : "bg-slate-100"}`}>
                              <Upload size={18} className={textSecondary} />
                            </span>
                            <span className={`text-sm font-medium ${textColor}`}>
                              Drop or browse
                            </span>
                            <span className={`text-[11px] mt-1 ${textSecondary}`}>
                              {createDisplaySpec.width}×{createDisplaySpec.height}px
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="sr-only"
                              onChange={(e) => {
                                onCreateFiles(e.target.files);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        ) : (
                          <p className={`text-xs text-center ${textSecondary}`}>
                            Max {MAX_BANNER_IMAGES} reached. Remove one to add more.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${textSecondary}`}>
                      Image
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
                        onCreateFiles(e.dataTransfer.files);
                      }}
                      className={`relative rounded-xl border-2 border-dashed transition-all ${
                        createDragOver
                          ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20"
                          : borderColor
                      } ${previewCreateImages.length ? "p-2.5" : "p-6"}`}
                    >
                      {previewCreateImages.length > 0 ? (
                        <div className="flex justify-center">
                          <div
                            className={`relative rounded-lg overflow-hidden ${createDisplaySpec.previewMaxWidth} w-full`}
                          >
                            <img
                              src={previewCreateImages[0].url}
                              alt={previewCreateImages[0].file.name}
                              className={`w-full object-cover ${createDisplaySpec.aspectClass}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeCreateImageAt(0)}
                              className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-white"
                              title="Remove"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer text-center">
                          <span className={`mb-2 flex h-11 w-11 items-center justify-center rounded-full ${isDark ? "bg-gray-700" : "bg-slate-100"}`}>
                            <Upload size={18} className={textSecondary} />
                          </span>
                          <span className={`text-sm font-medium ${textColor}`}>
                            Drop or browse
                          </span>
                          <span className={`text-[11px] mt-1 ${textSecondary}`}>
                            {createDisplaySpec.width}×{createDisplaySpec.height}px
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              onCreateFiles(e.target.files);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || !createImageFiles.length}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-45 font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 transition-colors"
                >
                  {saving ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}
                  {isMultiUpload && createImageFiles.length > 1
                    ? `Add ${createImageFiles.length} images`
                    : isMultiUpload
                      ? "Add image"
                      : "Upload banner"}
                </button>
              </form>
            </div>
          </div>

          {/* Banner grid */}
          <div className="xl:col-span-8">
            <div className={`${cardBg} rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <div className={`px-5 py-4 border-b ${borderColor} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
                <h2 className={`text-base font-semibold ${textColor}`}>
                  Library
                  <span className={`ml-2 text-sm font-normal ${textSecondary}`}>
                    {loading ? "…" : `${banners.length} shown`}
                  </span>
                </h2>
                <div
                  className={`inline-flex flex-wrap gap-1 p-1 rounded-full ${
                    isDark ? "bg-gray-900/60" : "bg-slate-100"
                  }`}
                >
                  <FilterTab value="all" label="All" count={totalCount} />
                  <FilterTab value="home_first" label="First" count={pageStats.home_first} />
                  <FilterTab value="home_second" label="Second" count={pageStats.home_second} />
                  <FilterTab value="job" label="Jobs" count={pageStats.job} />
                </div>
              </div>

              <div className="p-5">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`rounded-2xl border ${borderColor} overflow-hidden animate-pulse`}
                      >
                        <div className={`aspect-[16/9] ${isDark ? "bg-gray-700" : "bg-slate-200"}`} />
                        <div className="p-3 space-y-2">
                          <div className={`h-3 w-20 rounded ${isDark ? "bg-gray-700" : "bg-slate-200"}`} />
                          <div className={`h-3 w-32 rounded ${isDark ? "bg-gray-700" : "bg-slate-200"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : banners.length === 0 ? (
                  <div className={`text-center py-16 rounded-2xl border border-dashed ${borderColor}`}>
                    <span className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${isDark ? "bg-gray-800" : "bg-slate-100"}`}>
                      <ImageOff size={28} className={textSecondary} />
                    </span>
                    <p className={`font-semibold ${textColor}`}>No banners here</p>
                    <p className={`text-sm mt-1 max-w-xs mx-auto ${textSecondary}`}>
                      {pageFilter === "all"
                        ? "Use the upload panel to add your first banner."
                        : `Nothing for ${pageLabel(pageFilter)} yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map((banner) => {
                      const bannerId = getBannerId(banner);
                      const imageUrl = getBannerImage(banner);
                      const displaySpec = getBannerDisplaySpec(banner.page);
                      return (
                        <article
                          key={bannerId}
                          className={`group rounded-2xl border overflow-hidden transition-all ${borderColor} ${
                            isDark
                              ? "bg-gray-900/40 hover:border-indigo-500/40"
                              : "bg-white hover:border-indigo-300 hover:shadow-md"
                          }`}
                        >
                          <div className="relative aspect-[16/9] bg-slate-100 dark:bg-gray-950">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={`${pageLabel(banner.page)} banner`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageOff className={textSecondary} size={28} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                              <PageBadge page={banner.page} />
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/50 text-white tabular-nums">
                                {displaySpec.width}×{displaySpec.height}
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className={`text-[11px] font-mono truncate ${textSecondary}`} title={bannerId}>
                                  {shortId(bannerId)}
                                </p>
                                <p className={`flex items-center gap-1 mt-1 text-xs ${textSecondary}`}>
                                  <Calendar size={11} />
                                  {formatDate(banner.updated_at || banner.created_at)}
                                </p>
                              </div>
                            </div>

                            <div className={`mt-3 flex items-center gap-1.5 pt-3 border-t ${borderColor}`}>
                              <button
                                type="button"
                                onClick={() => handleViewBanner(banner)}
                                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                              >
                                <Eye size={13} />
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(banner)}
                                className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                }`}
                              >
                                <Edit size={13} />
                                Edit
                              </button>
                              {imageUrl && (
                                <a
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`p-2 rounded-lg transition-colors ${
                                    isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  }`}
                                  title="Open image"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteBanner(banner)}
                                disabled={saving}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70 disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
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
