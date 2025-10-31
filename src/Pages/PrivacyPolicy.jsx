import React from 'react';
import styles from './PrivacyPolicy.module.css';
import HomeNav from '../Components/HomeNav';
import Footer from '../Components/Footer';
import { useTheme } from '../Contexts/ThemeContext';

const PrivacyPolicy = () => {
  const { theme } = useTheme();

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <div className={styles.policyContent}>
            <section className={styles.section}>
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our services.</p>
            </section>

            <section className={styles.section}>
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
            </section>

            <section className={styles.section}>
              <h2>3. Information Sharing</h2>
              <p>We do not sell, trade, or rent your personal information to third parties without your consent, except as described in this policy.</p>
            </section>

            <section className={styles.section}>
              <h2>4. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access.</p>
            </section>

            <section className={styles.section}>
              <h2>5. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at privacy@bigsources.in</p>
            </section>

            <p className={styles.effectiveDate}>Effective Date: October 2025</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
