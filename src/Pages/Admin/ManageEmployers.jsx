import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { Eye, Edit, CheckCircle, Briefcase, X, Search, Building, Download } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageEmployers = () => {
  const { theme } = useTheme();
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // Combined filter: "all", "active", "inactive", "pending", "approved"
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    industry: "",
    companySize: "",
    location: ""
  });
  const [message, setMessage] = useState({ type: '', text: '' });
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

  // Function to filter and sort recruiters instantly
  const getFilteredAndSortedRecruiters = (recruitersList, search, filter) => {
    let filtered = [...recruitersList];

    if (search) {
      filtered = filtered.filter(recruiter =>
        recruiter.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        recruiter.email?.toLowerCase().includes(search.toLowerCase()) ||
        recruiter.industry?.toLowerCase().includes(search.toLowerCase()) ||
        recruiter.full_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply single filter type (only one can be active at a time)
    if (filter !== "all") {
      if (filter === "active") {
        filtered = filtered.filter(recruiter => recruiter.status === "active");
      } else if (filter === "inactive") {
        filtered = filtered.filter(recruiter => recruiter.status === "inactive");
      } else if (filter === "pending") {
        filtered = filtered.filter(recruiter => recruiter.hasadminapproved === false);
      } else if (filter === "approved") {
        filtered = filtered.filter(recruiter => recruiter.hasadminapproved === true);
      }
    }

    // Sort by date in descending order (latest first)
    filtered = filtered.sort((a, b) => {
      // Try multiple date field possibilities
      const getDateValue = (recruiter) => {
        const dateStr = recruiter.created_at || recruiter.createdAt || recruiter.date_created || recruiter.created_date || recruiter.date_joined;
        if (!dateStr) return 0;

        // Handle different date formats
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 0 : date.getTime();
      };

      const dateA = getDateValue(a);
      const dateB = getDateValue(b);

      // If both dates are invalid, maintain original order
      if (dateA === 0 && dateB === 0) return 0;

      // If one date is invalid, put valid dates first
      if (dateA === 0) return 1;
      if (dateB === 0) return -1;

      // Sort by date descending (latest first)
      return dateB - dateA;
    });

    return filtered;
  };

  // Update filtered recruiters instantly when search/filter changes
  useEffect(() => {
    const filtered = getFilteredAndSortedRecruiters(recruiters, searchTerm, filterType);
    setFilteredRecruiters(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Update filtered recruiters when recruiters data changes
  useEffect(() => {
    const filtered = getFilteredAndSortedRecruiters(recruiters, searchTerm, filterType);
    setFilteredRecruiters(filtered);
  }, [recruiters]);

  // Handle recruiter approval
  const handleApproveRecruiter = async (recruiter) => {
    try {
      setActionLoading(recruiter.employer_id);
      await adminService.approveRecruiter(recruiter);

      // Refresh the data - only update recruiters state, let useEffect handle filtering/sorting
      const response = await adminService.getAllRecruiters();
      setRecruiters(response.recruiters || []);

      setMessage({ type: 'success', text: 'Recruiter approved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to approve recruiter:', error);
      setMessage({ type: 'error', text: 'Failed to approve recruiter. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle view recruiter details
  const handleViewRecruiter = async (recruiter) => {
    try {
      // Fetch detailed recruiter data from the API with email parameter
      const response = await fetch(`https://4x10ubol84.execute-api.ap-southeast-1.amazonaws.com/default/getepmloyerdetailed?email=${encodeURIComponent(recruiter.email)}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const detailedData = await response.json();

      // The API returns a single recruiter object
      // Merge detailed data with basic data to preserve email and other fields
      const recruiterDetails = detailedData && Object.keys(detailedData).length > 0
        ? { ...recruiter, ...detailedData }
        : recruiter;

      setSelectedRecruiter(recruiterDetails);
      setEditFormData({
        companyName: recruiterDetails.company_name || recruiter.company_name || '',
        contactPerson: recruiterDetails.full_name || recruiter.full_name || '',
        email: recruiterDetails.email || recruiter.email || '',
        phone: recruiterDetails.phone_number || recruiterDetails.phone || recruiter.phone_number || recruiter.phone || '',
        industry: recruiterDetails.industry || recruiter.industry || '',
        companySize: recruiterDetails.company_size || recruiter.company_size || '',
        location: recruiterDetails.location || recruiter.location || ''
      });
      setIsEditing(false);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to fetch detailed recruiter data:', error);
      // Show error message to user
      setMessage({ type: 'error', text: 'Failed to fetch recruiter details. Using basic information.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

      // Fallback to basic data if API fails
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
      setIsEditing(false);
      setShowViewModal(true);
    }
  };

  // Handle edit recruiter - open modal
  const handleEditRecruiter = async (recruiter) => {
    try {
      // Fetch detailed recruiter data from the API with email parameter
      const response = await fetch(`https://4x10ubol84.execute-api.ap-southeast-1.amazonaws.com/default/getepmloyerdetailed?email=${encodeURIComponent(recruiter.email)}`);
      const detailedData = await response.json();

      // The API returns a single recruiter object, not an array
      const recruiterDetails = detailedData || recruiter;

      setSelectedRecruiter(recruiter);
      setEditFormData({
        companyName: recruiterDetails.company_name || recruiter.company_name || '',
        contactPerson: recruiterDetails.full_name || recruiter.full_name || '',
        email: recruiterDetails.email || recruiter.email || '',
        phone: recruiterDetails.phone_number || recruiterDetails.phone || recruiter.phone_number || recruiter.phone || '',
        industry: recruiterDetails.industry || recruiter.industry || '',
        companySize: recruiterDetails.company_size || recruiter.company_size || '',
        location: recruiterDetails.location || recruiter.location || ''
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Failed to fetch detailed recruiter data:', error);
      // Fallback to basic data if API fails
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
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    try {
      await adminService.updateRecruiter(selectedRecruiter.employer_id, editFormData);

      // Refresh the data - only update recruiters state, let useEffect handle filtering/sorting
      const response = await adminService.getAllRecruiters();
      setRecruiters(response.recruiters || []);

      setShowEditModal(false);
      setSelectedRecruiter(null);

      setMessage({ type: 'success', text: 'Recruiter updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to update recruiter:', error);
      setMessage({ type: 'error', text: 'Failed to update recruiter. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
      await adminService.rejectRecruiter(selectedRecruiter);

      // Refresh the data - only update recruiters state, let useEffect handle filtering/sorting
      const response = await adminService.getAllRecruiters();
      setRecruiters(response.recruiters || []);

      setShowRejectModal(false);
      setSelectedRecruiter(null);

      setMessage({ type: 'success', text: 'Recruiter rejected successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to reject recruiter:', error);
      setMessage({ type: 'error', text: 'Failed to reject recruiter. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Handle CSV download
  const handleDownloadCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        'Company Name',
        'Contact Person',
        'Email',
        'Phone',
        'Industry',
        'Company Size',
        'Location',
        'Status',
        'Approval Status',
        'Joined Date'
      ];

      // Prepare CSV data
      const csvData = recruiters.map(recruiter => [
        recruiter.company_name || '',
        recruiter.full_name || '',
        recruiter.email || '',
        recruiter.phone_number || recruiter.phone || '',
        recruiter.industry || '',
        recruiter.company_size || '',
        recruiter.location || '',
        recruiter.status || 'active',
        recruiter.hasadminapproved ? 'Approved' : 'Pending',
        formatDate(recruiter)
      ]);

      // Combine headers and data
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `recruiters_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ type: 'success', text: 'CSV file downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      setMessage({ type: 'error', text: 'Failed to download CSV file.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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

  const formatDate = (recruiter) => {
    const dateString = recruiter.created_at || recruiter.createdAt || recruiter.date_created;
    if (!dateString) return 'N/A';
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

      {/* Message Display */}
      {message.text && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      {/* Recruiter Management Info */}
      <div className={styles.managementInfo}>
        <div className={styles.infoCard}>
          <h3>Total Recruiters: {recruiters.length}</h3>
          <p>Pending Approval: {recruiters.filter(r => r.hasadminapproved === false).length}</p>
          <p>Approved: {recruiters.filter(r => r.hasadminapproved === true).length}</p>
          <button
            className={styles.downloadBtn}
            onClick={handleDownloadCSV}
            title="Download all recruiters as CSV"
          >
            <Download size={16} />
            Download Recruiters CSV
          </button>
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
            className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({recruiters.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'pending' ? styles.active : ''}`}
            onClick={() => setFilterType('pending')}
          >
            Pending ({recruiters.filter(e => e.hasadminapproved === false).length})
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'approved' ? styles.active : ''}`}
            onClick={() => setFilterType('approved')}
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
                <td>
                  <span className={`${styles.approvalBadge} ${recruiter.hasadminapproved ? styles.approved : styles.pending}`}>
                    {recruiter.hasadminapproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className={styles.dateCell}>{formatDate(recruiter)}</td>
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

      {/* View Modal */}
      {showViewModal && selectedRecruiter && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <Eye className={styles.modalIcon} />
              <h2>Recruiter Details</h2>
              <button
                className={styles.editBtn}
                onClick={() => setIsEditing(!isEditing)}
                title={isEditing ? "Cancel Edit" : "Edit Recruiter"}
              >
                <Edit size={16} />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Company Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.companyName}
                      onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
                      className={styles.formInput}
                      placeholder="Enter company name"
                    />
                  ) : (
                    <p>{selectedRecruiter.company_name || 'N/A'}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Contact Person</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.contactPerson}
                      onChange={(e) => setEditFormData({...editFormData, contactPerson: e.target.value})}
                      className={styles.formInput}
                      placeholder="Enter contact person name"
                    />
                  ) : (
                    <p>{selectedRecruiter.full_name || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className={styles.formInput}
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p>{selectedRecruiter.email || 'N/A'}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      className={styles.formInput}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p>{selectedRecruiter.phone_number || selectedRecruiter.phone || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Industry</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFormData.industry}
                      onChange={(e) => setEditFormData({...editFormData, industry: e.target.value})}
                      className={styles.formInput}
                      placeholder="Enter industry"
                    />
                  ) : (
                    <p>{selectedRecruiter.industry || 'N/A'}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Company Size</label>
                  {isEditing ? (
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
                  ) : (
                    <p>{selectedRecruiter.company_size || 'N/A'}</p>
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                    className={styles.formInput}
                    placeholder="Enter location"
                  />
                ) : (
                  <p>{selectedRecruiter.location || 'N/A'}</p>
                )}
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <p>{getStatusBadge(selectedRecruiter.status)}</p>
                </div>
                <div className={styles.formGroup}>
                  <label>Approval</label>
                  <p>{selectedRecruiter.hasadminapproved ? 'Approved' : 'Pending'}</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Joined Date</label>
                <p>{formatDate(selectedRecruiter)}</p>
              </div>
            </div>
            <div className={styles.modalActions}>
              {/* Left side buttons - Approve/Reject */}
              {!selectedRecruiter.hasadminapproved && !isEditing && (
                <div className={styles.modalActionsLeft}>
                  <button
                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                    onClick={() => {
                      handleApproveRecruiter(selectedRecruiter);
                      setShowViewModal(false);
                      setSelectedRecruiter(null);
                    }}
                    disabled={actionLoading === selectedRecruiter.employer_id}
                  >
                    {actionLoading === selectedRecruiter.employer_id ? 'Approving...' : 'Approve Recruiter'}
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.rejectBtn}`}
                    onClick={() => {
                      handleRejectRecruiter(selectedRecruiter);
                      setShowViewModal(false);
                    }}
                  >
                    Reject Recruiter
                  </button>
                </div>
              )}

              {/* Right side buttons */}
              <div className={styles.modalActionsRight}>
                {isEditing && (
                  <>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data to original values
                        setEditFormData({
                          companyName: selectedRecruiter.company_name || '',
                          contactPerson: selectedRecruiter.full_name || '',
                          email: selectedRecruiter.email || '',
                          phone: selectedRecruiter.phone_number || selectedRecruiter.phone || '',
                          industry: selectedRecruiter.industry || '',
                          companySize: selectedRecruiter.company_size || '',
                          location: selectedRecruiter.location || ''
                        });
                      }}
                    >
                      Cancel Edit
                    </button>
                    <button
                      className={styles.submitBtn}
                      onClick={async () => {
                        try {
                          await adminService.updateRecruiter(selectedRecruiter.employer_id, editFormData);

                          // Refresh the data
                          const response = await adminService.getAllRecruiters();
                          setRecruiters(response.recruiters || []);

                          setIsEditing(false);
                          setMessage({ type: 'success', text: 'Recruiter updated successfully!' });
                          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                        } catch (error) {
                          console.error('Failed to update recruiter:', error);
                          setMessage({ type: 'error', text: 'Failed to update recruiter. Please try again.' });
                          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                        }
                      }}
                    >
                      Save Changes
                    </button>
                  </>
                )}
                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedRecruiter(null);
                    setIsEditing(false);
                  }}
                >
                  Close
                </button>
              </div>
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
