import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { recruiterService } from '../../services/recruiterService';
import { calculateRecruiterProfileCompletion, getMissingRequiredFields } from '../../utils/recruiterProfileUtils';
import { TrendingUp, CheckCircle, AlertCircle, Shield, Edit, MapPin, Briefcase, Globe, Calendar, FileText, Building } from 'lucide-react';
import styles from '../../Styles/RecruiterDashboard.module.css';

const CompanyProfile = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  
  const [profileData, setProfileData] = useState({
    company_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    industry: '',
    company_size: '',
    description: '',
    founded_year: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [kycStatus, setKycStatus] = useState({
    status: '',
    documentUrl: '',
    updatedAt: '',
    reviewerNote: ''
  });
  const [kycData, setKycData] = useState({
    documentType: 'GST',
    documentNumber: '',
    documentFile: null,
    additionalNotes: ''
  });
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState(null);
  const [kycSuccess, setKycSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(true); // Start in edit mode if profile incomplete
  const [detailedData, setDetailedData] = useState(null);

  const formatKycStatusLabel = (status = '') => {
    if (!status) return 'Pending';
    return status
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate profile completion percentage in real-time
  const profileCompletion = useMemo(() => {
    const dataForCalculation = {
      company_name: profileData.company_name,
      email: profileData.email,
      phone_number: profileData.phone,
      company_website: profileData.website,
      industry: profileData.industry,
      company_size: profileData.company_size,
      description: profileData.description,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      postal_code: profileData.postal_code,
      founded_year: profileData.founded_year,
    };

    const completion = calculateRecruiterProfileCompletion(dataForCalculation);
    console.log('Profile completion calculation:', {
      data: dataForCalculation,
      completion: completion + '%',
      hasCompanyName: !!(profileData.company_name && profileData.company_name.trim()),
      hasEmail: !!(profileData.email && profileData.email.trim()),
      hasPhone: !!(profileData.phone && profileData.phone.trim()),
      hasIndustry: !!(profileData.industry && profileData.industry.trim()),
      hasCompanySize: !!(profileData.company_size && profileData.company_size.trim()),
      hasDescription: !!(profileData.description && profileData.description.trim()),
    });

    return completion;
  }, [profileData]);

  const missingFields = useMemo(() => {
    const dataForCalculation = {
      company_name: profileData.company_name,
      email: profileData.email,
      phone_number: profileData.phone,
      industry: profileData.industry,
      company_size: profileData.company_size,
      description: profileData.description,
    };
    return getMissingRequiredFields(dataForCalculation);
  }, [profileData]);

  const normalizedKycStatus = (kycStatus.status || '').toLowerCase();
  const isKycVerified = ['verified', 'approved', 'completed', 'success'].includes(normalizedKycStatus);
  const isKycSubmitted = ['submitted', 'in_review', 'under_review', 'pending_verification'].includes(normalizedKycStatus);
  const isProfileComplete = profileCompletion === 100;
  const stepDefinitions = [
    {
      number: 1,
      label: 'Company Profile',
      complete: isProfileComplete,
      statusText: `${profileCompletion}%`
    },
    {
      number: 2,
      label: 'KYC Verification',
      complete: isKycVerified,
      statusText: isKycVerified ? 'Verified' : (isKycSubmitted ? 'In Review' : 'Pending')
    }
  ];
  const completedSteps = stepDefinitions.filter(step => step.complete).length;
  const stepProgress = (completedSteps / stepDefinitions.length) * 100;

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          const response = await recruiterService.getProfile(user.email, true); // Force refresh

          if (response.success && response.data) {
            const data = response.data.employer || response.data.profile || response.data;
            setProfileData({
              company_name: data.company_name || '',
              email: data.email || user.email || '',
              phone: data.phone_number || data.phone || '',
              website: data.company_website || data.website || '',
              address: data.address || '',
              city: data.city || '',
              state: data.state || '',
              country: data.country || '',
              postal_code: data.postal_code || '',
              industry: data.industry || '',
              company_size: data.company_size || '',
              description: data.description || '',
              founded_year: data.founded_year || ''
            });
            setKycStatus({
              status: data.kyc_status || '',
              documentUrl: data.kycDocUrl || data.kyc_document_url || '',
              updatedAt: data.kyc_updated_at || data.updatedAt || data.updated_at || '',
              reviewerNote: data.kyc_notes || data.kyc_remark || ''
            });
            setKycData(prev => ({
              ...prev,
              documentType: data.kyc_document_type || prev.documentType,
              documentNumber: data.kyc_document_number || ''
            }));
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
          setError('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Fetch detailed data from AWS API when profile is complete
  const fetchDetailedData = async () => {
    if (user?.email && isProfileComplete) {
      try {
        const url = `https://4x10ubol84.execute-api.ap-southeast-1.amazonaws.com/default/getepmloyerdetailed?email=${encodeURIComponent(user.email)}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDetailedData(data);
        console.log('Fetched detailed data:', data);
      } catch (err) {
        console.error('Error fetching detailed data:', err);
        // Don't set error state here as this is optional additional data
      }
    }
  };

  // Update edit mode when profile completion changes
  useEffect(() => {
    if (!isProfileComplete) {
      setIsEditMode(true); // Force edit mode if profile is incomplete
    }
    // Don't automatically switch to view mode when profile becomes complete
    // Let user decide when to view or edit
  }, [isProfileComplete]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields first
      if (!profileData.company_name?.trim()) {
        setError('Company name is required');
        setLoading(false);
        return;
      }
      if (!profileData.phone?.trim()) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }
      if (!profileData.industry?.trim()) {
        setError('Industry is required');
        setLoading(false);
        return;
      }
      if (!profileData.company_size?.trim()) {
        setError('Company size is required');
        setLoading(false);
        return;
      }
      if (!profileData.description?.trim()) {
        setError('Company description is required');
        setLoading(false);
        return;
      }

      // Prepare clean payload for API - match Postman format exactly
      // Based on Postman payload structure, send all fields that have values
      const cleanProfileData = {
        // Required fields - always include
        company_name: profileData.company_name.trim(),
        phone_number: profileData.phone.trim(),
        industry: profileData.industry.trim(),
        company_size: profileData.company_size.trim(),
        description: profileData.description.trim(),
      };
      
      // Optional fields - only include if they have actual values (not empty)
      // Match Postman format where only fields with values are sent
      if (profileData.address?.trim()) {
        cleanProfileData.address = profileData.address.trim();
      }
      if (profileData.city?.trim()) {
        cleanProfileData.city = profileData.city.trim();
      }
      if (profileData.state?.trim()) {
        cleanProfileData.state = profileData.state.trim();
      }
      if (profileData.country?.trim()) {
        cleanProfileData.country = profileData.country.trim();
      }
      if (profileData.postal_code?.trim()) {
        cleanProfileData.postal_code = profileData.postal_code.trim();
      }
      if (profileData.website?.trim()) {
        cleanProfileData.company_website = profileData.website.trim();
      }
      
      // Handle founded_year - must be a number if provided
      if (profileData.founded_year) {
        const year = parseInt(profileData.founded_year);
        if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
          cleanProfileData.founded_year = year; // Send as number, not string
        }
      }

      // Debug what data is being sent - clean payload
      console.log('Clean profile data being sent:', cleanProfileData);
      console.log('Email:', user?.email);

      // Use the recruiterService.updateProfile method
      const response = await recruiterService.updateProfile(user?.email, cleanProfileData);

      // Handle both success response format and error response format
      if (response && response.success) {
        console.log('Profile update successful:', response);
        setShowSuccessModal(true);
        setSuccess(true);
        setError(null);
        // Clear cache after successful update
        recruiterService.clearEmployerCache(user?.email);

        // Update local state with successful response data if available
        if (response.data || response.profile) {
          const updatedData = response.data?.profile || response.profile || response.data;

          // Extract only profile fields to avoid overwriting critical auth fields
          const profileOnlyData = {
            company_name: updatedData?.company_name,
            phone_number: updatedData?.phone_number || updatedData?.phone,
            company_website: updatedData?.company_website || updatedData?.website,
            industry: updatedData?.industry,
            company_size: updatedData?.company_size,
            description: updatedData?.description,
            address: updatedData?.address,
            city: updatedData?.city,
            state: updatedData?.state,
            country: updatedData?.country,
            postal_code: updatedData?.postal_code,
            founded_year: updatedData?.founded_year
          };

          // Update user context with profile data only (preserve role, user_id, email, etc.)
          updateUser(profileOnlyData);

          // A safer way to update state: spread previous state and override with new values
          // Use nullish coalescing (??) to correctly handle empty strings as valid values
          setProfileData(prev => ({
            ...prev,
            company_name: updatedData.company_name ?? prev.company_name,
            email: updatedData.email ?? prev.email,
            phone: (updatedData.phone_number ?? updatedData.phone) ?? prev.phone,
            website: (updatedData.company_website ?? updatedData.website) ?? prev.website,
            address: updatedData.address ?? prev.address,
            city: updatedData.city ?? prev.city,
            state: updatedData.state ?? prev.state,
            country: updatedData.country ?? prev.country,
            postal_code: updatedData.postal_code ?? prev.postal_code,
            industry: updatedData.industry ?? prev.industry,
            company_size: updatedData.company_size ?? prev.company_size,
            description: updatedData.description ?? prev.description,
            founded_year: updatedData.founded_year ?? prev.founded_year,
          }));

          console.log('Updated data from response:', updatedData);
        }
      } else {
        console.error('Profile update failed:', response);
        const errorMessage = response?.error || 
                            response?.message || 
                            'Failed to update profile. Please check all required fields and try again.';
        
        // Provide more helpful error message for 500 errors
        if (response?.status === 500) {
          setError(`Server error: ${errorMessage}. Please ensure all required fields are filled correctly and try again. If the problem persists, contact support.`);
        } else {
          setError(errorMessage);
        }
        setSuccess(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      // Handle API error response structure
      const errorMessage = err?.response?.data?.error || 
                          err?.error?.message || 
                          err?.error || 
                          err?.message || 
                          'Failed to update profile. Please check all required fields and try again.';
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKycInputChange = (e) => {
    const { name, value } = e.target;
    setKycData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKycFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setKycData(prev => ({
      ...prev,
      documentFile: file
    }));
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setKycError(null);
    setKycSuccess('');

    if (!user?.email) {
      setKycError('Unable to determine recruiter email. Please re-login.');
      return;
    }

    if (!kycData.documentNumber?.trim()) {
      setKycError('Document number is required.');
      return;
    }

    if (!kycData.documentFile) {
      setKycError('Please upload the supporting document.');
      return;
    }

    try {
      setKycLoading(true);
      const formData = new FormData();
      formData.append('kyc_type', kycData.documentType);
      formData.append('kyc_document_number', kycData.documentNumber.trim());
      formData.append('kyc_status', 'submitted');
      if (kycData.additionalNotes?.trim()) {
        formData.append('kyc_notes', kycData.additionalNotes.trim());
      }
      formData.append('document', kycData.documentFile);

      const response = await recruiterService.submitKyc(user.email, formData);

      if (response?.success) {
        const updatedData = response.data?.profile || response.data || response;
        setKycSuccess(response.message || 'KYC details submitted successfully. We will notify you once verification is complete.');
        setKycStatus(prev => ({
          ...prev,
          status: updatedData?.kyc_status || prev.status || 'submitted',
          documentUrl: updatedData?.kycDocUrl || updatedData?.kyc_document_url || prev.documentUrl,
          updatedAt: updatedData?.kyc_updated_at || new Date().toISOString(),
          reviewerNote: updatedData?.kyc_notes || updatedData?.kyc_remark || prev.reviewerNote
        }));
        setKycData(prev => ({
          ...prev,
          documentFile: null
        }));
      } else {
        setKycError(response?.error || 'Failed to submit KYC details. Please try again.');
      }
    } catch (err) {
      console.error('KYC submission failed:', err);
      const errorMessage = err?.error || err?.message || 'Failed to submit KYC details. Please try again.';
      setKycError(errorMessage);
    } finally {
      setKycLoading(false);
    }
  };

  // Render profile view when complete and not in edit mode
  const renderProfileView = () => {
    if (!isProfileComplete || isEditMode) return null;

    return (
      <div className={styles.profileView}>
        <div className={styles.profileHeader}>
          <div className={styles.profileTitle}>
            <h1>Company Profile</h1>
            <button
              className={styles.editButton}
              onClick={() => {
                setIsEditMode(true);
                // Fetch detailed data when entering edit mode
                fetchDetailedData();
              }}
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        <div className={styles.profileSections}>
          {/* Company Information */}
          <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>
              <Building size={20} />
              Company Information
            </h2>
            <div className={styles.profileGrid}>
              <div className={styles.profileField}>
                <label>Company Name</label>
                <p>{profileData.company_name || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Email</label>
                <p>{profileData.email || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Phone Number</label>
                <p>{profileData.phone || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Website</label>
                <p>
                  {profileData.website ? (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                      {profileData.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              </div>
              <div className={styles.profileField}>
                <label>Industry</label>
                <p>{profileData.industry || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Company Size</label>
                <p>{profileData.company_size || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Founded Year</label>
                <p>{profileData.founded_year || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>
              <MapPin size={20} />
              Address
            </h2>
            <div className={styles.profileGrid}>
              <div className={`${styles.profileField} ${styles.fullWidth}`}>
                <label>Street Address</label>
                <p>{profileData.address || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>City</label>
                <p>{profileData.city || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>State</label>
                <p>{profileData.state || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Country</label>
                <p>{profileData.country || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Postal Code</label>
                <p>{profileData.postal_code || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>
              <Briefcase size={20} />
              Company Description
            </h2>
            <div className={styles.profileGrid}>
              <div className={`${styles.profileField} ${styles.fullWidth}`}>
                <label>Description</label>
                <p className={styles.descriptionText}>{profileData.description || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Additional Details from AWS API */}
          {detailedData && (
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>
                <FileText size={20} />
                Additional Details
              </h2>
              <div className={styles.profileGrid}>
                {Object.entries(detailedData).map(([key, value]) => {
                  // Skip common fields already displayed above
                  const skipFields = ['company_name', 'email', 'phone', 'phone_number', 'website', 'company_website', 'address', 'city', 'state', 'country', 'postal_code', 'industry', 'company_size', 'description', 'founded_year'];
                  if (skipFields.includes(key.toLowerCase()) || !value) return null;

                  return (
                    <div key={key} className={styles.profileField}>
                      <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                      <p>{String(value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && !profileData.company_name) {
    return (
      <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h2>Loading Profile...</h2>
            <p>Fetching your company profile data</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <main className={styles.main}>
        {/* Render Profile View when complete and not editing */}
        {renderProfileView()}

        {/* Render Edit Form when in edit mode or profile incomplete */}
        {(isEditMode || !isProfileComplete) && (
          <section className={styles.companyProfileSection}>
          <div className={styles.stepIndicator}>
            <div className={styles.stepProgress}>
              <div
                className={styles.progressBar}
                style={{ width: `${stepProgress}%` }}
              />
            </div>
            <div className={styles.steps}>
              {stepDefinitions.map((step, index) => {
                const previousStepsComplete = index === 0 || stepDefinitions.slice(0, index).every(prevStep => prevStep.complete);
                const isActive = step.complete || previousStepsComplete;
                return (
                  <div key={step.number} className={`${styles.step} ${isActive ? styles.active : ''}`}>
                    <div className={styles.stepNumber}>{step.number}</div>
                    <div className={styles.stepLabel}>{step.label}</div>
                    <div className={styles.stepPercentage}>{step.statusText}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Completion Card */}
          <div style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f8f9fa',
            borderRadius: '8px',
            border: `2px solid ${profileCompletion === 100 ? '#28a745' : profileCompletion >= 70 ? '#ffc107' : '#dc3545'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {profileCompletion === 100 ? (
                  <CheckCircle size={24} color="#28a745" />
                ) : (
                  <TrendingUp size={24} color={profileCompletion >= 70 ? '#ffc107' : '#dc3545'} />
                )}
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Profile Completion</h3>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: profileCompletion === 100 ? '#28a745' : profileCompletion >= 70 ? '#ffc107' : '#dc3545' }}>
                {profileCompletion}%
              </div>
            </div>
            <div style={{ width: '100%', height: '12px', backgroundColor: theme === 'dark' ? '#1a1a1a' : '#e9ecef', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${profileCompletion}%`,
                  height: '100%',
                  backgroundColor: profileCompletion === 100 ? '#28a745' : profileCompletion >= 70 ? '#ffc107' : '#dc3545',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            {profileCompletion < 100 && (
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: theme === 'dark' ? '#ccc' : '#666' }}>
                {missingFields.length > 0 && (
                  <div>
                    <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    <strong>Missing required fields:</strong> {missingFields.join(', ')}
                  </div>
                )}
                <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  {profileCompletion === 100 
                    ? '✅ Your profile is complete! You can now post jobs.'
                    : `Complete ${100 - profileCompletion}% more to enable job posting.`}
                </p>
              </div>
            )}
            {profileCompletion === 100 && (
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#28a745' }}>
                <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                <strong>Profile Complete!</strong> You can now post jobs.
              </div>
            )}
          </div>

          {error && (
            <div className={styles.errorText} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successMessage} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px' }}>
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
            <div className={styles.formSection}>
              <h2>Company Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={profileData.company_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Industry *</label>
                  <input
                    type="text"
                    name="industry"
                    value={profileData.industry}
                    onChange={handleInputChange}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company Size *</label>
                  <select
                    name="company_size"
                    value={profileData.company_size}
                    onChange={handleInputChange}
                    required
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
                  <label>Founded Year</label>
                  <input
                    type="number"
                    name="founded_year"
                    value={profileData.founded_year}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Address Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={profileData.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={profileData.country}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={profileData.postal_code}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Company Description</h2>
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label>Description *</label>
                <textarea
                  name="description"
                  value={profileData.description}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Tell us about your company..."
                  required
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>

          <div className={styles.formSection}>
            <div className={styles.kycHeader}>
              <div>
                <h2>KYC Verification</h2>
                <p style={{ margin: 0, color: theme === 'dark' ? '#cbd5f5' : '#6b7280' }}>
                  Secure your account and unlock hiring features by verifying your organization.
                </p>
              </div>
              <div className={styles.kycStatus}>
                <Shield size={20} color={isKycVerified ? '#10b981' : '#f59e0b'} />
                <span>
                  Status:{' '}
                  <strong>
                    {formatKycStatusLabel(kycStatus.status)}
                  </strong>
                </span>
              </div>
            </div>

            {kycStatus.updatedAt && (
              <p style={{ marginTop: '-8px', color: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: '0.85rem' }}>
                Last updated: {new Date(kycStatus.updatedAt).toLocaleString()}
              </p>
            )}

            {(!isProfileComplete || !isKycVerified) && (
              <div className={styles.kycNotice}>
                <p>
                  {isProfileComplete
                    ? 'Upload your company KYC document (GST, PAN, Incorporation Certificate, etc.) to enable job posting and candidate outreach.'
                    : 'Complete your company profile first. Once done, return here to submit your KYC documents.'}
                </p>
              </div>
            )}

            {kycError && (
              <div className={styles.errorText} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
                {kycError}
              </div>
            )}

            {kycSuccess && (
              <div className={styles.successMessage} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '4px' }}>
                {kycSuccess}
              </div>
            )}

            <form onSubmit={handleKycSubmit} className={styles.profileForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Document Type</label>
                  <select
                    name="documentType"
                    value={kycData.documentType}
                    onChange={handleKycInputChange}
                  >
                    <option value="GST">GST Certificate</option>
                    <option value="PAN">PAN Card</option>
                    <option value="MSME">MSME Registration</option>
                    <option value="INCORPORATION">Certificate of Incorporation</option>
                    <option value="OTHER">Other Government Issued Document</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Document Number *</label>
                  <input
                    type="text"
                    name="documentNumber"
                    value={kycData.documentNumber}
                    onChange={handleKycInputChange}
                    placeholder="Enter registration / document number"
                    required
                  />
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Upload Document (PDF/JPG/PNG) *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleKycFileChange}
                    required
                  />
                  {kycData.documentFile && (
                    <small style={{ display: 'block', marginTop: '0.5rem', color: theme === 'dark' ? '#d1d5db' : '#6b7280' }}>
                      Selected file: {kycData.documentFile.name}
                    </small>
                  )}
                </div>
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Additional Notes (Optional)</label>
                  <textarea
                    name="additionalNotes"
                    value={kycData.additionalNotes}
                    onChange={handleKycInputChange}
                    rows="3"
                    placeholder="Add any clarifications for the verification team (optional)"
                  />
                </div>
                {kycStatus.documentUrl && (
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Previously Uploaded Document</label>
                    <a
                      href={kycStatus.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'underline' }}
                    >
                      View document
                    </a>
                  </div>
                )}
                {kycStatus.reviewerNote && (
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label>Reviewer Note</label>
                    <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: '#fff7ed', border: '1px solid #fdba74', color: '#92400e' }}>
                      {kycStatus.reviewerNote}
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={kycLoading}
                >
                  {kycLoading ? 'Submitting...' : 'Submit KYC for Review'}
                </button>
              </div>
            </form>
          </div>
        </section>
        )}
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Success!</h2>
            <p>Your company profile has been updated successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
