import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import styles from "../../Styles/AdminDashboard.module.css";
import { planService } from "../../services/planService";

const ManageMembershipPlans = () => {
  const { theme } = useTheme();
  const [plans, setPlans] = useState([]);
  const [planType, setPlanType] = useState("CANDIDATE"); // CANDIDATE or RECRUITER
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await planService.getPlansByUserType(planType);
      setPlans(response.data || []);
    } catch (err) {
      setError("Failed to fetch plans. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [planType]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentPlan({
      name: "",
      price: 0,
      duration: "monthly",
      features: [],
      status: "Active",
      user_type: planType,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (plan) => {
    setIsEditing(true);
    setCurrentPlan({ ...plan, features: Array.isArray(plan.features) ? plan.features : [] });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPlan(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeaturesChange = (e) => {
    const featuresArray = e.target.value.split('\n');
    setCurrentPlan((prev) => ({ ...prev, features: featuresArray }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPlan) return;

    const planData = {
      ...currentPlan,
      price: Number(currentPlan.price),
    };

    try {
      if (isEditing) {
        await planService.updatePlan(currentPlan.id, planData);
      } else {
        await planService.createPlan(planData);
      }
      fetchPlans();
      handleCloseModal();
    } catch (err) {
      setError("Failed to save plan.");
      console.error(err);
    }
  };

  const handleToggleStatus = async (plan) => {
    const updatedPlan = { ...plan, status: plan.status === 'Active' ? 'Inactive' : 'Active' };
    try {
      await planService.updatePlan(plan.id, updatedPlan);
      fetchPlans();
    } catch (err) {
      setError("Failed to update plan status.");
      console.error(err);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await planService.deletePlan(planId);
        fetchPlans();
      } catch (err) {
        setError("Failed to delete plan.");
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'Active';
    return (
      <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Manage Membership Plans</h1>
        <p className={styles.pageSubtitle}>Configure and manage subscription plans for users</p>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.planTypeFilter}>
          <button onClick={() => setPlanType("CANDIDATE")} className={planType === 'CANDIDATE' ? styles.activeFilter : ''}>Candidate Plans</button>
          <button onClick={() => setPlanType("RECRUITER")} className={planType === 'RECRUITER' ? styles.activeFilter : ''}>Recruiter Plans</button>
        </div>
        <button className={styles.addBtn} onClick={handleOpenAddModal}>
          + Add New Plan
        </button>
      </div>

      {isLoading && <p>Loading plans...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {!isLoading && !error && (
        <>
          <div className={styles.plansGrid}>
            {plans.map((plan) => (
              <div key={plan.id} className={styles.planCard}>
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.priceAmount}>₹{plan.price}</span>
                    <span className={styles.priceDuration}>/{plan.duration}</span>
                  </div>
                </div>
                
                <div className={styles.planFeatures}>
                  <h4>Features:</h4>
                  <ul>
                    {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.planStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Users:</span>
                    <span className={styles.statValue}>{plan.userCount || 0}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Status:</span>
                    {getStatusBadge(plan.status)}
                  </div>
                </div>

                <div className={styles.planActions}>
                  <button className={styles.actionBtn} title="Edit Plan" onClick={() => handleOpenEditModal(plan)}>✏️</button>
                  <button className={styles.actionBtn} title="Toggle Status" onClick={() => handleToggleStatus(plan)}>🔄</button>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Plan" onClick={() => handleDeletePlan(plan.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {plans.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💳</div>
              <h3>No membership plans for {planType.toLowerCase()}s</h3>
              <p>Create the first membership plan to get started.</p>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{isEditing ? "Edit" : "Add"} Membership Plan</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formField}>
                <label>Plan Name</label>
                <input type="text" name="name" value={currentPlan.name} onChange={handleInputChange} required />
              </div>
              <div className={styles.formField}>
                <label>Price (₹)</label>
                <input type="number" name="price" value={currentPlan.price} onChange={handleInputChange} required min="0" />
              </div>
              <div className={styles.formField}>
                <label>Duration</label>
                <select name="duration" value={currentPlan.duration} onChange={handleInputChange}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label>Features (one per line)</label>
                <textarea name="features" rows="5" value={Array.isArray(currentPlan.features) ? currentPlan.features.join('\n') : ''} onChange={handleFeaturesChange}></textarea>
              </div>
              <div className={styles.formField}>
                <label>Status</label>
                <select name="status" value={currentPlan.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>{isEditing ? "Save Changes" : "Create Plan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembershipPlans;
