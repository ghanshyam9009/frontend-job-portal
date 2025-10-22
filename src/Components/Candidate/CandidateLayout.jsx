import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import CandidateNavbar from "./CandidateNavbar";
import CandidateSidebar from "./CandidateSidebar";
import styles from "../../Pages/Candidate/UserDashboard.module.css";
import { useTheme } from "../../Contexts/ThemeContext";

const CandidateLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? 'dark' : ''}`}>
      <CandidateNavbar 
        toggleSidebar={toggleSidebar} 
      />
      <CandidateSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default CandidateLayout;
