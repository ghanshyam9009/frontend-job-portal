import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext"; // Import useTheme
import { Home, Users, Building, FileText, Clock, Building2, ClipboardList, CreditCard, Phone, BarChart3, Settings, Bell } from "lucide-react";
import { adminService } from "../../services/adminService";
import { contactService } from "../../services/contactService";
import { demoService } from "../../services/demoService";
import styles from "../../Styles/AdminSidebar.module.css";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme(); // Use theme context
  const [pendingRecruiters, setPendingRecruiters] = useState(0);
  const [contactFormsCount, setContactFormsCount] = useState(0);
  const [homepageFormsCount, setHomepageFormsCount] = useState(0);

  // Fetch pending recruiters count
  useEffect(() => {
    const fetchPendingRecruiters = async () => {
      try {
        const response = await adminService.getAllRecruiters();
        const pendingCount = response.recruiters?.filter(r => r.hasadminapproved === false).length || 0;
        setPendingRecruiters(pendingCount);
      } catch (error) {
        console.error('Failed to fetch pending recruiters count:', error);
      }
    };

    fetchPendingRecruiters();
  }, []);

  // Fetch contact forms count
  useEffect(() => {
    const fetchContactFormsCount = async () => {
      try {
        const response = await contactService.getAllContacts();

        // Handle different API response structures
        let dataArray = [];
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where data is wrapped in an object
          const possibleArrays = ['data', 'contacts', 'forms', 'results'];
          for (const key of possibleArrays) {
            if (Array.isArray(response.data[key])) {
              dataArray = response.data[key];
              break;
            }
          }
          // If no array found in common properties, check if data itself is the array
          if (dataArray.length === 0 && Array.isArray(response)) {
            dataArray = response;
          }
        }

        setContactFormsCount(dataArray.length);
      } catch (error) {
        console.error('Failed to fetch contact forms count:', error);
      }
    };

    fetchContactFormsCount();
  }, []);

  // Fetch homepage forms count
  useEffect(() => {
    const fetchHomepageFormsCount = async () => {
      try {
        const response = await demoService.getAllDemoRequests();

        // Handle different API response structures
        let dataArray = [];
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where data is wrapped in an object
          const possibleArrays = ['data', 'queries', 'forms', 'results', 'demos'];
          for (const key of possibleArrays) {
            if (Array.isArray(response.data[key])) {
              dataArray = response.data[key];
              break;
            }
          }
          // If no array found in common properties, check if data itself is the array
          if (dataArray.length === 0 && Array.isArray(response)) {
            dataArray = response;
          }
        }

        setHomepageFormsCount(dataArray.length);
      } catch (error) {
        console.error('Failed to fetch homepage forms count:', error);
      }
    };

    fetchHomepageFormsCount();
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard'
    },
    {
      id: 'candidates',
      label: 'Manage Candidates',
      icon: Users,
      path: '/admin/candidates'
    },
        {
      id: 'employers',
      label: 'Manage Employers',
      icon: Building,
      path: '/admin/employers',
      badge: pendingRecruiters > 0 ? pendingRecruiters : null
    },
      {
      id: 'job-posting',
      label: 'Job Admin Posting ',
      icon: FileText,
      path: '/admin/job-posting'
    },
     {
      id: 'jobs',
      label: 'Manage Employers Jobs',
      icon: FileText,
      path: '/admin/jobs'
    },
  
 

   
    {
      id: 'job-application-reports',
      label: 'Job Application Reports',
      icon: BarChart3,
      path: '/admin/job-application-reports'
    },
    {
      id: 'government-jobs',
      label: 'Government Jobs',
      icon: Building2,
      path: '/admin/government-jobs'
    },
       {
      id: 'pending-applications',
      label: 'Pending Job',
      icon: Clock,
      path: '/admin/pending-applications'
    },
    {
      id: 'membership',
      label: 'Membership Plans',
      icon: CreditCard,
      path: '/admin/membership'
    },
    {
      id: 'homepage-forms',
      label: 'Homepage Forms',
      icon: FileText,
      path: '/admin/homepage-forms',
      badge: homepageFormsCount > 0 ? homepageFormsCount : null
    },
    {
      id: 'contact-forms',
      label: 'Contact Forms',
      icon: Phone,
      path: '/admin/contact-forms',
      badge: contactFormsCount > 0 ? contactFormsCount : null
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: '/admin/reports'
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
                <item.icon className={styles.navIcon} />
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
