import React from 'react';
import styles from './TermsOfService.module.css';
import HomeNav from '../Components/HomeNav';
import Footer from '../Components/Footer';
import { useTheme } from '../Contexts/ThemeContext';

const TermsOfService = () => {
  const { theme } = useTheme();

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Terms of Service</h1>
          <div className={styles.policyContent}>
            <section className={styles.section}>
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using Bigsources.in, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section className={styles.section}>
              <h2>2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials on Bigsources.in for personal, non-commercial transitory viewing only.</p>
            </section>

            <section className={styles.section}>
              <h2>3. User Responsibilities</h2>
              <p>You agree to use the service only for lawful purposes and in accordance with these Terms of Service.</p>
            </section>

            <section className={styles.section}>
              <h2>4. Disclaimer</h2>
              <p>The information on this website is provided on an 'as is' basis. To the fullest extent permitted by law, Bigsources.in excludes all warranties.</p>
            </section>

            <section className={styles.section}>
              <h2>5. Limitations</h2>
              <p>In no event shall Bigsources.in or its suppliers be liable for any damages arising out of the use or inability to use the service.</p>
            </section>

            <section className={styles.section}>
              <h2>6. Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us at legal@bigsources.in</p>
            </section>

            <p className={styles.effectiveDate}>Effective Date: October 2025</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
