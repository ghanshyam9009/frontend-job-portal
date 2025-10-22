import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { recruiterExternalService } from "../../services";
import styles from "../../Styles/RecruiterDashboard.module.css";

const ShortlistCandidates = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState("All");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchShortlistedCandidates = async () => {
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

        // Fetch applications for all jobs and filter shortlisted ones
        const allShortlistedCandidates = [];
        for (const job of jobsList) {
          try {
            const applicationsData = await recruiterExternalService.getAllApplicants(job.id);
            const shortlistedApps = (applicationsData.applications || [])
              .filter(app => app.status === 'Shortlisted')
              .map(app => ({
                ...app,
                job_title: job.title,
                job_id: job.id
              }));
            allShortlistedCandidates.push(...shortlistedApps);
          } catch (err) {
            console.error(`Failed to fetch applications for job ${job.id}:`, err);
          }
        }
        
        setShortlistedCandidates(allShortlistedCandidates);
      } catch (e) {
        console.error(e);
        setError(typeof e === "string" ? e : e?.message || "Failed to load shortlisted candidates");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchShortlistedCandidates();
    }
  }, [user]);

  const handleUpdateApplicationStatus = async (applicationId, statusBool) => {
    try {
      setLoading(true);
      await recruiterExternalService.changeApplicationStatus(applicationId, statusBool);
      
      // Update local state
      setShortlistedCandidates(prev => prev.map(app => 
        app.application_id === applicationId 
          ? { ...app, status: statusBool ? 'Shortlisted' : 'Pending' }
          : app
      ));
      
      // Remove from shortlisted if moved to pending
      if (!statusBool) {
        setShortlistedCandidates(prev => prev.filter(app => app.application_id !== applicationId));
      }
      
      alert(`Candidate ${statusBool ? 'remains shortlisted' : 'moved to pending'} successfully`);
    } catch (e) {
      console.error(e);
      alert('Failed to update candidate status');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = selectedJob === "All" 
    ? shortlistedCandidates 
    : shortlistedCandidates.filter(candidate => candidate.job_id === selectedJob);

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <RecruiterSidebar darkMode={theme === 'dark'} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={styles.main}>
        <section className={styles.shortlistCandidatesSection}>
          <div className={styles.sectionHeader}>
            <h1>Shortlisted Candidates</h1>
            <p>View and manage your shortlisted candidates</p>
          </div>

          <div className={styles.filtersSection}>
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
              <span>Total Shortlisted: {shortlistedCandidates.length}</span>
              <span>From {jobs.length} Jobs</span>
            </div>
          </div>

          <div className={styles.candidatesList}>
            {loading && (
              <div className={styles.emptyState}><h3>Loading shortlisted candidates...</h3></div>
            )}
            {error && (
              <div className={styles.emptyState}><h3>{error}</h3></div>
            )}
            {filteredCandidates.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>⭐</div>
                <h3>No shortlisted candidates</h3>
                <p>
                  {selectedJob === "All" 
                    ? "You haven't shortlisted any candidates yet. Go to applications to shortlist candidates."
                    : "No candidates have been shortlisted for this job yet."
                  }
                </p>
              </div>
            ) : (
              filteredCandidates.map((candidate) => (
                <div key={candidate.application_id} className={styles.candidateCard}>
                  <div className={styles.candidateHeader}>
                    <div className={styles.candidateInfo}>
                      <h3>{candidate.job_title}</h3>
                      <p className={styles.studentId}>Student ID: {candidate.student_id}</p>
                      <p className={styles.applicationDate}>
                        Applied: {new Date(candidate.created_at).toLocaleDateString()}
                      </p>
                      <p className={styles.shortlistedDate}>
                        Shortlisted: {new Date(candidate.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={styles.candidateStatus}>
                      <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                        ✓ Shortlisted
                      </span>
                    </div>
                  </div>

                  <div className={styles.candidateDetails}>
                    <div className={styles.coverLetter}>
                      <h5>Cover Letter:</h5>
                      <p>{candidate.cover_letter}</p>
                    </div>
                    <div className={styles.resumeSection}>
                      <h5>Resume:</h5>
                      <a 
                        href={candidate.resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.resumeLink}
                      >
                        📄 View Resume
                      </a>
                    </div>
                  </div>

                  <div className={styles.candidateActions}>
                    <button 
                      className={`${styles.actionBtn} ${styles.contactBtn}`}
                      onClick={() => alert('Contact functionality will be implemented')}
                    >
                      📧 Contact Candidate
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.interviewBtn}`}
                      onClick={() => alert('Interview scheduling will be implemented')}
                    >
                      📅 Schedule Interview
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.pendingBtn}`}
                      onClick={() => handleUpdateApplicationStatus(candidate.application_id, false)}
                      disabled={loading}
                    >
                      ↩️ Remove from Shortlist
                    </button>
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

export default ShortlistCandidates;