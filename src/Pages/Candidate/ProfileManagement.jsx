import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { ChevronLeft, ChevronRight, Check, User, MapPin, Briefcase, GraduationCap, Award, AlertCircle, Edit, Mail, Phone, Calendar, Globe, FileText } from 'lucide-react';
import styles from './ProfileManagement.module.css';

const ProfileManagement = () => {
  const { user, updateUser } = useAuth();
  const todayForDateInput = new Date().toISOString().split("T")[0];
  const [currentStep, setCurrentStep] = useState(0);

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
    logoFile: null, // Store selected file for upload during profile save
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
  const [isEditMode, setIsEditMode] = useState(() => {
    // Initialize based on user context if available
    if (user?.email) {
      const hasName = user.full_name && user.full_name.trim();
      const hasGender = user.gender && user.gender.trim();
      const hasCity = user.address?.city && user.address.city.trim();
      const hasState = user.address?.state && user.address.state.trim();
      const hasCountry = user.address?.country && user.address.country.trim();
      const hasBio = user.bio && user.bio.trim();
      const hasSkills = user.skills && user.skills.trim();
      const hasEducation = Array.isArray(user.education) && user.education.length > 0 &&
        user.education.some(edu => edu.degree?.trim() && edu.institution?.trim());
      const hasExperience = user.experienceLevel === 'Fresher' || (
        Array.isArray(user.experience) && user.experience.length > 0 &&
        user.experience.some(exp => exp.title?.trim() && exp.company?.trim())
      );

      const isComplete = hasName && hasGender && hasCity && hasState && hasCountry &&
                         hasBio && hasSkills && hasEducation && hasExperience;

      return !isComplete; // Start in edit mode if incomplete, view mode if complete
    }
    return true; // Default to edit mode if no user data
  });
  const [profileComplete, setProfileComplete] = useState(() => {
    // Initialize based on user context if available
    if (user?.email) {
      const hasName = user.full_name && user.full_name.trim();
      const hasGender = user.gender && user.gender.trim();
      const hasCity = user.address?.city && user.address.city.trim();
      const hasState = user.address?.state && user.address.state.trim();
      const hasCountry = user.address?.country && user.address.country.trim();
      const hasBio = user.bio && user.bio.trim();
      const hasSkills = user.skills && user.skills.trim();
      const hasEducation = Array.isArray(user.education) && user.education.length > 0 &&
        user.education.some(edu => edu.degree?.trim() && edu.institution?.trim());
      const hasExperience = user.experienceLevel === 'Fresher' || (
        Array.isArray(user.experience) && user.experience.length > 0 &&
        user.experience.some(exp => exp.title?.trim() && exp.company?.trim())
      );

      return hasName && hasGender && hasCity && hasState && hasCountry &&
             hasBio && hasSkills && hasEducation && hasExperience;
    }
    return false; // Default to incomplete if no user data
  });
  const [currentSkillInput, setCurrentSkillInput] = useState('');
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

    // Validate all fields in the current step
    currentStepConfig.fields.forEach(field => {
      let value;
      let fieldName = field;

      if (field.startsWith('address.')) {
        const addressField = field.split('.')[1];
        value = formData.address[addressField];
        fieldName = `address.${addressField}`;
      } else if (field === 'education') {
        // Validate education array - only if has content
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
        // Validate experience array - only if has content
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
        // Special validation for skills - check if at least one skill is added
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
    const hasPhone = data.phone_number && data.phone_number.trim(); // Made optional since user mentioned phone is not required in other messages
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

    // Only check required fields, phone number is optional
    return hasName && hasGender && hasCity && hasState && hasCountry &&
           hasBio && hasSkills && hasEducation && hasExperience;
  }

  useEffect(() => {
    const loadProfileData = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          // Fetch latest profile data using the new API endpoint
          const profileResponse = await studentService.fetchProfileDetails(user.email);
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data.student || profileResponse.data.profile || profileResponse.data;
            const loadedData = {
              full_name: profileData.full_name || user.full_name || '',
              phone_number: profileData.phone_number || user.phone_number || '',
              dob: (() => {
                try {
                  // Check multiple possible DOB sources and formats
                  let dateValue = profileData.dob || profileData.date_of_birth || profileData.birth_date || profileData.dateOfBirth || user.dob || user.date_of_birth || user.birth_date || user.dateOfBirth;

                  if (dateValue) {
                    // If it's already in YYYY-MM-DD format, use it directly
                    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                      return dateValue;
                    }
                    // Try to parse various date formats
                    const parsed = new Date(dateValue);
                    if (!isNaN(parsed.getTime())) {
                      // Ensure it's in local timezone for consistent display
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
              resume: profileData.resumeUrl
                || profileData.resume
                || profileData.resumeFile?.resumeUrl
                || profileData.resumeFile?.url
                || (typeof profileData.resumeFile === 'string' ? profileData.resumeFile : null)
                || profileData.resume
                || profileData.resumeFile?.resumeUrl
                || profileData.resumeFile?.url
                || (typeof profileData.resumeFile === 'string' ? profileData.resumeFile : null)
                || user.resumeUrl
                || user.resume
                || null,
              education: (() => {
                // Handle education - could be array, string, or missing
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
                // Handle experience - for fresher, if backend sends 'fresher', start with empty array
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

            // Debug: Log profile data to help identify what's missing
            console.log('Loaded profile data:', loadedData);

            // Check if profile is complete and log the results
            const isComplete = checkProfileComplete(loadedData);
            console.log('Profile complete check:', {
              isComplete,
              hasName: !!(loadedData.full_name && loadedData.full_name.trim()),
              hasPhone: !!(loadedData.phone_number && loadedData.phone_number.trim()),
              hasGender: !!(loadedData.gender && loadedData.gender.trim()),
              hasCity: !!(loadedData.address?.city && loadedData.address.city.trim()),
              hasState: !!(loadedData.address?.state && loadedData.address.state.trim()),
              hasCountry: !!(loadedData.address?.country && loadedData.address.country.trim()),
              hasBio: !!(loadedData.bio && loadedData.bio.trim()),
              hasSkills: !!(loadedData.skills && loadedData.skills.trim()),
              hasEducation: Array.isArray(loadedData.education) && loadedData.education.length > 0 &&
                loadedData.education.some(edu => edu.degree?.trim() && edu.institution?.trim()),
              hasExperience: loadedData.experienceLevel === 'Fresher' || (
                Array.isArray(loadedData.experience) && loadedData.experience.length > 0 &&
                loadedData.experience.some(exp => exp.title?.trim() && exp.company?.trim())
              )
            });

            setProfileComplete(isComplete);
            setCompletedSteps(isComplete ? [0, 1] : []);
            // Always start in view mode if complete, regardless of initial state
            setIsEditMode(false);
            } else {
              // Fallback to user context data if API fetch fails
              setFormData({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                address: {
                  street: user.address?.street || '',
                  city: user.address?.city || '',
                  state: user.address?.state || '',
                  zip: user.address?.zip || '',
                  country: user.address?.country || ''
                },
                logo: user.logo || '',
                bio: user.bio || '',
                resume: user.resumeUrl || user.resume || null,
                education: (() => {
                  if (Array.isArray(user.education) && user.education.length > 0) {
                    return user.education;
                  } else if (typeof user.education === 'string') {
                    try {
                      const parsed = JSON.parse(user.education);
                      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ degree: '', institution: '', year: '' }];
                    } catch {
                      return [{ degree: '', institution: '', year: '' }];
                    }
                  }
                  return [{ degree: '', institution: '', year: '' }];
                })(),
                experience: (() => {
                  if (Array.isArray(user.experience) && user.experience.length > 0) {
                    return user.experience;
                  } else if (typeof user.experience === 'string') {
                    try {
                      const parsed = JSON.parse(user.experience);
                      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ title: '', company: '', duration: '' }];
                    } catch {
                      return [{ title: '', company: '', duration: '' }];
                    }
                  }
                  return [{ title: '', company: '', duration: '' }];
            })(),
            skills: user.skills || '',
            experienceLevel: user.experienceLevel || 'Experienced'
          });
            }
        } catch (error) {
          console.error('Error loading profile data:', error);
          // Fallback to user context data
          setFormData({
            full_name: user.full_name || '',
            phone_number: user.phone_number || '',
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
            gender: user.gender || '',
            logo: user.logo || '',
            address: {
              street: user.address?.street || '',
              city: user.address?.city || '',
              state: user.address?.state || '',
              zip: user.address?.zip || '',
              country: user.address?.country || ''
            },
            bio: user.bio || '',
            resume: user.resumeUrl || user.resume || null,
            education: (() => {
              if (Array.isArray(user.education) && user.education.length > 0) {
                return user.education;
              } else if (typeof user.education === 'string') {
                try {
                  const parsed = JSON.parse(user.education);
                  return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ degree: '', institution: '', year: '' }];
                } catch {
                  return [{ degree: '', institution: '', year: '' }];
                }
              }
              return [{ degree: '', institution: '', year: '' }];
            })(),
            experience: (() => {
              if (Array.isArray(user.experience) && user.experience.length > 0) {
                return user.experience;
              } else if (typeof user.experience === 'string') {
                try {
                  const parsed = JSON.parse(user.experience);
                  return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ title: '', company: '', duration: '' }];
                } catch {
                  return [{ title: '', company: '', duration: '' }];
                }
              }
              return [{ title: '', company: '', duration: '' }];
                })(),
                skills: user.skills || '',
                experienceLevel: user.experienceLevel || 'Experienced'
              });
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfileData();
  }, [user]);

  // Ensure scrollability after data loads and on component mount
  useEffect(() => {
    // Immediate check on mount
    const enableScrolling = () => {
      // Ensure body scrolling is enabled
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflowY = 'auto';

      // Force container scroll recalculation
      const container = document.querySelector(`.${styles.container}`);
      if (container) {
        container.style.overflowY = 'auto';
        // Trigger reflow
        container.offsetHeight;
      }
    };

    // Immediate execution
    enableScrolling();

    // Add a small timeout to handle any reflow issues during loading
    const timer = setTimeout(enableScrolling, 100);

    return () => clearTimeout(timer);
  }, []);

  // Additional effect for data loading changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = document.querySelector(`.${styles.container}`);
      if (container) {
        container.style.overflowY = 'auto';
        container.offsetHeight;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [formData, loading, styles.container]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Mark field as touched
    setTouchedFields({ ...touchedFields, [name]: true });

    // Validate on change
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

    // Mark field as touched
    setTouchedFields({ ...touchedFields, [fieldName]: true });

    // Validate on change
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
      // Upload the resume file immediately using the dedicated API
      const uploadResponse = await studentService.uploadResumeFile(user.email, file);

    } catch (error) {
      console.error('Resume upload error:', error);
      setValidationErrors({ ...validationErrors, resume: 'Failed to upload resume. Please try again.' });
    } finally {
      setLoading(false);
      // Mark field as touched
      setTouchedFields({ ...touchedFields, resume: true });
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setValidationErrors({ ...validationErrors, logo: error });
      setTouchedFields({ ...touchedFields, logo: true });
      return;
    }

    setLoading(true);
    try {
      // Upload the logo file immediately using the dedicated API
      const uploadResponse = await studentService.uploadLogoFile(user.email, file);

      if (uploadResponse.success) {
        // Debug the response structure
        console.log('Full upload response:', uploadResponse);
        console.log('Upload response data:', uploadResponse.data);
        console.log('Data type:', typeof uploadResponse.data);
        console.log('Data keys:', uploadResponse.data ? Object.keys(uploadResponse.data) : 'No data');

        // Try multiple extraction approaches - handle nested data structure from withErrorHandling
        let uploadedLogoUrl;

        // First try: nested data structure from service response
        if (uploadResponse.data?.data?.logoUrl) {
          uploadedLogoUrl = uploadResponse.data.data.logoUrl;
          console.log('Found logo in uploadResponse.data.data.logoUrl');
        } else if (uploadResponse.data?.data?.logo) {
          uploadedLogoUrl = uploadResponse.data.data.logo;
          console.log('Found logo in uploadResponse.data.data.logo');
        }
        // Second try: direct from data (fallback for different response structures)
        else if (uploadResponse.data?.logo) {
          uploadedLogoUrl = uploadResponse.data.logo;
          console.log('Found logo in uploadResponse.data.logo');
        } else if (uploadResponse.data?.logoUrl) {
          uploadedLogoUrl = uploadResponse.data.logoUrl;
          console.log('Found logo in uploadResponse.data.logoUrl');
        }
        // Third try: check if data itself is the URL (fallback)
        else if (typeof uploadResponse.data === 'string' && uploadResponse.data.startsWith('http')) {
          uploadedLogoUrl = uploadResponse.data;
          console.log('Found logo as direct string in data');
        }

        console.log('Final extracted logo URL:', uploadedLogoUrl);

        // Update logo URL in formData only (don't update user context to avoid triggering re-fetch)
        if (uploadedLogoUrl) {
          console.log('Setting logo URL in formData:', uploadedLogoUrl);
          setFormData(prev => ({ ...prev, logo: uploadedLogoUrl, logoFile: null }));
        } else {
          console.error('No logo URL found! Data content:', uploadResponse.data);
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
      // Mark field as touched
      setTouchedFields({ ...touchedFields, logo: true });
    }
  };



  const handleDynamicChange = (e, index, type) => {
    const { name, value } = e.target;
    const fieldKey = `${type}_${index}_${name}`;

    // Mark field as touched
    setTouchedFields({ ...touchedFields, [fieldKey]: true });

    // Update form data
    const list = [...formData[type]];
    list[index][name] = value;
    setFormData({ ...formData, [type]: list });

    // Validate required fields for dynamic sections
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
      experience: { title: '', company: '', duration: '' },
      internships: { title: '', company: '', duration: '' },
      certifications: [{ name: '', authority: '', year: '' }]
    };
    setFormData({ ...formData, [type]: [...formData[type], fields[type]] });
  };

  const removeDynamicField = (index, type) => {
    const list = [...formData[type]];
    list.splice(index, 1);
    setFormData({ ...formData, [type]: list });
  };

  // Skills management functions
  const getSkillsArray = () => {
    // If skills is already an array (from backend), handle it
    if (Array.isArray(formData.skills)) {
      return formData.skills.filter(skill => skill && skill.trim());
    }

    // Convert comma-separated string to array and clean
    if (typeof formData.skills === 'string' && formData.skills.trim()) {
      return formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    }

    return [];
  };

  const addSkill = () => {
    if (currentSkillInput && currentSkillInput.trim()) {
      const currentSkills = getSkillsArray();

      // Don't add duplicate skills
      if (!currentSkills.includes(currentSkillInput.trim())) {
        const newSkills = [...currentSkills, currentSkillInput.trim()];
        setFormData({ ...formData, skills: newSkills });

        // Mark field as touched when adding a skill
        setTouchedFields({ ...touchedFields, skills: true });
      }

      // Clear the input
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
      // Call API to remove resume (assuming studentService has this method)
      // For now, just clear from local state
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

  const nextStep = () => {
    // Validate current step before proceeding
    const stepErrors = validateStep(currentStep);

    if (Object.keys(stepErrors).length > 0) {
      setValidationErrors({ ...validationErrors, ...stepErrors });
      setError('Please fix the errors before proceeding to the next step');
      return;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep(currentStep + 1);
    setError(''); // Clear any previous errors
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Prepare form data for submission - ensure arrays are properly formatted
      const jsonData = {
        ...formData,
        // Handle skills array - convert back to comma-separated string for backend
        skills: typeof formData.skills === 'string'
          ? formData.skills
          : (Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills),
        // Filter out empty education entries, but keep at least one if all are empty
        education: formData.education.filter(edu =>
          edu.degree?.trim() || edu.institution?.trim() || edu.year?.trim()
        ).length > 0
          ? formData.education.filter(edu => edu.degree?.trim() || edu.institution?.trim() || edu.year?.trim())
          : formData.education,
        // Handle experience based on experience level
        experience: formData.experienceLevel === 'Fresher'
          ? 'fresher'
          : (formData.experience.filter(exp =>
              exp.title?.trim() || exp.company?.trim() || exp.duration?.trim()
            ).length > 0
              ? formData.experience.filter(exp => exp.title?.trim() || exp.company?.trim() || exp.duration?.trim())
              : formData.experience)
      };

      // Prepare data for JSON submission - handle resume and logo fields
      const { resume, logo, logoFile, ...dataForSubmission } = jsonData;

      // Include resume URL if it's a string (from existing data), but not if it's a File object
      if (typeof resume === 'string' && resume) {
        dataForSubmission.resume = resume;
      }

      // Always include logo URL if it's a string and a proper URL (not blob/data URL)
      // This ensures newly uploaded logos are included in profile updates
      if (typeof logo === 'string' && logo && !logo.startsWith('data:') && !logo.startsWith('blob:')) {
        dataForSubmission.logo = logo;
        console.log('Including logo in profile update:', logo);
      } else {
        console.log('Logo not included in update - logo value:', logo, 'type:', typeof logo);
      }

      console.log('Submitting profile data:', dataForSubmission);

      // Submit as regular JSON (the working approach)
      const response = await studentService.updateProfileDetails(user.email, dataForSubmission);
      console.log('Update response:', response);

      if (response.success) {
        // Wait a bit for the backend to process, then always fetch latest profile data
        await new Promise(resolve => setTimeout(resolve, 500));

        // Initialize normalizedData with form data as fallback
        let normalizedData = {
          ...user,
          ...jsonData
        };

        // ALWAYS fetch the latest profile data after update to get processed image URLs
        try {
          const profileResponse = await studentService.fetchProfileDetails(user.email);
          console.log('Fetched latest profile response after update:', profileResponse);

          if (profileResponse.success && profileResponse.data) {
            // Handle different API response structures
            const profileData = profileResponse.data.student || profileResponse.data.profile || profileResponse.data || {};
            console.log('Profile data after update:', profileData);

            // Normalize the data structure - handle different possible formats
            normalizedData = {
              ...user,
              full_name: profileData.full_name || profileData.fullName || user.full_name || jsonData.full_name || '',
              phone_number: profileData.phone_number || profileData.phoneNumber || user.phone_number || jsonData.phone_number || '',
              dob: profileData.dob || user.dob || jsonData.dob || '',
              gender: profileData.gender || user.gender || jsonData.gender || '',
              bio: profileData.bio || user.bio || jsonData.bio || '',
              skills: profileData.skills || user.skills || jsonData.skills || '',
              // Handle address - could be object or nested
              address: profileData.address || (profileData.address_city ? {
                street: profileData.address_street || user.address?.street || jsonData.address?.street || '',
                city: profileData.address_city || user.address?.city || jsonData.address?.city || '',
                state: profileData.address_state || user.address?.state || jsonData.address?.state || '',
                zip: profileData.address_zip || user.address?.zip || jsonData.address?.zip || '',
                country: profileData.address_country || user.address?.country || jsonData.address?.country || ''
              } : (user.address || jsonData.address || {})),
              // Handle education - ensure it's an array
              education: Array.isArray(profileData.education)
                ? profileData.education.filter(edu => edu && (edu.degree || edu.institution || edu.year))
                : (Array.isArray(jsonData.education) ? jsonData.education : (user.education || [])),
              // Handle experience - ensure it's an array
              experience: Array.isArray(profileData.experience)
                ? profileData.experience.filter(exp => exp && (exp.title || exp.company || exp.duration))
                : (Array.isArray(jsonData.experience) ? jsonData.experience : (user.experience || [])),
              experienceLevel: profileData.experienceLevel || jsonData.experienceLevel || (profileData.experience === 'fresher' ? 'Fresher' : 'Experienced'),
              logo: profileData.logo || profileData.profile_image || user.logo || '',
              resume: profileData.resume
                || profileData.resumeUrl
                || profileData.resumeFile?.resumeUrl
                || profileData.resumeFile?.url
                || (typeof profileData.resumeFile === 'string' ? profileData.resumeFile : null)
                || user.resume
                || user.resumeUrl
                || null
            };

            console.log('Final normalized user data with logo:', normalizedData.logo);
          } else {
            console.warn('Profile fetch failed after update, keeping form data');
          }
        } catch (fetchError) {
          console.error('Error fetching updated profile:', fetchError);
          // Keep normalizedData with existing data
        }

        // Update user context with normalized data (includes processed image URL)
        updateUser(normalizedData);

        // Update form data with the normalized data from API
        setFormData({
          full_name: normalizedData.full_name || '',
          phone_number: normalizedData.phone_number || '',
          dob: (() => {
            try {
              if (normalizedData.dob) {
                // Handle different date formats from API
                let date = normalizedData.dob;
                // If it's already in YYYY-MM-DD format, use it directly
                if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                  return date;
                }
                // Otherwise parse it and format it
                const parsed = new Date(date);
                if (!isNaN(parsed.getTime())) {
                  // Ensure it's in local timezone for consistent display
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
          resume: normalizedData.resume
            || normalizedData.resumeUrl
            || normalizedData.resumeFile?.resumeUrl
            || normalizedData.resumeFile?.url
            || (typeof normalizedData.resumeFile === 'string' ? normalizedData.resumeFile : null)
            || null,
          education: Array.isArray(normalizedData.education) ? normalizedData.education : [{ degree: '', institution: '', year: '' }],
          experience: Array.isArray(normalizedData.experience) ? normalizedData.experience : [{ title: '', company: '', duration: '' }],
          skills: normalizedData.skills || ''
        });

        console.log('Form data updated with logo:', normalizedData.logo);
        setSuccess('Profile updated successfully');
        // Mark all steps as completed
        setCompletedSteps([0, 1, 2, 3, 4]);

        // Check if profile is now complete
        const isComplete = checkProfileComplete(normalizedData);
        setProfileComplete(isComplete);
            setCompletedSteps(isComplete ? [0, 1] : []);
            // Keep in edit mode after saving, don't automatically switch to view mode

        // Update completion percentage in real-time by triggering a recalculation
        // The CandidateHome component will pick up the updated user context
        setTimeout(() => {
          setSuccess(''); // Clear success message after 3 seconds
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

// Combined form grid layout
const renderBasicInformationForm = () => (
  <div className={styles.stepContent}>
    <h3 className={styles.stepTitle}>Basic Information</h3>
    <p className={styles.stepDescription}>Tell us about yourself to get started.</p>

    <div className={styles.formGrid}>
      {/* Personal Information */}
      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label>Full Name *</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          className={validationErrors.full_name ? styles.inputError : ''}
          required
        />
        {validationErrors.full_name && (
          <div className={styles.errorMessage}>
            <AlertCircle size={14} />
            {validationErrors.full_name}
          </div>
        )}
      </div>

        <div className={styles.formGroup}>
          <label>Profile Image</label>
          <div className={styles.uploadImageContainer}>
            <div
              className={styles.logoPreview}
              onClick={() => logoInputRef.current?.click()}
              style={{ cursor: 'pointer' }}
              title="Click to upload profile image"
            >
              {formData.logo ? (
                <>
                  {console.log('Rendering logo image:', formData.logo)}
                  <img src={formData.logo} alt="Profile" className={styles.logoImage} />
                </>
              ) : (
                <div className={styles.logoInitials}>
                  {getInitials(formData.full_name || user?.full_name)}
                </div>
              )}
              <div className={styles.uploadOverlay}>
                <div className={styles.uploadIcon}>+</div>
                <div className={styles.uploadText}>Upload Image</div>
              </div>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleLogoChange}
            className={styles.fileInput}
            style={{ display: 'none' }}
          />
          <small className={styles.fileHelp}>Click on the image to upload. Accepted formats: JPEG, PNG, GIF (Max 2MB)</small>
          {validationErrors.logo && (
            <div className={styles.errorMessage}>
              <AlertCircle size={14} />
              {validationErrors.logo}
            </div>
          )}
        </div>

      <div className={styles.formGroup}>
        <label>Phone Number</label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
          placeholder="+1 (555) 123-4567"
        />
      </div>

 

      <div className={styles.formGroup}>
        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleInputChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleInputChange}
          max={todayForDateInput}
        />
        {validationErrors.dob && (
          <div className={styles.errorMessage}>
            <AlertCircle size={14} />
            {validationErrors.dob}
          </div>
        )}
      </div>

      {/* Address Information */}
      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label>Street Address</label>
        <input
          type="text"
          name="street"
          value={formData.address.street}
          onChange={handleAddressChange}
          placeholder="123 Main St"
        />
      </div>

      <div className={styles.formGroup}>
        <label>City *</label>
        <input
          type="text"
          name="city"
          value={formData.address.city}
          onChange={handleAddressChange}
          placeholder="New York"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>State/Province *</label>
        <input
          type="text"
          name="state"
          value={formData.address.state}
          onChange={handleAddressChange}
          placeholder="NY"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>ZIP/Postal Code</label>
        <input
          type="text"
          name="zip"
          value={formData.address.zip}
          onChange={handleAddressChange}
          placeholder="10001"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Country *</label>
        <select
          name="country"
          value={formData.address.country}
          onChange={handleAddressChange}
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

      {/* Professional Information */}
      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label>Professional Bio *</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows="4"
          placeholder="Tell us about your professional background, interests, and career goals..."
          required
        />
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label>Skills *</label>
        <div className={styles.skillsContainer}>
          <div className={styles.skillsInputWrapper}>
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
              name="skills"
              placeholder="Type a skill and press Enter or Add"
              className={validationErrors.skills || (!getSkillsArray().length && touchedFields.skills) ? styles.inputError : ''}
            />
            <button
              type="button"
              className={styles.addSkillBtn}
              onClick={addSkill}
              disabled={!currentSkillInput.trim()}
            >
              +
            </button>
          </div>
          <div className={styles.skillTags}>
            {getSkillsArray().map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
                <button
                  type="button"
                  className={styles.removeSkillBtn}
                  onClick={() => removeSkill(skill)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        {(validationErrors.skills || (!getSkillsArray().length && touchedFields.skills)) && (
          <div className={styles.errorMessage}>
            <AlertCircle size={14} />
            {validationErrors.skills || 'At least one skill is required'}
          </div>
        )}
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label>Resume/CV</label>
        <div className={styles.resumeUploadSection}>
          {user?.resumeUrl && (
            <div className={styles.currentResumeContainer}>
              <div className={styles.currentResumeInfo}>
                <FileText size={16} className={styles.resumeIcon} />
                <div className={styles.resumeDetails}>
                  <span className={styles.resumeLabel}>Current Resume</span>
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.resumeLink}
                  >
                    View/Download Resume
                  </a>
                </div>
                <button
                  type="button"
                  className={styles.removeResumeBtn}
                  onClick={removeResume}
                  title="Remove current resume"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          <div className={styles.uploadResumeContainer}>
            <input
              type="file"
              name="resume"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className={styles.resumeInput}
            />
            <div className={styles.resumeHelp}>
              {!user?.resumeUrl ? (
                <span>Choose file to upload</span>
              ) : (
                <span>Choose a different file to replace</span>
              )}
              <small className={styles.fileFormats}>Accepted: PDF, DOC, DOCX (Max 5MB)</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const renderBackgroundForm = () => (
  <div className={styles.stepContent}>
    <h3 className={styles.stepTitle}>Education & Experience</h3>
    <p className={styles.stepDescription}>Share your academic and professional background.</p>

    {/* Education Section */}
    <div className={styles.sectionHeader}>
      <GraduationCap size={18} />
      <span>Education</span>
    </div>
    <div className={styles.dynamicSection}>
      {formData.education.map((edu, index) => (
        <div key={index} className={styles.dynamicGroup}>
          <div className={styles.formGroup}>
            <label>Degree/Course *</label>
            <input
              type="text"
              name="degree"
              value={edu.degree}
              onChange={(e) => handleDynamicChange(e, index, 'education')}
              placeholder="Bachelor of Computer Science"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Institution *</label>
            <input
              type="text"
              name="institution"
              value={edu.institution}
              onChange={(e) => handleDynamicChange(e, index, 'education')}
              placeholder="University Name"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Year</label>
            <input
              type="text"
              name="year"
              value={edu.year}
              onChange={(e) => handleDynamicChange(e, index, 'education')}
              placeholder="2023"
            />
          </div>
          {formData.education.length > 1 && (
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeDynamicField(index, 'education')}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        className={styles.addBtn}
        onClick={() => addDynamicField('education')}
      >
        + Add Education
      </button>
    </div>

    {/* Experience Level Dropdown */}
    <div className={styles.formGroup}>
      <label>Experience Level</label>
      <select name="experienceLevel" value={formData.experienceLevel} onChange={handleInputChange}>
        <option value="Experienced">Experienced</option>
        <option value="Fresher">Fresher</option>
      </select>
    </div>

    {formData.experienceLevel === 'Experienced' && (
      <>
        {/* Experience Section */}
        <div className={styles.sectionHeader}>
          <Award size={18} />
          <span>Work Experience</span>
        </div>
        <div className={styles.dynamicSection}>
          {formData.experience.map((exp, index) => (
            <div key={index} className={styles.dynamicGroup}>
              <div className={styles.formGroup}>
                <label>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={exp.title}
                  onChange={(e) => handleDynamicChange(e, index, 'experience')}
                  placeholder="Software Developer"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Company *</label>
                <input
                  type="text"
                  name="company"
                  value={exp.company}
                  onChange={(e) => handleDynamicChange(e, index, 'experience')}
                  placeholder="Company Name"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={exp.duration}
                  onChange={(e) => handleDynamicChange(e, index, 'experience')}
                  placeholder="2020 - 2023"
                />
              </div>
              {formData.experience.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeDynamicField(index, 'experience')}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className={styles.addBtn}
            onClick={() => addDynamicField('experience')}
          >
            + Add Experience
          </button>
        </div>
      </>
    )}
  </div>
);

const renderStepContent = () => {
  switch (currentStep) {
    case 0: // Basic Information (Personal + Address + Professional)
      return renderBasicInformationForm();

    case 1: // Education & Experience
      return renderBackgroundForm();

    default:
      return null;
  }
};

  // Render profile view when complete and not in edit mode
  const renderProfileView = () => {
    if (!profileComplete || isEditMode) return null;

    return (
      <div className={styles.profileView}>
        <div className={styles.profileHeader}>
          <div className={styles.profileTitle}>
            <div className={styles.logoWrapper}>
              {formData.logo ? (
                <img src={formData.logo} alt="Profile" className={styles.logoImage} />
              ) : (
                <div className={styles.logoInitials}>
                  {getInitials(formData.full_name || user?.full_name)}
                </div>
              )}
            </div>
            <h1>My Profile</h1>
            <button 
              className={styles.editButton}
              onClick={() => setIsEditMode(true)}
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        <div className={styles.profileSections}>
          {/* Personal Information */}
          <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>
              <User size={20} />
              Personal Information
            </h2>
            <div className={styles.profileGrid}>
              <div className={styles.profileField}>
                <label>Full Name</label>
                <p>{formData.full_name || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Email</label>
                <p>{user?.email || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Phone Number</label>
                <p>{formData.phone_number || 'Not provided'}</p>
              </div>
            
              <div className={styles.profileField}>
                <label>Date of Birth</label>
                <p>{(() => {
                  try {
                    if (formData.dob && formData.dob.trim()) {
                      let dateValue = formData.dob.trim();

                      // Handle different date formats
                      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                        // Already in YYYY-MM-DD format
                        const date = new Date(dateValue);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                        }
                      } else {
                        // Try parsing other date formats
                        const date = new Date(dateValue);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                        }
                      }

                      // If parsing failed, return the original value
                      return dateValue;
                    }
                  } catch (error) {
                    console.error('DOB display error:', error, formData.dob);
                  }
                  return 'Not provided';
                })()}</p>
              </div>
              <div className={styles.profileField}>
                <label>Gender</label>
                <p>{formData.gender || 'Not provided'}</p>
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
                <p>{formData.address?.street || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>City</label>
                <p>{formData.address?.city || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>State/Province</label>
                <p>{formData.address?.state || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>ZIP/Postal Code</label>
                <p>{formData.address?.zip || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Country</label>
                <p>{getCountryDisplayName(formData.address?.country)}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>
              <Briefcase size={20} />
              Professional Information
            </h2>
            <div className={styles.profileGrid}>
              <div className={`${styles.profileField} ${styles.fullWidth}`}>
                <label>Bio</label>
                <p className={styles.bioText}>{formData.bio || 'Not provided'}</p>
              </div>
              <div className={`${styles.profileField} ${styles.fullWidth}`}>
                <label>Skills</label>
                <div className={styles.skillsList}>
                  {formData.skills ? (
                    formData.skills.split(',').map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <p>Not provided</p>
                  )}
                </div>
              </div>
              {typeof formData.resume === 'string' && formData.resume && (
                <div className={`${styles.profileField} ${styles.fullWidth}`}>
                  <label>Resume</label>
                  <div className={styles.resumeContainer}>
                    <FileText size={16} className={styles.resumeIcon} />
                    <a href={formData.resume} target="_blank" rel="noopener noreferrer" className={styles.resumeLink}>
                      View Resume
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {formData.education && formData.education.length > 0 && formData.education.some(edu => edu.degree || edu.institution) && (
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>
                <GraduationCap size={20} />
                Education
              </h2>
              <div className={styles.listSection}>
                {formData.education
                  .filter(edu => edu.degree || edu.institution)
                  .map((edu, index) => (
                    <div key={index} className={styles.listItem}>
                      <h3>{edu.degree || 'Degree not specified'}</h3>
                      <p className={styles.institution}>{edu.institution || 'Institution not specified'}</p>
                      {edu.year && <p className={styles.year}>{edu.year}</p>}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {(formData.experienceLevel === 'Fresher' || (formData.experience && formData.experience.length > 0 && formData.experience.some(exp => exp.title || exp.company))) && (
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>
                <Award size={20} />
                Work Experience
              </h2>
              <div className={styles.listSection}>
                {formData.experienceLevel === 'Fresher' ? (
                  <div className={styles.listItem}>
                    <h3>Fresher Candidate</h3>
                  </div>
                ) : (
                  formData.experience
                    .filter(exp => exp.title || exp.company)
                    .map((exp, index) => (
                      <div key={index} className={styles.listItem}>
                        <h3>{exp.title || 'Title not specified'}</h3>
                        <p className={styles.company}>{exp.company || 'Company not specified'}</p>
                        {exp.duration && <p className={styles.duration}>{exp.duration}</p>}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.container}`}>
      {profileComplete && !isEditMode ? (
        renderProfileView()
      ) : (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {profileComplete ? 'Edit Your Profile' : 'Complete Your Profile'}
            </h1>
            <p className={styles.subtitle}>
              {profileComplete ? 'Update your profile information' : 'Fill in your details step by step'}
            </p>
            {profileComplete && (
              <button
                className={styles.cancelEditButton}
                onClick={() => setIsEditMode(false)}
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = completedSteps.includes(index);
                const isCurrent = index === currentStep;

                return (
                  <div
                    key={step.id}
                    className={`${styles.progressStep} ${isCurrent ? styles.current : ''} ${isCompleted ? styles.completed : ''}`}
                    onClick={() => goToStep(index)}
                  >
                    <div className={styles.stepIcon}>
                      {isCompleted ? <Check size={16} /> : <StepIcon size={16} />}
                    </div>
                    <div className={styles.stepText}>
                      <div className={styles.stepTitle}>{step.title}</div>
                      <div className={styles.stepDescription}>{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className={styles.formContainer}>
            {error && (
              <div className={styles.alert} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                {error}
              </div>
            )}
            {success && (
              <div className={styles.alert} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                {success}
              </div>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className={styles.navigation}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className={styles.stepIndicator}>
                Step {currentStep + 1} of {steps.length}
              </div>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.primary}`}
                  onClick={nextStep}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.primary} ${styles.final}`}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileManagement;
