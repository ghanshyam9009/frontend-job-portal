import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { useTheme } from '../../Contexts/ThemeContext';
import styles from '../../Styles/AdminDashboard.module.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`${styles.adminLayout} ${theme === 'dark' ? 'dark' : ''}`}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={styles.mainContent}>
        <AdminNavbar onMobileMenuToggle={toggleSidebar} />
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
