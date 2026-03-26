import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterExternalService } from "../../services";
import { Check, X, FileText, Download, ExternalLink, Search, Briefcase, Building, Clock, Mail, Phone, Calendar, Eye, MapPin, ArrowUpDown } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

function PendingJobApplications({ embedded = false }) {
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
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, companyFilter, jobFilter, statusFilter, dateFilter, sortBy]);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      let filteredApps = [];

      if (statusFilter === 'pending') {
        const pendingTasks = await adminService.getPendingJobs();
        filteredApps = pendingTasks.filter(task =>
          task.category === 'newapplication' && task.status === 'pending'
        );
      } else if (statusFilter === 'approved') {
        const allTasks = await adminService.getPendingJobs();
        filteredApps = allTasks.filter(task =>
          task.category === 'newapplication' && task.status === 'fulfilled'
        );
      } else if (statusFilter === 'rejected') {
        const allTasks = await adminService.getPendingJobs();
        filteredApps = allTasks.filter(task =>
          task.category === 'newapplication' && task.status === 'rejected'
        );
      } else if (statusFilter === 'all') {
        const allTasks = await adminService.getPendingJobs();
        filteredApps = allTasks.filter(task => task.category === 'newapplication');
      }

      const appsWithStatus = filteredApps.map(app => ({
        ...app,
        applicationStatus: app.status === 'fulfilled' ? 'approved' :
          app.status === 'rejected' ? 'rejected' : 'pending'
      }));

      setAllApplications(appsWithStatus);

      if (appsWithStatus.length > 0) {
        await fetchApplicationDetails(appsWithStatus);
        determineJobTypes(appsWithStatus);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setAllApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const determineJobTypes = (applications) => {
    const jobTypeMap = {};
    applications.forEach(app => {
      if (app.job_id && !jobTypeMap[app.job_id]) {
        jobTypeMap[app.job_id] = app.recruiter_id ? 'Recruiter Job' : 'Admin Private Job';
      }
    });

    setJobTypes(jobTypeMap);
  };
  const fetchApplicationDetails = async (applications) => {
    const detailsMap = {};
    let allCandidates = [];
    try {
      allCandidates = await adminService.getCandidates();
    } catch (error) {
      console.warn('Failed to fetch candidates data:', error);
      allCandidates = [];
    }
    let recruiterDataMap = {};
    try {
      recruiterDataMap = await adminService.getAllRecruiterData();
    } catch (error) {
      console.warn('Failed to fetch all recruiter data:', error);
    }

    const uniqueJobIds = [...new Set(applications.map(app => app.job_id).filter(Boolean))];
    const jobDataMap = {};

    const jobChunkSize = 5;
    for (let i = 0; i < uniqueJobIds.length; i += jobChunkSize) {
      const chunk = uniqueJobIds.slice(i, i + jobChunkSize);
      await Promise.all(
        chunk.map(async (jobId) => {
          try {
            const res = await fetch(`https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs?job_id=${jobId}`);
            if (res.ok) {
              const jobData = await res.json();
              const job = Array.isArray(jobData.jobs)
                ? jobData.jobs.find(j => j.job_id === jobId) || jobData.jobs[0]
                : jobData.job || jobData;
              if (job) {
                jobDataMap[jobId] = job;
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch job ${jobId}:`, error);
          }
        })
      );
    }

    const applicationsForJobCache = {};
    const fetchAppsForJob = async (jobId) => {
      if (!jobId) return [];
      if (applicationsForJobCache[jobId]) return applicationsForJobCache[jobId];
      try {
        const res = await adminService.getApplicationsForJob(jobId);
        applicationsForJobCache[jobId] = res.applications || [];
        return applicationsForJobCache[jobId];
      } catch (e) {
        applicationsForJobCache[jobId] = [];
        return [];
      }
    };

    const appChunkSize = 10;
    for (let i = 0; i < applications.length; i += appChunkSize) {
      const chunk = applications.slice(i, i + appChunkSize);

      const promises = chunk.map(async (app) => {
        try {
          const details = {
            studentName: 'Loading...',
            studentEmail: '',
            resumeUrl: '',
            studentPhone: '',
            studentSkills: [],
            jobTitle: 'Loading...',
            jobLocation: '',
            companyName: 'Loading...',
            applicationDate: app.created_at || app.posted_date || '',
            studentDetails: null
          };

          const studentData = allCandidates.find(candidate =>
            candidate.id?.toString() === app.student_id?.toString() ||
            candidate.candidate_id?.toString() === app.student_id?.toString() ||
            candidate.user_id?.toString() === app.student_id?.toString()
          );

          if (studentData) {
            details.studentName = studentData.name || studentData.full_name || `Student ${app.student_id}`;
            details.studentEmail = studentData.email || '';
            details.resumeUrl = studentData.resume || studentData.resumeUrl || '';
            details.studentPhone = studentData.phone || studentData.phone_number || '';
            details.studentSkills = studentData.skills || [];

            details.studentDetails = {
              name: studentData.name || studentData.full_name || "Unknown",
              email: studentData.email || null,
              phone: studentData.phone || studentData.phone_number || null,
              skills: studentData.skills || [],
              location: studentData.city || studentData.location || null,
              experience: studentData.experience || null,
              education: studentData.education || [],
              experience_years: studentData.experience_years || null,
              bio: studentData.bio || null,
              resumeUrl: studentData.resume || studentData.resumeUrl || null,
              department: studentData.department || null,
              cgpa: studentData.cgpa || null,
              logo: studentData.logo || studentData.profile_image || null
            };
          } else {
            const applicationsList = await fetchAppsForJob(app.job_id);

            const studentApplication = applicationsList.find(a =>
              a.student_id?.toString() === app.student_id?.toString()
            ) || applicationsList[0];

            if (studentApplication) {
              details.studentName = studentApplication.student_name || `Student ${app.student_id}`;
              details.studentEmail = studentApplication.student_email || studentApplication.email || '';
              details.resumeUrl = studentApplication.resume_url || studentApplication.resume || '';
              details.studentPhone = studentApplication.student_phone || '';
              details.studentSkills = studentApplication.student_skills
                ? (typeof studentApplication.student_skills === 'string'
                  ? studentApplication.student_skills.split(',').map(skill => skill.trim())
                  : Array.isArray(studentApplication.student_skills)
                    ? studentApplication.student_skills
                    : [])
                : [];

              details.studentDetails = {
                name: studentApplication.student_name || "Unknown",
                email: studentApplication.student_email || studentApplication.email || null,
                phone: studentApplication.student_phone || null,
                skills: studentApplication.student_skills
                  ? (typeof studentApplication.student_skills === 'string'
                    ? studentApplication.student_skills.split(',').map(skill => skill.trim())
                    : Array.isArray(studentApplication.student_skills)
                      ? studentApplication.student_skills
                      : [])
                  : [],
                location: studentApplication.student_location || null,
                experience: studentApplication.student_experience || null,
                education: studentApplication.student_university ? [studentApplication.student_university] : [],
                experience_years: studentApplication.student_experience_years || null,
                bio: studentApplication.student_bio || null,
                resumeUrl: studentApplication.resume_url || studentApplication.student_profile?.resume || null,
                department: studentApplication.student_department || null,
                cgpa: studentApplication.student_cgpa || null,
                logo: studentApplication.student_profile?.logo || studentApplication.student_profile?.profile_image || null
              };
            }
          }

          if (app.job_id && jobDataMap[app.job_id]) {
            const job = jobDataMap[app.job_id];
            details.jobTitle = job.job_title || job.title || 'Not specified';
            details.jobLocation = job.location || 'Not specified';
            details.companyName = job.company_name || 'Not specified';
          }

          if (app.recruiter_id && recruiterDataMap[app.recruiter_id] && (!details.companyName || details.companyName === 'Loading...' || details.companyName === 'Unknown Company' || details.companyName === 'Not specified')) {
            details.companyName = recruiterDataMap[app.recruiter_id].company_name || 'Unknown Company';
          } else if (app.recruiter_id && (!details.companyName || details.companyName === 'Loading...' || details.companyName === 'Unknown Company' || details.companyName === 'Not specified')) {
            try {
              const recruiterData = await recruiterExternalService.getRecruiterCompanyName(app.recruiter_id);
              if (recruiterData && recruiterData.company_name) {
                details.companyName = recruiterData.company_name;
              }
            } catch (err) {
              console.warn(`Failed to fetch company:`, err);
            }
          }

          if (!details.studentName || details.studentName === 'Loading...') {
            details.studentName = `Student ${app.student_id || 'Unknown'}`;
          }
          if (!details.companyName || details.companyName === 'Loading...' || details.companyName === 'Unknown Company' || details.companyName === 'Not specified') {
            details.companyName = app.company_name || 'Unknown Company';
          }
          if (!details.jobTitle || details.jobTitle === 'Loading...' || details.jobTitle === 'Not specified') {
            details.jobTitle = app.title || 'Not specified';
          }

          detailsMap[app.task_id] = details;
        } catch (error) {
          console.error(`Error fetching details for app ${app.task_id}:`, error);
          detailsMap[app.task_id] = {
            studentName: `Student ${app.student_id || 'Unknown'}`,
            studentEmail: '',
            resumeUrl: '',
            studentPhone: '',
            studentSkills: [],
            jobTitle: app.title || 'Not specified',
            jobLocation: app.location || 'Not specified',
            companyName: app.company_name || 'Unknown Company',
            applicationDate: app.created_at || app.posted_date || '',
            studentDetails: null
          };
        }
      });

      await Promise.all(promises);
    }
    setApplicationDetails(detailsMap);
  };

  const filterApplicationsByDate = (applications, dateFilter) => {
    if (dateFilter === "all") return applications;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return applications.filter(app => {
      const details = applicationDetails[app.task_id];
      const appDateString = details?.applicationDate || app.created_at || app.posted_date;
      if (!appDateString) return false;

      const appDate = new Date(appDateString);
      const appDateOnly = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());

      switch (dateFilter) {
        case "today":
          return appDateOnly.getTime() === today.getTime();
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return appDateOnly.getTime() === yesterday.getTime();
        }
        case "last7days": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return appDateOnly >= weekAgo;
        }
        case "last30days": {
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          return appDateOnly >= monthAgo;
        }
        case "thisMonth": {
          return appDate.getMonth() === now.getMonth() &&
            appDate.getFullYear() === now.getFullYear();
        }
        case "lastMonth": {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return appDate.getMonth() === lastMonth.getMonth() &&
            appDate.getFullYear() === lastMonth.getFullYear();
        }
        default:
          return true;
      }
    });
  };

  const sortApplications = (applications, sortBy) => {
    const sorted = [...applications];

    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => {
          const dateA = new Date(applicationDetails[a.task_id]?.applicationDate || a.created_at || 0);
          const dateB = new Date(applicationDetails[b.task_id]?.applicationDate || b.created_at || 0);
          return dateB - dateA;
        });
        break;
      case "oldest":
        sorted.sort((a, b) => {
          const dateA = new Date(applicationDetails[a.task_id]?.applicationDate || a.created_at || 0);
          const dateB = new Date(applicationDetails[b.task_id]?.applicationDate || b.created_at || 0);
          return dateA - dateB;
        });
        break;
      case "nameAZ":
        sorted.sort((a, b) => {
          const nameA = applicationDetails[a.task_id]?.studentName || '';
          const nameB = applicationDetails[b.task_id]?.studentName || '';
          return nameA.localeCompare(nameB);
        });
        break;
      case "nameZA":
        sorted.sort((a, b) => {
          const nameA = applicationDetails[a.task_id]?.studentName || '';
          const nameB = applicationDetails[b.task_id]?.studentName || '';
          return nameB.localeCompare(nameA);
        });
        break;
      case "companyAZ":
        sorted.sort((a, b) => {
          const companyA = applicationDetails[a.task_id]?.companyName || '';
          const companyB = applicationDetails[b.task_id]?.companyName || '';
          return companyA.localeCompare(companyB);
        });
        break;
      case "companyZA":
        sorted.sort((a, b) => {
          const companyA = applicationDetails[a.task_id]?.companyName || '';
          const companyB = applicationDetails[b.task_id]?.companyName || '';
          return companyB.localeCompare(companyA);
        });
        break;
      default:
        break;
    }

    return sorted;
  };

  const handleApproveApplication = async (taskId) => {
    try {
      setLoadingApplications(prev => ({ ...prev, [taskId]: true }));
      await adminService.approveJobApplicationByStudent(taskId);
      alert('Application approved successfully! The recruiter can now review this application.');

      setAllApplications(prev => prev.map(app =>
        app.task_id === taskId
          ? { ...app, applicationStatus: 'approved', status: 'fulfilled' }
          : app
      ));

      setSearchQuery('');
      setCompanyFilter('all');
      setJobFilter('all');
      setStatusFilter('all');
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert('Failed to approve application. Please try again.');
    } finally {
      setLoadingApplications(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleRejectApplication = async (taskId) => {
    const confirmReject = window.confirm('Are you sure you want to reject this application?');
    if (!confirmReject) return;

    try {
      setLoadingApplications(prev => ({ ...prev, [taskId]: true }));
      await adminService.rejectJob(taskId);
      alert('Application rejected successfully.');
      setAllApplications(prev => prev.map(app =>
        app.task_id === taskId
          ? { ...app, applicationStatus: 'rejected', status: 'rejected' }
          : app
      ));
      setSearchQuery('');
      setCompanyFilter('all');
      setJobFilter('all');
      setStatusFilter('all');
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setLoadingApplications(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleViewCandidateDetails = (application, details) => {
    console.log('Opening modal for application:', application);
    console.log('Application details:', details);
    const candidateData = {
      ...application,
      details: {
        ...details,
        studentDetails: details.studentDetails || {
          name: details.studentName,
          email: details.studentEmail,
          phone: details.studentPhone,
          skills: details.studentSkills || [],
          location: null,
          experience: null,
          education: [],
          bio: null,
          resumeUrl: details.resumeUrl
        }
      }
    };

    console.log('Setting candidate data:', candidateData);
    setSelectedCandidate(candidateData);
    setShowCandidateModal(true);
  };

  const handleExportToExcel = () => {
    alert('Export functionality is temporarily disabled.');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const uniqueCompanies = [...new Set(
    allApplications.map(app => applicationDetails[app.task_id]?.companyName).filter(Boolean)
  )];

  const uniqueJobs = [...new Set(
    allApplications.map(app => {
      const details = applicationDetails[app.task_id];
      return details ? `${details.jobTitle}|${details.companyName}` : null;
    }).filter(Boolean)
  )];

  let filteredApplications = allApplications.filter(app => {
    const details = applicationDetails[app.task_id] || {};

    const matchesStatus = statusFilter === "all" || app.applicationStatus === statusFilter;
    const matchesSearch =
      details.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCompany = companyFilter === "all" || details.companyName === companyFilter;

    // Job filter
    const jobKey = `${details.jobTitle}|${details.companyName}`;
    const matchesJob = jobFilter === "all" || jobKey === jobFilter;

    return matchesStatus && matchesSearch && matchesCompany && matchesJob;
  });

  // Apply date filter
  filteredApplications = filterApplicationsByDate(filteredApplications, dateFilter);

  // Apply sorting
  filteredApplications = sortApplications(filteredApplications, sortBy);

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);

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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
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
                  {uniqueCompanies.map(company => (
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
                  {uniqueJobs.map(jobKey => {
                    const [title, company] = jobKey.split('|');
                    return (
                      <option key={jobKey} value={jobKey}>{title} - {company}</option>
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
        {!loading && filteredApplications.length === 0 && (
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
        {!loading && filteredApplications.length > 0 && (
          <div className="mb-4">
            <p className={`text-sm ${textSecondary}`}>
              Showing <span className={`font-semibold ${textColor}`}>{filteredApplications.length}</span> {filteredApplications.length === 1 ? 'application' : 'applications'}
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
        {!loading && filteredApplications.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              {currentApplications.map((application) => {
                const details = applicationDetails[application.task_id] || {};
                const isLoadingAction = loadingApplications[application.task_id];

                return (
                  <div
                    key={application.task_id}
                    className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
                  >
                    <div className="p-3">
                      {/* Application Header */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm`}>
                              {details.studentName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-bold ${textColor} leading-tight mb-1`}>
                              {details.studentName || 'Unknown Candidate'}
                            </h3>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${application.applicationStatus === 'approved'
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30'
                            : application.applicationStatus === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30'
                            }`} style={{ fontSize: '0.7rem' }}>
                            {application.applicationStatus === 'approved' ? 'Approved' :
                              application.applicationStatus === 'rejected' ? 'Rejected' : 'Pending'}
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
                        {application.applicationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRejectApplication(application.task_id)}
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
                              onClick={() => handleApproveApplication(application.task_id)}
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
                        {application.applicationStatus === 'approved' && (
                          <span className="flex-1 sm:flex-initial px-3 py-1.5 text-green-700 dark:text-green-400 text-xs font-medium flex items-center justify-center gap-1.5" style={{ fontSize: '0.7rem' }}>
                            <Check size={13} />
                            Approved
                          </span>
                        )}
                        {application.applicationStatus === 'rejected' && (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 gap-4">
                <div className="flex items-center">
                  <p className={`text-sm ${textSecondary}`}>
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredApplications.length)}</span> of <span className="font-medium">{filteredApplications.length}</span> results
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg border ${borderColor} text-sm font-medium ${textColor} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 shadow-sm`}
                  >
                    Previous
                  </button>
                  <div className={`text-sm font-medium ${textColor} px-2`}>
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg border ${borderColor} text-sm font-medium ${textColor} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 shadow-sm`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
                    <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl`}>
                      {selectedCandidate.details?.studentName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold ${textColor} mb-2`}>
                      {selectedCandidate.details?.studentName || 'Unknown Candidate'}
                    </h3>
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
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${selectedCandidate.applicationStatus === 'approved'
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30'
                    : selectedCandidate.applicationStatus === 'rejected'
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30'
                    }`}>
                    {selectedCandidate.applicationStatus === 'approved' ? '✓ Approved' :
                      selectedCandidate.applicationStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending Review'}
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