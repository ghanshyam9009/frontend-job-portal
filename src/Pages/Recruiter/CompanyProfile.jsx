import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { recruiterService } from '../../services/recruiterService';
import { calculateRecruiterProfileCompletion, getMissingRequiredFields } from '../../utils/recruiterProfileUtils';
import { 
  TrendingUp, CheckCircle, AlertCircle, Shield, Edit, MapPin, Briefcase, 
  Globe, Calendar, FileText, Building, Phone, Mail, Users, XCircle,
  Camera, Upload, Check, ChevronRight, ArrowRight, Lock, ExternalLink
} from 'lucide-react';

const CompanyProfile = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [profileData, setProfileData] = useState({
    company_name: '', email: '', phone: '', website: '',
    address: '', city: '', state: '', country: '',
    postal_code: '', industry: '', company_size: '',
    description: '', founded_year: '', location: '',
    company_logo: '', customIndustry: '', companyLogoFile: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [kycStatus, setKycStatus] = useState({ 
    status: '', documentUrl: '', updatedAt: '', reviewerNote: '' 
  });
  const [kycData, setKycData] = useState({ 
    documentType: 'GST', documentNumber: '', documentFile: null, additionalNotes: '' 
  });
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState(null);
  const [kycSuccess, setKycSuccess] = useState('');
  const [isEditingKyc, setIsEditingKyc] = useState(false);
  const [showKycReviewModal, setShowKycReviewModal] = useState(false);
  const [expandedStep, setExpandedStep] = useState(1);
  const logoInputRef = useRef(null);

  // --- COMPUTED VALUES ---
  const normalizedKycStatus = (kycStatus.status || '').toLowerCase();

  const isKycVerified = ['verified', 'approved', 'completed', 'success', 'accepted'].includes(normalizedKycStatus);
  const isKycSubmitted = ['submitted', 'in_review', 'under_review', 'pending_verification'].includes(normalizedKycStatus);
  /** Step 3 green check: show when KYC is submitted (or has document) or fully verified */
  const isBusinessVerificationComplete = isKycVerified || isKycSubmitted || !!(kycStatus.documentUrl && kycStatus.status);
  const isAdminApproved = user?.hasadminapproved === true;

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

  const formatKycStatusLabel = (status = '') => {
    if (!status) return 'Pending';
    return status
      .split(/[\s_-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // --- API INTEGRATION ---
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
              company_logo: data.logo || data.company_logo || '',
              customIndustry: ''
            };
            setProfileData(fetchedProfileData);
            setKycStatus({
              status: data.kyc_status || '',
              documentUrl: data.kycDocUrl || data.kyc_document_url || '',
              updatedAt: data.kyc_updated_at || data.updatedAt || '',
              reviewerNote: data.kyc_notes || data.kyc_remark || ''
            });
            setKycData(prev => ({
              ...prev,
              documentType: data.kyc_document_type || prev.documentType,
              documentNumber: data.kyc_document_number || ''
            }));
            
            // Auto-expand logic for step-by-step flow
            const initialCompletion = calculateRecruiterProfileCompletion(fetchedProfileData);
            if (initialCompletion < 100) setExpandedStep(1);
            else if (!fetchedProfileData.company_logo) setExpandedStep(2);
            else setExpandedStep(3);
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

  // Auto-logout after KYC submission
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

  // --- EVENT HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setError(error);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    try {
      // Upload the logo file immediately using the dedicated API
      const uploadResponse = await recruiterService.uploadLogoFile(user.email, file);

      if (uploadResponse.success) {
        // Debug the response structure
        console.log('Full upload response:', uploadResponse);
        console.log('Upload response data:', uploadResponse.data);
        console.log('Data type:', typeof uploadResponse.data);

        // Extract logo URL from response
        let uploadedLogoUrl;

        // Handle different response structures
        if (uploadResponse.logo) {
          uploadedLogoUrl = uploadResponse.logo;
          console.log('Found logo in uploadResponse.logo');
        } else if (uploadResponse.data?.logo) {
          uploadedLogoUrl = uploadResponse.data.logo;
          console.log('Found logo in uploadResponse.data.logo');
        } else if (uploadResponse.data?.logoUrl) {
          uploadedLogoUrl = uploadResponse.data.logoUrl;
          console.log('Found logo in uploadResponse.data.logoUrl');
        } else if (uploadResponse.data?.data?.logo) {
          uploadedLogoUrl = uploadResponse.data.data.logo;
          console.log('Found logo in uploadResponse.data.data.logo');
        } else if (uploadResponse.data?.data?.logoUrl) {
          uploadedLogoUrl = uploadResponse.data.data.logoUrl;
          console.log('Found logo in uploadResponse.data.data.logoUrl');
        } else if (typeof uploadResponse.data === 'string' && uploadResponse.data.startsWith('http')) {
          uploadedLogoUrl = uploadResponse.data;
          console.log('Found logo as direct string in data');
        }

        console.log('Final extracted logo URL:', uploadedLogoUrl);

        // Update logo URL in profileData
        if (uploadedLogoUrl) {
          setProfileData(prev => ({
            ...prev,
            company_logo: uploadedLogoUrl,
            companyLogoFile: null
          }));
          setSuccess('Company logo uploaded successfully');

          // Also update the user context to persist the logo
          updateUser({ company_logo: uploadedLogoUrl });

          setTimeout(() => setSuccess(false), 3000);
          setExpandedStep(2);
        } else {
          console.error('No logo URL found! Data content:', uploadResponse.data);
          setError('Logo uploaded but URL not found in response. Please refresh the page.');
        }
        setSuccess('Company logo uploaded successfully');
        setTimeout(() => setSuccess(false), 3000);
        setExpandedStep(2);
      } else {
        setError(uploadResponse.error?.message || 'Failed to upload company logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setError('Failed to upload company logo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const cleanData = validateProfileData(profileData);
      
      // Handle logo upload
      if (profileData.companyLogoFile) {
        const timestamp = Date.now();
        const emailPrefix = user.email.replace('@', '').replace('.', '_');
        const s3Url = `https://student-profile-docs.s3.ap-southeast-1.amazonaws.com/documents/${emailPrefix}_${timestamp}.jpg`;
        cleanData.company_logo = s3Url;
      } else if (typeof profileData.company_logo === 'string' && profileData.company_logo) {
        if (!profileData.company_logo.startsWith('data:') && !profileData.company_logo.startsWith('blob:')) {
          cleanData.company_logo = profileData.company_logo;
        }
      }

      const response = await recruiterService.updateProfile(user?.email, cleanData);
      
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
        
        setExpandedStep(2);
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

  // --- VALIDATION FUNCTIONS ---
  const validateImageFile = (file) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowed.includes(file.type)) return 'Invalid format - Please upload JPEG, PNG or GIF';
    if (file.size > 2 * 1024 * 1024) return 'File too large (Max 2MB)';
    return '';
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
    trimmed.industry = data.industry === 'Custom' ? data.customIndustry : data.industry.trim();
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

  // --- THEME VARIABLES ---
  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  // --- LOADING STATE ---
  if (loading && !profileData.company_name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className={`text-xl font-semibold ${textColor}`}>Loading Profile...</h2>
        </div>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-24 px-4 pb-12`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Admin Status Messages */}
        {user?.hasadminapproved === false && user?.status === 'rejected' && (
          <div className={`${cardBg} border-l-4 border-red-500 rounded-xl p-6 mb-6 shadow-xl`}>
            <div className="flex items-start gap-4">
              <XCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>Application Rejected</h3>
                <p className={`${textSecondary} text-sm mb-3`}>
                  Unfortunately, your application has been rejected by our admin team.
                </p>
                {user.rejection_reason && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <strong className="block mb-1 text-red-700 dark:text-red-300 text-sm">Reason:</strong>
                    <p className="text-sm text-red-600 dark:text-red-400">{user.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {user?.hasadminapproved === false && user?.status !== 'rejected' && (
          <div className={`${cardBg} border-l-4 border-amber-500 rounded-xl p-6 mb-6 shadow-xl`}>
            <div className="flex items-start gap-4">
              <AlertCircle className="text-amber-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>Application Under Review</h3>
                <p className={`${textSecondary} text-sm`}>
                  Your application is being reviewed by our admin team. We'll notify you once approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {user?.hasadminapproved === true && (
          <div className={`${cardBg} border-l-4 border-green-500 rounded-xl p-6 mb-6 shadow-xl`}>
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

        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-extrabold ${textColor}`}>Company Profile</h1>
            <p className={textSecondary}>Complete your identity to start hiring top talent</p>
          </div>
          <div className={`px-4 py-2 rounded-xl border ${borderColor} ${cardBg} flex items-center gap-3 shadow-sm`}>
            <Shield className={isKycVerified ? "text-green-500" : "text-amber-500"} size={20} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Trust Score</p>
              <p className={`text-sm font-bold ${isAdminApproved ? "text-green-600" : isKycVerified ? "text-green-600" : "text-amber-600"}`}>
                {isAdminApproved ? "Verification Complete" : isKycVerified ? "Verified Employer" : isKycSubmitted ? "Verification Pending" : "Unverified"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Summary & Progress */}
          <div className="lg:col-span-1 space-y-6">
            <div className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} overflow-hidden sticky top-24`}>
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className={`w-28 h-28 rounded-2xl ${cardBg} border-4 ${borderColor} shadow-lg overflow-hidden flex items-center justify-center`}>
                    {profileData.company_logo ? (
                      <img src={profileData.company_logo} className="w-full h-full object-contain" alt="logo" />
                    ) : <Building className="text-gray-300" size={40} />}
                  </div>
                </div>
              </div>
              <div className="pt-12 pb-6 px-6">
                {/* Company Name and Industry */}
                <div className="text-center mb-6">
                  <h2 className={`text-xl font-bold ${textColor}`}>{profileData.company_name || "Organization Name"}</h2>
                  <p className="text-sm text-blue-500 font-medium">{profileData.industry || "Industry"}</p>
                  {profileData.company_size && (
                    <p className={`text-xs ${textSecondary} mt-1`}>{profileData.company_size} employees</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-6">
                  {profileData.email && (
                    <div className="flex items-start gap-2">
                      <Mail size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <a href={`mailto:${profileData.email}`} className={`text-xs ${textColor} hover:text-blue-500 transition-colors break-all`}>
                        {profileData.email}
                      </a>
                    </div>
                  )}

                  {profileData.phone && (
                    <div className="flex items-start gap-2">
                      <Phone size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <a href={`tel:${profileData.phone}`} className={`text-xs ${textColor} hover:text-blue-500 transition-colors`}>
                        {profileData.phone}
                      </a>
                    </div>
                  )}

                  {profileData.website && (
                    <div className="flex items-start gap-2">
                      <Globe size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <a 
                        href={profileData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`text-xs ${textColor} hover:text-blue-500 transition-colors break-all flex items-center gap-1`}
                      >
                        {profileData.website.replace(/^https?:\/\//, '')}
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  )}

                  {(profileData.address || profileData.city || profileData.state || profileData.country) && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className={`text-xs ${textColor}`}>
                        {[profileData.address, profileData.city, profileData.state, profileData.country, profileData.postal_code]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {profileData.founded_year && (
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className={`text-xs ${textColor}`}>Founded {profileData.founded_year}</p>
                    </div>
                  )}
                </div>

                {/* Profile Strength */}
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className={textSecondary}>PROFILE STRENGTH</span>
                    <span className="text-blue-500">{profileCompletionPercent}%</span>
                  </div>
                  <div className={`w-full h-2 bg-gray-200 ${inputBg} rounded-full overflow-hidden`}>
                    <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${profileCompletionPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 ">
              <div className="flex gap-3">
                <AlertCircle className="text-blue-500 shrink-0" size={18} />
                <p className="text-xs text-blue-800  leading-relaxed">
                  Companies with 100% profile completion and KYC verification receive 3x more candidate responses.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Multi-Step Form */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Step 1: Core Details */}
            <div className={`${cardBg} rounded-2xl shadow-lg border ${expandedStep === 1 ? 'border-blue-500 ring-4 ring-blue-500/10' : borderColor} transition-all`}>
              <button onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)} className="w-full p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${profileCompletionPercent === 100 ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    {profileCompletionPercent === 100 ? <Check size={20} /> : '1'}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${textColor}`}>Company Information</h3>
                    <p className={`text-xs ${textSecondary}`}>Core details and location</p>
                  </div>
                </div>
                <ChevronRight className={`transition-transform ${expandedStep === 1 ? 'rotate-90' : ''}`} />
              </button>
              
              {expandedStep === 1 && (
                <div className="p-6 pt-0 border-t border-gray-50 dark:border-gray-700">
                  <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                    
                    {/* Error/Success Messages */}
                    {error && (
                      <div className="md:col-span-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                        <XCircle size={20} className="text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    {success && !showSuccessModal && (
                      <div className="md:col-span-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Company Name *</label>
                      <input name="company_name" value={profileData.company_name} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} required />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Email *</label>
                      <input name="email" type="email" value={profileData.email} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} required />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Phone *</label>
                      <input name="phone" type="tel" value={profileData.phone} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} required />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Industry *</label>
                      <select name="industry" value={profileData.industry} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} required>
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
                    </div>

                    {profileData.industry === 'Custom' && (
                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Specify Industry *</label>
                        <input name="customIndustry" value={profileData.customIndustry} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} required />
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Company Size *</label>
                      <select name="company_size" value={profileData.company_size} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} required>
                        <option value="">Select Size</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Website</label>
                      <input name="website" type="url" value={profileData.website} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Founded Year</label>
                      <input name="founded_year" type="number" value={profileData.founded_year} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} min="1900" max={new Date().getFullYear()} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Address</label>
                      <input name="address" value={profileData.address} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">City</label>
                      <input name="city" value={profileData.city} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">State</label>
                      <input name="state" value={profileData.state} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Country</label>
                      <input name="country" value={profileData.country} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Postal Code</label>
                      <input name="postal_code" value={profileData.postal_code} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Location</label>
                      <input name="location" value={profileData.location} onChange={handleInputChange} className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} placeholder="e.g., San Francisco, CA" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Description *</label>
                      <textarea name="description" value={profileData.description} onChange={handleInputChange} rows="4" className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} required />
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Save & Continue <ArrowRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Step 2: Branding */}
            <div className={`${cardBg} rounded-2xl shadow-lg border ${expandedStep === 2 ? 'border-blue-500 ring-4 ring-blue-500/10' : borderColor} transition-all`}>
              <button onClick={() => setExpandedStep(expandedStep === 2 ? 0 : 2)} className="w-full p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${profileData.company_logo ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {profileData.company_logo ? <Check size={20} /> : '2'}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${textColor}`}>Company Branding</h3>
                    <p className={`text-xs ${textSecondary}`}>Logo and brand identity</p>
                  </div>
                </div>
                <ChevronRight className={`transition-transform ${expandedStep === 2 ? 'rotate-90' : ''}`} />
              </button>
              {expandedStep === 2 && (
                <div className="p-8 border-t border-gray-50 dark:border-gray-700 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-36 h-36 rounded-3xl border-4 border-dashed border-gray-200 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                      {profileData.company_logo ? <img src={profileData.company_logo} className="w-full h-full object-contain" alt="preview" /> : <Upload className="text-gray-300" size={40} />}
                    </div>
                    <button onClick={() => logoInputRef.current.click()} className="absolute -bottom-3 -right-3 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
                      <Camera size={22} />
                    </button>
                  </div>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                  <p className="mt-4 text-sm text-gray-500 font-medium">Click camera icon to upload logo (Max 2MB)</p>
                </div>
              )}
            </div>

            {/* Step 3: KYC */}
            <div className={`${cardBg} rounded-2xl shadow-lg border ${expandedStep === 3 ? 'border-blue-500 ring-4 ring-blue-500/10' : borderColor} transition-all`}>
              <button onClick={() => setExpandedStep(expandedStep === 3 ? 0 : 3)} className="w-full p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isBusinessVerificationComplete ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {isBusinessVerificationComplete ? <Check size={20} /> : '3'}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${textColor}`}>Business Verification</h3>
                    <p className={`text-xs ${textSecondary}`}>Identity and compliance</p>
                  </div>
                </div>
                <ChevronRight className={`transition-transform ${expandedStep === 3 ? 'rotate-90' : ''}`} />
              </button>
              {expandedStep === 3 && (
                <div className="p-6 pt-0 border-t border-gray-50 dark:border-gray-700">
                  {profileCompletionPercent < 100 ? (
                    <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-4">
                      <Lock size={24} className="text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className={`font-bold ${textColor} mb-1`}>Complete Your Profile First</p>
                        <p className={`text-sm ${textSecondary}`}>
                          Achieve 100% profile completion before submitting KYC documents.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 mt-6">
                      {/* Display uploaded KYC documents if they exist */}
                      {kycStatus.documentUrl && (
                        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-4">
                            <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={24} />
                            <div className="flex-1">
                              <h4 className={`text-lg font-bold ${textColor} mb-2`}>KYC Documents Submitted</h4>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-green-800 dark:text-green-400 mb-2">
                                    <strong>Document Type:</strong> {kycData.documentType || 'GST Certificate'}
                                  </p>
                                  <p className="text-sm text-green-800 dark:text-green-400 mb-3">
                                    <strong>Document Number:</strong> {kycData.documentNumber || 'Not available'}
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <a
                                      href={kycStatus.documentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      <FileText size={16} />
                                      View Document
                                    </a>
                                    <span className={`text-xs ${textSecondary}`}>
                                      Status: {formatKycStatusLabel(kycStatus.status)}
                                    </span>
                                  </div>
                                </div>
                                {kycStatus.updatedAt && (
                                  <p className={`text-xs ${textSecondary}`}>
                                    Last updated: {new Date(kycStatus.updatedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleKycSubmit} className="space-y-6">
                        {/* Show full KYC form only when editing or when KYC is not yet verified/submitted */}
                        {(!isKycVerified && !isKycSubmitted) || isEditingKyc ? (
                          <>
                            {kycError && (
                              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                                <XCircle size={20} className="text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">{kycError}</p>
                              </div>
                            )}

                            {kycSuccess && (
                              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                <p className="text-sm text-green-600 dark:text-green-400">{kycSuccess}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5"> 
                              <div> 
                                <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Document Type *</label> 
                                <select 
                                  name="documentType" 
                                  value={kycData.documentType} 
                                  onChange={handleKycInputChange} 
                                  className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`}
                                  required
                                > 
                                  <option value="">Select Document Type</option>
                                  <option value="GST">Company GST Certificate</option> 
                                  <option value="PAN">Company PAN Card</option> 
                                  <option value="FSSAI">FSSAI License</option>
                                  <option value="INCORPORATION">Company Incorporation Certificate</option> 
                                  <option value="SHOP_ESTABLISHMENT">Shop & Establishment Certificate</option>
                                  <option value="MSME">MSME Registration Certificate</option> 
                                  <option value="ID_CARD">ID Card</option>
                                  <option value="OFFER_LETTER">Offer Letter</option>
                                  <option value="Aadhar_Card">Aadhar Card</option>
                                  <option value="CUSTOM">Custom Document</option>
                                </select> 
                              </div>
                              
                              <div>
                                <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Document Number *</label>
                                <input
                                  type="text"
                                  name="documentNumber"
                                  value={kycData.documentNumber}
                                  onChange={handleKycInputChange}
                                  placeholder="Enter document number"
                                  className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`}
                                  required
                                />
                              </div>
                              
                              {kycData.documentType === "CUSTOM" && (
                                <div className="md:col-span-2">
                                  <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Custom Document Name</label>
                                  <input
                                    type="text"
                                    name="customDocumentName"
                                    value={kycData.customDocumentName || ''}
                                    onChange={handleKycInputChange}
                                    placeholder="Enter document name"
                                    className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center bg-gray-50 dark:bg-gray-900/30">
                              <Upload className="mx-auto text-gray-300 mb-4" size={48} />
                              <input type="file" className="hidden" id="kyc" onChange={handleKycFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                              <label htmlFor="kyc" className="text-blue-500 font-bold cursor-pointer hover:underline">Click to upload document (PDF/JPG)</label>
                              {kycData.documentFile && <p className="mt-3 text-sm text-green-500 font-bold flex items-center justify-center gap-2"><Check size={16}/> {kycData.documentFile.name}</p>}
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Additional Notes (Optional)</label>
                              <textarea name="additionalNotes" value={kycData.additionalNotes} onChange={handleKycInputChange} rows="3" className={`w-full p-3 rounded-xl border ${borderColor} ${inputBg} ${textColor}`} placeholder="Any additional information..." />
                            </div>

                            {kycStatus.reviewerNote && (
                              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <p className={`text-sm font-medium ${textColor} mb-1`}>Reviewer Note:</p>
                                <p className="text-sm text-amber-800 dark:text-amber-200">{kycStatus.reviewerNote}</p>
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={kycLoading}
                              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
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
                          </>
                        ) : (
                          <div className="space-y-4">
                            <button
                              type="button"
                              disabled
                              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 opacity-90 cursor-default"
                            >
                              <CheckCircle size={20} />
                              KYC Completed
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingKyc(true)}
                              className="w-full bg-blue-50 text-blue-700 py-3 rounded-2xl font-semibold hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-2"
                            >
                              Edit KYC
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className={`${cardBg} p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl`}>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h2 className={`text-2xl font-bold ${textColor}`}>Profile Saved!</h2>
            <p className="text-gray-500 mt-2 mb-8 text-sm">Your details have been updated. Please continue to branding.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Continue</button>
          </div>
        </div>
      )}

      {showKycReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className={`${cardBg} p-10 rounded-3xl max-w-md w-full text-center shadow-2xl`}>
            <Shield className="mx-auto text-green-500 mb-6" size={60} />
            <h2 className={`text-2xl font-bold ${textColor}`}>Documents Under Review</h2>
            <p className="text-gray-500 mt-4 mb-6">We've received your documents. You'll be logged out and notified via email once verified.</p>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-[shrink_3s_linear_forwards]" style={{width: '100%'}} />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};

export default CompanyProfile;