import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import { candidateService } from "../../services/candidateService";
import { paymentService } from "../../services/paymentService";
import styles from "./MembershipPlans.module.css";
import { Check, AlertTriangle, Rocket, Crown, MessageCircle, BarChart3, Loader2 } from "lucide-react";

const MembershipPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  const candidatePlans = [
    {
      id: 'platinum',
      name: "Platinum",
      description: "Perfect for beginners starting their coding journey with government jobs access.",
      price: "₹200",
      validity: "1 Month",
      features: [
        "Access to all job listings",
        "Priority application review",
        "Profile highlighted to recruiters",
        "Email and SMS job alerts",
        "Resume writing assistance",
        "Access to government job listings"
      ],
      style: "platinum"
    },
    {
      id: 'silver',
      name: "Silver",
      description: "Go all in — with expert support & 3 Months access including government jobs.",
      price: "₹500",
      validity: "3 Months",
      features: [
        "Access to all job listings",
        "Priority application review",
        "Profile highlighted to recruiters",
        "Email and SMS job alerts",
        "Resume writing assistance",
        "Access to government job listings"
      ],
      style: "silver",
      recommended: true
    },
    {
      id: 'gold',
      name: "Gold",
      description: "Premium access with backend support and 100% job security guarantee.",
      price: "₹1000",
      validity: "6 Months",
      features: [
        "Access to all job listings",
        "Priority application review",
        "Profile highlighted to recruiters",
        "Email and SMS job alerts",
        "Resume writing assistance",
        "Backend support for job applications",
        "100% job security guarantee",
        "Access to government job listings"
      ],
      style: "gold"
    }
  ];

  const membershipPlans = candidatePlans.map(plan => ({
    ...plan,
    period: plan.validity.toLowerCase(),
    limitations: [],
    popular: plan.recommended || false,
    buttonText: 'Choose Plan',
    buttonDisabled: false
  }));

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleUpgrade = async (plan) => {
    if (!user) {
      alert('Please login to upgrade your plan.');
      navigate('/candidate/login');
      return;
    }

    setProcessingPlan(plan.id);
    setLoading(true);

    try {
      // Extract price from plan (remove ₹ symbol and convert to number)
      const priceString = plan.price.replace('₹', '');
      const amount = parseInt(priceString);

      if (isNaN(amount)) {
        throw new Error('Invalid plan price');
      }

      // Initialize Razorpay checkout directly
      const options = {
        key: 'rzp_test_RNj6wvo7aRv2Zf', // Test Key ID - replace with your actual key
        amount: amount * 100, // Amount in paisa
        currency: 'INR',
        name: 'Job Portal',
        description: `${plan.name} Plan - ${plan.validity}`,
        prefill: {
          name: `${user.firstName || user.name || 'User'} ${user.lastName || ''}`,
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          user_id: user.id,
          user_type: 'candidate',
          plan_type: plan.id,
          plan_name: plan.name
        },
        theme: {
          color: '#3399cc'
        },
        handler: async function (response) {
          try {
            // Update user membership directly
            const membershipResponse = await fetch('https://api.bigsources.in/api/premium/mark-student-premium', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                is_premium: true,
                plan: plan.id,
                payment_id: response.razorpay_payment_id,
                user_type: 'candidate'
              })
            });

            if (!membershipResponse.ok) {
              throw new Error('Failed to update membership');
            }

            alert(`Successfully upgraded to ${plan.name} plan! Welcome to premium.`);
            // Optionally refresh user data or redirect to success page
            navigate('/candidate/dashboard');

          } catch (verifyError) {
            console.error('Membership update failed:', verifyError);
            alert('Payment successful but membership update failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setProcessingPlan(null);
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert('Payment failed. Please try again.');
        setProcessingPlan(null);
        setLoading(false);
      });

      rzp.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment. Please try again.');
      setProcessingPlan(null);
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <CandidateNavbar darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <main className={styles.main}>
        <section className={styles.membershipSection}>
          <div className={styles.membershipHeader}>
            <h2>Membership Plans</h2>
            <p>Choose the plan that best fits your career goals</p>
          </div>
          


          <div className={styles.plansGrid}>
            {membershipPlans.map((plan) => (
              <div
                key={plan.id}
                className={`${styles.planCard} ${plan.popular ? styles.popularPlan : ''}`}
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
                        <span className={styles.checkIcon}><Check size={16} /></span>
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
                            <span className={styles.limitIcon}><AlertTriangle size={16} /></span>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className={styles.planActions}>
                  <button
                    className={`${styles.planButton} ${styles.upgradeButton}`}
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading || processingPlan === plan.id}
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <Loader2 size={16} className={styles.spinner} />
                        Processing...
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.membershipBenefits}>
            <h3>Why Upgrade?</h3>
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><Rocket size={48} /></div>
                <h4>Unlimited Applications</h4>
                <p>Apply to as many jobs as you want without restrictions</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><Crown size={48} /></div>
                <h4>Priority Visibility</h4>
                <p>Your profile appears higher in employer searches</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><MessageCircle size={48} /></div>
                <h4>Direct Messaging</h4>
                <p>Communicate directly with hiring managers</p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}><BarChart3 size={48} /></div>
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
