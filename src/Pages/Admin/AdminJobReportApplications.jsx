import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import {
  ArrowLeft,
  Users,
  Download,
  Search,
  Eye,
  X,
  Building,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Check,
  Trash2
} from "lucide-react";
import * as XLSX from 'xlsx';

const AdminJobReportApplications = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { theme } = useTheme();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // Default to all to show both pending and approved
  const [loadingActions, setLoadingActions] = useState({});
  const [pendingTasks, setPendingTasks] = useState([]); // Store pending tasks for approval

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    if (!jobId) {
      setError("Job ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const job = await adminService.getRecruiterJobForReportById(jobId);

      if (!job) {
        setError("Job not found. Only jobs posted by recruiters are shown in the application report.");
        setLoading(false);
        return;
      }

      setJobDetails({
        title: job.job_title,
        company: job.company_name || "",
        location: job.location || "",
        salary: job.salary_range || "",
        postedDate: job.created_at || "",
        applicationCount: job.application_count || 0
      });

      // Fetch pending tasks for this job (applications waiting for admin approval)
      const pendingTasksData = await adminService.getPendingJobs();
      const jobPendingTasks = pendingTasksData.filter(task => 
        task.category === 'newapplication' && 
        task.status === 'pending' && 
        task.job_id === jobId
      );
      setPendingTasks(jobPendingTasks);

      // Fetch all candidates once to use for matching student details
      let allCandidates = [];
      try {
        allCandidates = await adminService.getCandidates();
      } catch (candidateErr) {
        console.warn('Failed to fetch candidates for student details:', candidateErr);
      }

      // Fetch applications (these are already approved and visible to recruiters)
      const applicationsData = await adminService.getApplicationsForJob(jobId);
      const applicationsList = applicationsData.applications || [];

      // Create a map of task_id by student_id and application_id for matching
      const taskMap = {};
      jobPendingTasks.forEach(task => {
        const key = `${task.student_id}_${task.application_id || ''}`;
        taskMap[key] = task.task_id;
      });

      // Enrich applications with student data and task information
      const applicationsWithDetails = applicationsList.map((app) => {
        // Try to find matching task
        const taskKey = `${app.student_id || app.student_email}_${app.application_id || ''}`;
        const matchingTask = jobPendingTasks.find(task => 
          (task.student_id && task.student_id.toString() === (app.student_id || '').toString()) ||
          (task.application_id && task.application_id.toString() === (app.application_id || '').toString())
        );

        return {
          ...app,
          task_id: matchingTask?.task_id || null, // Add task_id if pending approval
          needs_approval: !!matchingTask, // Flag if this application needs admin approval
          student_details: {
            name: app.student_name || "Unknown",
            email: app.student_email || app.email || null,
            phone: app.student_phone || null,
            skills: app.student_skills
              ? (typeof app.student_skills === 'string'
                  ? app.student_skills.split(',').map(skill => skill.trim())
                  : Array.isArray(app.student_skills)
                  ? app.student_skills
                  : [])
              : [],
            location: app.student_location || null,
            experience: app.student_experience || null,
            education: app.student_university ? [app.student_university] : [],
            experience_years: app.student_experience_years || null,
            bio: app.student_bio || null,
            resumeUrl: app.resume_url || app.student_profile?.resume || null,
            department: app.student_department || null,
            cgpa: app.student_cgpa || null,
            logo: app.student_profile?.logo || app.student_profile?.profile_image || null
          }
        };
      });

      // Also add pending applications that haven't been approved yet (not in applications list)
      // Fetch details for pending applications
      const pendingApplicationsPromises = jobPendingTasks.map(async (task) => {
        // Try to find if this task already has an application
        const existingApp = applicationsList.find(app => 
          (task.student_id && task.student_id.toString() === (app.student_id || '').toString()) ||
          (task.application_id && task.application_id.toString() === (app.application_id || '').toString())
        );

        // If not found, fetch application and student details
        if (!existingApp && task.job_id) {
          try {
            // Try to get application details from the job applications
            const appDetails = await adminService.getApplicationsForJob(task.job_id);
            const matchingApp = (appDetails.applications || []).find(app =>
              (task.student_id && task.student_id.toString() === (app.student_id || '').toString()) ||
              (task.application_id && task.application_id.toString() === (app.application_id || '').toString())
            );

            if (matchingApp) {
              return {
                ...matchingApp,
                task_id: task.task_id,
                needs_approval: true,
                status: 'pending',
                student_details: {
                  name: matchingApp.student_name || `Student ${task.student_id || 'Unknown'}`,
                  email: matchingApp.student_email || matchingApp.email || null,
                  phone: matchingApp.student_phone || null,
                  skills: matchingApp.student_skills
                    ? (typeof matchingApp.student_skills === 'string'
                        ? matchingApp.student_skills.split(',').map(skill => skill.trim())
                        : Array.isArray(matchingApp.student_skills)
                        ? matchingApp.student_skills
                        : [])
                    : [],
                  location: matchingApp.student_location || null,
                  experience: matchingApp.student_experience || null,
                  education: matchingApp.student_university ? [matchingApp.student_university] : [],
                  experience_years: matchingApp.student_experience_years || null,
                  bio: matchingApp.student_bio || null,
                  resumeUrl: matchingApp.resume_url || matchingApp.student_profile?.resume || null,
                  department: matchingApp.student_department || null,
                  cgpa: matchingApp.student_cgpa || null,
                  logo: matchingApp.student_profile?.logo || matchingApp.student_profile?.profile_image || null
                }
              };
            }

            // If not found in applications, try to fetch student details from pre-fetched candidates
            if (task.student_id && allCandidates.length > 0) {
              try {
                const studentCandidate = allCandidates.find(c => 
                  (c.id && c.id.toString() === task.student_id.toString()) ||
                  (c.user_id && c.user_id.toString() === task.student_id.toString())
                );

                if (studentCandidate) {
                  return {
                    application_id: task.application_id || `pending_${task.task_id}`,
                    task_id: task.task_id,
                    needs_approval: true,
                    status: 'pending',
                    student_id: task.student_id,
                    created_at: task.created_at || task.posted_date,
                    student_details: {
                      name: studentCandidate.name || `Student ${task.student_id || 'Unknown'}`,
                      email: studentCandidate.email || null,
                      phone: studentCandidate.phone || null,
                      skills: Array.isArray(studentCandidate.skills) ? studentCandidate.skills : [],
                      location: studentCandidate.location || studentCandidate.city || null,
                      experience: studentCandidate.experience || null,
                      education: studentCandidate.education || [],
                      experience_years: null,
                      bio: studentCandidate.bio || null,
                      resumeUrl: studentCandidate.resume || null,
                      department: null,
                      cgpa: null,
                      logo: studentCandidate.logo || studentCandidate.profile_image || null
                    }
                  };
                }
              } catch (candidateErr) {
                console.warn(`Failed to fetch candidate details for student_id ${task.student_id}:`, candidateErr);
              }     
            }
          } catch (err) {
            console.warn(`Failed to fetch details for pending task ${task.task_id}:`, err);
          }

          // Fallback: create basic pending application entry
          return {
            application_id: task.application_id || `pending_${task.task_id}`,
            task_id: task.task_id,
            needs_approval: true,
            status: 'pending',
            student_id: task.student_id,
            created_at: task.created_at || task.posted_date,
            student_details: {
              name: `Student ${task.student_id || 'Unknown'}`,
              email: null,
              phone: null,
              skills: [],
              location: null,
              experience: null,
              education: [],
              experience_years: null,
              bio: null,
              resumeUrl: null,
              department: null,
              cgpa: null,
              logo: null
            }
          };
        }
        return null;
      });

      const pendingApplications = (await Promise.all(pendingApplicationsPromises)).filter(Boolean);

      // Combine approved and pending applications
      const allApplications = [...applicationsWithDetails, ...pendingApplications];

      setApplications(allApplications);
    } catch (e) {
      console.error(e);
      setError(typeof e === "string" ? e : e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleExportToExcel = () => {
    if (!applications || applications.length === 0) {
      alert('No applications to export.');
      return;
    }

    try {
      const exportData = applications.map(app => ({
        'Application ID': app.application_id || 'N/A',
        'Job Title': jobDetails?.title || 'N/A',
        'Company Name': jobDetails?.company || 'N/A',
        'Candidate Name': app.student_details?.name || 'Unknown',
        'Email': app.student_details?.email || 'N/A',
        'Phone': app.student_details?.phone || 'N/A',
        'Skills': Array.isArray(app.student_details?.skills) ? app.student_details.skills.join(', ') : (app.student_details?.skills || 'N/A'),
        'Experience': app.student_details?.experience || (app.student_details?.experience_years ? `${app.student_details.experience_years} years` : 'N/A'),
        'Education': Array.isArray(app.student_details?.education) ? app.student_details.education.join('; ') : (app.student_details?.education || 'N/A'),
        'Location': app.student_details?.location || 'N/A',
        'Status': app.status || 'pending',
        'Applied Date': formatDate(app.created_at || app.applied_date),
        'Resume URL': app.student_details?.resumeUrl || app.resume_url || 'N/A',
        'Cover Letter': app.cover_letter || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');

      const sanitizedCompany = (jobDetails?.company || 'Unknown').replace(/[^a-zA-Z0-9_]/g, '_');
      const sanitizedJobTitle = (jobDetails?.title || 'Job').replace(/[^a-zA-Z0-9_]/g, '_');
      const filename = `${sanitizedCompany}_${sanitizedJobTitle}_Applications_Report.xlsx`;

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

  const handleApproveApplication = async (application) => {
    const taskId = application.task_id;
    if (!taskId) {
      alert('Cannot approve: Task ID not found. This application may already be approved.');
      return;
    }

    const confirmApprove = window.confirm(
      `Are you sure you want to approve this application? Once approved, it will be visible to the recruiter.`
    );
    if (!confirmApprove) return;

    try {
      setLoadingActions(prev => ({ ...prev, [application.application_id]: true }));

      // Use adminService to approve the application
      await adminService.approveJobApplicationByStudent(taskId);

      alert('Application approved successfully! The application is now visible to the recruiter.');
      
      // Refresh applications to update status and fetch newly approved applications
      await fetchApplications();
      
      // Find and show the approved candidate details if available
      await fetchApplications(); // Fetch again to get updated data
      const updatedApps = await adminService.getApplicationsForJob(jobId);
      const updatedApp = (updatedApps.applications || []).find(app => 
        app.application_id === application.application_id ||
        (app.student_id && app.student_id.toString() === (application.student_id || '').toString())
      );
      
      if (updatedApp) {
        // Enrich with student details
        const enrichedApp = {
          ...updatedApp,
          student_details: {
            name: updatedApp.student_name || "Unknown",
            email: updatedApp.student_email || updatedApp.email || null,
            phone: updatedApp.student_phone || null,
            skills: updatedApp.student_skills
              ? (typeof updatedApp.student_skills === 'string'
                  ? updatedApp.student_skills.split(',').map(skill => skill.trim())
                  : Array.isArray(updatedApp.student_skills)
                  ? updatedApp.student_skills
                  : [])
              : [],
            location: updatedApp.student_location || null,
            experience: updatedApp.student_experience || null,
            education: updatedApp.student_university ? [updatedApp.student_university] : [],
            experience_years: updatedApp.student_experience_years || null,
            bio: updatedApp.student_bio || null,
            resumeUrl: updatedApp.resume_url || updatedApp.student_profile?.resume || null,
            department: updatedApp.student_department || null,
            cgpa: updatedApp.student_cgpa || null,
            logo: updatedApp.student_profile?.logo || updatedApp.student_profile?.profile_image || null
          }
        };
        handleViewCandidateDetails(enrichedApp);
      }
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert(error.message || 'Failed to approve application. Please try again.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [application.application_id]: false }));
    }
  };

  const handleRejectApplication = async (application) => {
    const taskId = application.task_id;
    if (!taskId) {
      alert('Cannot reject: Task ID not found. This application may already be processed.');
      return;
    }

    const confirmReject = window.confirm(
      'Are you sure you want to reject this application? It will be removed and the candidate will not be visible to the recruiter.'
    );
    if (!confirmReject) return;

    try {
      setLoadingActions(prev => ({ ...prev, [application.application_id]: true }));

      // Use adminService to reject the application (rejectJob uses taskId)
      await adminService.rejectJob(taskId);

      alert('Application rejected successfully.');
      
      // Refresh applications to update the list
      await fetchApplications();
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert(error.message || 'Failed to reject application. Please try again.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [application.application_id]: false }));
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

  const filteredApplications = applications.filter(app => {
    // Determine actual status: if needs_approval is true, it's pending
    const actualStatus = app.needs_approval ? 'pending' : (app.status || 'approved');
    
    // Filter by status
    const matchesStatus = statusFilter === "all" || actualStatus.toLowerCase() === statusFilter.toLowerCase();

    // Then filter by search query
    const matchesSearch = !searchQuery ||
      app.student_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.student_details?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status, needsApproval) => {
    // If needs approval, it's pending regardless of status
    if (needsApproval) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
    }
    
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'shortlisted':
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    }
  };

  const getStatusLabel = (status, needsApproval) => {
    if (needsApproval) {
      return 'Pending Admin Approval';
    }
    return status || 'Approved';
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Back button and title */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(`/admin/job-application-reports/job/${jobId}`)}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <ArrowLeft size={20} className={textColor} />
              </button>
              <div className="flex-1">
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                  Application Report
                </h1>
                {jobDetails && (
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    {jobDetails.title} • {jobDetails.company}
                  </p>
                )}
              </div>
              <button
                onClick={handleExportToExcel}
                disabled={applications.length === 0}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export All</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <Users size={16} className={textSecondary} />
                  <span className={`text-sm font-semibold ${textColor}`}>{applications.length}</span>
                  <span className={`text-xs ${textSecondary}`}>Total Applications</span>
                </div>
              </div>
              {jobDetails && (
                <>
                  <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className={textSecondary} />
                      <span className={`text-xs ${textSecondary}`}>{jobDetails.location || 'N/A'}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className={textSecondary} />
                      <span className={`text-xs ${textSecondary}`}>Posted: {formatDate(jobDetails.postedDate)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter on Top */}
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
                  placeholder="Search by candidate name or email..."
                  className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Pending Approval ({applications.filter(app => app.needs_approval).length})
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'approved'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Approved ({applications.filter(app => !app.needs_approval).length})
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Users className="text-blue-500" size={24} />
              </div>
            </div>
            <h3 className={`text-lg font-bold ${textColor}`}>Loading applications...</h3>
            <p className={`${textSecondary} mt-2`}>Please wait</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="text-red-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-red-500 mb-2">Failed to Load Applications</h3>
            <p className={textSecondary}>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredApplications.length === 0 && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Users size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No applications found</h3>
            <p className={`${textSecondary} mb-6`}>
              {searchQuery ? "Try adjusting your search query" : "This job hasn't received any applications yet."}
            </p>
          </div>
        )}

        {/* Results Header */}
        {!loading && !error && filteredApplications.length > 0 && (
          <div className="mb-4">
            <p className={`text-sm ${textSecondary}`}>
              Showing <span className={`font-semibold ${textColor}`}>{filteredApplications.length}</span> {filteredApplications.length === 1 ? 'application' : 'applications'}
            </p>
          </div>
        )}

        {/* Applications - Compact Cards */}
        {!loading && !error && filteredApplications.length > 0 && (
          <div className="space-y-2.5">
            {filteredApplications.map((application) => (
              <div
                key={application.application_id}
                className={`${cardBg} border ${borderColor} rounded-lg p-2.5 hover:border-blue-300 dark:hover:border-blue-500 transition-colors`}
              >
                {/* Candidate Header */}
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                      {application.student_details?.logo ? (
                        <img
                          src={application.student_details.logo}
                          alt={application.student_details.name || 'Candidate'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ${application.student_details?.logo ? 'hidden' : 'flex'}`}>
                        {application.student_details?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold ${textColor} truncate leading-tight`}>
                        {application.student_details?.name || 'Unknown Candidate'}
                      </h4>
                      <p className={`text-xs ${textSecondary} truncate`} style={{ fontSize: '0.7rem' }}>
                        {application.student_details?.email || 'No email provided'}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.65rem' }}>
                          Applied: {formatDate(application.created_at || application.applied_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(application.status, application.needs_approval)}`} style={{ fontSize: '0.65rem' }}>
                    {getStatusLabel(application.status, application.needs_approval)}
                  </span>
                </div>

                {/* Candidate Information */}
                <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-2 mb-2 border ${borderColor}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Phone */}
                    {application.student_details?.phone && (
                      <div>
                        <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                          <Phone size={12} />
                          Phone
                        </h5>
                        <p className={`text-xs ${textSecondary}`} style={{ fontSize: '0.7rem' }}>
                          {application.student_details.phone}
                        </p>
                      </div>
                    )}

                    {/* Experience */}
                    {application.student_details?.experience && (
                      <div>
                        <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                          <Briefcase size={12} />
                          Experience
                        </h5>
                        <p className={`text-xs ${textSecondary}`} style={{ fontSize: '0.7rem' }}>
                          {application.student_details.experience}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    {application.student_details?.skills && application.student_details.skills.length > 0 && (
                      <div className="sm:col-span-2">
                        <h5 className={`text-xs font-semibold ${textColor} mb-1`} style={{ fontSize: '0.7rem' }}>
                          Skills
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {application.student_details.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={index}
                              className={`px-2 py-0.5 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-full text-xs`}
                              style={{ fontSize: '0.65rem' }}
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
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleViewCandidateDetails(application)}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Eye size={12} />
                    View Details
                  </button>
                  {application.student_details?.resumeUrl && (
                    <a
                      href={application.student_details.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-2.5 py-1 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      <Download size={12} />
                      Resume
                    </a>
                  )}

                  {/* Approve/Reject buttons for pending applications that need admin approval */}
                  {application.needs_approval && (
                    <>
                      <button
                        onClick={() => handleApproveApplication(application)}
                        disabled={loadingActions[application.application_id] || !application.task_id}
                        className="px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {loadingActions[application.application_id] ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Check size={12} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectApplication(application)}
                        disabled={loadingActions[application.application_id] || !application.task_id}
                        className="px-2.5 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {loadingActions[application.application_id] ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Details Modal - Same as previous implementation */}
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
                  {selectedCandidate.student_details?.name || 'Unknown Candidate'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Email</label>
                    <p className={`text-sm ${textSecondary}`}>{selectedCandidate.student_details?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Phone</label>
                    <p className={`text-sm ${textSecondary}`}>{selectedCandidate.student_details?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Location</label>
                    <p className={`text-sm ${textSecondary}`}>{selectedCandidate.student_details?.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Experience</label>
                    <p className={`text-sm ${textSecondary}`}>{selectedCandidate.student_details?.experience || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Application Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedCandidate.status, selectedCandidate.needs_approval)}`}>
                      {getStatusLabel(selectedCandidate.status, selectedCandidate.needs_approval)}
                    </span>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Applied Date</label>
                    <p className={`text-sm ${textSecondary}`}>{formatDate(selectedCandidate.created_at || selectedCandidate.applied_date)}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedCandidate.student_details?.skills && selectedCandidate.student_details.skills.length > 0 && (
                <div>
                  <h4 className={`text-md font-bold ${textColor} mb-2`}>Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.student_details.skills.map((skill, index) => (
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

              {/* Cover Letter */}
              {selectedCandidate.cover_letter && (
                <div>
                  <h4 className={`text-md font-bold ${textColor} mb-2`}>Cover Letter</h4>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                    <p className={`text-sm ${textSecondary} whitespace-pre-wrap`}>{selectedCandidate.cover_letter}</p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedCandidate.student_details?.resumeUrl && (
                <div>
                  <h4 className={`text-md font-bold ${textColor} mb-2`}>Resume</h4>
                  <a
                    href={selectedCandidate.student_details.resumeUrl}
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

export default AdminJobReportApplications;
