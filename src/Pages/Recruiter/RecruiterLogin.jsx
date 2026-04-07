import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext"; // Import useTheme
import { validateForm } from "../../utils/errorHandler";
import apiClient from "../../services/apiClient";
import { API_ENDPOINTS } from "../../config/api";
import { Clock, XCircle, Mail, Lock, Eye, EyeOff, RefreshCcw } from "lucide-react";
import styles from "../../Styles/Auth.module.css";
import HomeNav from "../../Components/HomeNav";
import logo from "../../assets/logo.png";

const RecruiterLogin = () => {
  const { theme, toggleTheme } = useTheme(); // Use theme context
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(""); // "pending" or "rejected"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactPerson: "",
    phone: ""
  });

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
      password: { required: true, label: 'Password' }
    };

    return validateForm(formData, rules);
  };

  const validateRegisterForm = () => {
    const rules = {
      companyName: { required: true, minLength: 2, label: 'Company Name' },
      contactPerson: { required: true, minLength: 2, label: 'Contact Person' },
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
        role: "recruiter" 
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
        role: "recruiter",
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
    setError("");
    setSuccess("");
    setErrors({});

    if (isLogin) {
      const validationErrors = validateLoginForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      try {
        const result = await login(formData.email, formData.password, 'recruiter');
        if (result.success) {
          setSuccess("Login successful!");
          setError("");

          // Decide where to send recruiter after login
          const userData =
            result.user ||
            result.recruiter ||
            result.data?.user ||
            result.data?.employer ||
            result.data ||
            {};

          // Heuristic: if profile not completed, send to company profile first
          const hasCompletedProfile =
            userData.hasCompletedProfile === true ||
            userData.profile_completed === true ||
            userData.isProfileComplete === true;

          const looksIncompleteProfile =
            !hasCompletedProfile &&
            (!userData.company_name || !userData.industry || !userData.address);

          const defaultPath = looksIncompleteProfile ? '/company-profile' : '/recruiter/dashboard';
          const from = location.state?.from?.pathname || defaultPath;

          navigate(from, { replace: true });
        } else {
          const errorMessage = result.error?.error || result.error?.response?.data?.error || result.error?.message || '';
          if (errorMessage.includes('Recruiter not approved')) {
            setApprovalStatus('pending');
            setShowApprovalModal(true);
          } else if (errorMessage.includes('Recruiter rejected')) {
            setApprovalStatus('rejected');
            setShowApprovalModal(true);
          } else {
            setError("Invalid email or password. Please check your credentials and try again.");
          }
          setSuccess("");
        }
      } catch (error) {
        console.error("Login failed:", error);
        setError("Invalid email or password. Please check your credentials and try again.");
        setSuccess("");
      }
    } else {
      if (!otpVerified) {
        setErrors((prev) => ({ ...prev, email: "Please verify your email first" }));
        return;
      }

      const validationErrors = validateRegisterForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const result = await register({
        full_name: formData.contactPerson,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone,
        company_name: formData.companyName,
        company_website: "",
        description: "",
        role: 'recruiter'
      });

      if (result.success) {
        setError("");
        setSuccess("Registration successful! Let's complete your company profile.");
        try {
          const loginResult = await login(formData.email, formData.password, 'recruiter');
          if (loginResult.success) {
            navigate('/company-profile', { replace: true, state: { onboarding: true } });
          } else {
            const pendingMessage = loginResult?.error?.error || loginResult?.error?.message || '';
            if (pendingMessage?.includes('Recruiter not approved')) {
              setApprovalStatus('pending');
              setShowApprovalModal(true);
            }
          }
        } catch (loginError) {
          console.error('Auto login after registration failed:', loginError);
        }
      } else {
        // Handle specific error messages from API response
        const errorMessage = result.error?.response?.data?.message ||
                           result.error?.response?.data?.error ||
                           result.error?.message ||
                           result.error?.error ||
                           '';

        if (errorMessage.includes('Employer already registered')) {
          setError("Employer already registered");
        } else {
          setError("Registration failed. Please try again.");
        }
        setSuccess("");
      }
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
          <h1 className={styles.title}>{isLogin ? "Recruiter Login" : "Recruiter Registration"}</h1>
          
          <div className={styles.toggleButtons}>
            <button 
              className={`${styles.toggleBtn} ${isLogin ? styles.active : ''}`}
              onClick={() => {
                setIsLogin(true);
                setOtpSent(false);
                setOtpVerified(false);
                setOtp("");
                setError("");
                setSuccess("");
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
                setSuccess("");
                setErrors({});
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Company Name</span>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter your company name"
                      className={`${styles.input} ${errors.companyName ? styles.inputError : ''}`}
                      required={!isLogin}
                      disabled={otpSent || otpVerified}
                    />
                    {errors.companyName && <span className={styles.errorText}>{errors.companyName}</span>}
                  </label>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Contact Person</span>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className={`${styles.input} ${errors.contactPerson ? styles.inputError : ''}`}
                      required={!isLogin}
                      disabled={otpSent || otpVerified}
                    />
                    {errors.contactPerson && <span className={styles.errorText}>{errors.contactPerson}</span>}
                  </label>
                </div>

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

              </>
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
                    placeholder="you@company.com"
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

            {/* Inline OTP input removed; now handled by modal */}

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
              disabled={isVerifyingEmail}
            >
              {isVerifyingEmail 
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

      {/* Approval Status Modal */}
      {showApprovalModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${approvalStatus === 'pending' ? styles.approvalModal : styles.rejectedModal}`}>
            <div className={styles.modalHeader}>
              {approvalStatus === 'pending' ? (
                <Clock className={styles.modalIcon} />
              ) : (
                <XCircle className={styles.modalIcon} />
              )}
              <h2>
                {approvalStatus === 'pending'
                  ? 'Application Under Review'
                  : 'Application Rejected'
                }
              </h2>
            </div>
            <div className={styles.modalBody}>
              {approvalStatus === 'pending' ? (
                <>
                  <p>Your application is waiting for approval.</p>
                  <p>Our admin team is currently reviewing your registration request.</p>
                  <p>You will be able to log in once your application is approved.</p>
                </>
              ) : (
                <>
                  <p>Your registration request has been rejected by the admin.</p>
                  <p>Please contact our support team for more information about the rejection reason.</p>
                  <p>You can also try registering again with corrected information.</p>
                </>
              )}
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalBtn}
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalStatus("");
                }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecruiterLogin;
