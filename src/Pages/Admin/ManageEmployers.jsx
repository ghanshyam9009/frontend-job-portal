import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageEmployers = () => {
  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const employersPerPage = 10;

  // Fetch employers data
  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        setLoading(true);
        const employersData = await adminService.getEmployers();
        setEmployers(employersData);
        setFilteredEmployers(employersData);
      } catch (error) {
        console.error('Failed to fetch employers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployers();
  }, []);

  // Filter employers based on search and status
  useEffect(() => {
    let filtered = employers;

    if (searchTerm) {
      filtered = filtered.filter(employer =>
        employer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employer.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(employer => employer.status === statusFilter);
    }

    setFilteredEmployers(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, employers]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: { class: 'statusActive', text: 'Active' },
      inactive: { class: 'statusInactive', text: 'Inactive' },
      blocked: { class: 'statusBlocked', text: 'Blocked' }
    };
    
    const statusInfo = statusStyles[status] || statusStyles.active;
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredEmployers.length / employersPerPage);
  const startIndex = (currentPage - 1) * employersPerPage;
  const endIndex = startIndex + employersPerPage;
  const currentEmployers = filteredEmployers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading employers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Manage Employers</h1>
        <p className={styles.pageSubtitle}>View and manage all registered employers and companies</p>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by company name, email, or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
        
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({employers.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'active' ? styles.active : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active ({employers.filter(e => e.status === 'active').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'inactive' ? styles.active : ''}`}
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive ({employers.filter(e => e.status === 'inactive').length})
          </button>
        </div>
      </div>

      {/* Employers Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Industry</th>
              <th>Size</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployers.map((employer) => (
              <tr key={employer.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {employer.company_name.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.userName}>{employer.company_name}</span>
                  </div>
                </td>
                <td>
                  <a href={`mailto:${employer.email}`} className={styles.emailLink}>
                    {employer.email}
                  </a>
                </td>
                <td>{employer.phone}</td>
                <td className={styles.locationCell}>{employer.location}</td>
                <td>
                  <span className={styles.industryTag}>{employer.industry}</span>
                </td>
                <td>{employer.company_size}</td>
                <td>{getStatusBadge(employer.status)}</td>
                <td className={styles.dateCell}>{formatDate(employer.created_at)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionBtn} title="View Company">
                      👁️
                    </button>
                    <button className={styles.actionBtn} title="Edit">
                      ✏️
                    </button>
                    <button className={styles.actionBtn} title="Block/Unblock">
                      🚫
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {filteredEmployers.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💼</div>
          <h3>No employers found</h3>
          <p>No employers match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ManageEmployers;