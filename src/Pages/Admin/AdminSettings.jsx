import React, { useState } from "react";
import styles from "../../Styles/AdminDashboard.module.css";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "JobPortal",
    siteDescription: "Connecting talent with opportunity worldwide",
    emailNotifications: true,
    maintenanceMode: false,
    allowRegistration: true,
    maxFileSize: "5MB"
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Admin Settings</h1>
        <p className={styles.pageSubtitle}>Configure platform settings and preferences</p>
      </div>

      <div className={styles.settingsContainer}>
        <div className={styles.settingsCard}>
          <h3>General Settings</h3>
          <div className={styles.formGroup}>
            <label>Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              className={styles.formTextarea}
              rows={3}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Max File Upload Size</label>
            <select
              value={settings.maxFileSize}
              onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
              className={styles.formSelect}
            >
              <option value="1MB">1MB</option>
              <option value="5MB">5MB</option>
              <option value="10MB">10MB</option>
              <option value="25MB">25MB</option>
            </select>
          </div>
        </div>

        <div className={styles.settingsCard}>
          <h3>System Settings</h3>
          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleText}>Enable Email Notifications</span>
            </label>
          </div>
          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleText}>Maintenance Mode</span>
            </label>
          </div>
          <div className={styles.toggleGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleText}>Allow New Registrations</span>
            </label>
          </div>
        </div>

        <div className={styles.settingsActions}>
          <button onClick={handleSave} className={styles.saveBtn}>
            Save Settings
          </button>
          <button className={styles.resetBtn}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;