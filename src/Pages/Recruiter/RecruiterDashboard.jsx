import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import styles from "../../Styles/RecruiterDashboard.module.css";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const stats = {
    totalJobs: 15,
    activeJobs: 8,
    totalApplications: 124,
    shortlistedCandidates: 23,
    interviewsScheduled: 7,
    hired: 3
  };

  const recentApplications = [
    {
      id: 1,
      candidateName: "John Smith",
      jobTitle: "Senior Frontend Developer",
      appliedDate: "2024-01-15",
      status: "Under Review",
      experience: "5 years"
    },
    {
      id: 2,
      candidateName: "Sarah Johnson",
      jobTitle: "UX Designer",
      appliedDate: "2024-01-14",
      status: "Shortlisted",
      experience: "3 years"
    },
    {
      id: 3,
      candidateName: "Mike Chen",
      jobTitle: "Backend Engineer",
      appliedDate: "2024-01-13",
      status: "Interview Scheduled",
      experience: "6 years"
    },
    {
      id: 4,
      candidateName: "Emily Davis",
      jobTitle: "Product Manager",
      appliedDate: "2024-01-12",
      status: "Rejected",
      experience: "4 years"
    }
  ];

  const quickActions = [
    {
      title: "Post New Job",
      description: "Create and publish a new job posting",
      icon: "➕",
      action: () => navigate('/post-job')
    },
    {
      title: "View Applications",
      description: "Review candidate applications",
      icon: "👥",
      action: () => navigate('/candidate-applications')
    },
    {
      title: "Shortlist Candidates",
      description: "Manage your candidate shortlist",
      icon: "⭐",
      action: () => navigate('/shortlist-candidates')
    },
    {
      title: "Company Profile",
      description: "Update your company information",
      icon: "🏢",
      action: () => navigate('/company-profile')
    }
  ];

  return (
    <div className={styles.dashboardContainer}>
      <RecruiterNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <RecruiterSidebar darkMode={darkMode} />
      <main className={styles.main}>
        <section className={styles.dashboardHeader}>
          <div className={styles.welcomeSection}>
            <h1>Welcome back, {user?.companyName || 'Recruiter'}!</h1>
            <p>Here's what's happening with your job postings and candidates.</p>
          </div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📄</div>
              <div className={styles.statInfo}>
                <h3>{stats.totalJobs}</h3>
                <p>Total Jobs Posted</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🟢</div>
              <div className={styles.statInfo}>
                <h3>{stats.activeJobs}</h3>
                <p>Active Jobs</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statInfo}>
                <h3>{stats.totalApplications}</h3>
                <p>Total Applications</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⭐</div>
              <div className={styles.statInfo}>
                <h3>{stats.shortlistedCandidates}</h3>
                <p>Shortlisted</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statInfo}>
                <h3>{stats.interviewsScheduled}</h3>
                <p>Interviews Scheduled</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎉</div>
              <div className={styles.statInfo}>
                <h3>{stats.hired}</h3>
                <p>Hired</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className={styles.contentGrid}>
            <div className={styles.recentApplications}>
              <div className={styles.sectionHeader}>
                <h2>Recent Applications</h2>
                <button 
                  className={styles.viewAllBtn}
                  onClick={() => navigate('/candidate-applications')}
                >
                  View All
                </button>
              </div>
              <div className={styles.applicationsList}>
                {recentApplications.map((application) => (
                  <div key={application.id} className={styles.applicationCard}>
                    <div className={styles.applicationHeader}>
                      <div className={styles.candidateInfo}>
                        <h4>{application.candidateName}</h4>
                        <p>{application.jobTitle}</p>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[application.status.toLowerCase().replace(' ', '')]}`}>
                        {application.status}
                      </span>
                    </div>
                    <div className={styles.applicationDetails}>
                      <span className={styles.experience}>{application.experience} experience</span>
                      <span className={styles.appliedDate}>Applied {application.appliedDate}</span>
                    </div>
                    <div className={styles.applicationActions}>
                      <button className={styles.viewResumeBtn}>View Resume</button>
                      <button className={styles.contactBtn}>Contact</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.quickActions}>
              <h2>Quick Actions</h2>
              <div className={styles.actionsGrid}>
                {quickActions.map((action, index) => (
                  <div key={index} className={styles.actionCard} onClick={action.action}>
                    <div className={styles.actionIcon}>{action.icon}</div>
                    <div className={styles.actionContent}>
                      <h3>{action.title}</h3>
                      <p>{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
