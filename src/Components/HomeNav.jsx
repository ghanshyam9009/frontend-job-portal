import React, { useState, useEffect } from "react";
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
console.log(currentPath)
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
  
  const textColor = isMobileMenuOpen
    ? (isDark ? 'text-white' : 'text-gray-900')
    : (isHomePage && !isScrolled
        ? 'text-white'
        : (isDark ? 'text-white' : 'text-gray-900'));

  // When not scrolled on home page, use white/light colors that show on any background
  const textSecondary = isMobileMenuOpen 
    ? (isDark ? 'text-gray-300' : 'text-gray-700')
    : (isHomePage && !isScrolled
        ? 'text-gray-300'
        : (isDark ? 'text-gray-300' : 'text-gray-700'));
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const dropdownBg = isDark ? 'bg-gray-800' : 'bg';
  const dropdownHover = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50';


  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? `${bgColor} shadow-md` 
        : 'bg-transparent shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 text-xl lg:text-2xl font-bold">
            <div className="w-10 h-10  rounded-lg flex items-center justify-center text-white">
             <img src={logo} alt="" />
            </div>
            <span className={textColor}>
              Big<span className="text-blue-600">sources</span>.in
            </span>
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-6">
            <li>
              <a
                href="/"
                className={`text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-blue-600"
                    : `${textSecondary} hover:text-blue-600`
                }`}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/jobs"
                className={`text-sm font-medium transition-colors ${
                  isActive("/jobs")
                    ? "text-blue-600"
                    : `${textSecondary} hover:text-blue-600`
                }`}
              >
                Job
              </a>
            </li>
            <li>
              <a
                href="/government-jobs"
                className={`text-sm font-medium transition-colors ${
                  isActive("/government-jobs")
                    ? "text-blue-600"
                    : `${textSecondary} hover:text-blue-600`
                }`}
              >
                Government Jobs
              </a>
            </li>
            <li>
              <a
                href="/about"
                className={`text-sm font-medium transition-colors ${
                  isActive("/about")
                    ? "text-blue-600"
                    : `${textSecondary} hover:text-blue-600`
                }`}
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className={`text-sm font-medium transition-colors ${
                  isActive("/contact")
                    ? "text-blue-600"
                    : `${textSecondary} hover:text-blue-600`
                }`}
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="/membership"
                className={`text-sm font-medium transition-colors ${
                  isActive("/membership")
                    ? "text-blue-600"
                    : `${textSecondary} hover:text-blue-600`
                }`}
              >
                Membership
              </a>
            </li>
            <li className="relative">
              <button
                onClick={() => setShowCareerDropdown(!showCareerDropdown)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  showCareerDropdown
                    ? "text-blue-600"
                    : `${textSecondary} hover:text-blue-600`
                }`}
              >
                <span>Career</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              {showCareerDropdown && (
                <div className={`absolute top-full left-0 mt-2 w-48 ${dropdownBg} rounded-md shadow-lg py-1 border ${borderColor}`}>
                  <a
                    href="/career-services"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover}`}
                  >
                    Job Seeker Services
                  </a>
                  <a
                    href="/fast-track"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover}`}
                  >
                    Fast Track Career
                  </a>
                  <a
                    href="/premium-seeker"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover}`}
                  >
                    Premium Seeker
                  </a>
                </div>
              )}
            </li>
          </ul>

          {/* Desktop Right Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            

            <a
              href="/candidate/login"
              className={`px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 rounded-md transition-colors ${
                isDark ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'
              }`}
            >
              Candidate Login
            </a>

            <div className="relative employer-dropdown">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <span>For Employers</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              {showDropdown && (
                <div className={`absolute top-full right-0 mt-2 w-48 ${dropdownBg} rounded-md shadow-lg py-1 border ${borderColor}`}>
                  <a
                    href="/recruiter/login"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover}`}
                  >
                    Recruiter Login
                  </a>
                  <a
                    href="/admin/login"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover}`}
                  >
                    Admin Login
                  </a>
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
                <a href="/" className="flex items-center space-x-2 text-xl font-bold">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                    B
                  </div>
                  <span className={textColor}>
                    Big<span className="text-blue-600">sources</span>.in
                  </span>
                </a>
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
                  <a
                    href="/"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/")
                        ? `text-blue-600 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/jobs"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/jobs")
                        ? `text-blue-600 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Job Listings
                  </a>
                </li>
                <li>
                  <a
                    href="/government-jobs"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/government-jobs")
                        ? `text-blue-600 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Government Jobs
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/about")
                        ? `text-blue-600 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/contact")
                        ? `text-blue-600 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="/membership"
                    className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive("/membership")
                        ? `text-blue-600 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`
                        : `${textSecondary} ${dropdownHover}`
                    }`}
                    onClick={closeMobileMenu}
                  >
                    Membership
                  </a>
                </li>
              </ul>

              {/* Mobile Auth Buttons */}
              <div className={`space-y-3 pt-6 border-t ${borderColor}`}>
                <a
                  href="/candidate/login"
                  className={`block w-full px-4 py-3 text-center text-sm font-medium text-blue-600 rounded-md transition-colors ${
                    isDark ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  Candidate Login
                </a>

                <div className="space-y-2">
                  <h4 className={`px-4 text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    For Employers
                  </h4>
                  <a
                    href="/recruiter/login"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover} rounded-md transition-colors`}
                    onClick={closeMobileMenu}
                  >
                    Recruiter Login
                  </a>
                  <a
                    href="/admin/login"
                    className={`block px-4 py-2 text-sm ${textSecondary} ${dropdownHover} rounded-md transition-colors`}
                    onClick={closeMobileMenu}
                  >
                    Admin Login
                  </a>
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