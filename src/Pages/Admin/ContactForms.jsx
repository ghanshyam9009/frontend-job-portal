import React, { useState, useEffect } from 'react';
import { useTheme } from '../../Contexts/ThemeContext';
import { User, Building, Eye, Search, Phone, X } from 'lucide-react';
import styles from '../../Styles/AdminDashboard.module.css';
import { contactService } from '../../services/contactService';

const ContactForms = () => {
  const { theme } = useTheme();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, candidate, recruiter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch contact forms from API
  useEffect(() => {
    const fetchContactForms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await contactService.getAllContacts();

        // Handle different API response structures
        let dataArray = [];
        if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where data is wrapped in an object
          const possibleArrays = ['data', 'contacts', 'forms', 'results'];
          for (const key of possibleArrays) {
            if (Array.isArray(response.data[key])) {
              dataArray = response.data[key];
              break;
            }
          }
          // If no array found in common properties, check if data itself is the array
          if (dataArray.length === 0 && Array.isArray(response)) {
            dataArray = response;
          }
        }

        if (dataArray.length > 0) {
          // Transform API data to match component expectations
          const transformedData = dataArray.map((item, index) => ({
            id: item.contact_id || index + 1,
            name: item.name,
            email: item.email,
            userType: item.userType || item.user_type || 'candidate', // Fallback to candidate
            message: item.message || item.question || '', // Handle both message and question fields
            submittedAt: item.created_at || item.createdAt || new Date().toISOString(),
            status: 'new' // Default status since API may not provide status
          }));

          setForms(transformedData);
        } else {
          // API returned empty data or unexpected structure
          console.log('API returned unexpected structure:', response);
          setForms([]);
        }
      } catch (err) {
        console.error('Error fetching contact forms:', err);
        setError('Failed to load contact forms. Please try again.');
        // Fallback to empty array
        setForms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContactForms();
  }, []);

  const filteredForms = forms.filter(form => {
    const matchesFilter = filter === 'all' || form.userType === filter;
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusStyles = {
      new: { class: 'statusNew', text: 'New' },
      contacted: { class: 'statusContacted', text: 'Contacted' },
      in_progress: { class: 'statusInProgress', text: 'In Progress' },
      completed: { class: 'statusCompleted', text: 'Completed' }
    };
    
    const statusInfo = statusStyles[status] || statusStyles.new;
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const getUserTypeBadge = (userType) => {
    return (
      <span className={`${styles.userTypeBadge} ${userType === 'candidate' ? styles.candidateBadge : styles.recruiterBadge}`}>
        {userType === 'candidate' ? <><User size={16} /> Candidate</> : <><Building size={16} /> Recruiter</>}
      </span>
    );
  };

  const handleViewDetails = (form) => {
    setSelectedForm(form);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedForm(null);
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading contact forms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryBtn}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Contact Us Forms</h1>
        <p className={styles.pageSubtitle}>Manage contact form submissions from visitors</p>
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
          <Search className={styles.searchIcon} />
        </div>
        
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({forms.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'candidate' ? styles.active : ''}`}
            onClick={() => setFilter('candidate')}
          >
            Candidates ({forms.filter(f => f.userType === 'candidate').length})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'recruiter' ? styles.active : ''}`}
            onClick={() => setFilter('recruiter')}
          >
            Recruiters ({forms.filter(f => f.userType === 'recruiter').length})
          </button>
        </div>
      </div>

      {/* Forms Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Message</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredForms.map((form) => (
              <tr key={form.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {form.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.userName}>{form.name}</span>
                  </div>
                </td>
                <td>
                  <a href={`mailto:${form.email}`} className={styles.emailLink}>
                    {form.email}
                  </a>
                </td>
                <td>{getUserTypeBadge(form.userType)}</td>
                <td>
                  <div className={styles.messageCell}>
                    <p className={styles.messageText}>{form.message}</p>
                  </div>
                </td>
                <td>{getStatusBadge(form.status)}</td>
                <td className={styles.dateCell}>{formatDate(form.submittedAt)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionBtn} title="View Details" onClick={() => handleViewDetails(form)}>
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredForms.length === 0 && (
        <div className={styles.emptyState}>
          <Phone className={styles.emptyIcon} />
          <h3>No contact forms found</h3>
          <p>No contact form submissions match your current filters.</p>
        </div>
      )}

      {/* Modal for viewing form details */}
      {showModal && selectedForm && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Contact Form Details</h3>
              <button onClick={closeModal} className={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name:</span>
                <span className={styles.detailValue}>{selectedForm.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email:</span>
                <span className={styles.detailValue}>
                  <a href={`mailto:${selectedForm.email}`} className={styles.emailLink}>
                    {selectedForm.email}
                  </a>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Type:</span>
                <span className={styles.detailValue}>
                  {selectedForm.userType === 'candidate' ? 'Candidate' : 'Recruiter'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span className={styles.detailValue}>{getStatusBadge(selectedForm.status)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Submitted:</span>
                <span className={styles.detailValue}>{formatDate(selectedForm.submittedAt)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Message:</span>
                <span className={styles.detailValue}>{selectedForm.message}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForms;
