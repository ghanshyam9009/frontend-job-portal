import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterService } from "../../services/recruiterService";
import AdminJobReports from "./AdminJobReports";
import {
  Search,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Download,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  ArrowUpDown,
  ArrowRight
} from "lucide-react";

/** Job card logo: API returns `job_logo_url`; fallbacks match JobCard / job detail. */
const getJobLogoUrl = (job) =>
  job?.job_logo_url ||
  job?.job_logo ||
  job?.company_logo ||
  job?.companyLogo ||
  job?.logo ||
  null;

const ManageEmployers = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState("overview"); // overview | employers | reports
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const recruitersPerPage = 25;

  // State for job reports
  const [jobs, setJobs] = useState([]);
  const [totalNewJobs, setTotalNewJobs] = useState(0);
  /** Syncs with AdminJobReports tabs: `all` | `newjob` (get-all-tasks postnewjob) */
  const [jobReportsInitialTab, setJobReportsInitialTab] = useState("all");

  // Fetch recruiters and jobs data from API
  useEffect(() => {
    fetchRecruiters();
    fetchJobReports();
  }, []);

  const fetchJobReports = async () => {
    try {
      const jobsData = await adminService.getJobsWithApplicationCounts();
      const recruiterJobs = jobsData.filter(job => {
        const postedBy = (job.posted_by || '').toUpperCase();
        return (postedBy === 'RECRUITER' || postedBy === 'EMPLOYER') && job.job_type !== "GOVERNMENT";
      });

      setJobs(
        recruiterJobs.map((job) => ({
          ...job,
          id: job.id || job.job_id,
        }))
      );

      let tasks = [];
      try {
        tasks = await adminService.getPendingJobs();
      } catch (err) {
        console.warn("Failed to fetch tasks (get all tasks):", err);
      }
      const postNewCount = (tasks || []).filter(
        (t) => t.category === "postnewjob"
      ).length;
      setTotalNewJobs(postNewCount);
    } catch (error) {
      console.error('Failed to fetch job reports:', error);
    }
  };

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllRecruiters();
      const recruitersData = response.recruiters || response.data || response || [];
      // Filter out blocked recruiters where is_admin_closed is true
      const activeRecruiters = recruitersData.filter(recruiter =>
        recruiter.is_admin_closed !== true &&
        recruiter.is_admin_closed !== "true" &&
        recruiter.is_admin_closed !== 1 &&
        recruiter.is_admin_closed !== "1"
      );
      const sortedRecruiters = activeRecruiters.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      setRecruiters(sortedRecruiters);
      setFilteredRecruiters(sortedRecruiters);
    } catch (error) {
      console.error('Failed to fetch recruiters:', error);
      setRecruiters([]);
      setFilteredRecruiters([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to filter by date
  const filterByDate = (recruiter) => {
    const dateString = recruiter.created_at || recruiter.createdAt || recruiter.date_created;
    if (!dateString) return false;

    const recruiterDate = new Date(dateString);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return recruiterDate.toDateString() === now.toDateString();

      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return recruiterDate.toDateString() === yesterday.toDateString();

      case "last7days":
        const last7Days = new Date(now);
        last7Days.setDate(last7Days.getDate() - 7);
        return recruiterDate >= last7Days;

      case "last30days":
        const last30Days = new Date(now);
        last30Days.setDate(last30Days.getDate() - 30);
        return recruiterDate >= last30Days;

      case "thisMonth":
        return recruiterDate.getMonth() === now.getMonth() &&
          recruiterDate.getFullYear() === now.getFullYear();

      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return recruiterDate >= lastMonth && recruiterDate <= lastMonthEnd;

      case "thisYear":
        return recruiterDate.getFullYear() === now.getFullYear();

      default:
        return true;
    }
  };

  // Filter recruiters based on search, approval status, date, and sort
  useEffect(() => {
    let filtered = recruiters;

    if (searchTerm) {
      filtered = filtered.filter(recruiter =>
        (recruiter.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (recruiter.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (recruiter.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (recruiter.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Apply approval filter
    if (approvalFilter === "pending") {
      filtered = filtered.filter(recruiter =>
        recruiter.hasadminapproved === false &&
        recruiter.status !== 'rejected' &&
        recruiter.status !== 'inactive' &&
        recruiter.status !== 'blocked'
      );
    } else if (approvalFilter === "approved") {
      filtered = filtered.filter(recruiter => recruiter.hasadminapproved === true);
    } else if (approvalFilter === "rejected") {
      filtered = filtered.filter(recruiter =>
        (recruiter.status === 'rejected' ||
          recruiter.status === 'inactive' ||
          recruiter.status === 'blocked') &&
        recruiter.hasadminapproved === false
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      filtered = filtered.filter(filterByDate);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || 0);
      const dateB = new Date(b.created_at || b.createdAt || 0);

      switch (sortBy) {
        case "newest":
          return dateB - dateA;

        case "oldest":
          return dateA - dateB;

        case "companyAZ":
          return (a.company_name || '').localeCompare(b.company_name || '');

        case "companyZA":
          return (b.company_name || '').localeCompare(a.company_name || '');

        case "emailAZ":
          return (a.email || '').localeCompare(b.email || '');

        case "emailZA":
          return (b.email || '').localeCompare(a.email || '');

        default:
          return 0;
      }
    });

    setFilteredRecruiters(sorted);
    setCurrentPage(1);
  }, [searchTerm, approvalFilter, dateFilter, sortBy, recruiters]);

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const formatDate = (recruiter) => {
    const dateString = recruiter.created_at || recruiter.createdAt || recruiter.date_created;
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getApprovalColor = (recruiter) => {
    if (recruiter.hasadminapproved) {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
    }
    if (recruiter.status === 'rejected' || recruiter.status === 'inactive' || recruiter.status === 'blocked') {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
    }
    return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
  };

  const getApprovalLabel = (recruiter) => {
    if (recruiter.hasadminapproved) return 'Approved';
    if (recruiter.status === 'rejected' || recruiter.status === 'inactive' || recruiter.status === 'blocked') {
      return 'Rejected';
    }
    return 'Pending';
  };

  const handleApproveEmployer = async (recruiter) => {
    try {
      setActionLoading(`approve-${recruiter.employer_id}`);

      await recruiterService.updateProfile(recruiter.email, {
        rejection_reason: null,
        status: 'active'
      });

      await adminService.approveRecruiter(recruiter);

      const response = await adminService.getAllRecruiters();
      const recruitersData = response.recruiters || [];
      const sortedRecruiters = recruitersData.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      setRecruiters(sortedRecruiters);

      setMessage({ type: 'success', text: `${recruiter.company_name} approved successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to approve employer:', error);
      setMessage({ type: 'error', text: 'Failed to approve employer. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRecruiter = async (recruiter) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason || !reason.trim()) {
      setMessage({ type: 'error', text: 'Rejection reason is required' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setActionLoading(`reject-${recruiter.employer_id}`);

      await recruiterService.updateProfile(recruiter.email, {
        rejection_reason: reason.trim(),
        status: 'rejected',
        hasadminapproved: false
      });

      await adminService.rejectRecruiter(recruiter);

      const response = await adminService.getAllRecruiters();
      const recruitersData = response.recruiters || [];
      const sortedRecruiters = recruitersData.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateB - dateA;
      });
      setRecruiters(sortedRecruiters);

      setMessage({ type: 'success', text: `${recruiter.company_name} rejected successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to reject employer:', error);
      setMessage({ type: 'error', text: 'Failed to reject employer. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProfile = (recruiter) => {
    navigate(`/admin/employers/profile/${recruiter.email}`);
  };

  const handleViewJobs = (recruiter) => {
    const employerId = recruiter.employer_id || recruiter.id;
    navigate(`/admin/employers/jobs/${employerId}`);
  };

  const handleBlockRecruiter = async (recruiter) => {
    if (!recruiter || !recruiter.email) {
      console.error('Invalid recruiter data:', recruiter);
      return;
    }

    const confirmBlock = window.confirm(
      `Are you sure you want to block ${recruiter.company_name}? This will remove them from the system.`
    );

    if (!confirmBlock) return;

    try {
      setActionLoading(recruiter.employer_id);
      await adminService.blockRecruiter(recruiter.email);

      const updatedRecruiters = recruiters.filter(r => r.email !== recruiter.email);
      setRecruiters(updatedRecruiters);
      setCurrentPage(1);

      setMessage({ type: 'success', text: `${recruiter.company_name} has been blocked and removed from the system.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error blocking recruiter:', error);
      setMessage({ type: 'error', text: 'Failed to block employer. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const headers = [
        'Company Name', 'Contact Person', 'Email', 'Phone', 'Industry',
        'Company Size', 'Location', 'Approval Status', 'Joined Date'
      ];

      const csvData = recruiters.map(recruiter => [
        recruiter.company_name || '',
        recruiter.full_name || '',
        recruiter.email || '',
        recruiter.phone_number || recruiter.phone || '',
        recruiter.industry || '',
        recruiter.company_size || '',
        recruiter.location || '',
        getApprovalLabel(recruiter),
        formatDate(recruiter)
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ type: 'success', text: 'CSV file downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      setMessage({ type: 'error', text: 'Failed to download CSV file.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecruiters.length / recruitersPerPage);
  const startIndex = (currentPage - 1) * recruitersPerPage;
  const endIndex = startIndex + recruitersPerPage;
  const currentRecruiters = filteredRecruiters.slice(startIndex, endIndex);

  const pendingCount = recruiters.filter(r =>
    r.hasadminapproved === false &&
    r.status !== 'rejected' &&
    r.status !== 'inactive' &&
    r.status !== 'blocked'
  ).length;
  const approvedCount = recruiters.filter(r => r.hasadminapproved === true).length;
  const rejectedCount = recruiters.filter(r =>
    (r.status === 'rejected' || r.status === 'inactive' || r.status === 'blocked') &&
    r.hasadminapproved === false
  ).length;

  const totalEmployers = recruiters.length;
  const totalJobs = jobs.length;

  // Approved employers and recent lists
  const approvedEmployers = useMemo(
    () => recruiters.filter((r) => r.hasadminapproved === true),
    [recruiters]
  );

  const recentApprovedEmployers = useMemo(
    () => approvedEmployers.slice(0, 5),
    [approvedEmployers]
  );

  const recentJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    const sorted = [...jobs].sort(
      (a, b) =>
        new Date(b.created_at || b.posted_date || 0) -
        new Date(a.created_at || a.posted_date || 0)
    );
    return sorted.slice(0, 5);
  }, [jobs]);

  const handleSummaryCardClick = (mode) => {
    if (mode === "reports") {
      setJobReportsInitialTab("all");
    }
    setViewMode(mode);
  };

  const handleTotalNewClick = () => {
    setJobReportsInitialTab("newjob");
    setViewMode("reports");
  };

  const handlePendingEmployersClick = () => {
    // Show only pending employers in the main employers table
    setApprovalFilter("pending");
    setViewMode("employers");
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Skeleton loader components
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
        {/* Top Bar Skeleton */}
        <div className={`${cardBg} border-b ${borderColor} shadow-sm sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Manage Employers</h1>
                <p className={`text-sm ${textSecondary} mt-1 flex items-center gap-2`}>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  Loading employers...
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                <div className="w-28 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="mt-4 flex flex-col lg:flex-row lg:items-stretch gap-6 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Skeletons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </div>
            </div>
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header – Job Reports view par poora block (title, Export, Refresh, cards) hide */}
      <div className={`${cardBg} ${viewMode !== "reports" ? `border-b ${borderColor} sticky top-0 z-40` : ""}`}>
        {viewMode !== "reports" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Manage Employers</h1>
              <p className={`text-sm ${textSecondary} mt-1`}>View and manage all registered employers</p>
            </div>
            {/* Quick actions like dashboard refresh/export */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDownloadCSV}
                className={`px-4 py-2 bg-white dark:bg-gray-800 border ${borderColor} text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2 shadow-sm`}
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => {
                  fetchRecruiters();
                  fetchJobReports();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* 4 cards sirf overview par – Total Employee / Job Report open hone par nahi dikhenge */}
          {viewMode === "overview" && (
            <div className="mt-4 flex flex-col lg:flex-row lg:items-stretch gap-6 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                {/* Total Employers */}
                <button
                  type="button"
                  onClick={() => handleSummaryCardClick("employers")}
                  className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer text-left w-full block`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${textSecondary} text-sm font-medium`}>Total Employers</p>
                      <h3 className={`text-3xl font-bold ${textColor} mt-2`}>
                        {totalEmployers}
                      </h3>
                      <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                        Active companies
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Building className="text-blue-500" size={28} />
                    </div>
                  </div>
                </button>

                {/* Employer Job Reports */}
                <button
                  type="button"
                  onClick={() => handleSummaryCardClick("reports")}
                  className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer text-left w-full block`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${textSecondary} text-sm font-medium`}>Job Reports</p>
                      <h3 className={`text-3xl font-bold ${textColor} mt-2`}>
                        {totalJobs}
                      </h3>
                      <p className="text-indigo-600 text-sm mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Employer posted
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <Briefcase className="text-indigo-500" size={28} />
                    </div>
                  </div>
                </button>

                {/* New job tasks (get all tasks — postnewjob) */}
                <button
                  type="button"
                  onClick={handleTotalNewClick}
                  className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-emerald-500 transform transition-all hover:-translate-y-1 hover:shadow-xl text-left w-full`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${textSecondary} text-sm font-medium`}>Total New</p>
                      <h3 className={`text-3xl font-bold ${textColor} mt-2`}>
                        {totalNewJobs}
                      </h3>
                      <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        New job post tasks
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <Briefcase className="text-emerald-500" size={28} />
                    </div>
                  </div>
                </button>

                {/* Pending Employers */}
                <button
                  type="button"
                  onClick={handlePendingEmployersClick}
                  className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-amber-500 transform transition-all hover:-translate-y-1 hover:shadow-xl text-left w-full`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${textSecondary} text-sm font-medium`}>Pending Employers</p>
                      <h3 className={`text-3xl font-bold ${textColor} mt-2`}>
                        {pendingCount}
                      </h3>
                      <p className="text-amber-600 text-sm mt-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Awaiting approval
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <Clock className="text-amber-500" size={28} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

        </div>
        )}

        {viewMode === "overview" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Recent Approved Employers & Recent Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Recent Approved Employers */}
              <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                    <Building className="text-blue-500" size={20} />
                    Recent Approved Employers
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleSummaryCardClick("employers")}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  {recentApprovedEmployers.map((r) => (
                    <div
                      key={r.id || r.employer_id || r.email}
                      className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 flex-shrink-0">
                          {(r.logo || r.company_logo) ? (
                            <img src={r.logo || r.company_logo} alt={r.company_name || 'Company'} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(r.company_name || 'Company')
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${textColor} truncate`}>{r.company_name || 'Company'}</p>
                          <p className={`text-xs ${textSecondary} truncate`}>{r.email || 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`text-xs ${textSecondary}`}>
                        {formatDate(r)}
                      </span>
                    </div>
                  ))}
                  {recentApprovedEmployers.length === 0 && (
                    <p className={`text-xs ${textSecondary}`}>No approved employers found yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Jobs */}
              <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                    <Briefcase className="text-green-500" size={20} />
                    Recent Jobs
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleSummaryCardClick("reports")}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  {recentJobs.map((job) => {
                    const logoUrl = getJobLogoUrl(job);
                    return (
                    <div
                      key={job.id || job.job_id}
                      className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden border ${borderColor} flex items-center justify-center ${isDark ? "bg-gray-700/80" : "bg-white"}`}
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
                                  job.company_name || "Company"
                                )}&background=2563eb&color=fff&size=64`;
                              }}
                            />
                          ) : (
                            <span className={`text-xs font-bold ${textSecondary}`}>
                              {getInitials(job.company_name || "Job")}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${textColor} truncate`}>
                            {job.job_title || 'Job'}
                          </p>
                          <p className={`text-xs ${textSecondary} truncate`}>
                            {job.company_name || 'Company'} • {job.location || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs ${textSecondary} flex-shrink-0`}>
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : 'N/A'}
                      </span>
                    </div>
                    );
                  })}
                  {recentJobs.length === 0 && (
                    <p className={`text-xs ${textSecondary}`}>No jobs found yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "employers" && (
          <div id="admin-employers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewMode("overview")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ← Back to overview
              </button>
              <h2 className={`text-base font-bold ${textColor}`}>Employers List</h2>
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
                      placeholder="Search by company, email, name, industry..."
                      className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                    />
                  </div>
                </div>

                {/* Approval, Date, and Sort Filters Row */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Approval Filters */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setApprovalFilter('all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${approvalFilter === 'all'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                        : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                        }`}
                    >
                      All ({recruiters.length})
                    </button>
                    <button
                      onClick={() => setApprovalFilter('pending')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${approvalFilter === 'pending'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                        : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                        }`}
                    >
                      Pending ({pendingCount})
                    </button>
                    <button
                      onClick={() => setApprovalFilter('approved')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${approvalFilter === 'approved'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                        : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                        }`}
                    >
                      Approved ({approvedCount})
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
                      <option value="companyAZ">Company (A-Z)</option>
                      <option value="companyZA">Company (Z-A)</option>
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
                Showing <span className={`font-semibold ${textColor}`}>{filteredRecruiters.length}</span> {filteredRecruiters.length === 1 ? 'employer' : 'employers'}
                {dateFilter !== 'all' && (
                  <span className="ml-2">
                    ({dateFilter.replace(/([A-Z])/g, ' $1').trim()})
                  </span>
                )}
              </p>
            </div>

            {/* Empty State */}
            {filteredRecruiters.length === 0 && !loading && (
              <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
                <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Building size={32} className="text-blue-500" />
                </div>
                <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No employers found</h3>
                <p className={`${textSecondary} mb-6`}>
                  {searchTerm || approvalFilter !== 'all' || dateFilter !== 'all' ? "Try adjusting your filters" : "No employers registered yet"}
                </p>
              </div>
            )}

            {/* Employers - Compact Cards */}
            <div className="space-y-3">
              {currentRecruiters.map(recruiter => (
                <div
                  key={recruiter.id || recruiter.employer_id}
                  className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
                >
                  <div className="p-3">
                    {/* Employer Header */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-100 dark:bg-blue-900/30">
                          {(recruiter.logo || recruiter.company_logo) ? (
                            <img
                              src={recruiter.logo || recruiter.company_logo}
                              alt={recruiter.company_name || 'Company'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                              {getInitials(recruiter.company_name)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`text-sm font-bold ${textColor} truncate leading-tight`}>
                            {recruiter.company_name || 'N/A'}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className={`text-xs ${textSecondary} truncate`}>
                              {recruiter.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getApprovalColor(recruiter)}`} style={{ fontSize: '0.7rem' }}>
                        {getApprovalLabel(recruiter)}
                      </span>
                    </div>

                    {/* Employer Details */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {recruiter.full_name && (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                          👤 {recruiter.full_name}
                        </span>
                      )}
                      {recruiter.phone_number || recruiter.phone ? (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                          <Phone size={11} />
                          {recruiter.phone_number || recruiter.phone}
                        </span>
                      ) : null}
                      {recruiter.industry && (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-purple-900/30 text-purple-400 border-purple-800' : 'bg-purple-100 text-purple-600 border-purple-200'}`} style={{ fontSize: '0.7rem' }}>
                          {recruiter.industry}
                        </span>
                      )}
                      {recruiter.company_size && (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                          {recruiter.company_size} employees
                        </span>
                      )}
                      {recruiter.location && (
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                          <MapPin size={11} />
                          {recruiter.location}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                        Joined: {formatDate(recruiter)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {/* Show Approve/Reject buttons only for pending employers */}
                      {!recruiter.hasadminapproved && recruiter.status !== 'rejected' && recruiter.status !== 'inactive' && recruiter.status !== 'blocked' ? (
                        <>
                          <button
                            onClick={() => handleApproveEmployer(recruiter)}
                            disabled={actionLoading === `approve-${recruiter.employer_id}`}
                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                            style={{ fontSize: '0.7rem' }}
                          >
                            <CheckCircle size={13} />
                            {actionLoading === `approve-${recruiter.employer_id}` ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectRecruiter(recruiter)}
                            disabled={actionLoading === `reject-${recruiter.employer_id}`}
                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                            style={{ fontSize: '0.7rem' }}
                          >
                            <XCircle size={13} />
                            {actionLoading === `reject-${recruiter.employer_id}` ? 'Rejecting...' : 'Reject'}
                          </button>
                          <button
                            onClick={() => handleViewProfile(recruiter)}
                            className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            <Eye size={13} />
                            View Profile
                          </button>
                          <button
                            onClick={() => handleBlockRecruiter(recruiter)}
                            disabled={actionLoading === recruiter.employer_id}
                            className={`flex-1 sm:flex-initial px-3 py-1.5 border border-red-300 dark:border-red-800 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            <Trash2 size={13} />
                            {actionLoading === recruiter.employer_id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleViewProfile(recruiter)}
                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                            style={{ fontSize: '0.7rem' }}
                          >
                            <Eye size={13} />
                            View Profile
                          </button>
                          <button
                            onClick={() => handleViewJobs(recruiter)}
                            className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            <Briefcase size={13} />
                            Jobs Posted
                          </button>
                          <button
                            onClick={() => handleBlockRecruiter(recruiter)}
                            disabled={actionLoading === recruiter.employer_id}
                            className={`flex-1 sm:flex-initial px-3 py-1.5 border border-red-300 dark:border-red-800 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            <Trash2 size={13} />
                            {actionLoading === recruiter.employer_id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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

        {viewMode === "reports" && (
          <div id="admin-employer-reports-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setViewMode("overview")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ← Back to overview
              </button>
              <h2 className={`text-base font-bold ${textColor}`}>Employer Job Reports</h2>
            </div>
            <AdminJobReports initialReportTab={jobReportsInitialTab} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEmployers;