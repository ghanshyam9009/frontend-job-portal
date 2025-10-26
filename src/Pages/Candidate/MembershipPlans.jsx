import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import { candidateService } from "../../services/candidateService";
import styles from "./UserDashboard.module.css";

const MembershipPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [prices, setPrices] = useState({ gold: 400, platinum: 500, silver: 1000 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await candidateService.getPremiumPrices();
        if (response.data) {
          setPrices(response.data);
        }
      } catch (error) {
        console.error('Error fetching premium prices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const membershipPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Basic job searching features',
      features: [
        'Browse job listings',
        'Save up to 5 jobs',
        'Apply to 3 jobs per month',
        'Basic profile visibility',
        'Email support'
      ],
      limitations: [
        'Limited job applications',
        'Basic profile features',
        'No priority support'
      ],
      popular: false,
      buttonText: 'Current Plan',
      buttonDisabled: true
    },
    {
      id: 'gold',
      name: 'Gold',
      price: `₹${prices.gold}`,
      period: 'month',
      description: 'Enhanced job searching experience',
      features: [
        'Unlimited job applications',
        'Save unlimited jobs',
        'Advanced profile visibility',
        'Priority in search results',
        'Direct messaging with employers',
        'Application tracking',
        'Resume builder',
        'Email & phone support'
      ],
      limitations: [],
      popular: true,
      buttonText: 'Upgrade to Gold',
      buttonDisabled: false
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: `₹${prices.platinum}`,
      period: 'month',
      description: 'Complete career advancement suite',
      features: [
        'Everything in Gold',
        'Personalized job recommendations',
        'Interview preparation tools',
        'Career coaching sessions',
        'Salary negotiation guidance',
        'LinkedIn profile optimization',
        'Priority customer support',
        'Advanced analytics'
      ],
      limitations: [],
      popular: false,
      buttonText: 'Upgrade to Platinum',
      buttonDisabled: false
    },
    {
      id: 'silver',
      name: 'Silver',
      price: `₹${prices.silver}`,
      period: 'month',
      description: 'Standard premium features',
      features: [
        '50 job applications per month',
        'Save up to 50 jobs',
        'Standard profile visibility',
        'Basic messaging',
        'Application tracking',
        'Email support'
      ],
      limitations: [
        'Limited applications',
        'No priority support'
      ],
      popular: false,
      buttonText: 'Upgrade to Silver',
      buttonDisabled: false
    }
  ];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleUpgrade = async (plan) => {
    if (plan.id === 'free') return;

    try {
      // Call API to mark student as premium
      const response = await candidateService.markStudentPremium({
        email: user?.email,
        is_premium: true,
        plan: plan.id
      });

      if (response) {
        alert(`Successfully upgraded to ${plan.name} plan!`);
        // Update user membership in context or state
        // For now, just show success
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade plan. Please try again.');
    }
  };

  const currentPlan = user?.membership || 'free';

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <CandidateNavbar darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <main className={styles.main}>
        <section className={styles.membershipSection}>
          <div className={styles.membershipHeader}>
            <h2>Membership Plans</h2>
            <p>Choose the plan that best fits your career goals</p>
          </div>
          
          <div className={styles.currentPlan}>
            <div className={styles.currentPlanCard}>
              <h3>Current Plan</h3>
              <div className={styles.currentPlanInfo}>
                <span className={styles.planName}>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
                <span className={styles.planStatus}>Active</span>
              </div>
            </div>
          </div>

          <div className={styles.plansGrid}>
            {membershipPlans.map((plan) => (
              <div 
                key={plan.id} 
                className={`${styles.planCard} ${plan.popular ? styles.popularPlan : ''} ${currentPlan === plan.id ? styles.currentPlanCard : ''}`}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>Most Popular</div>
                )}
                
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>/{plan.period}</span>
                  </div>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>

                <div className={styles.planFeatures}>
                  <h4>Features</h4>
                  <ul className={styles.featuresList}>
                    {plan.features.map((feature, index) => (
                      <li key={index} className={styles.feature}>
                        <span className={styles.checkIcon}>✅</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <h4>Limitations</h4>
                      <ul className={styles.limitationsList}>
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className={styles.limitation}>
                            <span className={styles.limitIcon}>⚠️</span>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className={styles.planActions}>
                  <button
                    className={`${styles.planButton} ${currentPlan === plan.id ? styles.currentButton : styles.upgradeButton}`}
                    onClick={() => handleUpgrade(plan)}
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? 'Current Plan' : plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.membershipBenefits}>
            <h3>Why Upgrade?</h3>
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>🚀</div>
                <h4>Unlimited Applications</h4>
                <p>Apply to as many jobs as you want without restrictions</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>👑</div>
                <h4>Priority Visibility</h4>
                <p>Your profile appears higher in employer searches</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>💬</div>
                <h4>Direct Messaging</h4>
                <p>Communicate directly with hiring managers</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>📊</div>
                <h4>Advanced Analytics</h4>
                <p>Track your application success and profile views</p>
              </div>
            </div>
          </div>

          <div className={styles.faqSection}>
            <h3>Frequently Asked Questions</h3>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h4>Can I cancel anytime?</h4>
                <p>Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>What payment methods do you accept?</h4>
                <p>We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>Is there a free trial?</h4>
                <p>Yes, we offer a 7-day free trial for all premium plans. No credit card required to start your trial.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>Can I change plans later?</h4>
                <p>Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MembershipPlans;
