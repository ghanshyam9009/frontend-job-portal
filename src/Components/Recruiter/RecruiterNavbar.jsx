import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services";
import styles from "./RecruiterNavbar.module.css";
import logo from "../../assets/favicon-icon.png";
import { Sun, Moon } from "lucide-react";
const RecruiterNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const profileRef = useRef(null);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
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

  useEffect(() => {
    const fetchRecruiterProfile = async () => {
      if (user?.employer_id || user?.id) {
        try {
          const profile = await recruiterExternalService.getRecruiterProfile(user.employer_id || user.id);
          setRecruiterProfile(profile);
        } catch (err) {
          console.error('Failed to fetch recruiter profile:', err);
        }
      }
    };

    fetchRecruiterProfile();
  }, [user?.employer_id, user?.id]);

  return (
    <header className={`${styles.header} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.headerLeft}>
        <button className={styles.menuButton} onClick={toggleSidebar}>
          ☰
        </button>
        <div className={styles.logo}>
            <img src={logo} alt="JobPortal Logo" />
          <Link to="/">
          </Link>
          Big<span style={{ color: '#4f72ab' }}>sources</span>.in
        </div>
      
      </div>
      
      <div className={styles.headerRight}>
        {/* <button className={styles.notificationBtn}>
          🔔
          <span className={styles.notificationBadge}>5</span>
        </button> */}
        <button className={styles.themeToggle} onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <div className={styles.profileSection} ref={profileRef}>
          <button className={styles.profilePicture} onClick={handleProfileClick}>
            <div className={styles.avatarCircle}>
              {recruiterProfile?.name?.charAt(0)?.toUpperCase() || 'R'}
            </div>
          </button>

          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{recruiterProfile?.company_name || 'Company'}</div>
                <div className={styles.profileEmail}>{user?.email || 'company@example.com'}</div>
              </div>
              <div className={styles.dropdownDivider}></div>
              <button className={styles.dropdownItem} onClick={() => navigate('/recruiter/dashboard')}>
                Dashboard
              </button>
              <button className={styles.dropdownItem} onClick={() => navigate('/company-profile')}>
                Company Profile
              </button>
              <button className={styles.dropdownItem} onClick={() => navigate('/settings')}>
                Settings
              </button>
              <button className={styles.dropdownItem} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default RecruiterNavbar;
