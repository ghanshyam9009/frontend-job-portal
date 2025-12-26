import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import { adminService } from "../../services/adminService";
import {
  ArrowLeft,
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Star,
  Building,
  Clock,
  Users
} from "lucide-react";

const AdminEmployerJobs = () => {
  const { employerId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employerInfo, setEmployerInfo] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    job_title: "",
    location: "",
    employment_type: "Full-Time",
    work_mode: "On-site",
    salary_range: { min: "", max: "", currency: "INR" },
    experience_required: { min_years: "", max_years: "" },
    skills_required: [],
    description: "",
    responsibilities: "",
    qualifications: "",
    application_deadline: "",
    contact_email: "",
    job_status: "open",
  });
  const [newSkill, setNewSkill] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  
  const jobsPerPage = 10;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  // Fetch jobs data
  useEffect(() => {
    const fetchJobsData = async () => {
      if (!employerId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch employer info
        const employerResponse = await recruiterExternalService.getRecruiterCompanyName(employerId);
        setEmployerInfo(employerResponse);

        // Fetch jobs posted by this employer
        const jobsResponse = await recruiterExternalService.getAllPostedJobs(employerId);
        const jobsArray = jobsResponse?.jobs || [];
        
        // Sort by created date (latest first)
        const sortedJobs = jobsArray.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });

        setJobs(sortedJobs);
        setFilteredJobs(sortedJobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setError('Failed to load jobs. Please try again.');
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsData();
  }, [employerId]);

  // Filter jobs based on search and status
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.employment_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(job => job.job_status === statusFilter);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, jobs]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30';
      case 'closed':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30';
    }
  };

  const handleViewJob = (job) => {
    setViewingJob(job);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setEditFormData({
      job_title: job.job_title || "",
      location: job.location || "",
      employment_type: job.employment_type || "Full-Time",
      work_mode: job.work_mode || "On-site",
      salary_range: {
        min: job.salary_range?.min || "",
        max: job.salary_range?.max || "",
        currency: job.salary_range?.currency || "INR"
      },
      experience_required: {
        min_years: job.experience_required?.min_years || "",
        max_years: job.experience_required?.max_years || ""
      },
      skills_required: job.skills_required || [],
      description: job.description || "",
      responsibilities: Array.isArray(job.responsibilities) 
        ? job.responsibilities.join("\n") 
        : job.responsibilities || "",
      qualifications: Array.isArray(job.qualifications) 
        ? job.qualifications.join("\n") 
        : job.qualifications || "",
      application_deadline: job.application_deadline || "",
      contact_email: job.contact_email || "",
      job_status: job.job_status || "open",
    });
  };

  const handleInputChange = (field, value) => {
    const keys = field.split(".");
    if (keys.length > 1) {
      setEditFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editFormData.skills_required.includes(newSkill.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        skills_required: [...prev.skills_required, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setEditFormData((prev) => ({
      ...prev,
      skills_required: prev.skills_required.filter((s) => s !== skill),
    }));
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('save');

      const jobPayload = {
        ...editFormData,
        responsibilities: editFormData.responsibilities.split("\n").filter(r => r.trim()),
        qualifications: editFormData.qualifications.split("\n").filter(q => q.trim()),
      };

      await recruiterExternalService.updateJob(editingJob.job_id, jobPayload);
      
      // Refresh jobs list
      const jobsResponse = await recruiterExternalService.getAllPostedJobs(employerId);
      const jobsArray = jobsResponse?.jobs || [];
      const sortedJobs = jobsArray.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });
      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs);

      setEditingJob(null);
      setMessage({ type: 'success', text: 'Job updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to update job:', error);
      setMessage({ type: 'error', text: 'Failed to update job. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveJob = async (job) => {
    if (!job.job_id) return;

    try {
      setActionLoading(`approve-${job.job_id}`);
      
      // Call approve API - this might need task_id instead of job_id depending on your backend
      // If you have a task system, you'll need to get the task_id first
      await adminService.approveJob(job.job_id);

      setMessage({ type: 'success', text: 'Job approved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

      // Refresh jobs
      const jobsResponse = await recruiterExternalService.getAllPostedJobs(employerId);
      const jobsArray = jobsResponse?.jobs || [];
      const sortedJobs = jobsArray.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });
      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs);
    } catch (error) {
      console.error('Failed to approve job:', error);
      setMessage({ type: 'error', text: 'Failed to approve job. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPremium = async (job, isPremium = true) => {
    if (!job.job_id) return;

    try {
      setActionLoading(`premium-${job.job_id}`);
      await adminService.markJobPremium(job.job_id, isPremium, 'job');

      setMessage({ 
        type: 'success', 
        text: `Job successfully marked as ${isPremium ? 'premium' : 'non-premium'}!` 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

      // Update local state
      setJobs(prevJobs => prevJobs.map(j => 
        j.job_id === job.job_id ? { ...j, premium_job: isPremium, is_premium: isPremium } : j
      ));
      setFilteredJobs(prevJobs => prevJobs.map(j => 
        j.job_id === job.job_id ? { ...j, premium_job: isPremium, is_premium: isPremium } : j
      ));
    } catch (error) {
      console.error('Failed to mark job as premium:', error);
      setMessage({ type: 'error', text: 'Failed to update premium status. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const openCount = jobs.filter(j => j.job_status === 'open').length;
  const closedCount = jobs.filter(j => j.job_status === 'closed').length;
  const premiumCount = jobs.filter(j => j.premium_job || j.is_premium).length;

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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/admin/employers')}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <ArrowLeft size={20} className={textColor} />
            </button>
            <div className="flex-1">
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                Jobs Posted by {employerInfo?.company_name || 'Employer'}
              </h1>
              <p className={`text-sm ${textSecondary} mt-1`}>
                Manage and approve job postings
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4">
            <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className={textSecondary} />
                <span className={`text-sm font-semibold ${textColor}`}>{jobs.length}</span>
                <span className={`text-xs ${textSecondary}`}>Total Jobs</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {openCount}
                </span>
                <span className="text-xs text-green-600 dark:text-green-500">Open</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {closedCount}
                </span>
                <span className="text-xs text-red-600 dark:text-red-500">Closed</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-yellow-600 dark:text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                  {premiumCount}
                </span>
                <span className="text-xs text-yellow-600 dark:text-yellow-500">Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 rounded-lg p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

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
                  placeholder="Search by job title, location..."
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
                onClick={() => setStatusFilter('open')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'open'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Open ({openCount})
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'closed'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                    : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                }`}
              >
                Closed ({closedCount})
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

        {/* Empty State */}
        {filteredJobs.length === 0 && !loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Briefcase size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No jobs found</h3>
            <p className={`${textSecondary} mb-6`}>
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your filters" 
                : "This employer hasn't posted any jobs yet"}
            </p>
          </div>
        )}

        {/* Jobs - Compact Cards */}
        <div className="space-y-3">
          {currentJobs.map(job => (
            <div
              key={job.job_id}
              className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all relative`}
            >
              {/* Premium Badge */}
              {(job.premium_job || job.is_premium) && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  Premium
                </div>
              )}

              <div className="p-3">
                {/* Job Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold ${textColor} leading-tight mb-1.5`}>
                      {job.job_title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building size={13} className="flex-shrink-0" />
                        {employerInfo?.company_name || 'Company'}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="flex-shrink-0" />
                          {job.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(job.job_status)}`} style={{ fontSize: '0.7rem' }}>
                    {job.job_status?.toUpperCase()}
                  </span>
                </div>

                {/* Job Details */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {job.salary_range?.min && job.salary_range?.max && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                      💰 {job.salary_range.currency} {job.salary_range.min} - {job.salary_range.max}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    {job.employment_type}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    {job.work_mode}
                  </span>
                  {job.experience_required?.min_years !== undefined && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                      {job.experience_required.min_years}-{job.experience_required.max_years || job.experience_required.min_years} years
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                    <Calendar size={12} />
                    Posted: {formatDate(job.created_at)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleViewJob(job)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Eye size={13} />
                    View
                  </button>
                  <button
                    onClick={() => handleEditJob(job)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Edit size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleMarkPremium(job, !(job.premium_job || job.is_premium))}
                    disabled={actionLoading === `premium-${job.job_id}`}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Star size={13} />
                    {actionLoading === `premium-${job.job_id}` 
                      ? 'Updating...' 
                      : (job.premium_job || job.is_premium) 
                        ? 'Remove Premium' 
                        : 'Mark Premium'
                    }
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

      {/* View Job Modal */}
      {viewingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}>
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
              <h2 className={`text-xl font-semibold ${textColor}`}>Job Details</h2>
              <button
                onClick={() => setViewingJob(null)}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <XCircle size={20} className={textColor} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Job Header */}
                <div>
                  <h3 className={`text-2xl font-bold ${textColor} mb-2`}>{viewingJob.job_title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(viewingJob.job_status)}`}>
                      {viewingJob.job_status?.toUpperCase()}
                    </span>
                    {(viewingJob.premium_job || viewingJob.is_premium) && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Star size={12} fill="currentColor" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">Company</p>
                    <p className={`${textColor} font-medium mt-1`}>{employerInfo?.company_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">Location</p>
                    <p className={`${textColor} font-medium mt-1`}>{viewingJob.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">Employment Type</p>
                    <p className={`${textColor} font-medium mt-1`}>{viewingJob.employment_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">Work Mode</p>
                    <p className={`${textColor} font-medium mt-1`}>{viewingJob.work_mode || 'N/A'}</p>
                  </div>
                  {viewingJob.salary_range && (
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400">Salary Range</p>
                      <p className={`${textColor} font-medium mt-1`}>
                        {viewingJob.salary_range.currency} {viewingJob.salary_range.min} - {viewingJob.salary_range.max}
                      </p>
                    </div>
                  )}
                  {viewingJob.experience_required && (
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400">Experience Required</p>
                      <p className={`${textColor} font-medium mt-1`}>
                        {viewingJob.experience_required.min_years}-{viewingJob.experience_required.max_years || viewingJob.experience_required.min_years} years
                      </p>
                    </div>
                  )}
                  {viewingJob.application_deadline && (
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400">Application Deadline</p>
                      <p className={`${textColor} font-medium mt-1`}>{formatDate(viewingJob.application_deadline)}</p>
                    </div>
                  )}
                  {viewingJob.contact_email && (
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400">Contact Email</p>
                      <p className={`${textColor} font-medium mt-1`}>{viewingJob.contact_email}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {viewingJob.description && (
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-2">Description</p>
                    <p className={`${textColor} text-sm leading-relaxed`}>{viewingJob.description}</p>
                  </div>
                )}

                {/* Responsibilities */}
                {viewingJob.responsibilities && (
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-2">Responsibilities</p>
                    {Array.isArray(viewingJob.responsibilities) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {viewingJob.responsibilities.map((resp, idx) => (
                          <li key={idx} className={`${textColor} text-sm`}>{resp}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`${textColor} text-sm whitespace-pre-line`}>{viewingJob.responsibilities}</p>
                    )}
                  </div>
                )}

                {/* Qualifications */}
                {viewingJob.qualifications && (
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-2">Qualifications</p>
                    {Array.isArray(viewingJob.qualifications) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {viewingJob.qualifications.map((qual, idx) => (
                          <li key={idx} className={`${textColor} text-sm`}>{qual}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`${textColor} text-sm whitespace-pre-line`}>{viewingJob.qualifications}</p>
                    )}
                  </div>
                )}

                {/* Skills */}
                {viewingJob.skills_required && viewingJob.skills_required.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {viewingJob.skills_required.map((skill, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`flex justify-end p-6 border-t ${borderColor}`}>
              <button
                onClick={() => setViewingJob(null)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}>
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
              <h2 className={`text-xl font-semibold ${textColor}`}>Edit Job</h2>
              <button
                onClick={() => setEditingJob(null)}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <XCircle size={20} className={textColor} />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Job Title *</label>
                    <input
                      type="text"
                      value={editFormData.job_title}
                      onChange={(e) => handleInputChange('job_title', e.target.value)}
                      className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Location *</label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Employment Type *</label>
                    <select
                      value={editFormData.employment_type}
                      onChange={(e) => handleInputChange('employment_type', e.target.value)}
                      className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      required
                    >
                      <option value="Full-Time">Full-time</option>
                      <option value="Part-Time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Work Mode *</label>
                    <select
                      value={editFormData.work_mode}
                      onChange={(e) => handleInputChange('work_mode', e.target.value)}
                      className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      required
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Job Status</label>
                    <select
                      value={editFormData.job_status}
                      onChange={(e) => handleInputChange('job_status', e.target.value)}
                      className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Salary Range</label>
                  <div className="flex items-center gap-3">
                    <select
                      value={editFormData.salary_range.currency}
                      onChange={(e) => handleInputChange('salary_range.currency', e.target.value)}
                      className={`p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Min"
                      value={editFormData.salary_range.min}
                      onChange={(e) => handleInputChange('salary_range.min', e.target.value)}
                      className={`flex-1 p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    />
                    <span className={textColor}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={editFormData.salary_range.max}
                      onChange={(e) => handleInputChange('salary_range.max', e.target.value)}
                      className={`flex-1 p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    />
                  </div>
                </div>

                {/* Experience Required */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Experience Required (Years)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={editFormData.experience_required.min_years}
                      onChange={(e) => handleInputChange('experience_required.min_years', e.target.value)}
                      className={`flex-1 p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    />
                    <span className={textColor}>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={editFormData.experience_required.max_years}
                      onChange={(e) => handleInputChange('experience_required.max_years', e.target.value)}
                      className={`flex-1 p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Description *</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    required
                  />
                </div>

                {/* Responsibilities and Qualifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Responsibilities *</label>
                    <textarea
                      value={editFormData.responsibilities}
                      onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                      rows={4}
                      placeholder="One per line"
                      className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Qualifications *</label>
                    <textarea
                      value={editFormData.qualifications}
                      onChange={(e) => handleInputChange('qualifications', e.target.value)}
                      rows={4}
                      placeholder="One per line"
                      className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      required
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Required Skills</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                      className={`flex-1 p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editFormData.skills_required.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-100 text-blue-600 border border-blue-200'} flex items-center gap-2`}
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Application Deadline</label>
                    <input
                      type="date"
                      value={editFormData.application_deadline}
                      onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                      className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Contact Email</label>
                    <input
                      type="email"
                      value={editFormData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className={`flex justify-end gap-3 p-6 border-t ${borderColor}`}>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJob}
                disabled={actionLoading === 'save'}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === 'save' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployerJobs;