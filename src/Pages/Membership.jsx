import React from "react";
import { useTheme } from "../Contexts/ThemeContext";
import styles from "../Styles/Membership.module.css";
import HomeNav from "../Components/HomeNav";
import { CheckCircle, XCircle } from 'lucide-react';
import Footer from "../Components/Footer";

const candidatePlans = [
  {
    name: "Platinum",
    description: "Perfect for beginners starting their coding journey with government jobs access.",
    regularPrice: "₹200",
    discount: "20% OFF",
    offerPrice: "₹200",
    validity: "1 Month",
    features: [
      { name: "Access to all job listings", included: true },
      { name: "Priority application review", included: true },
      { name: "Profile highlighted to recruiters", included: false },
      { name: "Email and SMS job alerts", included: false },
      { name: "Resume writing assistance", included: false },
      { name: "Access to government job listings", included: true },
    ],
    style: "platinum"
  },
  {
    name: "Silver",
    description: "Go all in — with expert support & 3 Months access including government jobs.",
    originalPrice: "₹600",
    regularPrice: "₹500",
    discount: "17% OFF",
    offerPrice: "₹500",
    validity: "3 Months",
    features: [
      { name: "Access to all job listings", included: true },
      { name: "Priority application review", included: true },
      { name: "Profile highlighted to recruiters", included: true },
      { name: "Email and SMS job alerts", included: true },
      { name: "Resume writing assistance", included: false },
      { name: "Access to government job listings", included: true },
    ],
    style: "silver",
    recommended: true
  },
  {
    name: "Gold",
    description: "Premium access with backend support and 100% job security guarantee.",
    originalPrice: "₹1200",
    regularPrice: "₹1000",
    discount: "17% OFF",
    offerPrice: "₹1000",
    validity: "6 Months",
    features: [
      { name: "Access to all job listings", included: true },
      { name: "Priority application review", included: true },
      { name: "Profile highlighted to recruiters", included: true },
      { name: "Email and SMS job alerts", included: true },
      { name: "Resume writing assistance", included: true },
      { name: "Backend support for job applications", included: true },
      { name: "100% job security guarantee", included: true },
      { name: "Access to government job listings", included: true },
    ],
    style: "gold"
  }
];

const employerPlans = [
  {
    name: "Employer Plan",
    description: "Simple per-post payment model for flexible recruitment needs.",
    price: "₹300",
    duration: "per job post",
    features: [
      "Pay per job post",
      "Individual job posting",
      "Access to candidate profiles",
      "Email support",
      "Standard job visibility",
      "Basic candidate filtering"
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
  const { theme } = useTheme();

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
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
                {plan.recommended && <div className={styles.recommendedBadge}>{plan.validity} Validity</div>}
                <h3 className={styles.planTitle}>{plan.name}</h3>
                <p className={styles.planDescription}>{plan.description}</p>
                <div className={styles.priceSection}>
                  {plan.originalPrice && <p className={styles.originalPrice}>Original: <del>{plan.originalPrice}</del></p>}
                  <p className={styles.regularPrice}>Regular: {plan.regularPrice} <span className={styles.discount}>{plan.discount}</span></p>
                  <p className={styles.offerPrice}>Offer Price: {plan.offerPrice}</p>
                  {plan.coupon && <p className={styles.coupon}>Coupon: {plan.coupon}</p>}
                </div>
                <p className={styles.validity}>Validity: {plan.validity}</p>
                <div className={styles.featuresSection}>
                  <h4>What's included</h4>
                  <ul className={styles.featuresList}>
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        {feature.included ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className={styles.planButton}>Choose Plan</button>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>For Employers</h2>
          <div className={styles.planGrid}>
            {employerPlans.map((plan, index) => (
              <div key={index} className={`${styles.planCard} ${styles[plan.style] || ''} ${plan.recommended ? styles.recommended : ''}`}>
                {plan.recommended && <div className={styles.recommendedBadge}>Most Popular</div>}
                <h3 className={styles.planTitle}>{plan.name}</h3>
                <p className={styles.planDescription}>{plan.description}</p>
                <div className={styles.priceSection}>
                  <p className={styles.planPrice}>{plan.price}</p>
                  <p className={styles.planDuration}>{plan.duration}</p>
                </div>
                <div className={styles.featuresSection}>
                  <h4>What's included</h4>
                  <ul className={styles.featuresList}>
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        <CheckCircle size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
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
      <Footer />
    </div>
  );
};

export default Membership;
