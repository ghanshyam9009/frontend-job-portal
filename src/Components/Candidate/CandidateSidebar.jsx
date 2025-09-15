import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import styles from "../../Styles/CandidateSidebar.module.css";

const CandidateSidebar = ({ darkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      path: '/userdashboard'
    },
    {
      id: 'jobs',
      label: 'Job Listings',
      icon: '💼',
      path: '/userjoblistings'
    },
    {
      id: 'saved',
      label: 'Saved Jobs',
      icon: '⭐',
      path: '/saved-jobs'
    },
    {
      id: 'applications',
      label: 'My Applications',
      icon: '📋',
      path: '/my-applications'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      path: '/profile'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: '💬',
      path: '/messages',
      badge: 2
    },
    {
      id: 'membership',
      label: 'Membership',
      icon: '💳',
      path: '/membership'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/settings'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className={`${styles.sidebar} ${darkMode ? styles.darkMode : ''}`}>
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
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>{user?.name || 'User'}</div>
            <div className={styles.userEmail}>{user?.email || 'user@example.com'}</div>
          </div>
        </div>
      </div>
      
      <div className={styles.footer}>
        Made with ❤️ for Job Seekers
      </div>
    </aside>
  );
};

export default CandidateSidebar;
