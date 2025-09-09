import React, { useState } from "react";
import styles from "../../Styles/Admin.module.css";
import HomeNav from "../../Components/HomeNav";

const AdminLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    adminName: "",
    department: "",
    employeeId: ""
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
      console.log("Admin Login:", formData);
    } else {
      console.log("Admin Signup:", formData);
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
                      <span className={styles.labelText}>Admin Name</span>
                      <input
                        type="text"
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={styles.input}
                        required={!isLogin}
                      />
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <span className={styles.labelText}>Employee ID</span>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        placeholder="Enter your employee ID"
                        className={styles.input}
                        required={!isLogin}
                      />
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      <span className={styles.labelText}>Department</span>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={styles.input}
                        required={!isLogin}
                      >
                        <option value="">Select department</option>
                        <option value="IT">IT Department</option>
                        <option value="HR">Human Resources</option>
                        <option value="Operations">Operations</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Support">Customer Support</option>
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
