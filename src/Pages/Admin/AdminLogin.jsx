import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import styles from "../../Styles/Auth.module.css";
import HomeNav from "../../Components/HomeNav";
import logo from "/favicon-icon.png";

const AdminLogin = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(formData.email, formData.password, 'admin');
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
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
          <h1 className={styles.title}>Admin Login</h1>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>Email Address</span>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@company.com"
                    className={styles.input}
                    required
                  />
                </div>
              </label>
            </div>

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
                    className={styles.input}
                    required
                  />
                </div>
              </label>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
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

export default AdminLogin;
