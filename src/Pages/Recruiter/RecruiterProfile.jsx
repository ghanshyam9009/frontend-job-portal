import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { recruiterService } from '../../services/recruiterService';
import styles from '../../Styles/RecruiterDashboard.module.css';

const RecruiterProfile = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    companySize: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 1;

  useEffect(() => {
    if (user) {
      recruiterService.getProfile(user.email)
        .then(response => {
          if (response.success && response.data) {
            setFormData(response.data);
          }
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch profile');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await recruiterService.updateProfile(user.email, formData);
      if (response.success) {
        updateUser(response.data);
        setSuccess('Profile updated successfully');
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating the profile');
    }
  };

  if (loading) {
    return (
      <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h2>Loading Profile...</h2>
            <p>Fetching your profile data</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <main className={styles.main}>
        <section className={styles.companyProfileSection}>
          <div className={styles.sectionHeader}>
            <h1>Recruiter Profile</h1>
            <p>Update your profile information</p>
          </div>

          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={styles.stepProgress}>
              <div className={styles.progressBar} style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
            </div>
            <div className={styles.steps}>
              <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepLabel}>Profile Information</div>
                <div className={styles.stepPercentage}>{currentStep >= 1 ? `${(1 / totalSteps) * 100}%` : '0%'}</div>
              </div>
            </div>
          </div>

          <div className={styles.profileTabs}>
            <div className={styles.tabContent}>
              <div className={styles.formSection}>
                <h2>Profile Information</h2>
                {error && <p className={styles.errorText}>{error}</p>}
                {success && <p className={styles.successMessage}>{success}</p>}
                <form onSubmit={handleSubmit} className={styles.profileForm}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Company Name</label>
                      <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Contact Person</label>
                      <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone Number</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Company Size</label>
                      <select name="companySize" value={formData.companySize} onChange={handleInputChange}>
                        <option value="">Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RecruiterProfile;
