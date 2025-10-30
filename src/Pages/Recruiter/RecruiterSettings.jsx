import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useSidebar } from "../../Contexts/SidebarContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { Building, Lock } from "lucide-react";
import styles from "../../Styles/RecruiterDashboard.module.css";

const RecruiterSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [settingsData, setSettingsData] = useState({
    profile: {
      companyName: user?.companyName || "",
      contactPerson: "",
      email: user?.email || "",
      phone: "",
      website: "",
      industry: "",
      companySize: "",
      location: "",
      description: ""
    },
    password: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const handleInputChange = (section, field, value) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handlePasswordChange = () => {
    if (settingsData.password.newPassword !== settingsData.password.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    if (settingsData.password.newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    alert("Password changed successfully!");
    setSettingsData(prev => ({
      ...prev,
      password: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }
    }));
  };

  const handleSaveSettings = (section) => {
    alert(`${section} settings saved successfully!`);
    // Here you would typically save to backend
  };

  const tabs = [
    { id: 'profile', label: 'Company Profile', icon: <Building size={20} /> },
    { id: 'password', label: 'Change Password', icon: <Lock size={20} /> }
  ];

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <RecruiterSidebar darkMode={theme === 'dark'} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <section className={styles.settingsSection}>
          <div className={styles.settingsHeader}>
            <h1>Settings</h1>
            <p>Manage your account settings and preferences</p>
          </div>
          
          <div className={styles.settingsContainer}>
            <div className={styles.settingsSidebar}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.settingsTab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={styles.settingsContent}>
              {activeTab === 'profile' && (
                <div className={styles.settingsPanel}>
                  <h3>Company Profile Settings</h3>
                  <div className={styles.formSection}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Company Name *</label>
                        <input
                          type="text"
                          value={settingsData.profile.companyName}
                          onChange={(e) => handleInputChange('profile', 'companyName', e.target.value)}
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Contact Person</label>
                        <input
                          type="text"
                          value={settingsData.profile.contactPerson}
                          onChange={(e) => handleInputChange('profile', 'contactPerson', e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Email Address *</label>
                        <input
                          type="email"
                          value={settingsData.profile.email}
                          onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                          placeholder="company@example.com"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          value={settingsData.profile.phone}
                          onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Website</label>
                        <input
                          type="url"
                          value={settingsData.profile.website}
                          onChange={(e) => handleInputChange('profile', 'website', e.target.value)}
                          placeholder="https://yourcompany.com"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Industry</label>
                        <select
                          value={settingsData.profile.industry}
                          onChange={(e) => handleInputChange('profile', 'industry', e.target.value)}
                        >
                          <option value="">Select industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                          <option value="Retail">Retail</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Company Size</label>
                        <select
                          value={settingsData.profile.companySize}
                          onChange={(e) => handleInputChange('profile', 'companySize', e.target.value)}
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Location</label>
                        <input
                          type="text"
                          value={settingsData.profile.location}
                          onChange={(e) => handleInputChange('profile', 'location', e.target.value)}
                          placeholder="City, State, Country"
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Company Description</label>
                      <textarea
                        value={settingsData.profile.description}
                        onChange={(e) => handleInputChange('profile', 'description', e.target.value)}
                        placeholder="Describe your company, mission, and values..."
                        rows={4}
                      />
                    </div>
                    <button 
                      className={styles.saveBtn}
                      onClick={() => handleSaveSettings('Profile')}
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'password' && (
                <div className={styles.settingsPanel}>
                  <h3>Change Password</h3>
                  <div className={styles.formSection}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={settingsData.password.currentPassword}
                          onChange={(e) => handleInputChange('password', 'currentPassword', e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>New Password</label>
                        <input
                          type="password"
                          value={settingsData.password.newPassword}
                          onChange={(e) => handleInputChange('password', 'newPassword', e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={settingsData.password.confirmPassword}
                          onChange={(e) => handleInputChange('password', 'confirmPassword', e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <button 
                      className={styles.saveBtn}
                      onClick={handlePasswordChange}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              )}


            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RecruiterSettings;
