import React, { useState } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { FaFacebook, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";
import styles from "../Styles/ContactUs.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
import logo from "../assets/logo2.png";

const ContactUs = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    userType: "candidate"
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({ name: "", email: "", message: "", userType: "candidate" });
  };

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />
      
      <div className={styles.mainContent}>
        <div className={styles.contentGrid}>
          {/* Contact Form */}
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <h2>Send us a message</h2>
              {/* <p>We'd love to hear from you. Please fill out the form below.</p> */}
              
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder=""
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder=""
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <div className={styles.userTypeSelector}>
                    <button
                      type="button"
                      className={`${styles.userTypeButton} ${formData.userType === 'candidate' ? styles.active : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'userType', value: 'candidate' } })}
                    >
                      Candidate
                    </button>
                    <button
                      type="button"
                      className={`${styles.userTypeButton} ${formData.userType === 'recruiter' ? styles.active : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'userType', value: 'recruiter' } })}
                    >
                      Recruiter
                    </button>
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Your message here..."
                    rows="6"
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className={styles.submitBtn}>
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <h3>Our Office</h3>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span>413 -A Prem trade center, 3rd Floor Maharani road Near Gujarati Girls college, Indore (M.P.)</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span>BDM- Siddharth Sharma- 9755556617</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span>Parul Sharma- 9993588502</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}><FaEnvelope /></span>
                <span>HR@bigsources.in</span>
              </div>
              {/* <div className={styles.contactItem}>
                <span className={styles.contactIcon}><FaEnvelope /></span>
                <span>info@bigsources.in</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}><FaEnvelope /></span>
                <span>admin@bigsources.in</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}><FaEnvelope /></span>
                <span>sales@bigsources.in</span>
              </div> */}
            </div>

            <div className={styles.mapCard}>
              <h3>Find Us</h3>
              <div className={styles.mapContainer}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.923476612451!2d75.8942173149622!3d22.73099098510019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd40048c29cd%3A0x24c2a428b7d7e5b6!2sMR%209%20Rd%2C%20near%20canara%20bank%2C%20Vijay%20Nagar%2C%20Sector%20A%2C%20Chandra%20Nagar%2C%20Indore%2C%20Madhya%20Pradesh%20452007%2C%20India!5e0!3m2!1sen!2sus!4v1633020431628!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;
