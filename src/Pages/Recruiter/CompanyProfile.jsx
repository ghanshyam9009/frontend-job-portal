import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { recruiterService } from '../../services/recruiterService';
import { calculateRecruiterProfileCompletion, getMissingRequiredFields } from '../../utils/recruiterProfileUtils';
import { TrendingUp, CheckCircle, AlertCircle, Shield, Edit, MapPin, Briefcase, Globe, Calendar, FileText, Building, Phone, Mail, Hash, Award, XCircle } from 'lucide-react';

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
  const [isEditMode, setIsEditMode] = useState(true);
  const [detailedData, setDetailedData] = useState(null);

  const formatKycStatusLabel = (status = '') => {
    if (!status) return 'Pending';
    return status
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          const response = await recruiterService.getProfile(user.email, true);

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
      } catch (err) {
        console.error('Error fetching detailed data:', err);
      }
    }
  };

  useEffect(() => {
    if (!isProfileComplete) {
      setIsEditMode(true);
    }
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

      const cleanProfileData = {
        company_name: profileData.company_name.trim(),
        phone_number: profileData.phone.trim(),
        industry: profileData.industry.trim(),
        company_size: profileData.company_size.trim(),
        description: profileData.description.trim(),
      };
      
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
      
      if (profileData.founded_year) {
        const year = parseInt(profileData.founded_year);
        if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
          cleanProfileData.founded_year = year;
        }
      }

      const response = await recruiterService.updateProfile(user?.email, cleanProfileData);

      if (response && response.success) {
        setShowSuccessModal(true);
        setSuccess(true);
        setError(null);
        recruiterService.clearEmployerCache(user?.email);

        if (response.data || response.profile) {
          const updatedData = response.data?.profile || response.profile || response.data;

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

          updateUser(profileOnlyData);

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
        }
      } else {
        const errorMessage = response?.error || 
                            response?.message || 
                            'Failed to update profile. Please check all required fields and try again.';
        
        if (response?.status === 500) {
          setError(`Server error: ${errorMessage}. Please ensure all required fields are filled correctly and try again. If the problem persists, contact support.`);
        } else {
          setError(errorMessage);
        }
        setSuccess(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
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

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const renderProfileView = () => {
    if (!isProfileComplete || isEditMode) return null;

    return (
      <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} overflow-hidden mb-6`}>
        <div className={`p-5 border-b ${borderColor} flex items-center justify-between`}>
          <div>
            <h2 className={`text-xl font-bold ${textColor} mb-1`}>Company Profile</h2>
            <p className={`text-sm ${textSecondary}`}>View your complete company information</p>
          </div>
          <button
            className="px-4 py-2 bg-[#2271B5] text-white text-sm rounded-md hover:bg-[#1a5a8f] transition-colors flex items-center gap-2"
            onClick={() => {
              setIsEditMode(true);
              fetchDetailedData();
            }}
          >
            <Edit size={16} />
            Edit Profile
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Company Information */}
          <div>
            <h3 className={`text-base font-semibold ${textColor} mb-3 flex items-center gap-2`}>
              <Building size={18} className="text-[#2271B5]" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Company Name</label>
                <p className={`text-sm ${textColor} mt-1`}>{profileData.company_name || 'Not provided'}</p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Email</label>
                <p className={`text-sm ${textColor} mt-1 flex items-center gap-1`}>
                  <Mail size={14} />
                  {profileData.email || 'Not provided'}
                </p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Phone Number</label>
                <p className={`text-sm ${textColor} mt-1 flex items-center gap-1`}>
                  <Phone size={14} />
                  {profileData.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Website</label>
                <p className={`text-sm mt-1 flex items-center gap-1`}>
                  {profileData.website ? (
                    <>
                      <Globe size={14} className="text-[#2271B5]" />
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-[#2271B5] hover:underline">
                        {profileData.website}
                      </a>
                    </>
                  ) : (
                    <span className={textColor}>Not provided</span>
                  )}
                </p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Industry</label>
                <p className={`text-sm ${textColor} mt-1`}>{profileData.industry || 'Not provided'}</p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Company Size</label>
                <p className={`text-sm ${textColor} mt-1`}>{profileData.company_size || 'Not provided'}</p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Founded Year</label>
                <p className={`text-sm ${textColor} mt-1 flex items-center gap-1`}>
                  <Calendar size={14} />
                  {profileData.founded_year || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className={`text-base font-semibold ${textColor} mb-3 flex items-center gap-2`}>
              <MapPin size={18} className="text-[#2271B5]" />
              Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Street Address</label>
                <p className={`text-sm ${textColor} mt-1`}>{profileData.address || 'Not provided'}</p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>City</label>
                <p className={`text-sm ${textColor} mt-1`}>{profileData.city || 'Not provided'}</p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>State</label>
                <p className={`text-sm ${textColor} mt-1`}>{profileData.state || 'Not provided'}</p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Country</label>
                <p className={`text-sm ${textColor} mt-1`}>{profileData.country || 'Not provided'}</p>
              </div>
              <div>
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Postal Code</label>
                <p className={`text-sm ${textColor} mt-1`}>{profileData.postal_code || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div>
            <h3 className={`text-base font-semibold ${textColor} mb-3 flex items-center gap-2`}>
              <Briefcase size={18} className="text-[#2271B5]" />
              Company Description
            </h3>
            <p className={`text-sm ${textColor} leading-relaxed`}>{profileData.description || 'Not provided'}</p>
          </div>

          {/* Additional Details */}
          {detailedData && (
            <div>
              <h3 className={`text-base font-semibold ${textColor} mb-3 flex items-center gap-2`}>
                <FileText size={18} className="text-[#2271B5]" />
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(detailedData).map(([key, value]) => {
                  const skipFields = ['company_name', 'email', 'phone', 'phone_number', 'website', 'company_website', 'address', 'city', 'state', 'country', 'postal_code', 'industry', 'company_size', 'description', 'founded_year'];
                  if (skipFields.includes(key.toLowerCase()) || !value) return null;

                  return (
                    <div key={key}>
                      <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className={`text-sm ${textColor} mt-1`}>{String(value)}</p>
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
      <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2271B5]"></div>
            <h2 className={`mt-4 text-xl font-semibold ${textColor}`}>Loading Profile...</h2>
            <p className={`mt-2 ${textSecondary}`}>Fetching your company profile data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className={`text-2xl lg:text-3xl font-bold ${textColor} mb-1`}>
            {isEditMode || !isProfileComplete ? 'Complete Your Profile' : 'Company Profile'}
          </h1>
          <p className={`text-sm ${textSecondary}`}>
            {isEditMode || !isProfileComplete 
              ? 'Fill in your company details to enable job posting and candidate outreach'
              : 'Manage your company information and verification status'}
          </p>
        </div>

        {renderProfileView()}

        {(isEditMode || !isProfileComplete) && (
          <>
            {/* Step Progress */}
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-5 mb-6`}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${textColor}`}>Setup Progress</span>
                  <span className={`text-sm font-bold ${textColor}`}>{Math.round(stepProgress)}%</span>
                </div>
                <div className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div
                    className="h-full bg-[#2271B5] transition-all duration-300"
                    style={{ width: `${stepProgress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {stepDefinitions.map((step, index) => {
                  const previousStepsComplete = index === 0 || stepDefinitions.slice(0, index).every(prevStep => prevStep.complete);
                  const isActive = step.complete || previousStepsComplete;
                  return (
                    <div
                      key={step.number}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${borderColor} ${
                        isActive ? (isDark ? 'bg-gray-700/50' : 'bg-blue-50') : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          step.complete
                            ? 'bg-green-500 text-white'
                            : isActive
                            ? 'bg-[#2271B5] text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step.complete ? <CheckCircle size={16} /> : step.number}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${textColor}`}>{step.label}</p>
                        <p className={`text-xs ${textSecondary}`}>{step.statusText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className={`${cardBg} rounded-lg shadow-sm border-2 ${
              profileCompletion === 100 ? 'border-green-500' : profileCompletion >= 70 ? 'border-yellow-500' : 'border-red-500'
            } p-5 mb-6`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {profileCompletion === 100 ? (
                    <CheckCircle size={24} className="text-green-500" />
                  ) : (
                    <TrendingUp size={24} className={profileCompletion >= 70 ? 'text-yellow-500' : 'text-red-500'} />
                  )}
                  <h3 className={`text-lg font-bold ${textColor}`}>Profile Completion</h3>
                </div>
                <div className={`text-2xl font-bold ${
                  profileCompletion === 100 ? 'text-green-500' : profileCompletion >= 70 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {profileCompletion}%
                </div>
              </div>
              <div className={`w-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden mb-3`}>
                <div
                  className={`h-full transition-all duration-300 ${
                    profileCompletion === 100 ? 'bg-green-500' : profileCompletion >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              {profileCompletion < 100 ? (
                <div className={`text-sm ${textSecondary}`}>
                  {missingFields.length > 0 && (
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className={textColor}>Missing required fields:</strong> {missingFields.join(', ')}
                      </div>
                    </div>
                  )}
                  <p className={`${textColor} font-medium`}>
                    Complete {100 - profileCompletion}% more to enable job posting.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                  <CheckCircle size={16} />
                  Profile Complete! You can now post jobs.
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 dark:text-green-200">Profile updated successfully!</p>
              </div>
            )}

            {/* Profile Form */}
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} overflow-hidden mb-6`}>
              <div className={`p-5 border-b ${borderColor}`}>
                <h2 className={`text-lg font-bold ${textColor} mb-1`}>Company Information</h2>
                <p className={`text-sm ${textSecondary}`}>Enter your company details</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={profileData.company_name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={profileData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      required
                      className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Company Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="company_size"
                      value={profileData.company_size}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-1`}>
                      Founded Year
                    </label>
                    <input
                      type="number"
                      name="founded_year"
                      value={profileData.founded_year}
                      onChange={handleInputChange}
                      placeholder="e.g., 2020"
                      min="1900"
                      max={new Date().getFullYear()}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                        isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={`text-base font-semibold ${textColor} mb-3`}>Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textColor} mb-1`}>
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        placeholder="Street address"
                        className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-1`}>
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-1`}>
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={profileData.state}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-1`}>
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-1`}>
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postal_code"
                        value={profileData.postal_code}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-medium ${textColor} mb-1`}>
                    Company Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={profileData.description}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="Tell us about your company..."
                    required
                    className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                      isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2.5 bg-[#2271B5] text-white font-medium rounded-md hover:bg-[#1a5a8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* KYC Verification */}
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} overflow-hidden`}>
              <div className={`p-5 border-b ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className={`text-lg font-bold ${textColor} mb-1`}>KYC Verification</h2>
                    <p className={`text-sm ${textSecondary}`}>
                      Secure your account and unlock hiring features by verifying your organization
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={20} className={isKycVerified ? 'text-green-500' : 'text-yellow-500'} />
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isKycVerified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : isKycSubmitted
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {formatKycStatusLabel(kycStatus.status)}
                    </span>
                  </div>
                </div>
                {kycStatus.updatedAt && (
                  <p className={`text-xs ${textSecondary}`}>
                    Last updated: {new Date(kycStatus.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="p-5">
                {(!isProfileComplete || !isKycVerified) && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                      {isProfileComplete
                        ? 'Upload your company KYC document (GST, PAN, Incorporation Certificate, etc.) to enable job posting and candidate outreach.'
                        : 'Complete your company profile first. Once done, return here to submit your KYC documents.'}
                    </p>
                  </div>
                )}

                {kycError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-200">{kycError}</p>
                  </div>
                )}

                {kycSuccess && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800 dark:text-green-200">{kycSuccess}</p>
                  </div>
                )}

                <form onSubmit={handleKycSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-1`}>
                        Document Type
                      </label>
                      <select
                        name="documentType"
                        value={kycData.documentType}
                        onChange={handleKycInputChange}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                      >
                        <option value="GST">GST Certificate</option>
                        <option value="PAN">PAN Card</option>
                        <option value="MSME">MSME Registration</option>
                        <option value="INCORPORATION">Certificate of Incorporation</option>
                        <option value="OTHER">Other Government Issued Document</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-1`}>
                        Document Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="documentNumber"
                        value={kycData.documentNumber}
                        onChange={handleKycInputChange}
                        placeholder="Enter registration / document number"
                        required
                        className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textColor} mb-1`}>
                        Upload Document (PDF/JPG/PNG) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleKycFileChange}
                        required
                        className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                      />
                      {kycData.documentFile && (
                        <p className={`text-xs ${textSecondary} mt-1`}>
                          Selected file: {kycData.documentFile.name}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textColor} mb-1`}>
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        name="additionalNotes"
                        value={kycData.additionalNotes}
                        onChange={handleKycInputChange}
                        rows="3"
                        placeholder="Add any clarifications for the verification team (optional)"
                        className={`w-full px-3 py-2 border ${borderColor} rounded-md ${
                          isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                        } focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                      />
                    </div>

                    {kycStatus.documentUrl && (
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${textColor} mb-1`}>
                          Previously Uploaded Document
                        </label>
                        <a
                          href={kycStatus.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2271B5] hover:underline text-sm flex items-center gap-1"
                        >
                          <FileText size={14} />
                          View document
                        </a>
                      </div>
                    )}

                    {kycStatus.reviewerNote && (
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${textColor} mb-1`}>
                          Reviewer Note
                        </label>
                        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                          <p className="text-sm text-yellow-900 dark:text-yellow-200">{kycStatus.reviewerNote}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={kycLoading}
                    className="w-full md:w-auto px-6 py-2.5 bg-[#2271B5] text-white font-medium rounded-md hover:bg-[#1a5a8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {kycLoading ? 'Submitting...' : 'Submit KYC for Review'}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className={`${cardBg} rounded-lg shadow-xl max-w-md w-full p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-500" />
              </div>
            </div>
            <h2 className={`text-xl font-bold ${textColor} text-center mb-2`}>Success!</h2>
            <p className={`text-sm ${textSecondary} text-center mb-6`}>
              Your company profile has been updated successfully.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-4 py-2.5 bg-[#2271B5] text-white font-medium rounded-md hover:bg-[#1a5a8f] transition-colors"
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