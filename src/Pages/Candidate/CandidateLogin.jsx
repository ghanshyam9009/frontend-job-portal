import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { studentService } from "../../services/studentService";
import { validateForm } from "../../utils/errorHandler";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../config/api";
import styles from "../../Styles/Auth.module.css";
import HomeNav from "../../Components/HomeNav";
import logo from "../../assets/logo.png";
import { Briefcase, Building2, Users, Mail, Lock, Eye, EyeOff, RefreshCcw } from "lucide-react";

const CandidateLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  
  // Get the return URL from navigation state (default: My Applications)
  const from = location.state?.from?.pathname || '/my-applications';
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: ""
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    if (name === 'email' && otpSent && !otpVerified) {
      setOtpSent(false);
      setOtp("");
    }
  };

  const validateLoginForm = () => {
    const rules = {
      email: { required: true, type: 'email', label: 'Email' },
      password: { required: true, type: 'password', label: 'Password' }
    };
    
    return validateForm(formData, rules);
  };

  const validateRegisterForm = () => {
    const rules = {
      fullName: { required: true, minLength: 2, label: 'Full Name' },
      email: { required: true, type: 'email', label: 'Email' },
      phone: { required: true, type: 'phone', label: 'Phone Number' },
      password: { required: true, type: 'password', label: 'Password' },
      confirmPassword: { required: true, label: 'Confirm Password' }
    };
    
    const validationErrors = validateForm(formData, rules);
    
    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    return validationErrors;
  };

  const handleSendOtp = async () => {
    if (isVerifyingEmail) return;
    
    const rules = {
      email: { required: true, type: 'email', label: 'Email' }
    };
    const validationErrors = validateForm(formData, rules);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...validationErrors }));
      return;
    }
    
    setIsVerifyingEmail(true);
    setError("");
    
    try {
      await apiClient.post(API_ENDPOINTS.password.sendOtpRegistration, { 
        email: formData.email, 
        role: "candidate" 
      });
      setOtpSent(true);
      toast.success("OTP sent successfully to your email!");
    } catch (err) {
      console.error("Send OTP failed:", err);
      const errorMessage = err.error || err.message || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (isVerifyingEmail) return;
    
    if (!otp || otp.length < 4) {
      setErrors({ ...errors, otp: "Please enter a valid OTP" });
      return;
    }
    
    setIsVerifyingEmail(true);
    setError("");
    
    try {
      await apiClient.post(API_ENDPOINTS.password.verifyOtpRegistration, { 
        email: formData.email, 
        role: "candidate",
        otp 
      });
      setOtpVerified(true);
      setOtpSent(false);
      toast.success("Email verified successfully! Please set your password.");
      setErrors((prev) => ({ ...prev, otp: "", email: "" }));
    } catch (err) {
      console.error("Verify OTP failed:", err);
      const errorMessage = err.error || err.message || "Invalid OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setError("");

    try {
      if (isLogin) {
        const validationErrors = validateLoginForm();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setLoading(false);
          return;
        }

        const result = await login(formData.email, formData.password, 'candidate');
        if (result.success) {
          navigate(from, { replace: true });
        } else {
          setError("Invalid email or password. Please check your credentials and try again.");
        }
      } else {
        if (!otpVerified) {
          setErrors((prev) => ({ ...prev, email: "Please verify your email first" }));
          setLoading(false);
          return;
        }

        const validationErrors = validateRegisterForm();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setLoading(false);
          return;
        }

        const result = await studentService.register({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
          role: 'Student'
        });

        if (result.success) {
          setIsLogin(true); // Switch to login form
          setFormData({
            email: formData.email,
            password: "",
            confirmPassword: "",
            fullName: "",
            phone: ""
          });
        } else {
          const rawError = result.error?.raw || result.error;
          const errorMessage = extractErrorMessage(rawError) || result.error?.message || '';
          const normalizedMessage = errorMessage.toLowerCase();
          const isDuplicateEmail =
            (normalizedMessage.includes('already') && normalizedMessage.includes('registered')) ||
            (normalizedMessage.includes('already') && normalizedMessage.includes('exist')) ||
            (normalizedMessage.includes('duplicate') && normalizedMessage.includes('email')) ||
            (normalizedMessage.includes('duplicate') && normalizedMessage.includes('user')) ||
            (normalizedMessage.includes('duplicate') && normalizedMessage.includes('account')) ||
            (normalizedMessage.includes('email') && normalizedMessage.includes('taken')) ||
            (normalizedMessage.includes('email') && normalizedMessage.includes('in use')) ||
            normalizedMessage.includes('user already exists') ||
            normalizedMessage.includes('email already exists') ||
            normalizedMessage.includes('account already exists');

          if (isDuplicateEmail) {
            setError("This user is already registered. Please use a different email or try logging in.");
          } else {
            setError(errorMessage || "Registration failed. Please try again.");
          }
        }
      }
    } catch (error) {
      console.error(`${isLogin ? 'Login' : 'Registration'} failed:`, error);
      if (isLogin) {
        setError("Invalid email or password. Please check your credentials and try again.");
      }
      // Error handling is done in the service layer with toastify for registration
    } finally {
      setLoading(false);
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
          <h1 className={styles.title}>{isLogin ? "Candidate Login" : "Candidate Registration"}</h1>
          
          <div className={styles.toggleButtons}>
            <button
              className={`${styles.toggleBtn} ${isLogin ? styles.active : ''}`}
              onClick={() => {
                setIsLogin(true);
                setOtpSent(false);
                setOtpVerified(false);
                setOtp("");
                setError("");
                setErrors({});
              }}
            >
              Login
            </button>
            <button
              className={`${styles.toggleBtn} ${!isLogin ? styles.active : ''}`}
              onClick={() => {
                setIsLogin(false);
                setOtpSent(false);
                setOtpVerified(false);
                setOtp("");
                setError("");
                setErrors({});
              }}
            >
              Register
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Full Name</span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                    required={!isLogin}
                    disabled={otpSent || otpVerified}
                  />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </label>
              </div>
            )}

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Phone Number</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    required={!isLogin}
                    disabled={otpSent || otpVerified}
                  />
                  {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </label>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>Email Address</span>
                <div className={styles.passwordInputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    required
                    disabled={!isLogin && otpVerified}
                    style={(!isLogin && !otpVerified) ? { paddingRight: '90px' } : undefined}
                  />
                  {!isLogin && !otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isVerifyingEmail || !formData.email || otpSent}
                      style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        color: '#3b82f6',
                        border: 'none',
                        padding: '6px',
                        cursor: (isVerifyingEmail || !formData.email || otpSent) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: (isVerifyingEmail || !formData.email) ? 0.7 : (otpSent ? 0.5 : 1)
                      }}
                      title={isVerifyingEmail ? 'Sending...' : otpSent ? 'OTP Sent' : 'Verify Email'}
                    >
                      <RefreshCcw 
                        size={22} 
                        style={isVerifyingEmail ? { animation: 'spin 1s linear infinite' } : {}} 
                      />
                      <style>
                        {`
                          @keyframes spin {
                            100% { transform: rotate(360deg); }
                          }
                        `}
                      </style>
                    </button>
                  )}
                  {!isLogin && otpVerified && (
                     <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#10b981',
                        fontWeight: 'bold',
                        fontSize: '0.875rem'
                     }}>Verified ✓</span>
                  )}
                </div>
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </label>
            </div>

            {/* Inline OTP Field */}
            {!isLogin && otpSent && !otpVerified && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Enter OTP</span>
                  <div className={styles.passwordInputWrapper}>
                    <input
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={(e) => {
                         setOtp(e.target.value);
                         if (errors.otp) setErrors({ ...errors, otp: '' });
                      }}
                      placeholder="Enter 6-digit OTP"
                      className={`${styles.input} ${errors.otp ? styles.inputError : ''}`}
                      maxLength={6}
                      required
                      style={{ paddingRight: '100px', letterSpacing: '2px' }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingEmail || !otp || otp.length < 4}
                      style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: (isVerifyingEmail || !otp || otp.length < 4) ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        opacity: (isVerifyingEmail || !otp || otp.length < 4) ? 0.7 : 1
                      }}
                    >
                      {isVerifyingEmail ? 'Wait...' : 'Submit OTP'}
                    </button>
                  </div>
                  {errors.otp && <span className={styles.errorText}>{errors.otp}</span>}
                </label>
              </div>
            )}

            {(isLogin || (!isLogin && otpVerified)) && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Password</span>
                  <div className={styles.passwordInputWrapper}>
                    <Lock className={styles.inputIcon} size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
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
                  {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                </label>
              </div>
            )}

            {!isLogin && otpVerified && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Confirm Password</span>
                  <div className={styles.passwordInputWrapper}>
                    <Lock className={styles.inputIcon} size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                </label>
              </div>
            )}

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading || isVerifyingEmail}
            >
              {loading || isVerifyingEmail 
                ? 'Processing...' 
                : isLogin 
                  ? 'Login' 
                  : 'Register'}
            </button>

            {isLogin && (
              <a href="/reset-password" className={styles.forgotPassword}>
                Forgot Password?
              </a>
            )}
          </form>
        </div>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.overlay}></div>
        <div className={styles.overlayContent}>
          <h2 className={styles.overlayTitle}>858 Open jobs waiting for you</h2>
          <div className={styles.statsContainer}>
            <div className={styles.statBox}>
              <div className={styles.statIcon}><Briefcase size={24} /></div>
              <div className={styles.statNumber}>856</div>
              <div className={styles.statLabel}>Live Jobs</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statIcon}><Building2 size={24} /></div>
              <div className={styles.statNumber}>729</div>
              <div className={styles.statLabel}>Companies</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statIcon}><Users size={24} /></div>
              <div className={styles.statNumber}>1496</div>
              <div className={styles.statLabel}>Candidates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;
