import React from 'react';
import styles from './EmployerBranding.module.css';
import HomeNav from '../Components/HomeNav';
import Footer from '../Components/Footer';

const EmployerBranding = () => {
  return (
    <div className={styles.container}>
      <HomeNav />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Employer Branding</h1>
          <p className={styles.description}>
            Build and strengthen your company's reputation to attract top talent with our comprehensive employer branding solutions.
          </p>

          <div className={styles.comingSoon}>
            <h2>Coming Soon</h2>
            <p>This feature is currently under development. Soon you'll have access to tools and strategies to create compelling employer branding, highlighting your company's culture, values, and career opportunities.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmployerBranding;
