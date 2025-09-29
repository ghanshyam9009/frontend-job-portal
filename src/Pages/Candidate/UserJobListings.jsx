import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import CandidateSidebar from "../../Components/Candidate/CandidateSidebar";
import styles from "./UserDashboard.module.css";

const UserJobListings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const jobs = [
    { id: 1, title: "Senior Frontend Developer", company: "InnovateX", salary: "₹12L - ₹15L / year", location: "Remote · Worldwide", type: "Full-time" },
    { id: 2, title: "Data Scientist (ML)", company: "Quantify Analytics", salary: "₹13L - ₹16L / year", location: "San Francisco, CA", type: "Full-time" },
    { id: 3, title: "UX/UI Designer", company: "Creative Flow", salary: "₹9L - ₹11L / year", location: "New York, NY", type: "Full-time" },
    { id: 4, title: "Backend Engineer (Node.js)", company: "ServerNest", salary: "₹11L - ₹14L / year", location: "Seattle, WA", type: "Full-time" },
    { id: 5, title: "Product Manager", company: "Visionary Solutions", salary: "₹14L - ₹17L / year", location: "Remote · Europe", type: "Full-time" },
    { id: 6, title: "DevOps Engineer", company: "CloudWorks", salary: "₹12.5L - ₹15.5L / year", location: "Austin, TX", type: "Full-time" },
    { id: 7, title: "Mobile App Developer", company: "AppDenim", salary: "₹10.5L - ₹13.5L / year", location: "Remote · Asia", type: "Full-time" },
    { id: 8, title: "Cybersecurity Analyst", company: "SecureNet", salary: "₹9.5L - ₹12L / year", location: "Boston, MA", type: "Full-time" },
  ];

  const handleJobClick = (job) => {
    navigate(`/job/${job.title.toLowerCase().replace(/\s+/g, '-')}`, {
      state: { job }
    });
  };

  return (
    <div className={styles.dashboardContainer}>
      <CandidateNavbar toggleSidebar={toggleSidebar} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <CandidateSidebar darkMode={darkMode} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>

        <section className={styles.jobsSection}>
          <div className={styles.jobsHeader}>
            <h2>Available Jobs</h2>
            <p>Discover your next career opportunity</p>
          </div>
          
          <div className={styles.jobsGrid}>
            {jobs.map(job => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobCardHeader}>
                  <div className={styles.jobIcon}>💼</div>
                  <div className={styles.jobType}>{job.type}</div>
                </div>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <p className={styles.jobCompany}>{job.company}</p>
                <p className={styles.jobSalary}>{job.salary}</p>
                <p className={styles.jobLocation}>{job.location}</p>
                <button 
                  className={styles.viewBtn}
                  onClick={() => handleJobClick(job)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserJobListings;
