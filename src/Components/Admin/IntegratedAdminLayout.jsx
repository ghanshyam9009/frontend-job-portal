import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, Outlet } from "react-router-dom";
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
  Menu,
  Sun,
  Moon,
  ChevronDown
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { contactService } from "../../services/contactService";
import { demoService } from "../../services/demoService";
import logo from "../../assets/logo.png";

const IntegratedAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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
          label: 'Manage Recruiters',
          icon: Building,
          path: '/admin/employers',
          badge: pendingRecruiters > 0 ? pendingRecruiters : null
        },
        
      ]
    },
    {

      title: "Job Management",
      items: [
        {
          id: 'job-posting',
          label: 'Job Admin Posting',
          icon: FileText,
          path: '/admin/job-posting'
        },
        // {
        //   id: 'jobs',
        //   label: 'Pending Jobs',
        //   icon: Briefcase,
        //   path: '/admin/jobs'
        // },
       
        {
          id: 'government-jobs',
          label: 'Government Jobs',
          icon: Building2,
          path: '/admin/government-jobs'
        },
        // {
        //   id: 'job-application-reports',
        //   label: 'Recruiter Jobs',
        //   icon: BarChart3,
        //   path: '/admin/job-application-reports'
        // }
      ]
    },
    // {title: "Applied",
    //   items: [
    //      {
    //       id: 'pending-applications',
    //       label: 'Applied Candidates',
    //       icon: Clock,
    //       path: '/admin/pending-applications'
    //     },
    //   ]

    // },
    {
      title: "Forms & Leads",
      items: [
       
        {
          id: 'homepage-forms',
          label: 'Homepage Leads',
          icon: FileText,
          path: '/admin/homepage-forms',
          badge: homepageFormsCount > 0 ? homepageFormsCount : null
        },
        {
          id: 'contact-forms',
          label: 'Contact Queries',
          icon: Phone,
          path: '/admin/contact-forms',
          badge: contactFormsCount > 0 ? contactFormsCount : null
        }
      ]
    }, {
      title: "Payment & Plans",
      items: [
        {
          id: 'membership',
          label: 'Membership Plans',
          icon: CreditCard,
          path: '/admin/membership'
        },
       
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 border-b ${
        theme === 'dark' 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between h-full px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button 
              className={`p-2 rounded-lg lg:hidden ${
                theme === 'dark' 
                  ? 'hover:bg-slate-800 text-white' 
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="#" className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-18 h-18" />
              <span className={`text-xl font-bold hidden sm:block ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Big<span className="text-blue-500">sources</span>.in
              </span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                theme === 'dark' 
                  ? 'hover:bg-slate-800 text-white' 
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm">
                  {(user?.name || user?.admin_name || 'Admin').charAt(0).toUpperCase()}
                </div>
                <ChevronDown className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} />
              </button>

              {showProfileDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg border z-50 ${
                    theme === 'dark' 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="p-4 border-b border-slate-700">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name || user?.admin_name || 'Admin User'}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        {user?.email || 'admin@example.com'}
                      </p>
                    </div>
                    <div className="p-2">
                     
                      <button 
                        onClick={handleLogout}
                        className={`w-full text-left px-4 py-2 rounded ${
                          theme === 'dark' 
                            ? 'hover:bg-slate-700 text-red-400' 
                            : 'hover:bg-gray-100 text-red-600'
                        }`}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-68 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-r`}
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {menuSections.map((section, idx) => (
              <div key={idx} className="mb-6">
                <p className={`mb-2 px-3 text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
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
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className=" ">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default IntegratedAdminLayout;