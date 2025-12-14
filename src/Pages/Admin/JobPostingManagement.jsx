import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
import { adminService } from "../../services/adminService";
import { candidateExternalService } from "../../services/candidateExternalService";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import { Building2, Edit, Trash2, Search, RefreshCw, Eye, Users, Download, X, FileText, MapPin, Clock, Plus, Award } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const JobPostingManagement = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [studentNames, setStudentNames] = useState({});
  const jobsPerPage = 10;

  // Form state for adding/editing jobs
  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    description: "",
    location: "",
    salary_range: "",
    employment_type: "Full-Time",
    work_mode: "On-site",
    experience_required: {
      min_years: "",
      max_years: "",
    },
    skills_required: [],
    category: "",
    responsibilities: "",
    qualifications: "",
    application_deadline: "",
    contact_email: "",
    is_premium: false
  });

  const [skillInput, setSkillInput] = useState("");

  // Fetch jobs data
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all jobs from the API and filter for current admin's posted jobs only (excluding government jobs)
      const jobsData = await candidateExternalService.getAllJobs();
      const currentAdminId = user?.admin_id || user?.id || user?.user_id;
      const adminJobs = (jobsData?.jobs || [])
        .filter(job => job.admin_id === currentAdminId)
        .filter(job => job.posted_by?.toLowerCase() === 'admin') // Only show jobs posted by admin
        .filter(job => job.job_type !== 'GOVERNMENT') // Don't show government jobs
        .filter(job => job.posted_by?.toUpperCase() !== 'RECRUITER') // Don't show recruiter jobs
        .filter(job => job.status !== 'closed'); // Filter out closed jobs from display

      // Add application_count as 0 initially - will be loaded on-demand
      const jobsWithDefaultCounts = adminJobs.map(job => ({
        ...job,
        application_count: 0, // Will be loaded when user views applications
        applications: [] // Applications loaded on-demand when viewing details
      }));

      // Sort jobs by posted date (latest first)
      const sortedJobs = jobsWithDefaultCounts.sort((a, b) => {
        const dateA = new Date(a.created_at || a.posted_date || 0);
        const dateB = new Date(b.created_at || b.posted_date || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      console.log(`Job loading complete. Loaded ${sortedJobs.length} jobs (application counts loaded on-demand).`);

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

  const getStatusBadge = (status) => {
    const statusStyles = {
      approved: { class: 'statusActive', text: 'Approved' },
      pending: { class: 'statusInactive', text: 'Pending' },
      rejected: { class: 'statusBlocked', text: 'Rejected' },
      draft: { class: 'statusInactive', text: 'Draft' },
      closed: { class: 'statusBlocked', text: 'Closed' }
    };

    const statusInfo = statusStyles[status] || statusStyles.approved;
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInputChange = (field, value) => {
    const keys = field.split(".");
    if (keys.length > 1) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        job_title: formData.job_title,
        company_name: formData.company_name || null,
        description: formData.description,
        location: formData.location,
        employment_type: formData.employment_type,
        work_mode: formData.work_mode,
        salary_range: formData.salary_range,
        experience_required: formData.experience_required,
        skills_required: formData.skills_required,
        responsibilities: formData.responsibilities.split("\n"),
        qualifications: formData.qualifications.split("\n"),
        category: formData.category || null,
        application_deadline: formData.application_deadline || null,
        contact_email: formData.contact_email || null,
        status: "Open", // Admin jobs are visible and open
        is_premium: formData.is_premium,
        posted_by: "admin",
        to_show_user: true, // Make admin jobs visible to candidates
        admin_id: user?.admin_id || user?.id || user?.user_id // Use actual admin ID from logged-in user
      };

      let jobResult;

      if (editingJob) {
        // Update existing job
        jobResult = await adminService.updateAdminJob(editingJob.job_id || editingJob.id, jobData);
        alert('Job updated successfully!');
      } else {
        // Create new job
        jobResult = await adminService.postJobByAdmin(jobData);
        alert('Job posted successfully!');
      }

      // Mark job as premium if checkbox was checked
      if (formData.is_premium) {
        try {
          const jobId = editingJob ? (editingJob.job_id || editingJob.id) : jobResult.job_id;
          await adminService.markJobPremium(jobId, true, 'job');
          console.log('Job marked as premium successfully');
        } catch (premiumError) {
          console.error('Failed to mark job as premium:', premiumError);
          alert('Job posted successfully, but failed to mark as premium. You can try again later.');
        }
      }

      // Refresh jobs data
      await fetchJobs();
      setShowAddModal(false);
      setEditingJob(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save job:', error);
      alert('Failed to save job. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      job_title: "",
      company_name: "",
      description: "",
      location: "",
      salary_range: "",
      employment_type: "Full-Time",
      work_mode: "On-site",
      experience_required: {
        min_years: "",
        max_years: "",
      },
      skills_required: [],
      category: "",
      responsibilities: "",
      qualifications: "",
      application_deadline: "",
      contact_email: "",
      is_premium: false
    });
    setSkillInput("");
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      job_title: job.job_title || "",
      company_name: job.company_name || "",
      description: job.description || "",
      location: job.location || "",
      salary_range: job.salary_range && typeof job.salary_range === 'string'
        ? job.salary_range
        : job.salary_range && typeof job.salary_range === 'object'
        ? `${job.salary_range.currency || 'INR'} ${job.salary_range.min || ''} - ${job.salary_range.max || ''}`.trim()
        : "",
      employment_type: job.employment_type || "Full-Time",
      work_mode: job.work_mode || "On-site",
      experience_required: job.experience_required || {
        min_years: "",
        max_years: "",
      },
      skills_required: Array.isArray(job.skills_required)
        ? job.skills_required
        : (job.skills_required ? job.skills_required.split(", ") : []),
      category: job.category || "",
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities.join("\n")
        : (job.responsibilities || ""),
      qualifications: Array.isArray(job.qualifications)
        ? job.qualifications.join("\n")
        : (job.qualifications || ""),
      application_deadline: job.application_deadline || "",
      contact_email: job.contact_email || "",
      is_premium: job.is_premium || false
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

  // Function to enrich applications with student details (similar to JobApplicationReports.jsx)
  const enrichApplicationsWithStudentData = async (applications, jobId) => {
    console.log('Enriching applications with student data for job:', jobId);

    // Use the same approach as JobApplicationReports.jsx
    const applicationsWithDetails = applications.map((app) => {
      // Check if application already has embedded student data
      if (app.student_name) {
        return {
          ...app,
          student_details: {
            name: app.student_name || "Unknown",
            email: app.student_email || app.email || null,
            phone: app.student_phone || null,
            skills: app.student_skills ? app.student_skills.split(',').map(skill => skill.trim()) : [],
            location: app.student_location || null,
            experience: app.student_experience || null,
            education: app.student_university ? [app.student_university] : [],
            experience_years: app.student_experience_years || null,
            bio: app.student_bio || null,
            resumeUrl: app.resume_url || app.student_profile?.resume || null,
            department: app.student_department || null,
            cgpa: app.student_cgpa || null
          }
        };
      }

      // Fallback if no embedded data - create a map for backward compatibility
      const enrichedApp = {
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
          cgpa: null
        }
      };

      return enrichedApp;
    });

    return applicationsWithDetails;
  };

  const handleViewApplications = async (job) => {
    console.log('Viewing applications for job:', job);

    // If applications haven't been loaded yet, fetch them
    if (!job.applications || job.applications.length === 0) {
      try {
        console.log(`Fetching applications for job ${job.job_id}`);

        // Fetch applications from API
        const applicantsData = await recruiterExternalService.getAllApplicants(job.job_id);
        console.log('Raw applicants data:', applicantsData);

        // Handle different response formats from the API
        let applications = [];
        let applicationCount = 0;

        if (applicantsData) {
          // Check for different possible response formats
          if (Array.isArray(applicantsData)) {
            applications = applicantsData;
            applicationCount = applicantsData.length;
          } else if (applicantsData.applications && Array.isArray(applicantsData.applications)) {
            applications = applicantsData.applications;
            applicationCount = applicantsData.count || applicantsData.applications.length;
          } else if (applicantsData.data && Array.isArray(applicantsData.data)) {
            applications = applicantsData.data;
            applicationCount = applicantsData.data.length;
          } else if (typeof applicantsData === 'object' && applicantsData.count !== undefined) {
            applicationCount = applicantsData.count;
            applications = applicantsData.applications || [];
          } else {
            console.log('Unexpected response format:', applicantsData);
            applications = [];
            applicationCount = 0;
          }
        }

        console.log(`Processed ${applicationCount} applications`);

        // Update the job object with fetched applications
        job.applications = applications;
        job.application_count = applicationCount;

        // If no applications found, show message
        if (!applications || applications.length === 0) {
          alert('No applications found for this job.');
          return;
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        alert(`Failed to load applications. Error: ${error.message}`);
        return;
      }
    }

    // Enrich applications with student data (similar to JobApplicationReports.jsx)
    try {
      const enrichedApplications = await enrichApplicationsWithStudentData(job.applications, job.job_id);

      // Update the job with enriched applications
      job.applications = enrichedApplications;
    } catch (enrichError) {
      console.error('Failed to enrich applications:', enrichError);
      // Continue with unenriched data
    }

    setSelectedJobForApplications(job);
    setShowApplicationsModal(true);
  };

  const handleViewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Job Posting Management</h1>
        <p className={styles.pageSubtitle}>Create and manage job postings that candidates can apply for</p>
      </div>

      {/* Error Display */}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by job title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <Search className={styles.searchIcon} />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({jobs.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'approved' ? styles.active : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approved ({jobs.filter(j => j.status === 'approved').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.active : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({jobs.filter(j => j.status === 'pending').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'closed' ? styles.active : ''}`}
            onClick={() => setStatusFilter('closed')}
          >
            Closed ({jobs.filter(j => j.status === 'closed').length})
          </button>
          <button
            className={styles.addBtn}
            onClick={() => {
              setEditingJob(null);
              resetForm();
              setShowAddModal(true);
            }}
          >
            + Post New Job
          </button>
          <button
            className={styles.addBtn}
            onClick={() => {
              setError("");
              fetchJobs();
            }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Salary Range</th>
              <th>Type</th>
              <th>Status</th>
              <th>Posted Date</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((job) => (
              <tr key={job.id || job.job_id}>
                <td>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{job.job_title || 'N/A'}</h4>
                    <p className={styles.jobDescription}>
                      {job.description ? `${job.description.substring(0, 60)}...` : 'N/A'}
                    </p>
                  </div>
                </td>
                <td>{job.company_name || 'N/A'}</td>
                <td className={styles.locationCell}>{job.location || 'N/A'}</td>
                <td className={styles.salaryCell}>
                  {job.salary_range && typeof job.salary_range === 'string'
                    ? job.salary_range
                    : job.salary_range && typeof job.salary_range === 'object'
                    ? `${job.salary_range.currency || 'INR'} ${job.salary_range.min || '0'} - ${job.salary_range.max || '0'}`
                    : 'N/A'}
                </td>
                <td>{job.employment_type || 'Full-time'}</td>
                <td>{getStatusBadge(job.status || 'approved')}</td>
                <td className={styles.dateCell}>
                  {formatDate(job.created_at || job.posted_date)}
                </td>
                <td>
                  <div className={styles.applicationCount}>
                    <Users size={16} />
                    <span className={styles.countBadge}>
                      {job.application_count || 0}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleViewApplications(job)}
                      className={`${styles.actionBtn} ${styles.infoBtn}`}
                      title="View Applications"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(job)}
                      className={`${styles.actionBtn} ${styles.viewBtn}`}
                      title="Edit Job"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(job.job_id || job.id)}
                      className={`${styles.actionBtn} ${styles.rejectBtn}`}
                      title="Close Job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {filteredJobs.length === 0 && (
        <div className={styles.emptyState}>
          <Building2 className={styles.emptyIcon} />
          <h3>No jobs found</h3>
          <p>No jobs match your current filters. Click "Post New Job" to add your first job.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
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
                      value={formData.job_title}
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
                      value={formData.company_name}
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
                        value={formData.location}
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
                      value={formData.employment_type}
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
                      value={formData.work_mode}
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
                        value={formData.application_deadline}
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
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      required
                      className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Salary Range
                    </label>
                    <input
                      type="text"
                      value={formData.salary_range}
                      onChange={(e) => handleInputChange('salary_range', e.target.value)}
                      placeholder="e.g., ₹5,00,000 - ₹8,00,000 per annum"
                      className={`w-full px-3 py-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      Experience Required (Years)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <select
                        value={formData.experience_required.min_years}
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
                        value={formData.experience_required.max_years}
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
                        checked={formData.is_premium}
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
                      value={formData.description}
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
                        value={formData.responsibilities}
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
                        value={formData.qualifications}
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
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
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
                    {formData.skills_required.map((skill, index) => (
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

      {/* Applications Modal */}
      {showApplicationsModal && selectedJobForApplications && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? '#333' : '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90%',
            overflowY: 'auto',
            color: theme === 'dark' ? '#fff' : '#000'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>All Candidates Applied for: {selectedJobForApplications.job_title}</h3>
              <button
                onClick={() => setShowApplicationsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: theme === 'dark' ? '#fff' : '#000'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p><strong>Company:</strong> {selectedJobForApplications.company_name}</p>
              <p><strong>Total Candidates Applied:</strong> {selectedJobForApplications.application_count}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>Showing all candidates who applied for this job</p>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              {selectedJobForApplications.applications.map((application, index) => (
                <div key={application.application_id || index} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: theme === 'dark' ? '#444' : '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0 }}>{application.student_details?.name || `Student ${application.student_id}`}</h4>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: application.status === 'Shortlisted' ? '#28a745' :
                                     application.status === 'Rejected' ? '#dc3545' : '#ffc107',
                      color: '#fff',
                      fontSize: '12px'
                    }}>
                      {application.status || 'pending'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <strong>Email:</strong><br />{application.student_details?.email || 'N/A'}
                    </div>
                    <div>
                      <strong>Phone:</strong><br />{application.student_details?.phone || 'N/A'}
                    </div>
                    <div>
                      <strong>Skills:</strong><br />{application.student_details?.skills && application.student_details.skills.length > 0 ?
                        application.student_details.skills.join(', ') : 'N/A'}
                    </div>
                    <div>
                      <strong>Applied Date:</strong><br />{formatDate(application.created_at || application.applied_date)}
                    </div>
                  </div>

                  {application.cover_letter && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Cover Letter:</strong>
                      <p style={{ margin: '5px 0', fontStyle: 'italic', backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0', padding: '8px', borderRadius: '4px' }}>
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleViewCandidateDetails(application)}
                      style={{
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} style={{ marginRight: '5px' }} />
                      View Full Details
                    </button>

                    {(application.resume_url || application.student_details?.resumeUrl) && (
                      <a
                        href={application.resume_url || application.student_details?.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: '#28a745',
                          color: '#fff',
                          textDecoration: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <Download size={14} style={{ marginRight: '5px' }} />
                        Download Resume
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowApplicationsModal(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {showCandidateModal && selectedCandidate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? '#333' : '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90%',
            overflowY: 'auto',
            color: theme === 'dark' ? '#fff' : '#000'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Candidate Application Details</h3>
              <button
                onClick={() => setShowCandidateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: theme === 'dark' ? '#fff' : '#000'
                }}
              >
                ×
              </button>
            </div>

            {selectedCandidate.student_profile?.logo && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Profile Logo:</label>
                <div style={{
                  padding: '15px',
                  backgroundColor: theme === 'dark' ? '#444' : '#f8f9fa',
                  borderRadius: '8px',
                  border: `2px solid ${theme === 'dark' ? '#555' : '#e9ecef'}`,
                  display: 'inline-block'
                }}>
                  <img
                    src={selectedCandidate.student_profile.logo}
                    alt="Candidate Profile Logo"
                    style={{
                      maxWidth: '120px',
                      maxHeight: '120px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      display: 'block',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '120px',
                    height: '120px',
                    backgroundColor: theme === 'dark' ? '#666' : '#dee2e6',
                    borderRadius: '6px',
                    color: theme === 'dark' ? '#ccc' : '#6c757d',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    Logo not available
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold' }}>Student Name:</label>
                <p>{selectedCandidate.student_profile?.full_name || selectedCandidate.student_profile?.name || selectedCandidate.student_name || `Student ${selectedCandidate.student_id}`}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Job Title:</label>
                <p>{selectedJobForApplications?.job_title || 'Not available'}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Company Name:</label>
                <p>{selectedJobForApplications?.company_name || 'Not available'}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Application Status:</label>
                <p style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: selectedCandidate.status === 'Shortlisted' ? '#28a745' :
                                 selectedCandidate.status === 'Rejected' ? '#dc3545' : '#ffc107',
                  color: '#fff'
                }}>
                  {selectedCandidate.status || 'pending'}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Status Verified:</label>
                <p>{selectedCandidate.status_verified || 'Not verified'}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Applied Date:</label>
                <p>{formatDate(selectedCandidate.created_at || selectedCandidate.applied_date)}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>Last Updated:</label>
                <p>{formatDate(selectedCandidate.updated_at)}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Show to Recruiter:</label>
              <p>{selectedCandidate.to_show_recruiter ? 'Yes' : 'No'}</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Show to User:</label>
              <p>{selectedCandidate.to_show_user ? 'Yes' : 'No'}</p>
            </div>

            {selectedCandidate.cover_letter && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>Cover Letter:</label>
                <div style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: theme === 'dark' ? '#444' : '#f9f9f9',
                  marginTop: '5px'
                }}>
                  {selectedCandidate.cover_letter}
                </div>
              </div>
            )}

            {selectedCandidate.student_profile?.resume && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>Resume:</label>
                <div style={{ marginTop: '10px' }}>
                  <a
                    href={selectedCandidate.student_profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                  >
                    <Download size={16} style={{ marginRight: '8px' }} />
                    Download Resume
                  </a>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowCandidateModal(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
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

export default JobPostingManagement;
