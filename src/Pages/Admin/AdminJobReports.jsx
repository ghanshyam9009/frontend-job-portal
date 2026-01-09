import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { Search, Download, Users, Building, MapPin, Calendar, Eye, Briefcase, RefreshCw, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';

const AdminJobReports = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  useEffect(() => {
    fetchJobReports();
  }, []);

  const fetchJobReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const jobsData = await adminService.getJobsWithApplicationCounts();

      // Filter to only show jobs posted by recruiters (not admin jobs)
      // Also filter out government jobs and sort by latest date first
      const filteredData = jobsData
        .filter(job => {
          const postedBy = (job.posted_by || '').toUpperCase();
          const isRecruiterJob = postedBy === 'RECRUITER' || postedBy === 'EMPLOYER';
          const isNotGovernment = job.job_type !== "GOVERNMENT";
          return isRecruiterJob && isNotGovernment;
        })
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      console.log('Loaded recruiter job reports:', filteredData.length);
      setJobs(filteredData);
      setFilteredJobs(filteredData);
    } catch (error) {
      console.error('Failed to fetch job application reports:', error);
      setError('Failed to fetch job application reports. Please try again.');
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'string') return salary;
    if (salary.min && salary.max) {
      return `${salary.min} - ${salary.max} ${salary.currency || 'INR'}`;
    }
    return `${salary.min || salary.max} ${salary.currency || 'INR'}`;
  };

  const handleViewApplications = (job) => {
    navigate(`/admin/job-reports/applications/${job.id}`);
  };

  const handleQuickExport = async (job) => {
    try {
      // Fetch applications for this job
      const applicationsData = await adminService.getApplicationsForJob(job.id);
      const applications = applicationsData.applications || [];

      if (applications.length === 0) {
        alert('No applications to export for this job.');
        return;
      }

      // Prepare basic export data
      const exportData = applications.map(app => ({
        'Application ID': app.application_id || 'N/A',
        'Job Title': job.job_title || 'N/A',
        'Company Name': job.company_name || 'N/A',
        'Candidate Name': app.student_name || 'Unknown',
        'Email': app.student_email || app.email || 'N/A',
        'Phone': app.student_phone || 'N/A',
        'Skills': app.student_skills || 'N/A',
        'Experience': app.student_experience || 'N/A',
        'Status': app.status || 'pending',
        'Applied Date': formatDate(app.created_at || app.applied_date),
        'Resume URL': app.resume_url || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');

      const sanitizedCompany = (job.company_name || 'Unknown').replace(/[^a-zA-Z0-9_]/g, '_');
      const sanitizedJobTitle = (job.job_title || 'Job').replace(/[^a-zA-Z0-9_]/g, '_');
      const filename = `${sanitizedCompany}_${sanitizedJobTitle}_Applications.xlsx`;

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Excel export successful');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting Excel file. Please try again.');
    }
  };

  const handleCloseJob = async (job) => {
    if (!job || !job.id) return;

    const confirmClose = window.confirm(
      `Are you sure you want to close this job "${job.job_title}"? This will remove it from public display and no new applications will be accepted.`
    );

    if (!confirmClose) return;

    try {
      setLoading(true);
      setError(null);

      // Call the API to close the job
      const response = await fetch(
        `https://wxxi8h89m5.execute-api.ap-southeast-1.amazonaws.com/default/closedjobopening?job_id=${job.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Job closed successfully:', result);

      alert('Job closed successfully! The job has been removed from public display.');
      // Refresh the job reports list
      await fetchJobReports();
    } catch (error) {
      console.error('Failed to close job:', error);
      setError('Failed to close job. Please try again.');
      alert('Failed to close job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor}`}>
        <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center max-w-7xl mx-auto mt-20`}>
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Briefcase className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading job reports...</h3>
          <p className={`${textSecondary} mt-2`}>Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Job Application Reports</h1>
              <p className={`text-sm ${textSecondary} mt-1`}>View application statistics and export candidate data</p>
            </div>
            <button
              onClick={fetchJobReports}
              className={`px-4 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2`}
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className={textSecondary} />
                <span className={`text-sm font-semibold ${textColor}`}>{jobs.length}</span>
                <span className={`text-xs ${textSecondary}`}>Total Jobs</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  {jobs.reduce((sum, job) => sum + (job.application_count || 0), 0)}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-500">Total Applications</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {jobs.filter(job => job.application_count > 0).length}
                </span>
                <span className="text-xs text-green-600 dark:text-green-500">Jobs with Applications</span>
              </div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                  {Math.max(...jobs.map(job => job.application_count || 0), 0)}
                </span>
                <span className="text-xs text-purple-600 dark:text-purple-500">Most Applied</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Filter on Top */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6`}>
          <div className="relative">
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, company, or location..."
              className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Header */}
        <div className="mb-4">
          <p className={`text-sm ${textSecondary}`}>
            Showing <span className={`font-semibold ${textColor}`}>{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && !loading && (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Building size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No job reports found</h3>
            <p className={`${textSecondary} mb-6`}>
              {searchTerm ? "Try adjusting your search query" : "No jobs available for reporting"}
            </p>
          </div>
        )}

        {/* Job Reports - Compact Cards */}
        <div className="space-y-3">
          {currentJobs.map(job => (
            <div
              key={job.id}
              className={`${cardBg} rounded-lg border ${borderColor} hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all`}
            >
              <div className="p-3">
                {/* Job Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold ${textColor} hover:text-blue-600 cursor-pointer leading-tight mb-1.5`}>
                      {job.job_title || 'N/A'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building size={13} className="flex-shrink-0" />
                        {job.company_name || 'Unknown Company'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="flex-shrink-0" />
                        {job.location || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`} style={{ fontSize: '0.7rem' }}>
                    💰 {formatSalary(job.salary_range)}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                    <Calendar size={12} />
                    {formatDate(job.created_at)}
                  </span>
                </div>

                {/* Stats Bar */}
                <div className={`flex items-center gap-4 p-2 rounded-lg mb-2.5 border ${borderColor} ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-blue-500" />
                    <span className={`text-xs font-semibold ${textColor}`}>{job.application_count || 0}</span>
                    <span className={`text-xs ${textSecondary}`} style={{ fontSize: '0.65rem' }}>applications</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleViewApplications(job)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                    style={{ fontSize: '0.7rem' }}
                  >
                    <Eye size={13} />
                    View Applications ({job.application_count || 0})
                  </button>
                  {/* <button
                    onClick={() => handleQuickExport(job)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5`}
                    style={{ fontSize: '0.7rem' }}
                    disabled={!job.application_count || job.application_count === 0}
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">Export Excel</span>
                    <span className="sm:hidden">Export</span>
                  </button> */}
                  <button
                    onClick={() => handleCloseJob(job)}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
                    style={{ fontSize: '0.7rem' }}
                    disabled={loading}
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Delete Job</span>
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
              }`}
            >
              Previous
            </button>
            <span className={`text-sm ${textColor}`}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobReports;
