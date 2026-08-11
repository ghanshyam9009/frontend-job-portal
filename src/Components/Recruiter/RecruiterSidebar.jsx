import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services";
import { isProfileComplete } from "../../utils/recruiterProfileUtils";
import { Home, Plus, FileText, Users, Star, Building, CreditCard, Settings, UserPlus } from "lucide-react";
import styles from "./RecruiterSidebar.module.css";

const RecruiterSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [canAccessJobFeatures, setCanAccessJobFeatures] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState('Complete profile and get admin approval to use recruiting tools');

  useEffect(() => {
    if (user) {
      // Use the user object from AuthContext as the source of truth
      const profileComplete = isProfileComplete(user);
      const adminApproved = user.hasadminapproved === true;

      if (!adminApproved) {
        setRestrictionMessage('Admin approval pending. Please wait for approval before accessing hiring tools.');
      } else if (!profileComplete) {
        setRestrictionMessage('Complete your company profile to unlock hiring tools.');
      } else {
        setRestrictionMessage('');
      }

      setCanAccessJobFeatures(profileComplete && adminApproved);
      setRecruiterProfile(user);
    }
  }, [user]);

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
      path: '/recruiter/dashboard',
      restricted: false
    },
    {
      id: 'post-job',
      label: 'Post Job',
      icon: <Plus size={20} />,
      path: '/post-job',
      restricted: !canAccessJobFeatures,
      restrictionMessage: restrictionMessage
    },
    {
      id: 'manage-jobs',
      label: 'Manage Posted Jobs',
      icon: <FileText size={20} />,
      path: '/manage-jobs',
      restricted: !canAccessJobFeatures,
      restrictionMessage: restrictionMessage
    },
    {
      id: 'applications',
      label: 'Candidate Applications',
      icon: <Users size={20} />,
      path: '/candidate-applications',
      restricted: !canAccessJobFeatures,
      restrictionMessage: restrictionMessage
    },
    {
      id: 'shortlist',
      label: 'Shortlist Candidates',
      icon: <Star size={20} />,
      path: '/shortlist-candidates',
      restricted: !canAccessJobFeatures,
      restrictionMessage: restrictionMessage
    },
    {
      id: 'assign-candidates',
      label: 'Assigned Candidates',
      icon: <UserPlus size={20} />,
      path: '/assign-candidates',
      restricted: !canAccessJobFeatures,
      restrictionMessage: restrictionMessage
    },
    {
      id: 'profile',
      label: 'Company Profile',
      icon: <Building size={20} />,
      path: '/company-profile',
      restricted: false
    },
    {
      id: 'membership',
      label: 'Membership',
      icon: <CreditCard size={20} />,
      path: '/membership-tokens',
      restricted: false
    }
    // {
    //   id: 'settings',
    //   label: 'Settings',
    //   icon: <Settings size={20} />,
    //   path: '/recruiter-settings',
    //   restricted: false
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
                className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''} ${item.restricted ? styles.restricted : ''}`}
                onClick={() => !item.restricted && handleNavigation(item.path)}
                disabled={item.restricted}
                title={item.restricted ? item.restrictionMessage : ''}
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
            <div className={styles.userName}>{recruiterProfile?.company_name || recruiterProfile?.name || 'Company'}</div>
            <div className={styles.userEmail}>{user?.email || 'recruiter@example.com'}</div>
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
