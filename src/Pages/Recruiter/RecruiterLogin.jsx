import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import styles from "../../Styles/Recruiter.module.css";
import HomeNav from "../../Components/HomeNav";

const RecruiterLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // Simulate login
      const userData = {
        name: formData.email.split('@')[0],
        email: formData.email,
        companyName: "TechCorp",
        role: "recruiter",
        membership: "premium"
      };
      login(userData);
      const from = location.state?.from?.pathname || '/recruiter/dashboard';
      navigate(from, { replace: true });
    } else {
      // Simulate signup
      const userData = {
        name: formData.contactPerson,
        email: formData.email,
        companyName: formData.companyName,
        role: "recruiter",
        membership: "free"
      };
      login(userData);
      navigate('/recruiter/dashboard', { replace: true });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <HomeNav />
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <div className={styles.formCard}>
            <h1 className={styles.title}>Recruiter Portal</h1>
            <p className={styles.subtitle}>Find the best talent for your company and grow your team.</p>
            
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
              <h2 className={styles.overlayTitle}>Hire Top Talent</h2>
              <p className={styles.overlayText}>
                Access thousands of qualified candidates and find the perfect fit for your team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterLogin;
