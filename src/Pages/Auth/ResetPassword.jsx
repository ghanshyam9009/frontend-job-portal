import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../Contexts/ThemeContext';
import styles from '../../Styles/Auth.module.css';
import { studentService } from '../../services/studentService';
import HomeNav from '../../Components/HomeNav';
import logo from '/favicon-icon.png';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const extractErrorMessage = (errorObj) => {
    const normalize = (value) => {
      if (!value) return "";
      if (typeof value === "string") return value;
      if (Array.isArray(value)) {
        return value
          .map((item) => normalize(item))
          .filter(Boolean)
          .join(" ");
      }
      if (typeof value === "object") {
        return Object.values(value || {})
          .map((item) => normalize(item))
          .filter(Boolean)
          .join(" ");
      }
      return "";
    };

    if (!errorObj) return "";
    if (typeof errorObj === "string") return errorObj;

    return (
      normalize(errorObj.message) ||
      normalize(errorObj.details) ||
      normalize(errorObj.error) ||
      normalize(errorObj?.error?.message) ||
      normalize(errorObj?.response?.data?.message) ||
      normalize(errorObj?.response?.data?.error) ||
      ""
    );
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }
    const result = await studentService.sendOtp({ email: formData.email, role: 'student' });

    if (result.success) {
      setStep('verify-otp');
      setSuccess('OTP sent to your email address.');
      setError('');
      setTimer(60); // 60 seconds timer
    } else {
      console.error('Send OTP error:', result.error);
      const rawError = result.error?.raw || result.error;
      const errorMessage = extractErrorMessage(rawError) || 'Failed to send OTP. Please try again.';
      const normalizedMessage = errorMessage.toLowerCase();
      const isEmailNotFound =
        normalizedMessage.includes('not found') ||
        normalizedMessage.includes('not exist') ||
        normalizedMessage.includes('not registered') ||
        normalizedMessage.includes('does not exist') ||
        normalizedMessage.includes('no account') ||
        normalizedMessage.includes('email not found') ||
        normalizedMessage.includes('candidate not found') ||
        normalizedMessage.includes('invalid email') ||
        normalizedMessage.includes('user not found');

      if (isEmailNotFound) {
        setError("This email address is not registered or does not exist. Please check your email or register first.");
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      setError('Please enter the OTP.');
      return;
    }
    const result = await studentService.verifyOtp({ email: formData.email, otp: formData.otp, role: 'student' });

    if (result.success) {
      setStep('reset-password');
      setSuccess('OTP verified successfully.');
      setError('');
    } else {
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

    const response = await studentService.resetPassword({
      email: formData.email,
      otp: formData.otp,
      newPassword: formData.password,
      role: 'student'
    });

    if (response.success) {
      setSuccess('Password has been reset successfully. You can now log in with your new password.');
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/candidate/login');
      }, 3000);
    } else {
      setError(response.message || 'Failed to reset password');
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
              className={`${styles.submitBtn} ${styles.resendBtn}`}
              onClick={handleSendOtp}
              disabled={timer > 0}
            >
              {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
            </button>
          </>
        );
      case 'reset-password':
        return (
          <form onSubmit={handleResetPassword}>
            <div className={styles.inputGroup}>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="New Password"
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm New Password"
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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
