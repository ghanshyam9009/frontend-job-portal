import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./HomeNav.module.css";
import logo from "../assets/favicon-icon.png";

const HomeNav = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
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
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Fixed dropdown handlers
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(`.${styles.dropdown}`)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <img src={logo} alt="JobPortal Logo" />
          <span>Bigsources Manpower Solution</span>
        </div>

        {/* Desktop Navigation */}
        <ul className={styles.navLinks}>
          <li>
            <a href="/" className={isActive("/") ? styles.active : ""}>
              Home
            </a>
          </li>
          <li>
            <a href="/jobs" className={isActive("/jobs") ? styles.active : ""}>
              Job Listings
            </a>
          </li>
          <li>
            <a href="/government-jobs" className={isActive("/government-jobs") ? styles.active : ""}>
              Government Jobs
            </a>
          </li>
          <li>
            <a href="/about" className={isActive("/about") ? styles.active : ""}>
              About Us
            </a>
          </li>
          <li>
            <a
              href="/contact"
              className={isActive("/contact") ? styles.active : ""}
            >
              Contact Us
            </a>
          </li>
          <li>
            <a href="/membership" className={isActive("/membership") ? styles.active : ""}>
              Membership
            </a>
          </li>
          <li className={styles.dropdown}>
            <a
              href="#"
              onClick={() => setShowCareerDropdown(!showCareerDropdown)}
              className={showCareerDropdown ? styles.active : ""}
            >
              Career
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={styles.dropdownArrow}>
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </a>
            {showCareerDropdown && (
              <div className={styles.dropdownContent}>
                <a href="/career-services">Job Seeker Services</a>
                <a href="#">Fast Track Career</a>
                <a href="#">Premium Seeker</a>
              </div>
            )}
          </li>
        </ul>

        {/* Desktop Right Menu */}
        <div className={styles.rightMenu}>
          <form className={styles.searchForm}>
           
            <button type="submit" className={styles.searchBtn}>
             
            </button>
          </form>
          
          <div className={styles.authButtons}>
            <a href="/candidate/login" className={styles.candidateBtn}>
              Login / Signup
            </a>
            <div className={styles.dropdown}>
              <button className={styles.dropdownBtn} onClick={toggleDropdown}>
                For Employers
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={styles.dropdownArrow}>
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
              {showDropdown && (
                <div className={styles.dropdownContent}>
                  <a href="/recruiter/login">Recruiter Login</a>
                  <a href="/admin/login">Admin Login</a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu}>
          <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.open : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu}>
            <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
              <div className={styles.mobileMenuHeader}>
                <div className={styles.mobileLogo}>
                  <img src={logo} alt="JobPortal Logo" />
                </div>
                <button className={styles.closeBtn} onClick={closeMobileMenu}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Mobile Search */}
              <form className={styles.mobileSearchForm}>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className={styles.mobileSearch}
                />
                <button type="submit" className={styles.mobileSearchBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.71 20.29l-5.4-5.4a9 9 0 10-1.42 1.42l5.4 5.4a1 1 0 001.42-1.42zM11 18a7 7 0 117-7 7 7 0 01-7 7z"/>
                  </svg>
                </button>
              </form>

              {/* Mobile Navigation Links */}
              <ul className={styles.mobileNavLinks}>
                <li>
                  <a 
                    href="/" 
                    className={isActive("/") ? styles.active : ""} 
                    onClick={closeMobileMenu}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="/jobs" 
                    className={isActive("/jobs") ? styles.active : ""} 
                    onClick={closeMobileMenu}
                  >
                    Job Listings
                  </a>
                </li>
                <li>
                  <a 
                    href="/government-jobs" 
                    className={isActive("/government-jobs") ? styles.active : ""} 
                    onClick={closeMobileMenu}
                  >
                    Government Jobs
                  </a>
                </li>
                <li>
                  <a 
                    href="/about" 
                    className={isActive("/about") ? styles.active : ""} 
                    onClick={closeMobileMenu}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className={isActive("/contact") ? styles.active : ""}
                    onClick={closeMobileMenu}
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="/membership"
                    className={isActive("/membership") ? styles.active : ""}
                    onClick={closeMobileMenu}
                  >
                    Membership
                  </a>
                </li>
              </ul>

              {/* Mobile Auth Buttons */}
              <div className={styles.mobileAuthButtons}>
                <a href="/candidate/login" className={styles.mobileCandidateBtn} onClick={closeMobileMenu}>
                  Login / Signup
                </a>
                
                <div className={styles.mobileEmployerSection}>
                  <h4>For Employers</h4>
                  <a href="/recruiter/login" className={styles.mobileEmployerLink} onClick={closeMobileMenu}>
                    Recruiter Login
                  </a>
                  <a href="/admin/login" className={styles.mobileEmployerLink} onClick={closeMobileMenu}>
                    Admin Login 
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNav;
