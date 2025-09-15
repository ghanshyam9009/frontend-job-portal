import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import CandidateSidebar from "../../Components/Candidate/CandidateSidebar";
import styles from "./UserDashboard.module.css";

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [savedJobs, setSavedJobs] = useState([
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      salary: "₹12L - ₹15L / year",
      location: "Remote · Worldwide",
      type: "Full-time",
      savedDate: "2024-01-15",
      status: "Active"
    },
    {
      id: 2,
      title: "Data Scientist",
      company: "DataFlow Inc",
      salary: "₹13L - ₹16L / year",
      location: "San Francisco, CA",
      type: "Full-time",
      savedDate: "2024-01-14",
      status: "Active"
    },
    {
      id: 3,
      title: "UX Designer",
      company: "DesignStudio",
      salary: "₹9L - ₹11L / year",
      location: "New York, NY",
      type: "Full-time",
      savedDate: "2024-01-13",
      status: "Expired"
    }
  ]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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
    <div className={styles.dashboardContainer}>
      <CandidateNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <CandidateSidebar darkMode={darkMode} />
      <main className={styles.main}>
        <section className={styles.jobsSection}>
          <div className={styles.jobsHeader}>
            <h2>Saved Jobs</h2>
            <p>Your bookmarked job opportunities</p>
          </div>
          
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
