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

  // Fetch pending applications with full details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch pending applications
        const pendingTasks = await adminService.getPendingJobs();
        const pendingApps = pendingTasks.filter(task =>
          task.category === 'newapplication' && task.status === 'pending'
        );
        
        setPendingApplications(pendingApps);

        // Fetch detailed information for each application
        if (pendingApps.length > 0) {
          await fetchApplicationDetails(pendingApps);
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
          jobTitle: 'Loading...',
          jobLocation: '',
          companyName: 'Loading...',
          applicationDate: app.created_at || app.posted_date || ''
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

        // Step 1: Try to get student email from multiple sources
        let studentEmailToUse = '';
        
        // First, try to get email from application data
        if (app.job_id && app.student_id) {
          try {
            console.log(`Fetching applicants for job ${app.job_id}, student ${app.student_id}`);
            const applicantsData = await recruiterExternalService.getAllApplicants(app.job_id);
            console.log('Applicants data:', applicantsData);
            
            // Handle different response structures
            let applicationsList = [];
            if (Array.isArray(applicantsData)) {
              applicationsList = applicantsData;
            } else if (applicantsData.applications && Array.isArray(applicantsData.applications)) {
              applicationsList = applicantsData.applications;
            } else if (applicantsData.data && Array.isArray(applicantsData.data)) {
              applicationsList = applicantsData.data;
            }
            
            console.log(`Applications list length: ${applicationsList.length}`);
            if (applicationsList.length > 0) {
              console.log('First application structure:', applicationsList[0]);
              console.log('All application keys:', applicationsList.map(a => Object.keys(a)));
            }
            
            // Try to find matching application by student_id
            let application = applicationsList.find(a => {
              const studentIdMatch = a.student_id === app.student_id || 
                                   a.student_id?.toString() === app.student_id?.toString() ||
                                   a.user_id === app.student_id ||
                                   a.user_id?.toString() === app.student_id?.toString() ||
                                   a.student_id === app.student_id?.toString() ||
                                   a.user_id === app.student_id?.toString();
              return studentIdMatch;
            });
            
            // If no match found but there's only one application, use it
            if (!application && applicationsList.length === 1) {
              application = applicationsList[0];
              console.log('Using single application as fallback:', application);
            }
            
            // If still no match, try to find by application_id
            if (!application && app.application_id) {
              application = applicationsList.find(a => 
                a.application_id === app.application_id ||
                a.id === app.application_id ||
                a.application_id?.toString() === app.application_id?.toString()
              );
              console.log('Found by application_id:', application);
            }
            
            console.log('Final application found:', application);
            if (application) {
              // Extract resume URL
              details.resumeUrl = application.resume_url || 
                                 application.resume || 
                                 application.resumeFile || 
                                 application.resumeUrl || 
                                 application.resume_file ||
                                 application.resumeFileUrl ||
                                 '';
              
              // Extract email - check multiple possible field names
              studentEmailToUse = application.email || 
                                 application.student_email || 
                                 application.studentEmail || 
                                 application.user_email ||
                                 application.email_address ||
                                 application.contact_email ||
                                 '';
              
              console.log(`Extracted from application - Email: ${studentEmailToUse}, Resume: ${details.resumeUrl}`);
              console.log('Application fields:', Object.keys(application));
            } else {
              console.warn('Could not find matching application. Available applications:', applicationsList);
            }
          } catch (err) {
            console.warn(`Failed to fetch application details for job ${app.job_id}:`, err);
          }
        }

        // Step 2: Try to get email from task data itself
        if (!studentEmailToUse && app.email) {
          studentEmailToUse = app.email;
          console.log(`Using email from task data: ${app.email}`);
        }

        // Step 3: If student_id looks like an email, use it
        if (!studentEmailToUse && app.student_id && typeof app.student_id === 'string' && app.student_id.includes('@')) {
          studentEmailToUse = app.student_id;
          console.log(`Using student_id as email: ${studentEmailToUse}`);
        }

        // Step 4: Fetch student profile using email
        if (studentEmailToUse) {
          try {
            console.log(`Fetching student profile for email: ${studentEmailToUse}`);
            const profileResponse = await studentService.fetchProfileDetails(studentEmailToUse);
            console.log('Profile response:', profileResponse);
            
            // Handle response structure from withErrorHandling wrapper
            if (profileResponse && profileResponse.success && profileResponse.data) {
              const apiResponse = profileResponse.data;
              
              // Handle different API response structures
              let profile = null;
              if (apiResponse.data && apiResponse.data.profile) {
                profile = apiResponse.data.profile;
              } else if (apiResponse.data) {
                profile = apiResponse.data;
              } else if (apiResponse.profile) {
                profile = apiResponse.profile;
              } else if (apiResponse) {
                profile = apiResponse;
              }
              
              if (profile && typeof profile === 'object') {
                // Extract student name
                details.studentName = profile.full_name || 
                                     profile.name || 
                                     `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                                     'Unknown Student';
                
                // Update email if we got a better one
                if (profile.email) {
                  details.studentEmail = profile.email;
                } else {
                  details.studentEmail = studentEmailToUse;
                }
                
                // Get resume URL if not already set
                if (!details.resumeUrl) {
                  details.resumeUrl = profile.resumeUrl || 
                                     profile.resume || 
                                     profile.resumeFile || 
                                     profile.resume_url ||
                                     profile.resume_file || '';
                }
                
                console.log(`✅ Student details fetched - Name: ${details.studentName}, Email: ${details.studentEmail}, Resume: ${details.resumeUrl}`);
              } else {
                console.warn('Profile data structure unexpected:', profile);
              }
            } else if (profileResponse && !profileResponse.success) {
              console.warn('Profile fetch failed:', profileResponse.error);
            }
          } catch (emailErr) {
            console.error(`Failed to fetch student by email ${studentEmailToUse}:`, emailErr);
          }
        } else {
          console.warn(`⚠️ No email found for student_id: ${app.student_id}. Cannot fetch student details.`);
        }

        // Fetch company name if recruiter_id is available
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
          jobTitle: app.title || 'Not specified',
          jobLocation: app.location || 'Not specified',
          companyName: app.company_name || 'Unknown Company',
          applicationDate: app.created_at || app.posted_date || ''
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
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: theme === 'dark' ? '#fff' : '#333' }}>
                        Job Application Review
                      </h3>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        <strong>Company:</strong> {details.companyName || application.company_name || 'Unknown Company'} | 
                        <strong> Candidate:</strong> {details.studentName || `Student ${application.student_id}`}
                      </p>
                      {details.studentEmail && (
                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '13px' }}>
                          <strong>Email:</strong> {details.studentEmail}
                        </p>
                      )}
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
          <h3>No pending applications</h3>
          <p>All applications have been reviewed.</p>
        </div>
      )}
    </div>
  );
};

export default PendingJobApplications;
