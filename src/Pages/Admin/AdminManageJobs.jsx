import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
import { adminService } from "../../services/adminService";
import { candidateExternalService } from "../../services/candidateExternalService";
import { Building2, Edit, CircleX, Search, RefreshCw, Eye, Users, Plus, MapPin, Calendar, Briefcase, Award, ArrowUpDown } from "lucide-react";

const AdminJobs = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const jobsPerPage = 25;

  // Fetch jobs data — mirrors AdminJobReports pattern exactly
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const jobsData = await candidateExternalService.getAllJobs();
      const currentAdminId = user?.admin_id || user?.id || user?.user_id;
      const adminJobs = (jobsData?.jobs || [])
        .filter(job => job.admin_id === currentAdminId)
        .filter(job => job.posted_by?.toLowerCase() === 'admin')
        .filter(job => job.job_type !== 'GOVERNMENT')
        .filter(job => job.posted_by?.toUpperCase() !== 'RECRUITER');

      // Fetch actual application counts — same as AdminJobReports
      const jobsWithActualCounts = await Promise.all(
        adminJobs.map(async (job) => {
          try {
            const jobId = job.job_id || job.id;
            const applicationsData = await adminService.getApplicationsForJob(jobId);
            const applications = applicationsData?.applications || [];

            return {
              ...job,
              application_count: applications.length,
              applications: []
            };
          } catch (err) {
            console.error(`Failed to fetch applications for job ${job.job_id || job.id}:`, err);
            return {
              ...job,
              application_count: job.application_count || 0,
              applications: []
            };
          }
        })
      );

      const sortedJobs = jobsWithActualCounts.sort((a, b) => {
        const dateA = new Date(a.created_at || a.posted_date || 0);
        const dateB = new Date(b.created_at || b.posted_date || 0);
        return dateB - dateA;
      });

      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Helper function to filter by date
  const filterByDate = (job) => {
    const dateString = job.created_at || job.posted_date;
    if (!dateString) return false;

    const jobDate = new Date(dateString);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return jobDate.toDateString() === now.toDateString();

      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return jobDate.toDateString() === yesterday.toDateString();

      case "last7days":
        const last7Days = new Date(now);
        last7Days.setDate(last7Days.getDate() - 7);
        return jobDate >= last7Days;

      case "last30days":
        const last30Days = new Date(now);
        last30Days.setDate(last30Days.getDate() - 30);
        return jobDate >= last30Days;

      case "thisMonth":
        return jobDate.getMonth() === now.getMonth() &&
               jobDate.getFullYear() === now.getFullYear();

      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return jobDate >= lastMonth && jobDate <= lastMonthEnd;

      case "thisYear":
        return jobDate.getFullYear() === now.getFullYear();

      default:
        return true;
    }
  };

  // Filter and sort jobs
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (dateFilter !== "all") {
      filtered = filtered.filter(filterByDate);
    }

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at || a.posted_date || 0);
      const dateB = new Date(b.created_at || b.posted_date || 0);

      switch (sortBy) {
        case "newest":       return dateB - dateA;
        case "oldest":       return dateA - dateB;
        case "titleAZ":      return (a.job_title || '').localeCompare(b.job_title || '');
        case "titleZA":      return (b.job_title || '').localeCompare(a.job_title || '');
        case "companyAZ":    return (a.company_name || '').localeCompare(b.company_name || '');
        case "companyZA":    return (b.company_name || '').localeCompare(a.company_name || '');
        case "applications": return (b.application_count || 0) - (a.application_count || 0);
        default:             return 0;
      }
    });

    setFilteredJobs(sorted);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, sortBy, jobs]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'approved':
      case 'active':
      case 'open':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'pending':
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
      case 'rejected':
      case 'closed':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = (job) => {
    const jobIdentifier = job.job_id || job.id;
    console.log('Editing job:', job.job_title, 'with ID:', jobIdentifier);
    navigate(`/admin/edit-job/${jobIdentifier}`);
  };

  const handleToggleStatus = async (job) => {
    const jobId = job.job_id || job.id;
    if (!jobId) return;

    const currentStatus = (job.status || "").toLowerCase();
    const isCurrentlyClosed = currentStatus === "closed";
    const targetStatus = isCurrentlyClosed ? "approved" : "closed";

    const confirmMessage = isCurrentlyClosed
      ? "Are you sure you want to reopen this job?"
      : "Are you sure you want to close this job? This will remove it from public display.";

    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);

      if (!isCurrentlyClosed) {
        await adminService.closeAdminJob(jobId);
      }

      // Mirror recruiter ManageJobs behavior: close via API, reopen via local status toggle.
      setJobs((prev) =>
        prev.map((j) =>
          (j.job_id || j.id) === jobId
            ? { ...j, status: targetStatus }
            : j
        )
      );

      alert(`Job ${isCurrentlyClosed ? "reopened" : "closed"} successfully!`);
    } catch (error) {
      console.error(`Failed to ${isCurrentlyClosed ? "reopen" : "close"} job:`, error);
      alert(`Failed to ${isCurrentlyClosed ? "reopen" : "close"} job. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplications = (job) => {
    navigate(`/admin/job-applications/${job.job_id || job.id}`);
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  if (loading) {
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
          {/* Title + Actions row — mobile: single row, title truncates; desktop: same */}
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
                onClick={() => navigate('/admin/post-job')}
                className="px-3 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm touch-manipulation min-h-[40px]"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Post New Job</span>
                <span className="sm:hidden">Post</span>
              </button>
              <button
                onClick={() => {
                  setError("");
                  fetchJobs();
                }}
                className={`p-2 sm:px-4 sm:py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center justify-center touch-manipulation min-h-[40px] min-w-[40px]`}
                aria-label="Refresh jobs"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Stats Bar — mobile: 2x2 grid; sm+: single row flex */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4">
            <div className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className={`flex-shrink-0 ${textSecondary}`} />
                <span className={`text-xs sm:text-sm font-semibold ${textColor}`}>{jobs.length}</span>
                <span className={`text-xs ${textSecondary}`}>Total</span>
              </div>
            </div>
            <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">
                  {jobs.filter(j => j.status === 'approved').length}
                </span>
                <span className="text-xs text-green-600 dark:text-green-500">Approved</span>
              </div>
            </div>
            <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                  {jobs.filter(j => j.status === 'pending').length}
                </span>
                <span className="text-xs text-yellow-600 dark:text-yellow-500">Pending</span>
              </div>
            </div>
            <div className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-blue-50 dark:bg-blue-500/20">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400">
                  {jobs.reduce((sum, job) => sum + (job.application_count || 0), 0)}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-500 hidden sm:inline">Total Applications</span>
                <span className="text-xs text-blue-600 dark:text-blue-500 sm:hidden">Apps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Filters on Top */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-3 sm:p-4 mb-4 sm:mb-6`}>
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by job title, company, or location..."
                  className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                />
              </div>
            </div>

            {/* Status, Date, and Sort Filters Row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                    statusFilter === 'all'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  All ({jobs.length})
                </button>
              </div>

              {/* Date Filter Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Calendar size={18} className={`flex-shrink-0 ${textSecondary}`} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`flex-1 sm:flex-initial min-w-0 px-3 sm:px-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
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
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ArrowUpDown size={18} className={`flex-shrink-0 ${textSecondary}`} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`flex-1 sm:flex-initial min-w-0 px-3 sm:px-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="titleAZ">Job Title (A-Z)</option>
                  <option value="titleZA">Job Title (Z-A)</option>
                  <option value="companyAZ">Company (A-Z)</option>
                  <option value="companyZA">Company (Z-A)</option>
                  <option value="applications">Most Applications</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Header */}
        <div className="mb-4">
          <p className={`text-sm ${textSecondary}`}>
            Showing <span className={`font-semibold ${textColor}`}>{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'job' : 'jobs'}
            {dateFilter !== 'all' && (
              <span className="ml-2">
                ({dateFilter.replace(/([A-Z])/g, ' $1').trim()})
              </span>
            )}
          </p>
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && !loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-6 sm:p-12 text-center`}>
            <div className={`w-14 h-14 sm:w-16 sm:h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Building2 size={28} className="text-blue-500 sm:w-8 sm:h-8" />
            </div>
            <h3 className={`text-base sm:text-lg font-semibold ${textColor} mb-2`}>No jobs found</h3>
            <p className={`text-sm ${textSecondary} mb-4 sm:mb-6`}>
              {statusFilter === 'all' && searchTerm === '' && dateFilter === 'all'
                ? "Start by posting your first job opening."
                : "Try adjusting your filters or search query"}
            </p>
            <button
              onClick={() => {
                if (statusFilter !== 'all' || searchTerm !== '' || dateFilter !== 'all') {
                  setStatusFilter('all');
                  setSearchTerm('');
                  setDateFilter('all');
                } else {
                  navigate('/admin/post-job');
                }
              }}
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium touch-manipulation"
            >
              {statusFilter !== 'all' || searchTerm !== '' || dateFilter !== 'all' ? 'Clear Filters' : 'Post Your First Job'}
            </button>
          </div>
        )}

        {/* Job Listings - Compact Cards */}
        <div className="space-y-3">
          {currentJobs.map(job => (
            <div
              key={job.id || job.job_id}
              className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
            >
              <div className="p-3 sm:p-4">
                {/* Job Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className={`text-sm sm:text-base font-bold ${textColor} hover:text-blue-600 cursor-pointer leading-tight break-words`}>
                        {job.job_title || 'N/A'}
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
                        <span className="truncate">{job.company_name || 'N/A'}</span>
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-full">
                        <MapPin size={13} className="flex-shrink-0" />
                        <span className="truncate">{job.location || 'N/A'}</span>
                      </span>
                    </div>
                    <p className={`text-xs ${textSecondary} line-clamp-2 hidden sm:block`}>
                      {job.description ? `${job.description.substring(0, 150)}...` : 'N/A'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 w-fit ${getStatusColor(job.status || 'approved')}`} style={{ fontSize: '0.7rem' }}>
                    {job.status || 'Approved'}
                  </span>
                </div>

                {/* Job Details */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    {job.employment_type || 'Full-time'}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    {job.work_mode || 'On-site'}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    💰 {job.salary_range && typeof job.salary_range === 'string'
                      ? job.salary_range
                      : job.salary_range && typeof job.salary_range === 'object'
                      ? `${job.salary_range.currency || 'INR'} ${job.salary_range.min || '0'} - ${job.salary_range.max || '0'}`
                      : 'N/A'}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                    <Calendar size={12} />
                    {formatDate(job.created_at || job.posted_date)}
                  </span>
                </div>

                {/* Stats Bar */}
                <div className={`flex items-center gap-4 p-2 rounded-lg mb-2.5 border ${borderColor} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-blue-500" />
                    <span className={`text-xs font-semibold ${textColor}`}>{job.application_count || 0}</span>
                    <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.65rem' }}>applications</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <button
                    onClick={() => handleViewApplications(job)}
                    className="col-span-2 sm:col-auto flex-1 sm:flex-initial px-3 py-2.5 sm:py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 touch-manipulation"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Eye size={13} />
                    <span className="truncate">View Applications ({job.application_count || 0})</span>
                  </button>
                  <button
                    onClick={() => handleEdit(job)}
                    className={`px-3 py-2.5 sm:py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5 touch-manipulation`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Edit size={13} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job)}
                    className={`px-3 py-2.5 sm:py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5 touch-manipulation`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <CircleX size={13} />
                    <span className="hidden sm:inline">
                      {(job.status || "").toLowerCase() === "closed" ? "Reopen" : "Close"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 pb-4 sm:pb-0">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium touch-manipulation ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
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
              disabled={currentPage === totalPages}
              className={`px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium touch-manipulation ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
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