import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import styles from "../../Styles/ReportsAnalytics.module.css";

const ReportsAnalytics = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("candidate-activity");
  const [dateRange, setDateRange] = useState("30days");
  const [candidateActivity, setCandidateActivity] = useState([]);
  const [employerActivity, setEmployerActivity] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [membershipRevenue, setMembershipRevenue] = useState([]);

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Sample data for reports
  useEffect(() => {
    // Candidate Activity Data
    const sampleCandidateActivity = [
      { date: "2024-01-01", registrations: 45, applications: 120, profileViews: 340 },
      { date: "2024-01-02", registrations: 52, applications: 135, profileViews: 380 },
      { date: "2024-01-03", registrations: 38, applications: 98, profileViews: 290 },
      { date: "2024-01-04", registrations: 61, applications: 156, profileViews: 420 },
      { date: "2024-01-05", registrations: 47, applications: 142, profileViews: 365 },
      { date: "2024-01-06", registrations: 55, applications: 168, profileViews: 445 },
      { date: "2024-01-07", registrations: 43, applications: 125, profileViews: 320 }
    ];

    // Employer Activity Data
    const sampleEmployerActivity = [
      { company: "TechCorp Solutions", jobsPosted: 15, applicationsReceived: 450, tokensUsed: 1200 },
      { company: "DesignStudio Inc", jobsPosted: 8, applicationsReceived: 320, tokensUsed: 800 },
      { company: "ServerLogic Pvt Ltd", jobsPosted: 12, applicationsReceived: 380, tokensUsed: 950 },
      { company: "InnovateCorp", jobsPosted: 20, applicationsReceived: 680, tokensUsed: 1500 },
      { company: "DataFlow Analytics", jobsPosted: 6, applicationsReceived: 180, tokensUsed: 450 },
      { company: "CloudWorks Solutions", jobsPosted: 10, applicationsReceived: 290, tokensUsed: 720 }
    ];

    // Job Post Statistics
    const sampleJobStats = [
      { category: "Technology", totalJobs: 156, activeJobs: 142, applications: 2340, avgSalary: "₹12.5L" },
      { category: "Healthcare", totalJobs: 89, activeJobs: 78, applications: 1560, avgSalary: "₹8.2L" },
      { category: "Finance", totalJobs: 67, activeJobs: 58, applications: 1230, avgSalary: "₹15.8L" },
      { category: "Marketing", totalJobs: 45, activeJobs: 42, applications: 890, avgSalary: "₹6.5L" },
      { category: "Education", totalJobs: 34, activeJobs: 28, applications: 670, avgSalary: "₹5.8L" },
      { category: "Manufacturing", totalJobs: 78, activeJobs: 65, applications: 1450, avgSalary: "₹9.2L" }
    ];

    // Membership Revenue Data
    const sampleMembershipRevenue = [
      { month: "Jan 2024", basicPlan: 45000, proPlan: 98000, enterprisePlan: 156000, total: 299000 },
      { month: "Feb 2024", basicPlan: 52000, proPlan: 112000, enterprisePlan: 178000, total: 342000 },
      { month: "Mar 2024", basicPlan: 48000, proPlan: 105000, enterprisePlan: 165000, total: 318000 },
      { month: "Apr 2024", basicPlan: 61000, proPlan: 128000, enterprisePlan: 192000, total: 381000 },
      { month: "May 2024", basicPlan: 58000, proPlan: 135000, enterprisePlan: 205000, total: 398000 },
      { month: "Jun 2024", basicPlan: 67000, proPlan: 148000, enterprisePlan: 220000, total: 435000 }
    ];

    setCandidateActivity(sampleCandidateActivity);
    setEmployerActivity(sampleEmployerActivity);
    setJobStats(sampleJobStats);
    setMembershipRevenue(sampleMembershipRevenue);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const getTotalStats = () => {
    const totalRegistrations = candidateActivity.reduce((sum, day) => sum + day.registrations, 0);
    const totalApplications = candidateActivity.reduce((sum, day) => sum + day.applications, 0);
    const totalProfileViews = candidateActivity.reduce((sum, day) => sum + day.profileViews, 0);
    const totalJobsPosted = employerActivity.reduce((sum, emp) => sum + emp.jobsPosted, 0);
    
    return {
      totalRegistrations,
      totalApplications,
      totalProfileViews,
      totalJobsPosted
    };
  };

  const stats = getTotalStats();

  return (
    <div className={`${styles.reportsAnalytics} ${darkMode ? styles.darkMode : ''}`}>
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
        
        <main className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Reports & Analytics</h1>
            <p className={styles.pageSubtitle}>Comprehensive insights into platform performance and user activity</p>
          </div>

          {/* Date Range Selector */}
          <div className={styles.dateRangeSelector}>
            <label>Date Range:</label>
            <select 
              value={dateRange} 
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className={styles.dateSelect}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          {/* Overview Stats */}
          <div className={styles.overviewStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.totalRegistrations}</h3>
                <p className={styles.statLabel}>New Registrations</p>
                <span className={styles.statChange}>+12% from last period</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.totalApplications}</h3>
                <p className={styles.statLabel}>Job Applications</p>
                <span className={styles.statChange}>+8% from last period</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👁️</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.totalProfileViews}</h3>
                <p className={styles.statLabel}>Profile Views</p>
                <span className={styles.statChange}>+15% from last period</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💼</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.totalJobsPosted}</h3>
                <p className={styles.statLabel}>Jobs Posted</p>
                <span className={styles.statChange}>+5% from last period</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === "candidate-activity" ? styles.active : ''}`}
              onClick={() => handleTabChange("candidate-activity")}
            >
              📊 Candidate Activity
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "employer-activity" ? styles.active : ''}`}
              onClick={() => handleTabChange("employer-activity")}
            >
              🏢 Employer Activity
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "job-stats" ? styles.active : ''}`}
              onClick={() => handleTabChange("job-stats")}
            >
              📄 Job Post Stats
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "membership-revenue" ? styles.active : ''}`}
              onClick={() => handleTabChange("membership-revenue")}
            >
              💰 Membership Revenue
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === "candidate-activity" && (
              <div className={styles.candidateActivity}>
                <h2 className={styles.sectionTitle}>Candidate Activity Overview</h2>
                <div className={styles.chartContainer}>
                  <div className={styles.lineChart}>
                    <div className={styles.chartHeader}>
                      <h3>Daily Activity Trends</h3>
                    </div>
                    <div className={styles.chartArea}>
                      <div className={styles.yAxis}>
                        <span>200</span>
                        <span>150</span>
                        <span>100</span>
                        <span>50</span>
                        <span>0</span>
                      </div>
                      <div className={styles.chartLine}>
                        <div className={styles.line}></div>
                        <div className={styles.dataPoints}>
                          {candidateActivity.map((_, index) => (
                            <span key={index} className={styles.dataPoint}></span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.xAxis}>
                        {candidateActivity.map((day, index) => (
                          <span key={index}>{day.date.split('-')[2]}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.activityTable}>
                  <h3>Detailed Activity Data</h3>
                  <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>New Registrations</th>
                          <th>Job Applications</th>
                          <th>Profile Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidateActivity.map((day, index) => (
                          <tr key={index}>
                            <td>{day.date}</td>
                            <td>{day.registrations}</td>
                            <td>{day.applications}</td>
                            <td>{day.profileViews}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "employer-activity" && (
              <div className={styles.employerActivity}>
                <h2 className={styles.sectionTitle}>Employer Activity Overview</h2>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Jobs Posted</th>
                        <th>Applications Received</th>
                        <th>Tokens Used</th>
                        <th>Activity Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employerActivity.map((employer, index) => (
                        <tr key={index}>
                          <td className={styles.companyName}>{employer.company}</td>
                          <td>{employer.jobsPosted}</td>
                          <td>{employer.applicationsReceived}</td>
                          <td>{employer.tokensUsed}</td>
                          <td>
                            <div className={styles.activityScore}>
                              <div className={styles.scoreBar}>
                                <div 
                                  className={styles.scoreFill}
                                  style={{ width: `${(employer.tokensUsed / 1500) * 100}%` }}
                                ></div>
                              </div>
                              <span>{Math.round((employer.tokensUsed / 1500) * 100)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "job-stats" && (
              <div className={styles.jobStats}>
                <h2 className={styles.sectionTitle}>Job Post Statistics by Category</h2>
                <div className={styles.statsGrid}>
                  {jobStats.map((category, index) => (
                    <div key={index} className={styles.categoryCard}>
                      <h3 className={styles.categoryName}>{category.category}</h3>
                      <div className={styles.categoryStats}>
                        <div className={styles.statItem}>
                          <span className={styles.statNumber}>{category.totalJobs}</span>
                          <span className={styles.statLabel}>Total Jobs</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statNumber}>{category.activeJobs}</span>
                          <span className={styles.statLabel}>Active Jobs</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statNumber}>{category.applications}</span>
                          <span className={styles.statLabel}>Applications</span>
                        </div>
                        <div className={styles.statItem}>
                          <span className={styles.statNumber}>{category.avgSalary}</span>
                          <span className={styles.statLabel}>Avg Salary</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "membership-revenue" && (
              <div className={styles.membershipRevenue}>
                <h2 className={styles.sectionTitle}>Membership Revenue Analysis</h2>
                <div className={styles.revenueChart}>
                  <div className={styles.chartHeader}>
                    <h3>Monthly Revenue Trends</h3>
                  </div>
                  <div className={styles.barChart}>
                    <div className={styles.chartArea}>
                      <div className={styles.bars}>
                        {membershipRevenue.map((month, index) => (
                          <div key={index} className={styles.barGroup}>
                            <div 
                              className={`${styles.bar} ${styles.basicBar}`}
                              style={{ height: `${(month.basicPlan / 70000) * 100}%` }}
                            ></div>
                            <div 
                              className={`${styles.bar} ${styles.proBar}`}
                              style={{ height: `${(month.proPlan / 150000) * 100}%` }}
                            ></div>
                            <div 
                              className={`${styles.bar} ${styles.enterpriseBar}`}
                              style={{ height: `${(month.enterprisePlan / 220000) * 100}%` }}
                            ></div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.xAxis}>
                        {membershipRevenue.map((month, index) => (
                          <span key={index}>{month.month.split(' ')[0]}</span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.legend}>
                      <div className={styles.legendItem}>
                        <span className={`${styles.legendColor} ${styles.basic}`}></span>
                        Basic Plan
                      </div>
                      <div className={styles.legendItem}>
                        <span className={`${styles.legendColor} ${styles.pro}`}></span>
                        Pro Plan
                      </div>
                      <div className={styles.legendItem}>
                        <span className={`${styles.legendColor} ${styles.enterprise}`}></span>
                        Enterprise Plan
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.revenueTable}>
                  <h3>Revenue Breakdown</h3>
                  <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Basic Plan</th>
                          <th>Pro Plan</th>
                          <th>Enterprise Plan</th>
                          <th>Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {membershipRevenue.map((month, index) => (
                          <tr key={index}>
                            <td>{month.month}</td>
                            <td>₹{month.basicPlan.toLocaleString()}</td>
                            <td>₹{month.proPlan.toLocaleString()}</td>
                            <td>₹{month.enterprisePlan.toLocaleString()}</td>
                            <td className={styles.totalRevenue}>₹{month.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
