import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import {
  Building2,
  Edit,
  CircleX,
  Trash2,
  Search,
  RefreshCw,
  Plus,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  ArrowUpDown,
  Users,
} from "lucide-react";

/** API sends `job_logo_url`; fallbacks align with JobCard / AdminJobReports */
const getJobLogoUrl = (job) =>
  job?.job_logo_url ||
  job?.job_logo ||
  job?.company_logo ||
  job?.companyLogo ||
  job?.logo ||
  null;

const getCompanyInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const toDateParam = (date) => date.toISOString().split("T")[0];

const getDateRangeParams = (dateFilter) => {
  const now = new Date();

  switch (dateFilter) {
    case "today":
      return { date_from: toDateParam(now), date_to: toDateParam(now) };
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return { date_from: toDateParam(yesterday), date_to: toDateParam(yesterday) };
    }
    case "last7days": {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return { date_from: toDateParam(from), date_to: toDateParam(now) };
    }
    case "last30days": {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      return { date_from: toDateParam(from), date_to: toDateParam(now) };
    }
    case "thisMonth": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { date_from: toDateParam(from), date_to: toDateParam(now) };
    }
    case "lastMonth": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { date_from: toDateParam(from), date_to: toDateParam(to) };
    }
    case "thisYear": {
      const from = new Date(now.getFullYear(), 0, 1);
      return { date_from: toDateParam(from), date_to: toDateParam(now) };
    }
    default:
      return {};
  }
};

const AdminJobs = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [jobsMeta, setJobsMeta] = useState({
    page: 1,
    total: 0,
    total_pages: 1,
    showing: 0,
    counts: { total: 0, approved: 0, pending: 0, total_applications: 0 },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const applyJobsResponse = (response) => {
    const list = (response.jobs || []).map((job) => ({
      ...job,
      id: job.job_id || job.id,
    }));
    setJobs(list);
    setJobsMeta({
      page: response.page ?? 1,
      total: response.total ?? 0,
      total_pages: response.total_pages ?? 1,
      showing: response.showing ?? list.length,
      counts: response.counts ?? {
        total: response.total ?? 0,
        approved: 0,
        pending: 0,
        total_applications: 0,
      },
    });
  };

  const fetchJobs = useCallback(
    async (page = currentPage) => {
      try {
        setFetching(true);
        setError("");

        const status = statusFilter === "approved" ? "Approved" : undefined;

        const response = await adminService.getAdminJobs({
          page,
          sort: sortBy === "oldest" ? "oldest" : "newest",
          ...(status && { status }),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...getDateRangeParams(dateFilter),
        });

        applyJobsResponse(response);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setError("Failed to load jobs. Please try again.");
        setJobs([]);
        setJobsMeta({
          page: 1,
          total: 0,
          total_pages: 1,
          showing: 0,
          counts: { total: 0, approved: 0, pending: 0, total_applications: 0 },
        });
      } finally {
        setLoading(false);
        setFetching(false);
      }
    },
    [currentPage, statusFilter, debouncedSearch, dateFilter, sortBy]
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, dateFilter, sortBy]);

  useEffect(() => {
    fetchJobs(currentPage);
  }, [fetchJobs, currentPage]);

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const getStatusColor = (statusLabel, status) => {
    const label = (statusLabel || status || "").toLowerCase();
    if (label === "approved" || label === "active" || label === "open") {
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30";
    }
    if (label === "pending" || label === "draft") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30";
    }
    if (label === "rejected" || label === "closed") {
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
    }
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return "N/A";
    if (typeof salaryRange === "string") return salaryRange;
    if (typeof salaryRange === "object") {
      return `${salaryRange.currency || "INR"} ${salaryRange.min || "0"} - ${salaryRange.max || "0"}`;
    }
    return "N/A";
  };

  const handleEdit = (job) => {
    const jobIdentifier = job.job_id || job.id;
    navigate(`/admin/edit-job/${jobIdentifier}`);
  };

  const handleToggleStatus = async (job) => {
    const jobId = job.job_id || job.id;
    if (!jobId) return;

    const currentStatus = (job.status || "").toLowerCase();
    const isCurrentlyClosed = currentStatus === "closed";
    const targetAction = isCurrentlyClosed ? "open" : "close";

    const confirmMessage = isCurrentlyClosed
      ? "Are you sure you want to reopen this job?"
      : "Are you sure you want to close this job? This will remove it from public display.";

    if (!window.confirm(confirmMessage)) return;

    try {
      setFetching(true);
      await adminService.closeJobAdmin({
        job_id: String(jobId),
        action: targetAction,
      });
      await fetchJobs(currentPage);
      alert(`Job ${isCurrentlyClosed ? "reopened" : "closed"} successfully!`);
    } catch (err) {
      console.error(`Failed to ${isCurrentlyClosed ? "reopen" : "close"} job:`, err);
      alert(`Failed to ${isCurrentlyClosed ? "reopen" : "close"} job. Please try again.`);
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this job? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      setFetching(true);
      await adminService.deleteAdminJob(jobId);
      if (currentPage > 1 && jobs.length === 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await fetchJobs(currentPage);
      }
      alert("Job deleted successfully!");
    } catch (err) {
      console.error("Failed to delete job:", err);
      alert("Failed to delete job. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleViewJob = (job) => {
    const id = job.job_id || job.id;
    if (!id) return;
    navigate(`/job/${id}`, { state: { fromAdmin: true, job } });
  };

  const { counts } = jobsMeta;
  const totalPages = jobsMeta.total_pages;

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  if (loading && jobs.length === 0) {
    return (
      <div className={`min-h-screen ${bgColor}`}>
        <div className={`${cardBg} rounded-lg border ${borderColor} p-6 sm:p-12 text-center max-w-7xl mx-auto mt-12 sm:mt-20 mx-3 sm:mx-auto`}>
          <div className="relative mb-4 sm:mb-6">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Briefcase className="text-blue-500" size={20} />
            </div>
          </div>
          <h3 className={`text-base sm:text-lg font-bold ${textColor}`}>Loading jobs...</h3>
          <p className={`text-sm ${textSecondary} mt-2`}>Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40 overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4 min-h-[40px]">
            <div className="min-w-0 flex-1">
              <h1 className={`text-base sm:text-xl md:text-2xl font-bold ${textColor} truncate`}>
                Manage Jobs
              </h1>
              <p className={`text-xs sm:text-sm ${textSecondary} mt-0.5 truncate`}>
                Create and manage job postings
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate("/admin/post-job")}
                className="px-3 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm touch-manipulation min-h-[40px]"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Post New Job</span>
                <span className="sm:hidden">Post</span>
              </button>
              <button
                onClick={() => {
                  setError("");
                  fetchJobs(currentPage);
                }}
                disabled={fetching}
                className={`p-2 sm:px-4 sm:py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center justify-center touch-manipulation min-h-[40px] min-w-[40px] disabled:opacity-50`}
                aria-label="Refresh jobs"
              >
                <RefreshCw size={18} className={fetching ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4">
            <div className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className={`flex-shrink-0 ${textSecondary}`} />
                <span className={`text-xs sm:text-sm font-semibold ${textColor}`}>{counts.total}</span>
                <span className={`text-xs ${textSecondary}`}>Total</span>
              </div>
            </div>
            <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">
                  {counts.approved}
                </span>
                <span className="text-xs text-green-600 dark:text-green-500">Approved</span>
              </div>
            </div>
            <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                  {counts.pending}
                </span>
                <span className="text-xs text-yellow-600 dark:text-yellow-500">Pending</span>
              </div>
            </div>
            <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-blue-50 dark:bg-blue-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400">
                  {counts.total_applications}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-500 hidden sm:inline">Total Applications</span>
                <span className="text-xs text-blue-600 dark:text-blue-500 sm:hidden">Apps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className={`${cardBg} rounded-lg border ${borderColor} p-3 sm:p-4 mb-4 sm:mb-6 w-full`}>
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search
                size={18}
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${textSecondary}`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, company, location, description…"
                className={`w-full min-w-0 pl-10 pr-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    statusFilter === "all"
                      ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  All ({counts.total})
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange("approved")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    statusFilter === "approved"
                      ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30"
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  Approved ({counts.approved})
                </button>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <Calendar size={18} className={`flex-shrink-0 ${textSecondary}`} />
                <select
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by date"
                  className={`w-full min-w-0 px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 days</option>
                  <option value="last30days">Last 30 days</option>
                  <option value="thisMonth">This month</option>
                  <option value="lastMonth">Last month</option>
                  <option value="thisYear">This year</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <ArrowUpDown size={18} className={`flex-shrink-0 ${textSecondary}`} />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Sort jobs"
                  className={`w-full min-w-0 px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="mb-4 flex items-center gap-2">
          <p className={`text-sm ${textSecondary}`}>
            Showing <span className={`font-semibold ${textColor}`}>{jobsMeta.showing}</span> of{" "}
            <span className={`font-semibold ${textColor}`}>{jobsMeta.total}</span>{" "}
            {jobsMeta.total === 1 ? "job" : "jobs"}
          </p>
          {fetching && (
            <RefreshCw size={14} className={`animate-spin ${textSecondary}`} aria-hidden />
          )}
        </div>

        {jobs.length === 0 && !fetching && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-6 sm:p-12 text-center`}>
            <div className={`w-14 h-14 sm:w-16 sm:h-16 ${isDark ? "bg-blue-500/20" : "bg-blue-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Building2 size={28} className="text-blue-500 sm:w-8 sm:h-8" />
            </div>
            <h3 className={`text-base sm:text-lg font-semibold ${textColor} mb-2`}>No jobs found</h3>
            <p className={`text-sm ${textSecondary} mb-4 sm:mb-6`}>
              {statusFilter !== "all" || searchTerm || dateFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Start by posting your first job opening."}
            </p>
            <button
              onClick={() => {
                if (statusFilter !== "all" || searchTerm || dateFilter !== "all") {
                  setStatusFilter("all");
                  setSearchTerm("");
                  setDateFilter("all");
                } else {
                  navigate("/admin/post-job");
                }
              }}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium touch-manipulation"
            >
              {statusFilter !== "all" || searchTerm || dateFilter !== "all"
                ? "Clear Filters"
                : "Post Your First Job"}
            </button>
          </div>
        )}

        <div className={`space-y-3 ${fetching ? "opacity-60 pointer-events-none" : ""}`}>
          {jobs.map((job) => {
            const logoUrl = getJobLogoUrl(job);
            const statusBadge = job.status_label || job.status || "Pending";
            const appCount = job.applications_count ?? job.applications?.length ?? 0;

            return (
              <div
                key={job.job_id || job.id}
                onClick={() => handleViewJob(job)}
                className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer`}
              >
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2.5">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden border ${borderColor} flex items-center justify-center shadow-sm ${isDark ? "bg-gray-700/80" : "bg-white"}`}
                      >
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                job.company_name || job.posted_company_name || "Company"
                              )}&background=2563eb&color=fff&size=64`;
                            }}
                          />
                        ) : (
                          <span className={`text-sm font-bold ${textSecondary}`}>
                            {getCompanyInitials(job.company_name || job.posted_company_name)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className={`text-sm sm:text-base font-bold ${textColor} leading-tight break-words`}>
                            {job.job_title || "N/A"}
                          </h3>
                          {job.is_premium && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Award size={12} />
                              Premium
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1 truncate max-w-full">
                            <Building2 size={13} className="flex-shrink-0" />
                            <span className="truncate">
                              {job.company_name || job.posted_company_name || "N/A"}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-full">
                            <MapPin size={13} className="flex-shrink-0" />
                            <span className="truncate">{job.location || "N/A"}</span>
                          </span>
                        </div>
                        <p className={`text-xs ${textSecondary} line-clamp-2 hidden sm:block`}>
                          {job.description
                            ? `${String(job.description).substring(0, 150)}...`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 w-fit ${getStatusColor(job.status_label, job.status)}`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      {statusBadge}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      {job.employment_type || "Full-time"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      {job.work_mode || "On-site"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      💰 {formatSalary(job.salary_range)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-50 text-gray-700 border-gray-200"} flex items-center gap-1`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      <Calendar size={12} />
                      {formatDate(job.created_at)}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-4 p-2 rounded-lg mb-2.5 border ${borderColor} ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-blue-500" />
                      <span className={`text-xs font-semibold ${textColor}`}>{appCount}</span>
                      <span className={`text-xs ${textSecondary}`} style={{ fontSize: "0.65rem" }}>
                        applications
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(job);
                      }}
                      className={`px-3 py-2.5 sm:py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5 touch-manipulation`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      <Edit size={13} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(job);
                      }}
                      className={`px-3 py-2.5 sm:py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5 touch-manipulation`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      <CircleX size={13} />
                      <span className="hidden sm:inline">
                        {(job.status || "").toLowerCase() === "closed" ? "Reopen" : "Close"}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(job.job_id || job.id);
                      }}
                      className="px-3 py-2.5 sm:py-1.5 border border-red-200 dark:border-red-500/40 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5 touch-manipulation"
                      style={{ fontSize: "0.7rem" }}
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 pb-4 sm:pb-0">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || fetching}
              className={`px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium touch-manipulation ${
                currentPage === 1
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
              }`}
            >
              Previous
            </button>
            <span className={`text-xs sm:text-sm ${textColor} px-2`}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || fetching}
              className={`px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium touch-manipulation ${
                currentPage === totalPages
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;
