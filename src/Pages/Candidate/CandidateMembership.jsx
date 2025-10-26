import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
import { candidateService } from "../../services/candidateService";
import styles from "../../Styles/Membership.module.css";
import HomeNav from "../../Components/HomeNav";

const CandidateMembership = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [prices, setPrices] = useState({ gold: 400, platinum: 500, silver: 1000 });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await candidateService.getPremiumPrices();
        if (response.data) {
          setPrices(response.data);
        }
      } catch (error) {
        console.error('Error fetching premium prices:', error);
      }
    };
    fetchPrices();
  }, []);

  const handleChoosePlan = async (plan) => {
    try {
      const response = await candidateService.markStudentPremium({
        email: user?.email,
        is_premium: true,
        plan: plan
      });

      if (response) {
        alert(`Successfully subscribed to ${plan} plan!`);
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      alert('Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />
      <div className={styles.header}>
        <h1 className={styles.title}>Candidate Membership Plans</h1>
        <p className={styles.subtitle}>Choose the plan that's right for you</p>
      </div>
      <div className={styles.plansContainer}>
        <div className={`${styles.planCard} ${styles.silver}`}>
          <h2 className={styles.planTitle}>Silver</h2>
          <p className={styles.planPrice}>₹{prices.silver}<span>/month</span></p>
          <ul className={styles.planFeatures}>
            <li>50 Job Applications per Month</li>
            <li>Save up to 50 Jobs</li>
            <li>Standard Profile Visibility</li>
            <li>Basic Messaging</li>
            <li>Application Tracking</li>
            <li>Email Support</li>
          </ul>
          <button className={styles.planButton} onClick={() => handleChoosePlan('silver')}>Choose Plan</button>
        </div>
        <div className={`${styles.planCard} ${styles.gold}`}>
          <h2 className={styles.planTitle}>Gold</h2>
          <p className={styles.planPrice}>₹{prices.gold}<span>/month</span></p>
          <ul className={styles.planFeatures}>
            <li>Unlimited Job Applications</li>
            <li>Save Unlimited Jobs</li>
            <li>Advanced Profile Visibility</li>
            <li>Priority in Search Results</li>
            <li>Direct Messaging with Employers</li>
            <li>Application Tracking</li>
            <li>Resume Builder</li>
            <li>Email & Phone Support</li>
          </ul>
          <button className={styles.planButton} onClick={() => handleChoosePlan('gold')}>Choose Plan</button>
        </div>
        <div className={`${styles.planCard} ${styles.platinum}`}>
          <h2 className={styles.planTitle}>Platinum</h2>
          <p className={styles.planPrice}>₹{prices.platinum}<span>/month</span></p>
          <ul className={styles.planFeatures}>
            <li>Everything in Gold</li>
            <li>Personalized Job Recommendations</li>
            <li>Interview Preparation Tools</li>
            <li>Career Coaching Sessions</li>
            <li>Salary Negotiation Guidance</li>
            <li>LinkedIn Profile Optimization</li>
            <li>Priority Customer Support</li>
            <li>Advanced Analytics</li>
          </ul>
          <button className={styles.planButton} onClick={() => handleChoosePlan('platinum')}>Choose Plan</button>
        </div>
      </div>
    </div>
  );
};

export default CandidateMembership;
