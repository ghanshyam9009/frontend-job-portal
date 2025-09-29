import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import styles from "../../Styles/RecruiterDashboard.module.css";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyData, setCompanyData] = useState({
    companyName: user?.companyName || "",
    description: "",
    website: "",
    industry: "",
    size: "",
    location: "",
    founded: "",
    logo: null
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCompanyData(prev => ({
        ...prev,
        logo: file
      }));
      alert(`Logo "${file.name}" uploaded successfully!`);
    }
  };

  const handleSaveProfile = () => {
    alert("Company profile saved successfully!");
  };

  return (
    <div className={styles.dashboardContainer}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <RecruiterSidebar darkMode={darkMode} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <section className={styles.profileSection}>
          <div className={styles.sectionHeader}>
            <h1>Company Profile</h1>
            <p>Manage your company information and branding</p>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()} className={styles.profileForm}>
            <div className={styles.formSection}>
              <h2>Company Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={companyData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Website</label>
                  <input
                    type="url"
                    value={companyData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Industry</label>
                  <select
                    value={companyData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
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
                    value={companyData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
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
                    value={companyData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State, Country"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Founded Year</label>
                  <input
                    type="number"
                    value={companyData.founded}
                    onChange={(e) => handleInputChange('founded', e.target.value)}
                    placeholder="2020"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Company Description</h2>
              <div className={styles.formGroup}>
                <label>About Your Company</label>
                <textarea
                  value={companyData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your company, mission, values, and what makes you unique..."
                  rows={6}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Company Logo</h2>
              <div className={styles.logoUploadSection}>
                <div className={styles.uploadArea}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className={styles.fileInput}
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className={styles.uploadLabel}>
                    <div className={styles.uploadIcon}>📁</div>
                    <p>Upload Company Logo</p>
                    <span>PNG, JPG, SVG (Max 5MB)</span>
                  </label>
                </div>
                {companyData.logo && (
                  <div className={styles.uploadedFile}>
                    <span className={styles.fileIcon}>🖼️</span>
                    <span className={styles.fileName}>{companyData.logo.name}</span>
                    <span className={styles.fileSize}>
                      {(companyData.logo.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={handleSaveProfile} className={styles.submitBtn}>
                Save Profile
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CompanyProfile;


