import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import styles from "../../Styles/Membership.module.css";

const MembershipTokens = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className={styles.dashboardContainer}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <RecruiterSidebar darkMode={darkMode} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Membership Options</h1>
          <p className={styles.subtitle}>Choose the plan that's right for you, or pay per post.</p>
        </div>
        <div className={styles.plansContainer}>
          <div className={`${styles.planCard} ${styles.silver}`}>
            <h2 className={styles.planTitle}>Pay Per Post</h2>
            <p className={styles.planPrice}>₹300<span>/post</span></p>
            <ul className={styles.planFeatures}>
              <li>Single Job Post</li>
              <li>Post is live for 30 days</li>
              <li>Basic Company Profile</li>
              <li>Email Support</li>
            </ul>
            <button className={styles.planButton}>Purchase</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MembershipTokens;
