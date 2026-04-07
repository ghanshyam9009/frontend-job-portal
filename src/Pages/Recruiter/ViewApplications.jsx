import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useSidebar } from "../../Contexts/SidebarContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import { useTheme } from "../../Contexts/ThemeContext";
import {
  ArrowLeft,
  Users,
  FileText,
  ExternalLink,
  Check,
  X,
  Calendar,
  Filter,
  Search,
  GraduationCap,
  Briefcase,
  Phone
} from "lucide-react";
import { recruiterExternalService } from "../../services";

const ViewApplications = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();
 
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Helper function to normalize status from API
  const normalizeStatus = (status, isShortlisted, isRejected) => {
    // Check for rejected status first
    if (isRejected === true || status?.toLowerCase() === 'rejected' || status?.toLowerCase() === 'declined') {
      return 'Rejected';
    }
    
    // Check for shortlisted status
    if (isShortlisted === true || status?.toLowerCase() === 'shortlisted' || status?.toLowerCase() === 'approved' || status?.toLowerCase() === 'accepted') {
      return 'Shortlisted';
    }
    
    // Default to pending
    return 'Pending';
  };

  const fetchApplications = async () => {
    if (!jobId) {
      setError("Job ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Fetch job details
      const employerId = user?.employer_id || user?.id;
      const jobsData = await recruiterExternalService.getAllPostedJobs(employerId);
      const job = jobsData?.jobs?.find(j => j.job_id === parseInt(jobId));
     
      if (job) {
        setJobDetails({
          title: job.job_title,
          company: job.company_name || "",
          location: job.location || "",
          type: job.employment_type || "",
          status: job.status || "Open"
        });
      }

      // Fetch applications
      const applicationsData = await recruiterExternalService.getAllApplicants(jobId);
      const applicationsList = applicationsData.applications || [];

      // Use embedded student data from application response
      const applicationsWithDetails = applicationsList.map((app) => {
        // Extract student profile data from the embedded student_profile object
        const studentProfile = app.student_profile || {};

        // Format experience data properly
        let experienceString = "Not provided";
        if (studentProfile.experience && typeof studentProfile.experience === 'string') {
          experienceString = studentProfile.experience; // e.g., "fresher"
        } else if (studentProfile.experience_years) {
          experienceString = `${studentProfile.experience_years} years`;
        } else if (app.student_experience) {
          experienceString = app.student_experience;
        }

        // Format education data properly
        let qualificationString = "Not provided";
        if (studentProfile.education && Array.isArray(studentProfile.education) && studentProfile.education.length > 0) {
          const firstEdu = studentProfile.education[0];
          qualificationString = firstEdu.degree || firstEdu.institution || "Not provided";
        } else if (app.student_degree) {
          qualificationString = app.student_degree;
        }

        // Get resume URL from student profile
        const resumeUrl = studentProfile.resumeUrl || studentProfile.resume || app.resume_url;

        // Normalize status - check multiple possible fields including rejected
        const normalizedStatus = normalizeStatus(
          app.status || app.application_status,
          app.is_shortlisted || app.shortlisted,
          app.is_rejected || app.rejected
        );

        return {
          ...app,
          student_name: studentProfile.full_name || app.student_name || "Unknown Candidate",
          student_email: studentProfile.email || app.student_email || "Unknown Email",
          qualification: qualificationString,
          experience: experienceString,
          phone_number: studentProfile.phone_number || app.student_phone || "Not provided",
          skills: Array.isArray(studentProfile.skills) ? studentProfile.skills : (app.student_skills ? [app.student_skills] : []),
          resume_url: resumeUrl,
          status: normalizedStatus, // Use normalized status
          is_shortlisted: app.is_shortlisted || app.shortlisted || false,
          is_rejected: app.is_rejected || app.rejected || false,
          // Include other student profile data but exclude complex objects that might cause React rendering issues
          student_profile: {
            ...studentProfile,
            experience: undefined, // Remove complex experience array
            education: undefined, // Remove complex education array
          }
        };
      });

      setApplications(applicationsWithDetails);
    } catch (e) {
      console.error(e);
      setError(typeof e === "string" ? e : e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId, user]);

  const handleShortlistApplication = async (applicationId) => {
    try {
      setActionLoading(prev => ({ ...prev, [applicationId]: true }));
      
      console.log('Shortlisting application:', applicationId);
      
      // Update local state immediately for better UX
      setApplications(prevApplications =>
        prevApplications.map(app =>
          app.application_id === applicationId
            ? { 
                ...app, 
                status: 'Shortlisted',
                is_shortlisted: true,
                is_rejected: false,
                application_status: 'Shortlisted'
              }
            : app
        )
      );
      
      // Call the API to shortlist (set to true)
      const response = await recruiterExternalService.changeApplicationStatus(applicationId, true);
      
      console.log('Shortlist API response:', response);
      
      // Verify the API call was successful
      if (response && (response.success || response.message || response.status === 'success' || response.data)) {
        alert('Application shortlisted successfully');
      } else {
        console.warn('API response unclear, status updated locally. Refetching to verify...');
        // Wait a bit then refetch to verify backend state
        setTimeout(() => fetchApplications(), 1000);
      }
    } catch (e) {
      console.error('Error shortlisting application:', e);
      alert('Failed to shortlist application. Please try again.');
      
      // Refetch applications to ensure data consistency with backend
      await fetchApplications();
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleRejectApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to reject this application?')) {
      return;
    }
   
    try {
      setActionLoading(prev => ({ ...prev, [applicationId]: true }));
      
      console.log('Rejecting application:', applicationId);
      
      // Update local state immediately for better UX
      setApplications(prevApplications =>
        prevApplications.map(app =>
          app.application_id === applicationId
            ? { 
                ...app, 
                status: 'Rejected',
                is_shortlisted: false,
                is_rejected: true,
                application_status: 'Rejected'
              }
            : app
        )
      );
      
      // Try multiple API approaches to ensure rejection works
      let response;
      let apiCallSuccessful = false;
      
      // Approach 1: Check if there's a dedicated reject method
      if (typeof recruiterExternalService.rejectApplication === 'function') {
        try {
          console.log('Using rejectApplication method...');
          response = await recruiterExternalService.rejectApplication(applicationId);
          apiCallSuccessful = true;
          console.log('Reject API response (dedicated method):', response);
        } catch (err) {
          console.warn('rejectApplication method failed:', err);
        }
      }
      
      // Approach 2: Try using updateApplicationStatus if available
      if (!apiCallSuccessful && typeof recruiterExternalService.updateApplicationStatus === 'function') {
        try {
          console.log('Using updateApplicationStatus method...');
          response = await recruiterExternalService.updateApplicationStatus(applicationId, 'rejected');
          apiCallSuccessful = true;
          console.log('Reject API response (update method):', response);
        } catch (err) {
          console.warn('updateApplicationStatus method failed:', err);
        }
      }
      
      // Approach 3: Try using a status parameter with changeApplicationStatus
      if (!apiCallSuccessful && typeof recruiterExternalService.changeApplicationStatus === 'function') {
        try {
          console.log('Using changeApplicationStatus with rejection flag...');
          // Try with a third parameter for rejection
          response = await recruiterExternalService.changeApplicationStatus(applicationId, false, 'rejected');
          apiCallSuccessful = true;
          console.log('Reject API response (change status with param):', response);
        } catch (err) {
          console.warn('changeApplicationStatus with param failed:', err);
        }
      }
      
      // Approach 4: Last resort - use changeApplicationStatus with false and hope backend handles it
      if (!apiCallSuccessful) {
        console.log('Using changeApplicationStatus with false (last resort)...');
        response = await recruiterExternalService.changeApplicationStatus(applicationId, false);
        console.log('Reject API response (fallback):', response);
      }
      
      console.log('Final reject response:', response);
      
      // Verify the API call was successful
      if (response && (response.success || response.message || response.status === 'success' || response.data)) {
        alert('Application rejected successfully');
      } else {
        console.warn('API response unclear, status updated locally. Refetching to verify...');
        // Wait a bit then refetch to verify backend state
        setTimeout(() => fetchApplications(), 1000);
      }
    } catch (e) {
      console.error('Error rejecting application:', e);
      alert('Failed to reject application. Please try again.');
      
      // Refetch applications to ensure data consistency with backend
      await fetchApplications();
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleMoveToPending = async (applicationId) => {
    if (!window.confirm('Are you sure you want to move this application back to pending?')) {
      return;
    }
    
    try {
      setActionLoading(prev => ({ ...prev, [applicationId]: true }));
      
      console.log('Moving to pending:', applicationId);
      
      // Update local state immediately for better UX
      setApplications(prevApplications =>
        prevApplications.map(app =>
          app.application_id === applicationId
            ? { 
                ...app, 
                status: 'Pending',
                is_shortlisted: false,
                is_rejected: false,
                application_status: 'Pending'
              }
            : app
        )
      );
      
      // Call the API to move back to pending (set to false)
      const response = await recruiterExternalService.changeApplicationStatus(applicationId, false);
      
      console.log('Move to pending API response:', response);
      
      // Verify the API call was successful
      if (response && (response.success || response.message || response.status === 'success' || response.data)) {
        alert('Application moved to pending successfully');
      } else {
        console.warn('API response unclear, status updated locally. Refetching to verify...');
        // Wait a bit then refetch to verify backend state
        setTimeout(() => fetchApplications(), 1000);
      }
    } catch (e) {
      console.error('Error moving to pending:', e);
      alert('Failed to move application to pending. Please try again.');
      
      // Refetch applications to ensure data consistency with backend
      await fetchApplications();
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === "All" || app.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = app.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.student_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'shortlisted':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    }
  };

  const getStatusStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status?.toLowerCase() === 'pending').length,
      shortlisted: applications.filter(app => app.status?.toLowerCase() === 'shortlisted').length,
      rejected: applications.filter(app => app.status?.toLowerCase() === 'rejected').length,
    };
  };

  const stats = getStatusStats();

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
     
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} mt-20 sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/manage-jobs')}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <ArrowLeft size={20} className={textColor} />
              </button>
              <div className="flex-1">
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                  Applications
                </h1>
                {jobDetails && (
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    {jobDetails.title} • {jobDetails.company}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <Users size={16} className={textSecondary} />
                  <span className={`text-sm font-semibold ${textColor}`}>{stats.total}</span>
                  <span className={`text-xs ${textSecondary}`}>Total</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{stats.pending}</span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-500">Pending</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">{stats.shortlisted}</span>
                  <span className="text-xs text-green-600 dark:text-green-500">Shortlisted</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-red-700 dark:text-red-400">{stats.rejected}</span>
                  <span className="text-xs text-red-600 dark:text-red-500">Rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className={`${cardBg} rounded-lg border ${borderColor} p-5 lg:sticky lg:top-24`}>
              <h2 className={`text-lg font-bold ${textColor} mb-4 flex items-center gap-2`}>
                <Filter size={20} />
                Filters
              </h2>

              {/* Search */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold ${textColor} mb-2`}>Search Candidates</label>
                <div className="relative">
                  <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name or email..."
                    className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className={`block text-sm font-semibold ${textColor} mb-3`}>Application Status</label>
                <div className="space-y-2">
                  {['All', 'Pending', 'Shortlisted', 'Rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === status
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                          : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{status}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {status === 'All' ? stats.total :
                           status === 'Pending' ? stats.pending :
                           status === 'Shortlisted' ? stats.shortlisted :
                           stats.rejected}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Applications List */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="mb-4">
              <p className={`text-sm ${textSecondary}`}>
                Showing <span className={`font-semibold ${textColor}`}>{filteredApplications.length}</span> {filteredApplications.length === 1 ? 'application' : 'applications'}
              </p>
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
                  {filterStatus === 'All' && searchQuery === ''
                    ? "This job hasn't received any applications yet."
                    : "Try adjusting your filters or search query"}
                </p>
                {(filterStatus !== 'All' || searchQuery !== '') && (
                  <button
                    onClick={() => {
                      setFilterStatus('All');
                      setSearchQuery('');
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Applications - Compact Cards */}
            {!loading && !error && filteredApplications.length > 0 && (
              <div className="space-y-2.5">
                {filteredApplications.map((application) => {
                  const isLoading = actionLoading[application.application_id];
                  
                  return (
                    <div
                      key={application.application_id}
                      className={`${cardBg} border ${borderColor} rounded-lg p-2.5 hover:border-blue-300 dark:hover:border-blue-500 transition-colors`}
                    >
                      {/* Candidate Header */}
                      <div className="flex items-start justify-between gap-2.5 mb-2.5">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            {application.student_profile?.logo || application.student_profile?.company_logo || application.student_profile?.profile_image ? (
                              <img
                                src={application.student_profile.logo || application.student_profile.company_logo || application.student_profile.profile_image}
                                alt={application.student_name || 'Candidate'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ${application.student_profile?.logo || application.student_profile?.company_logo || application.student_profile?.profile_image ? 'hidden' : 'flex'}`}>
                              {application.student_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-xs font-bold ${textColor} truncate leading-tight`}>
                              {application.student_name}
                            </h4>
                            <p className={`text-xs ${textSecondary} truncate`} style={{ fontSize: '0.7rem' }}>
                              {application.student_email}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.65rem' }}>
                                {new Date(application.created_at).toLocaleDateString()}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(application.status)}`} style={{ fontSize: '0.65rem' }}>
                                {application.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Candidate Information */}
                      <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-2 mb-2 border ${borderColor}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Qualification */}
                          <div>
                            <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                              <GraduationCap size={12} />
                              Qualification
                            </h5>
                            <p className={`text-xs ${textSecondary}`} style={{ fontSize: '0.7rem' }}>
                              {application.qualification || application.education || 'Not provided'}
                            </p>
                          </div>

                          {/* Experience */}
                          <div>
                            <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                              <Briefcase size={12} />
                              Experience
                            </h5>
                            <p className={`text-xs ${textSecondary}`} style={{ fontSize: '0.7rem' }}>
                              {application.experience || application.years_of_experience || 'Not provided'}
                            </p>
                          </div>

                          {/* Mobile Number */}
                          <div className="sm:col-span-2">
                            <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                              <Phone size={12} />
                             Contact Number
                            </h5>
                            <p className={`text-xs ${textSecondary}`} style={{ fontSize: '0.7rem' }}>
                              {application.phone_number || application.phone || application.contact_number || application.mobile || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        {application.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleShortlistApplication(application.application_id)}
                              disabled={isLoading}
                              className="px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <Check size={12} />
                              )}
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleRejectApplication(application.application_id)}
                              disabled={isLoading}
                              className="px-2.5 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <X size={12} />
                              )}
                              Reject
                            </button>
                          </>
                        )}
                        
                        {application.status === 'Shortlisted' && (
                          <>
                            <button
                              onClick={() => handleMoveToPending(application.application_id)}
                              disabled={isLoading}
                              className={`px-2.5 py-1 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              ) : (
                                <ArrowLeft size={12} />
                              )}
                              Move to Pending
                            </button>
                            <button
                              onClick={() => handleRejectApplication(application.application_id)}
                              disabled={isLoading}
                              className="px-2.5 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {isLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <X size={12} />
                              )}
                              Reject
                            </button>
                          </>
                        )}
                        
                        {application.status === 'Rejected' && (
                          <button
                            onClick={() => handleMoveToPending(application.application_id)}
                            disabled={isLoading}
                            className={`px-2.5 py-1 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : (
                              <ArrowLeft size={12} />
                            )}
                            Move to Pending
                          </button>
                        )}
                        
                        {application.resume_url && (
                          <a
                            href={application.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-2.5 py-1 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            <ExternalLink size={12} />
                            Resume
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewApplications;