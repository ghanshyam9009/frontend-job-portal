import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { CheckCircle, Clock, XCircle, Check } from "lucide-react";
import styles from "../../Styles/RecruiterDashboard.module.css";

const CompanyProfile = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileData, setProfileData] = useState({
    company_name: user?.company_name || "",
    email: user?.email || "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    industry: "",
    company_size: "",
    description: "",
    founded_year: "",
    kyc_status: "notverified",
    kyc_documents: {
      pan_card: "",
      gst_number: "",
      registration_certificate: "",
      bank_account: "",
      address_proof: ""
    }
  });

  const [kycData, setKycData] = useState({
    pan_card: "",
    gst_number: "",
    registration_certificate: "",
    bank_account: "",
    address_proof: ""
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.bigsources.in/api/Recruiter/profile/${user?.email}`);
        if (response.ok) {
          const data = await response.json();
          setProfileData(prev => ({
            ...prev,
            ...data,
            kyc_documents: data.kyc_documents || prev.kyc_documents
          }));
          setKycData(data.kyc_documents || {});
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchProfileData();
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKycInputChange = (field, value) => {
    setKycData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`https://api.bigsources.in/api/Recruiter/profile/${user?.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKycUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`https://api.bigsources.in/api/Recruiter/update/${user?.email}/kyc`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kycData),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setProfileData(prev => ({
          ...prev,
          kyc_status: "pending",
          kyc_documents: kycData
        }));
      } else {
        throw new Error('Failed to update KYC');
      }
    } catch (err) {
      setError("Failed to update KYC information. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccess(false);
  };

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showSuccessModal) {
        handleCloseSuccessModal();
      }
    };

    if (showSuccessModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showSuccessModal]);

  // Handle click outside modal to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseSuccessModal();
    }
  };

  const getKycStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return styles.statusActive;
      case 'pending':
        return styles.statusDraft;
      case 'notverified':
        return styles.statusClosed;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <RecruiterSidebar darkMode={theme === 'dark'} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <main className={styles.main}>
        <section className={styles.companyProfileSection}>
          <div className={styles.sectionHeader}>
            <h1>Company Profile</h1>
            <p>Manage your company information and KYC documents</p>
          </div>

          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={styles.stepProgress}>
              <div className={styles.progressBar} style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
            </div>
            <div className={styles.steps}>
              <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepLabel}>Company Information</div>
                <div className={styles.stepPercentage}>{currentStep >= 1 ? `${(1 / totalSteps) * 100}%` : '0%'}</div>
              </div>
              <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepLabel}>KYC Verification</div>
                <div className={styles.stepPercentage}>{currentStep >= 2 ? `${(2 / totalSteps) * 100}%` : '0%'}</div>
              </div>
            </div>
          </div>

          <div className={styles.profileTabs}>
            <div className={styles.tabContent}>
              {/* Company Information Tab */}
              {currentStep === 1 && (
                <div className={styles.formSection}>
                  <h2>Company Information</h2>
                <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Company Name *</label>
                      <input
                        type="text"
                        value={profileData.company_name}
                        onChange={(e) => handleInputChange("company_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Email *</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Website</label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://www.example.com"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Industry</label>
                      <select
                        value={profileData.industry}
                        onChange={(e) => handleInputChange("industry", e.target.value)}
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Company Size</label>
                      <select
                        value={profileData.company_size}
                        onChange={(e) => handleInputChange("company_size", e.target.value)}
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Founded Year</label>
                      <input
                        type="number"
                        value={profileData.founded_year}
                        onChange={(e) => handleInputChange("founded_year", e.target.value)}
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Address</label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>City</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>State</label>
                      <input
                        type="text"
                        value={profileData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Country</label>
                      <input
                        type="text"
                        value={profileData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Postal Code</label>
                      <input
                        type="text"
                        value={profileData.postal_code}
                        onChange={(e) => handleInputChange("postal_code", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Company Description</label>
                    <textarea
                      value={profileData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                      placeholder="Describe your company, its mission, and what makes it unique..."
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? "Updating..." : "Update Company Profile"}
                    </button>
                    <button type="button" className={styles.nextBtn} onClick={() => setCurrentStep(2)}>
                      Next: KYC Verification
                    </button>
                  </div>
                </form>
                </div>
              )}

              {/* KYC Section */}
              {currentStep === 2 && (
                <div className={styles.formSection}>
                  <div className={styles.kycHeader}>
                    <h2>KYC Verification</h2>
                    <div className={styles.kycStatus}>
                      <span className={`${styles.statusBadge} ${getKycStatusColor(profileData.kyc_status)}`}>
                        {profileData.kyc_status === 'verified' ? <><CheckCircle size={16} /> Verified</> :
                         profileData.kyc_status === 'pending' ? <><Clock size={16} /> Pending Review</> :
                         <><XCircle size={16} /> Not Verified</>}
                      </span>
                    </div>
                  </div>
                  
                  <form onSubmit={handleKycUpdate} className={styles.profileForm}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>PAN Card Number *</label>
                        <input
                          type="text"
                          value={kycData.pan_card}
                          onChange={(e) => handleKycInputChange("pan_card", e.target.value.toUpperCase())}
                          placeholder="ABCDE1234F"
                          pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>GST Number</label>
                        <input
                          type="text"
                          value={kycData.gst_number}
                          onChange={(e) => handleKycInputChange("gst_number", e.target.value.toUpperCase())}
                          placeholder="22ABCDE1234F1Z5"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Registration Certificate Number</label>
                        <input
                          type="text"
                          value={kycData.registration_certificate}
                          onChange={(e) => handleKycInputChange("registration_certificate", e.target.value)}
                          placeholder="Company registration number"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Bank Account Number</label>
                        <input
                          type="text"
                          value={kycData.bank_account}
                          onChange={(e) => handleKycInputChange("bank_account", e.target.value)}
                          placeholder="Bank account number"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Address Proof</label>
                        <input
                          type="text"
                          value={kycData.address_proof}
                          onChange={(e) => handleKycInputChange("address_proof", e.target.value)}
                          placeholder="Address proof document reference"
                        />
                      </div>
                    </div>
                    
                    <div className={styles.kycNotice}>
                      <p><strong>Note:</strong> KYC verification is required for posting jobs. Please ensure all information is accurate as it will be verified by our admin team.</p>
                    </div>
                    
                    <div className={styles.formActions}>
                      <button type="button" className={styles.backBtn} onClick={() => setCurrentStep(1)}>
                        Go Back
                      </button>
                      <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Submitting..." : "Submit KYC for Verification"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          
          {error && <p className={styles.errorText}>{error}</p>}
        </section>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Success!</h2>
              <button 
                className={styles.closeButton}
                onClick={handleCloseSuccessModal}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.successIcon}><Check size={24} /></div>
              <p className={styles.successMessage}>
                {profileData.kyc_status === 'pending' ?
                  'KYC information submitted successfully! It will be reviewed by our admin team.' :
                  'Company profile updated successfully!'
                }
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.okButton}
                onClick={handleCloseSuccessModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
