import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../Contexts/ThemeContext';
import { recruiterService } from '../../services/recruiterService';
import { adminService } from '../../services/adminService';
import { 
  ArrowLeft, Building, MapPin, Briefcase, Globe, Calendar, 
  FileText, Camera, XCircle, CheckCircle, Save, TrendingUp,
  Shield, Phone, Mail, ExternalLink, AlertCircle
} from 'lucide-react';

const AdminEmployerProfile = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const logoInputRef = useRef(null);
  const [actionLoading, setActionLoading] = useState(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20';
  const cardBg = isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700/50' : 'border-gray-200/50';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-200';

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
    full_name: '',
    hasadminapproved: false,
    status: 'active',
    kyc_status: '',
    kyc_type: '',
    kyc_document_number: '',
    kycDocUrl: '',
    kyc_notes: '',
    rejection_reason: '',
    created_at: ''
  });

  useEffect(() => {
    const loadProfileData = async () => {
      if (email) {
        try {
          setLoading(true);
          const response = await recruiterService.getProfile(email, true);
          if (response.success && response.data) {
            const data = response.data.employer || response.data.profile || response.data;
            setProfileData({
              company_name: data.company_name || '',
              email: data.email || email,
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
              company_logo: data.company_logo || data.logo || '',
              full_name: data.full_name || '',
              hasadminapproved: data.hasadminapproved || false,
              status: data.status || 'active',
              kyc_status: data.kyc_status || '',
              kyc_type: data.kyc_type || '',
              kyc_document_number: data.kyc_document_number || '',
              kycDocUrl: data.kycDocUrl || data.kyc_document_url || '',
              kyc_notes: data.kyc_notes || data.kyc_remark || '',
              rejection_reason: data.rejection_reason || '',
              created_at: data.created_at || data.createdAt || ''
            });
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
          setError('Failed to load employer profile');
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfileData();
  }, [email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const uploadResponse = await recruiterService.uploadLogoFile(email, file);
      if (uploadResponse.success) {
        const uploadedLogoUrl = uploadResponse.data?.logoUrl || uploadResponse.data?.logo;
        if (uploadedLogoUrl) {
          setProfileData(prev => ({ ...prev, company_logo: uploadedLogoUrl }));
          setSuccess('Company logo uploaded successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setError('Failed to upload company logo');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        company_name: profileData.company_name,
        full_name: profileData.full_name,
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
        location: profileData.location
      };

      if (profileData.company_logo) {
        updateData.company_logo = profileData.company_logo;
      }

      const response = await recruiterService.updateProfile(email, updateData);

      if (response && response.success) {
        setSuccess('Employer profile updated successfully');
        setIsEditMode(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response?.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEmployer = async () => {
    try {
      setActionLoading('approve');
      
      await recruiterService.updateProfile(email, {
        rejection_reason: null,
        status: 'active'
      });

      const recruiter = { email, company_name: profileData.company_name };
      await adminService.approveRecruiter(recruiter);

      setProfileData(prev => ({ ...prev, hasadminapproved: true, status: 'active', rejection_reason: '' }));
      setSuccess('Employer approved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to approve employer:', error);
      setError('Failed to approve employer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEmployer = async () => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason || !reason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    try {
      setActionLoading('reject');

      await recruiterService.updateProfile(email, {
        rejection_reason: reason.trim(),
        status: 'rejected',
        hasadminapproved: false
      });

      const recruiter = { email, company_name: profileData.company_name };
      await adminService.rejectRecruiter(recruiter);

      setProfileData(prev => ({ 
        ...prev, 
        hasadminapproved: false, 
        status: 'rejected', 
        rejection_reason: reason.trim() 
      }));
      setSuccess('Employer rejected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to reject employer:', error);
      setError('Failed to reject employer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 11;

    if (profileData.company_name?.trim()) completed++;
    if (profileData.phone?.trim()) completed++;
    if (profileData.industry?.trim()) completed++;
    if (profileData.company_size?.trim()) completed++;
    if (profileData.description?.trim()) completed++;
    if (profileData.city?.trim()) completed++;
    if (profileData.state?.trim()) completed++;
    if (profileData.country?.trim()) completed++;
    if (profileData.company_logo) completed++;
    if (profileData.kyc_status?.toLowerCase() === 'verified') completed++;
    if (profileData.hasadminapproved) completed++;

    return Math.round((completed / total) * 100);
  };

  const isKycVerified = ['verified', 'approved', 'completed'].includes(profileData.kyc_status?.toLowerCase());

  if (loading && !profileData.company_name) {
    return (
      <div className={`min-h-screen ${bgColor} pt-24`}>
        <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center max-w-7xl mx-auto`}>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading employer profile...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} pt-24 px-4 pb-12`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/employers')}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <ArrowLeft size={20} className={textColor} />
            </button>
            <div>
              <h1 className={`text-3xl font-extrabold ${textColor}`}>Employer Profile</h1>
              <p className={textSecondary}>View and manage employer information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-xl border ${borderColor} ${cardBg} flex items-center gap-3 shadow-sm`}>
              <Shield className={isKycVerified ? "text-green-500" : "text-amber-500"} size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Trust Score</p>
                <p className={`text-sm font-bold ${profileData.hasadminapproved ? "text-green-600" : isKycVerified ? "text-green-600" : "text-amber-600"}`}>
                  {profileData.hasadminapproved ? "Verified" : isKycVerified ? "KYC Verified" : "Unverified"}
                </p>
              </div>
            </div>
            
            {/* Approve/Reject Buttons - Small Size */}
            {!profileData.hasadminapproved && (
              <>
                <button
                  onClick={handleApproveEmployer}
                  disabled={actionLoading === 'approve'}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading === 'approve' ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      <span className="text-xs">Approve</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleRejectEmployer}
                  disabled={actionLoading === 'reject'}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading === 'reject' ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} />
                      <span className="text-xs">Reject</span>
                    </>
                  )}
                </button>
              </>
            )}
            
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-1.5"
              >
                <Building size={14} />
                <span className="text-xs">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Approval Status Messages */}
        {profileData.status === 'rejected' && (
          <div className={`${cardBg} border-l-4 border-red-500 rounded-xl p-6 mb-6 shadow-xl`}>
            <div className="flex items-start gap-4">
              <XCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>Application Rejected</h3>
                {profileData.rejection_reason && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <strong className="block mb-1 text-red-700 dark:text-red-300 text-sm">Reason:</strong>
                    <p className="text-sm text-red-600 dark:text-red-400">{profileData.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!profileData.hasadminapproved && profileData.status !== 'rejected' && (
          <div className={`${cardBg} border-l-4 border-amber-500 rounded-xl p-6 mb-6 shadow-xl`}>
            <div className="flex items-start gap-4">
              <AlertCircle className="text-amber-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>Pending Approval</h3>
                <p className={`${textSecondary} text-sm`}>
                  This employer is awaiting admin approval to access the platform.
                </p>
              </div>
            </div>
          </div>
        )}

        {profileData.hasadminapproved && (
          <div className={`${cardBg} border-l-4 border-green-500 rounded-xl p-6 mb-6 shadow-xl`}>
            <div className="flex items-start gap-4">
              <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className={`text-lg font-bold ${textColor} mb-2`}>Approved Employer</h3>
                <p className={`${textSecondary} text-sm`}>
                  This employer has been approved and can post jobs.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className={`mb-4 p-4 ${isDark ? 'bg-red-900/20' : 'bg-red-50'} border ${isDark ? 'border-red-800' : 'border-red-200'} rounded-xl flex items-center gap-3`}>
            <XCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          </div>
        )}

        {success && (
          <div className={`mb-4 p-4 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} border ${isDark ? 'border-green-800' : 'border-green-200'} rounded-xl flex items-center gap-3`}>
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} overflow-hidden sticky top-24`}>
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className={`w-20 h-20 rounded-2xl ${cardBg} border-4 ${borderColor} shadow-lg overflow-hidden flex items-center justify-center`}>
                    {profileData.company_logo ? (
                      <img src={profileData.company_logo} className="w-full h-full object-contain" alt="logo" />
                    ) : <Building className="text-gray-300" size={32} />}
                  </div>
                </div>
              </div>
              
              <div className="pt-12 pb-6 px-6">
                <div className="text-center mb-6">
                  <h2 className={`text-xl font-bold ${textColor}`}>{profileData.company_name || "Company Name"}</h2>
                  <p className="text-sm text-blue-500 font-medium">{profileData.industry || "Industry"}</p>
                  {profileData.company_size && (
                    <p className={`text-xs ${textSecondary} mt-1`}>{profileData.company_size} employees</p>
                  )}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      profileData.hasadminapproved 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400'
                        : profileData.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400'
                    }`}>
                      {profileData.hasadminapproved ? 'Approved' : profileData.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </div>
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
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className={textSecondary}>PROFILE STRENGTH</span>
                    <span className={calculateProfileCompletion() === 100 ? "text-green-500" : "text-blue-500"}>
                      {calculateProfileCompletion()}%
                    </span>
                  </div>
                  <div className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full transition-all duration-700 ${
                        calculateProfileCompletion() === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${calculateProfileCompletion()}%` }} 
                    />
                  </div>
                </div>

                {/* KYC Status */}
                {profileData.kyc_status && (
                  <div className={`mt-6 p-3 ${isKycVerified ? (isDark ? 'bg-green-900/20' : 'bg-green-50') : (isDark ? 'bg-amber-900/20' : 'bg-amber-50')} rounded-xl border ${isKycVerified ? (isDark ? 'border-green-800' : 'border-green-200') : (isDark ? 'border-amber-800' : 'border-amber-200')}`}>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className={isKycVerified ? (isDark ? "text-green-400" : "text-green-600") : (isDark ? "text-amber-400" : "text-amber-600")} />
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${isKycVerified ? (isDark ? 'text-green-300' : 'text-green-800') : (isDark ? 'text-amber-300' : 'text-amber-800')}`}>
                          KYC: {profileData.kyc_status}
                        </p>
                        {profileData.kyc_type && (
                          <p className={`text-xs ${isKycVerified ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-amber-400' : 'text-amber-600')}`}>
                            {profileData.kyc_type}: {profileData.kyc_document_number || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Editable/Viewable Form */}
          <div className="lg:col-span-2">
            {isEditMode ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Company Logo */}
                <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6`}>
                  <h3 className={`text-lg font-bold ${textColor} mb-6 flex items-center gap-2`}>
                    <Building size={20} className="text-blue-500" />
                    Company Branding
                  </h3>
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-36 h-36 rounded-3xl border-4 border-dashed border-gray-200 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                        {profileData.company_logo ? (
                          <img src={profileData.company_logo} className="w-full h-full object-contain" alt="preview" />
                        ) : (
                          <Building className="text-gray-300" size={40} />
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => logoInputRef.current.click()} 
                        className="absolute -bottom-3 -right-3 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"
                      >
                        <Camera size={22} />
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleLogoChange} 
                    />
                    <p className="mt-4 text-sm text-gray-500 font-medium">Click camera icon to upload logo (Max 2MB)</p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6`}>
                  <h3 className={`text-lg font-bold ${textColor} mb-6`}>Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Company Name *</label>
                      <input
                        name="company_name"
                        value={profileData.company_name}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Contact Person</label>
                      <input
                        name="full_name"
                        value={profileData.full_name}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Phone *</label>
                      <input
                        name="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Industry *</label>
                      <input
                        name="industry"
                        value={profileData.industry}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Company Size *</label>
                      <select
                        name="company_size"
                        value={profileData.company_size}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        required
                      >
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
                      <input
                        name="website"
                        type="url"
                        value={profileData.website}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Founded Year</label>
                      <input
                        name="founded_year"
                        type="number"
                        value={profileData.founded_year}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Address</label>
                      <input
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">City</label>
                      <input
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">State</label>
                      <input
                        name="state"
                        value={profileData.state}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Country</label>
                      <input
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Postal Code</label>
                      <input
                        name="postal_code"
                        value={profileData.postal_code}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Description *</label>
                      <textarea
                        name="description"
                        value={profileData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className={`px-6 py-2.5 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-xl transition-colors font-medium`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* View Mode - Company Information */}
                <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6`}>
                  <h3 className={`text-lg font-bold ${textColor} mb-6 flex items-center gap-2`}>
                    <Building size={20} className="text-blue-500" />
                    Company Information
                  </h3>
                  {profileData.description && (
                    <p className={`${textColor} mb-4 text-sm leading-relaxed`}>{profileData.description}</p>
                  )}
                </div>

                {/* KYC Information */}
                {(profileData.kyc_type || profileData.kyc_document_number || profileData.kycDocUrl) && (
                  <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6`}>
                    <h3 className={`text-lg font-bold ${textColor} mb-6 flex items-center gap-2`}>
                      <Shield size={20} className="text-blue-500" />
                      KYC Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profileData.kyc_type && (
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400">KYC Type</p>
                          <p className={`${textColor} font-medium mt-1`}>{profileData.kyc_type}</p>
                        </div>
                      )}
                      {profileData.kyc_document_number && (
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400">Document Number</p>
                          <p className={`${textColor} font-medium mt-1`}>{profileData.kyc_document_number}</p>
                        </div>
                      )}
                      {profileData.kyc_status && (
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400">KYC Status</p>
                          <p className={`${textColor} font-medium mt-1`}>{profileData.kyc_status}</p>
                        </div>
                      )}
                      {profileData.kycDocUrl && (
                        <div>
                          <p className="text-xs font-bold uppercase text-gray-400">KYC Document</p>
                          <a
                            href={profileData.kycDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium mt-1 inline-flex items-center gap-1"
                          >
                            View Document <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                      {profileData.kyc_notes && (
                        <div className="md:col-span-2">
                          <p className="text-xs font-bold uppercase text-gray-400">KYC Notes</p>
                          <p className={`${textColor} mt-1 text-sm`}>{profileData.kyc_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployerProfile;