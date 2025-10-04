import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import styles from "../../Styles/AdminNavbar.module.css";
import logo from "../../assets/favicon-icon.png";

const AdminNavbar = ({ onLogout, onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
      if (onLogout) onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate('/admin/login');
    }
  };

  return (
    <header className={`${styles.header} `}>
      <div className={styles.headerLeft}>
        <button className={styles.mobileMenuBtn} onClick={onMobileMenuToggle}>
          ☰
        </button>
           <div className={styles.logo}>
                         <img src={logo} alt="JobPortal Logo" />
                         <span>Bigsources Manpower Solution</span>
                       </div>
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
        {/* <button className={styles.darkModeBtn} onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button> */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
        <div className={styles.profileSection}>
          <button className={styles.profilePicture} onClick={handleProfileClick}>
            <div className={styles.profileAvatar}>
              {(user?.name || user?.admin_name || 'Admin').charAt(0).toUpperCase()}
            </div>
          </button>
          
          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>
                  {user?.name || user?.admin_name || 'Admin User'}
                </div>
                <div className={styles.profileEmail}>
                  {user?.email || 'admin@example.com'}
                </div>
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
