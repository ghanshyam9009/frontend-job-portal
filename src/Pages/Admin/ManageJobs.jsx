import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../Components/Admin/AdminNavbar";
import AdminSidebar from "../../Components/Admin/AdminSidebar";
import styles from "../../Styles/ManageJobs.module.css";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const jobsPerPage = 10;

  // Check authentication on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Sample job data
  useEffect(() => {
    const sampleJobs = [
      {
        id: 1,
        title: "Senior Frontend Developer",
        company: "TechCorp Solutions",
        location: "Mumbai, India",
        salary: "₹12L - ₹18L",
        type: "Full-time",
        status: "Pending",
        postedDate: "2024-01-15",
        applications: 45,
        views: 234,
        employer: "techcorp@example.com",
        description: "We are looking for a senior frontend developer with React experience..."
      },
      {
        id: 2,
        title: "UX Designer",
        company: "DesignStudio Inc",
        location: "Remote",
        salary: "₹8L - ₹12L",
        type: "Full-time",
        status: "Approved",
        postedDate: "2024-01-14",
        applications: 32,
        views: 189,
        employer: "design@example.com",
        description: "Join our creative team as a UX designer..."
      },
      {
        id: 3,
        title: "Backend Engineer",
        company: "ServerLogic Pvt Ltd",
        location: "Bangalore, India",
        salary: "₹10L - ₹15L",
        type: "Full-time",
        status: "Rejected",
        postedDate: "2024-01-13",
        applications: 28,
        views: 156,
        employer: "backend@example.com",
        description: "Backend engineer position with Node.js and Python..."
      },
      {
        id: 4,
        title: "Product Manager",
        company: "InnovateCorp",
        location: "Delhi, India",
        salary: "₹15L - ₹25L",
        type: "Full-time",
        status: "Approved",
        postedDate: "2024-01-12",
        applications: 67,
        views: 456,
        employer: "product@example.com",
        description: "Lead product development for our flagship application..."
      },
      {
        id: 5,
        title: "Data Scientist",
        company: "DataFlow Analytics",
        location: "Hyderabad, India",
        salary: "₹12L - ₹20L",
        type: "Full-time",
        status: "Pending",
        postedDate: "2024-01-11",
        applications: 23,
        views: 123,
        employer: "data@example.com",
        description: "Machine learning and data analysis role..."
      },
      {
        id: 6,
        title: "DevOps Engineer",
        company: "CloudWorks Solutions",
        location: "Pune, India",
        salary: "₹11L - ₹16L",
        type: "Full-time",
        status: "Approved",
        postedDate: "2024-01-10",
        applications: 19,
        views: 98,
        employer: "devops@example.com",
        description: "AWS and Kubernetes expertise required..."
      }
    ];
    setJobs(sampleJobs);
    setFilteredJobs(sampleJobs);
  }, []);

  // Filter jobs based on search and status
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, jobs]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return styles.approved;
      case "Pending":
        return styles.pending;
      case "Rejected":
        return styles.rejected;
      default:
        return styles.default;
    }
  };

  const getPaginatedJobs = () => {
    const startIndex = (currentPage - 1) * jobsPerPage;
    return filteredJobs.slice(startIndex, startIndex + jobsPerPage);
  };

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleApproveJob = (jobId) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, status: "Approved" } : job
    );
    setJobs(updatedJobs);
    alert(`Job "${jobs.find(j => j.id === jobId)?.title}" has been approved!`);
  };

  const handleRejectJob = (jobId) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, status: "Rejected" } : job
    );
    setJobs(updatedJobs);
    alert(`Job "${jobs.find(j => j.id === jobId)?.title}" has been rejected!`);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      alert(`Job "${jobs.find(j => j.id === jobId)?.title}" has been deleted!`);
    }
  };

  const getStats = () => {
    const total = jobs.length;
    const approved = jobs.filter(job => job.status === "Approved").length;
    const pending = jobs.filter(job => job.status === "Pending").length;
    const rejected = jobs.filter(job => job.status === "Rejected").length;
    
    return { total, approved, pending, rejected };
  };

  const stats = getStats();

  return (
    <div className={`${styles.manageJobs} ${darkMode ? styles.darkMode : ''}`}>
      <AdminNavbar 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        onMobileMenuToggle={toggleSidebar}
      />
      
      <div className={styles.container}>
        <AdminSidebar 
          darkMode={darkMode} 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        
        <main className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <h1 className={styles.pageTitle}>Manage Jobs</h1>
            <p className={styles.pageSubtitle}>Approve, reject, edit, and delete job postings from employers</p>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.total}</h3>
                <p className={styles.statLabel}>Total Jobs</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.approved}</h3>
                <p className={styles.statLabel}>Approved</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏳</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.pending}</h3>
                <p className={styles.statLabel}>Pending</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>❌</div>
              <div className={styles.statContent}>
                <h3 className={styles.statValue}>{stats.rejected}</h3>
                <p className={styles.statLabel}>Rejected</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className={styles.filtersAndSearch}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
            
            <div className={styles.filters}>
              <select 
                className={styles.filterSelect}
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              
              <select className={styles.filterSelect}>
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Jobs Table */}
          <div className={styles.tableContainer}>
            <table className={styles.jobsTable}>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Posted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedJobs().map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className={styles.jobTitle}>
                        <h4>{job.title}</h4>
                        <span className={styles.jobType}>{job.type}</span>
                      </div>
                    </td>
                    <td className={styles.company}>{job.company}</td>
                    <td className={styles.location}>{job.location}</td>
                    <td className={styles.salary}>{job.salary}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className={styles.applications}>
                      <span className={styles.appCount}>{job.applications}</span>
                      <span className={styles.viewCount}>{job.views} views</span>
                    </td>
                    <td className={styles.date}>{job.postedDate}</td>
                    <td>
                      <div className={styles.actions}>
                        {job.status === "Pending" && (
                          <>
                            <button 
                              className={styles.approveBtn}
                              onClick={() => handleApproveJob(job.id)}
                            >
                              ✅ Approve
                            </button>
                            <button 
                              className={styles.rejectBtn}
                              onClick={() => handleRejectJob(job.id)}
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        <button 
                          className={styles.editBtn}
                          onClick={() => handleEditJob(job)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredJobs.length === 0 && (
            <div className={styles.noResults}>
              <p>No jobs found matching your criteria.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles.paginationBtn} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Edit Job Posting</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>Job Title</label>
                  <input 
                    type="text" 
                    defaultValue={selectedJob.title}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company</label>
                  <input 
                    type="text" 
                    defaultValue={selectedJob.company}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input 
                    type="text" 
                    defaultValue={selectedJob.location}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Salary Range</label>
                  <input 
                    type="text" 
                    defaultValue={selectedJob.salary}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Job Type</label>
                  <select defaultValue={selectedJob.type} className={styles.formInput}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select defaultValue={selectedJob.status} className={styles.formInput}>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Job Description</label>
                  <textarea 
                    defaultValue={selectedJob.description}
                    className={styles.formTextarea}
                    rows="4"
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className={styles.saveBtn}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
