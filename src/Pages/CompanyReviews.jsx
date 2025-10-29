import React from 'react';
import styles from './CompanyReviews.module.css';
import HomeNav from '../Components/HomeNav';
import Footer from '../Components/Footer';

const CompanyReviews = () => {
  return (
    <div className={styles.container}>
      <HomeNav />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Company Reviews</h1>
          <p className={styles.description}>
            Discover genuine feedback from employees about companies. Read and share reviews to help you make informed career decisions.
          </p>

          <div className={styles.comingSoon}>
            <h2>Coming Soon</h2>
            <p>This feature is currently under development. Stay tuned for company review insights to help you choose the best workplace for your career goals.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyReviews;
