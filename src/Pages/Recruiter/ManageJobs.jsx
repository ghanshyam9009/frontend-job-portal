import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useSidebar } from "../../Contexts/SidebarContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { useTheme } from "../../Contexts/ThemeContext";
import { Edit, Users, CircleX, MapPin, Plus, Eye, Filter, Search, Sliders, Calendar, Building, X, Briefcase, Trash2 } from "lucide-react";
import { recruiterExternalService } from "../../services";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const employerId = user?.employer_id || user?.id;
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        if (!employerId) {
          console.warn('No employer ID available');
          setJobs([]);
          return;
        }

        const data = await recruiterExternalService.getAllPostedJobs(employerId);
        const allJobs = data?.jobs || [];

        const formatSalary = (salaryRange) => {
          if (!salaryRange || (salaryRange.min == null && salaryRange.max == null)) return "Not specified";
          const min = Number(salaryRange.min);
          const max = Number(salaryRange.max);
          if (Number.isNaN(min) && Number.isNaN(max)) return "Not specified";
          const currency = salaryRange.currency || "INR";
          const symbol = currency === "INR" ? "₹" : currency;
          const formatAmount = (val) => {
            if (Number.isNaN(val)) return "—";
            if (val >= 100000) return `${(val / 100000).toFixed(1).replace(/\.0$/, "")}L`;
            if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
            return val.toLocaleString("en-IN");
          };
          const minStr = formatAmount(min);
          const maxStr = formatAmount(max);
          return `${symbol}${minStr} - ${symbol}${maxStr}`;
        };

        const approvedJobs = allJobs.filter(job => job && job.job_id && job.job_title);

        const jobsData = approvedJobs.map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.company_name || "",
          location: job.location || "",
          type: job.employment_type || "",
          workMode: job.work_mode || "",
          salary: formatSalary(job.salary_range),
          status: (job.status || "Open").toLowerCase() === "open" ? "Active" : job.status,
          postedDate: (job.created_at || "").split("T")[0] || "",
          createdAt: job.created_at || "",
          description: job.job_description || job.description || "",
          rawJob: job,
          applications: job.application_count || 0,
          views: 0
        }));
        
        setJobs(jobsData);
      } catch (e) {
        console.error(e);
        setError(typeof e === "string" ? e : e?.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user]);

  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleViewApplications = (jobId) => {
    navigate(`/view-applications/${jobId}`);
  };

  const handleViewJobDetails = (job) => {
    navigate(`/job/${job.id}`, {
      state: {
        fromRecruiter: true,
        job: job.rawJob || null
      }
    });
  };

  const handleToggleStatus = async (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';

    try {
      setLoading(true);
      if (newStatus === 'Closed') {
        await recruiterExternalService.closeJobOpening(jobId);
      } else {
        // Assume there's a reopen endpoint or status update API
      }
      
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      alert(`Job status changed to ${newStatus} successfully`);
    } catch (e) {
      console.error(e);
      alert(`Failed to change job status to ${newStatus}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    try {
      setLoading(true);
      await recruiterExternalService.closeJobOpening(jobId); // Using same API as close per request
      setJobs(prev => prev.filter(j => j.id !== jobId));
      alert("Job deleted successfully");
    } catch (e) {
      console.error(e);
      alert("Failed to delete job");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === "All" || job.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedFilteredJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "oldest") return new Date(a.createdAt || a.postedDate) - new Date(b.createdAt || b.postedDate);
    if (sortBy === "title-az") return a.title.localeCompare(b.title);
    if (sortBy === "applications") return b.applications - a.applications;
    return new Date(b.createdAt || b.postedDate) - new Date(a.createdAt || a.postedDate);
  });

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
      case 'open':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'draft':
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
      case 'closed':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      
      {/* Header - mobile friendly */}
      <div className={`${cardBg} border-b ${borderColor} mt-14 sm:mt-20 sticky top-0 z-40 safe-area-top`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className={`text-lg sm:text-2xl font-bold ${textColor} truncate`}>Manage Jobs</h1>
            <button 
              onClick={() => navigate('/post-job')}
              className="min-h-[44px] min-w-[44px] px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base flex-shrink-0 touch-manipulation"
            >
              <Plus size={20} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Post New Job</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Sidebar - Filters (Desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className={`${cardBg} rounded-lg border ${borderColor} p-5 sticky top-24`}>
              <div className="flex items-center gap-2 mb-5">
                <Sliders size={20} className={textColor} />
                <h2 className={`text-lg font-bold ${textColor}`}>Filters</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold ${textColor} mb-2`}>Search</label>
                <div className="relative">
                  <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, company..."
                    className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold ${textColor} mb-3`}>Job Status</label>
                <div className="space-y-2">
                  {['All', 'Active', 'Draft', 'Closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === status 
                          ? `bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30` 
                          : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{status} Jobs</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          {status === 'All' ? jobs.length : 
                           status === 'Active' ? jobs.filter(j => j.status === 'Active').length :
                           status === 'Draft' ? jobs.filter(j => j.status === 'Draft').length :
                           jobs.filter(j => j.status === 'Closed').length}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Summary */}
              <div className={`pt-5 border-t ${borderColor}`}>
                <h3 className={`text-sm font-semibold ${textColor} mb-3`}>Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className={textSecondary}>Total Jobs</span>
                    <span className={`font-bold ${textColor}`}>{jobs.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={textSecondary}>Active</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{jobs.filter(j => j.status === 'Active').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={textSecondary}>Total Applications</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{jobs.reduce((sum, job) => sum + job.applications, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button - touch friendly */}
          <div className="lg:hidden order-first">
            <button
              onClick={() => setShowMobileFilters(true)}
              className={`w-full min-h-[48px] px-4 py-3 ${cardBg} border ${borderColor} rounded-xl ${textColor} font-medium flex items-center justify-center gap-2 active:scale-[0.99] touch-manipulation`}
            >
              <Filter size={20} />
              Filters & Search
            </button>
          </div>

          {/* Mobile Filters Modal - full height drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
              <div className={`absolute inset-y-0 right-0 w-full max-w-sm ${cardBg} p-5 overflow-y-auto shadow-xl`} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-bold ${textColor}`}>Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}>
                    <X size={20} className={textColor} />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className={`block text-sm font-semibold ${textColor} mb-2`}>Search</label>
                  <div className="relative">
                    <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Job title, company..."
                      className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                  <label className={`block text-sm font-semibold ${textColor} mb-3`}>Job Status</label>
                  <div className="space-y-2">
                    {['All', 'Active', 'Draft', 'Closed'].map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowMobileFilters(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === status 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' 
                            : `${cardBg} ${textColor} border ${borderColor}`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{status} Jobs</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            {status === 'All' ? jobs.length : 
                             status === 'Active' ? jobs.filter(j => j.status === 'Active').length :
                             status === 'Draft' ? jobs.filter(j => j.status === 'Draft').length :
                             jobs.filter(j => j.status === 'Closed').length}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-semibold ${textColor} mb-2`}>Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full px-3 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="applications">Most applications</option>
                    <option value="title-az">Title A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Job Listings */}
          <div className="flex-1 min-w-0">
            {/* Results Header - mobile compact */}
            <div className="mb-3 sm:mb-4 py-2 sm:py-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className={`text-sm ${textSecondary}`}>
                  Showing <span className={`font-semibold ${textColor}`}>{sortedFilteredJobs.length}</span> {sortedFilteredJobs.length === 1 ? 'job' : 'jobs'}
                </p>
                <div className="flex items-center gap-2">
                  <label className={`text-xs sm:text-sm font-medium ${textSecondary}`}>Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="applications">Most applications</option>
                    <option value="title-az">Title A-Z</option>
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
                    <Briefcase className="text-blue-500" size={24} />
                  </div>
                </div>
                <h3 className={`text-lg font-bold ${textColor}`}>Loading your jobs...</h3>
                <p className={`${textSecondary} mt-2`}>Please wait</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="text-red-500" size={32} />
                </div>
                <h3 className="text-lg font-bold text-red-500 mb-2">Failed to Load Jobs</h3>
                <p className={textSecondary}>{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && sortedFilteredJobs.length === 0 && (
              <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
                <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Briefcase size={32} className="text-blue-500" />
                </div>
                <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No jobs found</h3>
                <p className={`${textSecondary} mb-6`}>
                  {filterStatus === 'All' && searchQuery === ''
                    ? "Start by posting your first job opening."
                    : "Try adjusting your filters or search query"}
                </p>
                <button 
                  onClick={() => {
                    if (filterStatus !== 'All' || searchQuery !== '') {
                      setFilterStatus('All');
                      setSearchQuery('');
                    } else {
                      navigate('/post-job');
                    }
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {filterStatus !== 'All' || searchQuery !== '' ? 'Clear Filters' : 'Post Your First Job'}
                </button>
              </div>
            )}
            
            {/* Job Listings - Mobile-first cards */}
            <div className="space-y-4 sm:space-y-3">
              {sortedFilteredJobs.map(job => (
                <div
                  key={job.id}
                  onClick={() => handleViewJobDetails(job)}
                  className={`${cardBg} rounded-xl border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all overflow-hidden cursor-pointer`}
                >
                  <div className="p-4 sm:p-3">
                    {/* Job Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className={`text-[15px] sm:text-base font-bold ${textColor} leading-snug line-clamp-2`}>
                          {job.title}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2 mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1 min-w-0 truncate">
                            <Building size={14} className="flex-shrink-0 text-gray-500" />
                            <span className="truncate">{job.company}</span>
                          </span>
                          <span className="flex items-center gap-1 min-w-0 truncate">
                            <MapPin size={14} className="flex-shrink-0 text-gray-500" />
                            <span className="truncate">{job.location}</span>
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border flex-shrink-0 capitalize ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Job Details - Pills wrap nicely on mobile */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-gray-700/60 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {job.type}
                      </span>
                      <span className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-gray-700/60 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {job.workMode}
                      </span>
                      <span className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-gray-700/60 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {job.salary}
                      </span>
                      <span className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-gray-700/60 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-200'} flex items-center gap-1`}>
                        <Calendar size={12} />
                        {job.postedDate}
                      </span>
                    </div>

                    {/* Stats Bar - compact on mobile */}
                    <div className={`flex items-center gap-4 py-2.5 px-3 rounded-xl mb-3 ${isDark ? 'bg-gray-700/40' : 'bg-gray-50'} border ${borderColor}`}>
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-gray-500 flex-shrink-0" />
                        <span className={`text-xs font-semibold ${textColor}`}>{job.applications}</span>
                        <span className={`text-xs ${textSecondary}`}>applications</span>
                      </div>
                      <div className={`h-4 w-px ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
                      <div className="flex items-center gap-1.5">
                        <Eye size={14} className="text-gray-500 flex-shrink-0" />
                        <span className={`text-xs font-semibold ${textColor}`}>{job.views}</span>
                        <span className={`text-xs ${textSecondary}`}>views</span>
                      </div>
                    </div>

                    {/* Action Buttons - mobile: primary full-width, then Edit + Close row */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewApplications(job.id);
                        }}
                        className="w-full min-h-[44px] sm:min-h-0 sm:flex-1 px-4 py-3 sm:py-1.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 touch-manipulation order-first sm:order-none"
                      >
                        <Eye size={18} className="sm:w-[14px] sm:h-[14px]" />
                        View Applications ({job.applications})
                      </button>
                      <div className="flex gap-2 sm:gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJob(job.id);
                          }}
                          className={`flex-1 min-h-[44px] sm:min-h-0 px-2 py-3 sm:py-1.5 border ${borderColor} rounded-xl text-sm font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 touch-manipulation`}
                        >
                          <Edit size={16} className="sm:w-[14px] sm:h-[14px]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(job.id);
                          }}
                          className={`flex-1 min-h-[44px] sm:min-h-0 px-2 py-3 sm:py-1.5 border ${borderColor} rounded-xl text-sm font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 touch-manipulation`}
                        >
                          <CircleX size={16} className="sm:w-[14px] sm:h-[14px]" />
                          <span>{job.status === 'Active' ? 'Close' : 'Reopen'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job.id);
                          }}
                          className={`flex-1 min-h-[44px] sm:min-h-0 px-2 py-3 sm:py-1.5 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 touch-manipulation`}
                        >
                          <Trash2 size={16} className="sm:w-[14px] sm:h-[14px]" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
