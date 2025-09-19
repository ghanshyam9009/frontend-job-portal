import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import styles from "../../Styles/Candidate.module.css";
import HomeNav from "../../Components/HomeNav";

const CandidateLogin = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      try {
        await login(formData.email, formData.password, 'candidate');
        setSuccess("Login successful!");
        setError("");
        navigate(from, { replace: true });
      } catch (error) {
        console.error("Login failed:", error);
        setError("Login failed. Please check your credentials.");
        setSuccess("");
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setSuccess("");
        return;
      }
      try {
        await register({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
          role: 'candidate'
        });
        setSuccess("Registration successful! Please log in.");
        setError("");
        setIsLogin(true); // Switch to login form
      } catch (error) {
        console.error("Registration failed:", error);
        setError("Registration failed. Please try again.");
        setSuccess("");
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <HomeNav />
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <div className={styles.formCard}>
            <h1 className={styles.title}>Welcome to Job Portal</h1>
            <p className={styles.subtitle}>Find your dream job or connect with top talent.</p>
            
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

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.success}>{success}</p>}
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
                      className={styles.input}
                      required={!isLogin}
                    />
                  </label>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Email Address</span>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>✉️</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className={styles.input}
                      required
                    />
                  </div>
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
                      className={styles.input}
                      required={!isLogin}
                    />
                  </label>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Password</span>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>🔒</span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={styles.input}
                      required
                    />
                  </div>
                </label>
              </div>

              {!isLogin && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Confirm Password</span>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>🔒</span>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={styles.input}
                        required={!isLogin}
                      />
                    </div>
                  </label>
                </div>
              )}

              <button type="submit" className={styles.submitBtn}>
                {isLogin ? 'Login' : 'Register'}
              </button>

              {isLogin && (
                <a href="#" className={styles.forgotPassword}>
                  Forgot Password?
                </a>
              )}
            </form>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.imageCard}>
            <div className={styles.imageOverlay}>
              <h2 className={styles.overlayTitle}>Unlock Your Career Potential</h2>
              <p className={styles.overlayText}>
                Discover thousands of job opportunities tailored to your skills and aspirations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;
