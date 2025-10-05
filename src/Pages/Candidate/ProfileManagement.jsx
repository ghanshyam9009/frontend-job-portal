import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { studentService } from '../../services/studentService';
import styles from './ProfileManagement.module.css';

const ProfileManagement = () => {
  const { user, updateUser } = useAuth();
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
        education: user.education || [{ degree: '', institution: '', year: '' }],
        experience: user.experience || [{ title: '', company: '', duration: '' }],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating the profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.profileHeader}>Profile Management</h2>
      <form onSubmit={handleSubmit} className={styles.profileForm}>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <fieldset className={styles.fieldset}>
          <legend>Personal Information</legend>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Gender</label>
            <input type="text" name="gender" value={formData.gender} onChange={handleInputChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Profile Image URL</label>
            <input type="text" name="profile_image" value={formData.profile_image} onChange={handleInputChange} />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Address</legend>
          <div className={styles.formGroup}>
            <label>Street</label>
            <input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} />
          </div>
          <div className={styles.formGroup}>
            <label>City</label>
            <input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} />
          </div>
          <div className={styles.formGroup}>
            <label>State</label>
            <input type="text" name="state" value={formData.address.state} onChange={handleAddressChange} />
          </div>
          <div className={styles.formGroup}>
            <label>ZIP Code</label>
            <input type="text" name="zip" value={formData.address.zip} onChange={handleAddressChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Country</label>
            <input type="text" name="country" value={formData.address.country} onChange={handleAddressChange} />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Professional Information</legend>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange}></textarea>
          </div>
          <div className={styles.formGroup}>
            <label>Resume</label>
            <input type="file" name="resume" onChange={handleFileChange} />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Skills (comma-separated)</label>
            <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Education</legend>
          {formData.education.map((edu, index) => (
            <div key={index} className={styles.dynamicGroup}>
              <input type="text" name="degree" placeholder="Degree" value={edu.degree} onChange={(e) => handleDynamicChange(e, index, 'education')} />
              <input type="text" name="institution" placeholder="Institution" value={edu.institution} onChange={(e) => handleDynamicChange(e, index, 'education')} />
              <input type="text" name="year" placeholder="Year" value={edu.year} onChange={(e) => handleDynamicChange(e, index, 'education')} />
              {formData.education.length > 1 && <button type="button" onClick={() => removeDynamicField(index, 'education')}>Remove</button>}
            </div>
          ))}
          <button type="button" onClick={() => addDynamicField('education')}>Add Education</button>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Experience</legend>
          {formData.experience.map((exp, index) => (
            <div key={index} className={styles.dynamicGroup}>
              <input type="text" name="title" placeholder="Job Title" value={exp.title} onChange={(e) => handleDynamicChange(e, index, 'experience')} />
              <input type="text" name="company" placeholder="Company" value={exp.company} onChange={(e) => handleDynamicChange(e, index, 'experience')} />
              <input type="text" name="duration" placeholder="Duration (e.g., 2020-2022)" value={exp.duration} onChange={(e) => handleDynamicChange(e, index, 'experience')} />
              {formData.experience.length > 1 && <button type="button" onClick={() => removeDynamicField(index, 'experience')}>Remove</button>}
            </div>
          ))}
          <button type="button" onClick={() => addDynamicField('experience')}>Add Experience</button>
        </fieldset>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileManagement;
