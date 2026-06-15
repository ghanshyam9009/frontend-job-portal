import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import { useLocation } from "react-router-dom";
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
  CheckCircle,
  Loader2,
  Sparkles,
  User
} from "lucide-react";
import * as XLSX from 'xlsx';
import { enrichApplicationsList } from '../../utils/adminJobApplications';

const AdminJobReportApplications = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { theme } = useTheme();
  const location = useLocation();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); 
  const [statusUpdating, setStatusUpdating] = useState({});

  const applyJobDetailsFromState = () => {
    if (location.state?.jobTitle || location.state?.companyName) {
      setJobDetails({
        title: location.state.jobTitle || "Job",
        company: location.state.companyName || "",
        location: location.state.location || "",
        postedDate: location.state.postedDate || "",
      });
      return true;
    }
    return false;
  };

  useEffect(() => {
    applyJobDetailsFromState();
    fetchApplications(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const fetchApplications = async (forceRefresh = false) => {
    if (!jobId) {
      setError("Job ID is missing");
      setLoading(false);
      return;
    }

    const preloaded =
      !forceRefresh &&
      location.state?.applicationsPreloaded &&
      Array.isArray(location.state?.applications);

    if (preloaded) {
      try {
        setLoading(true);
        setError("");
        const enriched = enrichApplicationsList(location.state.applications);
        setApplications(enriched);
        if (!applyJobDetailsFromState() && enriched.length > 0) {
          setJobDetails({
            title: enriched[0].job_title || "Job",
            company: enriched[0].company_name || "",
            location: enriched[0].location || "",
            postedDate: enriched[0].created_at || "",
          });
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await recruiterExternalService.getAllApplicants(jobId);
      const applicationsList = data.applications || [];

      if (!location.state?.jobTitle && applicationsList.length > 0) {
        setJobDetails({
          title: applicationsList[0].job_title || "Job",
          company: applicationsList[0].company_name || "",
          location: applicationsList[0].location || "",
          postedDate: applicationsList[0].created_at || "",
        });
      }

      setApplications(enrichApplicationsList(applicationsList));
    } catch (e) {
      console.error(e);
      setError("Failed to load applications. Please try again later.");
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

  const handleShortlistApplication = async (application) => {
    const appId = application.application_id || application.id;
    if (!appId || statusUpdating[appId]) return;

    if ((application.status || "").toLowerCase() === "shortlisted") return;

    setStatusUpdating((prev) => ({ ...prev, [appId]: true }));

    try {
      await recruiterExternalService.changeApplicationStatus(appId, true);

      setApplications((prev) =>
        prev.map((app) =>
          (app.application_id || app.id) === appId
            ? { ...app, status: "shortlisted", needs_approval: false }
            : app
        )
      );

      setSelectedCandidate((prev) =>
        prev && (prev.application_id || prev.id) === appId
          ? { ...prev, status: "shortlisted", needs_approval: false }
          : prev
      );
    } catch (error) {
      console.error("Failed to shortlist application:", error);
      alert(error?.message || "Failed to shortlist application. Please try again.");
    } finally {
      setStatusUpdating((prev) => {
        const next = { ...prev };
        delete next[appId];
        return next;
      });
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

  const getApplicationStatusKey = (app) => {
    if (app.needs_approval) return "pending";
    return (app.status || "pending").toLowerCase();
  };

  const filteredApplications = applications.filter(app => {
    const actualStatus = getApplicationStatusKey(app);
    const matchesStatus = statusFilter === "all" || actualStatus === statusFilter.toLowerCase();

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
      return 'Pending';
    }
    const normalized = (status || 'pending').toLowerCase();
    if (normalized === 'shortlisted') return 'Shortlisted';
    return status || 'Pending';
  };

  const ShortlistButton = ({ application, className = "" }) => {
    const appId = application.application_id || application.id;
    const isShortlisted = getApplicationStatusKey(application) === "shortlisted";
    const isUpdating = Boolean(statusUpdating[appId]);

    return (
      <button
        type="button"
        onClick={() => handleShortlistApplication(application)}
        disabled={isUpdating || isShortlisted}
        title={isShortlisted ? "Already shortlisted" : "Shortlist candidate"}
        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
          isShortlisted
            ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30"
            : "bg-green-600 text-white border-green-600 hover:bg-green-700"
        } ${className}`}
        style={{ fontSize: "0.7rem" }}
      >
        {isUpdating ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <CheckCircle size={12} />
        )}
        {isShortlisted ? "Shortlisted" : "Shortlist"}
      </button>
    );
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
                onClick={() => navigate(-1)}
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
                Pending ({applications.filter(app => getApplicationStatusKey(app) === 'pending').length})
              </button>
              <button
                onClick={() => setStatusFilter('shortlisted')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'shortlisted'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Shortlisted ({applications.filter(app => getApplicationStatusKey(app) === 'shortlisted').length})
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
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`text-xs font-bold ${textColor} truncate leading-tight`}>
                          {application.student_details?.name || 'Unknown Candidate'}
                        </h4>
                        {/* Membership Badge Next to Name - Enhanced Visibility */}
                        <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase border shadow-sm flex items-center gap-1 transition-all flex-shrink-0 ${
                          (application.student_details?.premium_user === true || application.student_details?.premium_user === 'true') 
                            ? (application.student_details?.plan === 'premium' 
                                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-300 shadow-amber-200/50' 
                                : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-300 shadow-blue-200/50'
                              ) 
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {(application.student_details?.premium_user === true || application.student_details?.premium_user === 'true') ? <Sparkles size={10} className="text-white" /> : <User size={10} />}
                          {(application.student_details?.premium_user === true || application.student_details?.premium_user === 'true') ? (application.student_details?.plan === 'premium' ? 'Premium' : 'Basic') : 'Free'}
                        </div>
                      </div>
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

                  <ShortlistButton application={application} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Details Modal - Same as previous implementation */}
      {showCandidateModal && selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCandidateModal(false)}
        >
          <div
            className={`${cardBg} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`relative p-6 border-b ${borderColor} flex items-center justify-between bg-gradient-to-r ${isDark ? 'from-blue-900/20 to-purple-900/20' : 'from-blue-50 to-purple-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600`}>
                  {selectedCandidate.student_details?.logo ? (
                    <img 
                      src={selectedCandidate.student_details.logo} 
                      alt={selectedCandidate.student_details.name} 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    selectedCandidate.student_details?.name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className={`text-xl font-bold ${textColor}`}>
                      {selectedCandidate.student_details?.name || 'Unknown Candidate'}
                    </h2>
                    {/* Membership Badge Next to Name in Modal - Enhanced Visibility */}
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-md flex items-center gap-1.5 transition-all flex-shrink-0 ${
                      (selectedCandidate.student_details?.premium_user === true || selectedCandidate.student_details?.premium_user === 'true') 
                        ? (selectedCandidate.student_details?.plan === 'premium' 
                            ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-300 shadow-amber-200/50' 
                            : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-300 shadow-blue-200/50'
                          ) 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {(selectedCandidate.student_details?.premium_user === true || selectedCandidate.student_details?.premium_user === 'true') ? <Sparkles size={11} className="text-white" /> : <User size={11} />}
                      {(selectedCandidate.student_details?.premium_user === true || selectedCandidate.student_details?.premium_user === 'true') ? (selectedCandidate.student_details?.plan === 'premium' ? 'Premium' : 'Basic') : 'Free'}
                    </div>
                  </div>
                  <p className={`text-sm ${textSecondary} flex items-center gap-1.5`}>
                    <Mail size={14} className="text-blue-500" />
                    {selectedCandidate.student_details?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCandidateModal(false)}
                className={`p-2 rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-md transition-all group`}
              >
                <X size={20} className={`${textSecondary} group-hover:text-red-500`} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Contact Information Section */}
              <section>
                <h3 className={`text-xs font-bold uppercase tracking-wider text-blue-500 mb-4`}>Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-xl border ${borderColor} ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <label className={`text-[10px] font-bold uppercase tracking-wide ${textSecondary} mb-1 block`}>Phone Number</label>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-blue-500" />
                      <p className={`text-sm font-medium ${textColor}`}>{selectedCandidate.student_details?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${borderColor} ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <label className={`text-[10px] font-bold uppercase tracking-wide ${textSecondary} mb-1 block`}>Location</label>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-red-500" />
                      <p className={`text-sm font-medium ${textColor}`}>{selectedCandidate.student_details?.location || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${borderColor} ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <label className={`text-[10px] font-bold uppercase tracking-wide ${textSecondary} mb-1 block`}>Experience Level</label>
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-indigo-500" />
                      <p className={`text-sm font-medium ${textColor}`}>{selectedCandidate.student_details?.experience || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl border ${borderColor} ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <label className={`text-[10px] font-bold uppercase tracking-wide ${textSecondary} mb-1 block`}>Applied Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-purple-500" />
                      <p className={`text-sm font-medium ${textColor}`}>{formatDate(selectedCandidate.created_at || selectedCandidate.applied_date)}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Professional Profile Section */}
              <div className="grid grid-cols-1 gap-6">
                {/* Status Section */}
                <div className={`p-4 rounded-xl border ${borderColor} ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} flex items-center justify-between`}>
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wide ${textSecondary} mb-0.5 block`}>Application Status</label>
                    <p className={`text-sm font-bold ${textColor}`}>Current progression of this application</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(selectedCandidate.status, selectedCandidate.needs_approval)}`}>
                    {getStatusLabel(selectedCandidate.status, selectedCandidate.needs_approval)}
                  </span>
                </div>

                {/* Skills Section */}
                {selectedCandidate.student_details?.skills && selectedCandidate.student_details.skills.length > 0 && (
                  <section>
                    <h3 className={`text-xs font-bold uppercase tracking-wider text-green-500 mb-3 flex items-center gap-2`}>
                      Professional Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.student_details.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1.5 ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'} border rounded-lg text-xs font-bold tracking-tight shadow-sm`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Cover Letter Section */}
                {selectedCandidate.cover_letter && (
                  <section>
                    <h3 className={`text-xs font-bold uppercase tracking-wider text-amber-500 mb-3`}>Candidate Statement</h3>
                    <div className={`${isDark ? 'bg-gray-800/80' : 'bg-white'} rounded-xl p-5 border ${borderColor} shadow-inner relative overflow-hidden`}>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                      <p className={`text-sm ${textSecondary} leading-relaxed whitespace-pre-wrap italic`}>
                        "{selectedCandidate.cover_letter}"
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-6 border-t ${borderColor} bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-3 items-center justify-between`}>
              <div className="flex flex-wrap items-center gap-3">
                {selectedCandidate.student_details?.resumeUrl ? (
                  <a
                    href={selectedCandidate.student_details.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 font-bold text-sm"
                  >
                    <Download size={18} />
                    Download Resume
                  </a>
                ) : (
                  <p className={`text-xs ${textSecondary} italic`}>No resume provided</p>
                )}
                <ShortlistButton application={selectedCandidate} className="!px-4 !py-2.5 !text-sm" />
              </div>

              <button
                onClick={() => setShowCandidateModal(false)}
                className={`w-full sm:w-auto px-8 py-2.5 rounded-xl border ${borderColor} ${textColor} font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobReportApplications;
