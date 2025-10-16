import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { recruiterService } from '../../services/recruiterService';

const RecruiterProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    companySize: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      recruiterService.getProfile(user.email)
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
      const response = await recruiterService.updateProfile(user.email, formData);
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
      <h2>Recruiter Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Company Name</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} />
        </div>
        <div>
          <label>Contact Person</label>
          <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} />
        </div>
        <div>
          <label>Phone Number</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
        </div>
        <div>
          <label>Company Size</label>
          <select name="companySize" value={formData.companySize} onChange={handleInputChange}>
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default RecruiterProfile;
