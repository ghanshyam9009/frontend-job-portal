import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext"; // Import useTheme
import { validateForm } from "../../utils/errorHandler";
import { Clock, XCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
          const from = location.state?.from?.pathname || '/company-profile';
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
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={`${styles.toggleBtn} ${!isLogin ? styles.active : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
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
                    />
                    {errors.contactPerson && <span className={styles.errorText}>{errors.contactPerson}</span>}
                  </label>
                </div>

              </>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>Email Address</span>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@company.com"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    required
                  />
                </div>
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </label>
            </div>

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
                  />
                  {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </label>
              </div>
            )}

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

            {!isLogin && (
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

            <button type="submit" className={styles.submitBtn}>
              {isLogin ? 'Login' : 'Register'}
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
