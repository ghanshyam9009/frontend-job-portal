import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { recruiterExternalService } from "../../services";
import { Check, X, ArrowLeft, FileText } from "lucide-react";
import styles from "../../Styles/RecruiterDashboard.module.css";

const CandidateApplications = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedJob, setSelectedJob] = useState("All");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch all jobs first
        const jobsData = await recruiterExternalService.getAllPostedJobs(user?.employer_id || user?.id);
        const jobsList = (jobsData?.jobs || []).map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.company_name
        }));
        setJobs(jobsList);

        // Fetch applications for all jobs
        const allApplications = [];
        for (const job of jobsList) {
          try {
            const applicationsData = await recruiterExternalService.getAllApplicants(job.id);
            const jobApplications = (applicationsData.applications || []).map(app => ({
              ...app,
              job_title: job.title,
              job_id: job.id
            }));
            allApplications.push(...jobApplications);
          } catch (err) {
            console.error(`Failed to fetch applications for job ${job.id}:`, err);
          }
        }
        
        setApplications(allApplications);
      } catch (e) {
        console.error(e);
        setError(typeof e === "string" ? e : e?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpdateApplicationStatus = async (applicationId, statusBool) => {
    try {
      setLoading(true);
      await recruiterExternalService.changeApplicationStatus(applicationId, statusBool);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.application_id === applicationId 
          ? { ...app, status: statusBool ? 'Shortlisted' : 'Pending' }
          : app
      ));
      
      alert(`Application ${statusBool ? 'shortlisted' : 'moved to pending'} successfully`);
    } catch (e) {
      console.error(e);
      alert('Failed to update application status');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const statusMatch = filterStatus === "All" || app.status.toLowerCase() === filterStatus.toLowerCase();
    const jobMatch = selectedJob === "All" || app.job_id === selectedJob;
    return statusMatch && jobMatch;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return styles.statusActive;
      case 'pending':
        return styles.statusDraft;
      case 'rejected':
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
        <section className={styles.candidateApplicationsSection}>
          <div className={styles.sectionHeader}>
            <h1>Candidate Applications</h1>
            <p>View and manage all job applications</p>
          </div>

          <div className={styles.filtersSection}>
            <div className={styles.filterTabs}>
              {['All', 'Pending', 'Shortlisted', 'Rejected'].map(status => (
                <button
                  key={status}
                  className={`${styles.filterTab} ${filterStatus === status ? styles.activeFilter : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            
            <div className={styles.jobFilter}>
              <label>Filter by Job:</label>
              <select 
                value={selectedJob} 
                onChange={(e) => setSelectedJob(e.target.value)}
                className={styles.jobSelect}
              >
                <option value="All">All Jobs</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.statsSummary}>
              <span>Total Applications: {applications.length}</span>
              <span>Pending: {applications.filter(app => app.status === 'Pending').length}</span>
              <span>Shortlisted: {applications.filter(app => app.status === 'Shortlisted').length}</span>
            </div>
          </div>

          <div className={styles.applicationsList}>
            {loading && (
              <div className={styles.emptyState}><h3>Loading applications...</h3></div>
            )}
            {error && (
              <div className={styles.emptyState}><h3>{error}</h3></div>
            )}
            {filteredApplications.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><FileText size={48} /></div>
                <h3>No applications found</h3>
                <p>No applications match your current filter criteria.</p>
              </div>
            ) : (
              filteredApplications.map((application) => (
                <div key={application.application_id} className={styles.applicationCard}>
                  <div className={styles.applicationHeader}>
                    <div className={styles.applicationInfo}>
                      <h3>{application.job_title}</h3>
                      <p className={styles.studentId}>Student ID: {application.student_id}</p>
                      <p className={styles.applicationDate}>
                        Applied: {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={styles.applicationStatus}>
                      <span className={`${styles.statusBadge} ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
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
                        <FileText size={16} />
                      </a>
                    </div>
                  </div>

                  <div className={styles.applicationActions}>
                    {application.status === 'Pending' ? (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.shortlistBtn}`}
                          onClick={() => handleUpdateApplicationStatus(application.application_id, true)}
                          disabled={loading}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.rejectBtn}`}
                          onClick={() => handleUpdateApplicationStatus(application.application_id, false)}
                          disabled={loading}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : application.status === 'Shortlisted' ? (
                      <button
                        className={`${styles.actionBtn} ${styles.pendingBtn}`}
                        onClick={() => handleUpdateApplicationStatus(application.application_id, false)}
                        disabled={loading}
                      >
                        <ArrowLeft size={16} />
                      </button>
                    ) : (
                      <button
                        className={`${styles.actionBtn} ${styles.shortlistBtn}`}
                        onClick={() => handleUpdateApplicationStatus(application.application_id, true)}
                        disabled={loading}
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CandidateApplications;
