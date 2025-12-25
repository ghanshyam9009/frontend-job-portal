import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { studentService } from "../../services/studentService";
import { recruiterExternalService } from "../../services";
import { Check, X, FileText, Download, ExternalLink } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";
const PendingJobApplications = () => {
  const { theme } = useTheme();
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState({});
  const [applicationDetails, setApplicationDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch pending applications with full details and auto-approve new applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch pending applications
        const pendingTasks = await adminService.getPendingJobs();
        const newApplicationTasks = pendingTasks.filter(task =>
          task.category === 'newapplication' && task.status === 'pending'
        );

        // Auto-approve all new application tasks
        if (newApplicationTasks.length > 0) {
          for (const task of newApplicationTasks) {
            try {
              await adminService.approveJobApplicationByStudent(task.task_id);
              console.log(`Auto-approved application task: ${task.task_id}`);
            } catch (error) {
              console.error(`Failed to auto-approve task ${task.task_id}:`, error);
            }
          }

          // Re-fetch tasks after auto-approval
          const updatedTasks = await adminService.getPendingJobs();
          const remainingPendingApps = updatedTasks.filter(task =>
            task.category === 'newapplication' && task.status === 'pending'
          );

          setPendingApplications(remainingPendingApps);

          // Fetch detailed information for any remaining applications (should be none)
          if (remainingPendingApps.length > 0) {
            await fetchApplicationDetails(remainingPendingApps);
          }
        } else {
          // No new application tasks to approve
          const otherPendingTasks = pendingTasks.filter(task =>
            !(task.category === 'newapplication' && task.status === 'pending')
          );
          setPendingApplications(otherPendingTasks);

          // Fetch detailed information for other types of applications
          if (otherPendingTasks.length > 0) {
            await fetchApplicationDetails(otherPendingTasks);
          }
        }
      } catch (error) {
        console.error('Failed to fetch pending applications:', error);
        setPendingApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch complete application details
  const fetchApplicationDetails = async (applications) => {
    const detailsMap = {};

    for (const app of applications) {
      try {
        console.log('Processing application:', app);
        const details = {
          studentName: 'Loading...',
          studentEmail: '',
          resumeUrl: '',
          studentPhone: '',
          studentSkills: [],
          jobTitle: 'Loading...',
          jobLocation: '',
          companyName: 'Loading...',
          applicationDate: app.created_at || app.posted_date || '',
          studentDetails: null
        };

        // Fetch job details
        if (app.job_id) {
          try {
            const jobResponse = await fetch(
              `https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs?job_id=${app.job_id}`
            );
            if (jobResponse.ok) {
              const jobData = await jobResponse.json();
              const job = Array.isArray(jobData.jobs)
                ? jobData.jobs.find(j => j.job_id === app.job_id) || jobData.jobs[0]
                : jobData.job || jobData;

              if (job) {
                details.jobTitle = job.job_title || job.title || 'Not specified';
                details.jobLocation = job.location || 'Not specified';
                details.companyName = job.company_name || 'Not specified';
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch job ${app.job_id}:`, err);
          }
        }

        // Fetch application details for the job to get student data (similar to JobApplicationReports)
        if (app.job_id) {
          try {
            // Use the same approach as JobApplicationReports.jsx
            const applicationsResponse = await adminService.getApplicationsForJob(app.job_id);
            const applications = applicationsResponse.applications || [];

            // Try to find the specific application for this student, but also get all applications for context
            const studentApplication = applications.find(a =>
              a.student_id?.toString() === app.student_id?.toString()
            ) || applications[0]; // Fallback to first application if exact match fails

            if (studentApplication) {
              // Use embedded student data directly from the application (similar to JobApplicationReports)
              details.studentName = studentApplication.student_name || `Student ${app.student_id}`;
              details.studentEmail = studentApplication.student_email || studentApplication.email || '';
              details.resumeUrl = studentApplication.resume_url || studentApplication.resume || '';
              details.studentPhone = studentApplication.student_phone || '';
              details.studentSkills = studentApplication.student_skills ?
                studentApplication.student_skills.split(',').map(skill => skill.trim()) : [];

              // Create student details object like JobApplicationReports.jsx
              details.studentDetails = {
                name: studentApplication.student_name || "Unknown",
                email: studentApplication.student_email || studentApplication.email || null,
                phone: studentApplication.student_phone || null,
                skills: studentApplication.student_skills ? studentApplication.student_skills.split(',').map(skill => skill.trim()) : [],
                location: studentApplication.student_location || null,
                experience: studentApplication.student_experience || null,
                education: studentApplication.student_university ? [studentApplication.student_university] : [],
                experience_years: studentApplication.student_experience_years || null,
                bio: studentApplication.student_bio || null,
                resumeUrl: studentApplication.resume_url || studentApplication.student_profile?.resume || null,
                department: studentApplication.student_department || null,
                cgpa: studentApplication.student_cgpa || null
              };
            }
          } catch (error) {
            console.error(`Failed to fetch application details for job ${app.job_id}, student ${app.student_id}:`, error);
          }
        }

        // Fetch company name if recruiter_id is available and company name not found
        if (app.recruiter_id && details.companyName === 'Loading...') {
          try {
            const recruiterData = await recruiterExternalService.getRecruiterCompanyName(app.recruiter_id);
            if (recruiterData && recruiterData.company_name) {
              details.companyName = recruiterData.company_name;
            }
          } catch (err) {
            console.warn(`Failed to fetch company for recruiter ${app.recruiter_id}:`, err);
          }
        }

        // Fallback for student name
        if (details.studentName === 'Loading...' || !details.studentName) {
          details.studentName = `Student ${app.student_id || 'Unknown'}`;
        }

        // Fallback for company name
        if (details.companyName === 'Loading...' || !details.companyName) {
          details.companyName = app.company_name || 'Unknown Company';
        }

        detailsMap[app.task_id] = details;
      } catch (error) {
        console.error(`Error fetching details for application ${app.task_id}:`, error);
        detailsMap[app.task_id] = {
          studentName: `Student ${app.student_id || 'Unknown'}`,
          studentEmail: '',
          resumeUrl: '',
          studentPhone: '',
          studentSkills: [],
          jobTitle: app.title || 'Not specified',
          jobLocation: app.location || 'Not specified',
          companyName: app.company_name || 'Unknown Company',
          applicationDate: app.created_at || app.posted_date || '',
          studentDetails: null
        };
      }
    }

    setApplicationDetails(detailsMap);
  };

  const handleApproveApplication = async (taskId) => {
    try {
      setLoadingApplications(prev => ({ ...prev, [taskId]: true }));
      const result = await adminService.approveJobApplicationByStudent(taskId);
      alert('Application approved successfully! The recruiter can now review this application.');

      // Refresh pending applications and details
      const pendingTasks = await adminService.getPendingJobs();
      const pendingApps = pendingTasks.filter(task =>
        task.category === 'newapplication' && task.status === 'pending'
      );
      setPendingApplications(pendingApps);
      
      // Refresh application details for remaining applications
      if (pendingApps.length > 0) {
        await fetchApplicationDetails(pendingApps);
      } else {
        setApplicationDetails({});
      }
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
      const result = await adminService.rejectJob(taskId);
      alert('Application rejected successfully.');

      // Refresh pending applications and details
      const pendingTasks = await adminService.getPendingJobs();
      const pendingApps = pendingTasks.filter(task =>
        task.category === 'newapplication' && task.status === 'pending'
      );
      setPendingApplications(pendingApps);
      
      // Refresh application details for remaining applications
      if (pendingApps.length > 0) {
        await fetchApplicationDetails(pendingApps);
      } else {
        setApplicationDetails({});
      }
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
        <h1 className={styles.pageTitle}>Job Applications Overview</h1>
        <p className={styles.pageSubtitle}>Monitor job applications - new applications are automatically approved</p>
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
            These applications require admin attention for other reasons.
          </p>

          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingApplications.map((application) => {
              const details = applicationDetails[application.task_id] || {};
              return (
                <div key={application.task_id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: theme === 'dark' ? '#444' : '#f9f9f9',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 5px 0', color: theme === 'dark' ? '#fff' : '#333' }}>
                        Job Application Review
                      </h3>
                      <div style={{ display: 'grid', gap: '3px' }}>
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                          <strong>Company:</strong> {details.companyName || application.company_name || 'Unknown Company'}
                        </p>
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                          <strong>Candidate:</strong> {details.studentName || `Student ${application.student_id}`}
                        </p>
                        {details.studentEmail && (
                          <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>
                            <strong>Email:</strong> {details.studentEmail}
                          </p>
                        )}
                        {details.studentPhone && (
                          <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>
                            <strong>Phone:</strong> {details.studentPhone}
                          </p>
                        )}
                        {details.studentSkills && details.studentSkills.length > 0 && (
                          <p style={{ margin: '0', color: '#666', fontSize: '13px' }}>
                            <strong>Skills:</strong> {details.studentSkills.join(', ')}
                          </p>
                        )}
                      </div>
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

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '15px', 
                    marginBottom: '15px',
                    padding: '15px',
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    borderRadius: '6px'
                  }}>
                    <div>
                      <strong style={{ color: theme === 'dark' ? '#ccc' : '#666', display: 'block', marginBottom: '5px' }}>Job Position:</strong>
                      <span style={{ color: theme === 'dark' ? '#fff' : '#333' }}>
                        {details.jobTitle || application.job_title || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: theme === 'dark' ? '#ccc' : '#666', display: 'block', marginBottom: '5px' }}>Location:</strong>
                      <span style={{ color: theme === 'dark' ? '#fff' : '#333' }}>
                        {details.jobLocation || application.location || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: theme === 'dark' ? '#ccc' : '#666', display: 'block', marginBottom: '5px' }}>Application Date:</strong>
                      <span style={{ color: theme === 'dark' ? '#fff' : '#333' }}>
                        {details.applicationDate ? new Date(details.applicationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Not available'}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: theme === 'dark' ? '#ccc' : '#666', display: 'block', marginBottom: '5px' }}>Status:</strong>
                      <span style={{ color: theme === 'dark' ? '#fff' : '#333' }}>Pending Admin Review</span>
                    </div>
                  </div>

                  {details.resumeUrl && (
                    <div style={{ 
                      marginBottom: '15px', 
                      padding: '12px', 
                      backgroundColor: theme === 'dark' ? '#333' : '#e8f4f8',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FileText size={18} color={theme === 'dark' ? '#4CAF50' : '#2196F3'} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: theme === 'dark' ? '#fff' : '#333', display: 'block', marginBottom: '3px' }}>
                          Resume Available
                        </strong>
                        <span style={{ color: '#666', fontSize: '13px' }}>
                          Click to view or download the candidate's resume
                        </span>
                      </div>
                      <a
                        href={details.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#2196F3',
                          color: '#fff',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <ExternalLink size={16} />
                        View Resume
                      </a>
                      <a
                        href={details.resumeUrl}
                        download
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50',
                          color: '#fff',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <Download size={16} />
                        Download
                      </a>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
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
                        gap: '5px',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: loadingApplications[application.task_id] ? 0.6 : 1
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
                        gap: '5px',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: loadingApplications[application.task_id] ? 0.6 : 1
                      }}
                    >
                      <X size={16} />
                      {loadingApplications[application.task_id] ? 'Rejecting...' : 'Reject Application'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FileText className={styles.emptyIcon} />
          <h3>No applications requiring attention</h3>
          <p>New applications are automatically approved. All other applications have been processed.</p>
        </div>
      )}
    </div>
  );
};

export default PendingJobApplications;
