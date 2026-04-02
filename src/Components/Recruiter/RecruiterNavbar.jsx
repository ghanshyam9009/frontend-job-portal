import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services";
import { recruiterService } from "../../services/recruiterService";
import { isProfileComplete } from "../../utils/recruiterProfileUtils";
import logo1 from "../../assets/logo.png";
import { 
  Sun, 
  Moon, 
  Home, 
  Plus,
  FileText,
  Users,
  Star,
  Building, 
  CreditCard,
  Settings, 
  LogOut, 
  X,
  LayoutDashboard,
  Info,
  Phone,
  Hospital
} from "lucide-react";

const RecruiterNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [canAccessJobFeatures, setCanAccessJobFeatures] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState('Complete profile and get admin approval to use recruiting tools');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const dropdownRef = useRef(null);

  // Check profile completion and admin approval
  useEffect(() => {
    if (user) {
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

  // Fetch recruiter profile
  useEffect(() => {
    const fetchRecruiterProfile = async () => {
      if (user?.email) {
        try {
          const response = await recruiterService.getProfile(user.email, true);

          if (response.success && response.data) {
            const profileData = response.data.employer || response.data.profile || response.data;
            const logoUrl = profileData.logo || profileData.company_logo || profileData.profile_image;

            setRecruiterProfile(prev => ({
              ...prev,
              ...profileData,
              company_logo: logoUrl || prev?.company_logo
            }));
          } else {
            console.log('Navbar: Profile fetch failed or no data');
          }
        } catch (err) {
          console.error('Navbar: Failed to fetch recruiter profile:', err);
        }
      }
    };

    fetchRecruiterProfile();
  }, [user?.email]);

  // Temporarily disabled application count fetching due to API issues
  // TODO: Re-enable when API CORS and 500 errors are fixed
  /*
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
              // Log error but continue with other jobs
              console.warn(`Failed to fetch applications for job ${job.job_id}:`, err.message);
            }
          }

          setApplicationCount(totalApplications);
        } catch (err) {
          // Log error but don't break the navbar
          console.warn('Failed to fetch application count:', err.message);
          setApplicationCount(0); // Set to 0 to avoid showing stale data
        }
      }
    };

    fetchApplicationCount();
    const interval = setInterval(fetchApplicationCount, 30000);
    return () => clearInterval(interval);
  }, [user?.employer_id, user?.id]);
  */

  // Prevent body scroll when sidebars are open
  useEffect(() => {
    if (isMobileMenuOpen || showProfileSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen, showProfileSidebar]);

  const handleProfileClick = () => {
    setShowProfileSidebar(!showProfileSidebar);
  };

  const handleLogout = () => {
    logout();
    setShowProfileSidebar(false);
    navigate('/');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  const handleRestrictedNavigation = (path, restricted) => {
    if (restricted) {
      alert(restrictionMessage);
      return;
    }
    navigate(path);
  };

  // Theme-based colors
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-black';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const dropdownBg = isDark ? 'bg-gray-800' : 'bg-white';
  const dropdownHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  return (
    <>
      <style>{`
        .nav-link-btn {
          position: relative;
          padding-bottom: 4px;
        }
        .nav-link-btn::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 0%;
          height: 2px;
          background: #2271B5;
          border-radius: 2px;
          transition: width 0.25s ease;
        }
        .nav-link-btn:hover::after,
        .nav-link-btn.active::after {
          width: 100%;
        }
        .sidebar-slide-in {
          animation: slideInRight 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>

    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgColor} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/recruiter/dashboard" className="flex items-center space-x-2 text-xl lg:text-2xl font-bold flex-shrink-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
              <img src={logo1} alt="Logo" className="w-full h-full object-contain" loading="lazy" />
            </div>
            <span className={textColor}>
              Big<span className="text-[#2271B5]">sources</span>.in
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1">
            <li>
              <button
                onClick={() => navigate('/')}
                className={`nav-link-btn px-3 py-2 text-sm font-semibold transition-colors rounded-md ${
                  isActive("/")
                    ? "active text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/recruiter/dashboard')}
                className={`nav-link-btn px-3 py-2 text-sm font-semibold transition-colors rounded-md ${
                  isActive("/recruiter/dashboard")
                    ? "active text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleRestrictedNavigation('/post-job', !canAccessJobFeatures)}
                disabled={!canAccessJobFeatures}
                title={!canAccessJobFeatures ? restrictionMessage : ''}
                className={`nav-link-btn px-3 py-2 text-sm font-semibold transition-colors rounded-md ${
                  !canAccessJobFeatures 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isActive("/post-job")
                      ? "active text-[#2271B5]"
                      : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Post Job</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleRestrictedNavigation('/manage-jobs', !canAccessJobFeatures)}
                disabled={!canAccessJobFeatures}
                title={!canAccessJobFeatures ? restrictionMessage : ''}
                className={`nav-link-btn px-3 py-2 text-sm font-semibold transition-colors rounded-md ${
                  !canAccessJobFeatures 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isActive("/manage-jobs")
                      ? "active text-[#2271B5]"
                      : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Manage Jobs</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleRestrictedNavigation('/jobs', !canAccessJobFeatures)}
                disabled={!canAccessJobFeatures}
                title={!canAccessJobFeatures ? restrictionMessage : ''}
                className={`nav-link-btn px-3 py-2 text-sm font-semibold transition-colors rounded-md ${
                  !canAccessJobFeatures 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isActive("/jobs")
                      ? "active text-[#2271B5]"
                      : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Jobs</span>
               
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/company-profile')}
                className={`nav-link-btn px-3 py-2 text-sm font-semibold transition-colors rounded-md ${
                  isActive("/company-profile")
                    ? "active text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Company Profile</span>
              </button>
            </li>
          
          </ul>

          {/* Desktop Right Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Profile Avatar */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleProfileClick}
                className="w-12 h-12 rounded-xl bg-blue-50 text-[#2271B5] flex shadow-sm border border-gray-200 items-center justify-center font-bold hover:bg-blue-100 hover:shadow transition-all overflow-hidden"
              >
                {recruiterProfile?.company_logo ? (
                  <img
                    src={recruiterProfile.company_logo}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  (recruiterProfile?.name || recruiterProfile?.company_name || 'R').charAt(0)?.toUpperCase()
                )}
              </button>
            </div>

            {/* Logout Button next to avatar */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-sm"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 rounded-md ${textSecondary} ${hoverBg}`}
            onClick={toggleMobileMenu}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              ></span>
              <span
                className={`block h-0.5 w-full bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              ></span>
              <span
                className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Profile Sidebar */}
      {showProfileSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowProfileSidebar(false)}
          ></div>
          <div className={`fixed right-0 top-0 bottom-0 w-80 ${dropdownBg} shadow-2xl z-50 overflow-y-auto`}>
            <div className="p-4 flex flex-col gap-3">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between ">
                <h3 className={`text-xl font-bold ${textColor}`}>Profile Menu</h3>
                <button
                  onClick={() => setShowProfileSidebar(false)}
                  className={`p-2 rounded-md ${textSecondary} ${hoverBg}`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Profile Info (Candidate-style centered) */}
              <div className={`mb-2 p-2 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex flex-col items-center justify-center text-center gap-2 mb-4">
                  <div
                    style={{ width: 180, height: 180 }}
                    className="rounded-xl bg-blue-50 text-[#2271B5] shadow-inner border border-blue-100 flex items-center justify-center text-3xl font-bold overflow-hidden mb-2"
                  >
                    {recruiterProfile?.company_logo ? (
                      <img
                        src={recruiterProfile.company_logo}
                        alt="Company Logo"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      (recruiterProfile?.company_name || recruiterProfile?.name || 'Company').charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${textColor}`}>
                      {recruiterProfile?.company_name || recruiterProfile?.name || 'Company'}
                    </div>
                    <div className={`text-sm ${textSecondary} mt-0.5 font-medium`}>
                      {user?.email || 'recruiter@example.com'}
                    </div>
                  </div>
                </div>

                {/* Access Status */}
                {!canAccessJobFeatures && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900/40">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                      {restrictionMessage}
                    </p>
                  </div>
                )}

                {/* Quick Action */}
                <button
                  onMouseDown={() => { navigate('/company-profile'); setShowProfileSidebar(false); }}
                  className="block w-full mt-4 py-2.5 text-center text-sm font-bold text-white bg-[#2271B5] hover:bg-[#1a5a8f] shadow-md hover:shadow-lg rounded-lg transition-all"
                >
                  {canAccessJobFeatures ? 'Edit Company Profile' : 'Complete Profile'}
                </button>
              </div>

              {/* Menu Items (Candidate-style) */}
              <div className="space-y-1.5">
                <button
                  onMouseDown={() => { navigate('/recruiter/dashboard'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 transition-all group`}
                >
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                    <LayoutDashboard size={18} className="text-[#2271B5] dark:text-blue-200" />
                  </div>
                  <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Dashboard</span>
                </button>
                <button
                  onMouseDown={() => { 
                    if (!canAccessJobFeatures) {
                      alert(restrictionMessage);
                    } else {
                      navigate('/post-job'); 
                      setShowProfileSidebar(false);
                    }
                  }}
                  disabled={!canAccessJobFeatures}
                  className={`w-full flex items-center gap-1.5 px-4 py-1.5 rounded-xl border transition-all group ${
                    !canAccessJobFeatures
                      ? `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} opacity-50 cursor-not-allowed ${textSecondary}`
                      : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                  }`}
                >
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                    <Plus size={18} className="text-[#2271B5] dark:text-blue-200" />
                  </div>
                  <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Post Job</span>
                </button>
                <button
                  onMouseDown={() => { 
                    if (!canAccessJobFeatures) {
                      alert(restrictionMessage);
                    } else {
                      navigate('/manage-jobs'); 
                      setShowProfileSidebar(false);
                    }
                  }}
                  disabled={!canAccessJobFeatures}
                  className={`w-full flex items-center gap-1.5 px-4 py-1.5 rounded-xl border transition-all group ${
                    !canAccessJobFeatures
                      ? `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} opacity-50 cursor-not-allowed ${textSecondary}`
                      : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                  }`}
                >
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                    <FileText size={18} className="text-[#2271B5] dark:text-blue-200" />
                  </div>
                  <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Manage Jobs</span>
                </button>
                <button
                  onMouseDown={() => { 
                    if (!canAccessJobFeatures) {
                      alert(restrictionMessage);
                    } else {
                      navigate('/jobs'); 
                      setShowProfileSidebar(false);
                    }
                  }}
                  disabled={!canAccessJobFeatures}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                    !canAccessJobFeatures
                      ? `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} opacity-50 cursor-not-allowed ${textSecondary}`
                      : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                  }`}
                >
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                    <Users size={18} className="text-[#2271B5] dark:text-blue-200" />
                  </div>
                  <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Jobs</span>
                  

                </button>
                <button
                  onMouseDown={() => { 
                    if (!canAccessJobFeatures) {
                      alert(restrictionMessage);
                    } else {
                      navigate('/shortlist-candidates'); 
                      setShowProfileSidebar(false);
                    }
                  }}
                  disabled={!canAccessJobFeatures}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                    !canAccessJobFeatures
                      ? `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} opacity-50 cursor-not-allowed ${textSecondary}`
                      : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                  }`}
                >
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                    <Star size={18} className="text-[#2271B5] dark:text-blue-200" />
                  </div>
                  <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Shortlist</span>
                </button>
                <button
                  onMouseDown={() => { navigate('/company-profile'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 transition-all group`}
                >
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                    <Building size={18} className="text-[#2271B5] dark:text-blue-200" />
                  </div>
                  <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>
                    Company Profile
                  </span>
                </button>
                <button
                  onMouseDown={() => { navigate('/membership-tokens'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 transition-all group`}
                >
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                    <CreditCard size={18} className="text-[#2271B5] dark:text-blue-200" />
                  </div>
                  <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>
                    Membership
                  </span>
                </button>
                <button
                  onMouseDown={() => { handleLogout(); setShowProfileSidebar(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-red-100 bg-red-50 hover:bg-red-500 hover:border-red-500 transition-all group shadow-sm"
                >
                  <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-400 transition-colors">
                    <LogOut size={18} className="text-red-500 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-bold text-red-600 group-hover:text-white transition-colors">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        >
          <div
            className={`fixed right-0 top-0 bottom-0 w-80 ${bgColor} shadow-xl overflow-y-auto sidebar-slide-in`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-4">
                <Link to="/recruiter/dashboard" className="flex items-center space-x-2 text-xl font-bold">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                    <img src={logo1} alt="Logo" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <span className={textColor}>
                    Big<span className="text-[#2271B5]">sources</span>.in
                  </span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className={`p-2 rounded-md ${textSecondary} ${hoverBg}`}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Profile Section (Candidate-style centered) */}
              <div className={`p-4 rounded-2xl mb-4 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} order-2`}>
                <div className="flex flex-col items-center justify-center text-center gap-2 mb-4">
                  <div className="w-20 h-20 rounded-md bg-blue-50 text-[#2271B5] shadow-inner border border-blue-100 flex items-center justify-center text-3xl font-bold overflow-hidden mb-2">
                    {recruiterProfile?.company_logo ? (
                      <img src={recruiterProfile.company_logo} alt="Company Logo" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      (recruiterProfile?.company_name || recruiterProfile?.name || 'Company').charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${textColor}`}>
                      {recruiterProfile?.company_name || recruiterProfile?.name || 'Company'}
                    </div>
                    <div className={`text-sm ${textSecondary} mt-0.5 font-medium`}>
                      {user?.email || 'recruiter@example.com'}
                    </div>
                  </div>
                </div>

                {!canAccessJobFeatures && (
                  <div className="mt-3 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900/40">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                      {restrictionMessage}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => { navigate('/company-profile'); closeMobileMenu(); }}
                  className="block w-full mt-4 py-2.5 text-center text-sm font-bold text-white bg-[#2271B5] hover:bg-[#1a5a8f] shadow-md hover:shadow-lg rounded-lg transition-all"
                >
                  {canAccessJobFeatures ? 'Edit Company Profile' : 'Complete Profile'}
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <p className={`text-xs font-semibold uppercase tracking-wider px-2 mb-2 ${textSecondary} opacity-60 order-3`}>Navigation</p>
              <ul className="space-y-1 mb-4 order-3">
                <li>
                  <button
                    onClick={() => { navigate('/'); closeMobileMenu(); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                      isActive("/")
                        ? `border-[#2271B5] ${isDark ? 'bg-[#2271B5]/15' : 'bg-blue-50'} text-[#2271B5]`
                        : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white shadow-sm'} ${textSecondary} hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive("/")
                        ? (isDark ? 'bg-[#2271B5]/25' : 'bg-blue-100')
                        : (isDark ? 'bg-[#2271B5]/15 group-hover:bg-[#2271B5]/25' : 'bg-blue-50 group-hover:bg-blue-100')
                    }`}>
                      <Home size={18} className={`transition-colors ${
                        isActive("/")
                          ? (isDark ? 'text-blue-300' : 'text-[#2271B5]')
                          : (isDark ? 'text-blue-200 group-hover:text-blue-300' : 'text-[#2271B5] group-hover:text-[#1a5a8f]')
                      }`} />
                    </div>
                    <span>Home</span>
                  </button>
                </li>
                  <li>
                  <button
                    onClick={() => { navigate('/recruiter/dashboard'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                      isActive("/recruiter/dashboard")
                        ? `border-[#2271B5] ${isDark ? 'bg-[#2271B5]/15' : 'bg-blue-50'} text-[#2271B5]`
                        : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white shadow-sm'} ${textSecondary} hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive("/recruiter/dashboard")
                        ? (isDark ? 'bg-[#2271B5]/25' : 'bg-blue-100')
                        : (isDark ? 'bg-[#2271B5]/15 group-hover:bg-[#2271B5]/25' : 'bg-blue-50 group-hover:bg-blue-100')
                    }`}>
                      <Hospital size={18} className={`transition-colors ${
                        isActive("/recruiter/dashboard")
                          ? (isDark ? 'text-blue-300' : 'text-[#2271B5]')
                          : (isDark ? 'text-blue-200 group-hover:text-blue-300' : 'text-[#2271B5] group-hover:text-[#1a5a8f]')
                      }`} />
                    </div>
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { 
                      if (!canAccessJobFeatures) {
                        alert(restrictionMessage);
                      } else {
                        navigate('/post-job'); 
                        closeMobileMenu();
                      }
                    }}
                    disabled={!canAccessJobFeatures}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                      !canAccessJobFeatures
                        ? `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} opacity-50 cursor-not-allowed ${textSecondary}`
                        : isActive("/post-job")
                          ? `border-[#2271B5] ${isDark ? 'bg-[#2271B5]/15' : 'bg-blue-50'} text-[#2271B5]`
                          : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white shadow-sm'} ${textSecondary} hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive("/post-job")
                        ? (isDark ? 'bg-[#2271B5]/25' : 'bg-blue-100')
                        : (isDark ? 'bg-[#2271B5]/15 group-hover:bg-[#2271B5]/25' : 'bg-blue-50 group-hover:bg-blue-100')
                    }`}>
                      <Plus size={18} className={`transition-colors ${
                        isActive("/post-job")
                          ? (isDark ? 'text-blue-300' : 'text-[#2271B5]')
                          : (isDark ? 'text-blue-200 group-hover:text-blue-300' : 'text-[#2271B5] group-hover:text-[#1a5a8f]')
                      }`} />
                    </div>
                    <span>Post Job</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { 
                      if (!canAccessJobFeatures) {
                        alert(restrictionMessage);
                      } else {
                        navigate('/manage-jobs'); 
                        closeMobileMenu();
                      }
                    }}
                    disabled={!canAccessJobFeatures}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                      !canAccessJobFeatures
                        ? `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} opacity-50 cursor-not-allowed ${textSecondary}`
                        : isActive("/manage-jobs")
                          ? `border-[#2271B5] ${isDark ? 'bg-[#2271B5]/15' : 'bg-blue-50'} text-[#2271B5]`
                          : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white shadow-sm'} ${textSecondary} hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive("/manage-jobs")
                        ? (isDark ? 'bg-[#2271B5]/25' : 'bg-blue-100')
                        : (isDark ? 'bg-[#2271B5]/15 group-hover:bg-[#2271B5]/25' : 'bg-blue-50 group-hover:bg-blue-100')
                    }`}>
                      <FileText size={18} className={`transition-colors ${
                        isActive("/manage-jobs")
                          ? (isDark ? 'text-blue-300' : 'text-[#2271B5]')
                          : (isDark ? 'text-blue-200 group-hover:text-blue-300' : 'text-[#2271B5] group-hover:text-[#1a5a8f]')
                      }`} />
                    </div>
                    <span>Manage Jobs</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { 
                      if (!canAccessJobFeatures) {
                        alert(restrictionMessage);
                      } else {
                        navigate('/jobs'); 
                        closeMobileMenu();
                      }
                    }}
                    disabled={!canAccessJobFeatures}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                      !canAccessJobFeatures
                        ? `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} opacity-50 cursor-not-allowed ${textSecondary}`
                        : isActive("/jobs")
                          ? `border-[#2271B5] ${isDark ? 'bg-[#2271B5]/15' : 'bg-blue-50'} text-[#2271B5]`
                          : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white shadow-sm'} ${textSecondary} hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive("/jobs")
                        ? (isDark ? 'bg-[#2271B5]/25' : 'bg-blue-100')
                        : (isDark ? 'bg-[#2271B5]/15 group-hover:bg-[#2271B5]/25' : 'bg-blue-50 group-hover:bg-blue-100')
                    }`}>
                      <Users size={18} className={`transition-colors ${
                        isActive("/jobs")
                          ? (isDark ? 'text-blue-300' : 'text-[#2271B5]')
                          : (isDark ? 'text-blue-200 group-hover:text-blue-300' : 'text-[#2271B5] group-hover:text-[#1a5a8f]')
                      }`} />
                    </div>
                    <span>Jobs</span>
                   
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { 
                      if (!canAccessJobFeatures) {
                        alert(restrictionMessage);
                      } else {
                        navigate('/shortlist-candidates'); 
                        closeMobileMenu();
                      }
                    }}
                    disabled={!canAccessJobFeatures}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                      !canAccessJobFeatures
                        ? `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} opacity-50 cursor-not-allowed ${textSecondary}`
                        : isActive("/shortlist-candidates")
                          ? `border-[#2271B5] ${isDark ? 'bg-[#2271B5]/15' : 'bg-blue-50'} text-[#2271B5]`
                          : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white shadow-sm'} ${textSecondary} hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive("/shortlist-candidates")
                        ? (isDark ? 'bg-[#2271B5]/25' : 'bg-blue-100')
                        : (isDark ? 'bg-[#2271B5]/15 group-hover:bg-[#2271B5]/25' : 'bg-blue-50 group-hover:bg-blue-100')
                    }`}>
                      <Star size={18} className={`transition-colors ${
                        isActive("/shortlist-candidates")
                          ? (isDark ? 'text-blue-300' : 'text-[#2271B5]')
                          : (isDark ? 'text-blue-200 group-hover:text-blue-300' : 'text-[#2271B5] group-hover:text-[#1a5a8f]')
                      }`} />
                    </div>
                    <span>Shortlist</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('/company-profile'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                      isActive("/company-profile")
                        ? `border-[#2271B5] ${isDark ? 'bg-[#2271B5]/15' : 'bg-blue-50'} text-[#2271B5]`
                        : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white shadow-sm'} ${textSecondary} hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive("/company-profile")
                        ? (isDark ? 'bg-[#2271B5]/25' : 'bg-blue-100')
                        : (isDark ? 'bg-[#2271B5]/15 group-hover:bg-[#2271B5]/25' : 'bg-blue-50 group-hover:bg-blue-100')
                    }`}>
                      <Building size={18} className={`transition-colors ${
                        isActive("/company-profile")
                          ? (isDark ? 'text-blue-300' : 'text-[#2271B5]')
                          : (isDark ? 'text-blue-200 group-hover:text-blue-300' : 'text-[#2271B5] group-hover:text-[#1a5a8f]')
                      }`} />
                    </div>
                    <span>Company Profile</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('/membership-tokens'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${
                      isActive("/membership-tokens")
                        ? `border-[#2271B5] ${isDark ? 'bg-[#2271B5]/15' : 'bg-blue-50'} text-[#2271B5]`
                        : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white shadow-sm'} ${textSecondary} hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive("/membership-tokens")
                        ? (isDark ? 'bg-[#2271B5]/25' : 'bg-blue-100')
                        : (isDark ? 'bg-[#2271B5]/15 group-hover:bg-[#2271B5]/25' : 'bg-blue-50 group-hover:bg-blue-100')
                    }`}>
                      <CreditCard size={18} className={`transition-colors ${
                        isActive("/membership-tokens")
                          ? (isDark ? 'text-blue-300' : 'text-[#2271B5]')
                          : (isDark ? 'text-blue-200 group-hover:text-blue-300' : 'text-[#2271B5] group-hover:text-[#1a5a8f]')
                      }`} />
                    </div>
                    <span>Membership</span>
                  </button>
                </li>
              </ul>

              {/* Mobile Account Section (Dashboard / Settings / Logout) */}
              <div className={`pt-3 mt-3 border-t ${borderColor}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider px-2 mb-2 ${textSecondary} opacity-60`}>Account</p>
                <div className="space-y-2">
                  <button
                    onClick={() => { navigate('/recruiter/dashboard'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5] transition-all group`}
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                      <LayoutDashboard size={18} className="text-[#2271B5] dark:text-blue-200 transition-colors" />
                    </div>
                    <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Dashboard</span>
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5] transition-all group`}
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                      <Settings size={18} className="text-[#2271B5] dark:text-blue-200 transition-colors" />
                    </div>
                    <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Settings</span>
                  </button>
                  <button
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-red-100 bg-red-50 hover:bg-red-500 hover:border-red-500 transition-all group shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-400 transition-colors">
                      <LogOut size={18} className="text-red-500 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-red-600 group-hover:text-white transition-colors">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default RecruiterNavbar;
