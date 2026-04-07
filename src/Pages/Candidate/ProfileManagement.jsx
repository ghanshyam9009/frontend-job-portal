import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { studentService } from '../../services/studentService';
import { 
  ChevronLeft, ChevronRight, Check, User, MapPin, Briefcase, 
  GraduationCap, Award, AlertCircle, Edit, Mail, Phone, Calendar, 
  Globe, FileText, Building, Camera, Upload, XCircle, CheckCircle,
  ArrowRight, Lock, TrendingUp, Shield
} from 'lucide-react';

const ProfileManagement = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const todayForDateInput = new Date().toISOString().split("T")[0];
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState(1);

  // Theme-based styling
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20';
  const cardBg = isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700/50' : 'border-gray-200/50';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-200';

  // Helper function to get user initials
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
    logoFile: null,
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
    experienceLevel: 'Experienced'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [profileComplete, setProfileComplete] = useState(false);
  const [currentSkillInput, setCurrentSkillInput] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const logoInputRef = useRef(null);

  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Personal, address and professional details',
      icon: User,
      fields: ['full_name', 'phone_number', 'dob', 'gender', 'address.street', 'address.city', 'address.state', 'address.zip', 'address.country', 'bio', 'skills']
    },
    {
      id: 'background',
      title: 'Education & Experience',
      description: 'Academic and work background',
      icon: GraduationCap,
      fields: ['education', 'experience']
    }
  ];

  // Country mapping for display
  const countryNameMap = {
    'US': 'United States',
    'CA': 'Canada',
    'UK': 'United Kingdom',
    'IN': 'India',
    'AU': 'Australia',
    'Other': 'Other'
  };

  const getCountryDisplayName = (countryCode) => {
    return countryNameMap[countryCode] || countryCode || 'Not provided';
  };

  // Validation functions
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'full_name':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          error = 'Full name can only contain letters and spaces';
        }
        break;

      case 'phone_number':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          error = 'Please enter a valid phone number';
        }
        break;

      case 'dob':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();

          if (birthDate > today) {
            error = "Invalid date. Please select a date that is not in the future.";
          }
        }
        break;

      case 'address.city':
        if (formData.address.city && !/^[a-zA-Z\s\-']+$/.test(formData.address.city)) {
          error = 'City name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;

      case 'address.zip':
        if (formData.address.zip && !/^[a-zA-Z0-9\s\-]+$/.test(formData.address.zip)) {
          error = 'Please enter a valid ZIP/postal code';
        }
        break;

      case 'bio':
        if (value && value.length > 500) {
          error = 'Bio must be less than 500 characters';
        }
        break;

      case 'skills':
        if (value && value.split(',').length > 20) {
          error = 'You can add up to 20 skills';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateStep = (stepIndex) => {
    const currentStepConfig = steps[stepIndex];
    const errors = {};

    currentStepConfig.fields.forEach(field => {
      let value;
      let fieldName = field;

      if (field.startsWith('address.')) {
        const addressField = field.split('.')[1];
        value = formData.address[addressField];
        fieldName = `address.${addressField}`;
      } else if (field === 'education') {
        formData.education.forEach((edu, index) => {
          const hasContent = edu.degree.trim() || edu.institution.trim() || edu.year.trim();
          if (hasContent) {
            if (!edu.degree.trim()) {
              errors[`education_${index}_degree`] = 'Degree is required';
            }
            if (!edu.institution.trim()) {
              errors[`education_${index}_institution`] = 'Institution is required';
            }
          }
        });
        return;
      } else if (field === 'experience') {
        formData.experience.forEach((exp, index) => {
          const hasContent = exp.title.trim() || exp.company.trim() || exp.duration.trim();
          if (hasContent) {
            if (!exp.title.trim()) {
              errors[`experience_${index}_title`] = 'Job title is required';
            }
            if (!exp.company.trim()) {
              errors[`experience_${index}_company`] = 'Company name is required';
            }
          }
        });
        return;
      } else if (field === 'skills') {
        const skillsArray = getSkillsArray();
        if (skillsArray.length === 0) {
          if (touchedFields[fieldName]) {
            errors[fieldName] = 'At least one skill is required';
          }
        } else {
          const error = validateField(field, skillsArray.join(', '));
          if (error && touchedFields[fieldName]) {
            errors[fieldName] = error;
          }
        }
      } else {
        value = formData[field];
        const error = validateField(field, value);
        if (error && touchedFields[fieldName]) {
          errors[fieldName] = error;
        }
      }
    });

    return errors;
  };

  const validateFileUpload = (file) => {
    if (!file) return '';

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF, DOC, or DOCX file';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return '';
  };

  const validateImageFile = (file) => {
    if (!file) return '';

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a JPEG, PNG, or GIF image';
    }

    if (file.size > maxSize) {
      return 'Image size must be less than 2MB';
    }

    return '';
  };

  // Check if profile is complete
  function checkProfileComplete(data) {
    const hasName = data.full_name && data.full_name.trim();
    const hasGender = data.gender && data.gender.trim();
    const hasCity = data.address?.city && data.address.city.trim();
    const hasState = data.address?.state && data.address.state.trim();
    const hasCountry = data.address?.country && data.address.country.trim();
    const hasBio = data.bio && data.bio.trim();
    const hasSkills = data.skills && (
      (typeof data.skills === 'string' && data.skills.trim()) ||
      (Array.isArray(data.skills) && data.skills.length > 0)
    );
    const hasEducation = Array.isArray(data.education) && data.education.length > 0 &&
      data.education.some(edu => edu.degree?.trim() && edu.institution?.trim());
    const hasExperience = data.experienceLevel === 'Fresher' || (
      Array.isArray(data.experience) && data.experience.length > 0 &&
      data.experience.some(exp => exp.title?.trim() && exp.company?.trim())
    );

    return hasName && hasGender && hasCity && hasState && hasCountry &&
           hasBio && hasSkills && hasEducation && hasExperience;
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 11; // Total required fields

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

  useEffect(() => {
    const loadProfileData = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          const profileResponse = await studentService.fetchProfileDetails(user.email);
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data.student || profileResponse.data.profile || profileResponse.data;
            const loadedData = {
              full_name: profileData.full_name || user.full_name || '',
              phone_number: profileData.phone_number || user.phone_number || '',
              dob: (() => {
                try {
                  let dateValue = profileData.dob || profileData.date_of_birth || profileData.birth_date || profileData.dateOfBirth || user.dob || user.date_of_birth || user.birth_date || user.dateOfBirth;

                  if (dateValue) {
                    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                      return dateValue;
                    }
                    const parsed = new Date(dateValue);
                    if (!isNaN(parsed.getTime())) {
                      const year = parsed.getFullYear();
                      const month = String(parsed.getMonth() + 1).padStart(2, '0');
                      const day = String(parsed.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    }
                  }
                  return '';
                } catch (error) {
                  console.warn('Error parsing DOB:', profileData.dob, user.dob, error);
                  return '';
                }
              })(),
              gender: profileData.gender || user.gender || '',
              address: {
                street: profileData.address?.street || user.address?.street || '',
                city: profileData.address?.city || user.address?.city || '',
                state: profileData.address?.state || user.address?.state || '',
                zip: profileData.address?.zip || user.address?.zip || '',
                country: profileData.address?.country || user.address?.country || ''
              },
              logo: profileData.logo || profileData.profile_image || user.logo || '',
              bio: profileData.bio || user.bio || '',
              resume: profileData.resumeUrl || profileData.resume || profileData.resumeFile?.resumeUrl || profileData.resumeFile?.url || (typeof profileData.resumeFile === 'string' ? profileData.resumeFile : null) || user.resumeUrl || user.resume || null,
              education: (() => {
                if (Array.isArray(profileData.education) && profileData.education.length > 0) {
                  return profileData.education;
                } else if (typeof profileData.education === 'string') {
                  try {
                    const parsed = JSON.parse(profileData.education);
                    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ degree: '', institution: '', year: '' }];
                  } catch {
                    return [{ degree: '', institution: '', year: '' }];
                  }
                } else if (Array.isArray(user.education) && user.education.length > 0) {
                  return user.education;
                }
                return [{ degree: '', institution: '', year: '' }];
              })(),
              experience: (() => {
                if (profileData.experienceLevel === 'Fresher' && profileData.experience === 'fresher') {
                  return [];
                } else if (Array.isArray(profileData.experience) && profileData.experience.length > 0) {
                  return profileData.experience;
                } else if (typeof profileData.experience === 'string') {
                  try {
                    const parsed = JSON.parse(profileData.experience);
                    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
                  } catch {
                    return [];
                  }
                } else if (Array.isArray(user.experience) && user.experience.length > 0) {
                  return user.experience;
                }
                return [];
              })(),
              skills: profileData.skills || user.skills || '',
              experienceLevel: profileData.experienceLevel || user.experienceLevel || (profileData.experience === 'fresher' ? 'Fresher' : 'Experienced')
            };
            setFormData(loadedData);

            const isComplete = checkProfileComplete(loadedData);
            setProfileComplete(isComplete);
            setCompletedSteps(isComplete ? [0, 1] : []);

            // Auto-expand logic
            if (!isComplete) {
              setExpandedStep(1);
            } else if (!loadedData.logo) {
              setExpandedStep(2);
            } else {
              setExpandedStep(0);
            }
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfileData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setTouchedFields({ ...touchedFields, [name]: true });
    const error = validateField(name, value);
    setValidationErrors({ ...validationErrors, [name]: error });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const fieldName = `address.${name}`;
    setFormData({
      ...formData,
      address: { ...formData.address, [name]: value }
    });
    setTouchedFields({ ...touchedFields, [fieldName]: true });
    const error = validateField(fieldName, value);
    setValidationErrors({ ...validationErrors, [fieldName]: error });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateFileUpload(file);
    if (error) {
      setValidationErrors({ ...validationErrors, resume: error });
      setTouchedFields({ ...touchedFields, resume: true });
      return;
    }

    setLoading(true);
    try {
      const uploadResponse = await studentService.uploadResumeFile(user.email, file);

      if (uploadResponse.success) {
        const uploadedResumeUrl = uploadResponse.data?.resumeUrl || uploadResponse.data?.url || uploadResponse.data?.profile?.resumeUrl || uploadResponse.data?.profile?.resume || uploadResponse.data?.profile?.resumeFile?.resumeUrl || uploadResponse.data?.profile?.resumeFile?.url || (typeof uploadResponse.data?.profile?.resumeFile === 'string' ? uploadResponse.data?.profile?.resumeFile : null) || uploadResponse.data?.data?.resumeUrl || uploadResponse.data?.data?.url || (typeof uploadResponse.data === 'string' ? uploadResponse.data : null);

        if (uploadedResumeUrl) {
          setFormData(prev => ({ ...prev, resume: uploadedResumeUrl }));
        }
        setValidationErrors({ ...validationErrors, resume: '' });
        setSuccess('Resume uploaded successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setValidationErrors({ ...validationErrors, resume: uploadResponse.error?.message || 'Failed to upload resume' });
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      setValidationErrors({ ...validationErrors, resume: 'Failed to upload resume. Please try again.' });
    } finally {
      setLoading(false);
      setTouchedFields({ ...touchedFields, resume: true });
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setError(error);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const uploadResponse = await studentService.uploadLogoFile(user.email, file);

      if (uploadResponse.success) {
        const uploadedLogoUrl = uploadResponse.data?.logoUrl || uploadResponse.data?.logo || uploadResponse.data?.profile?.logoUrl || uploadResponse.data?.profile?.logo || uploadResponse.data?.logoUrl || (typeof uploadResponse.data === 'string' ? uploadResponse.data : null);

        if (uploadedLogoUrl) {
          setFormData(prev => ({ ...prev, logo: uploadedLogoUrl, logoFile: null }));
        }
        setValidationErrors({ ...validationErrors, logo: '' });
        setSuccess('Profile image uploaded successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setValidationErrors({ ...validationErrors, logo: uploadResponse.error?.message || 'Failed to upload profile image' });
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setValidationErrors({ ...validationErrors, logo: 'Failed to upload profile image. Please try again.' });
    } finally {
      setLoading(false);
      setTouchedFields({ ...touchedFields, logo: true });
    }
  };

  const handleDynamicChange = (e, index, type) => {
    const { name, value } = e.target;
    const fieldKey = `${type}_${index}_${name}`;

    setTouchedFields({ ...touchedFields, [fieldKey]: true });

    const list = [...formData[type]];
    list[index][name] = value;
    setFormData({ ...formData, [type]: list });

    const errors = { ...validationErrors };
    if (name === 'degree' || name === 'institution') {
      errors[fieldKey] = value.trim() ? '' : `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else if (name === 'title' || name === 'company') {
      errors[fieldKey] = value.trim() ? '' : `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    setValidationErrors(errors);
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

        setTouchedFields({ ...touchedFields, skills: true });
      }

      setCurrentSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const currentSkills = getSkillsArray();
    const newSkills = currentSkills.filter(skill => skill !== skillToRemove);
    setFormData({ ...formData, skills: newSkills });
  };

  const removeResume = async () => {
    try {
      setLoading(true);
      setFormData(prev => ({ ...prev, resume: null }));
      updateUser({ ...user, resume: null, resumeUrl: null });
      setSuccess('Resume removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing resume:', error);
      setError('Failed to remove resume. Please try again.');
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
        ).length > 0
          ? formData.education.filter(edu => edu.degree?.trim() || edu.institution?.trim() || edu.year?.trim())
          : formData.education,
        experience: formData.experienceLevel === 'Fresher'
          ? 'fresher'
          : (formData.experience.filter(exp =>
              exp.title?.trim() || exp.company?.trim() || exp.duration?.trim()
            ).length > 0
              ? formData.experience.filter(exp => exp.title?.trim() || exp.company?.trim() || exp.duration?.trim())
              : formData.experience)
      };

      const { resume, logo, logoFile, ...dataForSubmission } = jsonData;

      if (typeof resume === 'string' && resume) {
        dataForSubmission.resume = resume;
      }

      if (typeof logo === 'string' && logo && !logo.startsWith('data:') && !logo.startsWith('blob:')) {
        dataForSubmission.logo = logo;
      }

      const response = await studentService.updateProfileDetails(user.email, dataForSubmission);

      if (response.success) {
        await new Promise(resolve => setTimeout(resolve, 500));

        let normalizedData = {
          ...user,
          ...jsonData
        };

        try {
          const profileResponse = await studentService.fetchProfileDetails(user.email);

          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data.student || profileResponse.data.profile || profileResponse.data || {};

            normalizedData = {
              ...user,
              full_name: profileData.full_name || profileData.fullName || user.full_name || jsonData.full_name || '',
              phone_number: profileData.phone_number || profileData.phoneNumber || user.phone_number || jsonData.phone_number || '',
              dob: profileData.dob || user.dob || jsonData.dob || '',
              gender: profileData.gender || user.gender || jsonData.gender || '',
              bio: profileData.bio || user.bio || jsonData.bio || '',
              skills: profileData.skills || user.skills || jsonData.skills || '',
              address: profileData.address || (profileData.address_city ? {
                street: profileData.address_street || user.address?.street || jsonData.address?.street || '',
                city: profileData.address_city || user.address?.city || jsonData.address?.city || '',
                state: profileData.address_state || user.address?.state || jsonData.address?.state || '',
                zip: profileData.address_zip || user.address?.zip || jsonData.address?.zip || '',
                country: profileData.address_country || user.address?.country || jsonData.address?.country || ''
              } : (user.address || jsonData.address || {})),
              education: Array.isArray(profileData.education)
                ? profileData.education.filter(edu => edu && (edu.degree || edu.institution || edu.year))
                : (Array.isArray(jsonData.education) ? jsonData.education : (user.education || [])),
              experience: Array.isArray(profileData.experience)
                ? profileData.experience.filter(exp => exp && (exp.title || exp.company || exp.duration))
                : (Array.isArray(jsonData.experience) ? jsonData.experience : (user.experience || [])),
              experienceLevel: profileData.experienceLevel || jsonData.experienceLevel || (profileData.experience === 'fresher' ? 'Fresher' : 'Experienced'),
              logo: profileData.logo || profileData.profile_image || user.logo || '',
              resume: profileData.resume || profileData.resumeUrl || profileData.resumeFile?.resumeUrl || profileData.resumeFile?.url || (typeof profileData.resumeFile === 'string' ? profileData.resumeFile : null) || user.resume || user.resumeUrl || null
            };
          }
        } catch (fetchError) {
          console.error('Error fetching updated profile:', fetchError);
        }

        updateUser(normalizedData);

        setFormData({
          full_name: normalizedData.full_name || '',
          phone_number: normalizedData.phone_number || '',
          dob: (() => {
            try {
              if (normalizedData.dob) {
                let date = normalizedData.dob;
                if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                  return date;
                }
                const parsed = new Date(date);
                if (!isNaN(parsed.getTime())) {
                  const year = parsed.getFullYear();
                  const month = String(parsed.getMonth() + 1).padStart(2, '0');
                  const day = String(parsed.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                }
              }
              return '';
            } catch (error) {
              console.warn('Error parsing DOB after update:', normalizedData.dob, error);
              return '';
            }
          })(),
          gender: normalizedData.gender || '',
          address: {
            street: normalizedData.address?.street || '',
            city: normalizedData.address?.city || '',
            state: normalizedData.address?.state || '',
            zip: normalizedData.address?.zip || '',
            country: normalizedData.address?.country || ''
          },
          bio: normalizedData.bio || '',
          logo: normalizedData.logo || '',
          resume: normalizedData.resume || normalizedData.resumeUrl || normalizedData.resumeFile?.resumeUrl || normalizedData.resumeFile?.url || (typeof normalizedData.resumeFile === 'string' ? normalizedData.resumeFile : null) || null,
          education: Array.isArray(normalizedData.education) ? normalizedData.education : [{ degree: '', institution: '', year: '' }],
          experience: Array.isArray(normalizedData.experience) ? normalizedData.experience : [{ title: '', company: '', duration: '' }],
          skills: normalizedData.skills || ''
        });

        setShowSuccessModal(true);
        setSuccess('Profile updated successfully');
        setCompletedSteps([0, 1]);

        const isComplete = checkProfileComplete(normalizedData);
        setProfileComplete(isComplete);

        setTimeout(() => {
          setSuccess('');
          setShowSuccessModal(false);
        }, 3000);
      } else {
        setError(response.error?.message || response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err?.message || 'An error occurred while updating the profile');
    } finally {
      setLoading(false);
    }
  };

  // Main render - Always show profile summary + editable form (like CompanyProfile)
  return (
    <div className={`min-h-screen ${bgColor} pt-24 px-4 pb-12`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-extrabold ${textColor}`}>My Profile</h1>
            <p className={textSecondary}>Manage your professional identity</p>
          </div>
          <div className={`px-4 py-2 rounded-xl border ${borderColor} ${cardBg} flex items-center gap-3 shadow-sm`}>
            <TrendingUp className={calculateProfileCompletion() === 100 ? "text-green-500" : "text-blue-500"} size={20} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Profile Strength</p>
              <p className={`text-sm font-bold ${calculateProfileCompletion() === 100 ? "text-green-600" : "text-blue-600"}`}>
                {calculateProfileCompletion()}% Complete
              </p>
            </div>
          </div>
        </div>

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
                {/* Name and Status */}
                <div className="text-center mb-6">
                  <h2 className={`text-xl font-bold ${textColor}`}>{formData.full_name || "Your Name"}</h2>
                  <p className="text-sm text-blue-500 font-medium">{formData.experienceLevel}</p>
                  {formData.address.city && formData.address.country && (
                    <p className={`text-xs ${textSecondary} mt-1`}>
                      {formData.address.city}, {getCountryDisplayName(formData.address.country)}
                    </p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-6">
                  {user?.email && (
                    <div className="flex items-start gap-2">
                      <Mail size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <a href={`mailto:${user.email}`} className={`text-xs ${textColor} hover:text-blue-500 transition-colors break-all`}>
                        {user.email}
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
                        <p className={`text-xs font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>Resume Uploaded</p>
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

            {/* Info Card */}
            <div className={`mt-6 p-5 rounded-2xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-100'}`}>
              <div className="flex gap-3">
                <AlertCircle className="text-blue-500 shrink-0" size={18} />
                <p className={`text-xs ${isDark ? 'text-blue-200' : 'text-blue-800'} leading-relaxed`}>
                  Complete profiles receive 5x more interview opportunities from recruiters.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Editable Form (Always Shown) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Basic Information */}
            <div className={`${cardBg} rounded-2xl shadow-lg border transition-all ${
              expandedStep === 1 ? 'border-blue-500 ring-4 ring-blue-500/10' : borderColor
            }`}>
              <button 
                onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)} 
                className="w-full p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    completedSteps.includes(0) ? 'bg-green-500 text-white' : `${isDark ? 'bg-blue-900' : 'bg-blue-100'} ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                  }`}>
                    {completedSteps.includes(0) ? <Check size={20} /> : '1'}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${textColor}`}>Basic Information</h3>
                    <p className={`text-xs ${textSecondary}`}>Personal details and contact</p>
                  </div>
                </div>
                <ChevronRight className={`transition-transform text-gray-400 ${expandedStep === 1 ? 'rotate-90' : ''}`} />
              </button>
              
              {expandedStep === 1 && (
                <div className={`p-6 pt-0 border-t ${isDark ? 'border-gray-700' : 'border-gray-50'}`}>
                  {error && (
                    <div className={`mb-4 p-4 ${isDark ? 'bg-red-900/20' : 'bg-red-50'} border ${isDark ? 'border-red-800' : 'border-red-200'} rounded-xl flex items-center gap-3`}>
                      <XCircle size={20} className="text-red-500 flex-shrink-0" />
                      <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                    </div>
                  )}

                  {success && !showSuccessModal && (
                    <div className={`mb-4 p-4 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} border ${isDark ? 'border-green-800' : 'border-green-200'} rounded-xl flex items-center gap-3`}>
                      <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                      <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>{success}</p>
                    </div>
                  )}

                  <form className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                    {/* Profile Photo */}
                    <div className="md:col-span-2">
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
                          <p className={`text-sm font-medium ${textColor}`}>Upload your photo</p>
                          <p className={`text-xs ${textSecondary}`}>Max 2MB (JPG, PNG, GIF)</p>
                        </div>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Full Name *</label>
                      <input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={`w-full p-3 rounded-xl border ${
                          validationErrors.full_name ? 'border-red-500' : `${inputBorder}`
                        } ${inputBg} ${textColor}`}
                        placeholder="Enter your full name"
                        required
                      />
                      {validationErrors.full_name && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {validationErrors.full_name}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
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

                    {/* Gender */}
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
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    {/* DOB */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Date of Birth</label>
                      <input
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleInputChange}
                        max={todayForDateInput}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                      />
                      {validationErrors.dob && (
                        <p className="mt-1 text-xs text-red-500">{validationErrors.dob}</p>
                      )}
                    </div>

                    {/* Address */}
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
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">City *</label>
                      <input
                        name="city"
                        value={formData.address.city}
                        onChange={handleAddressChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        placeholder="New York"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">State/Province *</label>
                      <input
                        name="state"
                        value={formData.address.state}
                        onChange={handleAddressChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        placeholder="NY"
                        required
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
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Country *</label>
                      <select
                        name="country"
                        value={formData.address.country}
                        onChange={handleAddressChange}
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        required
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="IN">India</option>
                        <option value="AU">Australia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Bio */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Professional Bio *</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        className={`w-full p-3 rounded-xl border ${inputBorder} ${inputBg} ${textColor}`}
                        placeholder="Tell us about your professional background..."
                        required
                      />
                    </div>

                    {/* Skills */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Skills *</label>
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
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Resume */}
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Resume/CV</label>
                      {formData.resume && (
                        <div className={`mb-3 p-3 ${isDark ? 'bg-green-900/20' : 'bg-green-50'} border ${isDark ? 'border-green-800' : 'border-green-200'} rounded-xl flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <FileText size={16} className={isDark ? "text-green-400" : "text-green-600"} />
                            <a
                              href={formData.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'} hover:underline`}
                            >
                              View Current Resume
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={removeResume}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                      <div className={`border-2 border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-8 text-center ${isDark ? 'bg-gray-900/30' : 'bg-gray-50'}`}>
                        <Upload className="mx-auto text-gray-300 mb-3" size={40} />
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id="resume"
                        />
                        <label
                          htmlFor="resume"
                          className="text-blue-500 font-bold cursor-pointer hover:underline"
                        >
                          {formData.resume ? 'Upload New Resume' : 'Upload Resume'}
                        </label>
                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX (Max 5MB)</p>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setExpandedStep(2)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                      >
                        Continue <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Step 2: Education & Experience */}
            <div className={`${cardBg} rounded-2xl shadow-lg border transition-all ${
              expandedStep === 2 ? 'border-blue-500 ring-4 ring-blue-500/10' : borderColor
            }`}>
              <button 
                onClick={() => setExpandedStep(expandedStep === 2 ? 0 : 2)} 
                className="w-full p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    completedSteps.includes(1) ? 'bg-green-500 text-white' : `${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-gray-400`
                  }`}>
                    {completedSteps.includes(1) ? <Check size={20} /> : '2'}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${textColor}`}>Education & Experience</h3>
                    <p className={`text-xs ${textSecondary}`}>Academic and work background</p>
                  </div>
                </div>
                <ChevronRight className={`transition-transform text-gray-400 ${expandedStep === 2 ? 'rotate-90' : ''}`} />
              </button>
              
              {expandedStep === 2 && (
                <div className={`p-6 pt-0 border-t ${isDark ? 'border-gray-700' : 'border-gray-50'}`}>
                  <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                    {/* Education */}
                    <div>
                      <h4 className={`text-sm font-bold ${textColor} mb-4 flex items-center gap-2`}>
                        <GraduationCap size={18} className="text-blue-500" />
                        Education
                      </h4>
                      {formData.education.map((edu, index) => (
                        <div key={index} className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 ${isDark ? 'bg-gray-900/30' : 'bg-gray-50'} rounded-xl`}>
                          <div>
                            <label className={`text-xs font-medium ${textSecondary} mb-1 block`}>Degree *</label>
                            <input
                              name="degree"
                              value={edu.degree}
                              onChange={(e) => handleDynamicChange(e, index, 'education')}
                              className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                              placeholder="B.S. Computer Science"
                              required
                            />
                          </div>
                          <div>
                            <label className={`text-xs font-medium ${textSecondary} mb-1 block`}>Institution *</label>
                            <input
                              name="institution"
                              value={edu.institution}
                              onChange={(e) => handleDynamicChange(e, index, 'education')}
                              className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                              placeholder="University Name"
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className={`text-xs font-medium ${textSecondary} mb-1 block`}>Year</label>
                              <input
                                name="year"
                                value={edu.year}
                                onChange={(e) => handleDynamicChange(e, index, 'education')}
                                className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                                placeholder="2023"
                              />
                            </div>
                            {formData.education.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDynamicField(index, 'education')}
                                className={`self-end p-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} rounded-lg`}
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

                    {/* Experience */}
                    {formData.experienceLevel === 'Experienced' && (
                      <div>
                        <h4 className={`text-sm font-bold ${textColor} mb-4 flex items-center gap-2`}>
                          <Briefcase size={18} className="text-blue-500" />
                          Work Experience
                        </h4>
                        {formData.experience.map((exp, index) => (
                          <div key={index} className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 ${isDark ? 'bg-gray-900/30' : 'bg-gray-50'} rounded-xl`}>
                            <div>
                              <label className={`text-xs font-medium ${textSecondary} mb-1 block`}>Job Title *</label>
                              <input
                                name="title"
                                value={exp.title}
                                onChange={(e) => handleDynamicChange(e, index, 'experience')}
                                className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                                placeholder="Software Developer"
                                required
                              />
                            </div>
                            <div>
                              <label className={`text-xs font-medium ${textSecondary} mb-1 block`}>Company *</label>
                              <input
                                name="company"
                                value={exp.company}
                                onChange={(e) => handleDynamicChange(e, index, 'experience')}
                                className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                                placeholder="Company Name"
                                required
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className={`text-xs font-medium ${textSecondary} mb-1 block`}>Duration</label>
                                <input
                                  name="duration"
                                  value={exp.duration}
                                  onChange={(e) => handleDynamicChange(e, index, 'experience')}
                                  className={`w-full p-2 rounded-lg border ${inputBorder} ${inputBg} text-sm ${textColor}`}
                                  placeholder="2020 - 2023"
                                />
                              </div>
                              {formData.experience.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeDynamicField(index, 'experience')}
                                  className={`self-end p-2 text-red-500 ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} rounded-lg`}
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

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            Save Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>
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
            <div className={`w-20 h-20 ${isDark ? 'bg-green-900/30' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h2 className={`text-2xl font-bold ${textColor} mb-2`}>Profile Saved!</h2>
            <p className={`${textSecondary} text-sm mb-8`}>
              Your profile has been updated successfully.
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)} 
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;