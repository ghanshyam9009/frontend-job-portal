import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { useTheme } from "../../Contexts/ThemeContext";
import styles from "../../Styles/RecruiterDashboard.module.css";
import { recruiterExternalService } from "../../services";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState({});
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("All");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const employerId = user?.employer_id || user?.id || "emp-12345";
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await recruiterExternalService.getAllPostedJobs(employerId);
        const allJobs = data?.jobs || [];
        
        // Filter only approved jobs
        const approvedJobs = allJobs.filter(job => job.status === 'approved' || job.status === 'Open');
        
        const mapped = approvedJobs.map((j) => ({
          id: j.job_id,
          title: j.job_title,
          company: j.company_name || "",
          location: j.location || "",
          type: j.employment_type || "",
          salary: j.salary_range ? `₹${Math.round(j.salary_range.min/100000)}L - ₹${Math.round(j.salary_range.max/100000)}L` : "",
          status: (j.status || "Open").toLowerCase() === "open" ? "Active" : j.status,
          postedDate: (j.created_at || "").split("T")[0] || "",
          applications: 0,
          views: 0
        }));
        setJobs(mapped);
      } catch (e) {
        console.error(e);
        setError(typeof e === "string" ? e : e?.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user]);

  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      setJobs(prev => prev.filter(job => job.id !== jobId));
      alert("Job deleted successfully!");
    }
  };

  const handleDuplicateJob = (jobId) => {
    const jobToDuplicate = jobs.find(job => job.id === jobId);
    if (jobToDuplicate) {
      const duplicatedJob = {
        ...jobToDuplicate,
        id: Date.now(),
        title: `${jobToDuplicate.title} (Copy)`,
        status: "Draft",
        postedDate: new Date().toISOString().split('T')[0],
        applications: 0,
        views: 0
      };
      setJobs(prev => [...prev, duplicatedJob]);
      alert("Job duplicated successfully!");
    }
  };

  const handleToggleStatus = async (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    if (job.status === 'Active') {
      try {
        setLoading(true);
        await recruiterExternalService.closeJobOpening(jobId);
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Closed' } : j));
        alert('Job closed successfully');
      } catch (e) {
        console.error(e);
        alert('Failed to close job');
      } finally {
        setLoading(false);
      }
    } else {
      // No reopen API provided; keep local toggle if needed
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Active' } : j));
    }
  };

  const handleViewApplications = async (jobId) => {
    try {
      setApplicationsLoading(true);
      setSelectedJobId(jobId);
      const applicationsData = await recruiterExternalService.getAllApplicants(jobId);
      setApplications(prev => ({
        ...prev,
        [jobId]: applicationsData.applications || []
      }));
      setShowApplicationsModal(true);
    } catch (e) {
      console.error(e);
      alert('Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, statusBool) => {
    try {
      setLoading(true);
      await recruiterExternalService.changeApplicationStatus(applicationId, statusBool);
      
      // Update local state
      const jobApplications = applications[selectedJobId] || [];
      const updatedApplications = jobApplications.map(app => 
        app.application_id === applicationId 
          ? { ...app, status: statusBool ? 'Shortlisted' : 'Pending' }
          : app
      );
      
      setApplications(prev => ({
        ...prev,
        [selectedJobId]: updatedApplications
      }));
      
      alert(`Application ${statusBool ? 'shortlisted' : 'moved to pending'} successfully`);
    } catch (e) {
      console.error(e);
      alert('Failed to update application status');
    } finally {
      setLoading(false);
    }
  };

  const closeApplicationsModal = () => {
    setShowApplicationsModal(false);
    setSelectedJobId(null);
  };

  const filteredJobs = filterStatus === "All" 
    ? jobs 
    : jobs.filter(job => job.status.toLowerCase() === filterStatus.toLowerCase());

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return styles.statusActive;
      case 'draft':
        return styles.statusDraft;
      case 'closed':
        return styles.statusClosed;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <RecruiterSidebar darkMode={theme === 'dark'} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <section className={styles.manageJobsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h1>Manage Posted Jobs</h1>
              <p>View, edit, and manage your job postings</p>
            </div>
            <button 
              className={styles.postNewJobBtn}
              onClick={() => navigate('/post-job')}
            >
              Post New Job
            </button>
          </div>

          <div className={styles.filtersSection}>
            <div className={styles.filterTabs}>
              {['All', 'Active', 'Draft', 'Closed'].map(status => (
                <button
                  key={status}
                  className={`${styles.filterTab} ${filterStatus === status ? styles.activeFilter : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className={styles.statsSummary}>
              <span>Total Jobs: {jobs.length}</span>
              <span>Active: {jobs.filter(job => job.status === 'Active').length}</span>
              <span>Total Applications: {jobs.reduce((sum, job) => sum + job.applications, 0)}</span>
            </div>
          </div>

          <div className={styles.jobsList}>
            {loading && (
              <div className={styles.emptyState}><h3>Loading jobs…</h3></div>
            )}
            {error && (
              <div className={styles.emptyState}><h3>{error}</h3></div>
            )}
            {filteredJobs.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📄</div>
                <h3>No jobs found</h3>
                <p>No jobs match your current filter criteria.</p>
                <button 
                  className={styles.primaryBtn}
                  onClick={() => navigate('/post-job')}
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              filteredJobs.map(job => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <div className={styles.jobMeta}>
                        <span className={styles.company}>{job.company}</span>
                        <span className={styles.location}>📍 {job.location}</span>
                        <span className={styles.type}>{job.type}</span>
                        <span className={styles.salary}>💰 {job.salary}</span>
                      </div>
                    </div>
                    <div className={styles.jobStatus}>
                      <span className={`${styles.statusBadge} ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>

                  <div className={styles.jobStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{job.applications}</span>
                      <span className={styles.statLabel}>Applications</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{job.views}</span>
                      <span className={styles.statLabel}>Views</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{job.postedDate}</span>
                      <span className={styles.statLabel}>Posted</span>
                    </div>
                  </div>

                  <div className={styles.jobActions}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleEditJob(job.id)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleViewApplications(job.id)}
                    >
                      👥 Applications ({job.applications})
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleDuplicateJob(job.id)}
                    >
                      📋 Duplicate
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleToggleStatus(job.id)}
                    >
                      {job.status === 'Active' ? '🔄 Close' : '🔄 Reopen'}
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className={styles.modalOverlay} onClick={closeApplicationsModal}>
          <div className={styles.modalContent} style={{ maxWidth: '800px', width: '95%' }}>
            <div className={styles.modalHeader}>
              <h2>Job Applications</h2>
              <button 
                className={styles.closeButton}
                onClick={closeApplicationsModal}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {applicationsLoading ? (
                <div className={styles.loadingContainer}>
                  <h3>Loading applications...</h3>
                </div>
              ) : (
                <div className={styles.applicationsList}>
                  {applications[selectedJobId]?.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No applications found for this job.</p>
                    </div>
                  ) : (
                    applications[selectedJobId]?.map((application) => (
                      <div key={application.application_id} className={styles.applicationCard}>
                        <div className={styles.applicationHeader}>
                          <div className={styles.applicationInfo}>
                            <h4>Student ID: {application.student_id}</h4>
                            <p className={styles.applicationDate}>
                              Applied: {new Date(application.created_at).toLocaleDateString()}
                            </p>
                            <p className={styles.applicationStatus}>
                              Status: <span className={`${styles.statusBadge} ${application.status === 'Shortlisted' ? styles.statusActive : styles.statusDefault}`}>
                                {application.status}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className={styles.applicationDetails}>
                          <div className={styles.coverLetter}>
                            <h5>Cover Letter:</h5>
                            <p>{application.cover_letter}</p>
                          </div>
                          <div className={styles.resumeSection}>
                            <h5>Resume:</h5>
                            <a 
                              href={application.resume_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.resumeLink}
                            >
                              📄 View Resume
                            </a>
                          </div>
                        </div>
                        <div className={styles.applicationActions}>
                          {application.status === 'Pending' ? (
                            <button 
                              className={`${styles.actionBtn} ${styles.shortlistBtn}`}
                              onClick={() => handleUpdateApplicationStatus(application.application_id, true)}
                              disabled={loading}
                            >
                              ✓ Shortlist
                            </button>
                          ) : (
                            <button 
                              className={`${styles.actionBtn} ${styles.pendingBtn}`}
                              onClick={() => handleUpdateApplicationStatus(application.application_id, false)}
                              disabled={loading}
                            >
                              ↩️ Move to Pending
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.okButton}
                onClick={closeApplicationsModal}
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

export default ManageJobs;
