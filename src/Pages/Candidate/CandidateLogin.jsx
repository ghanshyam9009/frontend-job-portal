import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { studentService } from "../../services/studentService";
import { validateForm } from "../../utils/errorHandler";
import styles from "../../Styles/Auth.module.css";
import HomeNav from "../../Components/HomeNav";
import logo from "../../assets/logo.png";
import { Briefcase, Building2, Users } from "lucide-react";

const CandidateLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Get the return URL from navigation state
  const from = location.state?.from?.pathname || '/userdashboard';
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

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
        }
      } else {
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
        }
      }
    } catch (error) {
      console.error(`${isLogin ? 'Login' : 'Registration'} failed:`, error);
      // Error handling is done in the service layer with toastify
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
                  />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </label>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>Email Address</span>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
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
                <div className={styles.inputWrapper}>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                    required
                  />
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </label>
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Confirm Password</span>
                  <div className={styles.inputWrapper}>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                      required={!isLogin}
                    />
                  </div>
                  {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                </label>
              </div>
            )}

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
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
