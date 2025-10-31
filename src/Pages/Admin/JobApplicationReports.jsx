import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { Search, Download, Users, Building, MapPin, Calendar, Eye } from "lucide-react";
import * as XLSX from 'xlsx';
import styles from "../../Styles/AdminDashboard.module.css";

const JobApplicationReports = () => {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const jobsPerPage = 10;

  // Fetch jobs with application counts
  useEffect(() => {
    const fetchJobReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getJobsWithApplicationCounts();
        setJobs(data);
        setFilteredJobs(data);
      } catch (error) {
        console.error('Failed to fetch job application reports:', error);
        setError('Failed to fetch job application reports. Please try again.');
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobReports();
  }, []);

  // Filter jobs based on search term
  useEffect(() => {
    let filtered = jobs.filter(job =>
      job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, jobs]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (salary.min && salary.max) {
      return `${salary.min} - ${salary.max} ${salary.currency || 'INR'}`;
    }
    return `${salary.min || salary.max} ${salary.currency || 'INR'}`;
  };

  const handleViewApplications = (job) => {
    // If applications are not loaded yet, show loading indicator
    if (job.application_count > 0 && (!job.applications || job.applications.length === 0)) {
      alert('Applications data is loading. Please wait a moment and try again.');
      return;
    }

    // Show applications in a modal or detailed view
    const applications = job.applications || [];
    if (applications.length === 0) {
      alert('No applications found for this job.');
      return;
    }

    // Create a popup/modal with application details
    const modalContent = `
      Applications for: ${job.job_title} - ${job.company_name}

      ${applications.map((app, index) => `
        Application ${index + 1}:
        - Name: ${app.name || app.candidate_name || 'Not provided'}
        - Email: ${app.email || app.candidate_email || 'Not provided'}
        - Phone: ${app.phone || app.candidate_phone || 'Not provided'}
        - Experience: ${app.experience || 'Not provided'}
        - Skills: ${app.skills || 'Not provided'}
        - Applied Date: ${formatDate(app.applied_date || app.application_date)}
        - Status: ${app.status || 'pending'}
        ------------------
      `).join('\n')}

      Total Applications: ${job.application_count}
    `;

    alert(modalContent); // Simple alert for now, could be enhanced to a proper modal
  };

  const handleExportToExcel = async (job) => {
    console.log('Exporting Excel for job:', job);

    if (job.application_count > 0 && (!job.applications || job.applications.length === 0)) {
      alert('Applications data is loading. Please wait a moment and try again.');
      return;
    }

    if (!job.applications || job.applications.length === 0) {
      alert('No applications to export for this job.');
      return;
    }

    try {
      const exportData = job.applications.map(app => ({
        'Candidate Name': app.name || app.candidate_name || 'Not provided',
        'Email': app.email || app.candidate_email || 'Not provided',
        'Phone': app.phone || app.candidate_phone || 'Not provided',
        'Experience': app.experience || 'Not provided',
        'Skills': app.skills ? (Array.isArray(app.skills) ? app.skills.join(', ') : app.skills) : 'Not provided',
        'Application Date': formatDate(app.applied_date || app.application_date),
        'Resume': app.resume_link || app.resume_url || 'Not available',
        'Application Status': app.status || 'pending'
      }));

      console.log('Export data:', exportData);

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');

      // Generate filename with job title and company
      const filename = `${job.company_name || 'Unknown'}_${job.job_title || job.title || 'Job'}_Applications.xlsx`
        .replace(/[^a-zA-Z0-9_]/g, '_');

      console.log('Attempting to download file:', filename);

      // Try to trigger download manually if needed
      XLSX.writeFile(wb, filename);

    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel file. Please check console for details.');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading job application reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
        <div className={styles.errorContainer}>
          <h2>Error Loading Job Reports</h2>
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
        <h1 className={styles.pageTitle}>Job Application Reports</h1>
        <p className={styles.pageSubtitle}>View application statistics for all jobs and export candidate data</p>
      </div>

      {/* Summary Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statValue}>{jobs.length}</div>
          </div>
          <div className={styles.statTitle}>Total Active Jobs</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statValue}>
              {jobs.reduce((sum, job) => sum + (job.application_count || 0), 0)}
            </div>
          </div>
          <div className={styles.statTitle}>Total Applications</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statValue}>
              {Math.max(...jobs.map(job => job.application_count || 0), 0)}
            </div>
          </div>
          <div className={styles.statTitle}>Most Applied Job</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statValue}>
              {jobs.filter(job => job.application_count > 0).length}
            </div>
          </div>
          <div className={styles.statTitle}>Jobs with Applications</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by job title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <Search className={styles.searchIcon} />
        </div>
      </div>

      {/* Jobs Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Salary Range</th>
              <th>Posted Date</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <div className={styles.jobInfo}>
                    <h4 className={styles.jobTitle}>{job.job_title}</h4>
                  </div>
                </td>
                <td>
                  <div className={styles.companyInfo}>
                    <Building className={styles.companyIcon} size={16} />
                    <span className={styles.companyName}>{job.company_name || 'Unknown Company'}</span>
                  </div>
                </td>
                <td className={styles.locationCell}>
                  <MapPin size={14} />
                  <span>{job.location || 'Not specified'}</span>
                </td>
                <td>
                  <span className={styles.salaryCell}>{formatSalary(job.salary_range)}</span>
                </td>
                <td className={styles.dateCell}>
                  <Calendar size={14} />
                  <span>{formatDate(job.created_at)}</span>
                </td>
                <td>
                  <div className={styles.applicationCount}>
                    <Users size={16} />
                    <span className={styles.countBadge}>
                      {job.application_count || 0}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={`${styles.actionBtn} ${job.application_count > 0 ? styles.infoBtn : styles.disabledBtn}`}
                      title="View Applications"
                      onClick={() => handleViewApplications(job)}
                      disabled={job.application_count === 0}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${job.application_count > 0 ? styles.exportBtn : styles.disabledBtn}`}
                      title="Export to Excel"
                      onClick={() => handleExportToExcel(job)}
                      disabled={job.application_count === 0}
                    >
                      <Download size={16} />
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

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + idx;
            if (pageNum > totalPages) return null;

            return (
              <button
                key={pageNum}
                className={`${styles.pageNumber} ${pageNum === currentPage ? styles.activePage : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className={styles.paginationDots}>...</span>
          )}

          {totalPages > 5 && currentPage <= totalPages - 3 && (
            <button
              className={styles.pageNumber}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>
          )}

          <button
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {filteredJobs.length === 0 && (
        <div className={styles.emptyState}>
          <Building className={styles.emptyIcon} />
          <h3>No jobs found</h3>
          <p>No jobs match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default JobApplicationReports;
