import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../Styles/HomeNav.module.css";

const HomeNav = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>🌟 JobPortal</div>
      <ul className={styles.navLinks}>
        <li><a href="/" className={isActive('/') ? styles.active : ''}>Home</a></li>
        <li><a href="/jobs" className={isActive('/jobs') ? styles.active : ''}>Job Listings</a></li>
        <li><a href="/about" className={isActive('/about') ? styles.active : ''}>About Us</a></li>
        <li><a href="/contact" className={isActive('/contact') ? styles.active : ''}>Contact Us</a></li>
      </ul>
      <div className={styles.rightMenu}>
        <input
          type="text"
          placeholder="Search for jobs, skills, companies..."
          className={styles.search}
        />
        <div className={styles.authButtons}>
          <a href="/candidate/login" className={styles.candidateBtn}>Login / Signup</a>
          <div className={styles.dropdown}>
            <button 
              className={styles.dropdownBtn}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              For Employers ▼
            </button>
            {showDropdown && (
              <div 
                className={styles.dropdownContent}
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <a href="/recruiter/login">Recruiter Login</a>
                <a href="/admin/login">Admin Login</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNav;
