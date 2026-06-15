import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { 
  Home, 
  Users, 
  Building, 
  FileText, 
  Clock, 
  Building2, 
  CreditCard, 
  Phone, 
  BarChart3, 
  Settings, 
  LogOut,
  Briefcase,
  X,
  Image,
  Gift
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { contactService } from "../../services/contactService";
import { demoService } from "../../services/demoService";

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // const { theme } = useTheme();
  const theme='dark'
  const [pendingRecruiters, setPendingRecruiters] = useState(0);
  const [contactFormsCount, setContactFormsCount] = useState(0);
  const [homepageFormsCount, setHomepageFormsCount] = useState(0);

  // Fetch pending recruiters count
  useEffect(() => {
    const fetchPendingRecruiters = async () => {
      try {
        const response = await adminService.getAllRecruiters();
        const pendingCount = response.counts?.pending ?? response.recruiters?.filter((r) => r.hasadminapproved === false).length ?? 0;
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
        let dataArray = [];
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          const possibleArrays = ['data', 'contacts', 'forms', 'results'];
          for (const key of possibleArrays) {
            if (Array.isArray(response.data[key])) {
              dataArray = response.data[key];
              break;
            }
          }
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
        let dataArray = [];
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          const possibleArrays = ['data', 'queries', 'forms', 'results', 'demos'];
          for (const key of possibleArrays) {
            if (Array.isArray(response.data[key])) {
              dataArray = response.data[key];
              break;
            }
          }
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

  const menuSections = [
    {
      title: "Main Menu",
      items: [
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
          label: 'Manage Employer',
          icon: Building,
          path: '/admin/employers',
          badge: pendingRecruiters > 0 ? pendingRecruiters : null
        },
        {
          id: 'job-posting',
          label: 'Job Admin Posting',
          icon: FileText,
          path: '/admin/job-posting'
        },
        {
          id: 'jobs',
          label: 'Employers Jobs',
          icon: Briefcase,
          path: '/admin/jobs'
        }
      ]
    },
    {
      title: "Job Management",
      items: [
        {
          id: 'pending-applications',
          label: 'Pending Jobs',
          icon: Clock,
          path: '/admin/pending-applications'
        },
        {
          id: 'government-jobs',
          label: 'Government Jobs',
          icon: Building2,
          path: '/admin/government-jobs'
        },
        {
          id: 'job-application-reports',
          label: 'Job Application Reports',
          icon: BarChart3,
          path: '/admin/job-application-reports'
        }
      ]
    },
    {
      title: "Forms & Plans",
      items: [
        {
          id: 'plans',
          label: 'Plans',
          icon: CreditCard,
          path: '/admin/plans'
        },
        {
          id: 'free-referral',
          label: 'Free Referral',
          icon: Gift,
          path: '/admin/free-referral'
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
          id: 'banners',
          label: 'Banners',
          icon: Image,
          path: '/admin/banners'
        },
        {
          id: 'contact-forms',
          label: 'Contact Forms',
          icon: Phone,
          path: '/admin/contact-forms',
          badge: contactFormsCount > 0 ? contactFormsCount : null
        }
      ]
    },
    {
      title: "System",
      items: [
        {
          id: 'reports',
          label: 'Reports',
          icon: BarChart3,
          path: '/admin/reports'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          path: '/admin/settings'
        }
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-15 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex h-6 items-center justify-between border-b px-6 ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
                <Briefcase className="h-5 w-5 text-white" />
              </div> */}
              <div>
                {/* <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                  JobPortal
                </h1>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Admin Panel
                </p> */}
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {menuSections.map((section, idx) => (
              <div key={idx} className="mb-6">
                <p className={`mb-2 px-3 text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                          : theme === 'dark'
                          ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                          isActive(item.path)
                            ? 'bg-white text-blue-500'
                            : 'bg-red-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className={`border-t p-4 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`flex items-center gap-3 rounded-lg p-3 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'
            }`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm">
                {(user?.name || user?.admin_name || 'Admin').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {user?.name || user?.admin_name || 'Admin User'}
                </p>
                <p className={`text-xs truncate ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {user?.email || 'admin@example.com'}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className={`rounded-lg p-2 transition-colors ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:bg-slate-700 hover:text-white' 
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;