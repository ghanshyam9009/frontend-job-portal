import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../Contexts/ThemeContext';
import { studentService } from '../../services/studentService';
import { 
  ArrowLeft, User, MapPin, Briefcase, GraduationCap, Award, 
  AlertCircle, Edit, Mail, Phone, Calendar, FileText, Camera, 
  Upload, XCircle, CheckCircle, Save, TrendingUp, Sparkles
} from 'lucide-react';

const AdminCandidateProfile = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const returnViewMode = location.state?.returnViewMode || 'overview';
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const logoInputRef = useRef(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20';
  const cardBg = isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700/50' : 'border-gray-200/50';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-200';

  const getInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    dob: '',
    gender: '',
    logo: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    bio: '',
    resume: null,
    education: [{ degree: '', institution: '', year: '' }],
    experience: [{ title: '', company: '', duration: '' }],
    skills: '',
    experienceLevel: 'Experienced',
    status: 'active'
  });

  const [currentSkillInput, setCurrentSkillInput] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      if (email) {
        try {
          setLoading(true);
          const profileResponse = await studentService.fetchProfileDetails(email);
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data.student || profileResponse.data.profile || profileResponse.data;
            const loadedData = {
              full_name: profileData.full_name || profileData.name || '',
              phone_number: profileData.phone_number || profileData.phone || '',
              dob: (() => {
                try {
                  let dateValue = profileData.dob || profileData.date_of_birth;
                  if (dateValue) {
                    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                      return dateValue;
                    }
                    const parsed = new Date(dateValue);
                    if (!isNaN(parsed.getTime())) {
                      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
                    }
                  }
                  return '';
                } catch {
                  return '';
                }
              })(),
              gender: profileData.gender || '',
              address: {
                street: profileData.address?.street || '',
                city: profileData.address?.city || profileData.city || '',
                state: profileData.address?.state || '',
                zip: profileData.address?.zip || '',
                country: profileData.address?.country || ''
              },
              logo: profileData.logo || profileData.profile_image || '',
              bio: profileData.bio || '',
              resume: profileData.resumeUrl || profileData.resume || null,
              education: Array.isArray(profileData.education) && profileData.education.length > 0
                ? profileData.education
                : [{ degree: '', institution: '', year: '' }],
              experience: Array.isArray(profileData.experience) && profileData.experience.length > 0
                ? profileData.experience
                : [],
              skills: profileData.skills || '',
               experienceLevel: profileData.experienceLevel || 'Experienced',
              status: profileData.status || 'active',
              premium_user: profileData.premium_user || false,
              plan: profileData.plan || null
            };
            setFormData(loadedData);
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
          setError('Failed to load candidate profile');
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfileData();
  }, [email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      address: { ...formData.address, [name]: value }
    });
  };

  const handleDynamicChange = (e, index, type) => {
    const { name, value } = e.target;
    const list = [...formData[type]];
    list[index][name] = value;
    setFormData({ ...formData, [type]: list });
  };

  const addDynamicField = (type) => {
    const fields = {
      education: { degree: '', institution: '', year: '' },
      experience: { title: '', company: '', duration: '' }
    };
    setFormData({ ...formData, [type]: [...formData[type], fields[type]] });
  };

  const removeDynamicField = (index, type) => {
    const list = [...formData[type]];
    list.splice(index, 1);
    setFormData({ ...formData, [type]: list });
  };

  const getSkillsArray = () => {
    if (Array.isArray(formData.skills)) {
      return formData.skills.filter(skill => skill && skill.trim());
    }
    if (typeof formData.skills === 'string' && formData.skills.trim()) {
      return formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    }
    return [];
  };

  const addSkill = () => {
    if (currentSkillInput && currentSkillInput.trim()) {
      const currentSkills = getSkillsArray();
      if (!currentSkills.includes(currentSkillInput.trim())) {
        const newSkills = [...currentSkills, currentSkillInput.trim()];
        setFormData({ ...formData, skills: newSkills });
      }
      setCurrentSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const currentSkills = getSkillsArray();
    const newSkills = currentSkills.filter(skill => skill !== skillToRemove);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const uploadResponse = await studentService.uploadLogoFile(email, file);
      if (uploadResponse.success) {
        const uploadedLogoUrl = uploadResponse.data?.logoUrl || uploadResponse.data?.logo;
        if (uploadedLogoUrl) {
          setFormData(prev => ({ ...prev, logo: uploadedLogoUrl }));
          setSuccess('Profile image uploaded successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setError('Failed to upload profile image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const jsonData = {
        ...formData,
        skills: typeof formData.skills === 'string'
          ? formData.skills
          : (Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills),
        education: formData.education.filter(edu =>
          edu.degree?.trim() || edu.institution?.trim() || edu.year?.trim()
        ),
        experience: formData.experienceLevel === 'Fresher'
          ? 'fresher'
          : formData.experience.filter(exp =>
              exp.title?.trim() || exp.company?.trim() || exp.duration?.trim()
            )
      };

      const { resume, logo, ...dataForSubmission } = jsonData;
      if (typeof resume === 'string' && resume) dataForSubmission.resume = resume;
      if (typeof logo === 'string' && logo) dataForSubmission.logo = logo;

      const response = await studentService.updateProfileDetails(email, dataForSubmission);

      if (response.success) {
        setSuccess('Candidate profile updated successfully');
        setIsEditMode(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err?.message || 'An error occurred while updating the profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 11;

    if (formData.full_name?.trim()) completed++;
    if (formData.gender?.trim()) completed++;
    if (formData.address?.city?.trim()) completed++;
    if (formData.address?.state?.trim()) completed++;
    if (formData.address?.country?.trim()) completed++;
    if (formData.bio?.trim()) completed++;
    if (getSkillsArray().length > 0) completed++;
    if (formData.education.some(edu => edu.degree?.trim() && edu.institution?.trim())) completed++;
    if (formData.experienceLevel === 'Fresher' || formData.experience.some(exp => exp.title?.trim() && exp.company?.trim())) completed++;
    if (formData.logo) completed++;
    if (formData.resume) completed++;

    return Math.round((completed / total) * 100);
  };

  if (loading && !formData.full_name) {
    return (
      <div className={`min-h-screen ${bgColor} pt-24`}>
        <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center max-w-7xl mx-auto`}>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading candidate profile...</h3>
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
              onClick={() => navigate('/admin/candidates', { state: { returnViewMode } })}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <ArrowLeft size={20} className={textColor} />
            </button>
            <div>
              <h1 className={`text-3xl font-extrabold ${textColor}`}>Candidate Profile</h1>
              <p className={textSecondary}>View and manage candidate information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border ${borderColor} ${cardBg} flex items-center gap-3 shadow-sm`}>
              <TrendingUp className={calculateProfileCompletion() === 100 ? "text-green-500" : "text-blue-500"} size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Profile Strength</p>
                <p className={`text-sm font-bold ${calculateProfileCompletion() === 100 ? "text-green-600" : "text-blue-600"}`}>
                  {calculateProfileCompletion()}% Complete
                </p>
              </div>
            </div>
            {!isEditMode && (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Edit size={18} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

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
          {/* Left Sidebar - Profile Summary (View Only) */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-2xl shadow-xl border ${borderColor} overflow-hidden sticky top-24`}>
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className={`w-20 h-20 rounded-2xl ${cardBg} border-4 ${borderColor} shadow-lg overflow-hidden flex items-center justify-center`}>
                    {formData.logo ? (
                      <img src={formData.logo} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className={`w-full h-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'} flex items-center justify-center ${isDark ? 'text-blue-400' : 'text-blue-600'} text-2xl font-bold`}>
                        {getInitials(formData.full_name)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-12 pb-6 px-6">
                 <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h2 className={`text-xl font-bold ${textColor}`}>{formData.full_name || "Candidate Name"}</h2>
                    {/* Membership Badge Next to Name in Profile Sidebar - Enhanced Visibility */}
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-md flex items-center gap-1.5 transition-all flex-shrink-0 ${
                      (formData.premium_user === true || formData.premium_user === 'true') 
                        ? (formData.plan === 'premium' 
                            ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-300 shadow-amber-200/50' 
                            : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white border-blue-300 shadow-blue-200/50'
                          ) 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {(formData.premium_user === true || formData.premium_user === 'true') ? <Sparkles size={11} className="text-white" /> : <User size={11} />}
                      {(formData.premium_user === true || formData.premium_user === 'true') ? (formData.plan === 'premium' ? 'Premium' : 'Basic') : 'Free'}
                    </div>
                  </div>
                  <p className="text-sm text-blue-500 font-medium">{formData.experienceLevel}</p>
                  {formData.address.city && (
                    <p className={`text-xs ${textSecondary} mt-1`}>
                      {formData.address.city}{formData.address.country && `, ${formData.address.country}`}
                    </p>
                  )}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      formData.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400'
                    }`}>
                      {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1) || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-6">
                  {email && (
                    <div className="flex items-start gap-2">
                      <Mail size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <a href={`mailto:${email}`} className={`text-xs ${textColor} hover:text-blue-500 transition-colors break-all`}>
                        {email}
                      </a>
                    </div>
                  )}

                  {formData.phone_number && (
                    <div className="flex items-start gap-2">
                      <Phone size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <a href={`tel:${formData.phone_number}`} className={`text-xs ${textColor} hover:text-blue-500 transition-colors`}>
                        {formData.phone_number}
                      </a>
                    </div>
                  )}

                  {(formData.address.street || formData.address.city || formData.address.state) && (
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className={`text-xs ${textColor}`}>
                        {[formData.address.street, formData.address.city, formData.address.state, formData.address.zip]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {formData.dob && (
                    <div className="flex items-start gap-2">
                      <Calendar size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className={`text-xs ${textColor}`}>
                        {new Date(formData.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
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

                {/* Skills Preview */}
                {getSkillsArray().length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Top Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {getSkillsArray().slice(0, 5).map((skill, index) => (
                        <span key={index} className={`px-2 py-1 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} ${isDark ? 'text-blue-400' : 'text-blue-600'} rounded-lg text-xs font-medium`}>
                          {skill}
                        </span>
                      ))}
                      {getSkillsArray().length > 5 && (
                        <span className={`px-2 py-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary} rounded-lg text-xs font-medium`}>
                          +{getSkillsArray().length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Resume Status */}
                {formData.resume && (
                  <div className={`mt-6 p-3 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} rounded-xl border ${isDark ? 'border-green-800' : 'border-green-200'}`}>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className={isDark ? "text-green-400" : "text-green-600"} />
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>Resume Available</p>
                        <a 
                          href={formData.resume} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'} hover:underline`}
                        >
                          View/Download
                        </a>
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6`}>
                  <h3 className={`text-lg font-bold ${textColor} mb-6 flex items-center gap-2`}>
                    <User size={20} className="text-blue-500" />
                    Basic Information
                  </h3>

                  <div className="space-y-5">
                    {/* Profile Photo */}
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="relative group">
                          <div className={`w-24 h-24 rounded-2xl border-4 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-200'} overflow-hidden flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                            {formData.logo ? (
                              <img src={formData.logo} className="w-full h-full object-cover" alt="preview" />
                            ) : (
                              <div className="text-gray-400 text-3xl font-bold">
                                {getInitials(formData.full_name)}
                              </div>
                            )}
                          </div>
                          <button 
                            type="button"
                            onClick={() => logoInputRef.current.click()} 
                            className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-xl hover:scale-110 transition-transform"
                          >
                            <Camera size={18} />
                          </button>
                        </div>
                        <input 
                          type="file" 
                          ref={logoInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleLogoChange} 
                        />
                        <div>
                          <p className={`text-sm font-medium ${textColor}`}>Upload candidate photo</p>
                          <p className={`text-xs ${textSecondary}`}>Max 2MB (JPG, PNG, GIF)</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Full Name *</label>
                        <input
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                          placeholder="Enter full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Phone Number</label>
                        <input
                          name="phone_number"
                          type="tel"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Date of Birth</label>
                        <input
                          name="dob"
                          type="date"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Street Address</label>
                        <input
                          name="street"
                          value={formData.address.street}
                          onChange={handleAddressChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                          placeholder="123 Main St"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">City</label>
                        <input
                          name="city"
                          value={formData.address.city}
                          onChange={handleAddressChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                          placeholder="New York"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">State/Province</label>
                        <input
                          name="state"
                          value={formData.address.state}
                          onChange={handleAddressChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                          placeholder="NY"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">ZIP/Postal Code</label>
                        <input
                          name="zip"
                          value={formData.address.zip}
                          onChange={handleAddressChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                          placeholder="10001"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Country</label>
                        <select
                          name="country"
                          value={formData.address.country}
                          onChange={handleAddressChange}
                          className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        >
                          <option value="">Select Country</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="IN">India</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Professional Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        placeholder="Professional background..."
                      />
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Skills</label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentSkillInput}
                            onChange={(e) => setCurrentSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && currentSkillInput.trim()) {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                            className={`flex-1 p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                            placeholder="Type a skill and press Enter"
                          />
                          <button
                            type="button"
                            onClick={addSkill}
                            disabled={!currentSkillInput.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getSkillsArray().map((skill, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1.5 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} ${isDark ? 'text-blue-400' : 'text-blue-600'} rounded-lg text-sm font-medium flex items-center gap-2`}
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="hover:text-red-500"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education & Experience */}
                <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6`}>
                  <h3 className={`text-lg font-bold ${textColor} mb-6 flex items-center gap-2`}>
                    <GraduationCap size={20} className="text-blue-500" />
                    Education & Experience
                  </h3>

                  <div className="space-y-6">
                    {/* Education */}
                    <div>
                      <h4 className={`text-sm font-bold ${textColor} mb-4`}>Education</h4>
                      {formData.education.map((edu, index) => (
                        <div key={index} className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 ${isDark ? 'bg-gray-900/30' : 'bg-gray-50'} rounded-xl`}>
                          <div>
                            <input
                              name="degree"
                              value={edu.degree}
                              onChange={(e) => handleDynamicChange(e, index, 'education')}
                              className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                              placeholder="Degree"
                            />
                          </div>
                          <div>
                            <input
                              name="institution"
                              value={edu.institution}
                              onChange={(e) => handleDynamicChange(e, index, 'education')}
                              className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                              placeholder="Institution"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              name="year"
                              value={edu.year}
                              onChange={(e) => handleDynamicChange(e, index, 'education')}
                              className={`flex-1 p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                              placeholder="Year"
                            />
                            {formData.education.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDynamicField(index, 'education')}
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                              >
                                <XCircle size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addDynamicField('education')}
                        className="text-blue-500 text-sm font-medium hover:underline"
                      >
                        + Add Education
                      </button>
                    </div>

                    {/* Experience Level */}
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Experience Level</label>
                      <select
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      >
                        <option value="Experienced">Experienced</option>
                        <option value="Fresher">Fresher</option>
                      </select>
                    </div>

                    {/* Work Experience */}
                    {formData.experienceLevel === 'Experienced' && (
                      <div>
                        <h4 className={`text-sm font-bold ${textColor} mb-4`}>Work Experience</h4>
                        {formData.experience.map((exp, index) => (
                          <div key={index} className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 ${isDark ? 'bg-gray-900/30' : 'bg-gray-50'} rounded-xl`}>
                            <div>
                              <input
                                name="title"
                                value={exp.title}
                                onChange={(e) => handleDynamicChange(e, index, 'experience')}
                                className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                                placeholder="Job Title"
                              />
                            </div>
                            <div>
                              <input
                                name="company"
                                value={exp.company}
                                onChange={(e) => handleDynamicChange(e, index, 'experience')}
                                className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                                placeholder="Company"
                              />
                            </div>
                            <div className="flex gap-2">
                              <input
                                name="duration"
                                value={exp.duration}
                                onChange={(e) => handleDynamicChange(e, index, 'experience')}
                                className={`flex-1 p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                                placeholder="Duration"
                              />
                              {formData.experience.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeDynamicField(index, 'experience')}
                                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                                >
                                  <XCircle size={20} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addDynamicField('experience')}
                          className="text-blue-500 text-sm font-medium hover:underline"
                        >
                          + Add Experience
                        </button>
                      </div>
                    )}
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
                {/* View Mode - Professional Information */}
                <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6`}>
                  <h3 className={`text-lg font-bold ${textColor} mb-6 flex items-center gap-2`}>
                    <Briefcase size={20} className="text-blue-500" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400">Experience Level</p>
                      <p className={`${textColor} font-medium mt-1`}>{formData.experienceLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-400">Bio</p>
                      <p className={`${textColor} mt-1 text-sm`}>{formData.bio || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Education */}
                {formData.education.some(edu => edu.degree || edu.institution) && (
                  <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6`}>
                    <h3 className={`text-lg font-bold ${textColor} mb-6 flex items-center gap-2`}>
                      <GraduationCap size={20} className="text-blue-500" />
                      Education
                    </h3>
                    <div className="space-y-4">
                      {formData.education.map((edu, index) => (
                        edu.degree || edu.institution ? (
                          <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
                            <p className={`font-semibold ${textColor}`}>{edu.degree || 'Degree not specified'}</p>
                            <p className={textSecondary}>{edu.institution || 'Institution not specified'}</p>
                            {edu.year && <p className={`text-sm ${textSecondary} mt-1`}>{edu.year}</p>}
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {formData.experienceLevel === 'Experienced' && formData.experience.some(exp => exp.title || exp.company) && (
                  <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6`}>
                    <h3 className={`text-lg font-bold ${textColor} mb-6 flex items-center gap-2`}>
                      <Briefcase size={20} className="text-blue-500" />
                      Work Experience
                    </h3>
                    <div className="space-y-4">
                      {formData.experience.map((exp, index) => (
                        exp.title || exp.company ? (
                          <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
                            <p className={`font-semibold ${textColor}`}>{exp.title || 'Title not specified'}</p>
                            <p className={textSecondary}>{exp.company || 'Company not specified'}</p>
                            {exp.duration && <p className={`text-sm ${textSecondary} mt-1`}>{exp.duration}</p>}
                          </div>
                        ) : null
                      ))}
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

export default AdminCandidateProfile;