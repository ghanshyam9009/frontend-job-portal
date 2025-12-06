import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import logo1 from "../../assets/logo.png";

import { 
  Sun, 
  Moon, 
  Search, 
  FileText, 
  Heart, 
  List, 
  Home, 
  CreditCard, 
  User, 
  LogOut, 
  X, 
  Briefcase, 
  Building, 
  Info, 
  Phone 
} from "lucide-react";
import logo from "../../assets/favicon-icon.png";

const CandidateNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const calculateProfileCompletion = (user) => {
      if (!user) return 0;
      let score = 0;
      const totalPoints = 12;

      if (user.full_name && user.full_name.trim()) score++;
      if (user.phone_number && user.phone_number.trim()) score++;
      if (user.dob && user.dob.trim()) score++;
      if (user.gender && user.gender.trim()) score++;
      if (user.address?.city && user.address.city.trim()) score++;
      if (user.address?.state && user.address.state.trim()) score++;
      if (user.address?.country && user.address.country.trim()) score++;
      if (user.bio && user.bio.trim()) score++;
      if (user.skills && user.skills.trim()) score++;
      if (user.resume) score++;
      if (Array.isArray(user.education) && user.education.length > 0 && user.education.some(edu => edu.degree?.trim() && edu.institution?.trim())) score++;
      if (user.experienceLevel === 'Fresher' || (Array.isArray(user.experience) && user.experience.length > 0 && user.experience.some(exp => exp.title?.trim() && exp.company?.trim()))) score++;

      return Math.round((score / totalPoints) * 100);
    };
    setProfileCompletion(calculateProfileCompletion(user));
  }, [user]);
  const { theme, toggleTheme } = useTheme();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

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

  // Close career dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCareerDropdown && !event.target.closest('.career-dropdown')) {
        setShowCareerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCareerDropdown]);

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/userjoblistings?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchFocused(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setIsSearchFocused(false), 200);
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
          <Link to="/candidate-home" className="flex items-center space-x-2 text-xl lg:text-2xl font-bold">
                     <div className="w-18 h-18 rounded-lg flex items-center justify-center text-white">
                       <img src={logo1} alt="" />
                     </div>
                     <span className={textColor}>
                      Big<span className="text-[#2271B5]">sources</span>.in
                     </span>
                   </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex font-bold items-center gap-6">
            <li>
              <button
                onClick={() => navigate('/candidate-home')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive("/candidate-home")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                {/* <Home size={18} /> */}
                <span>Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/jobs')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive("/jobs")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                {/* <Home size={18} /> */}
                <span>Jobs</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/membership-plans')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive("/membership-plans")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                {/* <CreditCard size={18} /> */}
                <span>Membership</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/government-jobs')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive("/government-jobs")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                {/* <Building size={18} /> */}
                <span>Government Jobs</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/about')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive("/about")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                {/* <Info size={18} /> */}
                <span>About Us</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/contact')}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isActive("/contact")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                {/* <Phone size={18} /> */}
                <span>Contact Us</span>
              </button>
            </li>
          </ul>

          

          {/* Desktop Right Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle */}
            {/* <button
              onClick={handleThemeToggle}
              className={`p-2 rounded-md ${textSecondary} ${hoverBg} transition-colors`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button> */}

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
                className="w-10 h-10 rounded-full bg-[#2271B5] text-white flex items-center justify-center font-bold hover:bg-[#1a5a8f] transition-colors"
              >
                {(user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'C').charAt(0)?.toUpperCase() || 'C'}
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
                  <div className="w-12 h-12 rounded-full bg-[#2271B5] text-white flex items-center justify-center text-xl font-bold">
                    {(user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User').charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className={`font-bold ${textColor}`}>
                      {user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                    </div>
                    <div className={`text-sm ${textSecondary}`}>
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${textSecondary}`}>Profile Completion</span>
                    <span className={`text-sm font-bold ${textColor}`}>{profileCompletion}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <div className="h-2 bg-[#2271B5] rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                  </div>
                  <p className={`text-xs mt-2 ${textSecondary}`}>
                    Complete your profile to get better job matches
                  </p>
                  <button
                    onMouseDown={() => { navigate('/profile'); setShowProfileSidebar(false); }}
                    className="block w-full mt-3 px-4 py-2 text-center text-sm font-bold text-white bg-[#2271B5] hover:bg-[#1a5a8f] rounded-md transition-colors"
                  >
                    Complete Profile
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <button
                  onMouseDown={() => { navigate('/my-applications'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                >
                  <FileText size={18} />
                  <span className="font-medium">My Applications</span>
                </button>
                <button
                  onMouseDown={() => { navigate('/saved-jobs'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                >
                  <Heart size={18} />
                  <span className="font-medium">Saved Jobs</span>
                </button>
                <button
                  onMouseDown={() => { navigate('/userjoblistings'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                >
                  <List size={18} />
                  <span className="font-medium">Job Listings</span>
                </button>
                <button
                  onMouseDown={() => { navigate('/membership-plans'); setShowProfileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                >
                  <CreditCard size={18} />
                  <span className="font-medium">Membership Plans</span>
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
                <Link to="/candidate-home" className="flex items-center space-x-2 text-xl font-bold">
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
                    onClick={() => { navigate('/candidate-home'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/candidate-home")
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
                    onClick={() => { navigate('/candidate-home'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/candidate-home")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Home size={18} />
                    <span>Jobs</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('/membership-plans'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/membership-plans")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>Membership</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('/government-jobs'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/government-jobs")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Building size={18} />
                    <span>Government Jobs</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('/about'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/about")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Info size={18} />
                    <span>About Us</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate('/contact'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/contact")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                  >
                    <Phone size={18} />
                    <span>Contact Us</span>
                  </button>
                </li>
              </ul>

              {/* Mobile Profile Section */}
              <div  onClick={() => { navigate('/profile'); closeMobileMenu();}} className={`pt-6 border-t ${borderColor}`}>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>

                  <div className="flex items-center gap-3">
                    <div   className="w-12 h-12 rounded-full bg-[#2271B5] text-white flex items-center justify-center text-xl font-bold">
                      {(user?.full_name || 'U').charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className={`font-bold ${textColor}`}>
                        {user?.full_name || user?.name || 'User'}
                      </div>
                      <div className={`text-sm ${textSecondary}`}>
                        {user?.email || 'user@example.com'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Completion */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${textSecondary}`}>Profile Completion</span>
                    <span className={`text-sm font-bold ${textColor}`}>{profileCompletion}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}>
                    <div className="h-2 bg-[#2271B5] rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                  </div>
                  <p className={`text-xs mt-2 ${textSecondary}`}>
                    Complete your profile to get better job matches
                  </p>
                  <button
                    onMouseDown={() => { navigate('/profile'); setShowProfileSidebar(false); }}
                    className="block w-full mt-3 px-4 py-2 text-center text-sm font-bold text-white bg-[#2271B5] hover:bg-[#1a5a8f] rounded-md transition-colors"
                  >
                    Complete Profile
                  </button>
                </div>
                  
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => { navigate('/my-applications'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                  >
                    <FileText size={18} />
                    <span className="font-medium">My Applications</span>
                  </button>
                  <button
                    onClick={() => { navigate('/saved-jobs'); closeMobileMenu(); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md ${textSecondary} ${dropdownHover} transition-colors`}
                  >
                    <Heart size={18} />
                    <span className="font-medium">Saved Jobs</span>
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

export default CandidateNavbar;
