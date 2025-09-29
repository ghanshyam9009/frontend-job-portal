import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import styles from '../../Styles/AdminDashboard.module.css';

const PendingJobs = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingJobs = async () => {
      try {
        const jobs = await adminService.getPendingJobs();
        setPendingJobs(jobs);
      } catch (err) {
        setError('Failed to fetch pending jobs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingJobs();
  }, []);

  const handleApprove = async (jobId) => {
    try {
      await adminService.approveJob(jobId);
      setPendingJobs(pendingJobs.filter(job => job.id !== jobId));
    } catch (err) {
      setError('Failed to approve job.');
      console.error(err);
    }
  };

  const handleReject = async (jobId) => {
    try {
      await adminService.rejectJob(jobId);
      setPendingJobs(pendingJobs.filter(job => job.id !== jobId));
    } catch (err) {
      setError('Failed to reject job.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading pending jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Error Loading Jobs</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Pending Job Approvals</h1>
        <p className={styles.pageSubtitle}>Review and approve job postings from employers</p>
      </div>

      {pendingJobs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✅</div>
          <h3>All caught up!</h3>
          <p>No pending jobs to review at the moment.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Salary</th>
                <th>Type</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingJobs.map(job => (
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
                  <td className={styles.dateCell}>{job.posted_date}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        onClick={() => handleApprove(job.id)} 
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        title="Approve Job"
                      >
                        ✅
                      </button>
                      <button 
                        onClick={() => handleReject(job.id)} 
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        title="Reject Job"
                      >
                        ❌
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.viewBtn}`}
                        title="View Details"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingJobs;
