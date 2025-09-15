import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../Styles/AdminSidebar.module.css";

const AdminSidebar = ({ darkMode, isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
      id: 'membership',
      label: 'Membership Plans',
      icon: '💳',
      path: '/admin/membership'
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
      
      <aside className={`${styles.sidebar} ${darkMode ? styles.darkMode : ''} ${isOpen ? styles.open : ''}`}>
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
          <img src="https://via.placeholder.com/30" alt="Jane Doe" className={styles.userAvatar} />
          <div className={styles.userDetails}>
            <div className={styles.userName}>Jane Doe</div>
            <div className={styles.userEmail}>jane.doe@example.com</div>
          </div>
        </div>
      </div>
      
      <div className={styles.footer}>
        Made with ❤️
      </div>
    </aside>
    </>
  );
};

export default AdminSidebar;
