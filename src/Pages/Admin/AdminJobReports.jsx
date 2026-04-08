import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { Search, Users, Building, MapPin, Calendar, Eye, Briefcase, RefreshCw, Trash2, ArrowUpDown, Star, CheckCircle, XCircle } from "lucide-react";
import * as XLSX from 'xlsx';

const isRecruiterJob = (job) => {
  const pb = (job?.posted_by ?? "").toString().trim().toUpperCase();
  if (pb === "ADMIN") return false;
  if (pb === "RECRUITER" || pb === "EMPLOYER") return true;
  return Boolean(job?.recruiter_id);
};

const REPORT_TAB = {
  ALL: "all",
  NEW_JOB: "newjob",
  EDIT_JOB: "editjob",
  CLOSE_JOB: "closejob",
  REOPEN_JOB: "reopenjob",
};

const TASK_CATEGORY_BY_TAB = {
  [REPORT_TAB.NEW_JOB]: "postnewjob",
  [REPORT_TAB.EDIT_JOB]: "editjob",
  [REPORT_TAB.CLOSE_JOB]: "closedjob",
  [REPORT_TAB.REOPEN_JOB]: "reopenjob",
};

const isValidReportTab = (tab) =>
  tab != null && Object.values(REPORT_TAB).includes(tab);

/** Same resolution as Shared/JobCard — primary API field is `job_logo_url`, then company logo fallbacks */
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

const JobReportLogoBadge = ({
  job,
  borderColor,
  isDark,
  textSecondary,
  sizeClass = "w-12 h-12",
}) => {
  const logoUrl = getJobLogoUrl(job);
  return (
    <div
      className={`${sizeClass} rounded-lg flex-shrink-0 overflow-hidden border ${borderColor} flex items-center justify-center shadow-sm ${
        isDark ? "bg-gray-700/80" : "bg-white"
      }`}
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
        <span className={`text-sm font-bold ${textSecondary}`}>
          {getCompanyInitials(job.company_name)}
        </span>
      )}
    </div>
  );
};

/** Map getPendingJobs() task row to the same shape as recruiter job cards for this page */
const mapTaskToReportJob = (task) => {
  const jobId = task.job_id;
  return {
    ...task,
    id: jobId ?? task.task_id,
    task_id: task.task_id,
    job_id: jobId,
    category: task.category,
    status: (task.status || "pending").toString().toLowerCase(),
    job_title: task.job_title || task.title || "N/A",
    company_name: task.company_name || "Unknown Company",
    location: task.location || "Not specified",
    created_at: task.posted_date || task.created_at || task.updated_date,
    salary_range: task.salary_range ?? task.salary,
    premium_job: task.premium_job ?? task.is_premium,
    is_premium: task.is_premium ?? task.premium_job,
    employer_id: task.recruiter_id ?? task.employer_id,
    job_logo_url: task.job_logo_url,
    job_logo: task.job_logo,
    company_logo: task.company_logo,
    companyLogo: task.companyLogo,
    logo: task.logo,
  };
};

const AdminJobReports = ({ initialReportTab: initialReportTabProp } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [allJobsFromApi, setAllJobsFromApi] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [approvalModalJob, setApprovalModalJob] = useState(null);
  const [rejectModalJob, setRejectModalJob] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");
  const [reportTab, setReportTab] = useState(() => {
    if (isValidReportTab(initialReportTabProp)) return initialReportTabProp;
    const fromRouter = location.state?.reportTab;
    if (isValidReportTab(fromRouter)) return fromRouter;
    return REPORT_TAB.ALL;
  });
  const jobsPerPage = 25;

  const fetchJobReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allJobs = await adminService.getAllJobsForAdmin();
      const recruiterJobs = (allJobs || [])
        .filter((j) => j.job_type !== "GOVERNMENT")
        .filter(isRecruiterJob);

      const withIds = recruiterJobs.map((job) => {
        const id = job.job_id || job.id;
        return {
          ...job,
          id,
          application_count: job.application_count ?? 0,
        };
      });
      const sortedJobs = withIds.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      setAllJobsFromApi(sortedJobs);
    } catch (error) {
      console.error('Failed to fetch job application reports:', error);
      setError('Failed to fetch job application reports. Please try again.');
      setAllJobsFromApi([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTaskReports = useCallback(async (category) => {
    try {
      setLoading(true);
      setError(null);
      const tasks = await adminService.getPendingJobs();
      const filtered = (tasks || []).filter((t) => {
        if (t.category !== category) return false;
        const st = (t.status || "pending").toString().toLowerCase();
        return st === "pending";
      });
      const mapped = filtered
        .map(mapTaskToReportJob)
        .sort(
          (a, b) =>
            new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      setAllJobsFromApi(mapped);
    } catch (error) {
      console.error("Failed to fetch task queue:", error);
      setError("Failed to load tasks. Please try again.");
      setAllJobsFromApi([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshList = useCallback(() => {
    if (reportTab === REPORT_TAB.ALL) return fetchJobReports();
    return fetchTaskReports(TASK_CATEGORY_BY_TAB[reportTab]);
  }, [reportTab, fetchJobReports, fetchTaskReports]);

  useEffect(() => {
    if (isValidReportTab(initialReportTabProp)) return;
    const fromRouter = location.state?.reportTab;
    if (isValidReportTab(fromRouter)) {
      setReportTab(fromRouter);
    }
  }, [location.key, location.state?.reportTab, initialReportTabProp]);

  useEffect(() => {
    if (reportTab === REPORT_TAB.ALL) {
      fetchJobReports();
    } else {
      fetchTaskReports(TASK_CATEGORY_BY_TAB[reportTab]);
    }
  }, [reportTab, fetchJobReports, fetchTaskReports]);

  const handleViewJob = (job) => {
    const jobId = job.job_id || job.id;
    if (!jobId) return;
    navigate(`/job/${jobId}`, {
      state: {
        fromAdmin: true,
        job,
      },
    });
  };

  const isTaskReportTab = reportTab !== REPORT_TAB.ALL;

  const isPendingTaskRow = (job) =>
    (job.status || "pending").toString().toLowerCase() === "pending";

  const getTaskCategoryForJob = (job) =>
    job.category || TASK_CATEGORY_BY_TAB[reportTab];

  const isReopenTaskCategory = (category) => category === "reopenjob";

  const handleOpenApproveModal = (job) => {
    setApprovalModalJob(job);
  };

  const handleModalEdit = () => {
    const job = approvalModalJob;
    if (!job) return;
    const jid = job.job_id || job.id;
    const taskId = job.task_id ?? job.id;
    const cat = getTaskCategoryForJob(job);
    if (!jid) {
      alert("Job ID missing for edit.");
      return;
    }
    if (!taskId) {
      alert("Task ID missing.");
      return;
    }
    setApprovalModalJob(null);
    navigate(`/admin/edit-job/${jid}`, {
      state: {
        fromApproveFlow: true,
        approveTaskId: taskId,
        approveType: cat,
        employer_id: job.employer_id || job.recruiter_id,
        employerId: job.employer_id || job.recruiter_id,
      },
    });
  };

  const handleModalApprove = async () => {
    const job = approvalModalJob;
    if (!job) return;
    const taskId = job.task_id ?? job.id;
    if (!taskId) {
      alert("Task ID missing.");
      return;
    }
    const cat = getTaskCategoryForJob(job);
    const jobId = job.job_id || job.id;
    try {
      setActionLoading(`approve-${taskId}`);
      if (cat === "editjob") {
        await adminService.approveEditedJob(taskId);
      } else if (cat === "closedjob") {
        await adminService.approveJobClosing(taskId);
      } else if (cat === "reopenjob") {
        await adminService.approveReopenJob(taskId, jobId);
      } else {
        await adminService.approveJob(taskId);
      }
      setApprovalModalJob(null);
      await refreshList();
    } catch (err) {
      console.error("Approve failed:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to approve. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (job) => {
    setRejectModalJob(job);
    setRejectReason("");
    setRejectReasonError("");
  };

  const closeRejectModal = () => {
    setRejectModalJob(null);
    setRejectReason("");
    setRejectReasonError("");
  };

  const handleSubmitReject = async () => {
    const job = rejectModalJob;
    if (!job) return;
    const taskId = job.task_id ?? job.id;
    if (!taskId) return;

    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectReasonError("Please enter a reason for rejection.");
      return;
    }
    setRejectReasonError("");

    try {
      setActionLoading(`reject-${taskId}`);
      await adminService.rejectJob(taskId, trimmed);
      closeRejectModal();
      await refreshList();
    } catch (err) {
      console.error("Reject failed:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reject. Please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPremium = async (job, isPremium = true) => {
    const jobId = job.job_id || job.id;
    if (!jobId) return;

    try {
      setActionLoading(`premium-${jobId}`);
      await adminService.markJobPremium(jobId, isPremium, 'job');

      const updatePremium = (j) =>
        (j.job_id || j.id) === jobId ? { ...j, premium_job: isPremium, is_premium: isPremium } : j;
      setAllJobsFromApi(prev => prev.map(updatePremium));
      setFilteredJobs(prev => prev.map(updatePremium));
    } catch (err) {
      console.error('Failed to mark job as premium:', err);
      alert('Failed to update premium status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper function to filter jobs by date
  const filterJobsByDate = (jobs, dateFilter) => {
    if (dateFilter === "all") return jobs;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return jobs.filter(job => {
      const jobDate = new Date(job.created_at);
      const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());

      switch (dateFilter) {
        case "today":
          return jobDateOnly.getTime() === today.getTime();
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return jobDateOnly.getTime() === yesterday.getTime();
        }
        case "last7days": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return jobDateOnly >= weekAgo;
        }
        case "last30days": {
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          return jobDateOnly >= monthAgo;
        }
        case "thisMonth": {
          return jobDate.getMonth() === now.getMonth() &&
            jobDate.getFullYear() === now.getFullYear();
        }
        case "lastMonth": {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return jobDate.getMonth() === lastMonth.getMonth() &&
            jobDate.getFullYear() === lastMonth.getFullYear();
        }
        default:
          return true;
      }
    });
  };

  // Helper function to sort jobs
  const sortJobs = (jobs, sortBy) => {
    const sorted = [...jobs];

    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        break;
      case "oldest":
        sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateA - dateB;
        });
        break;
      case "mostApplications":
        sorted.sort((a, b) => (b.application_count || 0) - (a.application_count || 0));
        break;
      case "leastApplications":
        sorted.sort((a, b) => (a.application_count || 0) - (b.application_count || 0));
        break;
      case "companyAZ":
        sorted.sort((a, b) =>
          (a.company_name || '').localeCompare(b.company_name || '')
        );
        break;
      case "companyZA":
        sorted.sort((a, b) =>
          (b.company_name || '').localeCompare(a.company_name || '')
        );
        break;
      case "titleAZ":
        sorted.sort((a, b) =>
          (a.job_title || '').localeCompare(b.job_title || '')
        );
        break;
      case "titleZA":
        sorted.sort((a, b) =>
          (b.job_title || '').localeCompare(a.job_title || '')
        );
        break;
      default:
        break;
    }

    return sorted;
  };

  useEffect(() => {
    let filtered = allJobsFromApi.filter(job =>
      job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered = filterJobsByDate(filtered, dateFilter);
    filtered = sortJobs(filtered, sortBy);

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, dateFilter, sortBy, allJobsFromApi]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'string') return salary;
    if (salary.min && salary.max) {
      return `${salary.min} - ${salary.max} ${salary.currency || 'INR'}`;
    }
    return `${salary.min || salary.max} ${salary.currency || 'INR'}`;
  };

  const handleQuickExport = async (job) => {
    try {
      // Fetch applications for this job
      const applicationsData = await adminService.getApplicationsForJob(job.id);
      const applications = applicationsData.applications || [];

      if (applications.length === 0) {
        alert('No applications to export for this job.');
        return;
      }

      // Prepare basic export data
      const exportData = applications.map(app => ({
        'Application ID': app.application_id || 'N/A',
        'Job Title': job.job_title || 'N/A',
        'Company Name': job.company_name || 'N/A',
        'Candidate Name': app.student_name || 'Unknown',
        'Email': app.student_email || app.email || 'N/A',
        'Phone': app.student_phone || 'N/A',
        'Skills': app.student_skills || 'N/A',
        'Experience': app.student_experience || 'N/A',
        'Status': app.status || 'pending',
        'Applied Date': formatDate(app.created_at || app.applied_date),
        'Resume URL': app.resume_url || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');

      const sanitizedCompany = (job.company_name || 'Unknown').replace(/[^a-zA-Z0-9_]/g, '_');
      const sanitizedJobTitle = (job.job_title || 'Job').replace(/[^a-zA-Z0-9_]/g, '_');
      const filename = `${sanitizedCompany}_${sanitizedJobTitle}_Applications.xlsx`;

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Excel export successful');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel file. Please try again.');
    }
  };

  const handleCloseJob = async (job) => {
    if (!job || !job.id) return;

    const confirmClose = window.confirm(
      `Are you sure you want to close this job "${job.job_title}"? This will remove it from public display and no new applications will be accepted.`
    );

    if (!confirmClose) return;

    try {
      setLoading(true);
      setError(null);
      await adminService.closeJobAdmin(job.id);

      alert('Job closed successfully! The job has been removed from public display.');
      await refreshList();
    } catch (error) {
      console.error('Failed to close job:', error);
      setError('Failed to close job. Please try again.');
      alert('Failed to close job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (job) => {
    if (!job || !job.id) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete this job "${job.job_title}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      setError(null);
      await adminService.deleteAdminJob(job.id);
      alert("Job deleted successfully.");
      await refreshList();
    } catch (error) {
      console.error("Failed to delete job:", error);
      setError("Failed to delete job. Please try again.");
      alert("Failed to delete job. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center max-w-7xl mx-auto mt-20`}>
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Briefcase className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading job reports...</h3>
          <p className={`${textSecondary} mt-2`}>Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Job Application Reports</h1>
              <p className={`text-sm ${textSecondary} mt-1`}>View application statistics and export candidate data</p>
            </div>
            <button
              onClick={refreshList}
              className={`px-4 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2`}
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

{/* Search and Filters */}
<div className={`${cardBg} rounded-2xl border ${borderColor} p-4 sm:p-5 mb-6 shadow-sm`}>
  
  <div className="flex flex-col lg:flex-row gap-4 lg:items-center">

    {/* Search */}
    <div className="w-full lg:flex-1">
      <div className="relative group">

        <Search
          size={18}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search job, company, location..."
          className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border ${borderColor} rounded-xl
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          text-sm transition-all duration-200 ${cardBg} ${textColor}`}
        />

      </div>
    </div>

    {/* Filters */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:flex gap-3 w-full lg:w-auto">

      {/* Date Filter */}
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 
      rounded-xl px-3 sm:px-4 py-2 border border-gray-200 dark:border-gray-700 
      hover:border-indigo-400 transition">

        <Calendar size={16} className={textSecondary} />

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={`bg-transparent outline-none text-xs sm:text-sm ${textColor} cursor-pointer`}
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 days</option>
          <option value="last30days">Last 30 days</option>
          <option value="thisMonth">This month</option>
          <option value="lastMonth">Last month</option>
        </select>

      </div>

      {/* Sort Filter */}
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 
      rounded-xl px-3 sm:px-4 py-2 border border-gray-200 dark:border-gray-700 
      hover:border-indigo-400 transition">

        <ArrowUpDown size={16} className={textSecondary} />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`bg-transparent outline-none text-xs sm:text-sm ${textColor} cursor-pointer`}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="mostApplications">Most applications</option>
          <option value="leastApplications">Least applications</option>
          <option value="companyAZ">Company A–Z</option>
          <option value="companyZA">Company Z–A</option>
          <option value="titleAZ">Job title A–Z</option>
          <option value="titleZA">Job title Z–A</option>
        </select>

      </div>

    </div>
  </div>
</div>

        {/* Report source tabs: full-width responsive grid */}
        <div
          className={`${cardBg} rounded-2xl border ${borderColor} p-3 sm:p-4 mb-6 shadow-sm w-full`}
        >
          <div
            className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3"
            role="tablist"
            aria-label="Job report source"
          >
            {[
              { id: REPORT_TAB.ALL, label: "All" },
              { id: REPORT_TAB.NEW_JOB, label: "New Job" },
              { id: REPORT_TAB.EDIT_JOB, label: "Edit Job" },
              { id: REPORT_TAB.CLOSE_JOB, label: "Close job" },
              { id: REPORT_TAB.REOPEN_JOB, label: "Reopen job" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={reportTab === tab.id}
                onClick={() => setReportTab(tab.id)}
                className={`w-full min-h-[44px] sm:min-h-[48px] px-2 sm:px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors flex items-center justify-center text-center leading-tight whitespace-normal break-words ${
                  reportTab === tab.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                    : `${borderColor} ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-[0.98]`
                }`}
              >
                {tab.label}
              </button>
            ))}
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
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Building size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No job reports found</h3>
            <p className={`${textSecondary} mb-6`}>
              {searchTerm || dateFilter !== 'all'
                ? "Try adjusting your filters"
                : reportTab === REPORT_TAB.ALL
                  ? "No jobs available for reporting"
                  : "No tasks in this category"}
            </p>
          </div>
        )}

        {/* Job Reports */}
        <div className="space-y-3">
          {currentJobs.map(job => {
            const showTaskActions =
              isTaskReportTab && isPendingTaskRow(job);
            const taskCategory = getTaskCategoryForJob(job);
            const isReopenTask = isReopenTaskCategory(taskCategory);
            const taskId = job.task_id ?? job.id;
            return (
              <div
                key={String(job.task_id ?? job.job_id ?? job.id)}
                onClick={() => !showTaskActions && handleViewJob(job)}
                className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all ${!showTaskActions ? "cursor-pointer" : ""}`}
              >
                  <div className="p-3">
                    {/* Job Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex gap-3 flex-1 w-full min-w-0">
                        <JobReportLogoBadge
                          job={job}
                          borderColor={borderColor}
                          isDark={isDark}
                          textSecondary={textSecondary}
                        />
                        <div className="flex-1 min-w-0">
                        {showTaskActions ? (
                          <h3
                            className={`text-base font-bold ${textColor} leading-tight mb-2 break-words`}
                          >
                            {job.job_title || 'N/A'}
                          </h3>
                        ) : (
                          <h3
                            role="button"
                            tabIndex={0}
                            onClick={() => handleViewJob(job)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewJob(job); } }}
                            className={`text-base font-bold ${textColor} hover:text-blue-600 cursor-pointer leading-tight mb-2 break-words`}
                          >
                            {job.job_title || 'N/A'}
                          </h3>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Building size={14} className="flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{job.company_name || 'Unknown Company'}</span>
                          </span>
                          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-400"></span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{job.location || 'Not specified'}</span>
                          </span>
                        </div>
                        </div>
                      </div>
                      <div className="flex flex-row flex-wrap items-center justify-end gap-2 w-full sm:w-auto sm:min-w-[200px] mt-1 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-700">
                        {showTaskActions ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenApproveModal(job);
                              }}
                              disabled={
                                actionLoading === `approve-${taskId}` ||
                                actionLoading === `reject-${taskId}`
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            {!isReopenTask && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRejectModal(job);
                                }}
                                disabled={
                                  actionLoading === `approve-${taskId}` ||
                                  actionLoading === `reject-${taskId}`
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:bg-red-950/40 dark:hover:bg-red-950/60 disabled:opacity-50"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            )}
                          </>
                        ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${job.status === 'open' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                            job.status === 'closed' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                              'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                          }`} style={{ fontSize: '0.7rem' }}>
                          {job.status === 'open' ? 'Active' : job.status === 'closed' ? 'Closed' : job.status || 'Active'}
                        </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                        💰 {formatSalary(job.salary_range)}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                        <Calendar size={12} />
                        {formatDate(job.created_at)}
                      </span>
                    </div>
                        {/* <div className={`flex items-center gap-4 p-2 rounded-lg mb-2.5 border ${borderColor} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-1.5">
                            <Users size={13} className="text-blue-500" />
                            <span className={`text-xs font-semibold ${textColor}`}>{job.application_count ?? 0}</span>
                            <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.65rem' }}>applications (from listings)</span>
                          </div>
                        </div> */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-3">
                          {!showTaskActions && (
                            <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/edit-job/${job.id}`, { state: { employer_id: job.employer_id } });
                            }}
                            className="col-span-1 sm:col-auto px-2 py-2 sm:py-1.5 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-500/30 dark:text-blue-300 dark:bg-blue-500/20 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                          >
                            <Briefcase size={14} />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkPremium(job, !(job.premium_job || job.is_premium));
                            }}
                            disabled={actionLoading === `premium-${job.job_id || job.id}`}
                            className={`col-span-1 sm:col-auto px-2 py-2 sm:py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center justify-center gap-1.5 disabled:opacity-50`}
                          >
                            <Star size={14} />
                            {(job.premium_job || job.is_premium) ? 'Premium' : 'Feature Job'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseJob(job);
                            }}
                            className="col-span-1 sm:col-auto px-4 py-2 sm:py-1.5 bg-amber-500 text-white rounded-lg text-sm sm:text-xs font-medium hover:bg-amber-600 flex items-center justify-center gap-1.5"
                            disabled={loading}
                          >
                            <XCircle size={14} />
                            Close Job
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJob(job);
                            }}
                            className="col-span-2 sm:col-auto px-4 py-2 sm:py-1.5 bg-red-600 text-white rounded-lg text-sm sm:text-xs font-medium hover:bg-red-700 flex items-center justify-center gap-1.5"
                            disabled={loading}
                          >
                            <Trash2 size={14} />
                            Delete Job
                          </button>
                            </>
                          )}
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

      {approvalModalJob && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-modal-title"
          onClick={() => setApprovalModalJob(null)}
        >
          <div
            className={`${cardBg} rounded-xl border ${borderColor} shadow-xl max-w-md w-full p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="approve-modal-title"
              className={`text-lg font-bold ${textColor} mb-1`}
            >
              Approve request
            </h2>
            <p className={`text-sm ${textSecondary} mb-4`}>
              {isReopenTaskCategory(getTaskCategoryForJob(approvalModalJob))
                ? "Review the reopen request and approve."
                : "Review the job, edit details if needed, then approve."}
            </p>
            <div className="flex gap-3 items-start mb-6">
              <JobReportLogoBadge
                job={approvalModalJob}
                borderColor={borderColor}
                isDark={isDark}
                textSecondary={textSecondary}
                sizeClass="w-14 h-14"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${textColor} mb-1`}>
                  {approvalModalJob.job_title || "N/A"}
                </p>
                <p className={`text-xs ${textSecondary}`}>
                  {approvalModalJob.company_name || ""}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setApprovalModalJob(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${borderColor} ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700/50`}
              >
                Cancel
              </button>
              {!isReopenTaskCategory(getTaskCategoryForJob(approvalModalJob)) && (
                <button
                  type="button"
                  onClick={handleModalEdit}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-950/40"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Briefcase size={16} />
                    Edit job
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={handleModalApprove}
                disabled={
                  !!actionLoading &&
                  actionLoading ===
                    `approve-${approvalModalJob.task_id ?? approvalModalJob.id}`
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {actionLoading ===
                `approve-${approvalModalJob.task_id ?? approvalModalJob.id}` ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approving…
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModalJob && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          onClick={closeRejectModal}
        >
          <div
            className={`${cardBg} rounded-xl border ${borderColor} shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="reject-modal-title"
              className={`text-lg font-bold ${textColor} mb-1`}
            >
              Reject request
            </h2>
            <p className={`text-sm ${textSecondary} mb-4`}>
              The employer may see this reason. Please be clear and professional.
            </p>
            <div className="flex gap-3 items-start mb-4">
              <JobReportLogoBadge
                job={rejectModalJob}
                borderColor={borderColor}
                isDark={isDark}
                textSecondary={textSecondary}
                sizeClass="w-14 h-14"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${textColor} mb-1`}>
                  {rejectModalJob.job_title || "N/A"}
                </p>
                <p className={`text-xs ${textSecondary}`}>
                  {rejectModalJob.company_name || ""}
                </p>
              </div>
            </div>
            <label
              htmlFor="admin-reject-reason"
              className={`block text-sm font-medium ${textColor} mb-1.5`}
            >
              Rejection reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="admin-reject-reason"
              rows={4}
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (rejectReasonError) setRejectReasonError("");
              }}
              placeholder="e.g. Incomplete description, policy violation, duplicate posting…"
              className={`w-full rounded-lg px-3 py-2 text-sm ${textColor} ${
                rejectReasonError
                  ? "border border-red-500 focus:ring-red-500 focus:border-red-500"
                  : `border ${borderColor}`
              } ${isDark ? "bg-gray-900/50" : "bg-white"} focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[100px]`}
            />
            {rejectReasonError && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1.5">
                {rejectReasonError}
              </p>
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-6">
              <button
                type="button"
                onClick={closeRejectModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${borderColor} ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700/50`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReject}
                disabled={
                  !!actionLoading &&
                  actionLoading ===
                    `reject-${rejectModalJob.task_id ?? rejectModalJob.id}`
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {actionLoading ===
                `reject-${rejectModalJob.task_id ?? rejectModalJob.id}` ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting…
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Reject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobReports
