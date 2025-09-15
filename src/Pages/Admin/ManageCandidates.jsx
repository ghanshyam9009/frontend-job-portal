import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import styles from "../../Styles/ManageCandidates.module.css";

const ManageCandidates = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const candidatesPerPage = 10;

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Sample candidate data
  useEffect(() => {
    const sampleCandidates = [
      {
        id: 1,
        name: "Alice Johnson",
        email: "alice.j@example.com",
        status: "Subscription",
        lastActivity: "1 hour ago",
        applicationDate: "2023-10-26",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 2,
        name: "Bob Williams",
        email: "bob.w@example.com",
        status: "Trial",
        lastActivity: "3 hours ago",
        applicationDate: "2023-11-15",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 3,
        name: "Charlie Brown",
        email: "charlie.b@example.com",
        status: "Blocked",
        lastActivity: "1 day ago",
        applicationDate: "2024-01-05",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 4,
        name: "Diana Prince",
        email: "diana.p@example.com",
        status: "Subscription",
        lastActivity: "2 days ago",
        applicationDate: "2023-09-01",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 5,
        name: "Eve Adams",
        email: "eve.a@example.com",
        status: "Trial",
        lastActivity: "4 days ago",
        applicationDate: "2024-02-20",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 6,
        name: "Frank Miller",
        email: "frank.m@example.com",
        status: "Subscription",
        lastActivity: "5 days ago",
        applicationDate: "2024-01-15",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 7,
        name: "Grace Lee",
        email: "grace.l@example.com",
        status: "Trial",
        lastActivity: "1 week ago",
        applicationDate: "2024-02-10",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 8,
        name: "Henry Davis",
        email: "henry.d@example.com",
        status: "Blocked",
        lastActivity: "2 weeks ago",
        applicationDate: "2023-12-05",
        avatar: "https://via.placeholder.com/40"
      }
    ];
    setCandidates(sampleCandidates);
    setFilteredCandidates(sampleCandidates);
  }, []);

  // Filter candidates based on search and status
  useEffect(() => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    setFilteredCandidates(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, candidates]);

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
      case "Subscription":
        return styles.subscription;
      case "Trial":
        return styles.trial;
      case "Blocked":
        return styles.blocked;
      default:
        return styles.default;
    }
  };

  const getPaginatedCandidates = () => {
    const startIndex = (currentPage - 1) * candidatesPerPage;
    return filteredCandidates.slice(startIndex, startIndex + candidatesPerPage);
  };

  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  return (
    <div className={`${styles.manageCandidates} ${darkMode ? styles.darkMode : ''}`}>
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
            <h1 className={styles.pageTitle}>Manage Candidates</h1>
            
            <div className={styles.filtersAndActions}>
              <div className={styles.filters}>
                <select 
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Candidates</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Trial">Trial</option>
                  <option value="Blocked">Blocked</option>
                </select>
                
                <select className={styles.filterSelect}>
                  <option value="any">Any Activity</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <button 
                className={styles.addButton}
                onClick={() => setShowAddModal(true)}
              >
                + Add New Candidate
              </button>
            </div>
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.candidatesTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                  <th>Application Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedCandidates().map((candidate) => (
                  <tr key={candidate.id}>
                    <td>
                      <div className={styles.nameCell}>
                        <img 
                          src={candidate.avatar} 
                          alt={candidate.name}
                          className={styles.avatar}
                        />
                        <span className={styles.name}>{candidate.name}</span>
                      </div>
                    </td>
                    <td className={styles.email}>{candidate.email}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className={styles.activity}>{candidate.lastActivity}</td>
                    <td className={styles.date}>{candidate.applicationDate}</td>
                    <td>
                      <button className={styles.actionsBtn}>⋯</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCandidates.length === 0 && (
            <div className={styles.noResults}>
              <p>No candidates found matching your criteria.</p>
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

      {/* Add New Candidate Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add New Candidate</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Add new candidate functionality will be implemented here.</p>
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

export default ManageCandidates;

