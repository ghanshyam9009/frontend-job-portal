import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import styles from "../../Styles/RecruiterDashboard.module.css";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "₹12L - ₹15L",
      status: "Active",
      postedDate: "2024-01-10",
      applications: 45,
      views: 234
    },
    {
      id: 2,
      title: "UX Designer",
      company: "TechCorp",
      location: "Remote",
      type: "Full-time",
      salary: "₹9L - ₹11L",
      status: "Active",
      postedDate: "2024-01-08",
      applications: 32,
      views: 189
    },
    {
      id: 3,
      title: "Backend Engineer",
      company: "TechCorp",
      location: "New York, NY",
      type: "Full-time",
      salary: "₹13L - ₹16L",
      status: "Draft",
      postedDate: "2024-01-05",
      applications: 0,
      views: 0
    },
    {
      id: 4,
      title: "Product Manager",
      company: "TechCorp",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "₹14L - ₹17L",
      status: "Closed",
      postedDate: "2024-01-01",
      applications: 67,
      views: 456
    }
  ]);

  const [filterStatus, setFilterStatus] = useState("All");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      setJobs(prev => prev.filter(job => job.id !== jobId));
      alert("Job deleted successfully!");
    }
  };

  const handleDuplicateJob = (jobId) => {
    const jobToDuplicate = jobs.find(job => job.id === jobId);
    if (jobToDuplicate) {
      const duplicatedJob = {
        ...jobToDuplicate,
        id: Date.now(),
        title: `${jobToDuplicate.title} (Copy)`,
        status: "Draft",
        postedDate: new Date().toISOString().split('T')[0],
        applications: 0,
        views: 0
      };
      setJobs(prev => [...prev, duplicatedJob]);
      alert("Job duplicated successfully!");
    }
  };

  const handleToggleStatus = (jobId) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { 
            ...job, 
            status: job.status === 'Active' ? 'Closed' : 'Active' 
          }
        : job
    ));
  };

  const filteredJobs = filterStatus === "All" 
    ? jobs 
    : jobs.filter(job => job.status.toLowerCase() === filterStatus.toLowerCase());

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return styles.statusActive;
      case 'draft':
        return styles.statusDraft;
      case 'closed':
        return styles.statusClosed;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <RecruiterSidebar darkMode={darkMode} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <section className={styles.manageJobsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h1>Manage Posted Jobs</h1>
              <p>View, edit, and manage your job postings</p>
            </div>
            <button 
              className={styles.postNewJobBtn}
              onClick={() => navigate('/post-job')}
            >
              Post New Job
            </button>
          </div>

          <div className={styles.filtersSection}>
            <div className={styles.filterTabs}>
              {['All', 'Active', 'Draft', 'Closed'].map(status => (
                <button
                  key={status}
                  className={`${styles.filterTab} ${filterStatus === status ? styles.activeFilter : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className={styles.statsSummary}>
              <span>Total Jobs: {jobs.length}</span>
              <span>Active: {jobs.filter(job => job.status === 'Active').length}</span>
              <span>Total Applications: {jobs.reduce((sum, job) => sum + job.applications, 0)}</span>
            </div>
          </div>

          <div className={styles.jobsList}>
            {filteredJobs.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📄</div>
                <h3>No jobs found</h3>
                <p>No jobs match your current filter criteria.</p>
                <button 
                  className={styles.primaryBtn}
                  onClick={() => navigate('/post-job')}
                >
                  Post Your First Job
                </button>
              </div>
            ) : (
              filteredJobs.map(job => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <div className={styles.jobMeta}>
                        <span className={styles.company}>{job.company}</span>
                        <span className={styles.location}>📍 {job.location}</span>
                        <span className={styles.type}>{job.type}</span>
                        <span className={styles.salary}>💰 {job.salary}</span>
                      </div>
                    </div>
                    <div className={styles.jobStatus}>
                      <span className={`${styles.statusBadge} ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>

                  <div className={styles.jobStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{job.applications}</span>
                      <span className={styles.statLabel}>Applications</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{job.views}</span>
                      <span className={styles.statLabel}>Views</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statValue}>{job.postedDate}</span>
                      <span className={styles.statLabel}>Posted</span>
                    </div>
                  </div>

                  <div className={styles.jobActions}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleEditJob(job.id)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleDuplicateJob(job.id)}
                    >
                      📋 Duplicate
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleToggleStatus(job.id)}
                    >
                      {job.status === 'Active' ? '🔄 Close' : '🔄 Reopen'}
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ManageJobs;
