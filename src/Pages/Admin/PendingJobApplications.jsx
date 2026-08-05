import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import adminApiClient from "../../services/adminApiClient";
import { Check, X, FileText, Download, ExternalLink, Search, Briefcase, Building, Clock, Mail, Phone, Calendar, Eye, MapPin, ArrowUpDown, Sparkles, User, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const isRecruiterJob = (app) => {
  const pb = (app?.posted_by ?? "").toString().trim().toUpperCase();
  if (pb === "ADMIN") return false;
  if (pb === "RECRUITER" || pb === "EMPLOYER") return true;
  return Boolean(app?.recruiter_id);
};

function PendingJobApplications({ embedded = false, role = "recruiter" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [allApplications, setAllApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState({});
  const [applicationDetails, setApplicationDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [jobTypes, setJobTypes] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showingRange, setShowingRange] = useState(null);
  const [filterCompanies, setFilterCompanies] = useState([]);
  const [filterJobs, setFilterJobs] = useState([]);
  const [filterStatuses, setFilterStatuses] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, companyFilter, jobFilter, statusFilter, dateFilter, sortBy, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [currentPage, debouncedSearch, companyFilter, jobFilter, statusFilter, dateFilter, sortBy, role, itemsPerPage]);

  useEffect(() => {
    if (!embedded) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, embedded]);

  const parseShowingRange = (showing, page = 1, limit = itemsPerPage, total = 0) => {
    if (typeof showing === 'number' && showing > 0) {
      const from = (page - 1) * limit + 1;
      const to = Math.min(from + showing - 1, total || from + showing - 1);
      return { from, to };
    }
    if (!showing) return null;
    if (typeof showing === 'object') {
      const from = showing.from ?? showing.start;
      const to = showing.to ?? showing.end;
      if (from != null && to != null) return { from: Number(from), to: Number(to) };
      return showing;
    }
    if (typeof showing === 'string') {
      const match = showing.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (match) return { from: Number(match[1]), to: Number(match[2]) };
    }
    return null;
  };

  const buildPageList = (current, total) => {
    if (total <= 1) return [1];
    const pages = new Set([1, total]);
    for (let i = current - 2; i <= current + 2; i += 1) {
      if (i >= 1 && i <= total) pages.add(i);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    sorted.forEach((page, index) => {
      if (index > 0 && page - sorted[index - 1] > 1) result.push('ellipsis');
      result.push(page);
    });
    return result;
  };

  const parseSkills = (raw) => {
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'string') {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const mapTaskStatusFromApi = (taskStatus) => {
    if (!taskStatus) return 'pending';
    const s = String(taskStatus).toLowerCase();
    if (s === 'fulfilled' || s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    return 'pending';
  };

  const normalizeApplicationStatus = (status) => String(status || '').trim().toLowerCase();

  const getBaseApplicationStatus = (application) =>
    application?.application?.status ??
    application?.baseApplicationStatus ??
    '';

  const getApplicationDetailsStatus = (application) =>
    application?.application_details?.status ??
    application?.applicationDetailsStatus ??
    '';

  const isApplicationApproved = (application) =>
    normalizeApplicationStatus(getBaseApplicationStatus(application)) === 'approved';

  const isApplicationRejected = (application) =>
    normalizeApplicationStatus(getBaseApplicationStatus(application)) === 'rejected';

  const getDisplayApplicationStatus = (application) => {
    const baseStatus = normalizeApplicationStatus(getBaseApplicationStatus(application));
    const detailsStatus = normalizeApplicationStatus(getApplicationDetailsStatus(application));

    if (baseStatus === 'approved') return 'approved';
    if (baseStatus === 'rejected') return 'rejected';

    if (baseStatus === 'pending' || !baseStatus) {
      if (detailsStatus) return detailsStatus;
    }

    return baseStatus || detailsStatus || 'pending';
  };

  const getApplicationStatusLabel = (status) => {
    const normalized = normalizeApplicationStatus(status);
    if (normalized === 'approved') return 'Approved';
    if (normalized === 'rejected') return 'Rejected';
    if (normalized === 'shortlisted') return 'Shortlisted';
    if (normalized === 'pending') return 'Pending';
    return status ? String(status).trim() : 'Pending';
  };

  const getApplicationStatusBadgeClass = (status) => {
    const normalized = normalizeApplicationStatus(status);
    if (normalized === 'approved') {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
    }
    if (normalized === 'rejected') {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
    }
    if (normalized === 'shortlisted') {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    }
    return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
  };

  const isAdminRole = () => String(role || '').toLowerCase() === 'admin';

  const canManageApplication = (application) => {
    if (isApplicationApproved(application) || isApplicationRejected(application)) return false;

    const displayStatus = normalizeApplicationStatus(getDisplayApplicationStatus(application));
    if (displayStatus === 'shortlisted') return false;

    // Admin-posted jobs don't create tasks — use application status directly
    if (isAdminRole()) {
      return displayStatus === 'pending';
    }

    if (!application?.task_id) return false;
    return application?.taskStatus === 'pending';
  };

  const getStatusLabel = (statusKey) => getApplicationStatusLabel(statusKey);

  const mapStatusToApi = (filter) => {
    const map = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
    return map[filter];
  };

  const getDateRangeFromFilter = (filter) => {
    if (filter === 'all') return {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const toISO = (d) => d.toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        return { date_from: toISO(today), date_to: toISO(today) };
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { date_from: toISO(yesterday), date_to: toISO(yesterday) };
      }
      case 'last7days': {
        const from = new Date(today);
        from.setDate(from.getDate() - 7);
        return { date_from: toISO(from), date_to: toISO(today) };
      }
      case 'last30days': {
        const from = new Date(today);
        from.setDate(from.getDate() - 30);
        return { date_from: toISO(from), date_to: toISO(today) };
      }
      case 'thisMonth': {
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        return { date_from: toISO(from), date_to: toISO(today) };
      }
      case 'lastMonth': {
        const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const to = new Date(now.getFullYear(), now.getMonth(), 0);
        return { date_from: toISO(from), date_to: toISO(to) };
      }
      default:
        return {};
    }
  };

  const buildStudentDetails = (userDetails, candidate, appDetails = {}) => {
    const ud = userDetails || {};
    const c = candidate || {};
    const profile = appDetails.student_profile || {};
    const rawMembership = c.membership_type || ud.membership_type || profile.plan || ud.plan || '';
    const normalizePlan = (value) => {
      const normalized = String(value || '').trim().toLowerCase();
      if (!normalized) return '';
      if (normalized === 'premium') return 'premium';
      if (normalized === 'basic' || normalized === 'standard') return 'basic';
      return normalized;
    };
    let plan = normalizePlan(rawMembership);
    if (!plan && (ud.premium_user === true || profile.premium_user === true)) {
      plan = 'premium';
    }
    const isPaidMember = plan === 'premium' || plan === 'basic';

    return {
      name: c.name || ud.full_name || ud.name || 'Unknown',
      email: c.email || ud.email || null,
      phone: c.phone_number || ud.phone_number || profile.phone_number || null,
      skills: parseSkills(ud.skills || appDetails.student_skills || profile.skills),
      location: ud.address?.city || ud.city || ud.location || profile.address?.city || null,
      experience: ud.experience || profile.experience || null,
      education: ud.education || profile.education || [],
      experience_years: ud.experience_years || null,
      bio: ud.bio || profile.bio || null,
      resumeUrl: ud.resume || ud.resumeUrl || profile.resume || profile.resumeUrl || null,
      department: ud.department || appDetails.student_department || null,
      cgpa: ud.cgpa || appDetails.student_cgpa || null,
      logo: c.profile_picture_url || ud.logo || ud.profile_picture_url || profile.logo || null,
      premium_user: isPaidMember,
      plan: plan || null,
    };
  };

  const mapAppliedCandidateItem = (item) => {
    const candidate = item.candidate || {};
    const job = item.job || {};
    const application = item.application || {};
    const userDetails = item.user_details || {};
    const jobDetails = item.job_details || {};
    const appDetails = item.application_details || {};
    const taskDetails = item.task_details || item.task || {};
    const task = item.task || taskDetails;

    const taskId = taskDetails.task_id || task.task_id;
    const rawTaskStatus = taskDetails.status || task.status || 'pending';
    const taskStatus = mapTaskStatusFromApi(rawTaskStatus);
    const baseApplicationStatus = application.status ?? '';
    const applicationDetailsStatus = appDetails.status ?? '';

    const studentSkills = parseSkills(
      appDetails.skills_tags || appDetails.student_skills || application.skills_tags || userDetails.skills
    );

    const locations = job.locations || (jobDetails.location ? [jobDetails.location] : []);
    const jobLocation = Array.isArray(locations)
      ? (locations.length ? locations.join(', ') : (jobDetails.location || 'Not specified'))
      : (locations || jobDetails.location || 'Not specified');

    const studentDetails = buildStudentDetails(userDetails, candidate, appDetails);

    const details = {
      studentName: candidate.name || userDetails.full_name || userDetails.name || 'Unknown Candidate',
      studentEmail: candidate.email || userDetails.email || appDetails.student_email || '',
      resumeUrl:
        application.resume_url ||
        appDetails.resume_url ||
        userDetails.resume ||
        userDetails.resumeUrl ||
        studentDetails.resumeUrl ||
        '',
      studentPhone: candidate.phone_number || userDetails.phone_number || appDetails.student_phone || '',
      studentSkills,
      jobTitle: job.job_title || jobDetails.job_title || 'Not specified',
      jobLocation,
      companyName: job.company_name || jobDetails.company_name || 'Unknown Company',
      applicationDate: appDetails.applied_at || appDetails.created_at || item.applied_date || application.applied_at || taskDetails.created_at || task.created_at || '',
      studentDetails,
    };

    const app = {
      task_id: taskId,
      application_id: application.application_id || item.application_id || item.applied_id,
      applied_id: item.applied_id,
      student_id: candidate.student_id || userDetails.user_id || item.user_id,
      job_id: job.job_id || jobDetails.job_id || item.job_id,
      application,
      baseApplicationStatus: String(baseApplicationStatus).trim(),
      applicationDetailsStatus: String(applicationDetailsStatus).trim(),
      applicationStatus: String(applicationDetailsStatus).trim(),
      taskStatus,
      rawTaskStatus,
      status: rawTaskStatus,
      task,
      task_details: taskDetails,
      user_details: userDetails,
      job_details: jobDetails,
      application_details: appDetails,
      recruiter_id: job.recruiter_id || jobDetails.recruiter_id,
      posted_by: job.posted_by || jobDetails.posted_by,
    };

    return { app, details };
  };

  const getRowKey = (app) => app.task_id || app.application_id;

  const getDetailsForApp = (app) => applicationDetails[getRowKey(app)] || {};

  const fetchData = async () => {
    try {
      setLoading(true);

      const normalizedRole = String(role || "recruiter").toLowerCase() === "admin" ? "admin" : "RECRUITER";
      const params = { page: currentPage, limit: itemsPerPage, role: normalizedRole };

      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'all') params.status = mapStatusToApi(statusFilter);
      if (companyFilter !== 'all') params.company = companyFilter;
      if (jobFilter !== 'all') params.job_id = jobFilter;
      if (sortBy === 'newest' || sortBy === 'oldest') params.sort = sortBy;

      Object.assign(params, getDateRangeFromFilter(dateFilter));

      const response = await adminApiClient.get('/admin/get-all-applied-candidates', { params });
      const payload = response.data ?? {};
      const items = Array.isArray(payload.data) ? payload.data : [];

      const apps = [];
      const detailsMap = {};
      const jobTypeMap = {};

      items.forEach((item) => {
        const { app, details } = mapAppliedCandidateItem(item);
        apps.push(app);
        const mapKey = getRowKey(app);
        if (mapKey) detailsMap[mapKey] = details;
        if (app.job_id && !jobTypeMap[app.job_id]) {
          jobTypeMap[app.job_id] = isRecruiterJob(app) ? 'Recruiter Job' : 'Admin Private Job';
        }
      });

      setAllApplications(apps);
      setApplicationDetails(detailsMap);
      setJobTypes(jobTypeMap);

      const total = Number(payload.total) || 0;
      const page = Number(payload.page) || currentPage;
      const limit = Number(payload.limit) || itemsPerPage;
      const apiTotalPages = Number(payload.total_pages);
      const computedPages = Math.max(1, Math.ceil(total / limit));

      setTotalCount(total);
      setTotalPages(
        Number.isFinite(apiTotalPages) && apiTotalPages > 0 ? apiTotalPages : computedPages
      );
      setShowingRange(parseShowingRange(payload.showing, page, limit, total));

      const filters = payload.filters || {};
      setFilterCompanies(Array.isArray(filters.companies) ? filters.companies : []);
      setFilterJobs(Array.isArray(filters.jobs) ? filters.jobs : []);
      setFilterStatuses(Array.isArray(filters.statuses) ? filters.statuses : []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setAllApplications([]);
      setApplicationDetails({});
      setTotalCount(0);
      setTotalPages(1);
      setShowingRange(null);
      setFilterCompanies([]);
      setFilterJobs([]);
      setFilterStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  const sortApplications = (applications, sortKey) => {
    const sorted = [...applications];
    switch (sortKey) {
      case "nameAZ":
        sorted.sort((a, b) => {
          const nameA = getDetailsForApp(a).studentName || '';
          const nameB = getDetailsForApp(b).studentName || '';
          return nameA.localeCompare(nameB);
        });
        break;
      case "nameZA":
        sorted.sort((a, b) => {
          const nameA = getDetailsForApp(a).studentName || '';
          const nameB = getDetailsForApp(b).studentName || '';
          return nameB.localeCompare(nameA);
        });
        break;
      case "companyAZ":
        sorted.sort((a, b) => {
          const companyA = getDetailsForApp(a).companyName || '';
          const companyB = getDetailsForApp(b).companyName || '';
          return companyA.localeCompare(companyB);
        });
        break;
      case "companyZA":
        sorted.sort((a, b) => {
          const companyA = getDetailsForApp(a).companyName || '';
          const companyB = getDetailsForApp(b).companyName || '';
          return companyB.localeCompare(companyA);
        });
        break;
      default:
        break;
    }
    return sorted;
  };

  const handleApproveApplication = async (application) => {
    const actionKey = getRowKey(application);
    try {
      setLoadingApplications(prev => ({ ...prev, [actionKey]: true }));
      if (isAdminRole() && !application.task_id) {
        await adminService.approveApplication(application.application_id);
      } else {
        await adminService.approveJobApplicationByStudent(application.task_id);
      }
      alert('Application approved successfully! The recruiter can now review this application.');
      await fetchData();
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert('Failed to approve application. Please try again.');
    } finally {
      setLoadingApplications(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleRejectApplication = async (application) => {
    const confirmReject = window.confirm('Are you sure you want to reject this application?');
    if (!confirmReject) return;
    const actionKey = getRowKey(application);
    try {
      setLoadingApplications(prev => ({ ...prev, [actionKey]: true }));
      if (isAdminRole() && !application.task_id) {
        await adminService.rejectApplication(application.application_id);
      } else {
        await adminService.rejectJob(application.task_id);
      }
      alert('Application rejected successfully.');
      await fetchData();
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setLoadingApplications(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleViewCandidateDetails = (application, details) => {
    const ud = application.user_details || {};
    const studentDetails = details.studentDetails || {
      name: ud.name || ud.full_name || details.studentName,
      email: ud.email || details.studentEmail,
      phone: ud.phone_number || ud.phone || details.studentPhone,
      skills: ud.skills || details.studentSkills || [],
      location: ud.city || ud.location || ud.address?.city || null,
      experience: ud.experience || null,
      education: ud.education || [],
      experience_years: ud.experience_years || null,
      bio: ud.bio || null,
      resumeUrl: ud.resume_url || ud.resume || details.resumeUrl,
      department: ud.department || null,
      cgpa: ud.cgpa || null,
      logo: ud.profile_picture_url || ud.logo || ud.profile_image || null,
      premium_user: details.user_details?.premium_user,
      plan: details.user_details?.plan,
    };
    setSelectedCandidate({
      ...application,
      details: {
        ...details,
        jobTitle: application.job_details?.job_title || details.jobTitle,
        companyName: application.job_details?.company_name || details.companyName,
        jobLocation: Array.isArray(application.job_details?.locations)
          ? application.job_details.locations.join(', ')
          : (application.job_details?.location || details.jobLocation),
        resumeUrl:
          application.application_details?.resume_url ||
          application.user_details?.resume ||
          application.user_details?.resumeUrl ||
          details.resumeUrl,
        studentSkills: parseSkills(application.application_details?.skills_tags || details.studentSkills),
        applicationDate: application.application_details?.applied_at || details.applicationDate,
        studentDetails,
      },
    });
    setShowCandidateModal(true);
  };

  const handleViewApplications = (application) => {
    const candidateId =
      application.student_id ||
      application.user_details?.user_id ||
      application.user_details?.student_id;
    if (!candidateId) return;
    navigate(`/admin/candidates/applications/${candidateId}`, {
      state: {
        returnViewMode: "applications",
        returnPath: location.pathname,
      },
    });
  };

  const handleExportToExcel = () => {
    alert('Export functionality is temporarily disabled.');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const CLIENT_SORT_OPTIONS = ['nameAZ', 'nameZA', 'companyAZ', 'companyZA'];
  let currentApplications = allApplications;
  if (CLIENT_SORT_OPTIONS.includes(sortBy)) {
    currentApplications = sortApplications(allApplications, sortBy);
  }

  const hasResults = totalCount > 0 || currentApplications.length > 0;
  const effectiveTotalPages = Math.max(totalPages, Math.ceil(totalCount / itemsPerPage) || 1, currentPage);
  const showPaginationBar = !loading && currentApplications.length > 0;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < effectiveTotalPages || currentApplications.length >= itemsPerPage;
  const displayTotalPages = Math.max(effectiveTotalPages, canGoNext ? currentPage + 1 : currentPage);
  const pageNumbers = buildPageList(currentPage, displayTotalPages);
  const parsedShowing = parseShowingRange(showingRange);
  const rangeFrom = parsedShowing?.from ?? ((currentPage - 1) * itemsPerPage + (currentApplications.length ? 1 : 0));
  const rangeTo = parsedShowing?.to ?? Math.min(currentPage * itemsPerPage, totalCount);

  const goToPage = (page) => {
    const next = Math.max(1, page);
    if (next !== currentPage) setCurrentPage(next);
  };


  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const mainContentClass = `${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`;
  const searchFilterClass = `${cardBg} rounded-lg border ${borderColor} p-4 mb-6 shadow-sm`;
  const searchInputClass = `w-full pl-10 pr-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`;
  const searchIconClass = `absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`;

  return (
    <div className={embedded ? "" : `min-h-screen ${bgColor}`}>
      {/* Header (hidden when embedded inside Manage Candidates) */}
      {!embedded && (
        <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-4">
              {/* Back button and title */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                    Job Applications Management
                  </h1>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    Review and manage all job applications - approve, reject, or view details
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={embedded ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"}>
        {/* Filters on Top */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6`}>
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, company, or job title..."
                  className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Status Filter */}
              <div className="w-full lg:w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                >
                  <option value="all">All Status</option>
                  {filterStatuses.length > 0 ? (
                    filterStatuses.map((status) => (
                      <option key={status} value={status.toLowerCase()}>
                        {status}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                </select>
              </div>

              {/* Company Filter */}
              <div className="w-full lg:w-48">
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                >
                  <option value="all">All Companies</option>
                  {filterCompanies.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              {/* Job Filter */}
              <div className="w-full lg:w-48">
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                >
                  <option value="all">All Jobs</option>
                  {filterJobs.map((job) => {
                    const jobId = job.job_id || job.id;
                    const title = job.job_title || job.title || 'Job';
                    return (
                      <option key={jobId} value={jobId}>{title}</option>
                    );
                  })}
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <Calendar size={18} className={textSecondary} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`px-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={18} className={textSecondary} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="nameAZ">Name (A-Z)</option>
                  <option value="nameZA">Name (Z-A)</option>
                  <option value="companyAZ">Company (A-Z)</option>
                  <option value="companyZA">Company (Z-A)</option>
                </select>
              </div>

              {/* Records per page */}
              <div className="w-full lg:w-40">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  aria-label="Records per page"
                  className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <FileText className="text-blue-500" size={24} />
              </div>
            </div>
            <h3 className={`text-lg font-bold ${textColor}`}>Loading applications...</h3>
            <p className={`${textSecondary} mt-2`}>Please wait while we fetch all applications</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !hasResults && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <FileText size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No applications found</h3>
            <p className={`${textSecondary} mb-6`}>
              {searchQuery || companyFilter !== 'all' || jobFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all'
                ? "Try adjusting your filters or search query"
                : "No applications match the current criteria"}
            </p>
            {(searchQuery || companyFilter !== 'all' || jobFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCompanyFilter('all');
                  setJobFilter('all');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Results Header */}
        {!loading && hasResults && (
          <div className="mb-4">
            <p className={`text-sm ${textSecondary}`}>
              Showing <span className={`font-semibold ${textColor}`}>{totalCount}</span> {totalCount === 1 ? 'application' : 'applications'}
              <span className="ml-2">· {itemsPerPage} / page</span>
              {showPaginationBar && (
                <span className="ml-1">
                  · Page <span className={`font-semibold ${textColor}`}>{currentPage}</span> of <span className={`font-semibold ${textColor}`}>{displayTotalPages}</span>
                </span>
              )}
              {statusFilter !== 'all' && ` with status "${statusFilter}"`}
              {dateFilter !== 'all' && (
                <span className="ml-2">
                  ({dateFilter.replace(/([A-Z])/g, ' $1').trim()})
                </span>
              )}
            </p>
          </div>
        )}

        {/* Applications List - Compact Cards */}
        {!loading && hasResults && (
          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              {currentApplications.map((application) => {
                const rowKey = getRowKey(application);
                const details = getDetailsForApp(application);
                const isLoadingAction = loadingApplications[rowKey];
                const displayStatus = getDisplayApplicationStatus(application);
                const normalizedDisplayStatus = normalizeApplicationStatus(displayStatus);
                const showTaskActions = canManageApplication(application);

                return (
                  <div
                    key={rowKey}
                    className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
                  >
                    <div className="p-3">
                      {/* Application Header */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            {details.studentDetails?.logo ? (
                              <img
                                src={details.studentDetails.logo}
                                alt={details.studentName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm`}>
                                {details.studentName?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-base font-bold ${textColor} leading-tight`}>
                                {details.studentName || 'Unknown Candidate'}
                              </h3>
                              {/* Membership Badge Next to Name - Enhanced Visibility */}
                              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-sm flex items-center gap-1.5 transition-all flex-shrink-0 ${
                                (details.studentDetails?.premium_user === true || details.studentDetails?.premium_user === 'true') 
                                  ? (details.studentDetails?.plan === 'premium' 
                                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-300 shadow-amber-200/50' 
                                      : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-300 shadow-blue-200/50'
                                    ) 
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}>
                                {(details.studentDetails?.premium_user === true || details.studentDetails?.premium_user === 'true') ? <Sparkles size={11} className="text-white" /> : <User size={11} />}
                                {(details.studentDetails?.premium_user === true || details.studentDetails?.premium_user === 'true') ? (details.studentDetails?.plan === 'premium' ? 'Premium' : 'Basic') : 'Free'}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1 truncate">
                                <Mail size={13} className="flex-shrink-0" />
                                {details.studentEmail || 'No email'}
                              </span>
                              {details.studentPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={13} className="flex-shrink-0" />
                                  {details.studentPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getApplicationStatusBadgeClass(displayStatus)}`} style={{ fontSize: '0.7rem' }}>
                            {getApplicationStatusLabel(displayStatus)}
                          </span>
                          {jobTypes[application.job_id] && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${jobTypes[application.job_id] === 'Admin Private Job'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                              }`} style={{ fontSize: '0.65rem' }}>
                              {jobTypes[application.job_id]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className={`flex flex-wrap items-center gap-2 text-xs mb-2.5 ${textSecondary}`}>
                        <span className="flex items-center gap-1">
                          <Briefcase size={13} className="flex-shrink-0" />
                          {details.jobTitle}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building size={13} className="flex-shrink-0" />
                          {details.companyName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="flex-shrink-0" />
                          {details.jobLocation || 'Not specified'}
                        </span>
                      </div>

                      {/* Application Info Bar */}
                      <div className={`flex flex-wrap gap-1.5 mb-2.5`}>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                          <Calendar size={12} />
                          Applied: {formatDate(details.applicationDate)}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                          Student ID: {application.student_id || 'N/A'}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                          Job ID: {application.job_id || 'N/A'}
                        </span>
                      </div>

                      {/* Skills */}
                      {details.studentSkills && details.studentSkills.length > 0 && (
                        <div className="mb-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {details.studentSkills.slice(0, 4).map((skill, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-full text-xs font-medium`}
                                style={{ fontSize: '0.7rem' }}
                              >
                                {skill}
                              </span>
                            ))}
                            {details.studentSkills.length > 4 && (
                              <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.7rem' }}>
                                +{details.studentSkills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handleViewCandidateDetails(application, details)}
                          className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </button>
                        <button
                          onClick={() => handleViewApplications(application)}
                          className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          <Briefcase size={13} />
                          Applications
                        </button>
                        <button
                          type="button"
                          className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          Remark
                        </button>
                        {details.resumeUrl && (
                          <a
                            href={details.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            <Download size={13} />
                            Resume
                          </a>
                        )}
                        {showTaskActions && (
                          <>
                            <button
                              onClick={() => handleRejectApplication(application)}
                              disabled={isLoadingAction}
                              className={`flex-1 sm:flex-initial px-3 py-1.5 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-500/30 dark:text-red-400 dark:bg-red-500/20 dark:hover:bg-red-500/30 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {isLoadingAction ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                              ) : (
                                <X size={13} />
                              )}
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveApplication(application)}
                              disabled={isLoadingAction}
                              className={`flex-1 sm:flex-initial px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {isLoadingAction ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <Check size={13} />
                              )}
                              Approve
                            </button>
                          </>
                        )}
                        {!showTaskActions && normalizedDisplayStatus === 'approved' && (
                          <span className="flex-1 sm:flex-initial px-3 py-1.5 text-green-700 dark:text-green-400 text-xs font-medium flex items-center justify-center gap-1.5" style={{ fontSize: '0.7rem' }}>
                            <Check size={13} />
                            Approved
                          </span>
                        )}
                        {!showTaskActions && normalizedDisplayStatus === 'shortlisted' && (
                          <span className="flex-1 sm:flex-initial px-3 py-1.5 text-blue-700 dark:text-blue-400 text-xs font-medium flex items-center justify-center gap-1.5" style={{ fontSize: '0.7rem' }}>
                            <Check size={13} />
                            Shortlisted
                          </span>
                        )}
                        {!showTaskActions && normalizedDisplayStatus === 'rejected' && (
                          <span className="flex-1 sm:flex-initial px-3 py-1.5 text-red-700 dark:text-red-400 text-xs font-medium flex items-center justify-center gap-1.5" style={{ fontSize: '0.7rem' }}>
                            <X size={13} />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {showPaginationBar && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mt-4 shadow-sm`}>
            <p className={`text-sm ${textSecondary} text-center mb-4`}>
              Showing <span className={`font-medium ${textColor}`}>{rangeFrom}</span> to{' '}
              <span className={`font-medium ${textColor}`}>{rangeTo}</span> of{' '}
              <span className={`font-medium ${textColor}`}>{totalCount}</span> results
              <span className="mx-2">·</span>
              Page <span className={`font-medium ${textColor}`}>{currentPage}</span> of{' '}
              <span className={`font-medium ${textColor}`}>{displayTotalPages}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={!canGoPrevious || loading}
                className={`inline-flex items-center justify-center gap-1.5 min-w-[7.5rem] px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors ${
                  canGoPrevious && !loading
                    ? 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 text-gray-400 cursor-not-allowed'
                } ${cardBg}`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              {displayTotalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-1 px-1">
                  {pageNumbers.map((page, index) =>
                    page === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className={`px-2 text-sm ${textSecondary}`}>…</span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        disabled={loading}
                        className={`min-w-[2.5rem] h-10 px-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white shadow-sm'
                            : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                        } disabled:opacity-50`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={!canGoNext || loading}
                className={`inline-flex items-center justify-center gap-1.5 min-w-[7.5rem] px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors ${
                  canGoNext && !loading
                    ? 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 text-gray-400 cursor-not-allowed'
                } ${cardBg}`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Details Modal */}
      {showCandidateModal && selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCandidateModal(false)}
        >
          <div
            className={`${cardBg} rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 flex items-center justify-between p-5 border-b ${borderColor} ${cardBg} z-10`}>
              <h2 className={`text-xl font-bold ${textColor}`}>Candidate Details</h2>
              <button
                onClick={() => setShowCandidateModal(false)}
                className={`${textSecondary} hover:text-red-500 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Candidate Header */}
              <div className={`${isDark ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20' : 'bg-gradient-to-r from-purple-50 to-blue-50'} rounded-lg p-4 border ${borderColor}`}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                    {selectedCandidate.details?.studentDetails?.logo ? (
                      <img
                        src={selectedCandidate.details.studentDetails.logo}
                        alt={selectedCandidate.details.studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl`}>
                        {selectedCandidate.details?.studentName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-2xl font-bold ${textColor}`}>
                        {selectedCandidate.details?.studentName || 'Unknown Candidate'}
                      </h3>
                      {/* Membership Badge Next to Name in Modal - Enhanced Visibility */}
                      <div className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase border shadow-md flex items-center gap-2 transition-all flex-shrink-0 ${
                        (selectedCandidate.details?.studentDetails?.premium_user === true || selectedCandidate.details?.studentDetails?.premium_user === 'true') 
                          ? (selectedCandidate.details?.studentDetails?.plan === 'premium' 
                              ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-300 shadow-amber-200/50' 
                              : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-300 shadow-blue-200/50'
                            ) 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {(selectedCandidate.details?.studentDetails?.premium_user === true || selectedCandidate.details?.studentDetails?.premium_user === 'true') ? <Sparkles size={13} className="text-white" /> : <User size={13} />}
                        {(selectedCandidate.details?.studentDetails?.premium_user === true || selectedCandidate.details?.studentDetails?.premium_user === 'true') ? (selectedCandidate.details?.studentDetails?.plan === 'premium' ? 'Premium' : 'Basic') : 'Free'}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {selectedCandidate.details?.studentEmail && (
                        <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                          <Mail size={16} className="text-blue-500" />
                          {selectedCandidate.details.studentEmail}
                        </span>
                      )}
                      {selectedCandidate.details?.studentPhone && (
                        <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                          <Phone size={16} className="text-green-500" />
                          {selectedCandidate.details.studentPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Info */}
              <div>
                <h4 className={`text-lg font-bold ${textColor} mb-3 flex items-center gap-2`}>
                  <Briefcase size={20} className="text-blue-500" />
                  Application Information
                </h4>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 border ${borderColor}`}>
                  <div>
                    <label className={`block text-xs font-semibold ${textSecondary} mb-1 uppercase`}>Job Position</label>
                    <p className={`text-sm ${textColor} font-medium`}>{selectedCandidate.details?.jobTitle || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${textSecondary} mb-1 uppercase`}>Company</label>
                    <p className={`text-sm ${textColor} font-medium`}>{selectedCandidate.details?.companyName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${textSecondary} mb-1 uppercase`}>Location</label>
                    <p className={`text-sm ${textColor} font-medium`}>
                      {selectedCandidate.details?.jobLocation || selectedCandidate.details?.studentDetails?.location || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${textSecondary} mb-1 uppercase`}>Application Date</label>
                    <p className={`text-sm ${textColor} font-medium`}>{formatDate(selectedCandidate.details?.applicationDate)}</p>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${textSecondary} mb-1 uppercase`}>Student ID</label>
                    <p className={`text-sm ${textColor} font-medium`}>{selectedCandidate.student_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${textSecondary} mb-1 uppercase`}>Job ID</label>
                    <p className={`text-sm ${textColor} font-medium`}>{selectedCandidate.job_id || 'N/A'}</p>
                  </div>
                  {selectedCandidate.details?.studentDetails?.experience && (
                    <div>
                      <label className={`block text-xs font-semibold ${textSecondary} mb-1 uppercase`}>Experience</label>
                      <p className={`text-sm ${textColor} font-medium`}>{selectedCandidate.details.studentDetails.experience}</p>
                    </div>
                  )}
                  {selectedCandidate.details?.studentDetails?.experience_years && (
                    <div>
                      <label className={`block text-xs font-semibold ${textSecondary} mb-1 uppercase`}>Years of Experience</label>
                      <p className={`text-sm ${textColor} font-medium`}>{selectedCandidate.details.studentDetails.experience_years} years</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {selectedCandidate.details?.studentSkills && selectedCandidate.details.studentSkills.length > 0 && (
                <div>
                  <h4 className={`text-lg font-bold ${textColor} mb-3`}>Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.details.studentSkills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'} rounded-full text-sm font-medium`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education - FIXED */}
              {selectedCandidate.details?.studentDetails?.education &&
                Array.isArray(selectedCandidate.details.studentDetails.education) &&
                selectedCandidate.details.studentDetails.education.length > 0 && (
                  <div>
                    <h4 className={`text-lg font-bold ${textColor} mb-3`}>Education</h4>
                    <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 border ${borderColor} space-y-2`}>
                      {selectedCandidate.details.studentDetails.education.map((edu, index) => {
                        // Handle different data types - convert objects to strings
                        const eduText = typeof edu === 'string'
                          ? edu
                          : typeof edu === 'object' && edu !== null
                            ? (edu.institution || edu.university || edu.degree || JSON.stringify(edu))
                            : String(edu);

                        return (
                          <div key={index} className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0`}></div>
                            <p className={`text-sm ${textColor}`}>{eduText}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Department & CGPA */}
              {(selectedCandidate.details?.studentDetails?.department || selectedCandidate.details?.studentDetails?.cgpa) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCandidate.details?.studentDetails?.department && (
                    <div>
                      <h4 className={`text-lg font-bold ${textColor} mb-2`}>Department</h4>
                      <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                        <p className={`text-sm ${textColor}`}>{selectedCandidate.details.studentDetails.department}</p>
                      </div>
                    </div>
                  )}
                  {selectedCandidate.details?.studentDetails?.cgpa && (
                    <div>
                      <h4 className={`text-lg font-bold ${textColor} mb-2`}>CGPA</h4>
                      <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                        <p className={`text-sm ${textColor} font-semibold`}>{selectedCandidate.details.studentDetails.cgpa}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bio */}
              {selectedCandidate.details?.studentDetails?.bio && (
                <div>
                  <h4 className={`text-lg font-bold ${textColor} mb-3`}>About</h4>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 border ${borderColor}`}>
                    <p className={`text-sm ${textColor} whitespace-pre-wrap leading-relaxed`}>
                      {selectedCandidate.details.studentDetails.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedCandidate.details?.resumeUrl && (
                <div>
                  <h4 className={`text-lg font-bold ${textColor} mb-3`}>Resume</h4>
                  <a
                    href={selectedCandidate.details.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg font-medium"
                  >
                    <Download size={18} />
                    Download Resume
                  </a>
                </div>
              )}

              {/* Application Status */}
              <div>
                <h4 className={`text-lg font-bold ${textColor} mb-3`}>Application Status</h4>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getApplicationStatusBadgeClass(getDisplayApplicationStatus(selectedCandidate))}`}>
                    {getApplicationStatusLabel(getDisplayApplicationStatus(selectedCandidate))}
                  </span>
                  {jobTypes[selectedCandidate.job_id] && (
                    <span className={`px-3 py-2 rounded-lg text-sm font-medium border ${jobTypes[selectedCandidate.job_id] === 'Admin Private Job'
                      ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
                      : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      }`}>
                      {jobTypes[selectedCandidate.job_id]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 flex justify-end gap-3 p-5 border-t ${borderColor} ${cardBg}`}>
              <button
                onClick={() => setShowCandidateModal(false)}
                className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingJobApplications;