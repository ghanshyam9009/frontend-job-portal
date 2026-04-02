import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import { candidateExternalService, recruiterExternalService } from "../../services";
import { 
  Briefcase, 
  Eye, 
  Calendar, 
  PartyPopper, 
  X, 
  FileText, 
  Check,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  AlertCircle,
  Crown,
  Building,
  Search,
  Star
} from "lucide-react";
import toast from "react-hot-toast";

const AppliedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const userId = user?.user_id || user?.id || "";
    if (!userId) return;
    const fetchApplied = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await candidateExternalService.getAppliedJobs(userId);

        const jobsWithApps = await Promise.all(
          (data?.jobs || []).map(async (job) => {
            try {
              const applicantsData = await recruiterExternalService.getAllApplicants(job.job_id);
              const currentUserApplication = (applicantsData.applications || []).find(
                (app) => String(app.student_id) === String(userId) || String(app.student_id) === String(user?.id)
              );
              const isShortlisted = currentUserApplication?.shortlisted === true || currentUserApplication?.is_shortlisted === true || (currentUserApplication?.application_status || currentUserApplication?.status || "").toLowerCase() === "shortlisted";
              return {
                ...job,
                application_id: currentUserApplication?.application_id || "",
                application_status: currentUserApplication?.application_status || currentUserApplication?.status || "",
                is_shortlisted: isShortlisted,
              };
            } catch (error) {
              console.error(`Failed to fetch applicants for job ${job.job_id}`, error);
              return job;
            }
          })
        );

        const mapped = (jobsWithApps || []).map((a, idx) => {
          const displayStatus = a.is_shortlisted ? "Shortlisted" : (a.application_status || a.status || "Under Review");
          return {
            id: a.job_id || idx,
            title: a.job_title || "",
            company: a.company_name || "",
            salary:
              a.salary_range && a.salary_range.min && a.salary_range.max
                ? `₹${a.salary_range.min} - ₹${a.salary_range.max}`
                : "Salary not disclosed",
            location: a.location && a.location.toLowerCase() !== "n/a" ? a.location : "",
            type: a.employment_type || "",
            appliedDate: a.created_at ? a.created_at.split("T")[0] : "",
            appliedDateTime: a.created_at || "",
            status: typeof displayStatus === "string" ? displayStatus : "Under Review",
            applicationId: a.application_id || "",
            is_premium: a.premium_job || false,
          };
        });

        const sorted = mapped.sort((a, b) => {
          const dateA = new Date(a.appliedDateTime || 0);
          const dateB = new Date(b.appliedDateTime || 0);
          const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
          const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
          return timeB - timeA;
        });

        setAppliedJobs(sorted);
      } catch (e) {
        setError(typeof e === 'string' ? e : e?.message || 'Failed to load applied jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchApplied();
  }, [user]);

  const handleJobClick = (job) => {
    const jobId = job.id || job.job_id;
    navigate(`/job/${jobId}`, {
      state: { job }
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'under review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400';
      case 'shortlisted':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400';
      case 'interview scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400';
      case 'offer received':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'under review':
        return <Eye size={14} />;
      case 'shortlisted':
        return <Star size={14} />;
      case 'interview scheduled':
        return <Calendar size={14} />;
      case 'offer received':
        return <PartyPopper size={14} />;
      case 'rejected':
        return <X size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Filter jobs
  const filteredJobs = appliedJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for filter
  const uniqueStatuses = [...new Set(appliedJobs.map(job => job.status))];

  // Theme variables
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <CandidateNavbar darkMode={isDark} toggleDarkMode={toggleTheme} />
      
      {/* Add padding-top to account for fixed navbar height - increased to prevent overlap */}
      <main className="pt-32 px-4 sm:px-6 lg:px-8 pb-8">
        {/* Removed mx-auto to left-align content, kept max-width for readability */}
        <div className="max-w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${textColor} mb-2 flex items-center gap-3`}>
              <Briefcase className="text-indigo-500" size={32} />
              Applied Jobs
            </h1>
            <p className={`${textSecondary} text-lg`}>
              Track the status of your {appliedJobs.length} job application{appliedJobs.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Stats Cards */}
          {appliedJobs.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className={`${cardBg} border ${borderColor} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider mb-1`}>
                      Total Applied
                    </p>
                    <p className={`text-2xl font-bold ${textColor}`}>{appliedJobs.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <Briefcase size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>

              <div className={`${cardBg} border ${borderColor} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider mb-1`}>
                      Under Review
                    </p>
                    <p className={`text-2xl font-bold ${textColor}`}>
                      {appliedJobs.filter(j => j.status.toLowerCase() === 'under review').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Eye size={20} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className={`${cardBg} border ${borderColor} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider mb-1`}>
                      Shortlisted
                    </p>
                    <p className={`text-2xl font-bold ${textColor}`}>
                      {appliedJobs.filter(j => j.status.toLowerCase() === 'shortlisted').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Star size={20} className="text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>

              <div className={`${cardBg} border ${borderColor} rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider mb-1`}>
                      Offers
                    </p>
                    <p className={`text-2xl font-bold ${textColor}`}>
                      {appliedJobs.filter(j => j.status.toLowerCase() === 'offer received').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                    <PartyPopper size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {appliedJobs.length > 0 && (
            <div className={`${cardBg} border ${borderColor} rounded-lg p-4 mb-6 overflow-hidden`}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by job title, company..."
                    className={`w-full min-w-0 pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                    }`}
                  >
                    All
                  </button>
                  {uniqueStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        statusFilter === status
                          ? 'bg-indigo-600 text-white'
                          : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-indigo-500 mx-auto"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Briefcase className="text-indigo-500" size={24} />
                  </div>
                </div>
                <h3 className={`text-lg font-bold ${textColor}`}>Loading applications...</h3>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`${cardBg} border border-red-200 dark:border-red-800 rounded-lg p-8 text-center`}>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-500" size={32} />
              </div>
              <h3 className={`text-lg font-bold ${textColor} mb-2`}>Error Loading Jobs</h3>
              <p className={`${textSecondary}`}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && appliedJobs.length === 0 && (
            <div className={`${cardBg} border ${borderColor} rounded-lg p-12 text-center`}>
              <div className={`w-20 h-20 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <FileText size={40} className="text-indigo-500" />
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-2`}>No applications yet</h3>
              <p className={`${textSecondary} mb-6`}>
                Start applying to jobs to track your progress here.
              </p>
              <button 
                onClick={() => navigate('/userjoblistings')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <Search size={18} />
                Browse Jobs
              </button>
            </div>
          )}

          {/* Jobs Grid */}
          {!loading && !error && filteredJobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map(job => (
                <div
                  key={job.id}
                  className={`${cardBg} border ${borderColor} rounded-2xl p-4 sm:p-5 hover:shadow-xl transition-all hover:-translate-y-1 hover:border-[#2271B5]/50 group relative flex flex-col`}
                >
                  {/* Header: Title & Status */}
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-extrabold ${textColor} leading-tight truncate`} title={job.title}>
                          {job.title}
                        </h3>
                        {job.is_premium && (
                          <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide shadow-sm uppercase shrink-0">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className={`text-sm font-bold truncate ${isDark ? 'text-indigo-400' : 'text-[#2271B5]'}`}>
                        {job.company}
                      </div>
                    </div>
                    
                    {/* Status Badge at Top Right */}
                    <span className={`shrink-0 px-2 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 shadow-sm border ${
                      job.status.toLowerCase() === 'under review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-400' :
                      job.status.toLowerCase() === 'shortlisted' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400' :
                      job.status.toLowerCase() === 'interview scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400' :
                      job.status.toLowerCase() === 'offer received' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400' :
                      job.status.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400' :
                      'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:border-gray-500/30 dark:text-gray-400'
                    }`}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </span>
                  </div>

                  {/* Flex row for meta details */}
                  <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 text-[13px] font-semibold ${textSecondary}`}>
                    {job.location && (
                      <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700/50">
                        <MapPin size={13} className="opacity-70" />
                        <span className="truncate max-w-[120px]">{job.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700/50">
                      <DollarSign size={13} className="opacity-70" />
                      <span className="truncate">{job.salary}</span>
                    </div>
                  </div>

                  {job.interviewDate && (
                    <div className={`mt-auto mb-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                      <Calendar size={14} />
                      Interview: {job.interviewDate}
                    </div>
                  )}

                  <div className={`mt-auto flex items-center justify-between pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                     <div className="flex flex-col gap-0.5">
                       <span className={`text-[10px] uppercase font-bold tracking-wider ${textSecondary}`}>Applied Focus</span>
                       <span className={`text-xs font-bold ${textColor} flex items-center gap-1`}>
                         <Clock size={12} className="opacity-70" /> {getRelativeTime(job.appliedDateTime)}
                       </span>
                     </div>

                     <button 
                        onClick={() => handleJobClick(job)}
                        className="px-4 py-2 bg-gradient-to-r from-[#2271B5] to-[#1a5a8f] text-white rounded-lg hover:shadow-md hover:-translate-y-0.5 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink size={14} />
                        View Job
                      </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results from Filter */}
          {!loading && !error && appliedJobs.length > 0 && filteredJobs.length === 0 && (
            <div className={`${cardBg} border ${borderColor} rounded-lg p-12 text-center`}>
              <div className={`w-16 h-16 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Search size={32} className={textSecondary} />
              </div>
              <h3 className={`text-lg font-bold ${textColor} mb-2`}>No matching applications</h3>
              <p className={`${textSecondary}`}>
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default AppliedJobs;
