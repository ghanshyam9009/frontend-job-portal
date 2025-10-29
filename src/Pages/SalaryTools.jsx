import React from 'react';
import styles from './SalaryTools.module.css';
import HomeNav from '../Components/HomeNav';
import Footer from '../Components/Footer';

const SalaryTools = () => {
  return (
    <div className={styles.container}>
      <HomeNav />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Salary Tools</h1>
          <p className={styles.description}>
            Understand your market value and negotiate better compensation with our comprehensive salary analysis tools.
          </p>

          <div className={styles.comingSoon}>
            <h2>Coming Soon</h2>
            <p>This feature is currently under development. Soon you'll be able to research salary ranges, compare compensation across companies, and get personalized insights to maximize your earning potential.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SalaryTools;
