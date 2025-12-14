import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { candidateExternalService } from "../../services/candidateExternalService";
import {
  Check,
  AlertTriangle,
  Building,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Users,
  Award,
  X,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Building2
} from "lucide-react";

const AdminPostJob = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const jobsPerPage = 10;

  const [jobData, setJobData] = useState({
    job_title: "",
    company_name: "",
    location: "",
    employment_type: "Full-Time",
    work_mode: "On-site",
    salary_range: {
      min: "",
      max: "",
      currency: "INR",
    },
    experience_required: {
      min_years: "",
      max_years: "",
    },
    skills_required: [],
    description: "",
    responsibilities: "",
    qualifications: "",
    application_deadline: "",
    contact_email: "",
    job_status: "open",
    is_premium: false,
  });

  const [newSkill, setNewSkill] = useState("");

  const handleInputChange = (field, value) => {
    const keys = field.split(".");
    if (keys.length > 1) {
      setJobData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setJobData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !jobData.skills_required.includes(newSkill.trim())) {
      setJobData((prev) => ({
        ...prev,
        skills_required: [...prev.skills_required, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setJobData((prev) => ({
      ...prev,
      skills_required: prev.skills_required.filter((s) => s !== skill),
    }));
  };

  // Fetch jobs data
  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      setError("");

      // Get all jobs from the API and filter for current admin's posted jobs only
      const jobsData = await candidateExternalService.getAllJobs();
      const currentAdminId = user?.admin_id || user?.id || user?.user_id;
      const adminJobs = (jobsData?.jobs || [])
        .filter(job => job.admin_id === currentAdminId)
        .filter(job => job.posted_by?.toLowerCase() === 'admin') // Only show jobs posted by admin
        .filter(job => job.job_type !== 'GOVERNMENT') // Don't show government jobs
        .filter(job => job.posted_by?.toUpperCase() !== 'RECRUITER') // Don't show recruiter jobs
        .filter(job => job.status !== 'closed'); // Filter out closed jobs from display

      // Sort jobs by posted date (latest first)
      const sortedJobs = adminJobs.sort((a, b) => {
        const dateA = new Date(a.created_at || a.posted_date || 0);
        const dateB = new Date(b.created_at || b.posted_date || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      console.log(`Admin posted jobs loaded. Found ${sortedJobs.length} jobs.`);

      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setError('Failed to fetch jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, jobs]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setJobData({
      job_title: job.job_title || "",
      company_name: job.company_name || "",
      description: job.description || "",
      location: job.location || "",
      salary_range: {
        min: "",
        max: "",
        currency: "INR",
      },
      employment_type: job.employment_type || "Full-Time",
      experience_required: {
        min_years: "",
        max_years: "",
      },
      skills_required: Array.isArray(job.skills_required)
        ? job.skills_required
        : (job.skills_required ? job.skills_required.split(", ") : []),
      responsibilities: "",
      qualifications: "",
      application_deadline: job.application_deadline || "",
      contact_email: job.contact_email || "",
      is_premium: job.is_premium || false,
    });
    setShowAddModal(true);
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

  const resetForm = () => {
    setJobData({
      job_title: "",
      company_name: "",
      location: "",
      employment_type: "Full-Time",
      work_mode: "On-site",
      salary_range: {
        min: "",
        max: "",
        currency: "INR",
      },
      experience_required: {
        min_years: "",
        max_years: "",
      },
      skills_required: [],
      description: "",
      responsibilities: "",
      qualifications: "",
      application_deadline: "",
      contact_email: "",
      job_status: "open",
      is_premium: false,
    });
    setNewSkill("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const jobPayload = {
        job_title: jobData.job_title,
        company_name: jobData.company_name || null,
        description: jobData.description,
        location: jobData.location,
        employment_type: jobData.employment_type,
        salary_range: jobData.salary_range,
        experience_required: jobData.experience_required,
        skills_required: jobData.skills_required,
        responsibilities: jobData.responsibilities.split("\n"),
        qualifications: jobData.qualifications.split("\n"),
        contact_email: jobData.contact_email || null,
        status: "Open", // Admin jobs are visible and open
        is_premium: jobData.is_premium,
        posted_by: "admin",
        to_show_user: true // Make admin jobs visible to candidates
      };

      let jobResult;

      if (editingJob) {
        // Update existing job
        jobResult = await adminService.updateAdminJob(editingJob.job_id || editingJob.id, jobPayload);
        alert('Job updated successfully!');
      } else {
        // Create new job
        jobResult = await adminService.postJobByAdmin(jobPayload);
        alert(`Job posted successfully! Job ID: ${jobResult.job_id || 'Generated'}`);
      }

      // Mark job as premium if checkbox was checked
      if (jobData.is_premium) {
        try {
          const jobId = editingJob ? (editingJob.job_id || editingJob.id) : jobResult.job_id;
          await adminService.markJobPremium(jobId, true, 'job');
          console.log('Job marked as premium successfully');
        } catch (premiumError) {
          console.error('Failed to mark job as premium:', premiumError);
          alert('Job posted successfully, but failed to mark as premium. You can try again later.');
        }
      }

      // Refresh jobs data and close modal
      await fetchJobs();
      setShowAddModal(false);
      setEditingJob(null);
      resetForm();

    } catch (error) {
      console.error('Failed to save job:', error);
      setError(error.message || 'Failed to save job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Briefcase className="text-blue-500" size={24} />
            </div>
            <h1 className={`text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Post Job as Admin</h1>
          </div>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Create and publish jobs directly to candidates</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded-md text-sm mb-6">
            Job posted successfully! It will be visible to candidates immediately.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        {/* Jobs List Section */}
        <div className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Posted Private Jobs</h2>
            <div className="flex gap-3">
              <button
                className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-md transition-colors text-sm font-medium`}
                onClick={() => {
                  setError("");
                  fetchJobs();
                }}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors text-sm font-medium"
                onClick={() => {
                  setEditingJob(null);
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                <Plus size={16} />
                Post New Job
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
              />
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
            </div>
          </div>

        {jobsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2271B5]"></div>
            <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading jobs...</p>
          </div>
        ) : (
          <>
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <div key={job.id || job.job_id} className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:shadow-md'} transition-all duration-200`}>
                    <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} line-clamp-2`}>{job.job_title || 'N/A'}</h3>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleEdit(job)}
                            className={`p-1.5 rounded-md ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'} transition-colors`}
                            title="Edit Job"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(job.job_id || job.id)}
                            className={`p-1.5 rounded-md ${theme === 'dark' ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'} transition-colors`}
                            title="Close Job"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} min-w-fit`}>Company:</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{job.company_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} size={14} />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{job.location || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} size={14} />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{job.employment_type || 'Full-Time'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} size={14} />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {job.salary_range && typeof job.salary_range === 'object'
                            ? `${job.salary_range.currency || 'INR'} ${job.salary_range.min || '0'} - ${job.salary_range.max || '0'}`
                            : job.salary_range || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} size={14} />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {job.experience_required && typeof job.experience_required === 'object'
                            ? `${job.experience_required.min_years || '0'} - ${job.experience_required.max_years || '0'} years`
                            : 'Experience not specified'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} min-w-fit`}>Deadline:</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{job.application_deadline ? formatDate(job.application_deadline) : 'No deadline'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} min-w-fit`}>Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : job.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {job.status === 'approved' ? 'Approved' : job.status === 'pending' ? 'Pending' : 'Rejected'}
                        </span>
                      </div>
                    </div>

                    {job.description && (
                      <div className={`px-4 pb-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                        {job.description.length > 100 ? `${job.description.substring(0, 100)}...` : job.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className={`mx-auto h-12 w-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                <h3 className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No private jobs found</h3>
                <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>You haven't posted any private jobs yet. Click "Post New Job" to get started.</p>
              </div>
            )}
          </>
        )}
        </div>

        {/* Add/Edit Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{editingJob ? 'Edit Job Posting' : 'Post New Job'}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingJob(null);
                  resetForm();
                }}
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} size={20} />
                  <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobData.job_title}
                      onChange={(e) => handleInputChange("job_title", e.target.value)}
                      placeholder="e.g., Senior Frontend Developer"
                      required
                      className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      placeholder="Your company name"
                      required
                      className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} size={16} />
                      <input
                        type="text"
                        value={jobData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Mumbai, India or Remote"
                        required
                        className={`w-full pl-10 pr-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Employment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobData.employment_type}
                      onChange={(e) => handleInputChange("employment_type", e.target.value)}
                      required
                      className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                    >
                      <option value="Full-Time">Full-time</option>
                      <option value="Part-Time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Work Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobData.work_mode}
                      onChange={(e) => handleInputChange("work_mode", e.target.value)}
                      required
                      className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Application Deadline
                    </label>
                    <div className="relative">
                      <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} size={16} />
                      <input
                        type="date"
                        value={jobData.application_deadline}
                        onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={jobData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      required
                      className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Salary Range
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <select
                        value={jobData.salary_range.currency}
                        onChange={(e) => handleInputChange("salary_range.currency", e.target.value)}
                        className={`px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                      <select
                        value={jobData.salary_range.min}
                        onChange={(e) => handleInputChange("salary_range.min", e.target.value)}
                        className={`px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                      >
                        <option value="">Min Salary</option>
                        <option value="0">0</option>
                        <option value="5000">5,000</option>
                        <option value="10000">10,000</option>
                        <option value="15000">15,000</option>
                        <option value="20000">20,000</option>
                        <option value="25000">25,000</option>
                        <option value="30000">30,000</option>
                        <option value="35000">35,000</option>
                        <option value="40000">40,000</option>
                        <option value="45000">45,000</option>
                        <option value="50000">50,000</option>
                        <option value="60000">60,000</option>
                        <option value="70000">70,000</option>
                        <option value="80000">80,000</option>
                        <option value="90000">90,000</option>
                        <option value="100000">1,00,000</option>
                        <option value="125000">1,25,000</option>
                        <option value="150000">1,50,000</option>
                        <option value="200000">2,00,000</option>
                        <option value="250000">2,50,000</option>
                        <option value="300000">3,00,000</option>
                        <option value="400000">4,00,000</option>
                        <option value="500000">5,00,000+</option>
                      </select>
                      <select
                        value={jobData.salary_range.max}
                        onChange={(e) => handleInputChange("salary_range.max", e.target.value)}
                        className={`px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                      >
                        <option value="">Max Salary</option>
                        <option value="10000">10,000</option>
                        <option value="20000">20,000</option>
                        <option value="30000">30,000</option>
                        <option value="40000">40,000</option>
                        <option value="50000">50,000</option>
                        <option value="60000">60,000</option>
                        <option value="70000">70,000</option>
                        <option value="80000">80,000</option>
                        <option value="90000">90,000</option>
                        <option value="100000">1,00,000</option>
                        <option value="125000">1,25,000</option>
                        <option value="150000">1,50,000</option>
                        <option value="200000">2,00,000</option>
                        <option value="250000">2,50,000</option>
                        <option value="300000">3,00,000</option>
                        <option value="400000">4,00,000</option>
                        <option value="500000">5,00,000</option>
                        <option value="600000">6,00,000</option>
                        <option value="700000">7,00,000</option>
                        <option value="800000">8,00,000</option>
                        <option value="900000">9,00,000</option>
                        <option value="1000000">10,00,000+</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Experience Required (Years)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <select
                        value={jobData.experience_required.min_years}
                        onChange={(e) => handleInputChange("experience_required.min_years", e.target.value)}
                        className={`px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                      >
                        <option value="">Min Experience</option>
                        <option value="0">0 years</option>
                        <option value="1">1 year</option>
                        <option value="2">2 years</option>
                        <option value="3">3 years</option>
                        <option value="4">4 years</option>
                        <option value="5">5 years</option>
                        <option value="6">6 years</option>
                        <option value="7">7 years</option>
                        <option value="8">8 years</option>
                        <option value="9">9 years</option>
                        <option value="10">10 years</option>
                        <option value="12">12 years</option>
                        <option value="15">15 years</option>
                        <option value="20">20+ years</option>
                      </select>
                      <select
                        value={jobData.experience_required.max_years}
                        onChange={(e) => handleInputChange("experience_required.max_years", e.target.value)}
                        className={`px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                      >
                        <option value="">Max Experience</option>
                        <option value="1">1 year</option>
                        <option value="2">2 years</option>
                        <option value="3">3 years</option>
                        <option value="4">4 years</option>
                        <option value="5">5 years</option>
                        <option value="6">6 years</option>
                        <option value="7">7 years</option>
                        <option value="8">8 years</option>
                        <option value="9">9 years</option>
                        <option value="10">10 years</option>
                        <option value="12">12 years</option>
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                        <option value="25">25 years</option>
                        <option value="30">30+ years</option>
                      </select>
                    </div>
                  </div>

                  {/* Premium Job Toggle */}
                  <div className="md:col-span-2">
                    <label className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>
                      <input
                        type="checkbox"
                        checked={jobData.is_premium}
                        onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      Mark as Premium Job (will appear first in search results)
                    </label>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className={theme === 'dark' ? 'text-purple-400' : 'text-purple-500'} size={20} />
                  <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Job Details</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Job Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={jobData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Provide a detailed job description..."
                      rows={6}
                      required
                      className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Responsibilities <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={jobData.responsibilities}
                        onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                        placeholder="List key responsibilities (one per line)..."
                        rows={6}
                        required
                        className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Qualifications <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={jobData.qualifications}
                        onChange={(e) => handleInputChange("qualifications", e.target.value)}
                        placeholder="List required qualifications (one per line)..."
                        rows={6}
                        required
                        className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className={`rounded-lg shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <Award className={theme === 'dark' ? 'text-green-400' : 'text-green-500'} size={20} />
                  <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Required Skills</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a required skill and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      className={`flex-1 px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {jobData.skills_required.map((skill, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-full text-sm font-medium`}
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className={`hover:${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingJob(null);
                    resetForm();
                  }}
                  className={`px-6 py-2.5 ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-md transition-colors font-medium text-sm`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Posting..." : editingJob ? "Update Job" : "Post Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminPostJob;
