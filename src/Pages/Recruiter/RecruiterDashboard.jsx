import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services";
import styles from "../../Styles/RecruiterDashboard.module.css";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isPendingApproval = location.state?.status === 'pending_approval';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    interviewsScheduled: 0,
    hired: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recruiterProfile, setRecruiterProfile] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch jobs data
        const jobsData = await recruiterExternalService.getAllPostedJobs(user?.employer_id || user?.id);
        const allJobs = jobsData?.jobs || [];
        
        // Filter only approved jobs
        const jobsList = allJobs.filter(job => job.status === 'approved' || job.status === 'Open');
        setJobs(jobsList);

        // Calculate stats
        const totalJobs = jobsList.length;
        const activeJobs = jobsList.filter(job => job.status?.toLowerCase() === 'open' || job.status?.toLowerCase() === 'active').length;
        
        // Fetch applications for all jobs to calculate total applications and recent ones
        let allApplications = [];
        let shortlistedCount = 0;
        
        for (const job of jobsList) {
          try {
            const applicationsData = await recruiterExternalService.getAllApplicants(job.job_id);
            const jobApplications = (applicationsData.applications || []).map(app => ({
              ...app,
              job_title: job.job_title,
              job_id: job.job_id,
              candidateName: `Student ${app.student_id}`, // Since we don't have candidate names in the API
              experience: "N/A" // Not available in current API
            }));
            allApplications.push(...jobApplications);
            
            // Count shortlisted candidates
            shortlistedCount += jobApplications.filter(app => app.status === 'Shortlisted').length;
          } catch (err) {
            console.error(`Failed to fetch applications for job ${job.job_id}:`, err);
          }
        }

        // Sort applications by date and get recent ones
        const sortedApplications = allApplications.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        const recent = sortedApplications.slice(0, 4);

        setRecentApplications(recent);
        setStats({
          totalJobs,
          activeJobs,
          totalApplications: allApplications.length,
          shortlistedCandidates: shortlistedCount,
          interviewsScheduled: 0, // Not available in current API
          hired: 0 // Not available in current API
        });

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user && !isPendingApproval) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, isPendingApproval]);

  // Fetch recruiter profile
  useEffect(() => {
    const fetchRecruiterProfile = async () => {
      if (user?.employer_id || user?.id) {
        try {
          const profile = await recruiterExternalService.getRecruiterProfile(user.employer_id || user.id);
          setRecruiterProfile(profile);
        } catch (err) {
          console.error('Failed to fetch recruiter profile:', err);
        }
      }
    };

    fetchRecruiterProfile();
  }, [user?.employer_id, user?.id]);

  // Helper function to get status class
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return styles.statusActive;
      case 'pending':
        return styles.statusDraft;
      case 'rejected':
        return styles.statusClosed;
      default:
        return styles.statusDefault;
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const quickActions = [
    {
      title: "Post New Job",
      description: "Create and publish a new job posting",
      icon: "➕",
      action: () => navigate('/post-job')
    },
    {
      title: "View Applications",
      description: "Review candidate applications",
      icon: "👥",
      action: () => navigate('/candidate-applications')
    },
    {
      title: "Shortlist Candidates",
      description: "Manage your candidate shortlist",
      icon: "⭐",
      action: () => navigate('/shortlist-candidates')
    },
    {
      title: "Company Profile",
      description: "Update your company information",
      icon: "🏢",
      action: () => navigate('/company-profile')
    }
  ];

  if (loading) {
    return (
      <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h2>Loading Dashboard...</h2>
            <p>Fetching your job postings and applications data</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
        <main className={styles.main}>
          <div className={styles.errorContainer}>
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
            <button 
              className={styles.retryBtn}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <main className={styles.main}>
        {isPendingApproval ? (
          <div className={styles.pendingApprovalContainer}>
            <h2>Waiting for Admin Approval</h2>
            <p>Your registration request has been sent to the administrator for approval.</p>
            <p>Once approved, you will have full access to the dashboard. Please check back later.</p>
          </div>
        ) : (
          <>
            <section className={styles.dashboardHeader}>
              <div className={styles.welcomeSection}>
                <h1>Welcome back, {recruiterProfile?.name || 'Recruiter'}!</h1>
                <p>Here's what's happening with your job postings and candidates.</p>
              </div>
            </section>

            <section className={styles.statsSection}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📄</div>
                  <div className={styles.statInfo}>
                    <h3>{stats.totalJobs}</h3>
                    <p>Total Jobs Posted</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🟢</div>
                  <div className={styles.statInfo}>
                    <h3>{stats.activeJobs}</h3>
                    <p>Active Jobs</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>👥</div>
                  <div className={styles.statInfo}>
                    <h3>{stats.totalApplications}</h3>
                    <p>Total Applications</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⭐</div>
                  <div className={styles.statInfo}>
                    <h3>{stats.shortlistedCandidates}</h3>
                    <p>Shortlisted</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📅</div>
                  <div className={styles.statInfo}>
                    <h3>{stats.interviewsScheduled}</h3>
                    <p>Interviews Scheduled</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎉</div>
                  <div className={styles.statInfo}>
                    <h3>{stats.hired}</h3>
                    <p>Hired</p>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.jobsOverview}>
              <div className={styles.sectionHeader}>
                <h2>Recent Job Postings</h2>
                <button
                  className={styles.viewAllBtn}
                  onClick={() => navigate('/manage-jobs')}
                >
                  Manage All Jobs
                </button>
              </div>
              <div className={styles.jobsList}>
                {jobs.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>💼</div>
                    <h3>No Jobs Posted Yet</h3>
                    <p>Create your first job posting to start attracting candidates.</p>
                    <button 
                      className={styles.postJobBtn}
                      onClick={() => navigate('/post-job')}
                    >
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  jobs.slice(0, 3).map((job) => (
                    <div key={job.job_id} className={styles.jobCard}>
                      <div className={styles.jobHeader}>
                        <div className={styles.jobInfo}>
                          <h4>{job.job_title}</h4>
                          <p>{job.company_name} • {job.location}</p>
                        </div>
                        <span className={`${styles.statusBadge} ${getStatusClass(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className={styles.jobDetails}>
                        <span className={styles.jobType}>{job.employment_type}</span>
                        <span className={styles.jobMode}>{job.work_mode}</span>
                        <span className={styles.jobDate}>
                          Posted {formatDate(job.created_at)}
                        </span>
                      </div>
                      <div className={styles.jobActions}>
                        <button 
                          className={styles.editJobBtn}
                          onClick={() => navigate(`/edit-job/${job.job_id}`)}
                        >
                          Edit Job
                        </button>
                        <button 
                          className={styles.viewApplicationsBtn}
                          onClick={() => navigate('/candidate-applications')}
                        >
                          View Applications
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className={styles.contentSection}>
              <div className={styles.contentGrid}>
                <div className={styles.recentApplications}>
                  <div className={styles.sectionHeader}>
                    <h2>Recent Applications</h2>
                    <button
                      className={styles.viewAllBtn}
                      onClick={() => navigate('/candidate-applications')}
                    >
                      View All
                    </button>
                  </div>
                  <div className={styles.applicationsList}>
                    {recentApplications.length === 0 ? (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📄</div>
                        <h3>No Applications Yet</h3>
                        <p>Start posting jobs to receive applications from candidates.</p>
                        <button 
                          className={styles.postJobBtn}
                          onClick={() => navigate('/post-job')}
                        >
                          Post Your First Job
                        </button>
                      </div>
                    ) : (
                      recentApplications.map((application) => (
                        <div key={application.application_id} className={styles.applicationCard}>
                          <div className={styles.applicationHeader}>
                            <div className={styles.candidateInfo}>
                              <h4>{application.candidateName}</h4>
                              <p>{application.job_title}</p>
                            </div>
                            <span className={`${styles.statusBadge} ${getStatusClass(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                          <div className={styles.applicationDetails}>
                            <span className={styles.studentId}>Student ID: {application.student_id}</span>
                            <span className={styles.appliedDate}>
                              Applied {new Date(application.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className={styles.applicationActions}>
                            <button 
                              className={styles.viewResumeBtn}
                              onClick={() => window.open(application.resume_url, '_blank')}
                            >
                              View Resume
                            </button>
                            <button 
                              className={styles.contactBtn}
                              onClick={() => alert('Contact functionality will be implemented')}
                            >
                              Contact
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className={styles.quickActions}>
                  <h2>Quick Actions</h2>
                  <div className={styles.actionsGrid}>
                    {quickActions.map((action, index) => (
                      <div key={index} className={styles.actionCard} onClick={action.action}>
                        <div className={styles.actionIcon}>{action.icon}</div>
                        <div className={styles.actionContent}>
                          <h3>{action.title}</h3>
                          <p>{action.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default RecruiterDashboard;
