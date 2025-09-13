import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import styles from "../../Styles/NotificationsLogs.module.css";

const NotificationsLogs = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("membership-alerts");
  const [membershipAlerts, setMembershipAlerts] = useState([]);
  const [employerUpdates, setEmployerUpdates] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Sample data
  useEffect(() => {
    // Membership Alerts
    const sampleMembershipAlerts = [
      {
        id: 1,
        candidateName: "John Smith",
        candidateEmail: "john.smith@email.com",
        alertType: "Free Member Applied",
        jobTitle: "Senior Frontend Developer",
        company: "TechCorp Solutions",
        timestamp: "2024-01-15 14:30:25",
        status: "Unread",
        severity: "Medium"
      },
      {
        id: 2,
        candidateName: "Sarah Johnson",
        candidateEmail: "sarah.j@email.com",
        alertType: "Trial Expired",
        jobTitle: "UX Designer",
        company: "DesignStudio Inc",
        timestamp: "2024-01-15 12:15:10",
        status: "Read",
        severity: "High"
      },
      {
        id: 3,
        candidateName: "Mike Chen",
        candidateEmail: "mike.chen@email.com",
        alertType: "Free Member Applied",
        jobTitle: "Backend Engineer",
        company: "ServerLogic Pvt Ltd",
        timestamp: "2024-01-15 10:45:30",
        status: "Unread",
        severity: "Medium"
      },
      {
        id: 4,
        candidateName: "Emily Davis",
        candidateEmail: "emily.davis@email.com",
        alertType: "Membership Downgrade",
        jobTitle: "Product Manager",
        company: "InnovateCorp",
        timestamp: "2024-01-14 16:20:15",
        status: "Read",
        severity: "Low"
      },
      {
        id: 5,
        candidateName: "David Wilson",
        candidateEmail: "david.w@email.com",
        alertType: "Free Member Applied",
        jobTitle: "Data Scientist",
        company: "DataFlow Analytics",
        timestamp: "2024-01-14 09:30:45",
        status: "Unread",
        severity: "Medium"
      }
    ];

    // Employer Updates
    const sampleEmployerUpdates = [
      {
        id: 1,
        companyName: "TechCorp Solutions",
        contactPerson: "Alice Johnson",
        updateType: "Profile Updated",
        details: "Company description and logo updated",
        timestamp: "2024-01-15 15:45:20",
        status: "Unread",
        priority: "Low"
      },
      {
        id: 2,
        companyName: "DesignStudio Inc",
        contactPerson: "Bob Williams",
        updateType: "Subscription Expired",
        details: "Premium subscription expired, moved to free tier",
        timestamp: "2024-01-15 13:20:10",
        status: "Read",
        priority: "High"
      },
      {
        id: 3,
        companyName: "ServerLogic Pvt Ltd",
        contactPerson: "Charlie Brown",
        updateType: "New Job Posted",
        details: "Posted 3 new job positions",
        timestamp: "2024-01-15 11:15:30",
        status: "Unread",
        priority: "Medium"
      },
      {
        id: 4,
        companyName: "InnovateCorp",
        contactPerson: "Diana Prince",
        updateType: "Token Purchase",
        details: "Purchased 100 tokens package",
        timestamp: "2024-01-14 17:30:25",
        status: "Read",
        priority: "Medium"
      },
      {
        id: 5,
        companyName: "DataFlow Analytics",
        contactPerson: "Eve Adams",
        updateType: "Account Suspended",
        details: "Account suspended due to policy violation",
        timestamp: "2024-01-14 14:10:15",
        status: "Unread",
        priority: "High"
      }
    ];

    // System Alerts
    const sampleSystemAlerts = [
      {
        id: 1,
        alertType: "Server Error",
        message: "High CPU usage detected on database server",
        severity: "Critical",
        timestamp: "2024-01-15 16:30:45",
        status: "Unread",
        resolved: false
      },
      {
        id: 2,
        alertType: "Security Alert",
        message: "Multiple failed login attempts detected from IP: 192.168.1.100",
        severity: "High",
        timestamp: "2024-01-15 14:15:20",
        status: "Read",
        resolved: true
      },
      {
        id: 3,
        alertType: "Maintenance Notice",
        message: "Scheduled maintenance completed successfully",
        severity: "Low",
        timestamp: "2024-01-15 12:00:00",
        status: "Read",
        resolved: true
      },
      {
        id: 4,
        alertType: "Backup Alert",
        message: "Daily backup completed successfully",
        severity: "Low",
        timestamp: "2024-01-15 02:30:15",
        status: "Read",
        resolved: true
      },
      {
        id: 5,
        alertType: "Payment Gateway",
        message: "Payment gateway API response time exceeded threshold",
        severity: "Medium",
        timestamp: "2024-01-14 18:45:30",
        status: "Unread",
        resolved: false
      },
      {
        id: 6,
        alertType: "Database Alert",
        message: "Database connection pool nearing capacity",
        severity: "Medium",
        timestamp: "2024-01-14 16:20:10",
        status: "Read",
        resolved: true
      }
    ];

    setMembershipAlerts(sampleMembershipAlerts);
    setEmployerUpdates(sampleEmployerUpdates);
    setSystemAlerts(sampleSystemAlerts);
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

  const handleMarkAsRead = (type, id) => {
    if (type === "membership") {
      setMembershipAlerts(alerts => 
        alerts.map(alert => 
          alert.id === id ? { ...alert, status: "Read" } : alert
        )
      );
    } else if (type === "employer") {
      setEmployerUpdates(updates => 
        updates.map(update => 
          update.id === id ? { ...update, status: "Read" } : update
        )
      );
    } else if (type === "system") {
      setSystemAlerts(alerts => 
        alerts.map(alert => 
          alert.id === id ? { ...alert, status: "Read" } : alert
        )
      );
    }
  };

  const handleResolveAlert = (id) => {
    setSystemAlerts(alerts => 
      alerts.map(alert => 
        alert.id === id ? { ...alert, resolved: true, status: "Read" } : alert
      )
    );
  };

  const handleDeleteAlert = (type, id) => {
    if (window.confirm("Are you sure you want to delete this alert?")) {
      if (type === "membership") {
        setMembershipAlerts(alerts => alerts.filter(alert => alert.id !== id));
      } else if (type === "employer") {
        setEmployerUpdates(updates => updates.filter(update => update.id !== id));
      } else if (type === "system") {
        setSystemAlerts(alerts => alerts.filter(alert => alert.id !== id));
      }
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "Critical":
        return styles.critical;
      case "High":
        return styles.high;
      case "Medium":
        return styles.medium;
      case "Low":
        return styles.low;
      default:
        return styles.default;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return styles.high;
      case "Medium":
        return styles.medium;
      case "Low":
        return styles.low;
      default:
        return styles.default;
    }
  };

  const getStatusClass = (status) => {
    return status === "Unread" ? styles.unread : styles.read;
  };

  const getFilteredData = () => {
    let data = [];
    
    if (activeTab === "membership-alerts") {
      data = membershipAlerts;
    } else if (activeTab === "employer-updates") {
      data = employerUpdates;
    } else if (activeTab === "system-alerts") {
      data = systemAlerts;
    }

    if (filterStatus !== "all") {
      data = data.filter(item => item.status === filterStatus);
    }

    if (searchTerm) {
      data = data.filter(item => {
        const searchFields = Object.values(item).join(" ").toLowerCase();
        return searchFields.includes(searchTerm.toLowerCase());
      });
    }

    return data;
  };

  const filteredData = getFilteredData();

  const getStats = () => {
    const totalMembershipAlerts = membershipAlerts.length;
    const unreadMembershipAlerts = membershipAlerts.filter(alert => alert.status === "Unread").length;
    
    const totalEmployerUpdates = employerUpdates.length;
    const unreadEmployerUpdates = employerUpdates.filter(update => update.status === "Unread").length;
    
    const totalSystemAlerts = systemAlerts.length;
    const unresolvedSystemAlerts = systemAlerts.filter(alert => !alert.resolved).length;
    
    return {
      totalMembershipAlerts,
      unreadMembershipAlerts,
      totalEmployerUpdates,
      unreadEmployerUpdates,
      totalSystemAlerts,
      unresolvedSystemAlerts
    };
  };

  const stats = getStats();

  return (
    <div className={`${styles.notificationsLogs} ${darkMode ? styles.darkMode : ''}`}>
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
            <h1 className={styles.pageTitle}>Notifications & Logs</h1>
            <p className={styles.pageSubtitle}>Monitor system alerts, user activities, and important notifications</p>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👤</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.unreadMembershipAlerts}</h3>
                <p className={styles.statLabel}>Unread Membership Alerts</p>
                <span className={styles.statTotal}>Total: {stats.totalMembershipAlerts}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏢</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.unreadEmployerUpdates}</h3>
                <p className={styles.statLabel}>Unread Employer Updates</p>
                <span className={styles.statTotal}>Total: {stats.totalEmployerUpdates}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚠️</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.unresolvedSystemAlerts}</h3>
                <p className={styles.statLabel}>Unresolved System Alerts</p>
                <span className={styles.statTotal}>Total: {stats.totalSystemAlerts}</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === "membership-alerts" ? styles.active : ''}`}
              onClick={() => handleTabChange("membership-alerts")}
            >
              👤 Candidate Without Membership
              {stats.unreadMembershipAlerts > 0 && (
                <span className={styles.tabBadge}>{stats.unreadMembershipAlerts}</span>
              )}
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "employer-updates" ? styles.active : ''}`}
              onClick={() => handleTabChange("employer-updates")}
            >
              🏢 Employer Updates
              {stats.unreadEmployerUpdates > 0 && (
                <span className={styles.tabBadge}>{stats.unreadEmployerUpdates}</span>
              )}
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "system-alerts" ? styles.active : ''}`}
              onClick={() => handleTabChange("system-alerts")}
            >
              ⚠️ System Alerts
              {stats.unresolvedSystemAlerts > 0 && (
                <span className={styles.tabBadge}>{stats.unresolvedSystemAlerts}</span>
              )}
            </button>
          </div>

          {/* Filters and Search */}
          <div className={styles.filtersAndSearch}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            
            <div className={styles.filters}>
              <select 
                className={styles.filterSelect}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
              </select>
            </div>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === "membership-alerts" && (
              <div className={styles.membershipAlerts}>
                <h2 className={styles.sectionTitle}>Membership Alerts</h2>
                <div className={styles.tableContainer}>
                  <table className={styles.alertsTable}>
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Alert Type</th>
                        <th>Job Applied</th>
                        <th>Company</th>
                        <th>Severity</th>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((alert) => (
                        <tr key={alert.id} className={getStatusClass(alert.status)}>
                          <td>
                            <div className={styles.candidateInfo}>
                              <span className={styles.candidateName}>{alert.candidateName}</span>
                              <span className={styles.candidateEmail}>{alert.candidateEmail}</span>
                            </div>
                          </td>
                          <td className={styles.alertType}>{alert.alertType}</td>
                          <td className={styles.jobTitle}>{alert.jobTitle}</td>
                          <td className={styles.company}>{alert.company}</td>
                          <td>
                            <span className={`${styles.severityBadge} ${getSeverityClass(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td className={styles.timestamp}>{alert.timestamp}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(alert.status)}`}>
                              {alert.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {alert.status === "Unread" && (
                                <button 
                                  className={styles.markReadBtn}
                                  onClick={() => handleMarkAsRead("membership", alert.id)}
                                >
                                  ✓ Mark Read
                                </button>
                              )}
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteAlert("membership", alert.id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "employer-updates" && (
              <div className={styles.employerUpdates}>
                <h2 className={styles.sectionTitle}>Employer Updates</h2>
                <div className={styles.tableContainer}>
                  <table className={styles.updatesTable}>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Contact Person</th>
                        <th>Update Type</th>
                        <th>Details</th>
                        <th>Priority</th>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((update) => (
                        <tr key={update.id} className={getStatusClass(update.status)}>
                          <td className={styles.companyName}>{update.companyName}</td>
                          <td className={styles.contactPerson}>{update.contactPerson}</td>
                          <td className={styles.updateType}>{update.updateType}</td>
                          <td className={styles.details}>{update.details}</td>
                          <td>
                            <span className={`${styles.priorityBadge} ${getPriorityClass(update.priority)}`}>
                              {update.priority}
                            </span>
                          </td>
                          <td className={styles.timestamp}>{update.timestamp}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(update.status)}`}>
                              {update.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {update.status === "Unread" && (
                                <button 
                                  className={styles.markReadBtn}
                                  onClick={() => handleMarkAsRead("employer", update.id)}
                                >
                                  ✓ Mark Read
                                </button>
                              )}
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteAlert("employer", update.id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "system-alerts" && (
              <div className={styles.systemAlerts}>
                <h2 className={styles.sectionTitle}>System Alerts</h2>
                <div className={styles.tableContainer}>
                  <table className={styles.systemTable}>
                    <thead>
                      <tr>
                        <th>Alert Type</th>
                        <th>Message</th>
                        <th>Severity</th>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Resolved</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((alert) => (
                        <tr key={alert.id} className={getStatusClass(alert.status)}>
                          <td className={styles.alertType}>{alert.alertType}</td>
                          <td className={styles.message}>{alert.message}</td>
                          <td>
                            <span className={`${styles.severityBadge} ${getSeverityClass(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td className={styles.timestamp}>{alert.timestamp}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(alert.status)}`}>
                              {alert.status}
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.resolvedBadge} ${alert.resolved ? styles.resolved : styles.unresolved}`}>
                              {alert.resolved ? "✓ Resolved" : "⚠️ Unresolved"}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {alert.status === "Unread" && (
                                <button 
                                  className={styles.markReadBtn}
                                  onClick={() => handleMarkAsRead("system", alert.id)}
                                >
                                  ✓ Mark Read
                                </button>
                              )}
                              {!alert.resolved && (
                                <button 
                                  className={styles.resolveBtn}
                                  onClick={() => handleResolveAlert(alert.id)}
                                >
                                  🔧 Resolve
                                </button>
                              )}
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteAlert("system", alert.id)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredData.length === 0 && (
              <div className={styles.noResults}>
                <p>No notifications found matching your criteria.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsLogs;
