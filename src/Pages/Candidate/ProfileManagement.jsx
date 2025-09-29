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
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      studentService.getProfile(user.email)
        .then(response => {
          if (response.success && response.data) {
            const { data } = response;
            setFormData({
              full_name: data.full_name || '',
              phone_number: data.phone_number || '',
              username: data.username || '',
              dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
              gender: data.gender || '',
              address: {
                street: data.address?.street || '',
                city: data.address?.city || '',
                state: data.address?.state || '',
                zip: data.address?.zip || '',
                country: data.address?.country || ''
              },
              profile_image: data.profile_image || '',
              bio: data.bio || ''
            });
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

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      address: { ...formData.address, [name]: value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await studentService.updateProfile(user.email, formData);
      if (response.success) {
        updateUser(response.data);
        setSuccess('Profile updated successfully');
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating the profile');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.profileHeader}>Profile Management</h2>
      <form onSubmit={handleSubmit} className={styles.profileForm}>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
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
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>Bio</label>
          <textarea name="bio" value={formData.bio} onChange={handleInputChange}></textarea>
        </div>
        <button type="submit" className={styles.submitButton}>Update Profile</button>
      </form>
    </div>
  );
};

export default ProfileManagement;
