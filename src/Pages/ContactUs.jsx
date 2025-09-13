import React, { useState } from "react";
import styles from "../Styles/ContactUs.module.css";
import HomeNav from "../Components/HomeNav";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
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
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className={styles.pageContainer}>
      <HomeNav />
      
      <div className={styles.mainContent}>
        <div className={styles.contentGrid}>
          {/* Contact Form */}
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <h2>Send us a message</h2>
              <p>We'd love to hear from you. Please fill out the form below.</p>
              
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
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
                    placeholder="john.doe@example.com"
                    required
                  />
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
                <span>123 Innovation Drive, Suite 400, Tech City, CA 90210, USA</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>✉️</span>
                <span>contact@jobportal.com</span>
              </div>
            </div>

            <div className={styles.mapCard}>
              <h3>Find Us</h3>
              <div className={styles.mapContainer}>
                <div className={styles.mapIcon}>🗺️</div>
                <div className={styles.mapPin}>📍</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <div className={styles.footerLogo}>🌟 JobPortal</div>
            <p>JobPortal is dedicated to providing cutting-edge solutions for modern businesses.</p>
            <div className={styles.socialIcons}>
              <span>📘</span>
              <span>🐦</span>
              <span>💼</span>
              <span>📷</span>
            </div>
          </div>
          <div className={styles.footerRight}>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <a href="/about">About Us</a>
              <a href="/careers">Careers</a>
              <a href="/press">Press</a>
              <a href="/partners">Partners</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Products</h4>
              <a href="/features">Features</a>
              <a href="/pricing">Pricing</a>
              <a href="/integrations">Integrations</a>
              <a href="/solutions">Solutions</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Resources</h4>
              <a href="/blog">Blog</a>
              <a href="/support">Support</a>
              <a href="/documentation">Documentation</a>
              <a href="/community">Community</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2024 JobPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;




