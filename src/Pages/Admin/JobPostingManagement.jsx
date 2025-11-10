import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
import { adminService } from "../../services/adminService";
import { candidateExternalService } from "../../services/candidateExternalService";
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

      // Get all jobs from the API
      const jobsData = await candidateExternalService.getAllJobs();
      // Filter for admin-posted jobs (jobs with employer_id: "admin")
      const adminJobs = (jobsData?.jobs || []).filter(job =>
        job.employer_id === "admin" || job.admin_posted === true
      );

      setJobs(adminJobs);
      setFilteredJobs(adminJobs);
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
      draft: { class: 'statusInactive', text: 'Draft' }
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
        posted_by: "admin",
        admin_id: "admin" // Add admin_id as required by API
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
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await adminService.deleteAdminJob(jobId);
        await fetchJobs();
        alert('Job deleted successfully!');
      } catch (error) {
        console.error('Failed to delete job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  const handleViewApplications = (job) => {
    // Navigate to applications page for this job
    // This would need to be implemented based on your application tracking system
    alert(`View applications for: ${job.job_title}`);
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
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleViewApplications(job)}
                      className={`${styles.actionBtn} ${styles.infoBtn}`}
                      title="View Applications"
                    >
                      <Users size={16} />
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
                      title="Delete Job"
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
                  <input
                    type="text"
                    value={formData.experience_required}
                    onChange={(e) => handleInputChange('experience_required', e.target.value)}
                    className={styles.formInput}
                    placeholder="2-5 years"
                  />
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
    </div>
  );
};

export default JobPostingManagement;
