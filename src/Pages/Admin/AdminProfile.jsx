import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { adminService } from '../../services/adminService';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      adminService.getProfile(user.email)
        .then(response => {
          if (response.success && response.data) {
            setFormData(response.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await adminService.updateProfile(user.email, formData);
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
    <div>
      <h2>Admin Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default AdminProfile;
