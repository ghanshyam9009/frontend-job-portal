import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { Home, Building, Star, ClipboardList, User, CreditCard, Settings } from "lucide-react";
import styles from "../../Styles/CandidateSidebar.module.css";

const CandidateSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home size={20} />,
      path: '/userdashboard'
    },
    {
      id: 'jobs',
      label: 'Job Listings',
      icon: <Building size={20} />,
      path: '/userjoblistings'
    },
    {
      id: 'saved',
      label: 'Saved Jobs',
      icon: <Star size={20} />,
      path: '/saved-jobs'
    },
    {
      id: 'applications',
      label: 'My Applications',
      icon: <ClipboardList size={20} />,
      path: '/my-applications'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={20} />,
      path: '/profile'
    },
    // {
    //   id: 'messages',
    //   label: 'Messages',
    //   icon: '💬',
    //   path: '/messages',
    //   badge: 2
    // },
    {
      id: 'membership',
      label: 'Membership',
      icon: <CreditCard size={20} />,
      path: '/membership-plans'
    },
    // {
    //   id: 'settings',
    //   label: 'Settings',
    //   icon: <Settings size={20} />,
    //   path: '/settings'
    // }
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
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''} ${theme === 'dark' ? styles.dark : ''}`}>
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
          {/* <div className={styles.userAvatar}>
            <User size={20} />
          </div> */}
          <div className={styles.userDetails}>
            <div className={styles.userName}>{user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate'}</div>
            <div className={styles.userEmail}>{user?.email || 'user@example.com'}</div>
          </div>
        </div>
      </div>
      
    </aside>
    </>
  );
};

export default CandidateSidebar;
