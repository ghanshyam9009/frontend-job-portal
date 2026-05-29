import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
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
  Sparkles
} from "lucide-react";

const ManageCandidates = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState("overview"); // overview | candidates | applications
  const [pendingAppsCount, setPendingAppsCount] = useState(0);
  const [recentPendingApplicationTasks, setRecentPendingApplicationTasks] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [candidateMeta, setCandidateMeta] = useState({
    page: 1,
    limit: 25,
    total: 0,
    total_pages: 1,
    showing: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const candidatesPerPage = 25;

  const applyCandidatesResponse = (response) => {
    setCandidates(response.candidates || []);
    setCandidateMeta({
      page: response.page ?? 1,
      limit: response.limit ?? candidatesPerPage,
      total: response.total ?? 0,
      total_pages: response.total_pages ?? 1,
      showing: response.showing ?? (response.candidates?.length ?? 0),
    });
  };

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
      const tasks = await adminService.getPendingJobs();
      const list = Array.isArray(tasks) ? tasks : [];
      const newApps = list.filter((t) => t.category === "newapplication");
      const pendingOnly = newApps.filter((t) => t.status === "pending");
      setPendingAppsCount(pendingOnly.length);
      const recent = [...pendingOnly]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.posted_date || 0) -
            new Date(a.created_at || a.posted_date || 0)
        )
        .slice(0, 5);
      setRecentPendingApplicationTasks(recent);
    } catch (error) {
      console.warn("Failed to fetch application tasks:", error);
      setPendingAppsCount(0);
      setRecentPendingApplicationTasks([]);
    }
  };

  const fetchCandidates = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      const status =
        statusFilter === "active" ? "Active" : undefined;

      const response = await adminService.getCandidates({
        page,
        limit: candidatesPerPage,
        ...(status && { status }),
      });
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
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage, candidatesPerPage]);

  const refreshDashboard = async () => {
    await Promise.all([fetchCandidates(currentPage), fetchApplicationSummary()]);
  };

  useEffect(() => {
    fetchApplicationSummary();
  }, []);

  useEffect(() => {
    fetchCandidates(currentPage);
  }, [fetchCandidates, currentPage]);

  // Helper function to filter by date
  const filterByDate = (candidate) => {
    if (!candidate.created_at) return false;

    const candidateDate = new Date(candidate.created_at);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return candidateDate.toDateString() === now.toDateString();

      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return candidateDate.toDateString() === yesterday.toDateString();

      case "last7days":
        const last7Days = new Date(now);
        last7Days.setDate(last7Days.getDate() - 7);
        return candidateDate >= last7Days;

      case "last30days":
        const last30Days = new Date(now);
        last30Days.setDate(last30Days.getDate() - 30);
        return candidateDate >= last30Days;

      case "thisMonth":
        return candidateDate.getMonth() === now.getMonth() &&
          candidateDate.getFullYear() === now.getFullYear();

      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return candidateDate >= lastMonth && candidateDate <= lastMonthEnd;

      case "thisYear":
        return candidateDate.getFullYear() === now.getFullYear();

      default:
        return true;
    }
  };

  const displayCandidates = useMemo(() => {
    let list = candidates;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          (c.full_name?.toLowerCase() || "").includes(q) ||
          (c.email?.toLowerCase() || "").includes(q)
      );
    }

    if (dateFilter !== "all") {
      list = list.filter(filterByDate);
    }

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case "nameAZ":
          return (a.full_name || "").localeCompare(b.full_name || "");
        case "nameZA":
          return (b.full_name || "").localeCompare(a.full_name || "");
        case "emailAZ":
          return (a.email || "").localeCompare(b.email || "");
        case "emailZA":
          return (b.email || "").localeCompare(a.email || "");
        case "newest":
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });
  }, [candidates, searchTerm, dateFilter, sortBy]);

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
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
    navigate(`/admin/candidates/profile/${candidate.email}`);
  };

  const handleViewApplications = (candidate) => {
    navigate(`/admin/candidates/applications/${candidate.user_id}`);
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
        await fetchCandidates(1);
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
  const currentCandidates = displayCandidates;
  const totalCandidates = candidateMeta.total;

  const recentCandidates = useMemo(() => candidates.slice(0, 5), [candidates]);

  const formatTaskDate = (task) => {
    const d = task?.created_at || task?.posted_date;
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 flex-shrink-0">
                        {c.logo ? (
                          <img src={c.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          getInitials(c.full_name)
                        )}
                      </div>
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
                {recentPendingApplicationTasks.map((task) => {
                  const matchedCandidate = task.student_id != null
                    ? candidates.find((c) => String(c.user_id) === String(task.student_id))
                    : null;

                  const candidateName = matchedCandidate?.full_name || `Student ID: ${task.student_id}`;

                  let displayTitle = task.title || `Job application${task.job_id ? ` · #${task.job_id}` : ""}`;
                  if (task.student_id != null && task.title) {
                    displayTitle = task.title
                      .replace(`Student ID: ${task.student_id}`, candidateName)
                      .replace(`Candidate id ${task.student_id}`, candidateName);
                  }

                  return (
                    <div
                      key={task.task_id || `${task.job_id}-${task.student_id}`}
                      onClick={() => matchedCandidate && handleViewApplications(matchedCandidate)}
                      className={`flex items-center justify-between px-2 py-2 rounded-lg transition-colors ${matchedCandidate ? "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group" : ""}`}
                      title={matchedCandidate ? "View Candidate Applications" : ""}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-300 flex-shrink-0 group-hover:scale-105 transition-transform">
                          {matchedCandidate?.logo ? (
                            <img src={matchedCandidate.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(matchedCandidate?.full_name || "Candidate")
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${textColor} truncate ${matchedCandidate ? "group-hover:text-indigo-600 dark:group-hover:text-indigo-400" : ""}`}>
                            {task.student_id != null ? (matchedCandidate?.full_name || `Candidate id ${task.student_id}`) : "New application"}
                          </p>
                          <p className={`text-xs ${textSecondary} truncate`}>
                            {task.student_id != null ? (matchedCandidate?.email || `Candidate id ${task.student_id}`) : "New application"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs ${textSecondary} flex-shrink-0 ml-2`}>{formatTaskDate(task)}</span>
                        {matchedCandidate && (
                          <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View Applications <ArrowRight size={10} />
                          </div>
                        )}
                      </div>
                    </div>
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
          <PendingJobApplications embedded />
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
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or email..."
                    className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  />
                </div>
              </div>

              {/* Status and Date Filters Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Status Filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusFilterChange("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                      }`}
                  >
                    All ({totalCandidates})
                  </button>
                  <button
                    onClick={() => handleStatusFilterChange("active")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'active'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                      }`}
                  >
                    Active
                  </button>
                </div>

                {/* Date Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <Calendar size={18} className={textSecondary} />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className={`px-4 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
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

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={18} className={textSecondary} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-4 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="nameAZ">Name (A-Z)</option>
                    <option value="nameZA">Name (Z-A)</option>
                    <option value="emailAZ">Email (A-Z)</option>
                    <option value="emailZA">Email (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="mb-4">
            <p className={`text-sm ${textSecondary}`}>
              Showing <span className={`font-semibold ${textColor}`}>{displayCandidates.length}</span> of{" "}
              <span className={`font-semibold ${textColor}`}>{candidateMeta.total}</span>{" "}
              {candidateMeta.total === 1 ? "candidate" : "candidates"}
              {dateFilter !== 'all' && (
                <span className="ml-2">
                  ({dateFilter.replace(/([A-Z])/g, ' $1').trim()})
                </span>
              )}
            </p>
          </div>

          {/* Empty State */}
          {displayCandidates.length === 0 && !loading && (
            <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
              <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Users size={32} className="text-blue-500" />
              </div>
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No candidates found</h3>
              <p className={`${textSecondary} mb-6`}>
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? "Try adjusting your filters" : "No candidates registered yet"}
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
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-blue-900/30">
                        {candidate.logo ? (
                          <img
                            src={candidate.logo}
                            alt={candidate.full_name || 'Candidate'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(candidate.full_name)}
                          </div>
                        )}
                      </div>
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