import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { candidateService } from "../../services/candidateService";
import { Eye, Edit, Ban, Search, Users, Check, X, FileText } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageCandidates = () => {
  const { theme } = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState({});
  const [studentNames, setStudentNames] = useState({});
  const candidatesPerPage = 10;

  // Fetch candidates data and pending applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch candidates (optional - won't fail if API doesn't exist)
        try {
          const candidatesData = await adminService.getCandidates();
          setCandidates(candidatesData);
          setFilteredCandidates(candidatesData);
        } catch (candidatesError) {
          console.warn('Candidates API not available, showing empty list:', candidatesError.message);
          setCandidates([]);
          setFilteredCandidates([]);
        }

        // Fetch pending applications
        setLoadingApplications(true);
        const pendingTasks = await adminService.getPendingJobs();
        console.log('All pending tasks:', pendingTasks);
        const pendingApps = pendingTasks.filter(task =>
          task.category === 'newapplication' && task.status === 'pending'
        );
        console.log('Filtered pending applications:', pendingApps);
        setPendingApplications(pendingApps);

        // Fetch student names for pending applications
        if (pendingApps.length > 0) {
          fetchStudentNames(pendingApps);
        }
      } catch (error) {
        console.error('Failed to fetch pending applications:', error);
        setPendingApplications([]);
      } finally {
        setLoading(false);
        setLoadingApplications(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch student names
  const fetchStudentNames = async (applications) => {
    const namesMap = {};
    const uniqueStudentIds = [...new Set(applications.map(app => app.student_id))];

    for (const studentId of uniqueStudentIds) {
      try {
        const studentData = await candidateService.getCandidateById(studentId);
        if (studentData && studentData.data) {
          namesMap[studentId] = studentData.data.name || `Student ${studentId}`;
        } else {
          namesMap[studentId] = `Student ${studentId}`;
        }
      } catch (error) {
        console.warn(`Failed to fetch name for student ${studentId}:`, error.message);
        namesMap[studentId] = `Student ${studentId}`;
      }
    }

    setStudentNames(namesMap);
  };

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

  const handleApproveApplication = async (taskId) => {
    console.log('Approving application with taskId:', taskId);
    try {
      setLoadingApplications(prev => ({ ...prev, [taskId]: true }));
      console.log('Calling adminService.approveJobApplicationByStudent...');
      const result = await adminService.approveJobApplicationByStudent(taskId);
      console.log('API response:', result);
      alert('Application approved successfully! The recruiter can now review this application.');

      // Refresh pending applications
      console.log('Refreshing pending applications...');
      const pendingTasks = await adminService.getPendingJobs();
      const pendingApps = pendingTasks.filter(task =>
        task.category === 'newapplication' && task.status === 'pending'
      );
      console.log('Updated pending applications:', pendingApps);
      setPendingApplications(pendingApps);
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert('Failed to approve application. Please try again.');
    } finally {
      setLoadingApplications(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleRejectApplication = async (taskId) => {
    try {
      setLoadingApplications(prev => ({ ...prev, [taskId]: true }));
      const result = await adminService.rejectJob(taskId); // Using existing reject function
      alert('Application rejected successfully.');

      // Refresh pending applications
      const pendingTasks = await adminService.getPendingJobs();
      const pendingApps = pendingTasks.filter(task =>
        task.category === 'newapplication' && task.status === 'pending'
      );
      setPendingApplications(pendingApps);
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setLoadingApplications(prev => ({ ...prev, [taskId]: false }));
    }
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
          <Search className={styles.searchIcon} />
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

      {/* Pending Applications Section */}
      {pendingApplications.length > 0 && (
        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FileText size={20} style={{ marginRight: '10px' }} />
            <h2 style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#333' }}>
              Pending Job Applications ({pendingApplications.length})
            </h2>
          </div>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            These applications need admin approval before recruiters can review them.
          </p>

          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingApplications.map((application) => (
              <div key={application.task_id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: theme === 'dark' ? '#444' : '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: theme === 'dark' ? '#fff' : '#333' }}>
                      New Job Application
                    </h3>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                      Company: {application.company_name || 'Unknown Company'} | Student: {studentNames[application.student_id] || `Student ${application.student_id}`}
                    </p>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    PENDING APPROVAL
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <strong>Application Date:</strong> {application.created_at ? new Date(application.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Not available'}
                  </div>
                  <div>
                    <strong>Position:</strong> {application.job_title || 'Not specified'}
                  </div>
                  <div>
                    <strong>Location:</strong> {application.location || 'Not specified'}
                  </div>
                  <div>
                    <strong>Application Status:</strong> Pending Admin Review
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleApproveApplication(application.task_id)}
                    disabled={loadingApplications[application.task_id]}
                    style={{
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '4px',
                      cursor: loadingApplications[application.task_id] ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Check size={16} />
                    {loadingApplications[application.task_id] ? 'Approving...' : 'Approve Application'}
                  </button>

                  <button
                    onClick={() => handleRejectApplication(application.task_id)}
                    disabled={loadingApplications[application.task_id]}
                    style={{
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '4px',
                      cursor: loadingApplications[application.task_id] ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <X size={16} />
                    {loadingApplications[application.task_id] ? 'Rejecting...' : 'Reject Application'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      <Eye size={16} />
                    </button>
                    <button className={styles.actionBtn} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className={styles.actionBtn} title="Block/Unblock">
                      <Ban size={16} />
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
          <Users className={styles.emptyIcon} />
          <h3>No candidates found</h3>
          <p>No candidates match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ManageCandidates;
