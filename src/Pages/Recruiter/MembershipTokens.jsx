import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import styles from "../../Styles/RecruiterDashboard.module.css";

const MembershipTokens = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tokenBalance] = useState(1250);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const tokenPacks = [
    {
      id: 1,
      tokens: 10,
      price: 100.00,
      description: "Ideal for small teams or occasional hiring needs.",
      popular: false
    },
    {
      id: 2,
      tokens: 20,
      price: 180.00,
      originalPrice: 200.00,
      discount: "Save 10%",
      description: "Best value for growing teams looking for flexibility.",
      popular: false
    },
    {
      id: 3,
      tokens: 50,
      price: 400.00,
      originalPrice: 500.00,
      discount: "Save 20%",
      description: "Excellent value for large enterprises with continuous hiring.",
      popular: false
    }
  ];

  const subscriptionPlans = [
    {
      id: 1,
      name: "Basic Plan",
      price: 99,
      period: "month",
      tokens: 50,
      features: [
        "Access to basic job posting features",
        "Standard applicant tracking",
        "Email support"
      ],
      popular: false,
      buttonText: "Select Plan",
      buttonStyle: "green"
    },
    {
      id: 2,
      name: "Pro Plan",
      price: 199,
      period: "month",
      tokens: 150,
      discount: "Recommended",
      features: [
        "Premium features & analytics dashboard",
        "Advanced candidate matching",
        "Priority email & chat support",
        "Dedicated account manager"
      ],
      popular: true,
      buttonText: "Select Plan",
      buttonStyle: "blue"
    },
    {
      id: 3,
      name: "Enterprise Plan",
      price: "Custom",
      period: "",
      tokens: "Unlimited",
      features: [
        "All Pro features",
        "Custom integrations (API access)",
        "On-site training & workshops",
        "24/7 dedicated support"
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonStyle: "green"
    }
  ];

  const handlePurchaseTokens = (pack) => {
    alert(`Purchasing ${pack.tokens} tokens for ₹${pack.price}`);
    // Here you would integrate with payment gateway
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    if (plan.name === "Enterprise Plan") {
      alert("Contacting sales team for Enterprise plan...");
    } else {
      alert(`Selected ${plan.name} - ₹${plan.price}/${plan.period}`);
      // Here you would integrate with payment gateway
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <RecruiterSidebar darkMode={darkMode} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <section className={styles.membershipTokensSection}>
          <div className={styles.sectionHeader}>
            <h1>Employer Membership & Tokens</h1>
            <p>Manage your token balance and choose the perfect plan for your hiring needs</p>
          </div>

          {/* Current Token Balance */}
          <div className={styles.tokenBalanceCard}>
            <div className={styles.balanceInfo}>
              <h2>Current Token Balance</h2>
              <div className={styles.balanceAmount}>
                <span className={styles.balanceNumber}>{tokenBalance.toLocaleString()}</span>
                <span className={styles.balanceLabel}>Tokens</span>
              </div>
              <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            <div className={styles.balanceIcon}>
              <div className={styles.tokenIcon}>💰</div>
            </div>
          </div>

          {/* One-Time Token Packs */}
          <div className={styles.tokenPacksSection}>
            <div className={styles.sectionTitle}>
              <h2>One-Time Token Packs</h2>
              <p>Purchase additional tokens as needed for one-off job postings or feature unlocks. Tokens never expire.</p>
            </div>
            
            <div className={styles.tokenPacksGrid}>
              {tokenPacks.map((pack) => (
                <div key={pack.id} className={styles.tokenPackCard}>
                  <div className={styles.packHeader}>
                    <div className={styles.packTokens}>
                      <span className={styles.tokenNumber}>{pack.tokens}</span>
                      <span className={styles.tokenLabel}>Tokens Pack</span>
                    </div>
                    {pack.discount && (
                      <span className={styles.discountBadge}>{pack.discount}</span>
                    )}
                  </div>
                  
                  <div className={styles.packPricing}>
                    {pack.originalPrice && (
                      <span className={styles.originalPrice}>₹{pack.originalPrice.toFixed(2)}</span>
                    )}
                    <span className={styles.currentPrice}>₹{pack.price.toFixed(2)}</span>
                  </div>
                  
                  <p className={styles.packDescription}>{pack.description}</p>
                  
                  <button 
                    className={styles.purchaseBtn}
                    onClick={() => handlePurchaseTokens(pack)}
                  >
                    Purchase Pack
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Subscription Plans */}
          <div className={styles.subscriptionPlansSection}>
            <div className={styles.sectionTitle}>
              <h2>Monthly Subscription Plans</h2>
              <p>Choose a plan that fits your regular hiring volume and unlocks premium platform features.</p>
            </div>
            
            <div className={styles.subscriptionPlansGrid}>
              {subscriptionPlans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`${styles.subscriptionPlanCard} ${plan.popular ? styles.popularPlan : ''}`}
                >
                  {plan.discount && (
                    <div className={styles.recommendedBadge}>{plan.discount}</div>
                  )}
                  
                  <div className={styles.planHeader}>
                    <h3 className={styles.planName}>{plan.name}</h3>
                    <div className={styles.planPricing}>
                      <span className={styles.planPrice}>
                        {typeof plan.price === 'string' ? plan.price : `₹${plan.price}`}
                        {plan.period && <span className={styles.planPeriod}>/{plan.period}</span>}
                      </span>
                      <span className={styles.planTokens}>{plan.tokens} Tokens/month</span>
                    </div>
                  </div>
                  
                  <div className={styles.planFeatures}>
                    <ul className={styles.featuresList}>
                      {plan.features.map((feature, index) => (
                        <li key={index} className={styles.featureItem}>
                          <span className={styles.checkIcon}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    className={`${styles.selectPlanBtn} ${styles[plan.buttonStyle]}`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Token Usage Guide */}
          <div className={styles.usageGuide}>
            <h3>How Tokens Work</h3>
            <div className={styles.usageGrid}>
              <div className={styles.usageItem}>
                <div className={styles.usageIcon}>📝</div>
                <h4>Job Posting</h4>
                <p>5 tokens per job posting</p>
              </div>
              <div className={styles.usageItem}>
                <div className={styles.usageIcon}>🔍</div>
                <h4>Advanced Search</h4>
                <p>2 tokens per advanced candidate search</p>
              </div>
              <div className={styles.usageItem}>
                <div className={styles.usageIcon}>📊</div>
                <h4>Analytics</h4>
                <p>3 tokens for detailed job analytics</p>
              </div>
              <div className={styles.usageItem}>
                <div className={styles.usageIcon}>⭐</div>
                <h4>Featured Jobs</h4>
                <p>10 tokens to feature your job</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MembershipTokens;
