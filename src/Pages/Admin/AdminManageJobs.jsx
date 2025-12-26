import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
import { adminService } from "../../services/adminService";
import { candidateExternalService } from "../../services/candidateExternalService";
import { Building2, Edit, Trash2, Search, RefreshCw, Eye, Users, Plus, MapPin, Calendar, Briefcase, Award } from "lucide-react";

const AdminJobs = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const jobsPerPage = 10;

  // Fetch jobs data
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const jobsData = await candidateExternalService.getAllJobs();
      const currentAdminId = user?.admin_id || user?.id || user?.user_id;
      const adminJobs = (jobsData?.jobs || [])
        .filter(job => job.admin_id === currentAdminId)
        .filter(job => job.posted_by?.toLowerCase() === 'admin')
        .filter(job => job.job_type !== 'GOVERNMENT')
        .filter(job => job.posted_by?.toUpperCase() !== 'RECRUITER')
        .filter(job => job.status !== 'closed');

      const jobsWithDefaultCounts = adminJobs.map(job => ({
        ...job,
        application_count: 0,
        applications: []
      }));

      const sortedJobs = jobsWithDefaultCounts.sort((a, b) => {
        const dateA = new Date(a.created_at || a.posted_date || 0);
        const dateB = new Date(b.created_at || b.posted_date || 0);
        return dateB - dateA;
      });

      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search and status
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, jobs]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'approved':
      case 'active':
      case 'open':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'pending':
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
      case 'rejected':
      case 'closed':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
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

  const handleEdit = (job) => {
    const jobIdentifier = job.job_id || job.id;
    console.log('Editing job:', job.job_title, 'with ID:', jobIdentifier);
    navigate(`/admin/edit-job/${jobIdentifier}`);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to close this job? This will remove it from public display.')) {
      try {
        await adminService.closeAdminJob(jobId);
        await fetchJobs();
        alert('Job closed successfully!');
      } catch (error) {
        console.error('Failed to close job:', error);
        alert('Failed to close job. Please try again.');
      }
    }
  };

  const handleViewApplications = (job) => {
    navigate(`/admin/job-applications/${job.job_id || job.id}`);
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor}`}>
        <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center max-w-7xl mx-auto mt-20`}>
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Briefcase className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading jobs...</h3>
          <p className={`${textSecondary} mt-2`}>Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Manage Jobs</h1>
              <p className={`text-sm ${textSecondary} mt-1`}>Create and manage job postings</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/admin/post-job')}
                className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm sm:text-base"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Post New Job</span>
                <span className="sm:hidden">Post</span>
              </button>
              <button
                onClick={() => {
                  setError("");
                  fetchJobs();
                }}
                className={`px-4 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2`}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className={textSecondary} />
                <span className={`text-sm font-semibold ${textColor}`}>{jobs.length}</span>
                <span className={`text-xs ${textSecondary}`}>Total</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {jobs.filter(j => j.status === 'approved').length}
                </span>
                <span className="text-xs text-green-600 dark:text-green-500">Approved</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                  {jobs.filter(j => j.status === 'pending').length}
                </span>
                <span className="text-xs text-yellow-600 dark:text-yellow-500">Pending</span>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by job title, company, or location..."
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
                All ({jobs.length})
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'approved'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Approved ({jobs.filter(j => j.status === 'approved').length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Pending ({jobs.filter(j => j.status === 'pending').length})
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'closed'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Closed ({jobs.filter(j => j.status === 'closed').length})
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Header */}
        <div className="mb-4">
          <p className={`text-sm ${textSecondary}`}>
            Showing <span className={`font-semibold ${textColor}`}>{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && !loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Building2 size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No jobs found</h3>
            <p className={`${textSecondary} mb-6`}>
              {statusFilter === 'all' && searchTerm === ''
                ? "Start by posting your first job opening."
                : "Try adjusting your filters or search query"}
            </p>
            <button
              onClick={() => {
                if (statusFilter !== 'all' || searchTerm !== '') {
                  setStatusFilter('all');
                  setSearchTerm('');
                } else {
                  navigate('/admin/post-job');
                }
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {statusFilter !== 'all' || searchTerm !== '' ? 'Clear Filters' : 'Post Your First Job'}
            </button>
          </div>
        )}

        {/* Job Listings - Compact Cards */}
        <div className="space-y-3">
          {currentJobs.map(job => (
            <div
              key={job.id || job.job_id}
              className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
            >
              <div className="p-3">
                {/* Job Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className={`text-base font-bold ${textColor} hover:text-blue-600 cursor-pointer leading-tight`}>
                        {job.job_title || 'N/A'}
                      </h3>
                      {job.is_premium && (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Award size={12} />
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Building2 size={13} className="flex-shrink-0" />
                        {job.company_name || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="flex-shrink-0" />
                        {job.location || 'N/A'}
                      </span>
                    </div>
                    <p className={`text-xs ${textSecondary} line-clamp-2`}>
                      {job.description ? `${job.description.substring(0, 150)}...` : 'N/A'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(job.status || 'approved')}`} style={{ fontSize: '0.7rem' }}>
                    {job.status || 'Approved'}
                  </span>
                </div>

                {/* Job Details */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    {job.employment_type || 'Full-time'}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    {job.work_mode || 'On-site'}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    💰 {job.salary_range && typeof job.salary_range === 'string'
                      ? job.salary_range
                      : job.salary_range && typeof job.salary_range === 'object'
                      ? `${job.salary_range.currency || 'INR'} ${job.salary_range.min || '0'} - ${job.salary_range.max || '0'}`
                      : 'N/A'}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                    <Calendar size={12} />
                    {formatDate(job.created_at || job.posted_date)}
                  </span>
                </div>

                {/* Stats Bar */}
                <div className={`flex items-center gap-4 p-2 rounded-lg mb-2.5 border ${borderColor} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-gray-500" />
                    <span className={`text-xs font-semibold ${textColor}`}>{job.application_count || 0}</span>
                    <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.65rem' }}>applications</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleViewApplications(job)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Eye size={13} />
                    View Applications ({job.application_count || 0})
                  </button>
                  <button
                    onClick={() => handleEdit(job)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Edit size={13} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(job.job_id || job.id)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Close</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
              }`}
            >
              Previous
            </button>
            <span className={`text-sm ${textColor}`}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;