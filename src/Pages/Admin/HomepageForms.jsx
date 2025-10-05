import React, { useState, useEffect } from 'react';
import styles from '../../Styles/AdminDashboard.module.css';

const HomepageForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, candidate, recruiter
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockForms = [
      {
        id: 1,
        fullName: 'John Doe',
        email: 'john.doe@email.com',
        userType: 'candidate',
        message: 'I am interested in learning more about your job portal services.',
        submittedAt: '2025-01-15T10:30:00Z',
        status: 'new'
      },
      {
        id: 2,
        fullName: 'Jane Smith',
        email: 'jane.smith@company.com',
        userType: 'recruiter',
        message: 'We are looking to post multiple job openings on your platform.',
        submittedAt: '2025-01-15T09:15:00Z',
        status: 'contacted'
      },
      {
        id: 3,
        fullName: 'Mike Johnson',
        email: 'mike.j@email.com',
        userType: 'candidate',
        message: 'I would like to know about premium membership benefits.',
        submittedAt: '2025-01-14T16:45:00Z',
        status: 'new'
      },
      {
        id: 4,
        fullName: 'Sarah Wilson',
        email: 'sarah.w@hrcompany.com',
        userType: 'recruiter',
        message: 'Interested in your enterprise recruitment solutions.',
        submittedAt: '2025-01-14T14:20:00Z',
        status: 'in_progress'
      },
      {
        id: 5,
        fullName: 'David Brown',
        email: 'david.brown@email.com',
        userType: 'candidate',
        message: 'Looking for career guidance and job placement assistance.',
        submittedAt: '2025-01-13T11:10:00Z',
        status: 'completed'
      }
    ];
    
    setTimeout(() => {
      setForms(mockForms);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredForms = forms.filter(form => {
    const matchesFilter = filter === 'all' || form.userType === filter;
    const matchesSearch = form.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        {userType === 'candidate' ? '👤 Candidate' : '💼 Recruiter'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading homepage forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Homepage Demo Forms</h1>
        <p className={styles.pageSubtitle}>Manage demo requests from homepage visitors</p>
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
                      {form.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.userName}>{form.fullName}</span>
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
                    <button className={styles.actionBtn} title="View Details">
                      👁️
                    </button>
                    <button className={styles.actionBtn} title="Contact">
                      📧
                    </button>
                    <button className={styles.actionBtn} title="Mark as Contacted">
                      ✅
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
          <div className={styles.emptyIcon}>📝</div>
          <h3>No forms found</h3>
          <p>No homepage demo forms match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default HomepageForms;
