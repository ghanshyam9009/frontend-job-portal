import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import styles from "../../Styles/CandidateNavbar.module.css";
import { Sun, Moon, Search, FileText, Heart, List, Home, CreditCard, CheckCircle, User, LogOut, X, Briefcase, Building, Info, Phone } from "lucide-react";
import logo from "../../assets/favicon-icon.png";

const CandidateNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
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
    setShowProfileSidebar(!showProfileSidebar);
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
          {/* <button className={styles.navLink} onClick={() => navigate('/jobs')}>
            <Briefcase size={18} />
            <span>Jobs</span>
          </button> */}
          <button className={styles.navLink} onClick={() => navigate('/government-jobs')}>
            <Building size={18} />
            <span>Government Jobs</span>
          </button>
          <button className={styles.navLink} onClick={() => navigate('/about')}>
            <Info size={18} />
            <span>About Us</span>
          </button>
          <button className={styles.navLink} onClick={() => navigate('/contact')}>
            <Phone size={18} />
            <span>Contact Us</span>
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
        <button onClick={toggleTheme} className={styles.themeToggle}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
        <div className={styles.profileSection} ref={dropdownRef}>
          <button className={styles.profilePicture} onClick={handleProfileClick}>
            <div className={styles.avatarCircle}>
              {(user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Candidate').charAt(0)?.toUpperCase() || 'C'}
            </div>
          </button>

          {/* Profile Sidebar Popup */}
          {showProfileSidebar && (
            <>
              <div className={styles.profileSidebarOverlay} onClick={() => setShowProfileSidebar(false)}></div>
              <div className={styles.profileSidebar}>
                <div className={styles.sidebarHeader}>
                  <h3>Profile Menu</h3>
                  <button
                    className={styles.closeSidebarBtn}
                    onClick={() => setShowProfileSidebar(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className={styles.sidebarProfileInfo}>
                  <div className={styles.sidebarAvatar}>
                    <User size={40} />
                  </div>
                  <div className={styles.sidebarUserDetails}>
                    <div className={styles.sidebarUserName}>
                      {user?.full_name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                    </div>
                    <div className={styles.sidebarUserEmail}>
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
                </div>

                <div className={styles.profileCompletion}>
                  <div className={styles.completionHeader}>
                    <span>Profile Completion</span>
                    <span>0%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progress} style={{ width: '0%' }} />
                  </div>
                  <p className={styles.completionText}>
                    Complete your profile to get better job matches
                  </p>
                  <button className={styles.completeProfileBtn} onClick={() => { navigate('/profile'); setShowProfileSidebar(false); }}>
                    Complete Profile
                  </button>
                </div>

                <div className={styles.sidebarMenu}>
                  <button
                    className={styles.sidebarMenuItem}
                    onClick={() => { navigate('/my-applications'); setShowProfileSidebar(false); }}
                  >
                    <FileText size={18} />
                    <span>My Applications</span>
                  </button>
                  <button
                    className={styles.sidebarMenuItem}
                    onClick={() => { navigate('/saved-jobs'); setShowProfileSidebar(false); }}
                  >
                    <Heart size={18} />
                    <span>Saved Jobs</span>
                  </button>
                  <button
                    className={styles.sidebarMenuItem}
                    onClick={() => { navigate('/userjoblistings'); setShowProfileSidebar(false); }}
                  >
                    <List size={18} />
                    <span>Job Listings</span>
                  </button>
                  <button
                    className={styles.sidebarMenuItem}
                    onClick={() => { navigate('/membership-plans'); setShowProfileSidebar(false); }}
                  >
                    <CreditCard size={18} />
                    <span>Membership Plans</span>
                  </button>
                  <button
                    className={styles.sidebarMenuItem}
                    onClick={() => { handleLogout(); setShowProfileSidebar(false); }}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default CandidateNavbar;
