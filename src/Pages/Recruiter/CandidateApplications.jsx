import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { recruiterExternalService } from "../../services";
import { studentService } from "../../services/studentService";
import { Check, X, ArrowLeft, FileText, Users, Calendar, Mail, Briefcase, TrendingUp, ExternalLink } from "lucide-react";

const CandidateApplications = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedJob, setSelectedJob] = useState("All");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch all jobs first
        const jobsData = await recruiterExternalService.getAllPostedJobs(user?.employer_id || user?.id);
        const jobsList = (jobsData?.jobs || []).map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.company_name
        }));
        setJobs(jobsList);

        // Fetch applications for all jobs
        const allApplications = [];
        for (const job of jobsList) {
          try {
            const applicationsData = await recruiterExternalService.getAllApplicants(job.id);
            const jobApplications = (applicationsData.applications || []).map(app => ({
              ...app,
              job_title: job.title,
              job_id: job.id
            }));
            allApplications.push(...jobApplications);
          } catch (err) {
            console.error(`Failed to fetch applications for job ${job.id}:`, err);
          }
        }
        
        const applicationsWithDetails = await Promise.all(
          allApplications.map(async (app) => {
            try {
              const studentDetails = await studentService.getStudentById(app.student_id);
              return { ...app, ...studentDetails };
            } catch (err) {
              console.error(`Failed to fetch details for student ${app.student_id}:`, err);
              return { ...app, student_name: "Unknown", student_email: "Unknown" };
            }
          })
        );

        setApplications(applicationsWithDetails);
      } catch (e) {
        console.error(e);
        setError(typeof e === "string" ? e : e?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpdateApplicationStatus = async (applicationId, statusBool) => {
    try {
      setLoading(true);
      await recruiterExternalService.changeApplicationStatus(applicationId, statusBool);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.application_id === applicationId 
          ? { ...app, status: statusBool ? 'Shortlisted' : 'Pending' }
          : app
      ));
      
      alert(`Application ${statusBool ? 'shortlisted' : 'moved to pending'} successfully`);
    } catch (e) {
      console.error(e);
      alert('Failed to update application status');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const statusMatch = filterStatus === "All" || app.status.toLowerCase() === filterStatus.toLowerCase();
    const jobMatch = selectedJob === "All" || app.job_id === selectedJob;
    return statusMatch && jobMatch;
  });

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      {/* <RecruiterSidebar darkMode={theme === 'dark'} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} /> */}
      
      <main className="pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-2xl lg:text-3xl font-bold ${textColor} mb-1`}>
              Candidate Applications
            </h1>
            <p className={`text-sm ${textSecondary}`}>
              View and manage all job applications
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="text-blue-500" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{applications.length}</h3>
              <p className={`text-xs ${textSecondary}`}>Total Applications</p>
            </div>

            <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Calendar className="text-yellow-500" size={20} />
                </div>
              </div>
              <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{applications.filter(app => app.status === 'Pending').length}</h3>
              <p className={`text-xs ${textSecondary}`}>Pending Review</p>
            </div>

            <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Check className="text-green-500" size={20} />
                </div>
              </div>
              <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{applications.filter(app => app.status === 'Shortlisted').length}</h3>
              <p className={`text-xs ${textSecondary}`}>Shortlisted</p>
            </div>
          </div>

          {/* Filters */}
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-4 mb-6`}>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Status Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {['All', 'Pending', 'Shortlisted', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterStatus === status 
                        ? 'bg-[#2271B5] text-white' 
                        : `${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textColor}`
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Job Filter Dropdown */}
              <div className="flex items-center gap-2">
                <label className={`text-sm font-medium ${textColor} whitespace-nowrap`}>Filter by Job:</label>
                <select 
                  value={selectedJob} 
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className={`px-3 py-2 rounded-md text-sm border ${borderColor} ${cardBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-[#2271B5]`}
                >
                  <option value="All">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {loading && (
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-8 text-center`}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2271B5] mx-auto mb-4"></div>
              <h3 className={`text-lg ${textColor}`}>Loading applications...</h3>
            </div>
          )}

          {error && (
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-8 text-center`}>
              <h3 className="text-lg text-red-500">{error}</h3>
            </div>
          )}

          {!loading && !error && filteredApplications.length === 0 && (
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-12 text-center`}>
              <FileText size={48} className={`mx-auto ${textSecondary} mb-4`} />
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No applications found</h3>
              <p className={`${textSecondary}`}>No applications match your current filter criteria.</p>
            </div>
          )}

          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.application_id} className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-5 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${textColor} mb-2`}>{application.student_name}</h3>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className={`flex items-center gap-1 ${textSecondary}`}>
                        <Mail size={14} /> {application.student_email}
                      </span>
                      <span className={`flex items-center gap-1 ${textSecondary}`}>
                        <Briefcase size={14} /> Applied for: {application.job_title}
                      </span>
                      <span className={`flex items-center gap-1 ${textSecondary}`}>
                        <Calendar size={14} /> Applied on: {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </div>

                {/* Cover Letter Section */}
                <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h5 className={`text-sm font-bold ${textColor} mb-2`}>Cover Letter:</h5>
                  <p className={`text-sm ${textSecondary} leading-relaxed`}>{application.cover_letter}</p>
                </div>

                {/* Resume Section */}
                <div className="flex items-center gap-3 mb-4">
                  <h5 className={`text-sm font-bold ${textColor}`}>Resume:</h5>
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors text-sm font-medium"
                  >
                    <ExternalLink size={14} />
                    View Resume
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {application.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleUpdateApplicationStatus(application.application_id, true)}
                        disabled={loading}
                        className="flex-1 min-w-[140px] px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                      >
                        <Check size={16} /> Shortlist
                      </button>
                      <button
                        onClick={() => handleUpdateApplicationStatus(application.application_id, false)}
                        disabled={loading}
                        className="flex-1 min-w-[140px] px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                      >
                        <X size={16} /> Reject
                      </button>
                    </>
                  ) : application.status === 'Shortlisted' ? (
                    <button
                      onClick={() => handleUpdateApplicationStatus(application.application_id, false)}
                      disabled={loading}
                      className={`flex-1 min-w-[160px] px-4 py-2 border ${borderColor} rounded-md text-sm ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50`}
                    >
                      <ArrowLeft size={16} /> Move to Pending
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateApplicationStatus(application.application_id, true)}
                      disabled={loading}
                      className="flex-1 min-w-[140px] px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                    >
                      <Check size={16} /> Shortlist
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateApplications;