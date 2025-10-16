import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import styles from "../../Styles/CandidateNavbar.module.css";
import { Sun, Moon } from "lucide-react";
import logo from "../../assets/favicon-icon.png";

const CandidateNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`${styles.header} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.headerLeft}>
        <button className={styles.menuButton} onClick={toggleSidebar}>
          ☰
        </button>
        <div className={styles.logo}>
          <img src={logo} alt="JobPortal Logo" />
          <span>Bigsources Manpower Solution</span>
        </div>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search jobs, companies..." 
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <button className={styles.notificationBtn}>
          🔔
          <span className={styles.notificationBadge}>3</span>
        </button>
        <button className={styles.themeToggle} onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className={styles.profileSection}>
          <button className={styles.profilePicture} onClick={handleProfileClick}>
            <div className={styles.avatarCircle}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>
          
          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{user?.name || 'User'}</div>
                <div className={styles.profileEmail}>{user?.email || 'user@example.com'}</div>
              </div>
              <div className={styles.dropdownDivider}></div>
              <button className={styles.dropdownItem} onClick={() => navigate('/userdashboard')}>
                Dashboard
              </button>
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

export default CandidateNavbar;
