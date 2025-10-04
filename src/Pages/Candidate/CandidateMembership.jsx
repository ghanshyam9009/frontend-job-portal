import React from "react";
import styles from "../../Styles/Membership.module.css";
import HomeNav from "../../Components/HomeNav";

const CandidateMembership = () => {
  return (
    <div className={styles.pageContainer}>
      <HomeNav />
      <div className={styles.header}>
        <h1 className={styles.title}>Candidate Membership Plans</h1>
        <p className={styles.subtitle}>Choose the plan that's right for you</p>
      </div>
      <div className={styles.plansContainer}>
        <div className={`${styles.planCard} ${styles.silver}`}>
          <h2 className={styles.planTitle}>Silver</h2>
          <p className={styles.planPrice}>₹29<span>/month</span></p>
          <ul className={styles.planFeatures}>
            <li>10 Job Posts per Month</li>
            <li>Access to Candidate Database</li>
            <li>Basic Company Profile</li>
            <li>Email Support</li>
          </ul>
          <button className={styles.planButton}>Choose Plan</button>
        </div>
        <div className={`${styles.planCard} ${styles.gold}`}>
          <h2 className={styles.planTitle}>Gold</h2>
          <p className={styles.planPrice}>₹59<span>/month</span></p>
          <ul className={styles.planFeatures}>
            <li>50 Job Posts per Month</li>
            <li>Advanced Candidate Search</li>
            <li>Featured Company Profile</li>
            <li>Priority Email Support</li>
          </ul>
          <button className={styles.planButton}>Choose Plan</button>
        </div>
        <div className={`${styles.planCard} ${styles.platinum}`}>
          <h2 className={styles.planTitle}>Platinum</h2>
          <p className={styles.planPrice}>₹99<span>/month</span></p>
          <ul className={styles.planFeatures}>
            <li>Unlimited Job Posts</li>
            <li>Full Access to Candidate Database</li>
            <li>Premium Company Branding</li>
            <li>24/7 Phone & Email Support</li>
          </ul>
          <button className={styles.planButton}>Choose Plan</button>
        </div>
      </div>
    </div>
  );
};

export default CandidateMembership;
