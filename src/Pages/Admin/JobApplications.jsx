import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { adminExternalService } from "../../services";
import styles from "../../Styles/AdminDashboard.module.css";

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const applicationsPerPage = 10;

  // Fetch applications data
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const applicationsData = await adminService.getJobApplications();
        setApplications(applicationsData);
        setFilteredApplications(applicationsData);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  // Filter applications based on search and status
  useEffect(() => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, applications]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { class: 'statusInProgress', text: 'Pending Review' },
      approved: { class: 'statusActive', text: 'Approved' },
      rejected: { class: 'statusBlocked', text: 'Rejected' }
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

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleApprove = async (applicationId) => {
    try {
      await adminService.approveApplication(applicationId);
      // If application has an external task_id, call production approval endpoint
      const app = applications.find(a => a.id === applicationId);
      if (app?.task_id) {
        try {
          await adminExternalService.approveApplicationStatusChanged(app.task_id);
        } catch (e) {
          console.error('External approval failed:', e);
        }
      }
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: 'approved' } : app
      ));
      alert('Application approved and sent to recruiter!');
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert('Failed to approve application. Please try again.');
    }
  };

  const handleReject = async (applicationId) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        await adminService.rejectApplication(applicationId);
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status: 'rejected' } : app
        ));
        alert('Application rejected.');
      } catch (error) {
        console.error('Failed to reject application:', error);
        alert('Failed to reject application. Please try again.');
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);
  const startIndex = (currentPage - 1) * applicationsPerPage;
  const endIndex = startIndex + applicationsPerPage;
  const currentApplications = filteredApplications.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading job applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Job Applications</h1>
        <p className={styles.pageSubtitle}>Review and manage job applications from candidates</p>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by candidate name, job title, or company..."
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
            All ({applications.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.active : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'approved' ? styles.active : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approved ({applications.filter(a => a.status === 'approved').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'rejected' ? styles.active : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job Position</th>
              <th>Company</th>
              <th>Experience</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentApplications.map((application) => (
              <tr key={application.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {application.candidate_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.userName}>{application.candidate_name}</div>
                      <div className={styles.userEmail}>{application.candidate_email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{application.job_title}</h4>
                  </div>
                </td>
                <td>
                  <span className={styles.companyName}>{application.company_name}</span>
                </td>
                <td>{application.experience}</td>
                <td className={styles.dateCell}>{formatDate(application.application_date)}</td>
                <td>{getStatusBadge(application.status)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={() => handleViewApplication(application)}
                      className={`${styles.actionBtn} ${styles.viewBtn}`}
                      title="View Application"
                    >
                      👁️
                    </button>
                    {application.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(application.id)}
                          className={`${styles.actionBtn} ${styles.approveBtn}`}
                          title="Approve Application"
                        >
                          ✅
                        </button>
                        <button 
                          onClick={() => handleReject(application.id)}
                          className={`${styles.actionBtn} ${styles.rejectBtn}`}
                          title="Reject Application"
                        >
                          ❌
                        </button>
                      </>
                    )}
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

      {filteredApplications.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No applications found</h3>
          <p>No job applications match your current filters.</p>
        </div>
      )}

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Application Details</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => {
                  setShowModal(false);
                  setSelectedApplication(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.applicationDetails}>
                <div className={styles.detailSection}>
                  <h4>Candidate Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Name:</label>
                      <span>{selectedApplication.candidate_name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Email:</label>
                      <span>{selectedApplication.candidate_email}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Phone:</label>
                      <span>{selectedApplication.candidate_phone}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Experience:</label>
                      <span>{selectedApplication.experience}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Job Information</h4>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <label>Position:</label>
                      <span>{selectedApplication.job_title}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Company:</label>
                      <span>{selectedApplication.company_name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Applied Date:</label>
                      <span>{formatDate(selectedApplication.application_date)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Status:</label>
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Skills</h4>
                  <div className={styles.skillsContainer}>
                    {selectedApplication.skills.map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Cover Letter</h4>
                  <div className={styles.coverLetter}>
                    {selectedApplication.cover_letter}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Resume</h4>
                  <a 
                    href={selectedApplication.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.resumeLink}
                  >
                    📄 View Resume
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => {
                  setShowModal(false);
                  setSelectedApplication(null);
                }}
              >
                Close
              </button>
              {selectedApplication.status === 'pending' && (
                <>
                  <button 
                    className={styles.rejectBtn}
                    onClick={() => {
                      handleReject(selectedApplication.id);
                      setShowModal(false);
                      setSelectedApplication(null);
                    }}
                  >
                    Reject
                  </button>
                  <button 
                    className={styles.saveBtn}
                    onClick={() => {
                      handleApprove(selectedApplication.id);
                      setShowModal(false);
                      setSelectedApplication(null);
                    }}
                  >
                    Approve & Send to Recruiter
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;



