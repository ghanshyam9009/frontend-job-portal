import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterExternalService } from "../../services";
import { Check, X, FileText, Download, ExternalLink, Search, Briefcase, Building, Clock, Mail, Phone, Calendar, Eye, MapPin } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

function PendingJobApplications() {
  const { theme } = useTheme();
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState({});
  const [applicationDetails, setApplicationDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  // const [jobFilter, setJobFilter] = useState("all");

  // Fetch pending applications
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch pending applications
      const pendingTasks = await adminService.getPendingJobs();
      const pendingApps = pendingTasks.filter(task =>
        task.category === 'newapplication' && task.status === 'pending'
      );
      
      setPendingApplications(pendingApps);

      // Fetch detailed information for each application
      if (pendingApps.length > 0) {
        await fetchApplicationDetails(pendingApps);
      }
    } catch (error) {
      console.error('Failed to fetch pending applications:', error);
      setPendingApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch complete application details with optimized API calls
  const fetchApplicationDetails = async (applications) => {
    const detailsMap = {};

    // Process applications in parallel to reduce total time
    const promises = applications.map(async (app) => {
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

        // Parallel fetch job details and application details
        const [jobData, applicationsResponse] = await Promise.allSettled([
          app.job_id ? fetch(`https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs?job_id=${app.job_id}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null) : Promise.resolve(null),
          app.job_id ? adminService.getApplicationsForJob(app.job_id)
            .catch(() => ({ applications: [] })) : Promise.resolve({ applications: [] })
        ]);

        // Process job data
        if (jobData.status === 'fulfilled' && jobData.value) {
          const job = Array.isArray(jobData.value.jobs)
            ? jobData.value.jobs.find(j => j.job_id === app.job_id) || jobData.value.jobs[0]
            : jobData.value.job || jobData.value;

          if (job) {
            details.jobTitle = job.job_title || job.title || 'Not specified';
            details.jobLocation = job.location || 'Not specified';
            details.companyName = job.company_name || 'Not specified';
          }
        }

        // Process application data
        if (applicationsResponse.status === 'fulfilled') {
          const applications = applicationsResponse.value.applications || [];
          const studentApplication = applications.find(a =>
            a.student_id?.toString() === app.student_id?.toString()
          ) || applications[0];

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

        // Fetch company name if still needed
        if (app.recruiter_id && details.companyName === 'Loading...') {
          try {
            const recruiterData = await recruiterExternalService.getRecruiterCompanyName(app.recruiter_id);
            if (recruiterData && recruiterData.company_name) {
              details.companyName = recruiterData.company_name;
            }
          } catch (err) {
            console.warn(`Failed to fetch company:`, err);
          }
        }

        // Fallbacks
        if (details.studentName === 'Loading...' || !details.studentName) {
          details.studentName = `Student ${app.student_id || 'Unknown'}`;
        }
        if (details.companyName === 'Loading...' || !details.companyName) {
          details.companyName = app.company_name || 'Unknown Company';
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
    setApplicationDetails(detailsMap);
  };

  const handleApproveApplication = async (taskId) => {
    try {
      setLoadingApplications(prev => ({ ...prev, [taskId]: true }));
      await adminService.approveJobApplicationByStudent(taskId);
      alert('Application approved successfully! The recruiter can now review this application.');
      await fetchData();
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
      await fetchData();
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setLoadingApplications(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleViewCandidateDetails = (application, details) => {
    setSelectedCandidate({ ...application, details });
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

  // Get unique companies for filter
  const uniqueCompanies = [...new Set(
    pendingApplications.map(app => applicationDetails[app.task_id]?.companyName).filter(Boolean)
  )];

  // Get unique jobs for filter
  const uniqueJobs = [...new Set(
    pendingApplications.map(app => {
      const details = applicationDetails[app.task_id];
      return details ? `${details.jobTitle}|${details.companyName}` : null;
    }).filter(Boolean)
  )];

  // Filter applications
  const filteredApplications = pendingApplications.filter(app => {
    const details = applicationDetails[app.task_id] || {};
    
    // Search filter
    const matchesSearch = 
      details.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Company filter
    const matchesCompany = companyFilter === "all" || details.companyName === companyFilter;
    
    // Job filter
    const jobKey = `${details.jobTitle}|${details.companyName}`;
    const matchesJob = jobFilter === "all" || jobKey === jobFilter;
    
    return matchesSearch && matchesCompany && matchesJob;
  });

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
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Back button and title */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                  Pending Job Applications
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Review pending job applications and approve or reject them before they reach recruiters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters on Top */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6`}>
          <div className="flex flex-col lg:flex-row gap-4">
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
            <p className={`${textSecondary} mt-2`}>Please wait while we fetch pending applications</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredApplications.length === 0 && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <FileText size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No pending applications found</h3>
            <p className={`${textSecondary} mb-6`}>
              {searchQuery || companyFilter !== 'all' || jobFilter !== 'all'
                ? "Try adjusting your filters or search query"
                : "All applications have been processed"}
            </p>
            {(searchQuery || companyFilter !== 'all' || jobFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCompanyFilter('all');
                  setJobFilter('all');
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
              Showing <span className={`font-semibold ${textColor}`}>{filteredApplications.length}</span> pending {filteredApplications.length === 1 ? 'application' : 'applications'}
            </p>
          </div>
        )}

        {/* Applications List */}
        {!loading && filteredApplications.length > 0 && (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const details = applicationDetails[application.task_id] || {};
              const isLoadingAction = loadingApplications[application.task_id];

              return (
                <div
                  key={application.task_id}
                  className={`${cardBg} border ${borderColor} rounded-lg p-6 hover:border-blue-300 dark:hover:border-blue-500 transition-colors`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                        <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg`}>
                          {details.studentName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`text-lg font-bold ${textColor} truncate`}>
                          {details.studentName || 'Unknown Candidate'}
                        </h3>
                        <p className={`text-sm ${textSecondary} truncate`}>
                          {details.studentEmail || 'No email provided'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className={`text-sm ${textSecondary} flex items-center gap-1`}>
                            <Calendar size={14} />
                            Applied: {formatDate(details.applicationDate)}
                          </span>
                          <span className={`text-sm ${textSecondary} flex items-center gap-1`}>
                            <MapPin size={14} />
                            {details.jobLocation || 'Location not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30`}>
                        Pending Review
                      </span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 mb-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className={`text-sm font-semibold ${textColor} mb-1 flex items-center gap-2`}>
                          <Briefcase size={16} />
                          Job Position
                        </h4>
                        <p className={`text-sm ${textSecondary}`}>{details.jobTitle}</p>
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold ${textColor} mb-1 flex items-center gap-2`}>
                          <Building size={16} />
                          Company
                        </h4>
                        <p className={`text-sm ${textSecondary}`}>{details.companyName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {details.studentSkills && details.studentSkills.length > 0 && (
                    <div className="mb-4">
                      <h4 className={`text-sm font-semibold ${textColor} mb-2`}>Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {details.studentSkills.slice(0, 6).map((skill, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-full text-sm font-medium`}
                          >
                            {skill}
                          </span>
                        ))}
                        {details.studentSkills.length > 6 && (
                          <span className={`text-sm ${textSecondary}`}>
                            +{details.studentSkills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleViewCandidateDetails(application, details)}
                      className={`px-4 py-2 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2`}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    {details.resumeUrl && (
                      <a
                        href={details.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2`}
                      >
                        <Download size={16} />
                        Resume
                      </a>
                    )}
                    <div className="flex-1"></div>
                    <button
                      onClick={() => handleRejectApplication(application.task_id)}
                      disabled={isLoadingAction}
                      className={`px-4 py-2 border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-500/30 dark:text-red-400 dark:bg-red-500/20 dark:hover:bg-red-500/30 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoadingAction ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <X size={16} />
                      )}
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveApplication(application.task_id)}
                      disabled={isLoadingAction}
                      className={`px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoadingAction ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Check size={16} />
                      )}
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
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
            className={`${cardBg} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-5 border-b ${borderColor}`}>
              <h2 className={`text-xl font-bold ${textColor}`}>Candidate Details</h2>
              <button
                onClick={() => setShowCandidateModal(false)}
                className={`${textSecondary} hover:${textColor} transition-colors`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Basic Info */}
              <div>
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>
                  {selectedCandidate.details?.studentName || 'Unknown Candidate'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Email</label>
                    <p className={`text-sm ${textSecondary}`}>{selectedCandidate.details?.studentEmail || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Phone</label>
                    <p className={`text-sm ${textSecondary}`}>{selectedCandidate.details?.studentPhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Location</label>
                    <p className={`text-sm ${textSecondary}`}>{selectedCandidate.details?.studentDetails?.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Experience</label>
                    <p className={`text-sm ${textSecondary}`}>{selectedCandidate.details?.studentDetails?.experience || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Application Date</label>
                    <p className={`text-sm ${textSecondary}`}>{formatDate(selectedCandidate.details?.applicationDate)}</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              {selectedCandidate.details?.studentDetails?.education && selectedCandidate.details.studentDetails.education.length > 0 && (
                <div>
                  <h4 className={`text-md font-bold ${textColor} mb-2`}>Education</h4>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                    {selectedCandidate.details.studentDetails.education.map((edu, index) => (
                      <p key={index} className={`text-sm ${textSecondary}`}>{edu}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedCandidate.details?.studentDetails?.skills && selectedCandidate.details.studentDetails.skills.length > 0 && (
                <div>
                  <h4 className={`text-md font-bold ${textColor} mb-2`}>Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.details.studentDetails.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-full text-sm font-medium`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedCandidate.details?.studentDetails?.bio && (
                <div>
                  <h4 className={`text-md font-bold ${textColor} mb-2`}>Bio</h4>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                    <p className={`text-sm ${textSecondary} whitespace-pre-wrap`}>{selectedCandidate.details.studentDetails.bio}</p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedCandidate.details?.resumeUrl && (
                <div>
                  <h4 className={`text-md font-bold ${textColor} mb-2`}>Resume</h4>
                  <a
                    href={selectedCandidate.details.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    Download Resume
                  </a>
                </div>
              )}
            </div>

            <div className={`flex justify-end gap-2 p-5 border-t ${borderColor}`}>
              <button
                onClick={() => setShowCandidateModal(false)}
                className={`px-6 py-2 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
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
