import React from "react";
import styles from "../Styles/Membership.module.css";
import HomeNav from "../Components/HomeNav";
import { CheckCircle } from 'lucide-react';

const candidatePlans = [
  {
    name: "Platinum",
    price: "₹200",
    duration: "for 1 month",
    features: [
      "Access to all job listings",
      "Priority application review",
      "Profile highlighted to recruiters",
      "Email and SMS job alerts"
    ],
    style: "platinum"
  },
  {
    name: "Silver",
    price: "₹500",
    duration: "for 3 months",
    features: [
      "All features of Platinum",
      "Resume writing assistance",
      "Career counseling session",
      "Access to premium articles"
    ],
    style: "silver",
    recommended: true
  },
  {
    name: "Gold",
    price: "₹1000",
    duration: "for 6 months",
    features: [
      "All features of Silver",
      "Mock interview sessions",
      "Personalized job recommendations",
      "Direct chat with recruiters"
    ],
    style: "gold"
  }
];

const employerPlans = [
  {
    name: "Per Post",
    price: "₹300",
    duration: "per job post",
    features: [
      "Single job post",
      "Visible for 30 days",
      "Access to applicant resumes",
      "Email support"
    ]
  }
];

const faqs = [
  {
    question: "Can I cancel my membership?",
    answer: "Yes, you can cancel your membership at any time from your account settings. Your plan will remain active until the end of the billing period."
  },
  {
    question: "Is there a free trial available?",
    answer: "We do not offer a free trial for our premium membership plans. However, you can browse limited job listings with a free account."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and UPI payments through our secure payment gateway."
  }
];

const Membership = () => {
  return (
    <div className={styles.pageContainer}>
      <HomeNav />
      <div className={styles.header}>
        <h1 className={styles.title}>Membership Plans</h1>
        <p className={styles.subtitle}>Choose the plan that's right for you</p>
      </div>
      <div className={styles.plansContainer}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>For Candidates</h2>
          <div className={styles.planGrid}>
            {candidatePlans.map((plan, index) => (
              <div key={index} className={`${styles.planCard} ${styles[plan.style] || ''} ${plan.recommended ? styles.recommended : ''}`}>
                {plan.recommended && <div className={styles.recommendedBadge}>Recommended</div>}
                <h3 className={styles.planTitle}>{plan.name}</h3>
                <p className={styles.planPrice}>{plan.price}</p>
                <p className={styles.planDuration}>{plan.duration}</p>
                <ul className={styles.featuresList}>
                  {plan.features.map((feature, i) => (
                    <li key={i}><CheckCircle size={16} /> {feature}</li>
                  ))}
                </ul>
                <button className={styles.planButton}>Choose Plan</button>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>For Employers</h2>
          <div className={styles.planGrid}>
            {employerPlans.map((plan, index) => (
              <div key={index} className={`${styles.planCard}`}>
                <h3 className={styles.planTitle}>{plan.name}</h3>
                <p className={styles.planPrice}>{plan.price}</p>
                <p className={styles.planDuration}>{plan.duration}</p>
                 <ul className={styles.featuresList}>
                  {plan.features.map((feature, i) => (
                    <li key={i}><CheckCircle size={16} /> {feature}</li>
                  ))}
                </ul>
                <button className={styles.planButton}>Choose Plan</button>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <h4 className={styles.faqQuestion}>{faq.question}</h4>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
