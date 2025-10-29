import React from 'react';
import styles from './RecruitingSolutions.module.css';
import HomeNav from '../Components/HomeNav';
import Footer from '../Components/Footer';

const RecruitingSolutions = () => {
  return (
    <div className={styles.container}>
      <HomeNav />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Recruiting Solutions</h1>
          <p className={styles.description}>
            Streamline your hiring process with our comprehensive recruiting solutions designed to help you find and hire top talent efficiently.
          </p>

          <div className={styles.comingSoon}>
            <h2>Coming Soon</h2>
            <p>This feature is currently under development. We're building advanced recruiting tools to help you manage every stage of the hiring process, from candidate sourcing to final placement.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecruitingSolutions;
