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
          <div className="mb-8 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
            <h1 className={`text-4xl sm:text-5xl font-extrabold ${textColor} mb-3 flex items-center justify-start gap-4 tracking-tight`}>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Briefcase className="text-white" size={32} />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-700">
                Applied Jobs
              </span>
            </h1>
            <p className={`${textSecondary} text-lg font-medium max-w-2xl`}>
              Manage and track all your job applications in one place. You have applied to <span className="text-indigo-600 font-bold">{appliedJobs.length}</span> positions.
            </p>
          </div>

          {/* Stats Cards - Premium Version */}
          {appliedJobs.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className={`relative overflow-hidden ${cardBg} backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-[1.5rem] p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group shadow-sm`}>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 transform group-hover:rotate-6 transition-transform">
                    <Briefcase size={20} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black ${textSecondary} uppercase tracking-[0.2em] mb-0.5 opacity-70`}>Total Applied</p>
                    <p className={`text-2xl font-black ${textColor} tracking-tight`}>{appliedJobs.length}</p>
                  </div>
                </div>
              </div>

              <div className={`relative overflow-hidden ${cardBg} backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-[1.5rem] p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group shadow-sm`}>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 transform group-hover:rotate-6 transition-transform">
                    <Eye size={20} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black ${textSecondary} uppercase tracking-[0.2em] mb-0.5 opacity-70`}>Reviewing</p>
                    <p className={`text-2xl font-black ${textColor} tracking-tight`}>
                      {appliedJobs.filter(j => j.status.toLowerCase() === 'under review').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`relative overflow-hidden ${cardBg} backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-[1.5rem] p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group shadow-sm`}>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-600/10 rounded-full blur-xl group-hover:bg-indigo-600/20 transition-colors"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 transform group-hover:rotate-6 transition-transform">
                    <Star size={20} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black ${textSecondary} uppercase tracking-[0.2em] mb-0.5 opacity-70`}>Shortlisted</p>
                    <p className={`text-2xl font-black ${textColor} tracking-tight`}>
                      {appliedJobs.filter(j => j.status.toLowerCase() === 'shortlisted').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`relative overflow-hidden ${cardBg} backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-[1.5rem] p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group shadow-sm`}>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0 transform group-hover:rotate-6 transition-transform">
                    <PartyPopper size={20} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black ${textSecondary} uppercase tracking-[0.2em] mb-0.5 opacity-70`}>Offers</p>
                    <p className={`text-2xl font-black ${textColor} tracking-tight`}>
                      {appliedJobs.filter(j => j.status.toLowerCase() === 'offer received').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {appliedJobs.length > 0 && (
            <div className={`${cardBg} border ${borderColor} shadow-sm rounded-2xl p-5 mb-8 overflow-hidden relative`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary} group-focus-within:text-indigo-500 transition-colors`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by job title, company, or location..."
                    className={`w-full pl-12 pr-4 py-3.5 border-2 ${borderColor} rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-base ${cardBg} ${textColor} outline-none shadow-inner`}
                  />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`text-sm font-bold ${textSecondary} mr-2 hidden sm:inline`}>Filter by Status:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                        statusFilter === 'all'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900'
                          : `${cardBg} ${textColor} border ${borderColor} hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400`
                      }`}
                    >
                      All
                    </button>
                    {uniqueStatuses.map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                          statusFilter === status
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900'
                            : `${cardBg} ${textColor} border ${borderColor} hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400`
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map(job => (
                <div
                  key={job.id}
                  className={`${cardBg} backdrop-blur-md border-2 ${borderColor} rounded-[2rem] p-5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-indigo-500/50 group relative flex flex-col overflow-hidden shadow-sm`}
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-10 -mt-10 group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/5 rounded-tr-full -ml-8 -mb-8"></div>
                  
                  {/* Header: Title & Company */}
                  <div className="flex justify-between items-start gap-4 mb-2 relative">
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-extrabold ${textColor} leading-tight truncate group-hover:text-indigo-600 transition-colors duration-300`} title={job.title}>
                          {job.title}
                        </h3>
                        {job.is_premium && (
                          <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-1.5 py-0.5 rounded-full text-[8px] font-black tracking-widest shadow-md uppercase shrink-0 flex items-center gap-0.5">
                            <Crown size={8} /> PRO
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] font-bold flex items-center gap-1.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        <Building size={12} className="opacity-70" />
                        {job.company}
                      </div>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 relative">
                    {job.location && (
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border ${isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-gray-50 border-gray-100'} ${textSecondary}`}>
                        <MapPin size={12} className="text-indigo-500" />
                        <span className="truncate max-w-[100px]">{job.location}</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border ${isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-gray-50 border-gray-100'} ${textSecondary}`}>
                      <DollarSign size={12} className="text-emerald-500" />
                      <span className="truncate">{job.salary}</span>
                    </div>
                  </div>

                  {job.interviewDate && (
                    <div className={`mb-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black border ${isDark ? 'bg-blue-500/5 text-blue-400 border-blue-500/10' : 'bg-blue-50/50 text-blue-700 border-blue-100/50'} relative overflow-hidden`}>
                      <Calendar size={12} />
                      <span className="truncate uppercase">INTVR: {job.interviewDate}</span>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className={`mt-auto pt-3 border-t border-dashed ${isDark ? 'border-gray-700/50' : 'border-gray-100'} flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-bold ${textColor} flex items-center gap-1.5`}>
                          <Clock size={12} className="text-indigo-500" /> {getRelativeTime(job.appliedDateTime)}
                        </span>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                        job.status.toLowerCase() === 'under review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20' :
                        job.status.toLowerCase() === 'shortlisted' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20' :
                        job.status.toLowerCase() === 'interview scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' :
                        job.status.toLowerCase() === 'offer received' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                        job.status.toLowerCase() === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:border-red-500/20' :
                        'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:border-gray-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          job.status.toLowerCase() === 'under review' ? 'bg-yellow-500' :
                          job.status.toLowerCase() === 'shortlisted' ? 'bg-indigo-500' :
                          job.status.toLowerCase() === 'interview scheduled' ? 'bg-blue-500' :
                          job.status.toLowerCase() === 'offer received' ? 'bg-emerald-500' :
                          job.status.toLowerCase() === 'rejected' ? 'bg-red-500' :
                          'bg-gray-500'
                        } animate-pulse`}></div>
                        {job.status}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleJobClick(job)}
                      className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn active:scale-[0.98]"
                    >
                      <ExternalLink size={12} />
                      View Application
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
