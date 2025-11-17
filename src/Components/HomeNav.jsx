import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from 'lucide-react';
import logo from "../assets/logo.png";

const HomeNav = () => {
  const [theme, setTheme] = useState('light');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
    
  const isActive = (path) => {
    return currentPath === path;
  };

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
  const isHomePage = currentPath === '/';
  
  const textColor = (isDark ? 'text-white' : 'text-gray-900')

  // When not scrolled on home page, use white/light colors that show on any background
  const textSecondary = isDark ? 'text-gray-300' : 'text-black'
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const dropdownBg = isDark ? 'bg-gray-800' : 'bg-white';
  const dropdownHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl lg:text-2xl font-bold">
            <div className="w-18 h-18 rounded-lg flex items-center justify-center text-white">
              <img src={logo} alt="" />
            </div>
            <span className={textColor}>
              Big<span className="text-[#2271B5]">sources</span>.in
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex font-bold items-center gap-6">
            <li>
              <Link
                to="/"
                className={`text-sm font-bold  transition-colors ${
                  isActive("/")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className={`text-sm font-bold transition-colors ${
                  isActive("/jobs")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                Job
              </Link>
            </li>
            <li>
              <Link
                to="/government-jobs"
                className={`text-sm font-bold transition-colors ${
                  isActive("/government-jobs")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                Government Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={`text-sm font-bold transition-colors ${
                  isActive("/about")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={`text-sm font-bold transition-colors ${
                  isActive("/contact")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/membership"
                className={`text-sm font-bold transition-colors ${
                  isActive("/membership")
                    ? "text-[#2271B5]"
                    : `${textSecondary} hover:text-[#2271B5]`
                }`}
              >
                Membership
              </Link>
            </li>
            <li className="relative">
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
            </li>
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
                <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white">
                    <img src={logo} alt="" />
                  </div>
                  <span className={textColor}>
                    Big<span className="text-[#2271B5]">sources</span>.in
                  </span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className={`p-2 rounded-md ${textSecondary} ${hoverBg}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <ul className="space-y-1 mb-6">
                <li>
                  <Link
                    to="/"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/jobs"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/jobs")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Job Listings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/government-jobs"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/government-jobs")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Government Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/about")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/contact")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/membership"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/membership")
                        ? `text-[#2271B5] ${isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Membership
                  </Link>
                </li>
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
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover} rounded-md transition-colors`}
                    onClick={closeMobileMenu}
                  >
                    Recruiter Login
                  </Link>
                  <Link
                    to="/admin/login"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover} rounded-md transition-colors`}
                    onClick={closeMobileMenu}
                  >
                    Admin Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default HomeNav;
