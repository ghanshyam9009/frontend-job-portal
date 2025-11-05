import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import styles from "../../Styles/CandidateNavbar.module.css";
import { Sun, Moon, Search, FileText, Heart, List, Home, CreditCard, CheckCircle } from "lucide-react";
import logo from "../../assets/favicon-icon.png";

const CandidateNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    logout();
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
    // Delay to allow click on search button
    setTimeout(() => setIsSearchFocused(false), 200);
  };

  return (
    <header className={`${styles.header} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.headerLeft}>
        {toggleSidebar && (
          <button className={styles.menuButton} onClick={toggleSidebar}>
            ☰
          </button>
        )}
        <div className={styles.logo}>
          <Link to="/candidate-home">
            <img src={logo} alt="JobPortal Logo" />
          </Link>
          <span className={styles.brandText}>Big<span className={styles.brandHighlight}>sources</span>.in</span>
        </div>

        {/* Navigation Links */}
        <nav className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => navigate('/candidate-home')}>
            <Home size={18} />
            <span>Home</span>
          </button>
          <button className={styles.navLink} onClick={() => navigate('/membership-plans')}>
            <CreditCard size={18} />
            <span>Membership</span>
          </button>
          <button className={styles.navLink} onClick={() => navigate('/my-applications')}>
            <CheckCircle size={18} />
            <span>Track Applications</span>
          </button>
        </nav>
      </div>

      <div className={styles.headerCenter}>
        {/* Search Bar */}
        <div className={`${styles.searchContainer} ${isSearchFocused ? styles.searchFocused : ''}`}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Job title, keywords, or company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className={styles.searchInput}
          />
          <button
            className={styles.searchButton}
            onClick={handleSearch}
            type="button"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.profileSection} ref={dropdownRef}>
          <button className={styles.profilePicture} onClick={handleProfileClick}>
            <div className={styles.avatarCircle}>
              {(user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate').charAt(0)?.toUpperCase() || 'C'}
            </div>
          </button>

          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate'}</div>
                <div className={styles.profileEmail}>{user?.email || 'user@example.com'}</div>
              </div>
              <div className={styles.dropdownDivider}></div>
              <button className={styles.dropdownItem} onClick={() => { navigate('/userdashboard'); setShowProfileDropdown(false); }}>
                Dashboard
              </button>
              <button className={styles.dropdownItem} onClick={() => { navigate('/profile'); setShowProfileDropdown(false); }}>Profile Settings</button>
              <div className={styles.dropdownDivider}></div>
              <button className={styles.dropdownItem} onClick={handleThemeToggle}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button className={styles.dropdownItem} onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CandidateNavbar;
