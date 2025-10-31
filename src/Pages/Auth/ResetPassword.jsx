import React, { useState, useEffect } from 'react';
import { useTheme } from '../../Contexts/ThemeContext';
import styles from '../../Styles/Auth.module.css';
import { studentService } from '../../services/studentService';
import HomeNav from '../../Components/HomeNav';
import logo from '/favicon-icon.png';

const ResetPassword = () => {
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('send-otp'); // 'send-otp', 'verify-otp', 'reset-password'
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      await studentService.sendOtp({ email: formData.email, role: 'student' });
      setStep('verify-otp');
      setSuccess('OTP sent to your email address.');
      setError('');
      setTimer(60); // 60 seconds timer
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      setError('Please enter the OTP.');
      return;
    }
    try {
      await studentService.verifyOtp({ email: formData.email, otp: formData.otp, role: 'student' });
      setStep('reset-password');
      setSuccess('OTP verified successfully.');
      setError('');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await studentService.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.password,
        role: 'student'
      });
      if (response.success) {
        setSuccess('Password has been reset successfully. You can now log in with your new password.');
        setStep('send-otp');
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          otp: ''
        });
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred while resetting the password');
    }
  };


  const renderForm = () => {
    switch (step) {
      case 'send-otp':
        return (
          <>
            <div className={styles.inputGroup}>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className={styles.input} required />
            </div>
            <button type="button" className={styles.submitBtn} onClick={handleSendOtp}>Send OTP</button>
          </>
        );
      case 'verify-otp':
        return (
          <>
            <div className={styles.inputGroup}>
              <input type="text" name="otp" value={formData.otp} onChange={handleInputChange} placeholder="OTP" className={styles.input} required />
            </div>
            <button type="button" className={styles.submitBtn} onClick={handleVerifyOtp}>Verify OTP</button>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleSendOtp}
              disabled={timer > 0}
              style={{ marginTop: '1rem', backgroundColor: timer > 0 ? '#ccc' : '#4a5568' }}
            >
              {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
            </button>
          </>
        );
      case 'reset-password':
        return (
          <form onSubmit={handleResetPassword}>
            <div className={styles.inputGroup}>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="New Password" className={styles.input} required />
            </div>
            <div className={styles.inputGroup}>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm New Password" className={styles.input} required />
            </div>
            <button type="submit" className={styles.submitBtn}>Reset Password</button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <HomeNav />
      <div className={styles.leftPanel}>
        <div className={styles.header}>
          <img src={logo} alt="logo" className={styles.logo} />
          <h1 className={styles.companyName}>Bigsources.in</h1>

        </div>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Reset Password</h1>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
          {renderForm()}
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.overlay}></div>
        <div className={styles.overlayContent}>
          <h2 className={styles.overlayTitle}>858 Open jobs waiting for you</h2>
          <div className={styles.statsContainer}>
            <div className={styles.statBox}>
              <div className={styles.statIcon}>💼</div>
              <div className={styles.statNumber}>856</div>
              <div className={styles.statLabel}>Live Jobs</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statIcon}>🏢</div>
              <div className={styles.statNumber}>729</div>
              <div className={styles.statLabel}>Companies</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statNumber}>1496</div>
              <div className={styles.statLabel}>Candidates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
