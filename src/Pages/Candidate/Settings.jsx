import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import styles from "./UserDashboard.module.css";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [settingsData, setSettingsData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifications: {
      email: true,
      jobAlerts: true,
      applicationUpdates: true,
      weeklyDigest: false,
      marketingEmails: false
    },
    privacy: {
      profileVisibility: "public",
      showContactInfo: true,
      allowMessages: true
    },
    preferences: {
      jobRecommendations: true,
      salaryAlerts: true,
      locationPreferences: []
    }
  });

  const [activeSection, setActiveSection] = useState('password');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handlePasswordChange = () => {
    if (settingsData.newPassword !== settingsData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    if (settingsData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    alert("Password changed successfully!");
    setSettingsData(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }));
  };

  const handleNotificationChange = (key, value) => {
    setSettingsData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setSettingsData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setSettingsData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    alert("Settings saved successfully!");
    // Here you would typically save to backend
  };

  const sections = [
    { id: 'password', label: 'Change Password', icon: '🔒' },
    { id: 'notifications', label: 'Notification Preferences', icon: '🔔' },
    { id: 'privacy', label: 'Privacy Settings', icon: '🔒' },
    { id: 'preferences', label: 'Job Preferences', icon: '⚙️' }
  ];

  return (
    <div className={styles.dashboardContainer}>
      <CandidateNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className={styles.main}>
        <section className={styles.settingsSection}>
          <div className={styles.settingsHeader}>
            <h2>Settings</h2>
            <p>Manage your account settings and preferences</p>
          </div>
          
          <div className={styles.settingsContainer}>
            <div className={styles.settingsSidebar}>
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`${styles.settingsTab} ${activeSection === section.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className={styles.tabIcon}>{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>

            <div className={styles.settingsContent}>
              {activeSection === 'password' && (
                <div className={styles.settingsPanel}>
                  <h3>Change Password</h3>
                  <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={settingsData.currentPassword}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>New Password</label>
                      <input
                        type="password"
                        value={settingsData.newPassword}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={settingsData.confirmPassword}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button className={styles.primaryBtn} onClick={handlePasswordChange}>
                      Change Password
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className={styles.settingsPanel}>
                  <h3>Notification Preferences</h3>
                  <div className={styles.notificationsSection}>
                    <div className={styles.notificationItem}>
                      <div className={styles.notificationInfo}>
                        <h4>Email Notifications</h4>
                        <p>Receive notifications via email</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settingsData.notifications.email}
                          onChange={(e) => handleNotificationChange('email', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.notificationItem}>
                      <div className={styles.notificationInfo}>
                        <h4>Job Alerts</h4>
                        <p>Get notified about new jobs matching your criteria</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settingsData.notifications.jobAlerts}
                          onChange={(e) => handleNotificationChange('jobAlerts', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.notificationItem}>
                      <div className={styles.notificationInfo}>
                        <h4>Application Updates</h4>
                        <p>Receive updates about your job applications</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settingsData.notifications.applicationUpdates}
                          onChange={(e) => handleNotificationChange('applicationUpdates', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.notificationItem}>
                      <div className={styles.notificationInfo}>
                        <h4>Weekly Digest</h4>
                        <p>Receive a weekly summary of job opportunities</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settingsData.notifications.weeklyDigest}
                          onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.notificationItem}>
                      <div className={styles.notificationInfo}>
                        <h4>Marketing Emails</h4>
                        <p>Receive promotional emails and updates about our services</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settingsData.notifications.marketingEmails}
                          onChange={(e) => handleNotificationChange('marketingEmails', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className={styles.settingsPanel}>
                  <h3>Privacy Settings</h3>
                  <div className={styles.privacySection}>
                    <div className={styles.formGroup}>
                      <label>Profile Visibility</label>
                      <select
                        value={settingsData.privacy.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      >
                        <option value="public">Public - Visible to all employers</option>
                        <option value="limited">Limited - Visible to employers you apply to</option>
                        <option value="private">Private - Not visible to employers</option>
                      </select>
                    </div>

                    <div className={styles.privacyItem}>
                      <div className={styles.privacyInfo}>
                        <h4>Show Contact Information</h4>
                        <p>Allow employers to see your contact details</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settingsData.privacy.showContactInfo}
                          onChange={(e) => handlePrivacyChange('showContactInfo', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.privacyItem}>
                      <div className={styles.privacyInfo}>
                        <h4>Allow Direct Messages</h4>
                        <p>Let employers send you direct messages</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settingsData.privacy.allowMessages}
                          onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className={styles.settingsPanel}>
                  <h3>Job Preferences</h3>
                  <div className={styles.preferencesSection}>
                    <div className={styles.preferenceItem}>
                      <div className={styles.preferenceInfo}>
                        <h4>Job Recommendations</h4>
                        <p>Get personalized job recommendations based on your profile</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settingsData.preferences.jobRecommendations}
                          onChange={(e) => handlePreferenceChange('jobRecommendations', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.preferenceItem}>
                      <div className={styles.preferenceInfo}>
                        <h4>Salary Alerts</h4>
                        <p>Get notified when jobs with your desired salary range are posted</p>
                      </div>
                      <label className={styles.toggle}>
                        <input
                          type="checkbox"
                          checked={settingsData.preferences.salaryAlerts}
                          onChange={(e) => handlePreferenceChange('salaryAlerts', e.target.checked)}
                        />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Preferred Locations</label>
                      <input
                        type="text"
                        placeholder="Enter preferred job locations (comma separated)"
                        value={settingsData.preferences.locationPreferences.join(', ')}
                        onChange={(e) => handlePreferenceChange('locationPreferences', e.target.value.split(', '))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.saveSection}>
            <button className={styles.saveBtn} onClick={handleSaveSettings}>
              Save All Settings
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;


