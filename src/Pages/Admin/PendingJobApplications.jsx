import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { studentService } from "../../services/studentService";
import { Check, X, FileText } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const PendingJobApplications = () => {
  const { theme } = useTheme();
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState({});
  const [studentNames, setStudentNames] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch pending applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
        const studentData = await studentService.getCandidateById(studentId);
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

  if (loading) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading pending applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Pending Job Applications</h1>
        <p className={styles.pageSubtitle}>Review and manage job applications that require admin approval</p>
      </div>

      {/* Pending Applications Section */}
      {pendingApplications.length > 0 ? (
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <FileText size={20} style={{ marginRight: '10px' }} />
            <h2 style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#333' }}>
              Pending Applications ({pendingApplications.length})
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
      ) : (
        <div className={styles.emptyState}>
          <FileText className={styles.emptyIcon} />
          <h3>No pending applications</h3>
          <p>All applications have been reviewed.</p>
        </div>
      )}
    </div>
  );
};

export default PendingJobApplications;
