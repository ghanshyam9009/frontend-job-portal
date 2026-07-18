import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import adminApiClient from "../../services/adminApiClient";
import PendingJobApplications from "./PendingJobApplications";
import {
  Search,
  Users,
  Eye,
  Trash2,
  RefreshCw,
  Briefcase,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowUpDown,
  ArrowRight,
  FileText,
  Clock,
  Sparkles,
  CreditCard
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
};

const getCandidateAvatarUrl = (sources = {}) => {
  const {
    candidate = {},
    userDetails = {},
    studentProfile = {},
    registeredCandidate = null,
  } = sources;

  const url =
    candidate.profile_picture_url ||
    userDetails.logo ||
    userDetails.profile_picture_url ||
    userDetails.profile_image ||
    studentProfile.logo ||
    studentProfile.profile_picture_url ||
    registeredCandidate?.logo ||
    registeredCandidate?.profile_picture_url ||
    registeredCandidate?.profile_image ||
    null;

  return typeof url === "string" && url.trim() ? url.trim() : null;
};

const CandidateAvatar = ({
  name,
  imageUrl,
  variant = "blue",
  className = "w-9 h-9",
  hoverScale = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl) && !imageFailed;
  const palette =
    variant === "amber"
      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
      : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";

  return (
    <div
      className={`${className} rounded-full overflow-hidden ${palette} flex items-center justify-center text-xs font-bold flex-shrink-0 ${hoverScale ? "group-hover:scale-105 transition-transform" : ""}`}
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt={name || "Candidate"}
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};

const getDateRangeFromFilter = (filter) => {
  if (filter === "all") return {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const toISO = (d) => d.toISOString().split("T")[0];

  switch (filter) {
    case "today":
      return { date_from: toISO(today), date_to: toISO(today) };
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { date_from: toISO(yesterday), date_to: toISO(yesterday) };
    }
    case "last7days": {
      const from = new Date(today);
      from.setDate(from.getDate() - 7);
      return { date_from: toISO(from), date_to: toISO(today) };
    }
    case "last30days": {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      return { date_from: toISO(from), date_to: toISO(today) };
    }
    case "thisMonth": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { date_from: toISO(from), date_to: toISO(today) };
    }
    case "lastMonth": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { date_from: toISO(from), date_to: toISO(to) };
    }
    case "thisYear": {
      const from = new Date(now.getFullYear(), 0, 1);
      return { date_from: toISO(from), date_to: toISO(today) };
    }
    default:
      return {};
  }
};

const ManageCandidates = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState(() => location.state?.returnViewMode || "overview"); // overview | candidates | applications
  const [pendingAppsCount, setPendingAppsCount] = useState(0);
  const [recentPendingApplicationTasks, setRecentPendingApplicationTasks] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [overviewTotal, setOverviewTotal] = useState(0);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [candidateMeta, setCandidateMeta] = useState({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
    showing: 0,
    filters: { plans: [] },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [candidatesPerPage, setCandidatesPerPage] = useState(25);

  const applyCandidatesResponse = (response) => {
    setCandidates(response.candidates || []);
    setCandidateMeta({
      page: response.page ?? 1,
      limit: response.limit ?? candidatesPerPage,
      total: response.total ?? 0,
      total_pages: response.total_pages ?? 1,
      showing: response.showing ?? (response.candidates?.length ?? 0),
      filters: response.filters ?? { plans: [] },
    });
  };

  const availablePlans = candidateMeta.filters?.plans ?? [];

  const getCandidateCity = (candidate) =>
    candidate?.address?.city?.trim() || null;

  const getMembershipBadge = (candidate) => {
    if (candidate.plan_name) {
      return { label: candidate.plan_name, premium: Boolean(candidate.premium_user) };
    }
    if (candidate.premium_user || candidate.plan_id) {
      const isPremium =
        candidate.plan_id === "premium" ||
        (candidate.membership_type || "").toUpperCase() === "PREMIUM";
      return { label: isPremium ? "Premium" : "Basic", premium: true };
    }
    return { label: "Free", premium: false };
  };

  const parseSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills.filter(Boolean);
    if (typeof skills === "string" && skills.trim()) {
      return skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const fetchApplicationSummary = async () => {
    try {
      const response = await adminApiClient.get("/admin/applied-candidates", {
        params: { page: 1, role: "RECRUITER", sort: "newest" },
      });
      const payload = response.data ?? {};
      const recent = Array.isArray(payload.recent_candidates) ? payload.recent_candidates : [];
      setRecentPendingApplicationTasks(recent.slice(0, 5));
      setPendingAppsCount(Number(payload.total) || 0);
    } catch (error) {
      console.warn("Failed to fetch application tasks:", error);
      setPendingAppsCount(0);
      setRecentPendingApplicationTasks([]);
    }
  };

  const fetchOverviewCandidates = async () => {
    try {
      const response = await adminService.getCandidates({
        page: 1,
        limit: 5,
        sort: "newest",
      });
      setOverviewTotal(response.total ?? 0);
      setRecentCandidates((response.candidates || []).slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch overview candidates:", error);
      setOverviewTotal(0);
      setRecentCandidates([]);
    }
  };

  const fetchCandidates = useCallback(async (page = currentPage) => {
    try {
      setListLoading(true);

      const params = {
        page,
        limit: candidatesPerPage,
        sort: sortBy,
        ...getDateRangeFromFilter(dateFilter),
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (planFilter !== "all") params.plan_id = planFilter;

      const response = await adminService.getCandidates(params);
      applyCandidatesResponse(response);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      setCandidates([]);
      setCandidateMeta({
        page: 1,
        limit: candidatesPerPage,
        total: 0,
        total_pages: 1,
        showing: 0,
        filters: { plans: [] },
      });
    } finally {
      setListLoading(false);
      setLoading(false);
    }
  }, [debouncedSearch, planFilter, dateFilter, sortBy, currentPage, candidatesPerPage]);

  const refreshDashboard = async () => {
    setLoading(true);
    await Promise.all([fetchOverviewCandidates(), fetchCandidates(currentPage), fetchApplicationSummary()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplicationSummary();
    fetchOverviewCandidates().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCandidates(currentPage);
  }, [fetchCandidates, currentPage]);

  const handlePlanFilterChange = (value) => {
    setPlanFilter(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleLimitChange = (value) => {
    setCandidatesPerPage(Number(value));
    setCurrentPage(1);
  };

  const getPlanFilterLabel = () => {
    if (planFilter === "all") return null;
    const plan = availablePlans.find((p) => p.plan_id === planFilter);
    return plan?.name || planFilter;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    }
  };

  const handleViewDetails = (candidate) => {
    navigate(`/admin/candidates/profile/${candidate.email}`, {
      state: { returnViewMode: "candidates" },
    });
  };

  const handleViewApplications = (candidate) => {
    navigate(`/admin/candidates/applications/${candidate.user_id}`, {
      state: { returnViewMode: "candidates" },
    });
  };

  const handleBlockStudent = async (candidate) => {
    if (!candidate || !candidate.email) {
      setMessage({ type: 'error', text: 'Invalid candidate data' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    const confirmBlock = window.confirm(
      `Are you sure you want to block ${candidate.full_name || "this candidate"}? This will remove them from the system.`
    );

    if (!confirmBlock) return;

    try {
      setActionLoading(candidate.user_id);
      await adminService.blockStudent(candidate.email);

      if (currentPage === 1) {
        await Promise.all([fetchCandidates(1), fetchOverviewCandidates()]);
      } else {
        setCurrentPage(1);
      }

      setMessage({ type: 'success', text: `${candidate.full_name || "Candidate"} has been blocked and removed from the system.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error blocking student:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to block student. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = candidateMeta.total_pages;
  const currentCandidates = candidates;
  const totalCandidates = overviewTotal;
  const listTotal = candidateMeta.total;
  const listShowing = candidateMeta.showing ?? candidates.length;

  const getAppliedItemDate = (item) =>
    item?.applied_date || item?.task?.created_at || item?.task_details?.created_at;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const SkeletonCard = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-gray-300 dark:border-gray-600 animate-pulse`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
        </div>
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );

  const SkeletonItem = () => (
    <div className="flex items-center justify-between p-3 rounded-lg animate-pulse">
      <div className="flex items-center flex-1">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="ml-3 flex-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor}`}>
        <div className={`${cardBg} border-b ${borderColor} shadow-sm sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Manage Candidates</h1>
                <p className={`text-sm ${textSecondary} mt-1 flex items-center gap-2`}>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 inline-block" />
                  Loading...
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <SkeletonItem /><SkeletonItem /><SkeletonItem />
              </div>
            </div>
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <SkeletonItem /><SkeletonItem /><SkeletonItem />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {(viewMode === "overview" || viewMode === "candidates") && (
        <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Manage Candidates</h1>
                <p className={`text-sm ${textSecondary} mt-1`}>View and manage all registered candidates</p>
              </div>
              <button
                type="button"
                onClick={refreshDashboard}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {viewMode === "overview" && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
                <button
                  type="button"
                  onClick={() => setViewMode("candidates")}
                  className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer text-left w-full block`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${textSecondary} text-sm font-medium`}>Total candidates</p>
                        <h3 className={`text-3xl font-bold ${textColor} mt-2`}>{totalCandidates}</h3>
                      <p className="text-green-600 dark:text-green-400 text-sm mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                        Registered seekers
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Users className="text-blue-500" size={28} />
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("applications")}
                  className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-purple-500 transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer text-left w-full block`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${textSecondary} text-sm font-medium`}>Applied candidates</p>
                      <h3 className={`text-3xl font-bold ${textColor} mt-2`}>{pendingAppsCount}</h3>
                      <p className="text-purple-600 dark:text-purple-400 text-sm mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" />
                        Pending admin review
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <FileText className="text-purple-500" size={28} />
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "overview" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                  <Users className="text-blue-500" size={20} />
                  Recent candidates
                </h3>
                <button
                  type="button"
                  onClick={() => setViewMode("candidates")}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                {recentCandidates.map((c) => (
                  <button
                    type="button"
                    key={c.user_id || c.email}
                    onClick={() => handleViewDetails(c)}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CandidateAvatar
                        name={c.full_name}
                        imageUrl={getCandidateAvatarUrl({ registeredCandidate: c, userDetails: c })}
                      />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${textColor} truncate`}>{c.full_name || "Candidate"}</p>
                        <p className={`text-xs ${textSecondary} truncate`}>{c.email || "N/A"}</p>
                      </div>
                    </div>
                    <span className={`text-xs ${textSecondary}`}>{formatDate(c.created_at)}</span>
                  </button>
                ))}
                {recentCandidates.length === 0 && (
                  <p className={`text-xs ${textSecondary}`}>No candidates yet.</p>
                )}
              </div>
            </div>

            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                  <Clock className="text-amber-500" size={20} />
                  Recent application tasks
                </h3>
                <button
                  type="button"
                  onClick={() => setViewMode("applications")}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                {recentPendingApplicationTasks.map((item) => {
                  const candidate = item.candidate || {};
                  const job = item.job || {};
                  const userDetails = item.user_details || {};
                  const userId = item.user_id || candidate.student_id || userDetails.user_id;
                  const candidateName = candidate.name || userDetails.full_name || "Candidate";
                  const candidateEmail = candidate.email || userDetails.email || "";
                  const jobTitle = job.job_title || item.job_details?.job_title || "Job application";
                  const companyName = job.company_name || item.job_details?.company_name;
                  const matchedCandidate = userId
                    ? candidates.find((c) => String(c.user_id) === String(userId))
                    : null;
                  const avatarUrl = getCandidateAvatarUrl({
                    candidate,
                    userDetails,
                    studentProfile: item.application_details?.student_profile,
                    registeredCandidate: matchedCandidate,
                  });
                  const subtitle = companyName ? `${jobTitle} · ${companyName}` : jobTitle;

                  return (
                    <button
                      type="button"
                      key={item.applied_id || item.application_id || item.task?.task_id}
                      onClick={() => userId && handleViewApplications({ user_id: userId, email: candidateEmail, full_name: candidateName })}
                      className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors text-left group"
                      title="View candidate applications"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <CandidateAvatar
                          name={candidateName}
                          imageUrl={avatarUrl}
                          variant="amber"
                          hoverScale
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${textColor} truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}>
                            {candidateName}
                          </p>
                          <p className={`text-xs ${textSecondary} truncate`}>
                            {subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                        <span className={`text-xs ${textSecondary}`}>{formatDate(getAppliedItemDate(item))}</span>
                        <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View Applications <ArrowRight size={10} />
                        </div>
                      </div>
                    </button>
                  );
                })}
                {recentPendingApplicationTasks.length === 0 && (
                  <p className={`text-xs ${textSecondary}`}>No pending applications in queue.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "applications" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewMode("overview")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              ← Back to overview
            </button>
            <h2 className={`text-base font-bold ${textColor}`}>Applied candidates</h2>
          </div>
          <PendingJobApplications embedded role="recruiter" />
        </div>
      )}

      {viewMode === "candidates" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewMode("overview")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              ← Back to overview
            </button>
            <h2 className={`text-base font-bold ${textColor}`}>Candidates list</h2>
          </div>
          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 rounded-lg p-4 ${message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
              }`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <p className="font-medium">{message.text}</p>
              </div>
            </div>
          )}

          {/* Filters on Top */}
          <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary} pointer-events-none`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                />
              </div>

              <div className="relative min-w-0">
                <CreditCard size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary} pointer-events-none`} />
                <select
                  value={planFilter}
                  onChange={(e) => handlePlanFilterChange(e.target.value)}
                  className={`w-full pl-10 pr-8 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer appearance-none`}
                >
                  <option value="all">All Plans</option>
                  {availablePlans.map((plan) => (
                    <option key={plan.plan_id} value={plan.plan_id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-0">
                <Calendar size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary} pointer-events-none`} />
                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  className={`w-full pl-10 pr-8 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer appearance-none`}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                </select>
              </div>

              <div className="relative min-w-0">
                <ArrowUpDown size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary} pointer-events-none`} />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className={`w-full pl-10 pr-8 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer appearance-none`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="nameAZ">Name (A-Z)</option>
                  <option value="nameZA">Name (Z-A)</option>
                  <option value="emailAZ">Email (A-Z)</option>
                  <option value="emailZA">Email (Z-A)</option>
                </select>
              </div>

              <div className="relative min-w-0">
                <Users size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary} pointer-events-none`} />
                <select
                  value={candidatesPerPage}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  aria-label="Records per page"
                  className={`w-full pl-10 pr-8 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer appearance-none`}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className={`text-sm ${textSecondary}`}>
              Showing <span className={`font-semibold ${textColor}`}>{listShowing}</span> of{" "}
              <span className={`font-semibold ${textColor}`}>{listTotal}</span>{" "}
              {listTotal === 1 ? "candidate" : "candidates"}
              <span className="ml-2">· {candidatesPerPage} / page</span>
              {getPlanFilterLabel() && (
                <span className="ml-2">· Plan: {getPlanFilterLabel()}</span>
              )}
              {dateFilter !== 'all' && (
                <span className="ml-2">
                  · {dateFilter.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              )}
              {listLoading && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 inline-block" />
                  Updating...
                </span>
              )}
            </p>
          </div>

          {/* Empty State */}
          {candidates.length === 0 && !listLoading && (
            <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
              <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Users size={32} className="text-blue-500" />
              </div>
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No candidates found</h3>
              <p className={`${textSecondary} mb-6`}>
                {searchTerm || planFilter !== 'all' || dateFilter !== 'all' ? "Try adjusting your filters" : "No candidates registered yet"}
              </p>
            </div>
          )}

          {/* Candidates - Compact Cards */}
          <div className="space-y-3">
            {currentCandidates.map((candidate) => {
              const membership = getMembershipBadge(candidate);
              const skills = parseSkills(candidate.skills);
              const city = getCandidateCity(candidate);

              return (
              <div
                key={candidate.user_id || candidate.email}
                className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
              >
                <div className="p-3">
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <CandidateAvatar
                        name={candidate.full_name}
                        imageUrl={getCandidateAvatarUrl({ registeredCandidate: candidate, userDetails: candidate })}
                        className="w-10 h-10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm font-bold ${textColor} truncate leading-tight`}>
                            {candidate.full_name || 'N/A'}
                          </h3>
                          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm flex items-center gap-1.5 transition-all ${
                            membership.premium
                              ? (candidate.plan_id === 'premium'
                                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-300 shadow-amber-200/50'
                                  : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-300 shadow-blue-200/50'
                                )
                              : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                          }`}>
                            {membership.premium ? <Sparkles size={11} className="text-white" /> : null}
                            {membership.label}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs ${textSecondary} truncate`}>
                            {candidate.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(candidate.status)}`} style={{ fontSize: '0.7rem' }}>
                      {candidate.status || 'Active'}
                    </span>
                  </div>

                  {/* Candidate Details */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {candidate.phone_number && (
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                        <Phone size={11} />
                        {candidate.phone_number}
                      </span>
                    )}
                    {city && (
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                        <MapPin size={11} />
                        {city}
                      </span>
                    )}
                    {candidate.experienceLevel && (
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                        <Briefcase size={11} />
                        {candidate.experienceLevel}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                      Joined: {formatDate(candidate.created_at)}
                    </span>
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-0.5 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-full text-xs font-medium`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className={`px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'} rounded-full text-xs font-medium`} style={{ fontSize: '0.65rem' }}>
                          +{skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleViewDetails(candidate)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                      style={{ fontSize: '0.7rem' }}
                    >
                      <Eye size={13} />
                      View Profile
                    </button>
                    <button
                      onClick={() => handleViewApplications(candidate)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      <Briefcase size={13} />
                      Applications
                    </button>
                    <button
                      onClick={() => handleBlockStudent(candidate)}
                      disabled={actionLoading === candidate.user_id}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 border border-red-300 dark:border-red-800 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      <Trash2 size={13} />
                      {actionLoading === candidate.user_id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
              >
                Previous
              </button>
              <span className={`text-sm ${textColor}`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;