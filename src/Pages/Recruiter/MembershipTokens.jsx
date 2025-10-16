import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import styles from "../../Styles/RecruiterDashboard.module.css";

const MembershipTokens = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <RecruiterSidebar darkMode={theme === 'dark'} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <section className={styles.membershipTokensSection}>
          <div className={styles.sectionHeader}>
            <h1>Membership & Tokens</h1>
            <p>Manage your subscription and token balance</p>
          </div>

          <div className={styles.tokenBalanceCard}>
            <div className={styles.balanceInfo}>
              <h2>Your Current Balance</h2>
              <div className={styles.balanceAmount}>
                <span className={styles.balanceNumber}>15</span>
                <span className={styles.balanceLabel}>Tokens</span>
              </div>
              <p className={styles.lastUpdated}>Last updated: 2024-01-15</p>
            </div>
            <div className={styles.balanceIcon}>
              <div className={styles.tokenIcon}>🪙</div>
            </div>
          </div>

          <div className={styles.tokenPacksSection}>
            <div className={styles.sectionTitle}>
              <h2>Purchase Token Packs</h2>
              <p>One-time purchase of tokens for job postings and other features.</p>
            </div>
            <div className={styles.tokenPacksGrid}>
              {/* Token Pack Cards */}
            </div>
          </div>

          <div className={styles.subscriptionPlansSection}>
            <div className={styles.sectionTitle}>
              <h2>Subscription Plans</h2>
              <p>Get the best value with a monthly or annual subscription.</p>
            </div>
            <div className={styles.subscriptionPlansGrid}>
              {/* Subscription Plan Cards */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MembershipTokens;
