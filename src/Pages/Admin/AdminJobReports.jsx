import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { Search, Download, Users, Building, MapPin, Calendar, Eye, Briefcase, RefreshCw, Trash2, ArrowUpDown, CheckCircle, XCircle, Check, X, Star } from "lucide-react";
import * as XLSX from 'xlsx';

const AdminJobReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [allJobsFromApi, setAllJobsFromApi] = useState([]); // sirf API jobs (40) – sab tabs isi se
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [jobTypeTab, setJobTypeTab] = useState("all"); // all | newjob | editjob | closedjob
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const jobsPerPage = 25;

  const [confirmJob, setConfirmJob] = useState(null); // job object for approve modal

  useEffect(() => {
    fetchJobReports();
  }, []);

  // Update ke baad Job Reports pe aaye to usi job ka Approve modal khol do
  useEffect(() => {
    const openJobId = location.state?.openApproveForJobId;
    if (!openJobId || !allJobsFromApi.length) return;
    const job = allJobsFromApi.find((j) => (j.job_id || j.id) === openJobId);
    if (job) {
      setConfirmJob(job);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [allJobsFromApi, location.state?.openApproveForJobId, location.pathname, navigate]);

  const fetchJobReports = async () => {
    try {
      setLoading(true);
      setError(null);

      let pendingTasksData = [];
      try {
        pendingTasksData = await adminService.getPendingJobs();
      } catch (err) {
        console.warn('Failed to fetch pending tasks:', err);
      }

      const allTasks = pendingTasksData || [];
      // Pending NEW JOB POSTINGS (postnewjob / editjob) – approve/reject ke liye
      const postNewJobTasks = allTasks.filter(
        (t) => (t.category === 'postnewjob' || t.category === 'editjob') && (t.status === 'pending' || t.status === 'rejected')
      );
      const jobIdToPostTask = {};
      postNewJobTasks.forEach((t) => {
        const jid = t.job_id;
        if (jid != null && jid !== '' && !jobIdToPostTask[jid]) {
          jobIdToPostTask[jid] = { task_id: t.task_id || t.id, status: t.status || 'pending' };
        }
      });

      // Candidate applications (for application counts only)
      const newAppTasks = allTasks.filter((t) => t.category === 'newapplication');

      let jobMapById = {};
      try {
        const allJobs = await adminService.getAllJobsForAdmin();
        const nonGov = (allJobs || []).filter((j) => j.job_type !== 'GOVERNMENT');
        nonGov.forEach((j) => {
          const id = j.job_id || j.id;
          if (id) jobMapById[id] = j;
        });
      } catch (e) {
        console.warn('Failed to fetch all jobs for admin:', e);
      }

      // Har job_id ke liye task categories (Edit Job / Close Job / New Job tabs ke liye)
      const getTaskCategoriesForJob = (jobId) => {
        const cats = [...new Set(
          allTasks.filter((t) => t.job_id === jobId).map((t) => t.category)
        )].filter((c) => ['postnewjob', 'editjob', 'closedjob'].includes(c));
        return cats;
      };
      const getTaskTypeLabel = (cat) => {
        if (cat === 'postnewjob') return 'New Job';
        if (cat === 'editjob') return 'Edit Job';
        if (cat === 'closedjob') return 'Close Job';
        return 'Job';
      };
      const rawStatus = (s) => (s || '').toString().toLowerCase();

      // 1) API jobs (40) – enriched with task info
      const apiJobsEnriched = Object.values(jobMapById).map((apiJob) => {
        const id = apiJob.job_id || apiJob.id;
        const postInfo = jobIdToPostTask[id];
        const taskCategories = getTaskCategoriesForJob(id);
        const tasksForJob = allTasks.filter((t) => t.job_id === id);
        const pending_task_count = tasksForJob.filter((t) => rawStatus(t.status) === 'pending').length;
        const fulfilled_task_count = tasksForJob.filter((t) => rawStatus(t.status) === 'fulfilled').length;
        return {
          ...apiJob,
          id,
          admin_approval_status: postInfo?.status || 'approved',
          task_id: postInfo?.task_id,
          taskCategories,
          pending_task_count,
          fulfilled_task_count,
        };
      });

      // 2) Pending jobs – job_ids in tasks but NOT in API (nayi post abhi getalljobs me nahi aati)
      const uniqueTaskJobIds = [...new Set(
        allTasks.map((t) => t.job_id).filter((jid) => jid != null && jid !== '' && !String(jid).startsWith('no-job-'))
      )];
      const syntheticJobs = uniqueTaskJobIds
        .filter((jid) => !jobMapById[jid])
        .map((jid) => {
          const firstTask = allTasks.find((t) => t.job_id === jid);
          const postInfo = jobIdToPostTask[jid];
          const taskCategories = getTaskCategoriesForJob(jid);
          const primaryCategory = firstTask?.category;
          const tasksForJob = allTasks.filter((t) => t.job_id === jid);
          const pending_task_count = tasksForJob.filter((t) => rawStatus(t.status) === 'pending').length;
          const fulfilled_task_count = tasksForJob.filter((t) => rawStatus(t.status) === 'fulfilled').length;
          const companyName = firstTask?.company_name || 'Unknown Company';
          return {
            id: jid,
            job_id: jid,
            job_title: `${companyName} - ${getTaskTypeLabel(primaryCategory)}`,
            company_name: companyName,
            location: firstTask?.location || 'Not specified',
            created_at: firstTask?.posted_date || firstTask?.updated_date,
            admin_approval_status: postInfo?.status || 'pending',
            task_id: postInfo?.task_id,
            taskCategories,
            pending_task_count,
            fulfilled_task_count,
            employer_id: firstTask?.employer_id || firstTask?.recruiter_id || null,
            // Synthetic (pending) jobs me `posted_by` available na hone par recruiter_id se infer karte hain
            posted_by: firstTask?.recruiter_id ? 'RECRUITER' : 'ADMIN',
          };
        });

      const allEnriched = [...apiJobsEnriched, ...syntheticJobs];
      const withCounts = await Promise.all(
        allEnriched.map(async (job) => {
          try {
            const applicationsData = await adminService.getApplicationsForJob(job.id);
            const applications = applicationsData.applications || [];
            const pendingApplicationsForJob = newAppTasks.filter(
              (task) => rawStatus(task.status) === 'pending' && task.job_id === job.id
            );
            const totalCount = applications.length + pendingApplicationsForJob.length;
            return {
              ...job,
              application_count: totalCount,
              approved_count: applications.length,
              pending_count: pendingApplicationsForJob.length,
            };
          } catch (error) {
            return {
              ...job,
              application_count: job.application_count || 0,
              approved_count: 0,
              pending_count: 0,
            };
          }
        })
      );
      const sortedJobs = withCounts.sort(
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
  };

  const approveJobDirect = async (job) => {
    const taskId = job.task_id || job.id;
    try {
      setActionLoading(`approve-${job.id}`);
      await adminService.approveJob(taskId);
      await fetchJobReports();
    } catch (error) {
      console.error('Error approving job:', error);
      alert('Failed to approve job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveJob = (job) => {
    setConfirmJob(job);
  };

  const handleViewJob = (job) => {
    const jobId = job.job_id || job.id;
    if (!jobId) return;
    navigate(`/job/${jobId}`, { state: { job, fromAdmin: true } });
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

  const handleRejectJob = async (job) => {
    if (!window.confirm(`Are you sure you want to reject "${job.job_title}"?`)) return;
    const taskId = job.task_id || job.id;
    try {
      setActionLoading(`reject-${job.id}`);
      await adminService.rejectJob(taskId);
      await fetchJobReports();
    } catch (error) {
      console.error('Error rejecting job:', error);
      alert('Failed to reject job');
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

  // Sab tabs sirf 40 API jobs se – All = sab 40; New/Edit/Close = inhi 40 me se category filter
  useEffect(() => {
    let filtered = allJobsFromApi.filter(job =>
      job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sirf Recruiter ke jobs dikhane hain
    filtered = filtered.filter((job) => {
      const postedByRaw = (job?.posted_by ?? '').toString().trim();
      const postedBy = postedByRaw.toUpperCase();
      if (postedBy) return postedBy === 'RECRUITER';
      // Fallback: agar posted_by na ho, toh recruiter_id presence check karen
      return Boolean(job?.recruiter_id);
    });

    const hasCategory = (job, cat) => (job.taskCategories || []).includes(cat);
    const isApproved = (job) =>
      job.admin_approval_status === 'approved' || job.admin_approval_status === 'fulfilled';

    if (jobTypeTab === 'all') {
      filtered = filtered.filter((job) => isApproved(job));
    } else if (jobTypeTab === 'newjob') {
      filtered = filtered.filter((job) => hasCategory(job, 'postnewjob'));
    } else if (jobTypeTab === 'editjob') {
      filtered = filtered.filter((job) => hasCategory(job, 'editjob'));
    } else if (jobTypeTab === 'closedjob') {
      filtered = filtered.filter((job) => hasCategory(job, 'closedjob'));
    }

    filtered = filterJobsByDate(filtered, dateFilter);
    filtered = sortJobs(filtered, sortBy);

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, dateFilter, sortBy, jobTypeTab, allJobsFromApi]);

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

  const handleViewApplications = (job) => {
    navigate(`/admin/job-reports/applications/${job.id}`, {
      state: {
        totalApplications: job.application_count || 0,
        jobTitle: job.job_title,
        companyName: job.company_name
      }
    });
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

      // Call the API to close the job
      const response = await fetch(
        `https://wxxi8h89m5.execute-api.ap-southeast-1.amazonaws.com/default/closedjobopening?job_id=${job.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Job closed successfully:', result);

      alert('Job closed successfully! The job has been removed from public display.');
      // Refresh the job reports list
      await fetchJobReports();
    } catch (error) {
      console.error('Failed to close job:', error);
      setError('Failed to close job. Please try again.');
      alert('Failed to close job. Please try again.');
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
      {/* Approve confirmation modal */}
      {confirmJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} w-full max-w-md mx-4`}>
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className={`text-base font-bold ${textColor}`}>Approve Job</h2>
              <button
                onClick={() => setConfirmJob(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <p className={`text-sm font-semibold ${textColor}`}>{confirmJob.job_title}</p>
                <p className={`text-xs ${textSecondary}`}>{confirmJob.company_name}</p>
              </div>
              <p className={`text-xs ${textSecondary}`}>
                Do you want to review and edit this job before approving, or approve it as it is?
              </p>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setConfirmJob(null);
                  navigate(`/admin/edit-job/${confirmJob.id}`, {
                    state: {
                      employer_id: confirmJob.employer_id,
                      fromApproveFlow: true,
                      approveTaskId: confirmJob.task_id || confirmJob.id,
                      approveType: confirmJob.taskCategories?.includes("editjob")
                        ? "editjob"
                        : confirmJob.taskCategories?.includes("postnewjob")
                          ? "postnewjob"
                          : confirmJob.taskCategories?.includes("closedjob")
                            ? "closedjob"
                            : "editjob"
                    }
                  });
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Briefcase size={14} />
                Edit Job
              </button>
              <button
                type="button"
                onClick={async () => {
                  const job = confirmJob;
                  setConfirmJob(null);
                  await approveJobDirect(job);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-sm font-semibold text-white"
              >
                <Check size={14} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Job Application Reports</h1>
              <p className={`text-sm ${textSecondary} mt-1`}>View application statistics and export candidate data</p>
            </div>
            <button
              onClick={fetchJobReports}
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



<div className={`${cardBg} rounded-2xl border ${borderColor} p-4 mb-6 shadow-sm`}>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2">

  <button
    onClick={() => setJobTypeTab('all')}
    className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition
    ${jobTypeTab === 'all'
    ? 'bg-indigo-600 text-white shadow'
    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-100'}`}
  >
    All
  </button>

  <button
    onClick={() => setJobTypeTab('newjob')}
    className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition
    ${jobTypeTab === 'newjob'
    ? 'bg-indigo-600 text-white shadow'
    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-100'}`}
  >
    New Job
  </button>

  <button
    onClick={() => setJobTypeTab('editjob')}
    className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition
    ${jobTypeTab === 'editjob'
    ? 'bg-indigo-600 text-white shadow'
    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-100'}`}
  >
    Edit
  </button>

  <button
    onClick={() => setJobTypeTab('closedjob')}
    className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition
    ${jobTypeTab === 'closedjob'
    ? 'bg-indigo-600 text-white shadow'
    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-indigo-100'}`}
  >
    Close
  </button>

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
              {searchTerm || dateFilter !== 'all' ? "Try adjusting your filters" : "No jobs available for reporting"}
            </p>
          </div>
        )}

        {/* Job Reports - Full card for All/New/Edit; simple card for Close */}
        <div className="space-y-3">
          {currentJobs.map(job => {
            const isCloseTab = jobTypeTab === 'closedjob';

            return (
              <div
                key={job.id}
                className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all ${isCloseTab ? 'p-3' : ''}`}
              >
                {isCloseTab ? (
                  /* Close tab: simple single-row card */
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-bold ${textColor} truncate`}>{job.job_title || 'N/A'}</h3>
                      <p className={`text-xs ${textSecondary} truncate`}>
                        {job.company_name || 'Unknown'} · {job.location || '—'}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 flex-shrink-0 w-fit">
                      Closed
                    </span>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewJob(job)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleViewApplications(job)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                      >
                        Applications ({job.application_count || 0})
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3">
                    {/* Job Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex-1 w-full min-w-0">
                        <h3 className={`text-base font-bold ${textColor} hover:text-blue-600 cursor-pointer leading-tight mb-2 break-words`}>
                          {job.job_title || 'N/A'}
                        </h3>
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
                      <div className="flex flex-row items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-700">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${job.status === 'open' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                            job.status === 'closed' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                              'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                          }`} style={{ fontSize: '0.7rem' }}>
                          {job.status === 'open' ? 'Active' : job.status === 'closed' ? 'Closed' : job.status || 'Active'}
                        </span>
                        {job.admin_approval_status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRejectJob(job)}
                              disabled={actionLoading === `reject-${job.id}`}
                              className="flex-initial px-3 py-1.5 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-500/30 dark:text-red-400 dark:bg-red-500/20 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {actionLoading === `reject-${job.id}` ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500" /> : <X size={14} />}
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveJob(job)}
                              disabled={actionLoading === `approve-${job.id}`}
                              className="flex-initial px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {actionLoading === `approve-${job.id}` ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> : <Check size={14} />}
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${(job.admin_approval_status === 'approved' || job.admin_approval_status === 'fulfilled')
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : job.admin_approval_status === 'rejected'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`} style={{ fontSize: '0.7rem' }}>
                            {(job.admin_approval_status === 'approved' || job.admin_approval_status === 'fulfilled') ? 'Approved' : job.admin_approval_status === 'rejected' ? 'Rejected' : '—'}
                          </span>
                        )}
                        {/* {(job.pending_task_count > 0 || job.fulfilled_task_count > 0) && (
                          <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                            {job.pending_task_count > 0 && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 rounded text-xs font-semibold">
                                {job.pending_task_count} Pending
                              </span>
                            )}
                            {job.fulfilled_task_count > 0 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 rounded text-xs font-semibold">
                                {job.fulfilled_task_count} Fulfilled
                              </span>
                            )}
                          </div>
                        )} */}
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
                    {job.admin_approval_status !== 'pending' && (
                      <>
                        <div className={`flex items-center gap-4 p-2 rounded-lg mb-2.5 border ${borderColor} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-1.5">
                            <Users size={13} className="text-blue-500" />
                            <span className={`text-xs font-semibold ${textColor}`}>{job.application_count || 0}</span>
                            <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.65rem' }}>applications</span>
                          </div>
                          {job.approved_count !== undefined && job.pending_count !== undefined && (
                            <>
                              <div className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold text-green-600 dark:text-green-400`}>{job.approved_count}</span>
                                <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.6rem' }}>approved</span>
                                {job.pending_count > 0 && (
                                  <>
                                    <span className={`text-xs ${textSecondary}`}>·</span>
                                    <span className={`text-xs font-semibold text-yellow-600 dark:text-yellow-400`}>{job.pending_count}</span>
                                    <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.6rem' }}>pending</span>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-3">
                          <button
                            onClick={() => handleViewApplications(job)}
                            className="col-span-2 sm:col-auto px-4 py-2 sm:py-1.5 bg-blue-600 text-white rounded-lg text-sm sm:text-xs font-medium hover:bg-blue-700 flex items-center justify-center gap-1.5"
                          >
                            <Eye size={14} />
                            View Applications ({job.application_count || 0})
                          </button>
                          <button
                            onClick={() => navigate(`/admin/edit-job/${job.id}`, { state: { employer_id: job.employer_id } })}
                            className="col-span-1 sm:col-auto px-2 py-2 sm:py-1.5 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-500/30 dark:text-blue-300 dark:bg-blue-500/20 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                          >
                            <Briefcase size={14} />
                            Edit / View
                          </button>
                          <button
                            onClick={() => handleMarkPremium(job, !(job.premium_job || job.is_premium))}
                            disabled={actionLoading === `premium-${job.job_id || job.id}`}
                            className={`col-span-1 sm:col-auto px-2 py-2 sm:py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-yellow-50 dark:hover:bg-yellow-900/20 flex items-center justify-center gap-1.5 disabled:opacity-50`}
                          >
                            <Star size={14} />
                            {(job.premium_job || job.is_premium) ? 'Premium' : 'Feature Job'}
                          </button>
                          <button
                            onClick={() => handleCloseJob(job)}
                            className="col-span-2 sm:col-auto px-4 py-2 sm:py-1.5 bg-red-600 text-white rounded-lg text-sm sm:text-xs font-medium hover:bg-red-700 flex items-center justify-center gap-1.5"
                            disabled={loading}
                          >
                            <Trash2 size={14} />
                            Delete Job
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
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
    </div>
  );
};

export default AdminJobReports
