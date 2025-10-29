import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { Check, Eye, Edit, X, Search, FileText, Star } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageJobs = () => {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const jobsPerPage = 10;

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobsData = await adminService.getPendingJobs();
        // Ensure jobsData is always an array
        const jobsArray = Array.isArray(jobsData) ? jobsData : [];
        setJobs(jobsArray);
        setFilteredJobs(jobsArray);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setError('Failed to fetch jobs. Please try again.');
        // Set empty arrays on error
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Filter jobs based on search and status
  useEffect(() => {
    // Ensure jobs is always an array
    let filtered = Array.isArray(jobs) ? jobs : [];

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, jobs]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: { class: 'statusActive', text: 'Active' },
      pending: { class: 'statusInProgress', text: 'Pending' },
      fulfilled: { class: 'statusActive', text: 'Fulfilled' },
      expired: { class: 'statusBlocked', text: 'Expired' }
    };
    
    const statusInfo = statusStyles[status] || statusStyles.pending;
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApproveTask = async (task) => {
    try {
      setLoading(true);
      let result;
      
      switch (task.category) {
        case 'postnewjob':
          result = await adminService.approveJob(task.task_id);
          break;
        case 'editjob':
          result = await adminService.approveEditedJob(task.task_id);
          break;
        case 'closedjob':
          result = await adminService.approveJobClosing(task.task_id);
          break;
        case 'newapplication':
          result = await adminService.approveJobApplicationByStudent(task.task_id);
          break;
        case 'change status of application':
          result = await adminService.approveApplicationStatusChanged(task.task_id);
          break;
        default:
          throw new Error('Unknown task category');
      }
      
      alert(`Job approved successfully: ${result.message || 'Job fulfilled'}`);
      
      // Refresh the jobs list
      const jobsData = await adminService.getPendingJobs();
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
      
    } catch (error) {
      console.error('Failed to approve job:', error);
      alert('Failed to approve job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTask = async (task) => {
    try {
      setLoading(true);
      let result;

      switch (task.category) {
        case 'postnewjob':
          result = await adminService.rejectJob(task.task_id);
          break;
        default:
          throw new Error('Rejection not supported for this task type');
      }

      alert(`Job rejected successfully: ${result.message || 'Job rejected'}`);

      // Refresh the jobs list
      const jobsData = await adminService.getPendingJobs();
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);

    } catch (error) {
      console.error('Failed to reject job:', error);
      alert('Failed to reject job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await adminService.editTask(editingTask.task_id, editingTask);
      alert(`Job edited successfully: ${result.message || 'Job edited'}`);
      setEditingTask(null);
      // Refresh the jobs list
      const jobsData = await adminService.getPendingJobs();
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
    } catch (error) {
      console.error('Failed to edit job:', error);
      alert('Failed to edit job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkJobPremium = async (task, isPremium = true) => {
    if (!task.job_id) {
      alert('Cannot mark this job as premium: Job ID not found');
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.markJobPremium(task.job_id, isPremium, 'job');
      alert(`Job successfully marked as ${isPremium ? 'premium' : 'non-premium'}: ${result.message || 'Success'}`);
      
      // Refresh the jobs list
      const jobsData = await adminService.getPendingJobs();
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
    } catch (error) {
      console.error('Failed to mark job as premium:', error);
      alert('Failed to mark job as premium. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination - ensure filteredJobs is always an array
  const safeFilteredJobs = Array.isArray(filteredJobs) ? filteredJobs : [];
  const totalPages = Math.ceil(safeFilteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = safeFilteredJobs.slice(startIndex, endIndex);

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

  // Handle error state
  if (error) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.errorContainer}>
          <h2>Error Loading Jobs</h2>
          <p>{error}</p>
          <button 
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Manage Jobs</h1>
        <p className={styles.pageSubtitle}>View and manage all pending jobs requiring approval</p>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by job title, category, or ID..."
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
            All ({safeFilteredJobs.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.active : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({safeFilteredJobs.filter(j => j.status === 'pending').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'fulfilled' ? styles.active : ''}`}
            onClick={() => setStatusFilter('fulfilled')}
          >
            Fulfilled ({safeFilteredJobs.filter(j => j.status === 'fulfilled').length})
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((task) => (
              <tr key={task.id}>
                <td>
                  <span className={styles.jobTypeBadge}>{task.category}</span>
                </td>
                <td>{getStatusBadge(task.status)}</td>
                <td className={styles.dateCell}>{formatDate(task.posted_date)}</td>
                <td className={styles.dateCell}>{formatDate(task.updated_date)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    {task.status === 'pending' && (
                      <>
                        <button
                          className={styles.actionBtn}
                          title="Approve"
                          onClick={() => handleApproveTask(task)}
                        >
                          <Check size={16} />
                        </button>
                        {task.category === 'postnewjob' && (
                          <button
                            className={styles.actionBtn}
                            title="Reject"
                            onClick={() => handleRejectTask(task)}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </>
                    )}
                    {task.job_id && (
                      <button
                        className={styles.actionBtn}
                        title="Mark as Premium"
                        onClick={() => handleMarkJobPremium(task, true)}
                        style={{ color: '#FFD700' }}
                      >
                        <Star size={16} />
                      </button>
                    )}
                    <button className={styles.actionBtn} title="View Details">
                      <Eye size={16} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      title="Edit"
                      onClick={() => setEditingTask(task)}
                    >
                      <Edit size={16} />
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

      {safeFilteredJobs.length === 0 && (
        <div className={styles.emptyState}>
          <FileText className={styles.emptyIcon} />
          <h3>No jobs found</h3>
          <p>No jobs match your current filters.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? '#333' : '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3>Edit Job</h3>
            <form onSubmit={handleEditTask}>
              {/* Don't share Job Title and Job ID */}
              <div style={{ marginBottom: '10px' }}>
                <label>Description:</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  style={{ width: '100%', height: '100px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Category:</label>
                <input
                  type="text"
                  value={editingTask.category || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
                  Save
                </button>
                <button type="button" onClick={() => setEditingTask(null)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
