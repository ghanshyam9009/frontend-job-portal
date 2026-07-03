import React, { useState, useEffect } from "react";
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
import { Briefcase, Building2, Users, Mail, Lock, Eye, EyeOff, BadgeCheck, Loader2 } from "lucide-react";

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
  const [resendTimer, setResendTimer] = useState(0);
  
  // Get the return URL from navigation state (default: My Applications)
  const from = location.state?.from?.pathname || '/my-applications';
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: ""
  });

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

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
      setResendTimer(60);
      toast.success("OTP sent successfully to your email!");
    } catch (err) {
      console.error("Send OTP failed:", err);
      const errorMessage = err.error || err.message || "Failed to send OTP. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleResendOtp = async () => {
    if (isVerifyingEmail || resendTimer > 0) return;

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
      const result = await studentService.resendOtp({
        email: formData.email,
        role: "student",
      });

      if (result.success) {
        setOtp("");
        setResendTimer(60);
        toast.success("OTP resent successfully to your email!");
      } else {
        const rawError = result.error?.raw || result.error;
        const errorMessage =
          extractErrorMessage(rawError) || result.error?.message || "Failed to resend OTP. Please try again.";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Resend OTP failed:", err);
      toast.error(extractErrorMessage(err) || "Failed to resend OTP. Please try again.");
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
                setResendTimer(0);
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
                setResendTimer(0);
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
                    disabled={otpSent && !otpVerified}
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
                    disabled={otpSent && !otpVerified}
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
                    className={`${styles.input} ${errors.email ? styles.inputError : ''} ${
                      !isLogin && otpVerified
                        ? styles.inputVerified
                        : !isLogin && !otpVerified
                          ? styles.inputWithVerifyBtn
                          : ''
                    }`}
                    required
                    disabled={!isLogin && otpVerified}
                  />
                  {!isLogin && !otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isVerifyingEmail || !formData.email || otpSent}
                      className={`${styles.verifyEmailBtn} ${otpSent ? styles.verifyEmailBtnSent : ''}`}
                      style={{
                        opacity: (isVerifyingEmail || !formData.email) ? 0.7 : 1,
                      }}
                      title={isVerifyingEmail ? 'Sending OTP...' : otpSent ? 'OTP sent to your email' : 'Send verification OTP to email'}
                    >
                      {isVerifyingEmail ? (
                        <>
                          <Loader2
                            size={14}
                            style={{ animation: 'candidateVerifySpin 1s linear infinite' }}
                          />
                          <span>Sending</span>
                        </>
                      ) : otpSent ? (
                        <>
                          <BadgeCheck size={14} />
                          <span>OTP Sent</span>
                        </>
                      ) : (
                        <>
                          <BadgeCheck size={14} />
                          <span>Verify</span>
                        </>
                      )}
                      <style>
                        {`
                          @keyframes candidateVerifySpin {
                            100% { transform: rotate(360deg); }
                          }
                        `}
                      </style>
                    </button>
                  )}
                  {!isLogin && otpVerified && (
                    <span className={styles.emailVerifiedBadge} aria-label="Email verified">
                      <BadgeCheck size={16} fill="#059669" stroke="#fff" strokeWidth={2} />
                      <span>Verified</span>
                    </span>
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
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isVerifyingEmail || resendTimer > 0}
                    className={styles.forgotPassword}
                    style={{
                      marginTop: '0.5rem',
                      display: 'inline-block',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: isVerifyingEmail || resendTimer > 0 ? 'not-allowed' : 'pointer',
                      opacity: isVerifyingEmail || resendTimer > 0 ? 0.6 : 1,
                    }}
                  >
                    {isVerifyingEmail
                      ? 'Resending OTP...'
                      : resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : 'Resend OTP'}
                  </button>
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
