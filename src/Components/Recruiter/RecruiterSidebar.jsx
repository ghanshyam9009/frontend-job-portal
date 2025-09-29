import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import styles from "./RecruiterSidebar.module.css";

const RecruiterSidebar = ({ darkMode, isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      path: '/recruiter/dashboard'
    },
    {
      id: 'post-job',
      label: 'Post Job',
      icon: '➕',
      path: '/post-job'
    },
    {
      id: 'manage-jobs',
      label: 'Manage Posted Jobs',
      icon: '📄',
      path: '/manage-jobs'
    },
    {
      id: 'applications',
      label: 'Candidate Applications',
      icon: '👥',
      path: '/candidate-applications',
      badge: 12
    },
    {
      id: 'shortlist',
      label: 'Shortlist Candidates',
      icon: '⭐',
      path: '/shortlist-candidates'
    },
    {
      id: 'profile',
      label: 'Company Profile',
      icon: '🏢',
      path: '/company-profile'
    },
    {
      id: 'membership',
      label: 'Membership & Tokens',
      icon: '💳',
      path: '/membership-tokens'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/recruiter-settings'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (toggleSidebar) toggleSidebar();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
    {isOpen && <div className={styles.mobileOverlay} onClick={toggleSidebar}></div>}
    <aside className={`${styles.sidebar} ${darkMode ? styles.darkMode : ''} ${isOpen ? styles.open : ''}`}>
      <button className={styles.closeButton} onClick={toggleSidebar}>
        &times;
      </button>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.navItem}>
              <button
                className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.badge && (
                  <span className={styles.notificationCount}>{item.badge}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={styles.userCard}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.companyName?.charAt(0)?.toUpperCase() || 'R'}
          </div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{user?.companyName || 'Company'}</div>
            <div className={styles.userEmail}>{user?.email || 'company@example.com'}</div>
          </div>
        </div>
      </div>
      
      <div className={styles.footer}>
      </div>
    </aside>
    </>
  );
};

export default RecruiterSidebar;
