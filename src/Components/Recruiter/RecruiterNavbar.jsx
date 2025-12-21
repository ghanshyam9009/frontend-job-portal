import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
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
            setRecruiterProfile(prev => ({
              ...prev,
              ...profileData,
              company_logo: profileData.company_logo || profileData.logo || profileData.profile_image || prev?.company_logo
            }));
          }
        } catch (err) {
          console.error('Failed to fetch recruiter profile:', err);
        }
      }
    };

    fetchRecruiterProfile();
  }, [user?.email]);

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

    fetchApplicationCount();
    const interval = setInterval(fetchApplicationCount, 30000);
    return () => clearInterval(interval);
  }, [user?.employer_id, user?.id]);

  // Update current path on navigation
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [window.location.pathname]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileSidebar(false);
      }
    };

    if (showProfileSidebar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileSidebar]);

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

  const isActive = (path) => {
    return currentPath === path;
  };

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgColor} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/recruiter/dashboard" className="flex items-center space-x-2 text-xl lg:text-2xl font-bold">
            <div className="w-18 h-18 rounded-lg flex items-center justify-center text-white">
              <img src={logo1} alt="Logo" />
            </div>
            <span className={textColor}>
              Big<span className="text-[#2271B5]">sources</span>.in
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex font-bold items-center gap-6">
            <li>
              <button
                onClick={() => navigate('/')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive("/")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/recruiter/dashboard')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive("/recruiter/dashboard")
                    ? "text-[#2271B5]"
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
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  !canAccessJobFeatures 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isActive("/post-job")
                      ? "text-[#2271B5]"
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
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  !canAccessJobFeatures 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isActive("/manage-jobs")
                      ? "text-[#2271B5]"
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
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  !canAccessJobFeatures 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isActive("/jobs")
                      ? "text-[#2271B5]"
                      : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Jobs</span>
               
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/company-profile')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive("/company-profile")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Company Profile</span>
              </button>
            </li>
          
          </ul>

          {/* Desktop Right Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold ${textSecondary} ${hoverBg} rounded-md transition-colors`}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>

            {/* Profile Avatar */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full bg-[#2271B5] text-white flex items-center justify-center font-bold hover:bg-[#1a5a8f] transition-colors overflow-hidden"
              >
                {recruiterProfile?.company_logo ? (
                  <img
                    src={recruiterProfile.company_logo}
                    alt="Company Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  (recruiterProfile?.name || recruiterProfile?.company_name || 'R').charAt(0)?.toUpperCase()
                )}
              </button>
            </div>
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
            <div className="p-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${textColor}`}>Profile Menu</h3>
                <button
                  onClick={() => setShowProfileSidebar(false)}
                  className={`p-2 rounded-md ${textSecondary} ${hoverBg}`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Profile Info */}
              <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#2271B5] text-white flex items-center justify-center text-xl font-bold overflow-hidden">
                    {recruiterProfile?.company_logo ? (
                      <img
                        src={recruiterProfile.company_logo}
                        alt="Company Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      (recruiterProfile?.name || recruiterProfile?.company_name || 'R').charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className={`font-bold ${textColor}`}>
                      {recruiterProfile?.company_name || recruiterProfile?.name || 'Company'}
                    </div>
                    <div className={`text-sm ${textSecondary}`}>
                      {user?.email || 'recruiter@example.com'}
                    </div>
                  </div>
                </div>

                {/* Access Status */}
                {!canAccessJobFeatures && (
                  <div className="mt-4 p-3 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      {restrictionMessage}
                    </p>
                  </div>
                )}

                {/* Quick Action */}
                <button
                  onMouseDown={() => { navigate('/company-profile'); setShowProfileSidebar(false); }}
                  className="block w-full mt-3 px-4 py-2 text-center text-sm font-bold text-white bg-[#2271B5] hover:bg-[#1a5a8f] rounded-md transition-colors"
                >
                  {canAccessJobFeatures ? 'Edit Company Profile' : 'Complete Profile'}
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <button
                  onMouseDown={() => { navigate('/recruiter/dashboard'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                >
                  <LayoutDashboard size={18} />
                  <span className="font-medium">Dashboard</span>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${
                    !canAccessJobFeatures ? 'opacity-50 cursor-not-allowed' : `${textSecondary} ${dropdownHover}`
                  } transition-colors`}
                >
                  <Plus size={18} />
                  <span className="font-medium">Post Job</span>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${
                    !canAccessJobFeatures ? 'opacity-50 cursor-not-allowed' : `${textSecondary} ${dropdownHover}`
                  } transition-colors`}
                >
                  <FileText size={18} />
                  <span className="font-medium">Manage Jobs</span>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${
                    !canAccessJobFeatures ? 'opacity-50 cursor-not-allowed' : `${textSecondary} ${dropdownHover}`
                  } transition-colors`}
                >
                  <Users size={18} />
                  <span className="font-medium">Jobs</span>
                  

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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${
                    !canAccessJobFeatures ? 'opacity-50 cursor-not-allowed' : `${textSecondary} ${dropdownHover}`
                  } transition-colors`}
                >
                  <Star size={18} />
                  <span className="font-medium">Shortlist</span>
                </button>
                <button
                  onMouseDown={() => { navigate('/company-profile'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                >
                  <Building size={18} />
                  <span className="font-medium">Company Profile</span>
                </button>
                <button
                  onMouseDown={() => { navigate('/membership-tokens'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                >
                  <CreditCard size={18} />
                  <span className="font-medium">Membership</span>
                </button>
                <button
                  onMouseDown={() => { handleLogout(); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        >
          <div
            className={`fixed right-0 top-0 bottom-0 w-80 ${bgColor} shadow-xl overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-6">
                <Link to="/recruiter/dashboard" className="flex items-center space-x-2 text-xl font-bold">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <img src={logo1} alt="Logo" className="w-full h-full object-contain" />
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

              {/* Mobile Navigation Links */}
              <ul className="space-y-1 mb-6">
                <li>
                  <button
                    onClick={() => { navigate('/'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Home size={18} />
                    <span>Home</span>
                  </button>
                </li>
                  <li>
                  <button
                    onClick={() => { navigate('/recruiter/dashboard'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/recruiter/dashboard")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Hospital size={18} />
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      !canAccessJobFeatures
                        ? 'opacity-50 cursor-not-allowed'
                        : isActive("/post-job")
                          ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                          : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Plus size={18} />
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      !canAccessJobFeatures
                        ? 'opacity-50 cursor-not-allowed'
                        : isActive("/manage-jobs")
                          ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                          : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <FileText size={18} />
                    <span>Manage Jobs</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { 
                      if (!canAccessJobFeatures) {
                        alert(restrictionMessage);
                      } else {
                        navigate('/candidate-applications'); 
                        closeMobileMenu();
                      }
                    }}
                    disabled={!canAccessJobFeatures}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      !canAccessJobFeatures
                        ? 'opacity-50 cursor-not-allowed'
                        : isActive("/jobs")
                          ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                          : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Users size={18} />
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      !canAccessJobFeatures
                        ? 'opacity-50 cursor-not-allowed'
                        : isActive("/shortlist-candidates")
                          ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                          : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Star size={18} />
                    <span>Shortlist</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('/company-profile'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/company-profile")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Building size={18} />
                    <span>Company Profile</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('/membership-tokens'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/membership-tokens")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>Membership</span>
                  </button>
                </li>
              </ul>


              {/* Mobile Profile Section */}
              <div onClick={() => { navigate('/company-profile'); closeMobileMenu(); }} className={`pt-6 border-t ${borderColor}`}>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2271B5] text-white flex items-center justify-center text-xl font-bold overflow-hidden">
                      {recruiterProfile?.company_logo ? (
                        <img
                          src={recruiterProfile.company_logo}
                          alt="Company Logo"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        (recruiterProfile?.name || recruiterProfile?.company_name || 'R').charAt(0)?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className={`font-bold ${textColor}`}>
                        {recruiterProfile?.company_name || recruiterProfile?.name || 'Company'}
                      </div>
                      <div className={`text-sm ${textSecondary}`}>
                        {user?.email || 'recruiter@example.com'}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onMouseDown={() => { navigate('/company-profile'); closeMobileMenu(); }}
                    className="block w-full mt-3 px-4 py-2 text-center text-sm font-bold text-white bg-[#2271B5] hover:bg-[#1a5a8f] rounded-md transition-colors"
                  >
                    Edit Company Profile
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => { navigate('/recruiter/dashboard'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                  >
                    <LayoutDashboard size={18} />
                    <span className="font-medium">Dashboard</span>
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                  >
                    <Settings size={18} />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-red-500 ${dropdownHover} transition-colors`}
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default RecruiterNavbar;
