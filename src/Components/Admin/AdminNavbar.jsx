import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Styles/AdminNavbar.module.css";

const AdminNavbar = ({ darkMode, toggleDarkMode, onLogout, onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
    if (onLogout) onLogout();
  };

  return (
    <header className={`${styles.header} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.headerLeft}>
        <button className={styles.mobileMenuBtn} onClick={onMobileMenuToggle}>
          ☰
        </button>
        <div className={styles.logo}>🌟 JobPortal</div>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <button className={styles.notificationBtn}>
          🔔
          <span className={styles.notificationBadge}>9</span>
        </button>
        <button className={styles.darkModeBtn} onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
        <div className={styles.profileSection}>
          <button className={styles.profilePicture} onClick={handleProfileClick}>
            <img src="https://via.placeholder.com/40" alt="Admin" />
          </button>
          
          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>Jane Doe</div>
                <div className={styles.profileEmail}>jane.doe@example.com</div>
              </div>
              <div className={styles.dropdownDivider}></div>
              <button className={styles.dropdownItem}>Profile Settings</button>
              <button className={styles.dropdownItem}>Account Settings</button>
              <button className={styles.dropdownItem} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
