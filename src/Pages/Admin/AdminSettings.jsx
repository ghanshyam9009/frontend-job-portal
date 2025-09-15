import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import styles from "../../Styles/AdminSettings.module.css";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("admin-users");
  const [adminUsers, setAdminUsers] = useState([]);
  const [systemConfig, setSystemConfig] = useState({});
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditConfigModal, setShowEditConfigModal] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    role: "Admin",
    permissions: []
  });

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Sample data
  useEffect(() => {
    // Admin Users Data
    const sampleAdminUsers = [
      {
        id: 1,
        name: "Super Admin",
        email: "superadmin@jobportal.com",
        role: "Super Admin",
        permissions: ["All"],
        lastLogin: "2024-01-15 10:30:00",
        status: "Active",
        createdDate: "2024-01-01"
      },
      {
        id: 2,
        name: "Content Moderator",
        email: "moderator@jobportal.com",
        role: "Moderator",
        permissions: ["Manage Jobs", "Manage Candidates", "View Reports"],
        lastLogin: "2024-01-14 15:45:00",
        status: "Active",
        createdDate: "2024-01-05"
      },
      {
        id: 3,
        name: "Support Admin",
        email: "support@jobportal.com",
        role: "Support",
        permissions: ["View Reports", "Manage Candidates"],
        lastLogin: "2024-01-13 09:20:00",
        status: "Active",
        createdDate: "2024-01-08"
      },
      {
        id: 4,
        name: "Finance Admin",
        email: "finance@jobportal.com",
        role: "Finance",
        permissions: ["Manage Membership Plans", "View Reports"],
        lastLogin: "2024-01-12 14:10:00",
        status: "Inactive",
        createdDate: "2024-01-10"
      }
    ];

    // System Configuration Data
    const sampleSystemConfig = {
      platformSettings: {
        siteName: "JobPortal India",
        siteDescription: "India's leading job portal connecting talent with opportunities",
        defaultCurrency: "INR",
        timezone: "Asia/Kolkata",
        language: "English"
      },
      emailSettings: {
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        fromEmail: "noreply@jobportal.com",
        fromName: "JobPortal Team"
      },
      securitySettings: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        twoFactorAuth: true,
        ipWhitelist: []
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        adminAlerts: true
      },
      membershipSettings: {
        freeTokens: 10,
        tokenExpiryDays: 30,
        maxJobPosts: 5,
        premiumFeatures: true
      }
    };

    setAdminUsers(sampleAdminUsers);
    setSystemConfig(sampleSystemConfig);
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

  const handleAddAdmin = () => {
    setShowAddAdminModal(true);
  };

  const handleEditAdmin = (admin) => {
    console.log("Edit admin:", admin);
  };

  const handleDeleteAdmin = (adminId) => {
    if (window.confirm("Are you sure you want to delete this admin user?")) {
      const updatedAdmins = adminUsers.filter(admin => admin.id !== adminId);
      setAdminUsers(updatedAdmins);
      alert("Admin user deleted successfully!");
    }
  };

  const handleToggleAdminStatus = (adminId) => {
    const updatedAdmins = adminUsers.map(admin => 
      admin.id === adminId 
        ? { ...admin, status: admin.status === "Active" ? "Inactive" : "Active" }
        : admin
    );
    setAdminUsers(updatedAdmins);
  };

  const handleSaveNewAdmin = () => {
    const newAdmin = {
      id: adminUsers.length + 1,
      ...newAdminForm,
      lastLogin: "Never",
      status: "Active",
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    setAdminUsers([...adminUsers, newAdmin]);
    setShowAddAdminModal(false);
    setNewAdminForm({ name: "", email: "", role: "Admin", permissions: [] });
    alert("New admin user created successfully!");
  };

  const handleConfigChange = (section, field, value) => {
    setSystemConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSystemConfig = () => {
    alert("System configuration saved successfully!");
    setShowEditConfigModal(false);
  };

  const availablePermissions = [
    "Manage Jobs",
    "Manage Candidates", 
    "Manage Employers",
    "Manage Membership Plans",
    "View Reports",
    "System Configuration",
    "Admin Management"
  ];

  const getStatusClass = (status) => {
    return status === "Active" ? styles.active : styles.inactive;
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "Super Admin":
        return styles.superAdmin;
      case "Moderator":
        return styles.moderator;
      case "Support":
        return styles.support;
      case "Finance":
        return styles.finance;
      default:
        return styles.admin;
    }
  };

  return (
    <div className={`${styles.adminSettings} ${darkMode ? styles.darkMode : ''}`}>
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
            <h1 className={styles.pageTitle}>Admin Settings</h1>
            <p className={styles.pageSubtitle}>Manage admin users and system configurations</p>
          </div>

          {/* Tabs Navigation */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === "admin-users" ? styles.active : ''}`}
              onClick={() => handleTabChange("admin-users")}
            >
              👥 Manage Admin Users
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "system-config" ? styles.active : ''}`}
              onClick={() => handleTabChange("system-config")}
            >
              ⚙️ System Configurations
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === "admin-users" && (
              <div className={styles.adminUsers}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Admin Users Management</h2>
                  <button 
                    className={styles.addButton}
                    onClick={handleAddAdmin}
                  >
                    + Add New Admin
                  </button>
                </div>

                <div className={styles.tableContainer}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Permissions</th>
                        <th>Last Login</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((admin) => (
                        <tr key={admin.id}>
                          <td className={styles.adminName}>{admin.name}</td>
                          <td className={styles.adminEmail}>{admin.email}</td>
                          <td>
                            <span className={`${styles.roleBadge} ${getRoleClass(admin.role)}`}>
                              {admin.role}
                            </span>
                          </td>
                          <td className={styles.permissions}>
                            {admin.permissions.length === 1 && admin.permissions[0] === "All" ? (
                              <span className={styles.allPermissions}>All Permissions</span>
                            ) : (
                              <span className={styles.permissionCount}>
                                {admin.permissions.length} permissions
                              </span>
                            )}
                          </td>
                          <td className={styles.lastLogin}>{admin.lastLogin}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(admin.status)}`}>
                              {admin.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              <button 
                                className={styles.editBtn}
                                onClick={() => handleEditAdmin(admin)}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                className={admin.status === "Active" ? styles.deactivateBtn : styles.activateBtn}
                                onClick={() => handleToggleAdminStatus(admin.id)}
                              >
                                {admin.status === "Active" ? "🔒 Deactivate" : "🔓 Activate"}
                              </button>
                              {admin.role !== "Super Admin" && (
                                <button 
                                  className={styles.deleteBtn}
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                >
                                  🗑️ Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "system-config" && (
              <div className={styles.systemConfig}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>System Configuration</h2>
                  <button 
                    className={styles.editButton}
                    onClick={() => setShowEditConfigModal(true)}
                  >
                    ✏️ Edit Configuration
                  </button>
                </div>

                <div className={styles.configSections}>
                  <div className={styles.configSection}>
                    <h3 className={styles.configTitle}>Platform Settings</h3>
                    <div className={styles.configGrid}>
                      <div className={styles.configItem}>
                        <label>Site Name</label>
                        <span className={styles.configValue}>{systemConfig.platformSettings?.siteName}</span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Default Currency</label>
                        <span className={styles.configValue}>{systemConfig.platformSettings?.defaultCurrency}</span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Timezone</label>
                        <span className={styles.configValue}>{systemConfig.platformSettings?.timezone}</span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Default Language</label>
                        <span className={styles.configValue}>{systemConfig.platformSettings?.language}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.configSection}>
                    <h3 className={styles.configTitle}>Security Settings</h3>
                    <div className={styles.configGrid}>
                      <div className={styles.configItem}>
                        <label>Session Timeout (minutes)</label>
                        <span className={styles.configValue}>{systemConfig.securitySettings?.sessionTimeout}</span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Max Login Attempts</label>
                        <span className={styles.configValue}>{systemConfig.securitySettings?.maxLoginAttempts}</span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Password Min Length</label>
                        <span className={styles.configValue}>{systemConfig.securitySettings?.passwordMinLength}</span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Two-Factor Authentication</label>
                        <span className={`${styles.configValue} ${systemConfig.securitySettings?.twoFactorAuth ? styles.enabled : styles.disabled}`}>
                          {systemConfig.securitySettings?.twoFactorAuth ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.configSection}>
                    <h3 className={styles.configTitle}>Notification Settings</h3>
                    <div className={styles.configGrid}>
                      <div className={styles.configItem}>
                        <label>Email Notifications</label>
                        <span className={`${styles.configValue} ${systemConfig.notificationSettings?.emailNotifications ? styles.enabled : styles.disabled}`}>
                          {systemConfig.notificationSettings?.emailNotifications ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className={styles.configItem}>
                        <label>SMS Notifications</label>
                        <span className={`${styles.configValue} ${systemConfig.notificationSettings?.smsNotifications ? styles.enabled : styles.disabled}`}>
                          {systemConfig.notificationSettings?.smsNotifications ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Push Notifications</label>
                        <span className={`${styles.configValue} ${systemConfig.notificationSettings?.pushNotifications ? styles.enabled : styles.disabled}`}>
                          {systemConfig.notificationSettings?.pushNotifications ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Admin Alerts</label>
                        <span className={`${styles.configValue} ${systemConfig.notificationSettings?.adminAlerts ? styles.enabled : styles.disabled}`}>
                          {systemConfig.notificationSettings?.adminAlerts ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.configSection}>
                    <h3 className={styles.configTitle}>Membership Settings</h3>
                    <div className={styles.configGrid}>
                      <div className={styles.configItem}>
                        <label>Free Tokens</label>
                        <span className={styles.configValue}>{systemConfig.membershipSettings?.freeTokens}</span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Token Expiry (days)</label>
                        <span className={styles.configValue}>{systemConfig.membershipSettings?.tokenExpiryDays}</span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Max Job Posts (Free)</label>
                        <span className={styles.configValue}>{systemConfig.membershipSettings?.maxJobPosts}</span>
                      </div>
                      <div className={styles.configItem}>
                        <label>Premium Features</label>
                        <span className={`${styles.configValue} ${systemConfig.membershipSettings?.premiumFeatures ? styles.enabled : styles.disabled}`}>
                          {systemConfig.membershipSettings?.premiumFeatures ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add New Admin Modal */}
      {showAddAdminModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add New Admin User</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowAddAdminModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({...newAdminForm, name: e.target.value})}
                  className={styles.formInput}
                  placeholder="Enter full name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                  className={styles.formInput}
                  placeholder="Enter email address"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select 
                  value={newAdminForm.role}
                  onChange={(e) => setNewAdminForm({...newAdminForm, role: e.target.value})}
                  className={styles.formInput}
                >
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Support">Support</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Permissions</label>
                <div className={styles.permissionsList}>
                  {availablePermissions.map((permission) => (
                    <label key={permission} className={styles.permissionItem}>
                      <input 
                        type="checkbox"
                        checked={newAdminForm.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAdminForm({
                              ...newAdminForm,
                              permissions: [...newAdminForm.permissions, permission]
                            });
                          } else {
                            setNewAdminForm({
                              ...newAdminForm,
                              permissions: newAdminForm.permissions.filter(p => p !== permission)
                            });
                          }
                        }}
                      />
                      <span>{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowAddAdminModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveBtn}
                onClick={handleSaveNewAdmin}
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit System Configuration Modal */}
      {showEditConfigModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Edit System Configuration</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowEditConfigModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.configForm}>
                <div className={styles.formGroup}>
                  <label>Site Name</label>
                  <input 
                    type="text" 
                    value={systemConfig.platformSettings?.siteName || ''}
                    onChange={(e) => handleConfigChange('platformSettings', 'siteName', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Default Currency</label>
                  <select 
                    value={systemConfig.platformSettings?.defaultCurrency || ''}
                    onChange={(e) => handleConfigChange('platformSettings', 'defaultCurrency', e.target.value)}
                    className={styles.formInput}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Session Timeout (minutes)</label>
                  <input 
                    type="number" 
                    value={systemConfig.securitySettings?.sessionTimeout || ''}
                    onChange={(e) => handleConfigChange('securitySettings', 'sessionTimeout', parseInt(e.target.value))}
                    className={styles.formInput}
                    min="5"
                    max="120"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Max Login Attempts</label>
                  <input 
                    type="number" 
                    value={systemConfig.securitySettings?.maxLoginAttempts || ''}
                    onChange={(e) => handleConfigChange('securitySettings', 'maxLoginAttempts', parseInt(e.target.value))}
                    className={styles.formInput}
                    min="3"
                    max="10"
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowEditConfigModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveBtn}
                onClick={handleSaveSystemConfig}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
