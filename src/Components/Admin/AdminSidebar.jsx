import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext"; // Import useTheme
import styles from "../../Styles/AdminSidebar.module.css";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme(); // Use theme context

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      path: '/admin/dashboard'
    },
    {
      id: 'candidates',
      label: 'Manage Candidates',
      icon: '👥',
      path: '/admin/candidates'
    },
    {
      id: 'employers',
      label: 'Manage Employers',
      icon: '💼',
      path: '/admin/employers'
    },
    {
      id: 'jobs',
      label: 'Manage Jobs',
      icon: '📄',
      path: '/admin/jobs'
    },
    {
      id: 'pending-jobs',
      label: 'Pending Jobs',
      icon: '⏳',
      path: '/admin/pending-jobs'
    },
    {
      id: 'government-jobs',
      label: 'Government Jobs',
      icon: '🏛️',
      path: '/admin/government-jobs'
    },
    {
      id: 'job-applications',
      label: 'Job Applications',
      icon: '📋',
      path: '/admin/job-applications',
      badge: 12
    },
    {
      id: 'membership',
      label: 'Membership Plans',
      icon: '💳',
      path: '/admin/membership'
    },
    {
      id: 'homepage-forms',
      label: 'Homepage Forms',
      icon: '📝',
      path: '/admin/homepage-forms',
      badge: 5
    },
    {
      id: 'contact-forms',
      label: 'Contact Forms',
      icon: '📞',
      path: '/admin/contact-forms',
      badge: 3
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📊',
      path: '/admin/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/admin/settings'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      path: '/admin/notifications',
      badge: 9
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Close mobile menu after navigation
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className={styles.mobileOverlay} onClick={onClose}></div>}
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${theme === 'dark' ? styles.dark : ''}`}>
      <button className={styles.closeButton} onClick={onClose}>
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
            {(user?.name || user?.admin_name || 'Admin').charAt(0).toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>
              {user?.name || user?.admin_name || 'Admin User'}
            </div>
            <div className={styles.userEmail}>
              {user?.email || 'admin@example.com'}
            </div>
          </div>
        </div>
      </div>
      
    </aside>
    </>
  );
};

export default AdminSidebar;
