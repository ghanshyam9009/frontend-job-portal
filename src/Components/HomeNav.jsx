import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Home, Briefcase, Building, Info, Phone, CreditCard, X } from 'lucide-react';
import logo from "../assets/logo.png";

const HomeNav = () => {
  const [theme, setTheme] = useState('light');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
    
  const isActive = (path) => {
    return pathname === path;
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: <Home size={18} /> },
    { label: 'Jobs', path: '/jobs', icon: <Briefcase size={18} /> },
    { label: 'Government Jobs', path: '/government-jobs', icon: <Building size={18} /> },
    { label: 'About Us', path: '/about', icon: <Info size={18} /> },
    { label: 'Contact Us', path: '/contact', icon: <Phone size={18} /> },
    { label: 'Membership', path: '/membership', icon: <CreditCard size={18} /> },
  ];

  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.employer-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Theme-based colors
  const isDark = theme == 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  // Only use transparent background effect on home page
  const isHomePage = pathname === '/';
  
  const textColor = (isDark ? 'text-white' : 'text-gray-900')

  // When not scrolled on home page, use white/light colors that show on any background
  const textSecondary = isDark ? 'text-gray-300' : 'text-black'
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
        .divider-line {
          height: 1px;
          margin: 10px 0;
        }
      `}</style>

    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgColor} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl lg:text-2xl font-bold">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
              <img src={logo} alt="Bigsources logo" loading="lazy" decoding="async" />
            </div>
            <span className={textColor}>
             Big<span className="text-[#2271B5]">sources</span>.in
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link-btn px-3 py-2 text-sm font-semibold transition-colors rounded-md ${isActive(link.path)
                    ? 'active text-[#2271B5]'
                    : `${textSecondary} hover:text-[#2271B5]`
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* <li className="relative">
              <button
                onClick={() => setShowCareerDropdown(!showCareerDropdown)}
                className={`flex items-center gap-1 text-sm font-bold transition-colors ${
                  showCareerDropdown
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                <span>Career</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              {showCareerDropdown && (
                <div className={`absolute top-full left-0 mt-2 w-48 ${dropdownBg} rounded-md shadow-lg py-1 border ${borderColor}`}>
                  <Link
                    to="/career-services"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover}`}
                  >
                    Job Seeker Services
                  </Link>
                  <Link
                    to="/fast-track"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover}`}
                  >
                    Fast Track Career
                  </Link>
                  <Link
                    to="/premium-seeker"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover}`}
                  >
                    Premium Seeker
                  </Link>
                </div>
              )}
            </li> */}
          </ul>

          {/* Desktop Right Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              to="/candidate/login"
              className={`px-4 py-2 text-sm font-bold text-[#2271B5] hover:text-[#1a5a8f] rounded-md transition-colors ${
                isDark ? 'hover:bg-[#2271B5]/20' : 'hover:bg-[#2271B5]/10'
           
              }`}
            >
              Candidate Login
            </Link>

            <div className="relative employer-dropdown">
              <Link
                to="/recruiter/login"
                className="flex items-center space-x-1 px-4 py-2 text-sm font-bold text-white bg-[#2271B5] hover:bg-[#1a5a8f] rounded-md transition-colors"
              >
                <span>Recruiter Login</span>
              </Link>
              {showDropdown && (
                <div className={`absolute top-full right-0 mt-2 w-48 ${dropdownBg} rounded-md shadow-lg py-1 border ${borderColor}`}>
                  
                  <Link
                    to="/admin/login"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover}`}
                  >
                    Admin Login
                  </Link>
                </div>
              )}
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        >
          <div
            className={`fixed right-0 top-0 bottom-0 w-80 ${bgColor} shadow-xl overflow-y-auto sidebar-slide-in`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-6">
                <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                    <img src={logo} alt="Bigsources logo" loading="lazy" decoding="async" />
                  </div>
                  <span className={textColor}>
                    Big<span className="text-[#2271B5]">sources</span>.in
                  </span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className={`p-2 rounded-md ${textSecondary} ${hoverBg}`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <p className={`text-xs font-semibold uppercase tracking-wider px-2 mb-2 ${textSecondary} opacity-60`}>Navigation</p>
              <ul className="space-y-1 mb-6">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all group ${isActive(link.path)
                        ? `border-[#2271B5] ${isDark ? 'bg-[#2271B5]/15' : 'bg-blue-50'} text-[#2271B5]`
                        : `${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white shadow-sm'} ${textSecondary} hover:border-[#2271B5] hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#2271B5]`
                        }`}
                      onClick={closeMobileMenu}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${isActive(link.path)
                        ? (isDark ? 'bg-[#2271B5]/25' : 'bg-blue-100')
                        : (isDark ? 'bg-[#2271B5]/15 group-hover:bg-[#2271B5]/25' : 'bg-blue-50 group-hover:bg-blue-100')
                        }`}>
                        {React.cloneElement(link.icon, {
                          className: `transition-colors ${isActive(link.path)
                            ? (isDark ? 'text-blue-300' : 'text-[#2271B5]')
                            : (isDark ? 'text-blue-200 group-hover:text-blue-300' : 'text-[#2271B5] group-hover:text-[#1a5a8f]')
                            }`
                        })}
                      </div>
                      <span className="font-semibold">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Mobile Auth Buttons */}
              <div className={`space-y-3 pt-6 border-t ${borderColor}`}>
                <Link
                  to="/candidate/login"
                  className={`block w-full px-4 py-3 text-center text-sm font-medium text-[#2271B5] rounded-md transition-colors ${
                    isDark ? 'bg-[#2271B5]/20 hover:bg-[#2271B5]/30' : 'bg-[#2271B5]/10 hover:bg-[#2271B5]/20'
                  }`}
                  onClick={closeMobileMenu}
                >
                  Candidate Login
                </Link>

                <div className="space-y-2">
                  <Link
                    to="/recruiter/login"
                    className={`block w-full px-4 py-3 text-center text-sm font-bold text-white bg-[#2271B5] hover:bg-[#1a5a8f] rounded-md transition-colors`}
                    onClick={closeMobileMenu}
                  >
                    Recruiter Login
                  </Link>
                 
                  
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

export default HomeNav;
