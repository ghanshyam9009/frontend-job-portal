import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [currentTheme, setCurrentTheme] = useState(theme);
  const dropdownRef = useRef(null);

  // Listen for theme changes and force re-render
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail);
    };

    window.addEventListener('themeChanged', handleThemeChange);

    // Also check localStorage on mount
    const storedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(storedTheme);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    // Force immediate update
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
  };

  return (
    <header className={`${styles.header} ${currentTheme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.headerLeft}>
        <button className={styles.menuButton} onClick={toggleSidebar}>
          ☰
        </button>
        <div className={styles.logo}>
          <Link to="/">
            <img src={logo} alt="JobPortal Logo" />
          </Link>
          Big<span style={{ color: '#4f72ab' }}>sources</span>.in
        </div>
      </div>
      
      <div className={styles.headerRight}>
        {/* <button className={styles.notificationBtn}>
          🔔
          <span className={styles.notificationBadge}>3</span>
        </button> */}
        <button className={styles.themeToggle} onClick={handleThemeToggle}>
          {currentTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className={styles.profileSection} ref={dropdownRef}>
          <button className={styles.profilePicture} onClick={handleProfileClick}>
            <div className={styles.avatarCircle}>
              {(user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate').charAt(0)?.toUpperCase() || 'C'}
            </div>
          </button>

          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate'}</div>
                <div className={styles.profileEmail}>{user?.email || 'user@example.com'}</div>
              </div>
              <div className={styles.dropdownDivider}></div>
              <button className={styles.dropdownItem} onClick={() => { navigate('/userdashboard'); setShowProfileDropdown(false); }}>
                Dashboard
              </button>
              <button className={styles.dropdownItem} onClick={() => { navigate('/profile'); setShowProfileDropdown(false); }}>Profile Settings</button>
              <button className={styles.dropdownItem} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CandidateNavbar;
