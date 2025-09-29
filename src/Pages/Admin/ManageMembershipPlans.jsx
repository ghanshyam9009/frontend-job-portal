import React, { useState } from "react";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageMembershipPlans = () => {
  const [plans] = useState([
    {
      id: 1,
      name: "Free",
      price: 0,
      duration: "monthly",
      features: ["5 job applications", "Basic profile", "Email support"],
      isActive: true,
      userCount: 1250
    },
    {
      id: 2,
      name: "Premium",
      price: 29,
      duration: "monthly",
      features: ["Unlimited applications", "Advanced search", "Priority support", "Resume builder"],
      isActive: true,
      userCount: 450
    },
    {
      id: 3,
      name: "Enterprise",
      price: 99,
      duration: "monthly",
      features: ["Everything in Premium", "Custom branding", "API access", "Dedicated support"],
      isActive: true,
      userCount: 25
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusBadge = (isActive) => {
    return (
      <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Manage Membership Plans</h1>
        <p className={styles.pageSubtitle}>Configure and manage subscription plans for users</p>
      </div>

      {/* Add Plan Button */}
      <div className={styles.filtersContainer}>
        <div></div>
        <button 
          className={styles.addBtn}
          onClick={() => setShowAddModal(true)}
        >
          + Add New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div key={plan.id} className={styles.planCard}>
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>${plan.price}</span>
                <span className={styles.priceDuration}>/{plan.duration}</span>
              </div>
            </div>
            
            <div className={styles.planFeatures}>
              <h4>Features:</h4>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className={styles.planStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Users:</span>
                <span className={styles.statValue}>{plan.userCount}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Status:</span>
                {getStatusBadge(plan.isActive)}
              </div>
            </div>

            <div className={styles.planActions}>
              <button className={styles.actionBtn} title="Edit Plan">
                ✏️
              </button>
              <button className={styles.actionBtn} title="View Users">
                👥
              </button>
              <button className={styles.actionBtn} title="Toggle Status">
                🔄
              </button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💳</div>
          <h3>No membership plans</h3>
          <p>Create your first membership plan to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ManageMembershipPlans;