import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import styles from "../../Styles/Admin.module.css";
import HomeNav from "../../Components/HomeNav";

const AdminLogin = () => {
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
    <div className={styles.pageContainer}>
      <HomeNav />
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <div className={styles.formCard}>
            <h1 className={styles.title}>Admin Portal</h1>
            <p className={styles.subtitle}>Manage the platform and oversee all operations.</p>
            
            <div className={styles.loginHeader}>
              <h2 className={styles.loginTitle}>Admin Login</h2>
              <p className={styles.loginSubtitle}>Sign in to access the admin dashboard</p>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>

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

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login to Dashboard'}
              </button>

           
            </form>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.imageCard}>
            <div className={styles.imageOverlay}>
              <h2 className={styles.overlayTitle}>Platform Management</h2>
              <p className={styles.overlayText}>
                Oversee all platform operations, manage users, and ensure smooth functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
