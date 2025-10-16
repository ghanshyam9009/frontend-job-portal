import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageCandidates = () => {
  const { theme } = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const candidatesPerPage = 10;

  // Fetch candidates data
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const candidatesData = await adminService.getCandidates();
        setCandidates(candidatesData);
        setFilteredCandidates(candidatesData);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
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
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIndex = (currentPage - 1) * candidatesPerPage;
  const endIndex = startIndex + candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Manage Candidates</h1>
        <p className={styles.pageSubtitle}>View and manage all registered candidates</p>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by name or email..."
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
            All ({candidates.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'active' ? styles.active : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active ({candidates.filter(c => c.status === 'active').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'inactive' ? styles.active : ''}`}
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive ({candidates.filter(c => c.status === 'inactive').length})
          </button>
        </div>
      </div>

      {/* Candidates Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Skills</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCandidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.userName}>{candidate.name}</span>
                  </div>
                </td>
                <td>
                  <a href={`mailto:${candidate.email}`} className={styles.emailLink}>
                    {candidate.email}
                  </a>
                </td>
                <td>{candidate.phone}</td>
                <td className={styles.locationCell}>{candidate.location}</td>
                <td>{candidate.experience}</td>
                <td>
                  <div className={styles.skillsContainer}>
                    {candidate.skills.slice(0, 2).map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 2 && (
                      <span className={styles.skillTag}>+{candidate.skills.length - 2}</span>
                    )}
                  </div>
                </td>
                <td>{getStatusBadge(candidate.status)}</td>
                <td className={styles.dateCell}>{formatDate(candidate.created_at)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionBtn} title="View Profile">
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

      {filteredCandidates.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <h3>No candidates found</h3>
          <p>No candidates match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;
