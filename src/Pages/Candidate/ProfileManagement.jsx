import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { studentService } from '../../services/studentService';
import { ChevronLeft, ChevronRight, Check, User, MapPin, Briefcase, GraduationCap, Award, AlertCircle, Edit, Mail, Phone, Calendar, Globe } from 'lucide-react';
import styles from './ProfileManagement.module.css';

const ProfileManagement = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    username: '',
    dob: '',
    gender: '',
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
    skills: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  const steps = [
    {
      id: 'personal',
      title: 'Personal Info',
      description: 'Basic personal details',
      icon: User,
      fields: ['full_name', 'phone_number', 'username', 'dob', 'gender']
    },
    {
      id: 'address',
      title: 'Address',
      description: 'Your location details',
      icon: MapPin,
      fields: ['address.street', 'address.city', 'address.state', 'address.zip', 'address.country']
    },
    {
      id: 'professional',
      title: 'Professional',
      description: 'Bio and professional info',
      icon: Briefcase,
      fields: ['bio', 'skills']
    },
    {
      id: 'education',
      title: 'Education',
      description: 'Academic background',
      icon: GraduationCap,
      fields: ['education']
    },
    {
      id: 'experience',
      title: 'Experience',
      description: 'Work experience',
      icon: Award,
      fields: ['experience']
    }
  ];

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

      case 'username':
        if (value && (value.length < 3 || value.length > 20)) {
          error = 'Username must be between 3 and 20 characters';
        } else if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;

      case 'dob':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 16) {
            error = 'You must be at least 16 years old';
          } else if (age > 100) {
            error = 'Please enter a valid date of birth';
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
      } else {
        value = formData[field];
      }

      const error = validateField(field, value);
      if (error && (!touchedFields[fieldName] || value)) {
        errors[fieldName] = error;
      }
    });

    if (stepIndex === 0) {
      // Personal info validation
      if (!formData.full_name.trim()) {
        errors.full_name = 'Full name is required';
      }
    }

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

  // Check if profile is complete
  const checkProfileComplete = (data) => {
    const hasName = data.full_name && data.full_name.trim();
    const hasPhone = data.phone_number && data.phone_number.trim();
    const hasGender = data.gender && data.gender.trim();
    const hasCity = data.address?.city && data.address.city.trim();
    const hasState = data.address?.state && data.address.state.trim();
    const hasCountry = data.address?.country && data.address.country.trim();
    const hasBio = data.bio && data.bio.trim();
    const hasSkills = data.skills && data.skills.trim();
    const hasEducation = Array.isArray(data.education) && data.education.length > 0 && 
      data.education.some(edu => edu.degree?.trim() && edu.institution?.trim());
    const hasExperience = Array.isArray(data.experience) && data.experience.length > 0 && 
      data.experience.some(exp => exp.title?.trim() && exp.company?.trim());
    
    return hasName && hasPhone && hasGender && hasCity && hasState && hasCountry && 
           hasBio && hasSkills && hasEducation && hasExperience;
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          // Fetch latest profile data using the new API endpoint
          const profileResponse = await studentService.fetchProfileDetails(user.email);
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data;
            const loadedData = {
              full_name: profileData.full_name || user.full_name || '',
              phone_number: profileData.phone_number || user.phone_number || '',
              username: profileData.username || user.username || '',
              dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
              gender: profileData.gender || user.gender || '',
              address: {
                street: profileData.address?.street || user.address?.street || '',
                city: profileData.address?.city || user.address?.city || '',
                state: profileData.address?.state || user.address?.state || '',
                zip: profileData.address?.zip || user.address?.zip || '',
                country: profileData.address?.country || user.address?.country || ''
              },
              bio: profileData.bio || user.bio || '',
              resume: profileData.resumeUrl || profileData.resume || user.resumeUrl || user.resume || null,
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
                // Handle experience - could be array, string, or missing
                if (Array.isArray(profileData.experience) && profileData.experience.length > 0) {
                  return profileData.experience;
                } else if (typeof profileData.experience === 'string') {
                  try {
                    const parsed = JSON.parse(profileData.experience);
                    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ title: '', company: '', duration: '' }];
                  } catch {
                    return [{ title: '', company: '', duration: '' }];
                  }
                } else if (Array.isArray(user.experience) && user.experience.length > 0) {
                  return user.experience;
                }
                return [{ title: '', company: '', duration: '' }];
              })(),
              skills: profileData.skills || user.skills || ''
            };
            setFormData(loadedData);
            
            // Check if profile is complete
            const isComplete = checkProfileComplete(loadedData);
            setProfileComplete(isComplete);
            setIsEditMode(!isComplete); // Start in edit mode if incomplete, view mode if complete
            } else {
              // Fallback to user context data if API fetch fails
              setFormData({
                full_name: user.full_name || '',
                phone_number: user.phone_number || '',
                username: user.username || '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                gender: user.gender || '',
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
                skills: user.skills || ''
              });
            }
        } catch (error) {
          console.error('Error loading profile data:', error);
          // Fallback to user context data
          setFormData({
            full_name: user.full_name || '',
            phone_number: user.phone_number || '',
            username: user.username || '',
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
            gender: user.gender || '',
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
            skills: user.skills || ''
          });
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const error = validateFileUpload(file);

    setFormData({ ...formData, resume: file });
    setValidationErrors({ ...validationErrors, resume: error });

    // Mark field as touched
    setTouchedFields({ ...touchedFields, resume: true });
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
      experience: { title: '', company: '', duration: '' }
    };
    setFormData({ ...formData, [type]: [...formData[type], fields[type]] });
  };

  const removeDynamicField = (index, type) => {
    const list = [...formData[type]];
    list.splice(index, 1);
    setFormData({ ...formData, [type]: list });
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
      const submitData = {
        ...formData,
        // Filter out empty education entries, but keep at least one if all are empty
        education: formData.education.filter(edu => 
          edu.degree?.trim() || edu.institution?.trim() || edu.year?.trim()
        ).length > 0 
          ? formData.education.filter(edu => edu.degree?.trim() || edu.institution?.trim() || edu.year?.trim())
          : formData.education,
        // Filter out empty experience entries
        experience: formData.experience.filter(exp => 
          exp.title?.trim() || exp.company?.trim() || exp.duration?.trim()
        ).length > 0
          ? formData.experience.filter(exp => exp.title?.trim() || exp.company?.trim() || exp.duration?.trim())
          : formData.experience
      };

      console.log('Submitting profile data:', submitData);

      const response = await studentService.updateProfileDetails(user.email, submitData);
      console.log('Update response:', response);

      if (response.success) {
        // Wait a bit for the backend to process
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Initialize normalizedData with form data as fallback
        let normalizedData = {
          ...user,
          ...submitData
        };
        
        // Fetch the latest profile data to ensure we have the complete, correctly formatted data
        try {
          const profileResponse = await studentService.fetchProfileDetails(user.email);
          console.log('Fetched latest profile response:', profileResponse);
          
          if (profileResponse.success && profileResponse.data) {
            // Handle different API response structures
            // Some APIs return {student: {...}} while others return data directly
            const profileData = profileResponse.data.student || profileResponse.data;
            console.log('Profile data received:', profileData);
            
            if (profileData) {
              // Normalize the data structure - handle different possible formats
              normalizedData = {
                ...user,
                full_name: profileData.full_name || profileData.fullName || user.full_name || submitData.full_name || '',
                phone_number: profileData.phone_number || profileData.phoneNumber || user.phone_number || submitData.phone_number || '',
                username: profileData.username || user.username || submitData.username || '',
                dob: profileData.dob || user.dob || submitData.dob || '',
                gender: profileData.gender || user.gender || submitData.gender || '',
                bio: profileData.bio || user.bio || submitData.bio || '',
                skills: profileData.skills || user.skills || submitData.skills || '',
                // Handle address - could be object or nested
                address: profileData.address || (profileData.address_city ? {
                  street: profileData.address_street || user.address?.street || submitData.address?.street || '',
                  city: profileData.address_city || user.address?.city || submitData.address?.city || '',
                  state: profileData.address_state || user.address?.state || submitData.address?.state || '',
                  zip: profileData.address_zip || user.address?.zip || submitData.address?.zip || '',
                  country: profileData.address_country || user.address?.country || submitData.address?.country || ''
                } : (user.address || submitData.address || {})),
                // Handle education - ensure it's an array
                education: Array.isArray(profileData.education) 
                  ? profileData.education.filter(edu => edu && (edu.degree || edu.institution || edu.year))
                  : (Array.isArray(submitData.education) ? submitData.education : (user.education || [])),
                // Handle experience - ensure it's an array
                experience: Array.isArray(profileData.experience)
                  ? profileData.experience.filter(exp => exp && (exp.title || exp.company || exp.duration))
                  : (Array.isArray(submitData.experience) ? submitData.experience : (user.experience || [])),
                resume: profileData.resume || profileData.resumeUrl || user.resume || user.resumeUrl || submitData.resume || null
              };
              
              console.log('Normalized user data:', normalizedData);
            }
          } else {
            console.warn('Profile fetch failed, using form data directly');
          }
        } catch (fetchError) {
          console.error('Error fetching updated profile:', fetchError);
          // normalizedData already has form data as fallback
        }

        // Update user context with normalized data
        updateUser(normalizedData);

        setSuccess('Profile updated successfully');
        // Mark all steps as completed
        setCompletedSteps([0, 1, 2, 3, 4]);
        
        // Check if profile is now complete
        const isComplete = checkProfileComplete(normalizedData);
        setProfileComplete(isComplete);
        setIsEditMode(!isComplete); // Switch to view mode if complete

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Personal Information</h3>
            <p className={styles.stepDescription}>Tell us about yourself to get started.</p>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
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
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
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
            </div>
          </div>
        );

      case 1: // Address
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Address Information</h3>
            <p className={styles.stepDescription}>Where are you located?</p>

            <div className={styles.formGrid}>
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
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  placeholder="New York"
                />
              </div>

              <div className={styles.formGroup}>
                <label>State/Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  placeholder="NY"
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
                <label>Country</label>
                <select
                  name="country"
                  value={formData.address.country}
                  onChange={handleAddressChange}
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
            </div>
          </div>
        );

      case 2: // Professional
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Professional Information</h3>
            <p className={styles.stepDescription}>Share your professional background and skills.</p>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about your professional background, interests, and career goals..."
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="JavaScript, React, Node.js, Python"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Resume/CV</label>
                {user?.resumeUrl && (
                  <div className={styles.currentResume}>
                    <p>Current Resume: <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                  </div>
                )}
                <input
                  type="file"
                  name="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                <small className={styles.fileHelp}>Accepted formats: PDF, DOC, DOCX (Max 5MB)</small>
              </div>
            </div>
          </div>
        );

      case 3: // Education
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Education</h3>
            <p className={styles.stepDescription}>Share your educational background.</p>

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
          </div>
        );

      case 4: // Experience
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Work Experience</h3>
            <p className={styles.stepDescription}>Share your professional experience.</p>

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
          </div>
        );



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
                <label>Username</label>
                <p>{formData.username || 'Not provided'}</p>
              </div>
              <div className={styles.profileField}>
                <label>Date of Birth</label>
                <p>{formData.dob ? new Date(formData.dob).toLocaleDateString() : 'Not provided'}</p>
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
                <p>{formData.address?.country || 'Not provided'}</p>
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
              {formData.resume && (
                <div className={`${styles.profileField} ${styles.fullWidth}`}>
                  <label>Resume</label>
                  <p>
                    <a href={formData.resume} target="_blank" rel="noopener noreferrer" className={styles.resumeLink}>
                      View Resume
                    </a>
                  </p>
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
          {formData.experience && formData.experience.length > 0 && formData.experience.some(exp => exp.title || exp.company) && (
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>
                <Award size={20} />
                Work Experience
              </h2>
              <div className={styles.listSection}>
                {formData.experience
                  .filter(exp => exp.title || exp.company)
                  .map((exp, index) => (
                    <div key={index} className={styles.listItem}>
                      <h3>{exp.title || 'Title not specified'}</h3>
                      <p className={styles.company}>{exp.company || 'Company not specified'}</p>
                      {exp.duration && <p className={styles.duration}>{exp.duration}</p>}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.dark : ''}`}>
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
