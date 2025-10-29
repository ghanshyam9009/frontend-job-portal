import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import styles from "./UserDashboard.module.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleQuickAction = (action) => {
    switch (action) {
      case 'jobs':
        navigate('/userjoblistings');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'saved':
        navigate('/saved-jobs');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.dark : ''}`}>
      <section className={styles.kpis}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>Saved Jobs</div>
          <div className={styles.kpiValue}>12</div>
          <div className={styles.kpiFoot}>From all job listings</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>Applied Jobs</div>
          <div className={styles.kpiValue}>5</div>
          <div className={styles.kpiFoot}>Applications submitted</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>Active Plan</div>
          <div className={styles.kpiValue}>Pro Member</div>
          <div className={styles.kpiFoot}>Next billing in 25 days</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>Profile Completion</div>
          <div className={styles.kpiValue}>75%</div>
          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: "75%" }} />
          </div>
          <div className={styles.kpiFoot}>Update your details</div>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.quickActions}>
          <h3>Quick Actions</h3>
          <ul>
            <li>
              <button
                className={styles.qaItem}
                onClick={() => handleQuickAction('jobs')}
              >
                Find New Jobs
              </button>
            </li>
            <li>
              <button
                className={styles.qaItem}
                onClick={() => handleQuickAction('profile')}
              >
                Update Profile
              </button>
            </li>
            <li>
              <button
                className={styles.qaItem}
                onClick={() => handleQuickAction('saved')}
              >
                View Saved Jobs
              </button>
            </li>
            <li>
              <button
                className={styles.qaItem}
                onClick={() => handleQuickAction('settings')}
              >
                Settings
              </button>
            </li>
          </ul>
        </div>

        <div className={styles.recentActivity}>
          <h3>Recent Activity</h3>
          <ul className={styles.activityList}>
            <li>
              Applied to Senior React Developer at Tech Solutions Inc.
              <span className={styles.meta}>2 hours ago</span>
              <span className={styles.badge}>New</span>
            </li>
            <li>
              Recruiter viewed your profile for Marketing Manager role.
              <span className={styles.meta}>Yesterday</span>
              <span className={styles.badgeMuted}>Viewed</span>
            </li>
            <li>
              Saved 'Software Engineer' job at Innovate Corp.
              <span className={styles.meta}>2 days ago</span>
              <span className={styles.badgeMuted}>Saved</span>
            </li>
            <li>
              Application status updated for Product Designer role: Interview Scheduled.
              <span className={styles.meta}>3 days ago</span>
              <span className={styles.badge}>Update</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
