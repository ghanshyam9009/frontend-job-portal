import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import styles from "../../Styles/AdminDashboard.module.css";

const GovernmentJobsManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const jobsPerPage = 10;

  // Form state for adding/editing jobs
  const [formData, setFormData] = useState({
    job_title: "",
    description: "",
    location: "",
    salary_range: "",
    employment_type: "Full-time",
    department_name: "",
    application_deadline: "",
    contact_email: "",
    total_posts: "",
    application_fee: ""
  });

  // Fetch government jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await adminService.getGovernmentJobs();
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error('Failed to fetch government jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Filter jobs based on search and status
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      Open: { class: 'statusActive', text: 'Open' },
      Closed: { class: 'statusBlocked', text: 'Closed' },
      Draft: { class: 'statusInactive', text: 'Draft' }
    };
    
    const statusInfo = statusStyles[status] || statusStyles.Open;
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await adminService.updateGovernmentJob(editingJob.id, formData);
        // Update local state
        setJobs(jobs.map(job => 
          job.id === editingJob.id ? { ...job, ...formData } : job
        ));
        setEditingJob(null);
      } else {
        const newJob = await adminService.createGovernmentJob({
          ...formData,
          admin_id: "1758822687400", // This should come from auth context
          posted_date: new Date().toISOString().split('T')[0],
          status: "Open"
        });
        setJobs([newJob, ...jobs]);
      }
      
      setShowAddModal(false);
      setFormData({
        job_title: "",
        description: "",
        location: "",
        salary_range: "",
        employment_type: "Full-time",
        department_name: "",
        application_deadline: "",
        contact_email: "",
        total_posts: "",
        application_fee: ""
      });
    } catch (error) {
      console.error('Failed to save job:', error);
      alert('Failed to save job. Please try again.');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      job_title: job.job_title,
      description: job.description,
      location: job.location,
      salary_range: job.salary_range,
      employment_type: job.employment_type,
      department_name: job.department_name,
      application_deadline: job.application_deadline,
      contact_email: job.contact_email,
      total_posts: job.total_posts,
      application_fee: job.application_fee
    });
    setShowAddModal(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this government job?')) {
      try {
        // Mock delete - replace with actual API call
        setJobs(jobs.filter(job => job.id !== jobId));
        alert('Government job deleted successfully!');
      } catch (error) {
        console.error('Failed to delete job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading government jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Government Jobs Management</h1>
        <p className={styles.pageSubtitle}>Create and manage government job postings</p>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by job title, department, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
        
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({jobs.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'Open' ? styles.active : ''}`}
            onClick={() => setStatusFilter('Open')}
          >
            Open ({jobs.filter(j => j.status === 'Open').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'Closed' ? styles.active : ''}`}
            onClick={() => setStatusFilter('Closed')}
          >
            Closed ({jobs.filter(j => j.status === 'Closed').length})
          </button>
          <button 
            className={styles.addBtn}
            onClick={() => {
              setEditingJob(null);
              setShowAddModal(true);
            }}
          >
            + Add Government Job
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Department</th>
              <th>Location</th>
              <th>Salary Range</th>
              <th>Posts</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{job.job_title}</h4>
                    <p className={styles.jobDescription}>{job.description}</p>
                  </div>
                </td>
                <td>
                  <span className={styles.departmentTag}>{job.department_name}</span>
                </td>
                <td className={styles.locationCell}>{job.location}</td>
                <td className={styles.salaryCell}>{job.salary_range}</td>
                <td>{job.total_posts}</td>
                <td className={styles.dateCell}>{formatDate(job.application_deadline)}</td>
                <td>{getStatusBadge(job.status)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={() => handleEdit(job)}
                      className={`${styles.actionBtn} ${styles.viewBtn}`}
                      title="Edit Job"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(job.id)}
                      className={`${styles.actionBtn} ${styles.rejectBtn}`}
                      title="Delete Job"
                    >
                      🗑️
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
          <div className={styles.emptyIcon}>🏛️</div>
          <h3>No government jobs found</h3>
          <p>No government jobs match your current filters.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingJob ? 'Edit Government Job' : 'Add New Government Job'}</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => {
                  setShowAddModal(false);
                  setEditingJob(null);
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
                  <label>Department Name *</label>
                  <input
                    type="text"
                    value={formData.department_name}
                    onChange={(e) => handleInputChange('department_name', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
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
                  <label>Total Posts *</label>
                  <input
                    type="number"
                    value={formData.total_posts}
                    onChange={(e) => handleInputChange('total_posts', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Application Fee *</label>
                  <input
                    type="text"
                    value={formData.application_fee}
                    onChange={(e) => handleInputChange('application_fee', e.target.value)}
                    className={styles.formInput}
                    placeholder="₹100"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Application Deadline *</label>
                  <input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    className={styles.formInput}
                    required
                  />
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
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingJob ? 'Update Job' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentJobsManagement;


