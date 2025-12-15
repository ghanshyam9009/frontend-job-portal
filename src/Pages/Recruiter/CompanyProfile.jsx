import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { calculateRecruiterProfileCompletion, getMissingRequiredFields } from '../../utils/recruiterProfileUtils';
import {
  TrendingUp, CheckCircle, AlertCircle, Shield, Edit, MapPin, Briefcase,
  Globe, Calendar, FileText, Building, Phone, Mail, Users, Award, XCircle,
  Camera, Upload, Check, X, ExternalLink, Lock
} from 'lucide-react';

const CompanyProfile = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

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
    founded_year: '',
    location: '',
    company_logo: '',
    companyLogoFile: null
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
  const [showKycReviewModal, setShowKycReviewModal] = useState(false);
  // Initialize to null. Will be set after profileCompletionPercent is calculated upon fetch.
  const [isEditMode, setIsEditMode] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const logoInputRef = useRef(null);

  const formatKycStatusLabel = (status = '') => {
    if (!status) return 'Pending';
    return status
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const normalizedKycStatus = (kycStatus.status || '').toLowerCase();
  const isKycVerified = ['verified', 'approved', 'completed', 'success', 'accepted'].includes(normalizedKycStatus);
  const isKycSubmitted = ['submitted', 'in_review', 'under_review', 'pending_verification'].includes(normalizedKycStatus);
  const hasKycDocumentSubmitted = isKycSubmitted && (kycData.documentFile || kycStatus.documentUrl);
  const isKycEffective = isKycVerified || hasKycDocumentSubmitted;

  const profileCompletionPercent = useMemo(() => {
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
    return calculateRecruiterProfileCompletion(dataForCalculation);
  }, [profileData]);

  const profileCompletion = useMemo(() => {
    const profileWeight = 70;
    const kycWeight = 30;
    const kycScore = isKycEffective ? kycWeight : 0;
    return Math.round((profileCompletionPercent * profileWeight / 100) + kycScore);
  }, [profileCompletionPercent, isKycEffective]);

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

  const isProfileComplete = profileCompletion === 100;

  // Step Definitions rely on profileCompletionPercent, not profileCompletion
  const stepDefinitions = useMemo(() => ([
    {
      number: 1,
      label: 'Company Profile',
      complete: profileCompletionPercent === 100,
      statusText: `${profileCompletionPercent}%`
    },
    {
      number: 2,
      label: 'KYC Verification',
      complete: isKycVerified,
      statusText: isKycVerified ? 'Verified' : (isKycSubmitted ? 'In Review' : 'Pending')
    }
  ]), [profileCompletionPercent, isKycVerified, isKycSubmitted]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          const response = await recruiterService.getProfile(user.email, true);
          if (response.success && response.data) {
            const data = response.data.employer || response.data.profile || response.data;
            const fetchedProfileData = {
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
              founded_year: data.founded_year || '',
              location: data.location || '',
              company_logo: data.company_logo || data.logo || data.profile_image || ''
            };

            console.log('Loaded profile data:', fetchedProfileData); // Debug log
            console.log('Company logo URL:', fetchedProfileData.company_logo); // Debug log

            setProfileData(fetchedProfileData);
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

            // --- NEW LOGIC FOR isEditMode INITIALIZATION ---
            // Calculate completion based on fetched data
            const initialCompletion = calculateRecruiterProfileCompletion(fetchedProfileData);
            // Set edit mode: true if < 50%, false if >= 50%
            setIsEditMode(initialCompletion < 50);
            // ----------------------------------------------
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

  // Note: The previous logic of checking for < 50% completion is now handled
  // upon data fetching/setting the state. This simplified useEffect is sufficient.
  // The subsequent useMemo logic handles the main profile percentage update.

  useEffect(() => {
    if (showKycReviewModal) {
      const timer = setTimeout(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/recruiter/login';
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showKycReviewModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const validateImageFile = (file) => {
    if (!file) return '';
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) return 'Please upload a JPEG, PNG, or GIF image';
    if (file.size > maxSize) return 'Image size must be less than 2MB';
    return '';
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setError(error);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setProfileData(prev => ({ ...prev, companyLogoFile: file }));
    const previewUrl = URL.createObjectURL(file);
    setProfileData(prev => ({ ...prev, company_logo: previewUrl }));
    setSuccess('Company logo selected successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const validateProfileData = (data) => {
    const trimmed = {};
    if (!data.company_name?.trim()) throw new Error('Company name is required');
    if (!data.phone?.trim()) throw new Error('Phone number is required');
    if (!data.industry?.trim()) throw new Error('Industry is required');
    if (!data.company_size?.trim()) throw new Error('Company size is required');
    if (!data.description?.trim()) throw new Error('Company description is required');

    trimmed.company_name = data.company_name.trim();
    trimmed.phone_number = data.phone.trim();
    trimmed.industry = data.industry.trim();
    trimmed.company_size = data.company_size.trim();
    trimmed.description = data.description.trim();

    if (data.address?.trim()) trimmed.address = data.address.trim();
    if (data.city?.trim()) trimmed.city = data.city.trim();
    if (data.state?.trim()) trimmed.state = data.state.trim();
    if (data.country?.trim()) trimmed.country = data.country.trim();
    if (data.postal_code?.trim()) trimmed.postal_code = data.postal_code.trim();
    if (data.location?.trim()) trimmed.location = data.location.trim();
    if (data.website?.trim()) trimmed.company_website = data.website.trim();
    if (data.founded_year) {
      const year = parseInt(data.founded_year);
      if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
        trimmed.founded_year = year;
      }
    }
    return trimmed;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const cleanProfileData = validateProfileData(profileData);
      if (profileData.companyLogoFile) {
        const timestamp = Date.now();
        const emailPrefix = user.email.replace('@', '').replace('.', '_');
        const s3Url = `https://student-profile-docs.s3.ap-southeast-1.amazonaws.com/logos/${emailPrefix}_${timestamp}.jpg`;
        cleanProfileData.company_logo = s3Url; // Send the generated S3 URL to backend
      } else if (typeof profileData.company_logo === 'string' && profileData.company_logo) {
        if (!profileData.company_logo.startsWith('data:') && !profileData.company_logo.startsWith('blob:')) {
          cleanProfileData.company_logo = profileData.company_logo;
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
            location: updatedData.location ?? prev.location,
          }));
        }
      } else {
        const errorMessage = response?.error || response?.message || 'Failed to update profile';
        setError(errorMessage);
        setSuccess(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to update profile';
      setError(errorMessage);
      setSuccess(false);
    } finally {
      setLoading(false);
      // After a successful update, switch to view mode if completion is >= 50%
      if (profileCompletionPercent >= 50) {
        setIsEditMode(false);
      }
    }
  };

  const handleKycInputChange = (e) => {
    const { name, value } = e.target;
    setKycData(prev => ({ ...prev, [name]: value }));
  };

  const handleKycFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setKycData(prev => ({ ...prev, documentFile: file }));
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

    const isFirstKycSubmission = !kycStatus.documentUrl && (!kycStatus.status || kycStatus.status === '');

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
        setKycStatus(prev => ({
          status: updatedData?.kyc_status || prev.status || 'submitted',
          documentUrl: updatedData?.kycDocUrl || updatedData?.kyc_document_url || prev.documentUrl,
          updatedAt: updatedData?.kyc_updated_at || new Date().toISOString(),
          reviewerNote: updatedData?.kyc_notes || updatedData?.kyc_remark || prev.reviewerNote
        }));

        // Clear the uploaded file
        setKycData(prev => ({
          ...prev,
          documentFile: null
        }));

        // Show success message for all KYC submissions
        setKycSuccess(response.message || 'KYC details submitted successfully. We will notify you once verification is complete.');
      } else {
        setKycError(response?.error || 'Failed to submit KYC details.');
      }
    } catch (err) {
      console.error('KYC submission failed:', err);
      setKycError(err?.error || err?.message || 'Failed to submit KYC details.');
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
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  // Profile View Mode
  const renderProfileView = () => {
    // Show view mode only if NOT in edit mode AND profile fields are 50% complete (for a decent looking view)
    if (isEditMode || profileCompletion < 50) return null;
{console.log(isEditMode)}
{console.log(profileCompletion )}
    return (
      <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} overflow-hidden mb-6`}>
        {/* Profile Header with Company Logo */}
        <div className={`p-6 border-b ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                {profileData.company_logo ? (
                  <img
                    src={profileData.company_logo}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2271B5] flex items-center justify-center">
                    <Building size={24} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${textColor} mb-1`}>{profileData.company_name || 'Company Profile'}</h1>
                <p className={`text-sm ${textSecondary}`}>View your complete company information</p>
              </div>
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
        </div>

        <div className="space-y-6">
          {/* Company Logo Section (Larger Display) */}
          {profileData.company_logo && (
            <div className="px-6 pb-6">
              <h2 className={`text-lg font-semibold ${textColor} mb-3 flex items-center gap-2`}>
                <Building size={20} className="text-[#2271B5]" />
                Company Logo
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                <img
                  src={profileData.company_logo}
                  alt="Company Logo"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '180px',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    border: '2px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>
            </div>
          )}

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

          {/* Location */}
          <div className="mb-6">
            <h2 className={`text-lg font-semibold ${textColor} mb-3 flex items-center gap-2`}>
              <MapPin size={20} className="text-[#2271B5]" />
              Location
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="w-full">
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide`}>Location</label>
                <p className={`text-sm ${textColor} mt-1`}>{profileData.location || 'Not provided'}</p>
              </div>

              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-8 mb-6`}>
          <h2 className={`text-xl font-bold ${textColor} mb-4 flex items-center gap-2`}>
            <Briefcase size={20} className="text-blue-500" />
            About
          </h2>
          <p className={`${textColor} leading-relaxed whitespace-pre-wrap`}>
            {profileData.description || 'No description provided'}
          </p>
        </div>

        {/* Contact Information */}
        <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-8`}>
          <h2 className={`text-xl font-bold ${textColor} mb-6 flex items-center gap-2`}>
            <Mail size={20} className="text-blue-500" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide mb-1 block`}>Email</label>
              <div className={`flex items-center gap-2 ${textColor}`}>
                <Mail size={16} className="text-blue-500" />
                {profileData.email}
              </div>
            </div>
            <div>
              <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide mb-1 block`}>Phone</label>
              <div className={`flex items-center gap-2 ${textColor}`}>
                <Phone size={16} className="text-blue-500" />
                {profileData.phone}
              </div>
            </div>
            {profileData.address && (
              <div className="md:col-span-2">
                <label className={`text-xs font-medium ${textSecondary} uppercase tracking-wide mb-1 block`}>Address</label>
                <div className={`flex items-start gap-2 ${textColor}`}>
                  <MapPin size={16} className="text-blue-500 mt-1" />
                  <span>
                    {[profileData.address, profileData.city, profileData.state, profileData.country, profileData.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && isEditMode === null) {
     return (
      <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <h2 className={`mt-4 text-xl font-semibold ${textColor}`}>Loading Profile...</h2>
        </div>
      </div>
    );
  }

  // --- Main Render Logic ---
  return (
    <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8`}>
      <main className="max-w-7xl mx-auto">
        {/* Admin Approval/Rejection Messages */}
        {profileData && (
          <>
            {profileData.hasadminapproved === false && profileData.status === 'rejected' && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Application Rejected</h3>
                <p style={{ margin: 0 }}>
                  {profileData.rejection_reason || 'Your application not approve.'}
                </p>
              </div>
            )}

            {profileData.hasadminapproved === false && profileData.status !== 'rejected' && (
              <div style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #fde68a',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Application Under Review</h3>
                <p style={{ margin: 0 }}>
                  Your application is currently being reviewed by our admin team. We will notify you once a decision is made.
                </p>
              </div>
            )}

            {profileData.hasadminapproved === true && (
              <div style={{
                backgroundColor: '#d1fae5',
                color: '#065f46',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Application Approved</h3>
                <p style={{ margin: 0 }}>
                  Your application approve.
                </p>
              </div>
            )}
          </>
        )}

        {/* Render Profile View when complete and not editing */}
        {renderProfileView()}

        {(isEditMode || !isProfileComplete) && (
          <section className="space-y-6">
          <div className="mb-6">
            <div className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div
                className="h-full bg-[#2271B5] transition-all duration-300"
                style={{ width: `${profileCompletionPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {stepDefinitions.map((step, index) => {
                const previousStepsComplete = index === 0 || stepDefinitions.slice(0, index).every(prevStep => prevStep.complete);
                const isActive = step.complete || previousStepsComplete;
                return (
                  <div key={step.number} className={`flex items-center gap-3 p-3 rounded-lg border ${borderColor} ${isActive ? (isDark ? 'bg-gray-700/50' : 'bg-blue-50') : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step.complete ? 'bg-green-500 text-white' : isActive ? 'bg-[#2271B5] text-white' : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                      {step.complete ? <CheckCircle size={16} /> : step.number}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${textColor}`}>{step.label}</div>
                      <div className={`text-xs ${textSecondary}`}>{step.statusText}</div>
                    </div>
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
                    : `Complete ${100 - profileCompletion}% more to Compite profile .`}
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

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
              <h2 className={`text-lg font-semibold ${textColor} mb-4`}>Company Logo</h2>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>Company Logo</label>
                <div
                  className={`cursor-pointer w-32 h-32 border-2 border-dashed ${borderColor} rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'} mb-2`}
                  onClick={() => logoInputRef.current?.click()}
                  title="Click to upload company logo"
                >
                  {profileData.company_logo ? (
                    <img
                      src={profileData.company_logo}
                      alt="Company Logo"
                      className="max-w-full max-h-full rounded object-contain"
                    />
                  ) : (
                    <div className={`text-center ${textSecondary}`}>
                      <Building size={32} className="mb-2 mx-auto" />
                      <div className="text-sm">Click to upload logo</div>
                    </div>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <small className={`text-xs ${textSecondary}`}>Click on the area above to upload. Accepted formats: JPEG, PNG, GIF (Max 2MB)</small>
              </div>
            </div>

            <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
              <h2 className={`text-lg font-semibold ${textColor} mb-4`}>Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    value={profileData.company_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className={`w-full px-3 py-2 border ${borderColor} rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Industry *</label>
                  <input
                    type="text"
                    name="industry"
                    value={profileData.industry}
                    onChange={handleInputChange}
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className={`w-full px-3 py-2 border ${borderColor} rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Company Size *</label>
                  <select
                    name="company_size"
                    value={profileData.company_size}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${borderColor} rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
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
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Company Description *</label>
                  <textarea
                    name="description"
                    value={profileData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your company, its mission, values, and what makes it unique..."
                    rows="4"
                    className={`w-full px-3 py-2 border ${borderColor} rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-[#2271B5] focus:border-transparent resize-vertical`}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
              <h2 className={`text-lg font-semibold ${textColor} mb-4`}>Location Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    placeholder="Full location (e.g., Mumbai, Maharashtra, India)"
                    className={`w-full px-3 py-2 border ${borderColor} rounded-md ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:ring-2 focus:ring-[#2271B5] focus:border-transparent`}
                  />
                </div>
              </div>

              <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${
                    profileCompletion === 100 ? 'bg-green-500' : profileCompletion >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
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

                </div>
              ) : null}

              {missingFields.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className={`text-sm font-medium ${textColor} mb-1`}>Complete these required fields:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{missingFields.join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className={`text-sm ${error === 'Company description is required' ? 'text-black dark:text-white' : 'text-red-800 dark:text-red-200'}`}>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 dark:text-green-200">Profile updated successfully!</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-2.5 bg-[#2271B5] text-white font-medium rounded-md hover:bg-[#1a5a8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>

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
              </div>

              <div className="p-6">
                {profileCompletionPercent < 100 ? (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-4">
                    <Lock size={24} className="text-blue-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className={`font-medium ${textColor} mb-1`}>Complete Your Profile First</p>
                      <p className={`text-sm ${textSecondary}`}>
                        Achieve 100% profile completion before submitting KYC documents. Once done, return here to verify your organization.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {kycError && (
                      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                        <XCircle size={20} className="text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{kycError}</p>
                      </div>
                    )}

                    {kycSuccess && (
                      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-600 dark:text-green-400">{kycSuccess}</p>
                      </div>
                    )}

                    <form onSubmit={handleKycSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-medium ${textColor} mb-2`}>Document Type</label>
                          <select
                            name="documentType"
                            value={kycData.documentType}
                            onChange={handleKycInputChange}
                            className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          >
                            <option value="GST">GST Certificate</option>
                            <option value="PAN">PAN Card</option>
                            <option value="MSME">MSME Registration</option>
                            <option value="INCORPORATION">Certificate of Incorporation</option>
                            <option value="OTHER">Other Government Document</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${textColor} mb-2`}>
                            Document Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="documentNumber"
                            value={kycData.documentNumber}
                            onChange={handleKycInputChange}
                            required
                            className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                            placeholder="Enter document number"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={`block text-sm font-medium ${textColor} mb-2`}>
                            Upload Document <span className="text-red-500">*</span>
                          </label>
                          <div className={`border-2 border-dashed ${borderColor} rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer`}>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleKycFileChange}
                              required={!kycStatus.documentUrl}
                              className="hidden"
                              id="kyc-file-input"
                            />
                            <label htmlFor="kyc-file-input" className="cursor-pointer">
                              {kycData.documentFile ? (
                                <div className="flex items-center justify-center gap-3">
                                  <FileText size={24} className="text-blue-500" />
                                  <span className={textColor}>{kycData.documentFile.name}</span>
                                </div>
                              ) : (
                                <>
                                  <Upload size={32} className={`${textSecondary} mx-auto mb-2`} />
                                  <p className={`${textColor} font-medium mb-1`}>Click to upload or drag and drop</p>
                                  <p className={`text-xs ${textSecondary}`}>PDF, JPG, or PNG (max 10MB)</p>
                                </>
                              )}
                            </label>
                          </div>
                          {kycStatus.documentUrl && (
                            <a
                              href={kycStatus.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
                            >
                              <FileText size={16} />
                              View previously uploaded document
                            </a>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className={`block text-sm font-medium ${textColor} mb-2`}>Additional Notes (Optional)</label>
                          <textarea
                            name="additionalNotes"
                            value={kycData.additionalNotes}
                            onChange={handleKycInputChange}
                            rows="3"
                            className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                            placeholder="Add any clarifications for the verification team..."
                          />
                        </div>

                        {kycStatus.reviewerNote && (
                          <div className="md:col-span-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                            <p className={`text-sm font-medium ${textColor} mb-1`}>Reviewer Note:</p>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">{kycStatus.reviewerNote}</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={kycLoading}
                        className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {kycLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Shield size={20} />
                            Submit for Verification
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Success Modal (Unchanged) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowSuccessModal(false)}>
          <div className={`${cardBg} rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all`} onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className={`text-2xl font-bold ${textColor} mb-2`}>Success!</h2>
              <p className={`${textSecondary} mb-6`}>Your company profile has been updated successfully.</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KYC Review Modal (Unchanged) */}
      {showKycReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">KYC Document Submitted</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your KYC document is under review. After approval, you can post jobs and access all hiring features.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Logging out automatically in a few seconds...
            </p>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ animation: 'shrink 3s linear forwards', width: '100%' }} />
            </div>
            <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
