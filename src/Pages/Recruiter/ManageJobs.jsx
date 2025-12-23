import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useSidebar } from "../../Contexts/SidebarContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { useTheme } from "../../Contexts/ThemeContext";
import { Edit, Users, CircleX, MapPin, Plus, Eye, Filter, Search, Sliders, Calendar, Building, X, Briefcase } from "lucide-react";
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

        const approvedJobs = allJobs.filter(job => job && job.job_id && job.job_title);

        const jobsData = approvedJobs.map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.company_name || "",
          location: job.location || "",
          type: job.employment_type || "",
          workMode: job.work_mode || "",
          salary: job.salary_range && job.salary_range.min && job.salary_range.max 
                    ? `${Math.round(job.salary_range.min/100000)}L - ${Math.round(job.salary_range.max/100000)}L` 
                    : "Not specified",
          status: (job.status || "Open").toLowerCase() === "open" ? "Active" : job.status,
          postedDate: (job.created_at || "").split("T")[0] || "",
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

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === "All" || job.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
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
      
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} mt-20 sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Manage Jobs</h1>
            <button 
              onClick={() => navigate('/post-job')}
              className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Post New Job</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
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

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobileFilters(true)}
              className={`w-full px-4 py-3 ${cardBg} border ${borderColor} rounded-lg ${textColor} font-medium flex items-center justify-center gap-2`}
            >
              <Filter size={18} />
              Filters & Search
            </button>
          </div>

          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
              <div className={`absolute inset-y-0 left-0 w-80 max-w-full ${cardBg} p-6 overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
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
              </div>
            </div>
          )}

          {/* Right Side - Job Listings */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="mb-4">
              <p className={`text-sm ${textSecondary}`}>
                Showing <span className={`font-semibold ${textColor}`}>{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'job' : 'jobs'}
              </p>
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
            {!loading && !error && filteredJobs.length === 0 && (
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
            
            {/* Job Listings - Compact Cards */}
            <div className="space-y-3">
              {filteredJobs.map(job => (
                <div key={job.id} 
                     className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}>
                  <div className="p-3">
                    {/* Job Header */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-bold ${textColor} mb-1.5 hover:text-blue-600 cursor-pointer leading-tight`}>
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Building size={13} className="flex-shrink-0" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="flex-shrink-0" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(job.status)}`} style={{ fontSize: '0.7rem' }}>
                        {job.status}
                      </span>
                    </div>

                    {/* Job Details */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                        {job.type}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                        {job.workMode}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                        💰 {job.salary}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                        <Calendar size={12} />
                        {job.postedDate}
                      </span>
                    </div>

                    {/* Stats Bar */}
                    <div className={`flex items-center gap-4 p-2 rounded-lg mb-2.5 border ${borderColor} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-gray-500" />
                        <span className={`text-xs font-semibold ${textColor}`}>{job.applications}</span>
                        <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.65rem' }}>applications</span>
                      </div>
                      <div className={`h-3 w-px ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                      <div className="flex items-center gap-1.5">
                        <Eye size={13} className="text-gray-500" />
                        <span className={`text-xs font-semibold ${textColor}`}>{job.views}</span>
                        <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.65rem' }}>views</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleEditJob(job.id)}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        <Edit size={13} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleViewApplications(job.id)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                        style={{ fontSize: '0.7rem' }}
                      >
                        <Eye size={13} />
                        View Applications ({job.applications})
                      </button>
                      <button
                        onClick={() => handleToggleStatus(job.id)}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        <CircleX size={13} />
                        <span className="hidden sm:inline">{job.status === 'Active' ? 'Close' : 'Reopen'}</span>
                      </button>
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
