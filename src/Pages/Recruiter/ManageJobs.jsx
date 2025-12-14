import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useSidebar } from "../../Contexts/SidebarContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { useTheme } from "../../Contexts/ThemeContext";
import { Edit, Users, CircleX, FileText, MapPin, Check, ArrowLeft, ExternalLink, Briefcase, Calendar, TrendingUp, Building, X, Plus, Eye, Filter, Search, Activity, Target } from "lucide-react";
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
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'draft':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'closed':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      case 'shortlisted':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20';
  const cardBg = isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700/50' : 'border-gray-200/50';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      
      <main className="pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header with Gradient Background */}
          <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6 sm:p-8 mb-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${textColor} mb-2 flex items-center gap-3`}>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <Briefcase className="text-white" size={28} />
                    </div>
                    Manage Posted Jobs
                  </h1>
                  <p className={`text-base ${textSecondary} ml-16`}>
                    View, edit, and manage all your job postings in one place
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/post-job')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2 group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  Post New Job
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid - Modern Gradient Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <FileText className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-emerald-500" size={20} />
                </div>
                <h3 className={`text-4xl font-bold ${textColor} mb-1`}>{jobs.length}</h3>
                <p className={`text-sm font-medium ${textSecondary}`}>Total Jobs Posted</p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <Activity className="text-white" size={24} />
                  </div>
                </div>
                <h3 className={`text-4xl font-bold ${textColor} mb-1`}>{jobs.filter(j => j.status === 'Active').length}</h3>
                <p className={`text-sm font-medium ${textSecondary}`}>Active Openings</p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Users className="text-white" size={24} />
                  </div>
                </div>
                <h3 className={`text-4xl font-bold ${textColor} mb-1`}>{jobs.reduce((sum, job) => sum + job.applications, 0)}</h3>
                <p className={`text-sm font-medium ${textSecondary}`}>Total Applications</p>
              </div>
            </div>
          </div>

          {/* Filters Section - Modern Design */}
          <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-5 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                <Filter className="text-white" size={18} />
              </div>
              <h3 className={`text-lg font-bold ${textColor}`}>Filter Jobs</h3>
            </div>
            <div className="flex gap-3 flex-wrap">
              {['All', 'Active', 'Draft', 'Closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filterStatus === status 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                      : `${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${textColor} hover:scale-105`
                  }`}
                >
                  {status}
                  {status !== 'All' && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                      {status === 'Active' ? jobs.filter(j => j.status === 'Active').length : 
                       status === 'Draft' ? jobs.filter(j => j.status === 'Draft').length :
                       jobs.filter(j => j.status === 'Closed').length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-12 text-center`}>
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Briefcase className="text-blue-500" size={32} />
                </div>
              </div>
              <h3 className={`text-xl font-bold ${textColor}`}>Loading your jobs...</h3>
              <p className={`${textSecondary} mt-2`}>Please wait while we fetch your job postings</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-12 text-center`}>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-red-500 mb-2">Failed to Load Jobs</h3>
              <p className={`${textSecondary}`}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredJobs.length === 0 && (
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-16 text-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText size={48} className="text-blue-500" />
                </div>
                <h3 className={`text-2xl font-bold ${textColor} mb-3`}>No Jobs Found</h3>
                <p className={`text-lg ${textSecondary} mb-8 max-w-md mx-auto`}>
                  {filterStatus === 'All' 
                    ? "Start your recruitment journey by posting your first job opening."
                    : `No jobs match the "${filterStatus}" filter criteria.`
                  }
                </p>
                <button 
                  onClick={() => navigate('/post-job')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold inline-flex items-center gap-3 text-lg"
                >
                  <Plus size={24} />
                  Post Your First Job
                </button>
              </div>
            </div>
          )}

          {/* Jobs List - Enhanced Cards */}
          <div className="space-y-5">
            {filteredJobs.map(job => (
              <div key={job.id} className={`${cardBg} rounded-2xl shadow-md border ${borderColor} p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  job.status === 'Active' ? 'from-emerald-500/5 to-emerald-600/5' :
                  job.status === 'Draft' ? 'from-amber-500/5 to-amber-600/5' :
                  'from-rose-500/5 to-rose-600/5'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl ${
                          job.status === 'Active' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                          job.status === 'Draft' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                          'bg-gradient-to-br from-rose-500 to-rose-600'
                        } shadow-lg`}>
                          <Briefcase className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold ${textColor} mb-2 hover:text-blue-500 transition-colors cursor-pointer`}>
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className={`flex items-center gap-1.5 ${textSecondary} font-medium`}>
                              <Building size={16} /> {job.company}
                            </span>
                            <span className={`flex items-center gap-1.5 ${textSecondary} font-medium`}>
                              <MapPin size={16} /> {job.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(job.status)} shadow-md`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 mb-5">
                    <span className={`text-sm px-4 py-2 rounded-xl font-semibold ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary} shadow-sm`}>
                      {job.type}
                    </span>
                    {job.workMode && (
                      <span className={`text-sm px-4 py-2 rounded-xl font-semibold ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary} shadow-sm`}>
                        {job.workMode}
                      </span>
                    )}
                    <span className={`text-sm px-4 py-2 rounded-xl font-semibold ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary} shadow-sm`}>
                      💰 {job.salary}
                    </span>
                    <span className={`text-sm px-4 py-2 rounded-xl font-semibold ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary} flex items-center gap-1.5 shadow-sm`}>
                      <Calendar size={14} />
                      {job.postedDate}
                    </span>
                  </div>

                  <div className={`flex items-center gap-6 p-5 rounded-xl mb-5 ${isDark ? 'bg-gray-700/30' : 'bg-gradient-to-r from-blue-50 to-purple-50'} border ${borderColor}`}>
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${textColor} mb-1`}>{job.applications}</p>
                      <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wide`}>Applications</p>
                    </div>
                    <div className={`h-12 w-px ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${textColor} mb-1`}>{job.views}</p>
                      <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wide`}>Views</p>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleEditJob(job.id)}
                      className={`flex-1 min-w-[140px] px-5 py-3 border-2 ${borderColor} rounded-xl text-sm font-semibold ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105`}
                    >
                      <Edit size={18} /> Edit Job
                    </button>
                    <button
                      onClick={() => handleViewApplications(job.id)}
                      className="flex-1 min-w-[140px] px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Eye size={18} /> View ({job.applications})
                    </button>
                    <button
                      onClick={() => handleToggleStatus(job.id)}
                      className={`px-5 py-3 border-2 ${borderColor} rounded-xl text-sm font-semibold ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:scale-105`}
                    >
                      <CircleX size={18} /> {job.status === 'Active' ? 'Close Job' : 'Reopen Job'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Applications Modal - Enhanced Design */}
      {showApplicationsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={closeApplicationsModal}>
          <div className={`${cardBg} rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border ${borderColor} animate-slideUp`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 border-b ${borderColor} flex items-center justify-between bg-gradient-to-r ${isDark ? 'from-gray-800/50 to-gray-800/30' : 'from-blue-50/50 to-purple-50/30'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${textColor}`}>Job Applications</h2>
                  <p className={`text-sm ${textSecondary}`}>Review and manage candidate applications</p>
                </div>
              </div>
              <button
                onClick={closeApplicationsModal}
                className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:rotate-90 group`}
              >
                <X size={24} className={`${textColor} group-hover:text-red-500 transition-colors`} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {applicationsLoading ? (
                <div className="text-center py-16">
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-purple-500 mx-auto"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Users className="text-purple-500" size={32} />
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold ${textColor}`}>Loading applications...</h3>
                  <p className={`${textSecondary} mt-2`}>Fetching candidate details</p>
                </div>
              ) : applications[selectedJobId]?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users size={48} className="text-purple-500" />
                  </div>
                  <h3 className={`text-2xl font-bold ${textColor} mb-3`}>No Applications Yet</h3>
                  <p className={`text-lg ${textSecondary}`}>This job hasn't received any applications yet.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {applications[selectedJobId]?.map((application) => (
                    <div key={application.application_id} className={`border-2 ${borderColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/20 hover:bg-gray-700/40' : 'bg-gradient-to-br from-white to-gray-50/50 hover:from-gray-50 hover:to-white'}`}>
                      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {application.student_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <h4 className={`text-xl font-bold ${textColor}`}>{application.student_name}</h4>
                              <p className={`text-sm ${textSecondary} font-medium`}>{application.student_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap text-sm ml-17">
                            <span className={`flex items-center gap-1.5 ${textSecondary} font-medium`}>
                              <Calendar size={14} />
                              Applied: {new Date(application.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(application.status)} shadow-md`}>
                              {application.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {application.status === 'Pending' ? (
                            <button
                              onClick={() => handleUpdateApplicationStatus(application.application_id, true)}
                              disabled={loading}
                              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                            >
                              <Check size={18} /> Shortlist
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateApplicationStatus(application.application_id, false)}
                              disabled={loading}
                              className={`px-6 py-3 border-2 ${borderColor} rounded-xl text-sm font-bold ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
                            >
                              <ArrowLeft size={18} /> Move to Pending
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={`p-5 rounded-xl mb-5 border-2 ${borderColor} ${isDark ? 'bg-gray-700/30' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                        <h5 className={`text-base font-bold ${textColor} mb-3 flex items-center gap-2`}>
                          <FileText size={18} />
                          Cover Letter
                        </h5>
                        <p className={`text-sm ${textSecondary} leading-relaxed`}>
                          {application.cover_letter || 'No cover letter provided.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <h5 className={`text-base font-bold ${textColor} flex items-center gap-2`}>
                          <FileText size={18} />
                          Resume:
                        </h5>
                        <a
                          href={application.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-bold hover:scale-105"
                        >
                          <ExternalLink size={16} />
                          View Resume
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-6 border-t ${borderColor} flex justify-end bg-gradient-to-r ${isDark ? 'from-gray-800/50 to-gray-800/30' : 'from-blue-50/50 to-purple-50/30'}`}>
              <button
                onClick={closeApplicationsModal}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManageJobs;