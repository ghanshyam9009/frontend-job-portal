import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import styles from "./UserDashboard.module.css";
import { candidateExternalService } from "../../services";

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = user?.user_id || user?.id || '';
    if (!userId) return;
    const fetchSaved = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await candidateExternalService.getBookmarkedJobs(userId);
        const mapped = (data?.bookmarked_jobs || data?.jobs || []).map((j, idx) => ({
          id: j.job_id || idx,
          title: j.job_title,
          company: j.company_name || "",
          salary: j.salary_range ? `₹${j.salary_range.min} - ₹${j.salary_range.max}` : "",
          location: j.location || "",
          type: j.employment_type || "",
          savedDate: j.saved_at ? j.saved_at.split('T')[0] : '',
          status: (j.status || 'Active')
        }));
        setSavedJobs(mapped);
      } catch (e) {
        setError(typeof e === 'string' ? e : e?.message || 'Failed to load saved jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [user]);

  const handleJobClick = (job) => {
    navigate(`/job/${job.title.toLowerCase().replace(/\s+/g, '-')}`, {
      state: { job }
    });
  };

  const handleRemoveSaved = (jobId) => {
    setSavedJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleApplyNow = (job) => {
    // Check membership first
    if (!user?.membership || user?.membership === 'free') {
      alert("You need a premium membership to apply for jobs. Redirecting to membership plans...");
      navigate('/membership');
      return;
    }
    
    // If has membership, proceed with application
    alert(`Application submitted for ${job.title} at ${job.company}`);
    // Here you would handle the actual application logic
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <CandidateNavbar darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <main className={styles.main}>
        <section className={styles.jobsSection}>
          <div className={styles.jobsHeader}>
            <h2>Saved Jobs</h2>
            <p>Your bookmarked job opportunities</p>
          </div>
          
          {loading && (
            <div className={styles.emptyState}><h3>Loading saved jobs…</h3></div>
          )}
          {error && (
            <div className={styles.emptyState}><h3>{error}</h3></div>
          )}
          {savedJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⭐</div>
              <h3>No saved jobs yet</h3>
              <p>Start saving jobs you're interested in to see them here.</p>
              <button 
                className={styles.primaryBtn}
                onClick={() => navigate('/userjoblistings')}
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className={styles.jobsGrid}>
              {savedJobs.map(job => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobCardHeader}>
                    <div className={styles.jobIcon}>💼</div>
                    <div className={styles.jobActions}>
                      <button 
                        className={styles.removeBtn}
                        onClick={() => handleRemoveSaved(job.id)}
                        title="Remove from saved"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobCompany}>{job.company}</p>
                  <p className={styles.jobSalary}>{job.salary}</p>
                  <p className={styles.jobLocation}>{job.location}</p>
                  <div className={styles.jobMeta}>
                    <span className={styles.savedDate}>Saved: {job.savedDate}</span>
                    <span className={`${styles.jobStatus} ${styles[job.status.toLowerCase()]}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className={styles.jobButtons}>
                    <button 
                      className={styles.viewBtn}
                      onClick={() => handleJobClick(job)}
                    >
                      View Details
                    </button>
                    <button 
                      className={styles.applyBtn}
                      onClick={() => handleApplyNow(job)}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SavedJobs;
