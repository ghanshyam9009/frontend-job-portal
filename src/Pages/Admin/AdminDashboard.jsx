import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import styles from "../../Styles/AdminDashboard.module.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`${styles.dashboard} ${darkMode ? styles.darkMode : ''}`}>
      <AdminNavbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        onMobileMenuToggle={toggleSidebar}
      />

      <div className={styles.container}>
        <AdminSidebar 
          darkMode={darkMode} 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>
            <p className={styles.pageSubtitle}>Welcome back! Here's what's happening with your platform.</p>
          </div>

          {/* KPI Cards */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>👥</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>1,234</h3>
                <p className={styles.kpiLabel}>Total Candidates</p>
                <span className={`${styles.kpiChange} ${styles.positive}`}>+10% from last month</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>💼</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>456</h3>
                <p className={styles.kpiLabel}>Employers</p>
                <span className={`${styles.kpiChange} ${styles.positive}`}>+5% from last month</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>📄</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>789</h3>
                <p className={styles.kpiLabel}>Jobs Posted</p>
                <span className={`${styles.kpiChange} ${styles.negative}`}>-2% from last month</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>✉️</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>25,000</h3>
                <p className={styles.kpiLabel}>Tokens Sold</p>
                <span className={`${styles.kpiChange} ${styles.positive}`}>+15% from last month</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>💰</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>₹1,23,456</h3>
                <p className={styles.kpiLabel}>Revenue</p>
                <span className={`${styles.kpiChange} ${styles.positive}`}>+8% from last month</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Job Categories</h3>
              <div className={styles.donutChart}>
                <div className={styles.chartPlaceholder}>
                  <div className={styles.donut}>
                    <div className={styles.donutSegment}></div>
                    <div className={styles.donutCenter}>Job Categories</div>
                  </div>
                </div>
                <div className={styles.chartLegend}>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.tech}`}></span>
                    Technology
                  </div>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.healthcare}`}></span>
                    Healthcare
                  </div>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.finance}`}></span>
                    Finance
                  </div>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.marketing}`}></span>
                    Marketing
                  </div>
                  <div className={styles.legendItem}>
                    <span className={`${styles.legendColor} ${styles.education}`}></span>
                    Education
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Monthly Applications</h3>
              <div className={styles.lineChart}>
                <div className={styles.chartArea}>
                  <div className={styles.yAxis}>
                    <span>380</span>
                    <span>285</span>
                    <span>190</span>
                    <span>95</span>
                    <span>0</span>
                  </div>
                  <div className={styles.chartLine}>
                    <div className={styles.line}></div>
                    <div className={styles.dataPoints}>
                      <span className={styles.dataPoint}></span>
                      <span className={styles.dataPoint}></span>
                      <span className={styles.dataPoint}></span>
                      <span className={styles.dataPoint}></span>
                      <span className={styles.dataPoint}></span>
                      <span className={styles.dataPoint}></span>
                    </div>
                  </div>
                  <div className={styles.xAxis}>
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Stats Section */}
          <div className={styles.activityGrid}>
            <div className={styles.activityCard}>
              <h3 className={styles.activityTitle}>Recent Job Postings</h3>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Employer</th>
                      <th>Status</th>
                      <th>Date Posted</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Senior React Developer</td>
                      <td>Tech Solutions Inc.</td>
                      <td><span className={`${styles.statusBadge} ${styles.active}`}>Active</span></td>
                      <td>2024-07-28</td>
                    </tr>
                    <tr>
                      <td>Marketing Specialist</td>
                      <td>Creative Minds LLC</td>
                      <td><span className={`${styles.statusBadge} ${styles.pending}`}>Pending</span></td>
                      <td>2024-07-27</td>
                    </tr>
                    <tr>
                      <td>Financial Analyst</td>
                      <td>Global Finance Group</td>
                      <td><span className={`${styles.statusBadge} ${styles.active}`}>Active</span></td>
                      <td>2024-07-26</td>
                    </tr>
                    <tr>
                      <td>Project Manager</td>
                      <td>Innovate Corp.</td>
                      <td><span className={`${styles.statusBadge} ${styles.active}`}>Active</span></td>
                      <td>2024-07-25</td>
                    </tr>
                    <tr>
                      <td>UX Designer</td>
                      <td>Design Studio</td>
                      <td><span className={`${styles.statusBadge} ${styles.closed}`}>Closed</span></td>
                      <td>2024-07-24</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.activityCard}>
              <h3 className={styles.activityTitle}>Top Employers</h3>
              <div className={styles.employersList}>
                <div className={styles.employerItem}>
                  <span className={styles.employerName}>Tech Solutions Inc.</span>
                  <span className={styles.jobCount}>125 Jobs</span>
                </div>
                <div className={styles.employerItem}>
                  <span className={styles.employerName}>Global Finance Group</span>
                  <span className={styles.jobCount}>98 Jobs</span>
                </div>
                <div className={styles.employerItem}>
                  <span className={styles.employerName}>Innovate Corp.</span>
                  <span className={styles.jobCount}>70 Jobs</span>
                </div>
                <div className={styles.employerItem}>
                  <span className={styles.employerName}>Creative Minds LLC</span>
                  <span className={styles.jobCount}>65 Jobs</span>
                </div>
              </div>
            </div>

            <div className={styles.activityCard}>
              <h3 className={styles.activityTitle}>Candidate Origin</h3>
              <div className={styles.candidateOrigin}>
                <div className={styles.mapPlaceholder}>
                  <span>🗺️</span>
                  <p>Candidate Origin Map</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
