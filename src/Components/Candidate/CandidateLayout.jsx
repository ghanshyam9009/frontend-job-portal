import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CandidateNavbar from "./CandidateNavbar";
import CandidateSidebar from "./CandidateSidebar";
import Footer from "../Footer";
import styles from "../../Pages/Candidate/UserDashboard.module.css";
import { useTheme } from "../../Contexts/ThemeContext";

const CandidateLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Hide sidebar for all candidate pages
  const showSidebar = false;

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? 'dark' : ''}`}>
      <CandidateNavbar
        toggleSidebar={showSidebar ? toggleSidebar : undefined}
      />
      {showSidebar && <CandidateSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CandidateLayout;
