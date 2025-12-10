import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useTheme } from '../../Contexts/ThemeContext';
import { recruiterService } from '../../services/recruiterService';
import styles from '../../Styles/RecruiterDashboard.module.css'; // Reusing styles, can be updated
import { User, Building, Link as LinkIcon, Calendar, Briefcase, FileText, Edit } from 'lucide-react';

const RecruiterProfile = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    full_name: '',
    phone_number: '',
    company_website: '',
    industry: '',
    company_size: '',
    founded_year: '',
    description: '',
    location: '',
    logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const checkProfileComplete = (data) => {
    const requiredFields = ['company_name', 'full_name', 'phone_number', 'industry', 'company_size', 'description', 'location'];
    return requiredFields.every(field => data[field] && data[field].trim() !== '');
  };

  useEffect(() => {
    if (user && user.email) {
      recruiterService.getProfile(user.email)
        .then(response => {
          if (response.success && response.data) {
            const employerData = response.data.employer || response.data;
            const profileData = {
                company_name: employerData.company_name || user.company_name || '',
                full_name: employerData.full_name || user.full_name || '',
                phone_number: employerData.phone_number || user.phone_number || '',
                company_website: employerData.company_website || '',
                industry: employerData.industry || '',
                company_size: employerData.company_size || '',
                founded_year: employerData.founded_year || '',
                description: employerData.description || '',
                location: employerData.location || user.location || '',
                logo: employerData.logo || user.logo || ''
            };
            setFormData(profileData);
            const isComplete = checkProfileComplete(profileData);
            setProfileComplete(isComplete);
            setIsEditMode(!isComplete);
          }
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch profile');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await recruiterService.updateProfile(user.email, formData);
      console.log('RecruiterProfile - Update response:', response);
      console.log('RecruiterProfile - User before update:', user);

      if (response.success) {
        const rawUpdatedData = response.data.employer || response.data;
        console.log('RecruiterProfile - Raw updated data:', rawUpdatedData);

        // Extract only profile fields to avoid overwriting critical auth fields
        const profileOnlyData = {
          company_name: rawUpdatedData.company_name,
          full_name: rawUpdatedData.full_name,
          phone_number: rawUpdatedData.phone_number,
          company_website: rawUpdatedData.company_website,
          industry: rawUpdatedData.industry,
          company_size: rawUpdatedData.company_size,
          founded_year: rawUpdatedData.founded_year,
          description: rawUpdatedData.description,
          location: rawUpdatedData.location
        };

        console.log('RecruiterProfile - Sending to updateUser:', profileOnlyData);

        // Update user context with profile data only (preserve role, user_id, email, etc.)
        updateUser(profileOnlyData);

        // Update local form state with the profile data
        setFormData(profileOnlyData);

        const isComplete = checkProfileComplete(profileOnlyData);
        setProfileComplete(isComplete);
        setIsEditMode(!isComplete);
        setSuccess('Profile updated successfully');

        // Check user context after update
        console.log('RecruiterProfile - User after update (should be same):', user);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating the profile');
    } finally {
        setLoading(false);
    }
  };
  
  const calculateProfileCompletion = (data) => {
    const fields = [
      'company_name', 'full_name', 'phone_number', 
      'company_size', 'location', 'industry', 'description'
    ];
    const filledFields = fields.filter(field => data[field] && data[field].toString().trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };
  
  const profileCompletionPercentage = calculateProfileCompletion(formData);


  const renderProfileView = () => (
    <div className={styles.profileView}>
        <div className={styles.profileHeader}>
            <div className={styles.profileTitleGroup}>
              {formData.logo && (
                <div className={styles.logoWrapper}>
                  <img src={formData.logo} alt="Company logo" className={styles.logoImage} />
                </div>
              )}
              <h1>Company Profile</h1>
            </div>
            <button onClick={() => setIsEditMode(true)} className={styles.editButton}><Edit size={16} /> Edit Profile</button>
        </div>
        <div className={styles.profileGrid}>
            <div className={styles.profileField}><Building size={16} /><label>Company Name</label><p>{formData.company_name}</p></div>
            <div className={styles.profileField}><User size={16} /><label>Contact Person</label><p>{formData.full_name}</p></div>
            <div className={styles.profileField}><Briefcase size={16} /><label>Industry</label><p>{formData.industry}</p></div>
            <div className={styles.profileField}><User size={16} /><label>Company Size</label><p>{formData.company_size}</p></div>
            <div className={styles.profileField}><Calendar size={16} /><label>Founded Year</label><p>{formData.founded_year}</p></div>
            <div className={styles.profileField}><LinkIcon size={16} /><label>Website</label><p>{formData.company_website ? <a href={formData.company_website} target="_blank" rel="noopener noreferrer">{formData.company_website}</a> : 'N/A'}</p></div>
            <div className={styles.profileField}><FileText size={16} /><label>Description</label><p>{formData.description}</p></div>
        </div>
    </div>
  );

  const renderEditView = () => (
    <form onSubmit={handleSubmit} className={styles.profileForm}>
        <div className={styles.sectionHeader}>
            <h1>{profileComplete ? 'Edit Company Profile' : 'Complete Your Profile'}</h1>
            <p>Keep your company information up to date.</p>
        </div>

        <div className={styles.profileCompletion}>
            <h2>Profile Completion: {profileCompletionPercentage}%</h2>
            <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${profileCompletionPercentage}%` }}></div>
            </div>
        </div>
        
      <div className={styles.formGrid}>
        <div className={styles.formGroup}><label>Company Name *</label><input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} required /></div>
        <div className={styles.formGroup}><label>Contact Person *</label><input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required /></div>
        <div className={styles.formGroup}><label>Phone Number *</label><input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} required /></div>
        <div className={styles.formGroup}><label>Website</label><input type="text" name="company_website" value={formData.company_website} onChange={handleInputChange} /></div>
          <div className={styles.formGroup}>
            <label>Company Logo</label>
            {formData.logo && (
              <div className={styles.logoPreview}>
                <img src={formData.logo} alt="Company logo preview" className={styles.logoImage} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
          </div>
        <div className={styles.formGroup}><label>Industry *</label><input type="text" name="industry" value={formData.industry} onChange={handleInputChange} required /></div>
        <div className={styles.formGroup}><label>Company Size *</label>
            <select name="company_size" value={formData.company_size} onChange={handleInputChange} required>
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
            </select>
        </div>
        <div className={styles.formGroup}><label>Founded Year</label><input type="text" name="founded_year" value={formData.founded_year} onChange={handleInputChange} /></div>
        <div className={styles.formGroup}><label>Location *</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} required /></div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}><label>Company Description *</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" required /></div>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? "Updating..." : "Update Profile"}</button>
        {profileComplete && <button type="button" onClick={() => setIsEditMode(false)} className={styles.cancelBtn}>Cancel</button>}
      </div>
    </form>
  );

  if (loading && !formData.company_name) {
    return (
      <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
        <main className={styles.main}><div className={styles.loadingContainer}><div className={styles.loadingSpinner}></div><h2>Loading Profile...</h2></div></main>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <main className={styles.main}>
        <section className={styles.companyProfileSection}>
          {error && <p className={styles.errorText}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
          {profileComplete && !isEditMode ? renderProfileView() : renderEditView()}
        </section>
      </main>
    </div>
  );
};

export default RecruiterProfile;
