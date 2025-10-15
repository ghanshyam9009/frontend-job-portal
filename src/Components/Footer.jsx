import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span className={styles.footerLogoText}></span>
            </div>
            <p className={styles.footerDescription}>Connecting talent with opportunity worldwide.</p>
            <div className={styles.socialLinks}>
              <a href="https://www.facebook.com/pages/Bigsources-Placement-Services/1530903963853104" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className={styles.socialLink}>
                <FaFacebook />
              </a>
              <a href="#" className={styles.socialLink}><FaTwitter /></a>
              <a href="#" className={styles.socialLink}><FaLinkedin /></a>
              <a href="https://www.instagram.com/job_bigsources?igsh=bzk0Nm15am0xemxk"
                 target="_blank"
                 rel="noopener noreferrer"
                 className={styles.socialLink}>
                <FaInstagram />
              </a>
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h4 className={styles.footerColumnTitle}>Job Seekers</h4>
            <div className={styles.footerLinks}>
              <a href="/job-listings" className={styles.footerLink}>Find Jobs</a>
              <a href="/candidate/profile" className={styles.footerLink}>Upload Resume</a>
              <a href="#" className={styles.footerLink}>Company Reviews</a>
              <a href="#" className={styles.footerLink}>Salary Tools</a>
            </div>
          </div>
          
          <div className={styles.footerColumn}>
            <h4 className={styles.footerColumnTitle}>Employers</h4>
            <div className={styles.footerLinks}>
              <a href="/recruiter/post-job" className={styles.footerLink}>Post a Job</a>
              <a href="/recruiter/shortlist-candidates" className={styles.footerLink}>Search Resumes</a>
              <a href="#" className={styles.footerLink}>Employer Branding</a>
              <a href="#" className={styles.footerLink}>Recruiting Solutions</a>
            </div>
          </div>
          
          <div className={styles.footerColumn}>
            <h4 className={styles.footerColumnTitle}>Company</h4>
            <div className={styles.footerLinks}>
              <a href="/about" className={styles.footerLink}>About Us</a>
              <a href="/contact" className={styles.footerLink}>Contact Us</a>
              <a href="#" className={styles.footerLink}>Privacy Policy</a>
              <a href="#" className={styles.footerLink}>Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContent}>
          <div className={styles.copyright}>
            Copyright © Bigsources Manpower Solution PVT. LTD. 2025. All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
