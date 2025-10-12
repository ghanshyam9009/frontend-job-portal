import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { taskService } from "../../services/taskService";
import { jobService } from "../../services/jobService";
import { applicationService } from "../../services/applicationService";
import { studentService } from "../../services/studentService";
import { employerService } from "../../services/employerService";
import { showError } from "../../utils/errorHandler";
import styles from "../../Styles/AdminDashboard.module.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCandidates: 0,
      totalEmployers: 0,
      totalJobs: 0,
      totalApplications: 0,
      totalTokens: 0,
      revenue: 0
    },
    recentJobs: [],
    topEmployers: [],
    pendingTasks: []
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [
        candidatesResult,
        employersResult,
        jobsResult,
        applicationsResult,
        tasksResult
      ] = await Promise.allSettled([
        studentService.getAllStudents(),
        employerService.getAllEmployers(),
        jobService.getAllJobs(),
        applicationService.getAllApplications(),
        taskService.getAllTasks()
      ]);

      // Process results
      const candidates = candidatesResult.status === 'fulfilled' ? candidatesResult.value.data || [] : [];
      const employers = employersResult.status === 'fulfilled' ? employersResult.value.data || [] : [];
      const jobs = jobsResult.status === 'fulfilled' ? jobsResult.value.data || [] : [];
      const applications = applicationsResult.status === 'fulfilled' ? applicationsResult.value.data || [] : [];
      const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : [];

      // Calculate stats
      const stats = {
        totalCandidates: candidates.length,
        totalEmployers: employers.length,
        totalJobs: jobs.length,
        totalApplications: applications.length,
        totalTokens: 25000, // Mock data - replace with actual API
        revenue: 123456 // Mock data - replace with actual API
      };

      // Get recent jobs (last 5)
      const recentJobs = jobs
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.company_name || 'Unknown Company',
          status: job.status || 'active',
          datePosted: job.created_at
        }));

      // Get top employers by job count
      const employerJobCounts = {};
      jobs.forEach(job => {
        const employerId = job.employer_id;
        employerJobCounts[employerId] = (employerJobCounts[employerId] || 0) + 1;
      });

      const topEmployers = Object.entries(employerJobCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([employerId, jobCount]) => {
          const employer = employers.find(emp => emp.employer_id === employerId);
          return {
            name: employer?.company_name || 'Unknown Company',
            jobCount
          };
        });

      // Get pending tasks
      const pendingTasks = tasks
        .filter(task => task.status === 'pending')
        .slice(0, 5);

      setDashboardData({
        stats,
        recentJobs,
        topEmployers,
        pendingTasks
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showError(error, 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return styles.active;
      case 'pending':
        return styles.pending;
      case 'closed':
        return styles.closed;
      default:
        return styles.active;
    }
  };

  if (loading) {
    return (
      <div className={`${styles.dashboard} ${theme === 'dark' ? styles.darkMode : ''}`}>
        <AdminNavbar 
          onMobileMenuToggle={toggleSidebar}
        />
        <div className={styles.container}>
          <AdminSidebar 
            isOpen={sidebarOpen}
            onClose={closeSidebar}
          />
          <main className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading dashboard data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${theme === 'dark' ? styles.darkMode : ''}`}>
      <AdminNavbar 
        onMobileMenuToggle={toggleSidebar}
      />

      <div className={styles.container}>
        <AdminSidebar 
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
                <h3 className={styles.kpiValue}>{dashboardData.stats.totalCandidates.toLocaleString()}</h3>
                <p className={styles.kpiLabel}>Total Candidates</p>
                <span className={`${styles.kpiChange} ${styles.positive}`}>+10% from last month</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>💼</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>{dashboardData.stats.totalEmployers.toLocaleString()}</h3>
                <p className={styles.kpiLabel}>Employers</p>
                <span className={`${styles.kpiChange} ${styles.positive}`}>+5% from last month</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>📄</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>{dashboardData.stats.totalJobs.toLocaleString()}</h3>
                <p className={styles.kpiLabel}>Jobs Posted</p>
                <span className={`${styles.kpiChange} ${styles.negative}`}>-2% from last month</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>✉️</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>{dashboardData.stats.totalApplications.toLocaleString()}</h3>
                <p className={styles.kpiLabel}>Applications</p>
                <span className={`${styles.kpiChange} ${styles.positive}`}>+15% from last month</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>🎫</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>{dashboardData.stats.totalTokens.toLocaleString()}</h3>
                <p className={styles.kpiLabel}>Tokens Sold</p>
                <span className={`${styles.kpiChange} ${styles.positive}`}>+15% from last month</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>💰</div>
              <div className={styles.kpiContent}>
                <h3 className={styles.kpiValue}>₹{dashboardData.stats.revenue.toLocaleString()}</h3>
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
                    {dashboardData.recentJobs.length > 0 ? (
                      dashboardData.recentJobs.map((job) => (
                        <tr key={job.id}>
                          <td>{job.title}</td>
                          <td>{job.company}</td>
                          <td><span className={`${styles.statusBadge} ${getStatusBadgeClass(job.status)}`}>{job.status}</span></td>
                          <td>{formatDate(job.datePosted)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className={styles.noData}>No recent jobs found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.activityCard}>
              <h3 className={styles.activityTitle}>Top Employers</h3>
              <div className={styles.employersList}>
                {dashboardData.topEmployers.length > 0 ? (
                  dashboardData.topEmployers.map((employer, index) => (
                    <div key={index} className={styles.employerItem}>
                      <span className={styles.employerName}>{employer.name}</span>
                      <span className={styles.jobCount}>{employer.jobCount} Jobs</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.noData}>No employer data available</div>
                )}
              </div>
            </div>

            <div className={styles.activityCard}>
              <h3 className={styles.activityTitle}>Pending Tasks</h3>
              <div className={styles.tasksList}>
                {dashboardData.pendingTasks.length > 0 ? (
                  dashboardData.pendingTasks.map((task) => (
                    <div key={task.task_id} className={styles.taskItem}>
                      <span className={styles.taskTitle}>{task.category}</span>
                      <span className={styles.taskStatus}>Pending</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.noData}>No pending tasks</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
