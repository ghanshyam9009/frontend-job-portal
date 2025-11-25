import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
import { adminService } from "../../services/adminService";
import { adminExternalService } from "../../services";
import { Building2, Edit, Trash2, Search, RefreshCw } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const GovernmentJobsManagement = () => {
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
  const [approvalTaskId, setApprovalTaskId] = useState("");
  const [approving, setApproving] = useState(false);

  // Form state for adding/editing jobs
  const [formData, setFormData] = useState({
    job_title: "",
    description: "",
    document_link: "",
    salary_range: "",
    employment_type: "Full-time",
    department_name: "",
    application_deadline: "",
    contact_email: "",
    total_posts: "",
    application_fee: ""
  });

  // Fetch government jobs data
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const jobsData = await adminService.getGovernmentJobs();
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error('Failed to fetch government jobs:', error);
      setError('Failed to fetch government jobs');
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
        await adminService.updateGovernmentJob(editingJob.job_id || editingJob.id, {
          job_id: editingJob.job_id || editingJob.id,
          admin_id: String(user?.user_id || user?.id || user?.admin_id),
          salary_range: formData.salary_range,
          status: "Closed" // Update to closed or keep as is
        });
        setEditingJob(null);
      } else {
        const adminId = String(user?.user_id || user?.id || user?.admin_id);
        console.log("Creating government job with:", {
          admin_id: adminId,
          job_title: formData.job_title,
          description: formData.description,
          document_link: formData.document_link,
          salary_range: formData.salary_range,
          employment_type: formData.employment_type,
          department_name: formData.department_name,
          application_deadline: formData.application_deadline,
          contact_email: formData.contact_email,
          total_posts: formData.total_posts,
          application_fee: formData.application_fee
        });

        if (!adminId || adminId === 'undefined' || adminId === 'null') {
          alert('Admin ID is missing. Please log out and log back in.');
          return;
        }

        if (!formData.job_title || !formData.description || !formData.salary_range || !formData.employment_type || !formData.department_name || !formData.application_deadline || !formData.contact_email) {
          alert('Please fill in all required fields.');
          return;
        }

        await adminService.createGovernmentJob({
          admin_id: adminId,
          job_title: formData.job_title,
          description: formData.description,
          document_link: formData.document_link,
          salary_range: formData.salary_range,
          employment_type: formData.employment_type,
          department_name: formData.department_name,
          application_deadline: formData.application_deadline,
          contact_email: formData.contact_email,
          total_posts: formData.total_posts,
          application_fee: formData.application_fee,
          status: "Open",
          location: "N/A" // Add location field that might be required
        });
      }
      
      // Refresh jobs data
      await fetchJobs();
      setShowAddModal(false);
      setFormData({
        job_title: "",
        description: "",
        document_link: "",
        salary_range: "",
        employment_type: "Full-time",
        department_name: "",
        application_deadline: "",
        contact_email: "",
        total_posts: "",
        application_fee: ""
      });
      alert(editingJob ? 'Government job updated successfully!' : 'Government job created successfully!');
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
      document_link: job.document_link,
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
    if (window.confirm('Are you sure you want to close this government job? This will remove it from public display.')) {
      try {
        await adminService.closeAdminJob(jobId);
        await fetchJobs();
        alert('Government job closed successfully!');
      } catch (error) {
        console.error('Failed to close job:', error);
        alert('Failed to close job. Please try again.');
      }
    }
  };

  // Admin approval actions via external endpoints
  const approveAction = async (action) => {
    if (!approvalTaskId) {
      alert('Enter task_id first');
      return;
    }
    try {
      setApproving(true);
      if (action === 'post') {
        await adminExternalService.approveJobPosting(approvalTaskId);
        alert('Job posting approved');
      } else if (action === 'edit') {
        await adminExternalService.approveEditedJob(approvalTaskId);
        alert('Job edit approved');
      } else if (action === 'close') {
        await adminExternalService.approveJobClosing(approvalTaskId);
        alert('Job closing approved');
      }
      setApprovalTaskId("");
    } catch (e) {
      console.error(e);
      alert('Approval failed');
    } finally {
      setApproving(false);
    }
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
          <p>Loading government jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Government Jobs Management</h1>
        <p className={styles.pageSubtitle}>Create and manage government job postings</p>
      </div>



      {/* Error Display */}
      {error && <p className={styles.errorText}>{error}</p>}

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
              <tr key={job.id || job.job_id}>
                <td>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{job.job_title || 'N/A'}</h4>
                    <p className={styles.jobDescription}>{job.description || 'N/A'}</p>
                  </div>
                </td>
                <td>
                  <span className={styles.departmentTag}>{job.department_name || 'N/A'}</span>
                </td>
                <td className={styles.locationCell}>{job.location || 'N/A'}</td>
                <td className={styles.salaryCell}>{job.salary_range || 'N/A'}</td>
                <td>{job.total_posts || 'N/A'}</td>
                <td className={styles.dateCell}>{job.application_deadline ? formatDate(job.application_deadline) : 'N/A'}</td>
                <td>{getStatusBadge(job.status || 'Open')}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={() => handleEdit(job)}
                      className={`${styles.actionBtn} ${styles.viewBtn}`}
                      title="Edit Job"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(job.id || job.job_id)}
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
                  <label>Link</label>
                  <input
                    type="url"
                    value={formData.document_link}
                    onChange={(e) => handleInputChange('document_link', e.target.value)}
                    className={styles.formInput}
                    placeholder="https://example.com/document.pdf"
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
