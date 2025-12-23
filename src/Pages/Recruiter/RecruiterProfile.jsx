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
              company_logo: data.company_logo || data.logo || ''
            };
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
            setIsEditMode(initialCompletion <= 50);
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
        const s3Url = `https://student-profile-docs.s3.ap-southeast-1.amazonaws.com/documents/${emailPrefix}_${timestamp}.jpg`;
        cleanProfileData.company_logo = s3Url;
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
        setKycData(prev => ({ ...prev, documentFile: null }));
        
        if (isFirstKycSubmission) {
          setShowKycReviewModal(true);
        } else {
          setKycSuccess(response.message || 'KYC details submitted successfully.');
        }
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
      <div className="max-w-5xl mx-auto">
        {/* Profile Header Card */}
        <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} overflow-hidden mb-6`}>
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className={`w-32 h-32 rounded-2xl ${cardBg} border-4 ${borderColor} overflow-hidden shadow-xl`}>
                {profileData.company_logo ? (
                  <img src={profileData.company_logo} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600">
                    <Building size={48} className="text-blue-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-8 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={`text-3xl font-bold ${textColor}`}>{profileData.company_name}</h1>
                  {isKycVerified && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                      <CheckCircle size={14} />
                      Verified
                    </div>
                  )}
                </div>
                <p className={`text-lg ${textSecondary} mb-3`}>{profileData.industry}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {profileData.location && (
                    <div className={`flex items-center gap-1.5 ${textSecondary}`}>
                      <MapPin size={16} />
                      {profileData.location}
                    </div>
                  )}
                  {profileData.company_size && (
                    <div className={`flex items-center gap-1.5 ${textSecondary}`}>
                      <Users size={16} />
                      {profileData.company_size} employees
                    </div>
                  )}
                  {profileData.founded_year && (
                    <div className={`flex items-center gap-1.5 ${textSecondary}`}>
                      <Calendar size={16} />
                      Founded {profileData.founded_year}
                    </div>
                  )}
                  {profileData.website && (
                    <a 
                      href={profileData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600"
                    >
                      <Globe size={16} />
                      Visit Website
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
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
    <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8`}>
      <div className="max-w-7xl mx-auto py-8">
        
        {/* Admin Status Messages (Unchanged) */}
        {user?.hasadminapproved === false && user?.status === 'rejected' && (
          <div className={`${cardBg} border-l-4 border-red-500 rounded-lg p-6 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <XCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>Application Rejected</h3>
                <p className={`${textSecondary} text-sm mb-3`}>
                  Unfortunately, your application has been rejected by our admin team.
                </p>
                {user.rejection_reason && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-3">
                    <strong className="block mb-1 text-red-700 dark:text-red-300">Reason:</strong>
                    <p className="text-sm text-red-600 dark:text-red-400">{user.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {user?.hasadminapproved === false && user?.status !== 'rejected' && (
          <div className={`${cardBg} border-l-4 border-yellow-500 rounded-lg p-6 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <AlertCircle className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>Application Under Review</h3>
                <p className={`${textSecondary} text-sm`}>
                  Your application is being reviewed by our admin team. We'll notify you once a decision is made.
                </p>
              </div>
            </div>
          </div>
        )}

        {user?.hasadminapproved === true && (
          <div className={`${cardBg} border-l-4 border-green-500 rounded-lg p-6 mb-6 shadow-lg`}>
            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>Application Approved</h3>
                <p className={`${textSecondary} text-sm`}>
                  Congratulations! You can now post jobs and access all hiring features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Render Profile View or Edit Form based on isEditMode state */}
        {renderProfileView()}

        {/* Edit Mode / Form */}
        {isEditMode && (
          <div className="max-w-5xl mx-auto">
            {/* Progress Card */}
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6 mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${textColor} mb-1`}>Profile Completion</h3>
                  <p className={`text-sm ${textSecondary}`}>Complete your profile to unlock all features</p>
                </div>
                <div className={`text-3xl font-bold ${
                  profileCompletion === 100 ? 'text-green-500' : profileCompletion >= 70 ? 'text-yellow-500' : 'text-blue-500'
                }`}>
                  {profileCompletion}%
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

              <div className="grid grid-cols-2 gap-4">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  profileCompletionPercent === 100 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    profileCompletionPercent === 100 ? 'bg-green-500' : 'bg-blue-500'
                  } text-white`}>
                    {profileCompletionPercent === 100 ? <Check size={20} /> : <Building size={20} />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${textColor}`}>Company Profile</p>
                    <p className={`text-xs ${textSecondary}`}>{profileCompletionPercent}%</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  isKycVerified ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isKycVerified ? 'bg-green-500' : isKycSubmitted ? 'bg-yellow-500' : 'bg-gray-400'
                  } text-white`}>
                    {isKycVerified ? <Check size={20} /> : <Shield size={20} />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${textColor}`}>KYC Verification</p>
                    <p className={`text-xs ${textSecondary}`}>
                      {isKycVerified ? 'Verified' : isKycSubmitted ? 'In Review' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

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

            {/* Company Information Form */}
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} overflow-hidden mb-6`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Building size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${textColor}`}>Company Information</h2>
                    <p className={`text-sm ${textSecondary}`}>Update your company details</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="p-6">
                {/* Logo Upload Section */}
                <div className="mb-8">
                  <label className={`block text-sm font-medium ${textColor} mb-3`}>Company Logo</label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                        {profileData.company_logo ? (
                          <img src={profileData.company_logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building size={32} className={textSecondary} />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                      >
                        <Camera size={18} />
                      </button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className={`text-sm ${textColor} font-medium mb-1`}>Upload Company Logo</p>
                      <p className={`text-xs ${textSecondary} mb-2`}>JPEG, PNG, or GIF (Max 2MB)</p>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                      >
                        {profileData.company_logo ? 'Change Logo' : 'Upload Logo'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-2`}>
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={profileData.company_name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-2`}>
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                             <div>
                    <label className={`block text-sm font-medium ${textColor} mb-2`}>
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="industry"
                      value={profileData.industry}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    >
                      <option value="">Select Industry</option>
                      <option value="Taxi / Cab / Car Rental Services">Taxi / Cab / Car Rental Services</option>
                      <option value="Tobacco / Cigarettes / Biris">Tobacco / Cigarettes / Biris</option>
                      <option value="Engineering / Cement / Metals">Engineering / Cement / Metals</option>
                      <option value="Furniture and Furnishing">Furniture and Furnishing</option>
                      <option value="Wires & Cables">Wires & Cables</option>
                      <option value="Water Treatment / Waste Management">Water Treatment / Waste Management</option>
                      <option value="Housekeeping / Facilities management Services">Housekeeping / Facilities management Services</option>
                      <option value="Leather / Leather Goods">Leather / Leather Goods</option>
                      <option value="Paper & Pulp">Paper & Pulp</option>
                      <option value="Railways / Metro Rail">Railways / Metro Rail</option>
                      <option value="Electricals / Switchgears">Electricals / Switchgears</option>
                      <option value="Semiconductors / Electronics">Semiconductors / Electronics</option>
                      <option value="Agro Chemical / Fertilizers / Pesticides">Agro Chemical / Fertilizers / Pesticides</option>
                      <option value="Breweries / Distilleries / Liquor">Breweries / Distilleries / Liquor</option>
                      <option value="Office Equipment / Automation">Office Equipment / Automation</option>
                      <option value="Media / Entertainment / Broadcasting">Media / Entertainment / Broadcasting</option>
                      <option value="Accounting / Finance">Accounting / Finance</option>
                      <option value="Wellness / Fitness / Sports / Beauty">Wellness / Fitness / Sports / Beauty</option>
                      <option value="Sugar">Sugar</option>
                      <option value="Tyre">Tyre</option>
                      <option value="Real Estate / Property / Construction">Real Estate / Property / Construction</option>
                      <option value="Security Forces / Defence Forces / Investigation">Security Forces / Defence Forces / Investigation</option>
                      <option value="Textile / Garments / Fashion / Accessories">Textile / Garments / Fashion / Accessories</option>
                      <option value="Travel / Tourism">Travel / Tourism</option>
                      <option value="IT-Hardware & Networking / IT-Software / Software Services">IT-Hardware & Networking / IT-Software / Software Services</option>
                      <option value="Custom">Custom (Other)</option>
                    </select>
                    
                    {profileData.industry === 'Custom' && (
                      <input
                        type="text"
                        name="customIndustry"
                        value={profileData.customIndustry}
                        onChange={handleInputChange}
                        required
                        className={`mt-3 w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="Enter your industry"
                      />
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-2`}>
                      Company Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="company_size"
                      value={profileData.company_size}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
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
                    <label className={`block text-sm font-medium ${textColor} mb-2`}>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textColor} mb-2`}>Founded Year</label>
                    <input
                      type="number"
                      name="founded_year"
                      value={profileData.founded_year}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="2020"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="mb-6">
                  <h3 className={`text-base font-semibold ${textColor} mb-4 flex items-center gap-2`}>
                    <MapPin size={18} className="text-blue-500" />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textColor} mb-2`}>Street Address</label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-2`}>City</label>
                      <input
                        type="text"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="San Francisco"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-2`}>State</label>
                      <input
                        type="text"
                        name="state"
                        value={profileData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="California"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-2`}>Country</label>
                      <input
                        type="text"
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="United States"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textColor} mb-2`}>Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={profileData.postal_code}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="94102"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${textColor} mb-2`}>Combined Location</label>
                      <input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        placeholder="San Francisco, CA, USA"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium ${textColor} mb-2`}>
                    Company Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={profileData.description}
                    onChange={handleInputChange}
                    rows="6"
                    required
                    className={`w-full px-4 py-3 border ${inputBorder} rounded-xl ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    placeholder="Tell us about your company, mission, and values..."
                  />
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                    <XCircle size={20} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {success && !showSuccessModal && (
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 justify-end">
                  {profileCompletionPercent >= 50 && (
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className={`px-6 py-3 border ${borderColor} ${textColor} rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check size={20} />
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* KYC Verification Card */}
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} overflow-hidden`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isKycVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <Shield size={24} className={isKycVerified ? 'text-green-500' : 'text-blue-500'} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${textColor}`}>KYC Verification</h2>
                      <p className={`text-sm ${textSecondary}`}>Verify your organization to unlock features</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    isKycVerified
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : isKycSubmitted
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {formatKycStatusLabel(kycStatus.status)}
                  </span>
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
          </div>
        )}
      </div>

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