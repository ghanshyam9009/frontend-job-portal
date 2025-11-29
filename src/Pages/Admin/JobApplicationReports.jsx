import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { studentService } from "../../services/studentService";
import { employerService } from "../../services/employerService";
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
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const jobsPerPage = 10;

  useEffect(() => {
    const fetchJobReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobsData = await adminService.getJobsWithApplicationCounts();
        setJobs(jobsData);
        setFilteredJobs(jobsData);
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

  const handleViewApplications = async (job) => {
    setSelectedJob({ ...job, applications: [] });
    setShowModal(true);
    setLoadingMessage('Loading applications...');

    try {
      const applicationsData = await adminService.getApplicationsForJob(job.id);
      const applications = applicationsData.applications || [];

      // Applications already contain full student data from the API
      const applicationsWithDetails = applications.map((app) => {
        // Student data is embedded directly in the application object
        // Fields like student_name, student_email, student_phone, student_skills, etc. are already available
        return {
          ...app,
          student_details: {
            name: app.student_name || "Unknown",
            email: app.student_email || app.email || null,
            phone: app.student_phone || null,
            skills: app.student_skills ? app.student_skills.split(',').map(skill => skill.trim()) : [],
            location: app.student_location || null,
            experience: app.student_experience || null,
            education: app.student_university ? [app.student_university] : [],
            experience_years: app.student_experience_years || null,
            bio: app.student_bio || null,
            resumeUrl: app.resume_url || app.student_profile?.resume || null,
            department: app.student_department || null,
            cgpa: app.student_cgpa || null
          }
        };
      });

      setSelectedJob({ ...job, applications: applicationsWithDetails, application_count: applicationsWithDetails.length });
    } catch (e) {
      console.error(`Failed to fetch applications for job ${job.id}`, e);
      // Optionally set an error message to display in the modal
    } finally {
      setLoadingMessage('');
    }
  };

  const handleViewCandidateDetails = async (candidate) => {
    setSelectedCandidate({ ...candidate, loading: true });
    setShowCandidateModal(true);

    // If we don't have full student details and we have an email, try to fetch them
    if (!candidate.student_details && candidate.email) {
      try {
        const studentDetails = await studentService.fetchProfileDetails(candidate.email);
        setSelectedCandidate({
          ...candidate,
          student_details: studentDetails,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch detailed student profile:', error);
        setSelectedCandidate({
          ...candidate,
          student_details: null,
          loading: false
        });
      }
    } else {
      setSelectedCandidate({ ...candidate, loading: false });
    }
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
      // Prepare applications with candidate details
      let exportData = [];

      for (const app of job.applications) {
        const baseData = {
          'Application ID': app.application_id || 'Not provided',
          'Job Title': job.job_title || 'Not provided',
          'Company Name': job.company_name || 'Not provided',
          'Application Status': app.status || 'pending',
          'Status Verified': app.status_verified || 'Not verified',
          'Application Date': formatDate(app.created_at || app.applied_date),
          'Last Updated': formatDate(app.updated_at),
          'Resume URL': app.resume_url || app.resume_link || 'Not available',
          'Cover Letter': app.cover_letter || 'Not provided',
          'Show to Recruiter': app.to_show_recruiter ? 'Yes' : 'No',
          'Show to User': app.to_show_user ? 'Yes' : 'No'
        };

        // Add candidate profile information if available
        if (app.student_details) {
          const profile = app.student_details;
          exportData.push({
            ...baseData,
            'Candidate Name': profile.name || profile.full_name || app.student_name || 'Unknown',
            'Email': profile.email || app.student_id || 'Not provided',
            'Phone': profile.phone || profile.phone_number || 'Not provided',
            'Location': profile.location || profile.address || 'Not provided',
            'Experience': profile.experience || (profile.experience_years ? `${profile.experience_years} years` : 'Not provided'),
            'Skills': Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || 'Not provided'),
            'Education': Array.isArray(profile.education)
              ? profile.education.map(edu =>
                  typeof edu === 'string' ? edu :
                  `${edu.degree || ''} ${edu.institution || ''} ${edu.year || ''}`.trim()
                ).join('; ')
              : (profile.education || 'Not provided'),
            'Bio': profile.bio || 'Not provided',
            'Date of Birth': profile.dob || 'Not provided',
            'Gender': profile.gender || 'Not provided'
          });
        } else {
          // If no detailed profile, still include basic info
          exportData.push({
            ...baseData,
            'Candidate Name': app.student_name || 'Unknown',
            'Email': 'Not available (fetch failed)',
            'Phone': 'Not available (fetch failed)',
            'Location': 'Not available (fetch failed)',
            'Experience': 'Not available (fetch failed)',
            'Skills': 'Not available (fetch failed)',
            'Education': 'Not available (fetch failed)',
            'Bio': 'Not available (fetch failed)',
            'Date of Birth': 'Not available (fetch failed)',
            'Gender': 'Not available (fetch failed)'
          });
        }
      }

      console.log('Enhanced export data with candidate details:', exportData);

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');

      // Generate filename with job title and company
      const sanitizedCompany = (job.company_name || 'Unknown').replace(/[^a-zA-Z0-9_]/g, '_');
      const sanitizedJobTitle = (job.job_title || job.title || 'Job').replace(/[^a-zA-Z0-9_]/g, '_');
      const filename = `${sanitizedCompany}_${sanitizedJobTitle}_Applications_with_Candidate_Details.xlsx`;

      console.log('Attempting to download file:', filename);

      // Use a more reliable download method
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Excel file with candidate details download triggered successfully');

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
                      className={`${styles.actionBtn} ${styles.infoBtn}`}
                      title="View Applications"
                      onClick={() => handleViewApplications(job)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.exportBtn}`}
                      title="Export to Excel"
                      onClick={() => handleExportToExcel(job)}
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

      {/* Applications Modal */}
      {showModal && selectedJob && (
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
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90%',
            overflowY: 'auto',
            color: theme === 'dark' ? '#fff' : '#000'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>All Candidates Applied for: {selectedJob.job_title}</h3>
              <button
                onClick={() => setShowModal(false)}
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

            <div style={{ marginBottom: '20px' }}>
              <p><strong>Company:</strong> {selectedJob.company_name}</p>
              <p><strong>Total Candidates Applied:</strong> {selectedJob.application_count}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>Showing all candidates who applied for this job (all statuses included)</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() => handleExportToExcel(selectedJob)}
                style={{
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <Download size={16} style={{ marginRight: '8px' }} />
                Download All Applications
              </button>
            </div>

            {loadingMessage ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>{loadingMessage}</div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {selectedJob.applications && selectedJob.applications.length > 0 ? (
                  selectedJob.applications.map((application, index) => (
                    <div key={application.application_id || index} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: theme === 'dark' ? '#444' : '#f9f9f9'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0 }}>{application.student_name}</h4>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: application.status === 'Shortlisted' ? '#28a745' :
                                         application.status === 'Rejected' ? '#dc3545' : '#ffc107',
                          color: '#fff',
                          fontSize: '12px'
                        }}>
                          {application.status || 'pending'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <strong>Applied Date:</strong> {formatDate(application.created_at || application.applied_date)}
                        </div>
                        <div>
                          <strong>Last Updated:</strong> {formatDate(application.updated_at)}
                        </div>
                      </div>

                      {application.cover_letter && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Cover Letter:</strong>
                          <p style={{ margin: '5px 0', fontStyle: 'italic' }}>{application.cover_letter}</p>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleViewCandidateDetails(application)}
                          style={{
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={14} style={{ marginRight: '5px' }} />
                          View Details
                        </button>

                        {application.resume_url && (
                          <a
                            href={application.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: '#6c757d',
                              color: '#fff',
                              textDecoration: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Download size={14} style={{ marginRight: '5px' }} />
                            Resume
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div>No applications found for this job.</div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {showCandidateModal && selectedCandidate && (
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
          zIndex: 1001,
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: theme === 'dark' ? '#333' : '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90%',
            overflowY: 'auto',
            color: theme === 'dark' ? '#fff' : '#000'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Candidate Application & Profile Details</h3>
              <button
                onClick={() => setShowCandidateModal(false)}
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

            {selectedCandidate.loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading candidate details...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Application Details Section */}
                <div style={{
                  border: '2px solid #007bff',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: theme === 'dark' ? '#2a4a6b' : '#f8f9ff'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#007bff' }}>Application Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Application ID:</label>
                      <p>{selectedCandidate.application_id}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Student Name:</label>
                      <p>{selectedCandidate.student_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Job Title:</label>
                      <p>{selectedJob?.job_title || 'Not available'}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Company Name:</label>
                      <p>{selectedJob?.company_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Application Status:</label>
                      <p style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: selectedCandidate.status === 'Shortlisted' ? '#28a745' :
                                       selectedCandidate.status === 'Rejected' ? '#dc3545' : '#ffc107',
                        color: '#fff'
                      }}>
                        {selectedCandidate.status || 'pending'}
                      </p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Status Verified:</label>
                      <p>{selectedCandidate.status_verified || 'Not verified'}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Applied Date:</label>
                      <p>{formatDate(selectedCandidate.created_at || selectedCandidate.applied_date)}</p>
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Last Updated:</label>
                      <p>{formatDate(selectedCandidate.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Candidate Profile Details Section */}
                {selectedCandidate.student_details && (
                  <div style={{
                    border: '2px solid #28a745',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: theme === 'dark' ? '#2d5a2d' : '#f8fff8'
                  }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#28a745' }}>Candidate Profile</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Full Name:</label>
                        <p>{selectedCandidate.student_details.name || selectedCandidate.student_details.full_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Email:</label>
                        <p>{selectedCandidate.student_details.email || selectedCandidate.student_id || 'Not provided'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Phone:</label>
                        <p>{selectedCandidate.student_details.phone || selectedCandidate.student_details.phone_number || 'Not provided'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Location:</label>
                        <p>{selectedCandidate.student_details.location || selectedCandidate.student_details.address || 'Not provided'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Experience:</label>
                        <p>{selectedCandidate.student_details.experience || selectedCandidate.student_details.experience_years ? `${selectedCandidate.student_details.experience_years || ''} years`.trim() : 'Not provided'}</p>
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold' }}>Skills:</label>
                        <p>{Array.isArray(selectedCandidate.student_details.skills)
                          ? selectedCandidate.student_details.skills.join(', ')
                          : (selectedCandidate.student_details.skills || 'Not provided')
                        }</p>
                      </div>
                      {selectedCandidate.student_details.education && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontWeight: 'bold' }}>Education:</label>
                          <p>{Array.isArray(selectedCandidate.student_details.education)
                            ? selectedCandidate.student_details.education.map(edu =>
                                typeof edu === 'string' ? edu :
                                `${edu.degree || ''} ${edu.institution || ''} ${edu.year || ''}`.trim()
                              ).join(', ')
                            : selectedCandidate.student_details.education
                          }</p>
                        </div>
                      )}
                      {selectedCandidate.student_details.bio && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontWeight: 'bold' }}>Bio/About:</label>
                          <p>{selectedCandidate.student_details.bio}</p>
                        </div>
                      )}
                      {selectedCandidate.student_details.resumeUrl || (selectedCandidate.resume_url && selectedCandidate.resume_url !== 'Not available') && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontWeight: 'bold' }}>Resume Details:</label>
                          <div style={{
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: theme === 'dark' ? '#555' : '#f8f8f8',
                            marginTop: '5px'
                          }}>
                            <p style={{ margin: '0 0 10px 0' }}>
                              Resume URL: {selectedCandidate.student_details.resumeUrl || selectedCandidate.resume_url}
                            </p>
                            {selectedCandidate.student_details.resumeUrl || selectedCandidate.resume_url ? (
                              <a
                                href={selectedCandidate.student_details.resumeUrl || selectedCandidate.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  backgroundColor: '#007bff',
                                  color: '#fff',
                                  textDecoration: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  fontSize: '14px'
                                }}
                              >
                                <Download size={14} style={{ marginRight: '5px' }} />
                                View/Download Resume
                              </a>
                            ) : (
                              <p>Resume not available</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Application Specific Details */}
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <label style={{ fontWeight: 'bold' }}>Show to Recruiter:</label>
                    <p>{selectedCandidate.to_show_recruiter ? 'Yes' : 'No'}</p>
                  </div>

                  <div>
                    <label style={{ fontWeight: 'bold' }}>Show to User:</label>
                    <p>{selectedCandidate.to_show_user ? 'Yes' : 'No'}</p>
                  </div>

                  {selectedCandidate.cover_letter && (
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Cover Letter:</label>
                      <div style={{
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: theme === 'dark' ? '#444' : '#f9f9f9',
                        marginTop: '5px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedCandidate.cover_letter}
                      </div>
                    </div>
                  )}

                  {(selectedCandidate.resume_url || (selectedCandidate.student_details && selectedCandidate.student_details.resumeUrl)) && (
                    <div>
                      <label style={{ fontWeight: 'bold' }}>Resume:</label>
                      <div style={{ marginTop: '5px' }}>
                        <a
                          href={selectedCandidate.resume_url || selectedCandidate.student_details.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: '#007bff',
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <Download size={14} style={{ marginRight: '5px' }} />
                          Download Resume
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowCandidateModal(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationReports;
