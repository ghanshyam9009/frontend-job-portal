import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { authService } from "../../services/authService";
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
  Phone,
  Star
} from "lucide-react";
import logo from "../../assets/favicon-icon.png";

const CandidateNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const effectiveUser = user ?? (authService.getToken() ? authService.getCurrentUser() : null) ?? null;
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
    setProfileCompletion(calculateProfileCompletion(effectiveUser));
  }, [effectiveUser]);

  const { theme, toggleTheme } = useTheme();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (isMobileMenuOpen || showProfileSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen, showProfileSidebar]);

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/userjoblistings?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchFocused(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isActive = (path) => pathname === path;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-700';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const dropdownBg = isDark ? 'bg-gray-900' : 'bg-white';
  const dropdownHover = isDark ? 'hover:bg-gray-800' : 'hover:bg-blue-50';

  const userName = effectiveUser?.full_name || effectiveUser?.name || `${effectiveUser?.firstName || ''} ${effectiveUser?.lastName || ''}`.trim() || 'User';
  const userInitial = userName.charAt(0)?.toUpperCase() || 'U';

  // Nav links config
  const navLinks = [
    { label: 'Home', path: '/candidate-home' },
    { label: 'Jobs', path: '/jobs' },
    { label: 'Membership', path: '/membership-plans' },
    { label: 'Government Jobs', path: '/government-jobs' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const mobileNavLinks = [
    { label: 'Home', path: '/candidate-home', icon: <Home size={18} /> },
    { label: 'Jobs', path: '/jobs', icon: <Briefcase size={18} /> },
    { label: 'Membership', path: '/membership-plans', icon: <CreditCard size={18} /> },
    { label: 'Government Jobs', path: '/government-jobs', icon: <Building size={18} /> },
    { label: 'About Us', path: '/about', icon: <Info size={18} /> },
    { label: 'Contact Us', path: '/contact', icon: <Phone size={18} /> },
  ];

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
        .profile-avatar-square {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #2271B5;
          font-size: 16px;
          cursor: pointer;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
          box-shadow: 0 1px 4px rgba(34,113,181,0.10);
        }
        .profile-avatar-square:hover {
          border-color: #2271B5;
          box-shadow: 0 0 0 3px rgba(34,113,181,0.15);
          transform: scale(1.05);
        }
        .profile-avatar-square.dark {
          border-color: #374151;
          background: #1f2937;
          color: #60a5fa;
        }
        .sidebar-avatar-square {
          width: 72px;
          height: 72px;
          border-radius: 12px;
          overflow: hidden;
          border: 3px solid #2271B5;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #2271B5;
          font-size: 28px;
          box-shadow: 0 4px 16px rgba(34,113,181,0.18);
          margin: 0 auto;
        }
        .sidebar-menu-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 14px;
          transition: background 0.18s, color 0.18s, transform 0.12s;
          cursor: pointer;
          border: none;
          background: transparent;
        }
        .sidebar-menu-btn:hover {
          transform: translateX(3px);
        }
        .sidebar-menu-btn .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(34,113,181,0.10);
          color: #2271B5;
          transition: background 0.18s;
          flex-shrink: 0;
        }
        .sidebar-menu-btn:hover .btn-icon {
          background: rgba(34,113,181,0.20);
        }
        .sidebar-menu-btn.danger .btn-icon {
          background: rgba(239,68,68,0.10);
          color: #ef4444;
        }
        .sidebar-menu-btn.danger:hover .btn-icon {
          background: rgba(239,68,68,0.20);
        }
        .logout-btn-desktop {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 8px;
          background: #ef4444;
          color: white;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 2px 6px rgba(239,68,68,0.25);
        }
        .logout-btn-desktop:hover {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239,68,68,0.35);
        }
        .progress-bar-track {
          width: 100%;
          height: 8px;
          border-radius: 99px;
          background: #e5e7eb;
          overflow: hidden;
        }
        .progress-bar-track.dark {
          background: #374151;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #2271B5, #5ba3e0);
          border-radius: 99px;
          transition: width 0.5s ease;
        }
        .mobile-nav-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 14px;
          transition: background 0.18s, color 0.18s;
          cursor: pointer;
          border: none;
          background: transparent;
        }
        .complete-profile-btn {
          display: block;
          width: 100%;
          margin-top: 12px;
          padding: 9px 16px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #2271B5, #1a5a8f);
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: opacity 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 2px 8px rgba(34,113,181,0.25);
        }
        .complete-profile-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(34,113,181,0.35);
        }
        .sidebar-slide-in {
          animation: slideInRight 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .divider-line {
          height: 1px;
          margin: 8px 0;
        }
      `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgColor} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/candidate-home" className="flex items-center space-x-2 text-xl lg:text-2xl font-bold flex-shrink-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                <img src={logo1} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className={textColor}>
                Big<span className="text-[#2271B5]">sources</span>.in
              </span>
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className={`nav-link-btn px-3 py-2 text-sm font-semibold transition-colors rounded-md ${isActive(link.path)
                      ? 'active text-[#2271B5]'
                      : `${textSecondary} hover:text-[#2271B5]`
                      }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Desktop Right Menu */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Profile Avatar */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className="w-12 h-12 rounded-xl bg-blue-50 text-[#2271B5] flex shadow-sm border border-gray-200 items-center justify-center font-bold hover:bg-blue-100 hover:shadow transition-all overflow-hidden"
                >
                  {user?.logo ? (
                    <img src={user.logo} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    userInitial
                  )}
                </button>
              </div>

              {/* Logout Button */}
              <button onClick={handleLogout} className="logout-btn-desktop">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              className={`lg:hidden p-2 rounded-md ${textSecondary} ${hoverBg} transition-colors`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* ─── Profile Sidebar ─── */}
        {showProfileSidebar && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowProfileSidebar(false)}
            />
            <div className={`fixed right-0 top-0 bottom-0 w-80 ${dropdownBg} shadow-2xl z-50 overflow-y-auto sidebar-slide-in`}>
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className={`text-lg font-bold ${textColor}`}>My Account</h3>
                  <button onClick={() => setShowProfileSidebar(false)} className={`p-1.5 rounded-lg ${hoverBg} ${textSecondary} transition-colors`}>
                    <X size={18} />
                  </button>
                </div>

                {/* Profile Info */}
                <div className={`mb-6 p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <div className="flex flex-col items-center justify-center text-center gap-2 mb-4">
                    <div
                      style={{ width: 220, height: 220 }}
                      className="rounded-xl bg-blue-50 text-[#2271B5] shadow-inner border border-blue-100 flex items-center justify-center text-3xl font-bold overflow-hidden mb-2"
                    >
                      {user?.logo ? (
                        <img
                          src={user.logo}
                          alt="Profile logo"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        (user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User').charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${textColor}`}>
                        {user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                      </div>
                      <div className={`text-sm ${textSecondary} mt-0.5 font-medium`}>
                        {user?.email || 'user@example.com'}
                      </div>
                    </div>
                  </div>

                  {/* Profile Completion */}
                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-semibold ${textSecondary}`}>Profile Status</span>
                      <span className={`text-sm font-bold text-[#2271B5]`}>{profileCompletion}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div className="h-2 bg-gradient-to-r from-blue-400 to-[#2271B5] rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }}></div>
                    </div>
                    <button
                      onMouseDown={() => { navigate('/profile'); setShowProfileSidebar(false); }}
                      className="block w-full mt-4 py-2.5 text-center text-sm font-bold text-white bg-[#2271B5] hover:bg-[#1a5a8f] shadow-md hover:shadow-lg rounded-lg transition-all"
                    >
                      Complete Profile
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-3">
                  <button
                    onMouseDown={() => { navigate('/my-applications'); setShowProfileSidebar(false); }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5] transition-all group`}
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                      <FileText size={18} className="text-[#2271B5] dark:text-blue-200 transition-colors" />
                    </div>
                    <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>My Applications</span>
                  </button>

                  <button
                    onMouseDown={() => { navigate('/shortlisted-jobs'); setShowProfileSidebar(false); }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-600 transition-all group`}
                  >
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/15 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/25 transition-colors">
                      <Star size={18} className="text-amber-500 dark:text-amber-200 transition-colors" />
                    </div>
                    <span className={`font-semibold ${textSecondary} group-hover:text-amber-600 transition-colors`}>Shortlisted Jobs</span>
                  </button>

                  <button
                    onMouseDown={() => { navigate('/saved-jobs'); setShowProfileSidebar(false); }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5] transition-all group`}
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                      <Heart size={18} className="text-[#2271B5] dark:text-blue-200 transition-colors" />
                    </div>
                    <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Saved Jobs</span>
                  </button>

                  <button
                    onMouseDown={() => { navigate('/userjoblistings'); setShowProfileSidebar(false); }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5] transition-all group`}
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                      <List size={18} className="text-[#2271B5] dark:text-blue-200 transition-colors" />
                    </div>
                    <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Job Listings</span>
                  </button>

                  <button
                    onMouseDown={() => { navigate('/membership-plans'); setShowProfileSidebar(false); }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} shadow-sm hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5] transition-all group`}
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                      <CreditCard size={18} className="text-[#2271B5] dark:text-blue-200 transition-colors" />
                    </div>
                    <span className={`font-semibold ${textSecondary} group-hover:text-[#2271B5] transition-colors`}>Membership Plans</span>
                  </button>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onMouseDown={() => { handleLogout(); setShowProfileSidebar(false); }}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border border-red-100 bg-red-50 hover:bg-red-500 hover:border-red-500 transition-all group shadow-sm`}
                    >
                      <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-400 transition-colors">
                        <LogOut size={18} className="text-red-500 group-hover:text-white transition-colors" />
                      </div>
                      <span className="font-bold text-red-600 group-hover:text-white transition-colors">Log Out Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── Mobile Sidebar Menu ─── */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={toggleMobileMenu}
            />

            {/* Drawer */}
            <div
              className={`fixed right-0 top-0 bottom-0 w-80 max-w-full ${dropdownBg} shadow-2xl z-50 overflow-y-auto sidebar-slide-in`}
            >
              <div className="p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-white">
                      <img
                        src={logo}
                        alt="Bigsources.in"
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
                        Candidate Panel
                      </p>
                      <p className={`text-sm font-bold ${textColor}`}>
                        Big<span className="text-[#2271B5]">sources</span>.in
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleMobileMenu}
                    className={`p-2 rounded-lg ${hoverBg} ${textSecondary} transition-colors`}
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Profile card */}
                <div
                  className={`mt-2 mb-2 p-4 rounded-xl shadow-sm border flex flex-col items-center text-center gap-2 ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl bg-blue-50 text-[#2271B5] shadow-inner border border-blue-100 flex items-center justify-center text-2xl font-bold overflow-hidden mb-1.5">
                    {user?.logo ? (
                      <img
                        src={user.logo}
                        alt="Profile logo"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      (user?.full_name ||
                        user?.name ||
                        `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
                        'User')
                        .charAt(0)
                        ?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <div className={`text-base font-bold ${textColor}`}>
                      {user?.full_name ||
                        user?.name ||
                        `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
                        'User'}
                    </div>
                    <div className={`text-xs ${textSecondary} mt-0.5 font-medium`}>
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>

                  {/* Profile status */}
                  <div className="w-full mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-semibold ${textSecondary}`}>Profile Status</span>
                      <span className="text-xs font-bold text-[#2271B5]">{profileCompletion}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-[#2271B5] transition-all duration-500"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        toggleMobileMenu();
                      }}
                      className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#2271B5] hover:bg-[#1a5a8f] shadow-sm transition-all w-full"
                    >
                      <User size={14} />
                      Complete Profile
                    </button>
                  </div>
                </div>

                {/* Navigation items */}
                <div className="mt-3 space-y-4">
                  <div>
                    <p className={`text-[11px] font-semibold tracking-[0.18em] uppercase mb-2 ${textSecondary}`}>
                      Navigation
                    </p>
                    <div className="space-y-2">
                      {mobileNavLinks.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            closeMobileMenu();
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all group ${
                            isActive(item.path)
                              ? 'border-[#2271B5] bg-blue-50 text-[#2271B5]'
                              : isDark
                              ? 'border-gray-700 bg-gray-800 text-gray-200'
                              : 'border-gray-100 bg-white text-gray-700 hover:border-[#2271B5] hover:bg-blue-50 hover:text-[#2271B5]'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                            {item.icon}
                          </div>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className={`mt-3 text-[11px] font-semibold tracking-[0.18em] uppercase mb-2 ${textSecondary}`}>
                      Account
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          navigate('/my-applications');
                          closeMobileMenu();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all group ${
                          isActive('/my-applications')
                            ? 'border-[#2271B5] bg-blue-50 text-[#2271B5]'
                            : isDark
                            ? 'border-gray-700 bg-gray-800 text-gray-200'
                            : 'border-gray-100 bg-white text-gray-700 hover:border-[#2271B5] hover:bg-blue-50 hover:text-[#2271B5]'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                          <FileText size={18} className="text-[#2271B5]" />
                        </div>
                        <span>My Applications</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/saved-jobs');
                          closeMobileMenu();
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all group ${
                          isActive('/saved-jobs')
                            ? 'border-[#2271B5] bg-blue-50 text-[#2271B5]'
                            : isDark
                            ? 'border-gray-700 bg-gray-800 text-gray-200'
                            : 'border-gray-100 bg-white text-gray-700 hover:border-[#2271B5] hover:bg-blue-50 hover:text-[#2271B5]'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#2271B5]/15 group-hover:bg-blue-100 dark:group-hover:bg-[#2271B5]/25 transition-colors">
                          <Heart size={18} className="text-[#2271B5]" />
                        </div>
                        <span>Saved Jobs</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-red-100 bg-red-50 hover:bg-red-500 hover:border-red-500 transition-all group shadow-sm"
                  >
                    <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-400 transition-colors">
                      <LogOut size={18} className="text-red-500 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-red-600 group-hover:text-white transition-colors">
                      Log Out Account
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );
};

export default CandidateNavbar;