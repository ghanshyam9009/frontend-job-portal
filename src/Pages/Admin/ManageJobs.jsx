import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const jobsPerPage = 10;

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await adminService.getPendingJobs(); // Using pending jobs for now
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
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
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      active: { class: 'statusActive', text: 'Active' },
      pending: { class: 'statusInProgress', text: 'Pending' },
      expired: { class: 'statusBlocked', text: 'Expired' }
    };
    
    const statusInfo = statusStyles[status] || statusStyles.active;
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Manage Jobs</h1>
        <p className={styles.pageSubtitle}>View and manage all job postings</p>
      </div>

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
            className={`${styles.filterBtn} ${statusFilter === 'active' ? styles.active : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active ({jobs.filter(j => j.status === 'active').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.active : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({jobs.filter(j => j.status === 'pending').length})
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
              <th>Salary</th>
              <th>Type</th>
              <th>Status</th>
              <th>Posted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{job.title}</h4>
                    <p className={styles.jobDescription}>{job.description}</p>
                  </div>
                </td>
                <td>
                  <div className={styles.companyInfo}>
                    <span className={styles.companyName}>{job.company_name}</span>
                  </div>
                </td>
                <td className={styles.locationCell}>{job.location}</td>
                <td className={styles.salaryCell}>{job.salary}</td>
                <td>
                  <span className={styles.jobTypeBadge}>{job.job_type}</span>
                </td>
                <td>{getStatusBadge(job.status)}</td>
                <td className={styles.dateCell}>{formatDate(job.posted_date)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionBtn} title="View Job">
                      👁️
                    </button>
                    <button className={styles.actionBtn} title="Edit">
                      ✏️
                    </button>
                    <button className={styles.actionBtn} title="Delete">
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
          <div className={styles.emptyIcon}>📄</div>
          <h3>No jobs found</h3>
          <p>No jobs match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;