import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterExternalService } from "../../services";
import { Check, X, FileText, Download, ExternalLink } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";
const PendingJobApplications = () => {
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

  // Fetch pending applications with full details and auto-approve new applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch pending applications
        const pendingTasks = await adminService.getPendingJobs();
        const newApplicationTasks = pendingTasks.filter(task =>
          task.category === 'newapplication' && task.status === 'pending'
        );

        // Auto-approve all new application tasks
        if (newApplicationTasks.length > 0) {
          for (const task of newApplicationTasks) {
            try {
              await adminService.approveJobApplicationByStudent(task.task_id);
              console.log(`Auto-approved application task: ${task.task_id}`);
            } catch (error) {
              console.error(`Failed to auto-approve task ${task.task_id}:`, error);
            }
          }

          // Re-fetch tasks after auto-approval
          const updatedTasks = await adminService.getPendingJobs();
          const remainingPendingApps = updatedTasks.filter(task =>
            task.category === 'newapplication' && task.status === 'pending'
          );

          setPendingApplications(remainingPendingApps);

          // Fetch detailed information for any remaining applications (should be none)
          if (remainingPendingApps.length > 0) {
            await fetchApplicationDetails(remainingPendingApps);
          }
        } else {
          // No new application tasks to approve
          const otherPendingTasks = pendingTasks.filter(task =>
            !(task.category === 'newapplication' && task.status === 'pending')
          );
          setPendingApplications(otherPendingTasks);

          // Fetch detailed information for other types of applications
          if (otherPendingTasks.length > 0) {
            await fetchApplicationDetails(otherPendingTasks);
          }
        }
      } catch (error) {
        console.error('Failed to fetch pending applications:', error);
        setPendingApplications([]);
      } finally {
        setLoading(false);
      }
    };

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

  // Function to fetch complete application details
  const fetchApplicationDetails = async (applications) => {
    const detailsMap = {};

    for (const app of applications) {
      try {
        console.log('Processing application:', app);
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

        // Fetch job details
        if (app.job_id) {
          try {
            const jobResponse = await fetch(
              `https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs?job_id=${app.job_id}`
            );
            if (jobResponse.ok) {
              const jobData = await jobResponse.json();
              const job = Array.isArray(jobData.jobs)
                ? jobData.jobs.find(j => j.job_id === app.job_id) || jobData.jobs[0]
                : jobData.job || jobData;

              if (job) {
                details.jobTitle = job.job_title || job.title || 'Not specified';
                details.jobLocation = job.location || 'Not specified';
                details.companyName = job.company_name || 'Not specified';
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch job ${app.job_id}:`, err);
          }
        }

        // Fetch application details for the job to get student data
        if (app.job_id) {
          try {
            const applicationsResponse = await adminService.getApplicationsForJob(app.job_id);
            const applications = applicationsResponse.applications || [];

            const studentApplication = applications.find(a =>
              a.student_id?.toString() === app.student_id?.toString()
            ) || applications[0];

            if (studentApplication) {
              details.studentName = studentApplication.student_name || `Student ${app.student_id}`;
              details.studentEmail = studentApplication.student_email || studentApplication.email || '';
              details.resumeUrl = studentApplication.resume_url || studentApplication.resume || '';
              details.studentPhone = studentApplication.student_phone || '';
              details.studentSkills = studentApplication.student_skills ?
                studentApplication.student_skills.split(',').map(skill => skill.trim()) : [];

              details.studentDetails = {
                name: studentApplication.student_name || "Unknown",
                email: studentApplication.student_email || studentApplication.email || null,
                phone: studentApplication.student_phone || null,
                skills: studentApplication.student_skills ? 
                  studentApplication.student_skills.split(',').map(skill => skill.trim()) : [],
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
          } catch (error) {
            console.error(`Failed to fetch application details:`, error);
          }
        }

        // Fetch company name if recruiter_id is available
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
        console.error(`Error fetching details:`, error);
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
    }

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
    if (!pendingApplications || pendingApplications.length === 0) {
      alert('No pending applications to export.');
      return;
    }

    try {
      const exportData = pendingApplications.map(app => {
        const details = applicationDetails[app.task_id] || {};
        return {
          'Task ID': app.task_id || 'N/A',
          'Company Name': details.companyName || 'N/A',
          'Job Title': details.jobTitle || 'N/A',
          'Job Location': details.jobLocation || 'N/A',
          'Candidate Name': details.studentName || 'Unknown',
          'Email': details.studentEmail || 'N/A',
          'Phone': details.studentPhone || 'N/A',
          'Skills': Array.isArray(details.studentSkills) ? details.studentSkills.join(', ') : 'N/A',
          'Experience': details.studentDetails?.experience || 'N/A',
          'Application Date': formatDate(details.applicationDate),
          'Status': 'Pending Admin Approval',
          'Resume URL': details.resumeUrl || 'N/A'
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Pending Applications');

      const filename = `Pending_Job_Applications_${new Date().toISOString().split('T')[0]}.xlsx`;

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
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel file. Please try again.');
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

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Job Applications Overview</h1>
        <p className={styles.pageSubtitle}>Monitor job applications - new applications are automatically approved</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6 shadow-sm`}>
          <div className="flex flex-col gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by candidate, email, company, or job title..."
                className={`w-full pl-10 pr-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
              />
            </div>
            
            {/* Filter Row */}
            <div className="flex flex-wrap gap-3">
              {/* Job Filter */}
              {uniqueJobs.length > 1 && (
                <div className="relative flex-1 min-w-[200px]">
                  <Briefcase size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                  <select
                    value={jobFilter}
                    onChange={(e) => {
                      setJobFilter(e.target.value);
                      setCompanyFilter("all"); // Reset company filter when job is selected
                    }}
                    className={`w-full pl-10 pr-8 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                  >
                    <option value="all">All Job Positions ({pendingApplications.length})</option>
                    {uniqueJobs.map(jobKey => {
                      const [jobTitle, companyName] = jobKey.split('|');
                      const count = pendingApplications.filter(app => {
                        const details = applicationDetails[app.task_id];
                        return details?.jobTitle === jobTitle && details?.companyName === companyName;
                      }).length;
                      return (
                        <option key={jobKey} value={jobKey}>
                          {jobTitle} - {companyName} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              
              {/* Company Filter */}
              {uniqueCompanies.length > 1 && (
                <div className="relative flex-1 min-w-[200px]">
                  <Building size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                  <select
                    value={companyFilter}
                    onChange={(e) => {
                      setCompanyFilter(e.target.value);
                      setJobFilter("all"); // Reset job filter when company is selected
                    }}
                    className={`w-full pl-10 pr-8 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                  >
                    <option value="all">All Companies ({pendingApplications.length})</option>
                    {uniqueCompanies.map(company => {
                      const count = pendingApplications.filter(app => 
                        applicationDetails[app.task_id]?.companyName === company
                      ).length;
                      return (
                        <option key={company} value={company}>
                          {company} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              
              {/* Clear Filters Button */}
              {(companyFilter !== "all" || jobFilter !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setCompanyFilter("all");
                    setJobFilter("all");
                    setSearchQuery("");
                  }}
                  className={`px-4 py-3 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2`}
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-yellow-500 mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Clock className="text-yellow-500" size={24} />
              </div>
            </div>
            <h3 className={`text-lg font-bold ${textColor}`}>Loading pending applications...</h3>
            <p className={`${textSecondary} mt-2`}>Please wait</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredApplications.length === 0 && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-green-500/20' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Check size={32} className="text-green-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>
              {searchQuery || companyFilter !== "all" || jobFilter !== "all" ? "No matching applications" : "All caught up!"}
            </h3>
            <p className={`${textSecondary} mb-6`}>
              {searchQuery || companyFilter !== "all" || jobFilter !== "all"
                ? "Try adjusting your search or filters" 
                : "There are no pending applications requiring approval at this time."
              }
            </p>
          </div>
        )}

        {/* Results Header */}
        {!loading && filteredApplications.length > 0 && (
          <div className="mb-4">
            <p className={`text-sm ${textSecondary}`}>
              Showing <span className={`font-semibold ${textColor}`}>{filteredApplications.length}</span> pending {filteredApplications.length === 1 ? 'application' : 'applications'}
            </p>
          </div>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            These applications require admin attention for other reasons.
          </p>

        {/* Applications - Compact Cards */}
        {!loading && filteredApplications.length > 0 && (
          <div className="space-y-3">
            {filteredApplications.map((application) => {
              const details = applicationDetails[application.task_id] || {};
              return (
                <div
                  key={application.task_id}
                  className={`${cardBg} border ${borderColor} rounded-lg p-3 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all shadow-sm hover:shadow-md ring-1 ring-yellow-300 dark:ring-yellow-500/50`}
                >
                  {/* Application Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {/* Candidate Photo/Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 border-2 border-yellow-400 dark:border-yellow-500">
                        {details.studentDetails?.logo ? (
                          <img
                            src={details.studentDetails.logo}
                            alt={details.studentName || 'Candidate'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold text-lg ${details.studentDetails?.logo ? 'hidden' : 'flex'}`}>
                          {details.studentName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </div>
                      
                      {/* Candidate Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-base font-bold ${textColor} leading-tight mb-1`}>
                          {details.studentName || 'Unknown Candidate'}
                        </h4>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Mail size={13} className={textSecondary} />
                          <p className={`text-xs ${textSecondary} truncate`}>
                            {details.studentEmail || 'No email provided'}
                          </p>
                        </div>
                        {details.studentPhone && (
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Phone size={13} className={textSecondary} />
                            <p className={`text-xs ${textSecondary}`}>
                              {details.studentPhone}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className={textSecondary} />
                          <span className={`text-xs ${textSecondary}`}>
                            Applied: {formatDate(details.applicationDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/50 flex items-center gap-1 whitespace-nowrap">
                      <Clock size={13} />
                      PENDING
                    </span>
                  </div>

                  {/* Job & Company Information */}
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-2.5 mb-3 border ${borderColor}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Company */}
                      <div>
                        <h5 className={`text-xs font-semibold ${textColor} mb-1 flex items-center gap-1`}>
                          <Building size={13} className="text-purple-500" />
                          Company
                        </h5>
                        <p className={`text-sm ${textColor} font-medium`}>
                          {details.companyName || 'Unknown'}
                        </p>
                      </div>

                      {/* Job Title */}
                      <div>
                        <h5 className={`text-xs font-semibold ${textColor} mb-1 flex items-center gap-1`}>
                          <Briefcase size={13} className="text-blue-500" />
                          Position
                        </h5>
                        <p className={`text-sm ${textColor} font-medium`}>
                          {details.jobTitle || 'Not specified'}
                        </p>
                      </div>

                      {/* Location */}
                      {details.jobLocation && (
                        <div>
                          <h5 className={`text-xs font-semibold ${textColor} mb-1 flex items-center gap-1`}>
                            <MapPin size={13} className="text-red-500" />
                            Location
                          </h5>
                          <p className={`text-sm ${textColor} font-medium`}>
                            {details.jobLocation}
                          </p>
                        </div>
                      )}

                      {/* Experience */}
                      {details.studentDetails?.experience && (
                        <div>
                          <h5 className={`text-xs font-semibold ${textColor} mb-1 flex items-center gap-1`}>
                            <Briefcase size={13} className="text-green-500" />
                            Experience
                          </h5>
                          <p className={`text-sm ${textColor} font-medium`}>
                            {details.studentDetails.experience}
                          </p>
                        </div>
                      )}

                      {/* Skills */}
                      {details.studentSkills && details.studentSkills.length > 0 && (
                        <div className="sm:col-span-2">
                          <h5 className={`text-xs font-semibold ${textColor} mb-1.5 flex items-center gap-1`}>
                            <span className="text-yellow-500">★</span>
                            Skills & Expertise
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {details.studentSkills.map((skill, index) => (
                              <span
                                key={index}
                                className={`px-2 py-0.5 ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-700' : 'bg-blue-50 text-blue-700 border border-blue-200'} rounded text-xs font-medium`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewCandidateDetails(application, details)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                    
                    {details.resumeUrl && (
                      <a
                        href={details.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1.5 border ${isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-1.5`}
                      >
                        <Download size={14} />
                        Resume
                      </a>
                    )}

                    <div className="flex-1"></div>

                    <button
                      onClick={() => handleApproveApplication(application.task_id)}
                      disabled={loadingApplications[application.task_id]}
                      className="px-3.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Check size={15} />
                      {loadingApplications[application.task_id] ? 'Approving...' : 'Approve'}
                    </button>
                    
                    <button
                      onClick={() => handleRejectApplication(application.task_id)}
                      disabled={loadingApplications[application.task_id]}
                      className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <X size={15} />
                      {loadingApplications[application.task_id] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FileText className={styles.emptyIcon} />
          <h3>No applications requiring attention</h3>
          <p>New applications are automatically approved. All other applications have been processed.</p>
        </div>
      )}
    </div>
  );
};

export default PendingJobApplications;