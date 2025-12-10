import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
import { adminService } from "../../services/adminService";
import { candidateExternalService } from "../../services/candidateExternalService";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import { Building2, Edit, Trash2, Search, RefreshCw, Eye, Users } from "lucide-react";
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
    employment_type: "Full-time",
    experience_required: "",
    skills_required: [],
    category: "",
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
        .filter(job => job.job_type === 'PRIVATE') // Show only PRIVATE jobs
        .filter(job => job.category !== 'Government')  // Extra safety filter by category
        .filter(job => job.status !== 'closed'); // Filter out closed jobs from display

      // Fetch application counts for admin jobs in batches to avoid overwhelming the API
      const BATCH_SIZE = 3; // Process 3 jobs at a time
      const DELAY_MS = 100; // 100ms delay between batches
      const jobsWithCounts = [];

      for (let i = 0; i < adminJobs.length; i += BATCH_SIZE) {
        const batch = adminJobs.slice(i, i + BATCH_SIZE);
        console.log(`Fetching application counts for batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(adminJobs.length / BATCH_SIZE)} (${batch.length} jobs)`);

        // Process batch concurrently
        const batchPromises = batch.map(async (job) => {
          try {
            const applicantsData = await recruiterExternalService.getAllApplicants(job.job_id);

            // Handle different response formats from the API
            let applicationCount = 0;
            if (applicantsData) {
              if (Array.isArray(applicantsData)) {
                applicationCount = applicantsData.length;
              } else if (applicantsData.applications && Array.isArray(applicantsData.applications)) {
                applicationCount = applicantsData.count || applicantsData.applications.length;
              } else if (typeof applicantsData === 'object' && applicantsData.count !== undefined) {
                applicationCount = applicantsData.count;
              }
            }

            return {
              ...job,
              application_count: applicationCount,
              applications: [] // Applications loaded on-demand when viewing details
            };
          } catch (error) {
            console.error(`Failed to fetch applications for job ${job.job_id}:`, error.message);
            return {
              ...job,
              application_count: 0,
              applications: []
            };
          }
        });

        // Wait for current batch to complete
        const batchResults = await Promise.all(batchPromises);
        jobsWithCounts.push(...batchResults);

        // Add delay between batches (except for the last batch)
        if (i + BATCH_SIZE < adminJobs.length) {
          console.log(`Waiting ${DELAY_MS}ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }

      // Sort jobs by posted date (latest first)
      const sortedJobs = jobsWithCounts.sort((a, b) => {
        const dateA = new Date(a.created_at || a.posted_date || 0);
        const dateB = new Date(b.created_at || b.posted_date || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      console.log(`Job loading complete. Processed ${sortedJobs.length} jobs with application counts.`);

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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        salary_range: formData.salary_range,
        experience_required: formData.experience_required,
        skills_required: formData.skills_required,
        category: formData.category || null,
        application_deadline: formData.application_deadline || null,
        contact_email: formData.contact_email || null,
        status: "Open", // Admin jobs are visible and open
        is_premium: formData.is_premium,
        job_type: "PRIVATE",
        posted_by: "admin",
        admin_id: user?.admin_id || user?.id || user?.user_id // Use actual admin ID from logged-in user
      };

      if (editingJob) {
        // Update existing job
        await adminService.updateAdminJob(editingJob.job_id || editingJob.id, jobData);
        alert('Job updated successfully!');
      } else {
        // Create new job
        await adminService.postJobByAdmin(jobData);
        alert('Job posted successfully!');
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
      employment_type: "Full-time",
      experience_required: "",
      skills_required: [],
      category: "",
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
      salary_range: job.salary_range || "",
      employment_type: job.employment_type || "Full-time",
      experience_required: job.experience_required || "",
      skills_required: Array.isArray(job.skills_required)
        ? job.skills_required
        : (job.skills_required ? job.skills_required.split(", ") : []),
      category: job.category || "",
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
          if (Array.isArray(applicantsData)) {
            applications = applicantsData;
            applicationCount = applicantsData.length;
          } else if (applicantsData.applications && Array.isArray(applicantsData.applications)) {
            applications = applicantsData.applications;
            applicationCount = applicantsData.count || applicantsData.applications.length;
          } else if (typeof applicantsData === 'object' && applicantsData.count !== undefined) {
            applicationCount = applicantsData.count;
            applications = [];
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
        alert('Failed to load applications. Please try again.');
        return;
      }
    }

    // Enrich applications with student data (similar to JobApplicationReports.jsx)
    const enrichedApplications = await enrichApplicationsWithStudentData(job.applications, job.job_id);

    // Update the job with enriched applications
    job.applications = enrichedApplications;

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
                <td className={styles.salaryCell}>{job.salary_range || 'N/A'}</td>
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
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingJob ? 'Edit Job Posting' : 'Post New Job'}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowAddModal(false);
                  setEditingJob(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={styles.formTextarea}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Salary Range *</label>
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => handleInputChange('salary_range', e.target.value)}
                    className={styles.formInput}
                    placeholder="₹50,000 - ₹1,00,000"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Employment Type *</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                    className={styles.formSelect}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Experience Required</label>
                  <select
                    value={formData.experience_required}
                    onChange={(e) => handleInputChange('experience_required', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="">Select experience level</option>
                    <option value="No experience required">No experience required</option>
                    <option value="0-1 year">0-1 year</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2-3 years">2-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5-7 years">5-7 years</option>
                    <option value="7-10 years">7-10 years</option>
                    <option value="10+ years">10+ years</option>
                    <option value="15+ years">15+ years</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="">Select Category</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Education">Education</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Contact Email *</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              {/* Skills Section */}
              <div className={styles.formGroup}>
                <label>Skills Required</label>
                <div className={styles.skillInputGroup}>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className={styles.skillInput}
                    placeholder="Add a skill..."
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className={styles.addSkillBtn}
                  >
                    Add Skill
                  </button>
                </div>
                <div className={styles.skillsList}>
                  {formData.skills_required.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className={styles.removeSkillBtn}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Premium Job Toggle */}
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                    className={styles.checkbox}
                  />
                  Mark as Premium Job (will appear first in search results)
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingJob(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingJob ? 'Update Job' : 'Post Job'}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold' }}>Student Name:</label>
                <p>{studentNames[selectedCandidate.student_id] || `Loading...`}</p>
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

            {selectedCandidate.resume_url && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>Resume:</label>
                <div style={{ marginTop: '5px' }}>
                  <a
                    href={selectedCandidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    <Eye size={14} style={{ marginRight: '5px' }} />
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
