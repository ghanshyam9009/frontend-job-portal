import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services";
import { Home, Plus, FileText, Users, Star, Building, CreditCard, Settings } from "lucide-react";
import styles from "./RecruiterSidebar.module.css";

const RecruiterSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [applicationCount, setApplicationCount] = useState(0);

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

  // Fetch application count dynamically
  useEffect(() => {
    const fetchApplicationCount = async () => {
      if (user?.employer_id || user?.id) {
        try {
          const jobsData = await recruiterExternalService.getAllPostedJobs(user.employer_id || user.id);
          const jobsList = (jobsData?.jobs || []).filter(job => job.status === 'approved' || job.status === 'Open');

          let totalApplications = 0;
          for (const job of jobsList) {
            try {
              const applicationsData = await recruiterExternalService.getAllApplicants(job.job_id);
              totalApplications += (applicationsData.applications || []).length;
            } catch (err) {
              console.error(`Failed to fetch applications for job ${job.job_id}:`, err);
            }
          }

          setApplicationCount(totalApplications);
        } catch (err) {
          console.error('Failed to fetch application count:', err);
        }
      }
    };

    // Fetch immediately
    fetchApplicationCount();

    // Set up polling every 30 seconds for real-time updates
    const interval = setInterval(fetchApplicationCount, 30000);

    return () => clearInterval(interval);
  }, [user?.employer_id, user?.id]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home size={20} />,
      path: '/recruiter/dashboard'
    },
    {
      id: 'post-job',
      label: 'Post Job',
      icon: <Plus size={20} />,
      path: '/post-job'
    },
    {
      id: 'manage-jobs',
      label: 'Manage Posted Jobs',
      icon: <FileText size={20} />,
      path: '/manage-jobs'
    },
    {
      id: 'applications',
      label: 'Candidate Applications',
      icon: <Users size={20} />,
      path: '/candidate-applications',
      badge: applicationCount
    },
    {
      id: 'shortlist',
      label: 'Shortlist Candidates',
      icon: <Star size={20} />,
      path: '/shortlist-candidates'
    },
    {
      id: 'profile',
      label: 'Company Profile',
      icon: <Building size={20} />,
      path: '/company-profile'
    },
    {
      id: 'membership',
      label: 'Membership & Tokens',
      icon: <CreditCard size={20} />,
      path: '/membership-tokens'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
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
          <div className={styles.userDetails}>
            <div className={styles.userName}>{recruiterProfile?.company_name || 'Company'}</div>
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
