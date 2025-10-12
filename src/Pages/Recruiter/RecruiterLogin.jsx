import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext"; // Import useTheme
import styles from "../../Styles/Auth.module.css";
import HomeNav from "../../Components/HomeNav";
import logo from "/favicon-icon.png";

const RecruiterLogin = () => {
  const { theme, toggleTheme } = useTheme(); // Use theme context
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactPerson: "",
    phone: "",
    companySize: ""
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (isLogin) {
      try {
        await login(formData.email, formData.password, 'recruiter');
        setSuccess("Login successful!");
        setError("");
        const from = location.state?.from?.pathname || '/recruiter/dashboard';
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
          full_name: formData.contactPerson,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
          company_name: formData.companyName,
          company_website: "", // Not in form, but required by API
          industry: "", // Not in form, but required by API
          company_size: formData.companySize,
          location: "", // Not in form, but required by API
          description: "", // Not in form, but required by API
          role: 'recruiter'
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
    <div className={styles.container}>
      <HomeNav />
      <div className={styles.leftPanel}>
        <div className={styles.header}>
          <img src={logo} alt="logo" className={styles.logo} />
          <h1 className={styles.companyName}>Bigsources Manpower Solution</h1>

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
                      className={styles.input}
                      required={!isLogin}
                    />
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
                      className={styles.input}
                      required={!isLogin}
                    />
                  </label>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelText}>Company Size</span>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className={styles.input}
                      required={!isLogin}
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </label>
                </div>
              </>
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
                    placeholder="you@company.com"
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
    </div>
  );
};

export default RecruiterLogin;
