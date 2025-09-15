import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import styles from "../../Styles/ManageMembershipPlans.module.css";

const ManageMembershipPlans = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("membership");
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const transactionsPerPage = 5;

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Sample data
  useEffect(() => {
    const sampleMembershipPlans = [
      {
        id: 1,
        name: "Basic Membership",
        price: "₹190 / Monthly",
        features: [
          "Access to basic content",
          "5 project templates",
          "Email support"
        ],
        status: "Active"
      },
      {
        id: 2,
        name: "Pro Membership",
        price: "₹490 / Annually",
        features: [
          "All Basic features",
          "20 premium templates",
          "Priority support",
          "Advanced analytics",
          "100 Tokens Included"
        ],
        status: "Active"
      },
      {
        id: 3,
        name: "Enterprise Solution",
        price: "₹990 / Annually",
        features: [
          "All Pro features",
          "Unlimited templates",
          "Dedicated account manager",
          "Custom integrations",
          "500 Tokens Included"
        ],
        status: "Inactive"
      }
    ];

    const sampleTransactions = [
      {
        id: "TXN78901",
        user: "Alice Smith",
        plan: "Pro Membership",
        amount: "₹490",
        status: "Completed",
        date: "2024-07-28"
      },
      {
        id: "TXN78902",
        user: "Bob Johnson",
        plan: "Starter Token Pack",
        amount: "₹50",
        status: "Pending",
        date: "2024-07-27"
      },
      {
        id: "TXN78903",
        user: "Charlie Brown",
        plan: "Basic Membership",
        amount: "₹190",
        status: "Completed",
        date: "2024-07-26"
      },
      {
        id: "TXN78904",
        user: "Diana Prince",
        plan: "Ultimate Token Vault",
        amount: "₹500",
        status: "Completed",
        date: "2024-07-25"
      },
      {
        id: "TXN78905",
        user: "Eve Adams",
        plan: "Pro Membership",
        amount: "₹490",
        status: "Failed",
        date: "2024-07-24"
      }
    ];

    setMembershipPlans(sampleMembershipPlans);
    setTransactions(sampleTransactions);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return styles.active;
      case "Inactive":
        return styles.inactive;
      case "Completed":
        return styles.completed;
      case "Pending":
        return styles.pending;
      case "Failed":
        return styles.failed;
      default:
        return styles.default;
    }
  };

  const getPaginatedTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    return transactions.slice(startIndex, startIndex + transactionsPerPage);
  };

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditPlan = (plan) => {
    console.log("Edit plan:", plan);
  };

  const handleDeletePlan = (plan) => {
    console.log("Delete plan:", plan);
  };

  return (
    <div className={`${styles.manageMembershipPlans} ${darkMode ? styles.darkMode : ''}`}>
      <AdminNavbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        onMobileMenuToggle={toggleSidebar}
      />
      
      <div className={styles.container}>
        <AdminSidebar 
          darkMode={darkMode} 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        
        <main className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Manage Membership Plans</h1>
          </div>

          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === "membership" ? styles.active : ''}`}
              onClick={() => setActiveTab("membership")}
            >
              Membership Plans
            </button>
            <button 
              className={`${styles.tab} ${activeTab === "tokens" ? styles.active : ''}`}
              onClick={() => setActiveTab("tokens")}
            >
              Token Plans
            </button>
          </div>

          {activeTab === "membership" && (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Membership Plans Overview</h2>
                <button 
                  className={styles.createButton}
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create New Plan
                </button>
              </div>

              <div className={styles.plansGrid}>
                {membershipPlans.map((plan) => (
                  <div key={plan.id} className={styles.planCard}>
                    <div className={styles.planHeader}>
                      <h3 className={styles.planName}>{plan.name}</h3>
                      <span className={`${styles.statusBadge} ${getStatusClass(plan.status)}`}>
                        {plan.status}
                      </span>
                    </div>
                    
                    <div className={styles.planPrice}>{plan.price}</div>
                    
                    <div className={styles.planFeatures}>
                      {plan.features.map((feature, index) => (
                        <div key={index} className={styles.feature}>
                          <span className={styles.checkmark}>✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.planActions}>
                      <button 
                        className={styles.editBtn}
                        onClick={() => handleEditPlan(plan)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeletePlan(plan)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.transactionSection}>
                <h2 className={styles.sectionTitle}>Transaction Overview</h2>
                <h3 className={styles.subsectionTitle}>Recent Transactions</h3>
                
                <div className={styles.tableContainer}>
                  <table className={styles.transactionsTable}>
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>User</th>
                        <th>Plan</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedTransactions().map((transaction) => (
                        <tr key={transaction.id}>
                          <td className={styles.transactionId}>{transaction.id}</td>
                          <td className={styles.user}>{transaction.user}</td>
                          <td className={styles.plan}>{transaction.plan}</td>
                          <td className={styles.amount}>{transaction.amount}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className={styles.date}>{transaction.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.paginationBtn}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`${styles.paginationBtn} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      className={styles.paginationBtn}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.chartSection}>
                <h3 className={styles.chartTitle}>Payment Distribution</h3>
                <div className={styles.chartContainer}>
                  <div className={styles.barChart}>
                    <div className={styles.yAxis}>
                      <span>₹2600</span>
                      <span>₹1950</span>
                      <span>₹1300</span>
                      <span>₹650</span>
                      <span>₹0</span>
                    </div>
                    <div className={styles.chartArea}>
                      <div className={styles.chartBars}>
                        <div className={styles.barGroup}>
                          <div className={`${styles.bar} ${styles.bar1}`} style={{height: '80%'}}></div>
                          <div className={`${styles.bar} ${styles.bar2}`} style={{height: '60%'}}></div>
                          <div className={`${styles.bar} ${styles.bar3}`} style={{height: '40%'}}></div>
                          <div className={`${styles.bar} ${styles.bar4}`} style={{height: '20%'}}></div>
                        </div>
                        <div className={styles.barGroup}>
                          <div className={`${styles.bar} ${styles.bar1}`} style={{height: '90%'}}></div>
                          <div className={`${styles.bar} ${styles.bar2}`} style={{height: '70%'}}></div>
                          <div className={`${styles.bar} ${styles.bar3}`} style={{height: '50%'}}></div>
                          <div className={`${styles.bar} ${styles.bar4}`} style={{height: '30%'}}></div>
                        </div>
                      </div>
                      <div className={styles.xAxis}>
                        <span>Pro Membership</span>
                        <span>Enterprise</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.legend}>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.legend1}`}></span>
                      <span>Q1</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.legend2}`}></span>
                      <span>Q2</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.legend3}`}></span>
                      <span>Q3</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={`${styles.legendColor} ${styles.legend4}`}></span>
                      <span>Q4</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "tokens" && (
            <div className={styles.tokenPlansSection}>
              <h2 className={styles.sectionTitle}>Token Plans</h2>
              <p>Token plans management will be implemented here.</p>
            </div>
          )}
        </main>
      </div>

      {/* Create New Plan Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create New Plan</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Create new plan functionality will be implemented here.</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button className={styles.saveBtn}>Create Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembershipPlans;

