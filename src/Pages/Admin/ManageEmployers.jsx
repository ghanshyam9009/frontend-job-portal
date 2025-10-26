import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { Eye, Edit, Ban, CheckCircle, Briefcase, X, Search, Building } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageEmployers = () => {
  const { theme } = useTheme();
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [editFormData, setEditFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    industry: "",
    companySize: "",
    location: ""
  });
  const recruitersPerPage = 10;

  // Fetch recruiters data
  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllRecruiters();
        const data = response.recruiters || [];
        setRecruiters(data);
        setFilteredRecruiters(data);
      } catch (error) {
        console.error('Failed to fetch recruiters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiters();
  }, []);

  // Filter recruiters based on search and status
  useEffect(() => {
    let filtered = recruiters;

    if (searchTerm) {
      filtered = filtered.filter(recruiter =>
        recruiter.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recruiter.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recruiter.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recruiter.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(recruiter => recruiter.status === statusFilter);
    }

    if (approvalFilter !== "all") {
      if (approvalFilter === "pending") {
        filtered = filtered.filter(recruiter => recruiter.hasadminapproved === false);
      } else if (approvalFilter === "approved") {
        filtered = filtered.filter(recruiter => recruiter.hasadminapproved === true);
      }
    }

    setFilteredRecruiters(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, approvalFilter, recruiters]);

  // Handle recruiter approval
  const handleApproveRecruiter = async (recruiterId) => {
    try {
      setActionLoading(recruiterId);
      await adminService.approveRecruiter(recruiterId);

      // Refresh the data
      const response = await adminService.getAllRecruiters();
      setRecruiters(response.recruiters || []);
      setFilteredRecruiters(response.recruiters || []);

      alert('Recruiter approved successfully!');
    } catch (error) {
      console.error('Failed to approve recruiter:', error);
      alert('Failed to approve recruiter. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle view recruiter details
  const handleViewRecruiter = (recruiter) => {
    alert(`Viewing details for: ${recruiter.full_name || recruiter.company_name}\nEmail: ${recruiter.email}\nStatus: ${recruiter.status}\nApproval: ${recruiter.hasadminapproved ? 'Approved' : 'Pending'}`);
  };

  // Handle edit recruiter - open modal
  const handleEditRecruiter = (recruiter) => {
    setSelectedRecruiter(recruiter);
    setEditFormData({
      companyName: recruiter.company_name || '',
      contactPerson: recruiter.full_name || '',
      email: recruiter.email || '',
      phone: recruiter.phone_number || recruiter.phone || '',
      industry: recruiter.industry || '',
      companySize: recruiter.company_size || '',
      location: recruiter.location || ''
    });
    setShowEditModal(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    try {
      // In a real implementation, you would call an API to update the recruiter
      // For now, we'll just show a success message and update the local state
      const updatedRecruiters = recruiters.map(r => {
        if (r.employer_id === selectedRecruiter.employer_id) {
          return {
            ...r,
            company_name: editFormData.companyName,
            full_name: editFormData.contactPerson,
            email: editFormData.email,
            phone_number: editFormData.phone,
            industry: editFormData.industry,
            company_size: editFormData.companySize,
            location: editFormData.location
          };
        }
        return r;
      });

      setRecruiters(updatedRecruiters);
      setFilteredRecruiters(updatedRecruiters);
      setShowEditModal(false);
      setSelectedRecruiter(null);

      alert('Recruiter updated successfully!');
    } catch (error) {
      console.error('Failed to update recruiter:', error);
      alert('Failed to update recruiter. Please try again.');
    }
  };

  // Handle reject recruiter
  const handleRejectRecruiter = (recruiter) => {
    setSelectedRecruiter(recruiter);
    setShowRejectModal(true);
  };

  // Handle reject confirmation
  const handleRejectConfirm = async () => {
    try {
      // In a real implementation, you would call an API to reject the recruiter
      // For now, we'll just show a success message and update the local state
      const updatedRecruiters = recruiters.map(r => {
        if (r.employer_id === selectedRecruiter.employer_id) {
          return {
            ...r,
            hasadminapproved: false,
            status: 'rejected'
          };
        }
        return r;
      });

      setRecruiters(updatedRecruiters);
      setFilteredRecruiters(updatedRecruiters);
      setShowRejectModal(false);
      setSelectedRecruiter(null);

      alert('Recruiter rejected successfully!');
    } catch (error) {
      console.error('Failed to reject recruiter:', error);
      alert('Failed to reject recruiter. Please try again.');
    }
  };

  // Handle block/unblock recruiter
  const handleBlockRecruiter = async (recruiter) => {
    const action = recruiter.status === 'active' ? 'block' : 'unblock';
    const confirmMessage = `Are you sure you want to ${action} this recruiter: ${recruiter.full_name || recruiter.company_name}?`;

    if (window.confirm(confirmMessage)) {
      try {
        // In a real implementation, you would call an API to update the recruiter status
        // For now, we'll just show a success message and update the local state
        const updatedRecruiters = recruiters.map(r => {
          if (r.employer_id === recruiter.employer_id) {
            return {
              ...r,
              status: r.status === 'active' ? 'blocked' : 'active'
            };
          }
          return r;
        });

        setRecruiters(updatedRecruiters);
        setFilteredRecruiters(updatedRecruiters);

        alert(`Recruiter ${action}ed successfully!`);
      } catch (error) {
        console.error(`Failed to ${action} recruiter:`, error);
        alert(`Failed to ${action} recruiter. Please try again.`);
      }
    }
  };

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
  const totalPages = Math.ceil(filteredRecruiters.length / recruitersPerPage);
  const startIndex = (currentPage - 1) * recruitersPerPage;
  const endIndex = startIndex + recruitersPerPage;
  const currentRecruiters = filteredRecruiters.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading recruiters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Manage Employers</h1>
        <p className={styles.pageSubtitle}>View and manage all registered employers and companies</p>
      </div>

      {/* Recruiter Management Info */}
      <div className={styles.managementInfo}>
        <div className={styles.infoCard}>
          <h3>Total Recruiters: {recruiters.length}</h3>
          <p>Pending Approval: {recruiters.filter(r => r.hasadminapproved === false).length}</p>
          <p>Approved: {recruiters.filter(r => r.hasadminapproved === true).length}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by company name, email, full name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <Search className={styles.searchIcon} />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({recruiters.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'active' ? styles.active : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active ({recruiters.filter(e => e.status === 'active').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'inactive' ? styles.active : ''}`}
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive ({recruiters.filter(e => e.status === 'inactive').length})
          </button>

          <button
            className={`${styles.filterBtn} ${approvalFilter === 'pending' ? styles.active : ''}`}
            onClick={() => setApprovalFilter('pending')}
          >
            Pending ({recruiters.filter(e => e.hasadminapproved === false).length})
          </button>
          <button
            className={`${styles.filterBtn} ${approvalFilter === 'approved' ? styles.active : ''}`}
            onClick={() => setApprovalFilter('approved')}
          >
            Approved ({recruiters.filter(e => e.hasadminapproved === true).length})
          </button>
        </div>
      </div>

      {/* Recruiters Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Industry</th>
              <th>Size</th>
              <th>Status</th>
              <th>Approval</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRecruiters.map((recruiter) => (
              <tr key={recruiter.id || recruiter.employer_id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {recruiter.company_name?.charAt(0).toUpperCase() || recruiter.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className={styles.userName}>
                      {recruiter.full_name || recruiter.company_name || 'N/A'}
                    </span>
                  </div>
                </td>
                <td>
                  <a href={`mailto:${recruiter.email}`} className={styles.emailLink}>
                    {recruiter.email}
                  </a>
                </td>
                <td>{recruiter.phone_number || recruiter.phone || 'N/A'}</td>
                <td className={styles.locationCell}>{recruiter.location || 'N/A'}</td>
                <td>
                  <span className={styles.industryTag}>{recruiter.industry || 'N/A'}</span>
                </td>
                <td>{recruiter.company_size || 'N/A'}</td>
                <td>{getStatusBadge(recruiter.status)}</td>
                <td>
                  <span className={`${styles.approvalBadge} ${recruiter.hasadminapproved ? styles.approved : styles.pending}`}>
                    {recruiter.hasadminapproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className={styles.dateCell}>{formatDate(recruiter.created_at)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionBtn}
                      title="View Details"
                      onClick={() => handleViewRecruiter(recruiter)}
                    >
                      <Eye />
                    </button>
                    <button
                      className={styles.actionBtn}
                      title="Edit"
                      onClick={() => handleEditRecruiter(recruiter)}
                    >
                      <Edit />
                    </button>
                    {!recruiter.hasadminapproved && (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.approveBtn}`}
                          title="Approve Recruiter"
                          onClick={() => handleApproveRecruiter(recruiter.employer_id)}
                          disabled={actionLoading === recruiter.employer_id}
                        >
                          {actionLoading === recruiter.employer_id ? '⏳' : <CheckCircle />}
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.rejectBtn}`}
                          title="Reject Recruiter"
                          onClick={() => handleRejectRecruiter(recruiter)}
                        >
                          <X />
                        </button>
                      </>
                    )}
                    <button
                      className={styles.actionBtn}
                      title="Block/Unblock"
                      onClick={() => handleBlockRecruiter(recruiter)}
                    >
                      <Ban />
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

      {filteredRecruiters.length === 0 && (
        <div className={styles.emptyState}>
          <Briefcase className={styles.emptyIcon} />
          <h3>No recruiters found</h3>
          <p>No recruiters match your current filters.</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRecruiter && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <Edit className={styles.modalIcon} />
              <h2>Edit Recruiter</h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
                    className={styles.formInput}
                    placeholder="Enter company name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Contact Person</label>
                  <input
                    type="text"
                    value={editFormData.contactPerson}
                    onChange={(e) => setEditFormData({...editFormData, contactPerson: e.target.value})}
                    className={styles.formInput}
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className={styles.formInput}
                    placeholder="Enter email address"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className={styles.formInput}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Industry</label>
                  <input
                    type="text"
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({...editFormData, industry: e.target.value})}
                    className={styles.formInput}
                    placeholder="Enter industry"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company Size</label>
                  <select
                    value={editFormData.companySize}
                    onChange={(e) => setEditFormData({...editFormData, companySize: e.target.value})}
                    className={styles.formInput}
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  className={styles.formInput}
                  placeholder="Enter location"
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRecruiter(null);
                }}
              >
                Cancel
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleEditSubmit}
              >
                Update Recruiter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRecruiter && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <X className={styles.modalIcon} style={{color: '#ef4444'}} />
              <h2>Reject Recruiter</h2>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to reject this recruiter?</p>
              <div className={styles.recruiterInfo}>
                <p><strong>Company:</strong> {selectedRecruiter.company_name}</p>
                <p><strong>Contact Person:</strong> {selectedRecruiter.full_name}</p>
                <p><strong>Email:</strong> {selectedRecruiter.email}</p>
              </div>
              <p>This action will mark the recruiter as rejected and they will not be able to log in.</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRecruiter(null);
                }}
              >
                Cancel
              </button>
              <button
                className={styles.rejectBtn}
                onClick={handleRejectConfirm}
              >
                Reject Recruiter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployers;
