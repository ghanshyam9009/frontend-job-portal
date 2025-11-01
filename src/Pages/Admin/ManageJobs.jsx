import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import { Check, Eye, Edit, X, Search, FileText, Star } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const ManageJobs = () => {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [recruiterDetails, setRecruiterDetails] = useState(null);
  const [jobData, setJobData] = useState({
    job_title: "",
    company_name: "",
    location: "",
    employment_type: "Full-Time",
    work_mode: "On-site",
    salary_range: {
      min: "",
      max: "",
      currency: "INR",
    },
    experience_required: {
      min_years: "",
      max_years: "",
    },
    skills_required: [],
    description: "",
    responsibilities: "",
    qualifications: "",
    application_deadline: "",
    contact_email: "",
    job_status: "open",
  });

  const [applicationData, setApplicationData] = useState([]);
  const [applicantDetails, setApplicantDetails] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [loadingJobEdit, setLoadingJobEdit] = useState(false);
  const jobsPerPage = 10;

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobsData = await adminService.getPendingJobs();
        // Ensure jobsData is always an array
        const jobsArray = Array.isArray(jobsData) ? jobsData : [];
        setJobs(jobsArray);
        setFilteredJobs(jobsArray);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setError('Failed to fetch jobs. Please try again.');
        // Set empty arrays on error
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Group and filter jobs based on search and status
  useEffect(() => {
    // Ensure jobs is always an array
    let tasks = Array.isArray(jobs) ? jobs : [];

    // Group tasks by job_id to show each job only once
    const groupedJobs = {};

    tasks.forEach(task => {
      const jobId = task.job_id || `no-job-${task.id}`;

      if (!groupedJobs[jobId]) {
        groupedJobs[jobId] = {
          id: task.id,
          job_id: task.job_id,
          company_name: task.company_name || 'N/A',
          title: task.title || task.category,
          posted_date: task.posted_date,
          updated_date: task.updated_date,
          is_premium: task.is_premium || false, // Include premium status from task
          tasks: []
        };
      }

      // Add this task to the job's tasks array
      groupedJobs[jobId].tasks.push(task);
    });

    // Convert grouped jobs back to array and sort by latest created date first
    let filtered = Object.values(groupedJobs);
    filtered.sort((a, b) => {
      const dateA = new Date(a.posted_date || 0);
      const dateB = new Date(b.posted_date || 0);
      return dateB - dateA; // Latest first
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter - check if any task in the job matches the status
    if (statusFilter !== "all") {
      filtered = filtered.filter(job =>
        job.tasks.some(task => task.status === statusFilter)
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, jobs]);

  // Cache for recruiter details to avoid multiple API calls
  const [recruiterCache, setRecruiterCache] = useState({});
  const [batchRecruiterFetch, setBatchRecruiterFetch] = useState(false);

  // Optimized fetch job/application data when editing
  useEffect(() => {
    const fetchEditData = async () => {
      if (!editingTask) {
        return;
      }

      try {
        setLoadingJobEdit(true);

        // Check cache for recruiter details first
        let recruiterDetails = recruiterCache[editingTask.recruiter_id];
        if (!recruiterDetails && editingTask.recruiter_id) {
          recruiterDetails = await recruiterExternalService.getRecruiterCompanyName(editingTask.recruiter_id);
          setRecruiterCache(prev => ({ ...prev, [editingTask.recruiter_id]: recruiterDetails }));
        }
        setRecruiterDetails(recruiterDetails);

        // Determine what type of data to fetch based on category
        if (editingTask.category === 'editjob' || editingTask.category === 'postnewjob') {
          // For job editing, fetch job data
          if (!editingTask.job_id || !editingTask.recruiter_id) {
            setLoadingJobEdit(false);
            return;
          }

          console.log('Fetching job data for task:', editingTask);
          // Fetch job data from recruiter's posted jobs
          const jobsData = await recruiterExternalService.getAllPostedJobs(editingTask.recruiter_id);
          console.log('Retrieved jobs data:', jobsData);
          const job = jobsData?.jobs?.find(j => j.job_id === editingTask.job_id);
          console.log('Found job:', job);

          if (job) {
            setJobData({
              job_title: job.job_title || "",
              company_name: job.company_name || "",
              location: job.location || "",
              employment_type: job.employment_type || "Full-Time",
              work_mode: job.work_mode || "On-site",
              salary_range: {
                min: job.salary_range?.min || "",
                max: job.salary_range?.max || "",
                currency: job.salary_range?.currency || "INR",
              },
              experience_required: {
                min_years: job.experience_required?.min_years || "",
                max_years: job.experience_required?.max_years || "",
              },
              skills_required: job.skills_required || [],
              description: job.description || "",
              responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join("\n") : job.responsibilities || "",
              qualifications: Array.isArray(job.qualifications) ? job.qualifications.join("\n") : job.qualifications || "",
              application_deadline: job.application_deadline || "",
              contact_email: job.contact_email || "",
              job_status: job.job_status || "open",
            });
          } else {
            alert('Job not found or you may not have permission to edit this job');
            setEditingTask(null);
          }
        } else if (editingTask.category === 'newapplication' || editingTask.category === 'change status of application') {
          // For application-related tasks, fetch application/job details
          if (!editingTask.job_id) {
            setLoadingJobEdit(false);
            return;
          }

          console.log('Fetching application data for task:', editingTask);

          // Set basic application info from task data
          setApplicantDetails({
            application_id: editingTask.application_id,
            student_id: editingTask.student_id,
            job_id: editingTask.job_id,
            recruiter_id: editingTask.recruiter_id,
            task_category: editingTask.category,
            task_id: editingTask.task_id
          });

          // Fetch application details using the get all applicants API
          try {
            const applicantsData = await recruiterExternalService.getApplicantsByJobId(editingTask.job_id);
            console.log('Retrieved applicants data:', applicantsData);

            if (applicantsData && Array.isArray(applicantsData.applicants)) {
              const application = applicantsData.applicants.find(app => app.application_id === editingTask.application_id);

              if (application) {
                setApplicantDetails(prevDetails => ({
                  ...prevDetails,
                  name: application.name || "",
                  email: application.email || "",
                  phone: application.phone || "",
                  skills: application.skills || [],
                  experience: application.experience || "",
                  education: application.education || "",
                  resume_link: application.resume_link || "",
                  status: application.status || "pending",
                  applied_date: application.applied_date || "",
                  updated_date: application.updated_date || ""
                }));
              }

              // Store all applicants for this job to show in a list - sort by latest first
              const sortedApplicants = applicantsData.applicants.sort((a, b) => {
                const dateA = new Date(a.applied_date || 0);
                const dateB = new Date(b.applied_date || 0);
                return dateB - dateA; // Latest first
              });
              setApplicationData(sortedApplicants);
            }
          } catch (error) {
            console.error('Error fetching application details:', error);
            // Continue with basic task data even if applications fetch fails
          }
        } else {
          console.log('Unsupported edit category:', editingTask.category);
        }

      } catch (error) {
        console.error('Failed to load data for editing:', error);
        alert('Failed to load data for editing');
        setEditingTask(null);
      } finally {
        setLoadingJobEdit(false);
      }
    };

    fetchEditData();
  }, [editingTask, recruiterCache]);

  const handleInputChange = (field, value) => {
    const keys = field.split(".");
    if (keys.length > 1) {
      setJobData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setJobData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !jobData.skills_required.includes(newSkill.trim())) {
      setJobData((prev) => ({
        ...prev,
        skills_required: [...prev.skills_required, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setJobData((prev) => ({
      ...prev,
      skills_required: prev.skills_required.filter((s) => s !== skill),
    }));
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: { class: 'statusActive', text: 'Active' },
      pending: { class: 'statusInProgress', text: 'Pending' },
      fulfilled: { class: 'statusActive', text: 'Fulfilled' },
      expired: { class: 'statusBlocked', text: 'Expired' }
    };
    
    const statusInfo = statusStyles[status] || statusStyles.pending;
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApproveTask = async (task) => {
    try {
      setLoading(true);
      let result;
      
      switch (task.category) {
        case 'postnewjob':
          result = await adminService.approveJob(task.task_id);
          break;
        case 'editjob':
          result = await adminService.approveEditedJob(task.task_id);
          break;
        case 'closedjob':
          result = await adminService.approveJobClosing(task.task_id);
          break;
        case 'newapplication':
          result = await adminService.approveJobApplicationByStudent(task.task_id);
          break;
        case 'change status of application':
          result = await adminService.approveApplicationStatusChanged(task.task_id);
          break;
        default:
          throw new Error('Unknown task category');
      }
      
      alert(`Job approved successfully: ${result.message || 'Job fulfilled'}`);
      
      // Refresh the jobs list
      const jobsData = await adminService.getPendingJobs();
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
      
    } catch (error) {
      console.error('Failed to approve job:', error);
      alert('Failed to approve job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTask = async (task) => {
    try {
      setLoading(true);
      let result;

      switch (task.category) {
        case 'postnewjob':
          result = await adminService.rejectJob(task.task_id);
          break;
        default:
          throw new Error('Rejection not supported for this task type');
      }

      alert(`Job rejected successfully: ${result.message || 'Job rejected'}`);

      // Refresh the jobs list
      const jobsData = await adminService.getPendingJobs();
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);

    } catch (error) {
      console.error('Failed to reject job:', error);
      alert('Failed to reject job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditJobSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingJobEdit(true);

      const jobPayload = {
        ...jobData,
        employer_id: editingTask.recruiter_id,
        responsibilities: jobData.responsibilities.split("\n").filter(r => r.trim()),
        qualifications: jobData.qualifications.split("\n").filter(q => q.trim()),
      };

      // Update job using the recruiter API
      await recruiterExternalService.updateJob(editingTask.job_id, jobPayload);
      alert('Job updated successfully');
      setEditingTask(null);
      setJobData({
        job_title: "",
        company_name: "",
        location: "",
        employment_type: "Full-Time",
        work_mode: "On-site",
        salary_range: {
          min: "",
          max: "",
          currency: "INR",
        },
        experience_required: {
          min_years: "",
          max_years: "",
        },
        skills_required: [],
        description: "",
        responsibilities: "",
        qualifications: "",
        application_deadline: "",
        contact_email: "",
        job_status: "open",
      });
      setRecruiterDetails(null);

      // Refresh the jobs list
      const jobsData = await adminService.getPendingJobs();
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
    } catch (error) {
      console.error('Failed to update job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setLoadingJobEdit(false);
    }
  };

  const handleMarkJobPremium = async (task, isPremium = true) => {
    if (!task.job_id) {
      alert('Cannot mark this job as premium: Job ID not found');
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.markJobPremium(task.job_id, isPremium, 'job');
      alert(`Job successfully marked as ${isPremium ? 'premium' : 'non-premium'}: ${result.message || 'Success'}`);
      
      // Refresh the jobs list
      const jobsData = await adminService.getPendingJobs();
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
    } catch (error) {
      console.error('Failed to mark job as premium:', error);
      alert('Failed to mark job as premium. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination - ensure filteredJobs is always an array
  const safeFilteredJobs = Array.isArray(filteredJobs) ? filteredJobs : [];
  const totalPages = Math.ceil(safeFilteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = safeFilteredJobs.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.errorContainer}>
          <h2>Error Loading Jobs</h2>
          <p>{error}</p>
          <button 
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
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
        <h1 className={styles.pageTitle}>Manage Jobs</h1>
        <p className={styles.pageSubtitle}>View and manage all pending jobs requiring approval</p>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by job title, category, or ID..."
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
            All ({safeFilteredJobs.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.active : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({safeFilteredJobs.filter(j => j.status === 'pending').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'fulfilled' ? styles.active : ''}`}
            onClick={() => setStatusFilter('fulfilled')}
          >
            Fulfilled ({safeFilteredJobs.filter(j => j.status === 'fulfilled').length})
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Pending Tasks</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((job) => {
              // Count tasks by type and status - ensure tasks array exists
              const tasks = job.tasks || [];
              const pendingTasks = tasks.filter(task => task.status === 'pending');
              const fulfilledTasks = tasks.filter(task => task.status === 'fulfilled');
              const taskSummary = [];

              if (pendingTasks.length > 0) {
                const categories = [...new Set(pendingTasks.map(t => t.category))];
                taskSummary.push(`${pendingTasks.length} pending (${categories.join(', ')})`);
              }
              if (fulfilledTasks.length > 0) {
                taskSummary.push(`${fulfilledTasks.length} fulfilled`);
              }

              return (
                <tr key={job.job_id || job.id}>
                  <td>{job.company_name || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {taskSummary.map((summary, index) => (
                        <span key={index} className={styles.taskBadge}>
                          {summary}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={styles.dateCell}>{formatDate(job.posted_date)}</td>
                  <td className={styles.dateCell}>{formatDate(job.updated_date)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      {/* Show all available actions for this job */}
                      {job.tasks && job.tasks.some(task => task.status === 'pending' && (task.category === 'postnewjob' || task.category === 'editjob')) && (
                        <button
                          className={styles.approveBtn}
                          onClick={() => {
                            const pendingTask = job.tasks.find(t => t.status === 'pending' && (t.category === 'postnewjob' || t.category === 'editjob'));
                            if (pendingTask) handleApproveTask(pendingTask);
                          }}
                        >
                          Approve
                        </button>
                      )}

                      {job.tasks && job.tasks.some(task => task.status === 'pending' && task.category === 'postnewjob') && (
                        <button
                          className={styles.rejectBtn}
                          onClick={() => handleRejectTask(job.tasks.find(t => t.category === 'postnewjob' && t.status === 'pending'))}
                        >
                          Reject
                        </button>
                      )}

                      {job.tasks && job.tasks.some(task => task.category === 'newapplication' || task.category === 'change status of application') && (
                        <button
                          className={styles.viewBtn}
                          onClick={() => {
                            const appTask = job.tasks.find(t => t.category === 'newapplication' || t.category === 'change status of application');
                            if (appTask) setEditingTask(appTask);
                          }}
                        >
                          View Applications
                        </button>
                      )}

                      {job.tasks && job.tasks.some(task => task.category === 'editjob' || task.category === 'postnewjob') && (
                        <button
                          className={styles.editBtn}
                          onClick={() => {
                            const jobTask = job.tasks.find(t => t.category === 'editjob' || t.category === 'postnewjob');
                            if (jobTask) setEditingTask(jobTask);
                          }}
                        >
                          Edit Job
                        </button>
                      )}

                      {job.job_id && job.tasks && job.tasks.length > 0 && (
                        job.is_premium ? (
                          <span className={styles.premiumMarked}>
                            Premium Marked
                          </span>
                        ) : (
                          <button
                            className={styles.premiumBtn}
                            onClick={() => handleMarkJobPremium(job.tasks[0], true)}
                          >
                            Mark Premium
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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

      {safeFilteredJobs.length === 0 && (
        <div className={styles.emptyState}>
          <FileText className={styles.emptyIcon} />
          <h3>No jobs found</h3>
          <p>No jobs match your current filters.</p>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? '#333' : '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '800px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflowY: 'auto',
            color: theme === 'dark' ? '#fff' : '#000'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>
                {editingTask.category === 'newapplication' || editingTask.category === 'change status of application'
                  ? 'View Application Details'
                  : 'Edit Job Posting'
                }
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: theme === 'dark' ? '#fff' : '#000'
                }}
              >
                ×
              </button>
            </div>

            {recruiterDetails && (
              <div style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '20px',
                color: '#333'
              }}>
                <strong>Company:</strong> {recruiterDetails.company_name || 'Unknown'}
              </div>
            )}

            {loadingJobEdit ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>Loading data...</div>
              </div>
            ) : (
              <>
                {/* Application Details View */}
                {(editingTask.category === 'newapplication' || editingTask.category === 'change status of application') && applicantDetails && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4>Application Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Application ID:</label>
                        <p>{applicantDetails.application_id}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Student ID:</label>
                        <p>{applicantDetails.student_id}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Applicant Name:</label>
                        <p>{applicantDetails.name || 'Not available'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Email:</label>
                        <p>{applicantDetails.email || 'Not available'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Phone:</label>
                        <p>{applicantDetails.phone || 'Not available'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Application Status:</label>
                        <p style={{ textTransform: 'capitalize' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: applicantDetails.status === 'approved' ? '#28a745' :
                                           applicantDetails.status === 'rejected' ? '#dc3545' : '#ffc107',
                            color: '#fff'
                          }}>
                            {applicantDetails.status || 'pending'}
                          </span>
                        </p>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 'bold' }}>Skills:</label>
                        <p>
                          {applicantDetails.skills && Array.isArray(applicantDetails.skills)
                            ? applicantDetails.skills.join(', ')
                            : 'Not available'
                          }
                        </p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Experience:</label>
                        <p>{applicantDetails.experience || 'Not available'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Education:</label>
                        <p>{applicantDetails.education || 'Not available'}</p>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 'bold' }}>Applied Date:</label>
                        <p>{applicantDetails.applied_date ? new Date(applicantDetails.applied_date).toLocaleDateString() : 'Not available'}</p>
                      </div>
                      {applicantDetails.resume_link && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontWeight: 'bold' }}>Resume:</label>
                          <p>
                            <a href={applicantDetails.resume_link} target="_blank" rel="noopener noreferrer"
                               style={{ color: '#007bff', textDecoration: 'underline' }}>
                              View Resume
                            </a>
                          </p>
                        </div>
                      )}
                    </div>

                    {applicantDetails.task_category === 'change status of application' && (
                      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                        <h5>Task Information</h5>
                        <p><strong>Requested Action:</strong> Application status change request</p>
                        <p><strong>Task ID:</strong> {applicantDetails.task_id}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Job Edit Form (only show for job edits) */}
                {!(editingTask.category === 'newapplication' || editingTask.category === 'change status of application') && (
                  <form onSubmit={handleEditJobSubmit}>
                    {/* Basic Information */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4>Basic Information</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label>Job Title *</label>
                          <input
                            type="text"
                            value={jobData.job_title}
                            onChange={(e) => handleInputChange('job_title', e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            required
                          />
                        </div>
                        <div>
                          <label>Company Name *</label>
                          <input
                            type="text"
                            value={jobData.company_name}
                            onChange={(e) => handleInputChange('company_name', e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            required
                          />
                        </div>
                        <div>
                          <label>Location *</label>
                          <input
                            type="text"
                            value={jobData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            required
                          />
                        </div>
                        <div>
                          <label>Employment Type *</label>
                          <select
                            value={jobData.employment_type}
                            onChange={(e) => handleInputChange('employment_type', e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            required
                          >
                            <option value="Full-Time">Full-time</option>
                            <option value="Part-Time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </div>
                        <div>
                          <label>Work Mode *</label>
                          <select
                            value={jobData.work_mode}
                            onChange={(e) => handleInputChange('work_mode', e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            required
                          >
                            <option value="On-site">On-site</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                          </select>
                        </div>
                        <div>
                          <label>Contact Email</label>
                          <input
                            type="email"
                            value={jobData.contact_email}
                            onChange={(e) => handleInputChange('contact_email', e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                          />
                        </div>
                      </div>

                      {/* Salary Range */}
                      <div style={{ marginTop: '10px' }}>
                        <label>Salary Range</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <select
                            value={jobData.salary_range.currency}
                            onChange={(e) => handleInputChange('salary_range.currency', e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Min"
                            value={jobData.salary_range.min}
                            onChange={(e) => handleInputChange('salary_range.min', e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1' }}
                          />
                          <span>-</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={jobData.salary_range.max}
                            onChange={(e) => handleInputChange('salary_range.max', e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1' }}
                          />
                        </div>
                      </div>

                      {/* Experience Required */}
                      <div style={{ marginTop: '10px' }}>
                        <label>Experience Required (Years)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <input
                            type="number"
                            placeholder="Min"
                            value={jobData.experience_required.min_years}
                            onChange={(e) => handleInputChange('experience_required.min_years', e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1' }}
                          />
                          <span>-</span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={jobData.experience_required.max_years}
                            onChange={(e) => handleInputChange('experience_required.max_years', e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4>Job Details</h4>
                      <div>
                        <label>Description *</label>
                        <textarea
                          value={jobData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={6}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                        <div>
                          <label>Responsibilities *</label>
                          <textarea
                            value={jobData.responsibilities}
                            onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                            rows={4}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            required
                          />
                        </div>
                        <div>
                          <label>Qualifications *</label>
                          <textarea
                            value={jobData.qualifications}
                            onChange={(e) => handleInputChange('qualifications', e.target.value)}
                            rows={4}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4>Skills</h4>
                      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Add a required skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1' }}
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          style={{ padding: '8px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
                        >
                          Add
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {jobData.skills_required.map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              background: '#f0f0f0',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              style={{ border: 'none', background: 'none', color: '#ff0000', cursor: 'pointer' }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Application Deadline */}
                    <div style={{ marginBottom: '20px' }}>
                      <label>Application Deadline</label>
                      <input
                        type="date"
                        value={jobData.application_deadline}
                        onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingTask(null)}
                        style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
                        disabled={loadingJobEdit}
                      >
                        {loadingJobEdit ? 'Updating...' : 'Update Job'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Action Buttons for Application View */}
                {(editingTask.category === 'newapplication' || editingTask.category === 'change status of application') && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button
                      onClick={() => setEditingTask(null)}
                      style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
