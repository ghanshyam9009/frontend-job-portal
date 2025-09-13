import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import CandidateSidebar from "../../Components/Candidate/CandidateSidebar";
import styles from "./UserDashboard.module.css";

const AppliedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      salary: "₹12L - ₹15L / year",
      location: "Remote · Worldwide",
      type: "Full-time",
      appliedDate: "2024-01-15",
      status: "Under Review",
      applicationId: "APP-001"
    },
    {
      id: 2,
      title: "Data Scientist",
      company: "DataFlow Inc",
      salary: "₹13L - ₹16L / year",
      location: "San Francisco, CA",
      type: "Full-time",
      appliedDate: "2024-01-14",
      status: "Interview Scheduled",
      applicationId: "APP-002",
      interviewDate: "2024-01-25"
    },
    {
      id: 3,
      title: "UX Designer",
      company: "DesignStudio",
      salary: "₹9L - ₹11L / year",
      location: "New York, NY",
      type: "Full-time",
      appliedDate: "2024-01-13",
      status: "Rejected",
      applicationId: "APP-003"
    },
    {
      id: 4,
      title: "Product Manager",
      company: "InnovateCorp",
      salary: "₹14L - ₹17L / year",
      location: "Seattle, WA",
      type: "Full-time",
      appliedDate: "2024-01-12",
      status: "Offer Received",
      applicationId: "APP-004"
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'under review':
        return styles.statusReview;
      case 'interview scheduled':
        return styles.statusInterview;
      case 'offer received':
        return styles.statusOffer;
      case 'rejected':
        return styles.statusRejected;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'under review':
        return '👀';
      case 'interview scheduled':
        return '📅';
      case 'offer received':
        return '🎉';
      case 'rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <CandidateNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <CandidateSidebar darkMode={darkMode} />
      <main className={styles.main}>
        <section className={styles.jobsSection}>
          <div className={styles.jobsHeader}>
            <h2>Applied Jobs</h2>
            <p>Track the status of your job applications</p>
          </div>
          
          {appliedJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>No applications yet</h3>
              <p>Start applying to jobs to track your progress here.</p>
              <button 
                className={styles.primaryBtn}
                onClick={() => navigate('/userjoblistings')}
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className={styles.jobsGrid}>
              {appliedJobs.map(job => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobCardHeader}>
                    <div className={styles.jobIcon}>💼</div>
                    <div className={`${styles.jobStatus} ${getStatusColor(job.status)}`}>
                      <span className={styles.statusIcon}>{getStatusIcon(job.status)}</span>
                      {job.status}
                    </div>
                  </div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobCompany}>{job.company}</p>
                  <p className={styles.jobSalary}>{job.salary}</p>
                  <p className={styles.jobLocation}>{job.location}</p>
                  <div className={styles.jobMeta}>
                    <span className={styles.appliedDate}>Applied: {job.appliedDate}</span>
                    <span className={styles.applicationId}>ID: {job.applicationId}</span>
                  </div>
                  {job.interviewDate && (
                    <div className={styles.interviewInfo}>
                      <span className={styles.interviewLabel}>Interview:</span>
                      <span className={styles.interviewDate}>{job.interviewDate}</span>
                    </div>
                  )}
                  <div className={styles.jobButtons}>
                    <button 
                      className={styles.viewBtn}
                      onClick={() => handleJobClick(job)}
                    >
                      View Details
                    </button>
                    <button 
                      className={styles.trackBtn}
                      onClick={() => alert(`Tracking application ${job.applicationId}`)}
                    >
                      Track Application
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

export default AppliedJobs;
