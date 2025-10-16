import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import RecruiterNavbar from "./RecruiterNavbar";
import RecruiterSidebar from "./RecruiterSidebar";
import styles from "../../Pages/Candidate/UserDashboard.module.css";
import { useTheme } from "../../Contexts/ThemeContext";

const RecruiterLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <RecruiterNavbar 
        toggleSidebar={toggleSidebar} 
      />
      <RecruiterSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default RecruiterLayout;
