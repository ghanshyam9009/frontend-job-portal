import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { studentService } from '../../services/studentService';
import { ChevronLeft, ChevronRight, Check, User, MapPin, Briefcase, GraduationCap, Award } from 'lucide-react';
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
    profile_image: '',
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
      fields: ['profile_image', 'bio', 'skills']
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

  useEffect(() => {
    if (user) {
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
        profile_image: user.profile_image || '',
        bio: user.bio || '',
        resume: user.resume || null,
        education: Array.isArray(user.education) && user.education.length > 0 ? user.education : [{ degree: '', institution: '', year: '' }],
        experience: Array.isArray(user.experience) && user.experience.length > 0 ? user.experience : [{ title: '', company: '', duration: '' }],
        skills: user.skills || ''
      });
    }
  }, [user]);

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

  const handleFileChange = (e) => {
    setFormData({ ...formData, resume: e.target.files[0] });
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

  const nextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep(currentStep + 1);
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

    // Create a new FormData object to handle file uploads
    const dataToSubmit = new FormData();
    for (const key in formData) {
      if (key === 'resume' && formData.resume instanceof File) {
        dataToSubmit.append(key, formData.resume);
      } else if (typeof formData[key] === 'object' && formData[key] !== null) {
        dataToSubmit.append(key, JSON.stringify(formData[key]));
      } else {
        dataToSubmit.append(key, formData[key]);
      }
    }

    try {
      const response = await studentService.updateProfile(user.email, dataToSubmit);
      if (response.success) {
        updateUser(response.data);
        setSuccess('Profile updated successfully');
        // Mark all steps as completed
        setCompletedSteps([0, 1, 2, 3, 4]);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating the profile');
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
                  required
                />
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
                <label>Profile Image URL</label>
                <input
                  type="url"
                  name="profile_image"
                  value={formData.profile_image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/profile.jpg"
                />
              </div>

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

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Complete Your Profile</h1>
        <p className={styles.subtitle}>Fill in your details step by step</p>
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
    </div>
  );
};

export default ProfileManagement;
