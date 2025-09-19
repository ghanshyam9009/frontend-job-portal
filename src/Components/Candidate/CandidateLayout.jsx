import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import CandidateNavbar from "./CandidateNavbar";
import CandidateSidebar from "./CandidateSidebar";
import styles from "../../Pages/Candidate/UserDashboard.module.css";

const CandidateLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={styles.dashboardContainer}>
      <CandidateNavbar 
        toggleSidebar={toggleSidebar} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      <CandidateSidebar isOpen={isSidebarOpen} darkMode={darkMode} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default CandidateLayout;
