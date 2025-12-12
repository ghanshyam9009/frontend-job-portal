import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useSidebar } from "../../Contexts/SidebarContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { useTheme } from "../../Contexts/ThemeContext";
import { Edit, Users, CircleX, FileText, MapPin, Check, ArrowLeft, ExternalLink, Briefcase, Calendar, TrendingUp, Building, X, Plus } from "lucide-react";
import { recruiterExternalService } from "../../services";
import { studentService } from "../../services/studentService";

const ManageJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState({});
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const employerId = user?.employer_id || user?.id;
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");

        if (!employerId) {
          console.warn('No employer ID available');
          setJobs([]);
          return;
        }

        const data = await recruiterExternalService.getAllPostedJobs(employerId);
        const allJobs = data?.jobs || [];

        const approvedJobs = allJobs.filter(job => job && job.job_id && job.job_title);

        const jobsData = approvedJobs.map(job => ({
          id: job.job_id,
          title: job.job_title,
          company: job.company_name || "",
          location: job.location || "",
          type: job.employment_type || "",
          workMode: job.work_mode || "",
          salary: job.salary_range ? `${Math.round(job.salary_range.min/100000)}L - ${Math.round(job.salary_range.max/100000)}L` : "",
          status: (job.status || "Open").toLowerCase() === "open" ? "Active" : job.status,
          postedDate: (job.created_at || "").split("T")[0] || "",
          applications: job.application_count || 0,
          views: 0
        }));
        
        setJobs(jobsData);
      } catch (e) {
        console.error(e);
        setError(typeof e === "string" ? e : e?.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user]);

  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleToggleStatus = async (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    if (job.status === 'Active') {
      try {
        setLoading(true);
        await recruiterExternalService.closeJobOpening(jobId);
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Closed' } : j));
        alert('Job closed successfully');
      } catch (e) {
        console.error(e);
        alert('Failed to close job');
      } finally {
        setLoading(false);
      }
    } else {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Active' } : j));
    }
  };

  const handleViewApplications = async (jobId) => {
    setSelectedJobId(jobId);
    setShowApplicationsModal(true);
    
    if (applications[jobId]) {
      return;
    }

    try {
      setApplicationsLoading(true);
      const applicationsData = await recruiterExternalService.getAllApplicants(jobId);
      const applicationsList = applicationsData.applications || [];
      
      const applicationsWithDetails = await Promise.all(
        applicationsList.map(async (app) => {
          try {
            const studentDetails = await studentService.getStudentById(app.student_id);
            return { ...app, ...studentDetails };
          } catch (err) {
            console.error(`Failed to fetch details for student ${app.student_id}:`, err);
            return { ...app, student_name: "Unknown", student_email: "Unknown" };
          }
        })
      );

      setApplications(prev => ({ ...prev, [jobId]: applicationsWithDetails }));
    } catch (error) {
      console.error(`Failed to fetch applications for job ${jobId}:`, error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, statusBool) => {
    try {
      setLoading(true);
      await recruiterExternalService.changeApplicationStatus(applicationId, statusBool);
      
      const jobApplications = applications[selectedJobId] || [];
      const updatedApplications = jobApplications.map(app => 
        app.application_id === applicationId 
          ? { ...app, status: statusBool ? 'Shortlisted' : 'Pending' }
          : app
      );
      
      setApplications(prev => ({
        ...prev,
        [selectedJobId]: updatedApplications
      }));
      
      alert(`Application ${statusBool ? 'shortlisted' : 'moved to pending'} successfully`);
    } catch (e) {
      console.error(e);
      alert('Failed to update application status');
    } finally {
      setLoading(false);
    }
  };

  const closeApplicationsModal = () => {
    setShowApplicationsModal(false);
    setSelectedJobId(null);
  };

  const filteredJobs = filterStatus === "All" 
    ? jobs 
    : jobs.filter(job => job.status.toLowerCase() === filterStatus.toLowerCase());

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'active':
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'shortlisted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className={`text-2xl lg:text-3xl font-bold ${textColor} mb-1`}>
                  Manage Posted Jobs
                </h1>
                <p className={`text-sm ${textSecondary}`}>
                  View, edit, and manage your job postings
                </p>
              </div>
              <button 
                onClick={() => navigate('/post-job')}
                className="px-6 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors flex items-center gap-2 font-medium"
              >
                <Plus size={18} />
                Post New Job
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="text-blue-500" size={20} />
                </div>
                <TrendingUp className="text-green-500" size={16} />
              </div>
              <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{jobs.length}</h3>
              <p className={`text-xs ${textSecondary}`}>Total Jobs</p>
            </div>

            <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Briefcase className="text-green-500" size={20} />
                </div>
              </div>
              <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{jobs.filter(j => j.status === 'Active').length}</h3>
              <p className={`text-xs ${textSecondary}`}>Active Jobs</p>
            </div>

            <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="text-purple-500" size={20} />
                </div>
              </div>
              <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{jobs.reduce((sum, job) => sum + job.applications, 0)}</h3>
              <p className={`text-xs ${textSecondary}`}>Total Applications</p>
            </div>
          </div>

          {/* Filters */}
          <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-4 mb-6`}>
            <div className="flex gap-2 flex-wrap">
              {['All', 'Active', 'Draft', 'Closed'].map(status => (
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
          </div>

          {/* Jobs List */}
          {loading && (
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-8 text-center`}>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2271B5] mx-auto mb-4"></div>
              <h3 className={`text-lg ${textColor}`}>Loading jobs...</h3>
            </div>
          )}

          {error && (
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-8 text-center`}>
              <h3 className="text-lg text-red-500">{error}</h3>
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-12 text-center`}>
              <FileText size={48} className={`mx-auto ${textSecondary} mb-4`} />
              <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No jobs found</h3>
              <p className={`${textSecondary} mb-6`}>No jobs match your current filter criteria.</p>
              <button 
                onClick={() => navigate('/post-job')}
                className="px-6 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors"
              >
                Post Your First Job
              </button>
            </div>
          )}

          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div key={job.id} className={`${cardBg} rounded-lg shadow-sm border ${borderColor} p-5 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${textColor} mb-2`}>{job.title}</h3>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className={`flex items-center gap-1 ${textSecondary}`}>
                        <Building size={14} /> {job.company}
                      </span>
                      <span className={`flex items-center gap-1 ${textSecondary}`}>
                        <MapPin size={14} /> {job.location}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}>
                    {job.type}
                  </span>
                  {job.workMode && (
                    <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}>
                      {job.workMode}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}>
                    {job.salary}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary} flex items-center gap-1`}>
                    <Calendar size={10} />
                    {job.postedDate}
                  </span>
                </div>

                <div className={`flex items-center gap-4 mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${textColor}`}>{job.applications}</p>
                    <p className={`text-xs ${textSecondary}`}>Applications</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleEditJob(job.id)}
                    className={`flex-1 min-w-[120px] px-4 py-2 border ${borderColor} rounded-md text-sm ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2`}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleViewApplications(job.id)}
                    className="flex-1 min-w-[120px] px-4 py-2 bg-[#2271B5] text-white text-sm rounded-md hover:bg-[#1a5a8f] transition-colors flex items-center justify-center gap-2"
                  >
                    <Users size={16} /> View ({job.applications})
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job.id)}
                    className={`px-4 py-2 border ${borderColor} rounded-md text-sm ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2`}
                  >
                    <CircleX size={16} /> {job.status === 'Active' ? 'Close' : 'Reopen'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeApplicationsModal}>
          <div className={`${cardBg} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-5 border-b ${borderColor} flex items-center justify-between`}>
              <h2 className={`text-xl font-bold ${textColor}`}>Job Applications</h2>
              <button
                onClick={closeApplicationsModal}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <X size={20} className={textColor} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              {applicationsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2271B5] mx-auto mb-4"></div>
                  <h3 className={`text-lg ${textColor}`}>Loading applications...</h3>
                </div>
              ) : applications[selectedJobId]?.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className={`mx-auto ${textSecondary} mb-4`} />
                  <p className={`text-lg ${textSecondary}`}>No applications found for this job.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications[selectedJobId]?.map((application) => (
                    <div key={application.application_id} className={`border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}>
                      <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                        <div className="flex-1">
                          <h4 className={`text-lg font-bold ${textColor} mb-1`}>{application.student_name}</h4>
                          <p className={`text-sm ${textSecondary} mb-1`}>{application.student_email}</p>
                          <div className="flex gap-3 flex-wrap text-xs">
                            <span className={`flex items-center gap-1 ${textSecondary}`}>
                              <Calendar size={12} />
                              Applied: {new Date(application.created_at).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {application.status === 'Pending' ? (
                            <button
                              onClick={() => handleUpdateApplicationStatus(application.application_id, true)}
                              disabled={loading}
                              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                            >
                              <Check size={16} /> Shortlist
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateApplicationStatus(application.application_id, false)}
                              disabled={loading}
                              className={`px-4 py-2 border ${borderColor} rounded-md text-sm ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50`}
                            >
                              <ArrowLeft size={16} /> Move to Pending
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg mb-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <h5 className={`text-sm font-bold ${textColor} mb-2`}>Cover Letter:</h5>
                        <p className={`text-sm ${textSecondary} leading-relaxed`}>{application.cover_letter}</p>
                      </div>

                      <div className="flex items-center gap-3">
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
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-5 border-t ${borderColor} flex justify-end`}>
              <button
                onClick={closeApplicationsModal}
                className="px-6 py-2.5 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors font-medium"
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

export default ManageJobs;