import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import {
  ArrowLeft,
  Users,
  ExternalLink,
  Check,
  X,
  Search,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import { candidateExternalService } from "../../services/candidateExternalService";

const AdminJobApplications = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  // Track per-application loading state for status updates
  const [statusUpdating, setStatusUpdating] = useState({});

  useEffect(() => {
    fetchApplications();
  }, [jobId, user]);

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
      const jobsData = await candidateExternalService.getAllJobs();
      const currentAdminId = user?.admin_id || user?.id || user?.user_id;
      const job = jobsData?.jobs?.find(j =>
        j.job_id === parseInt(jobId) && j.admin_id === currentAdminId
      );

      if (job) {
        setJobDetails({
          title: job.job_title,
          company: job.company_name || "",
          location: job.location || "",
          type: job.employment_type || "",
          status: job.status || "Open",
          description: job.description || ""
        });
      }

      // Fetch applications
      const applicationsData = await recruiterExternalService.getAllApplicants(jobId);
      console.log('Raw applicants data:', applicationsData);

      let applicationsList = [];
      if (Array.isArray(applicationsData)) {
        applicationsList = applicationsData;
      } else if (applicationsData.applications && Array.isArray(applicationsData.applications)) {
        applicationsList = applicationsData.applications;
      } else if (applicationsData.data && Array.isArray(applicationsData.data)) {
        applicationsList = applicationsData.data;
      }

      // Enrich applications with student data
      const applicationsWithDetails = applicationsList.map((app) => {
        if (app.student_name) {
          return {
            ...app,
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
        }

        return {
          ...app,
          student_details: {
            name: `Student ${app.student_id || 'Unknown'}`,
            email: null,
            phone: null,
            skills: [],
            location: null,
            experience: null,
            education: [],
            experience_years: null,
            bio: null,
            resumeUrl: app.resume_url || null,
            department: null,
            cgpa: null,
            logo: app.student_profile?.logo || app.student_profile?.profile_image || null
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

  // ─── Status Update Handler ────────────────────────────────────────────────
  const handleUpdateStatus = async (application, newStatus) => {
    const appId = application.application_id || application.id;
    if (!appId) return;
    // Prevent duplicate clicks
    if (statusUpdating[appId]) return;

    // If already at the target status, do nothing
    if (application.status?.toLowerCase() === newStatus.toLowerCase()) return;

    setStatusUpdating(prev => ({ ...prev, [appId]: newStatus }));

    try {
      const statusBool = newStatus.toLowerCase() === "shortlisted";
      await recruiterExternalService.changeApplicationStatus(appId, statusBool);

      // Optimistic update — reflect change immediately in local state
      setApplications(prev =>
        prev.map(app =>
          (app.application_id || app.id) === appId
            ? { ...app, status: newStatus }
            : app
        )
      );

      // Also sync if the modal is open for this candidate
      setSelectedCandidate(prev =>
        prev && (prev.application_id || prev.id) === appId
          ? { ...prev, status: newStatus }
          : prev
      );
    } catch (err) {
      console.error(`Failed to update status for application ${appId}:`, err);
      alert(`Failed to update status. Please try again.`);
    } finally {
      setStatusUpdating(prev => {
        const next = { ...prev };
        delete next[appId];
        return next;
      });
    }
  };

  const handleViewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
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
    const matchesStatus = filterStatus === "All" || app.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      app.student_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.student_details?.email?.toLowerCase().includes(searchQuery.toLowerCase());
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

  // ─── Shortlist / Reject button component ─────────────────────────────────
  const StatusActionButtons = ({ application, compact = false }) => {
    const appId = application.application_id || application.id;
    const currentStatus = application.status?.toLowerCase() || 'pending';
    const isUpdating = !!statusUpdating[appId];
    const isShortlisting = statusUpdating[appId] === 'shortlisted';
    const isRejecting = statusUpdating[appId] === 'rejected';

    const isShortlisted = currentStatus === 'shortlisted';
    const isRejected = currentStatus === 'rejected';

    return (
      <div className={`flex gap-1.5 ${compact ? '' : 'flex-wrap'}`}>
        {/* Shortlist Button */}
        <button
          onClick={() => handleUpdateStatus(application, 'shortlisted')}
          disabled={isUpdating || isShortlisted}
          title={isShortlisted ? 'Already shortlisted' : 'Shortlist candidate'}
          className={`
            flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
            transition-all border
            ${isShortlisted
              ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 cursor-default'
              : 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700 dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer'
            }
            ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          style={{ fontSize: '0.7rem' }}
        >
          {isShortlisting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <CheckCircle size={12} />
          )}
          {isShortlisted ? 'Shortlisted' : 'Shortlist'}
        </button>

        {/* Reject Button */}
        <button
          onClick={() => handleUpdateStatus(application, 'rejected')}
          disabled={isUpdating || isRejected}
          title={isRejected ? 'Already rejected' : 'Reject candidate'}
          className={`
            flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
            transition-all border
            ${isRejected
              ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 cursor-default'
              : 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer'
            }
            ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          style={{ fontSize: '0.7rem' }}
        >
          {isRejecting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <XCircle size={12} />
          )}
          {isRejected ? 'Rejected' : 'Reject'}
        </button>
      </div>
    );
  };

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
                onClick={() => navigate(-1)}
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
                  placeholder="Search by name or email..."
                  className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'Shortlisted', 'Rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  {status} ({status === 'All' ? stats.total :
                           status === 'Pending' ? stats.pending :
                           status === 'Shortlisted' ? stats.shortlisted :
                           stats.rejected})
                </button>
              ))}
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
                    {/* Avatar */}
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

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(application.status)}`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {application.status || 'Pending'}
                  </span>
                </div>

                {/* Candidate Information */}
                <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-2 mb-2 border ${borderColor}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {application.student_details?.email && (
                      <div>
                        <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                          <Mail size={12} />
                          Email
                        </h5>
                        <p className={`text-xs ${textSecondary} truncate`} style={{ fontSize: '0.7rem' }}>
                          {application.student_details.email}
                        </p>
                      </div>
                    )}
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
                    {application.student_details?.education && application.student_details.education.length > 0 && (
                      <div>
                        <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                          <GraduationCap size={12} />
                          Education
                        </h5>
                        <p className={`text-xs ${textSecondary}`} style={{ fontSize: '0.7rem' }}>
                          {application.student_details.education[0]}
                        </p>
                      </div>
                    )}
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

                {/* Cover Letter */}
                {application.cover_letter && (
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-2 mb-2 border ${borderColor}`}>
                    <h5 className={`text-xs font-semibold ${textColor} mb-1`} style={{ fontSize: '0.7rem' }}>
                      Cover Letter
                    </h5>
                    <p className={`text-xs ${textSecondary} line-clamp-3`} style={{ fontSize: '0.7rem' }}>
                      {application.cover_letter}
                    </p>
                  </div>
                )}

                {/* ── Action Buttons Row ── */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  {/* View Details */}
                  <button
                    onClick={() => handleViewCandidateDetails(application)}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Eye size={12} />
                    View Details
                  </button>

                  {/* Resume */}
                  {(application.student_details?.resumeUrl || application.resume_url) && (
                    <a
                      href={application.student_details?.resumeUrl || application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-2.5 py-1 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      <Download size={12} />
                      Resume
                    </a>
                  )}

                  {/* Divider */}
                  <div className={`h-5 w-px ${isDark ? 'bg-gray-600' : 'bg-gray-300'} mx-0.5`} />

                  {/* Shortlist / Reject Buttons */}
                  <StatusActionButtons application={application} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Candidate Details Modal ── */}
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
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedCandidate.status)}`}>
                      {selectedCandidate.status || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold ${textColor} mb-1`}>Applied Date</label>
                    <p className={`text-sm ${textSecondary}`}>{formatDate(selectedCandidate.created_at || selectedCandidate.applied_date)}</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              {selectedCandidate.student_details?.education && selectedCandidate.student_details.education.length > 0 && (
                <div>
                  <h4 className={`text-md font-bold ${textColor} mb-2 flex items-center gap-2`}>
                    <GraduationCap size={18} />
                    Education
                  </h4>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-3 border ${borderColor}`}>
                    {selectedCandidate.student_details.education.map((edu, index) => (
                      <p key={index} className={`text-sm ${textSecondary}`}>{edu}</p>
                    ))}
                  </div>
                </div>
              )}

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
              {(selectedCandidate.student_details?.resumeUrl || selectedCandidate.resume_url) && (
                <div>
                  <h4 className={`text-md font-bold ${textColor} mb-2`}>Resume</h4>
                  <a
                    href={selectedCandidate.student_details?.resumeUrl || selectedCandidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    Download Resume
                  </a>
                </div>
              )}

              {/* ── Status Actions inside Modal ── */}
              <div>
                <h4 className={`text-md font-bold ${textColor} mb-3`}>Update Application Status</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedCandidate, 'shortlisted')}
                    disabled={
                      !!statusUpdating[selectedCandidate.application_id || selectedCandidate.id] ||
                      selectedCandidate.status?.toLowerCase() === 'shortlisted'
                    }
                    className={`
                      flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
                      transition-all border
                      ${selectedCandidate.status?.toLowerCase() === 'shortlisted'
                        ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 cursor-default'
                        : 'bg-green-600 text-white border-green-600 hover:bg-green-700 cursor-pointer'
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  >
                    {statusUpdating[selectedCandidate.application_id || selectedCandidate.id] === 'shortlisted'
                      ? <Loader2 size={15} className="animate-spin" />
                      : <CheckCircle size={15} />
                    }
                    {selectedCandidate.status?.toLowerCase() === 'shortlisted' ? 'Shortlisted ✓' : 'Shortlist'}
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedCandidate, 'rejected')}
                    disabled={
                      !!statusUpdating[selectedCandidate.application_id || selectedCandidate.id] ||
                      selectedCandidate.status?.toLowerCase() === 'rejected'
                    }
                    className={`
                      flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
                      transition-all border
                      ${selectedCandidate.status?.toLowerCase() === 'rejected'
                        ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 cursor-default'
                        : 'bg-red-600 text-white border-red-600 hover:bg-red-700 cursor-pointer'
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  >
                    {statusUpdating[selectedCandidate.application_id || selectedCandidate.id] === 'rejected'
                      ? <Loader2 size={15} className="animate-spin" />
                      : <XCircle size={15} />
                    }
                    {selectedCandidate.status?.toLowerCase() === 'rejected' ? 'Rejected ✗' : 'Reject'}
                  </button>
                </div>
              </div>
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

export default AdminJobApplications;