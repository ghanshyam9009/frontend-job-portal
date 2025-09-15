import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import styles from "../../Styles/ManageEmployers.module.css";

const ManageEmployers = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const employersPerPage = 5;

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Sample employer data
  useEffect(() => {
    const sampleEmployers = [
      {
        id: 1,
        companyName: "Tech Innovations Inc.",
        logo: "https://via.placeholder.com/40",
        contactPerson: "Alice Johnson",
        tokens: 15000,
        subscription: "Active",
        status: "Active",
        lastActivity: "2024-07-28"
      },
      {
        id: 2,
        companyName: "Global Solutions Ltd.",
        logo: "https://via.placeholder.com/40",
        contactPerson: "Bob Williams",
        tokens: 2500,
        subscription: "Expired",
        status: "Active",
        lastActivity: "2024-07-25"
      },
      {
        id: 3,
        companyName: "Creative Minds Agency",
        logo: "https://via.placeholder.com/40",
        contactPerson: "Charlie Brown",
        tokens: 0,
        subscription: "Free Tier",
        status: "Blocked",
        lastActivity: "2024-07-10"
      },
      {
        id: 4,
        companyName: "Future Forge Studios",
        logo: "https://via.placeholder.com/40",
        contactPerson: "Diana Prince",
        tokens: 8000,
        subscription: "Active",
        status: "Active",
        lastActivity: "2024-07-29"
      },
      {
        id: 5,
        companyName: "Dynamic Innovations",
        logo: "https://via.placeholder.com/40",
        contactPerson: "Eve Adams",
        tokens: 1200,
        subscription: "Active",
        status: "Active",
        lastActivity: "2024-07-27"
      }
    ];
    setEmployers(sampleEmployers);
    setFilteredEmployers(sampleEmployers);
  }, []);

  // Filter employers based on search and status
  useEffect(() => {
    let filtered = employers;

    if (searchTerm) {
      filtered = filtered.filter(employer =>
        employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(employer => employer.status === statusFilter);
    }

    setFilteredEmployers(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, employers]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const getSubscriptionClass = (subscription) => {
    switch (subscription) {
      case "Active":
        return styles.active;
      case "Expired":
        return styles.expired;
      case "Free Tier":
        return styles.freeTier;
      default:
        return styles.default;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return styles.statusActive;
      case "Blocked":
        return styles.statusBlocked;
      default:
        return styles.default;
    }
  };

  const getPaginatedEmployers = () => {
    const startIndex = (currentPage - 1) * employersPerPage;
    return filteredEmployers.slice(startIndex, startIndex + employersPerPage);
  };

  const totalPages = Math.ceil(filteredEmployers.length / employersPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleBlockUnblock = (employer) => {
    const updatedEmployers = employers.map(emp => 
      emp.id === employer.id 
        ? { ...emp, status: emp.status === "Active" ? "Blocked" : "Active" }
        : emp
    );
    setEmployers(updatedEmployers);
  };

  return (
    <div className={`${styles.manageEmployers} ${darkMode ? styles.darkMode : ''}`}>
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
            <h1 className={styles.pageTitle}>Manage Employers</h1>
            
            <button 
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              + Add New Employer
            </button>
          </div>

          <div className={styles.searchAndFilter}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            
            <div className={styles.filterWrapper}>
              <button className={styles.filterButton}>
                Filter by Status: {statusFilter === "all" ? "All" : statusFilter} ▼
              </button>
              <div className={styles.filterDropdown}>
                <button 
                  className={styles.filterOption}
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </button>
                <button 
                  className={styles.filterOption}
                  onClick={() => setStatusFilter("Active")}
                >
                  Active
                </button>
                <button 
                  className={styles.filterOption}
                  onClick={() => setStatusFilter("Blocked")}
                >
                  Blocked
                </button>
              </div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.employersTable}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact Person</th>
                  <th>Tokens</th>
                  <th>Subscription</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedEmployers().map((employer) => (
                  <tr key={employer.id}>
                    <td>
                      <div className={styles.companyCell}>
                        <img 
                          src={employer.logo} 
                          alt={employer.companyName}
                          className={styles.companyLogo}
                        />
                        <span className={styles.companyName}>{employer.companyName}</span>
                      </div>
                    </td>
                    <td className={styles.contactPerson}>{employer.contactPerson}</td>
                    <td className={styles.tokens}>{employer.tokens.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.subscriptionBadge} ${getSubscriptionClass(employer.subscription)}`}>
                        {employer.subscription}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(employer.status)}`}>
                        {employer.status}
                      </span>
                    </td>
                    <td className={styles.lastActivity}>{employer.lastActivity}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.viewEditBtn}>
                          👁️ View/Edit
                        </button>
                        <button 
                          className={employer.status === "Active" ? styles.blockBtn : styles.unblockBtn}
                          onClick={() => handleBlockUnblock(employer)}
                        >
                          {employer.status === "Active" ? "🔒 Block" : "🔓 Unblock"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployers.length === 0 && (
            <div className={styles.noResults}>
              <p>No employers found matching your criteria.</p>
            </div>
          )}

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
        </main>
      </div>

      {/* Add New Employer Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add New Employer</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Add new employer functionality will be implemented here.</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className={styles.saveBtn}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployers;

