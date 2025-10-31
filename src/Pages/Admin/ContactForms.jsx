import React, { useState, useEffect } from 'react';
import { useTheme } from '../../Contexts/ThemeContext';
import { User, Building, Eye, Mail, Check, Search, Phone } from 'lucide-react';
import styles from '../../Styles/AdminDashboard.module.css';

const ContactForms = () => {
  const { theme } = useTheme();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, candidate, recruiter
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockForms = [
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        userType: 'candidate',
        message: 'I have a question about the application process and would like to speak with someone.',
        submittedAt: '2025-01-15T14:30:00Z',
        status: 'new'
      },
      {
        id: 2,
        name: 'Robert Chen',
        email: 'robert.chen@techcorp.com',
        userType: 'recruiter',
        message: 'We are interested in your premium recruitment services. Please contact us for a consultation.',
        submittedAt: '2025-01-15T12:15:00Z',
        status: 'contacted'
      },
      {
        id: 3,
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        userType: 'candidate',
        message: 'I am having trouble uploading my resume. Can someone help me with this issue?',
        submittedAt: '2025-01-14T18:45:00Z',
        status: 'in_progress'
      }
    ];
    
    setTimeout(() => {
      setForms(mockForms);
      setLoading(false);
    }, 1000);
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
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading contact forms...</p>
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
                    <button className={styles.actionBtn} title="View Details">
                      <Eye size={16} />
                    </button>
                    <button className={styles.actionBtn} title="Reply">
                      <Mail size={16} />
                    </button>
                    <button className={styles.actionBtn} title="Mark as Resolved">
                      <Check size={16} />
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
    </div>
  );
};

export default ContactForms;
