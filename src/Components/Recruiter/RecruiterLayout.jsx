import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import RecruiterNavbar from "./RecruiterNavbar";
import RecruiterSidebar from "./RecruiterSidebar";
import styles from "../../Pages/Candidate/UserDashboard.module.css";

const RecruiterLayout = () => {
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
      <RecruiterNavbar 
        toggleSidebar={toggleSidebar} 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      <RecruiterSidebar isOpen={isSidebarOpen} darkMode={darkMode} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default RecruiterLayout;
