import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { recruiterExternalService } from "../../services";
import { Check, X, ArrowLeft, FileText, Users, Calendar, Mail, Briefcase, TrendingUp, ExternalLink, Filter, Search, UserCheck, Clock, Target } from "lucide-react";

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
        
        // Use embedded student data from application response
        const applicationsWithDetails = allApplications.map((app) => {
          // Extract student profile data from the embedded student_profile object
          const studentProfile = app.student_profile || {};

          // Get resume URL from student profile
          const resumeUrl = studentProfile.resumeUrl || studentProfile.resume || app.resume_url;

          return {
            ...app,
            student_name: studentProfile.full_name || app.student_name || "Unknown Candidate",
            student_email: studentProfile.email || app.student_email || "Unknown Email",
            resume_url: resumeUrl, // Use the resume URL from student profile
          };
        });

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
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'rejected':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Users className="text-white" size={28} />
                </div>
                <div>
                  <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${textColor}`}>
                    Candidate Applications
                  </h1>
                  <p className={`text-base ${textSecondary} mt-1`}>
                    Review and manage applications from talented candidates
                  </p>
                </div>
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
                    <Users className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-emerald-500" size={20} />
                </div>
                <h3 className={`text-4xl font-bold ${textColor} mb-1`}>{applications.length}</h3>
                <p className={`text-sm font-medium ${textSecondary}`}>Total Applications</p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                    <Clock className="text-white" size={24} />
                  </div>
                </div>
                <h3 className={`text-4xl font-bold ${textColor} mb-1`}>{applications.filter(app => app.status === 'Pending').length}</h3>
                <p className={`text-sm font-medium ${textSecondary}`}>Pending Review</p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <UserCheck className="text-white" size={24} />
                  </div>
                </div>
                <h3 className={`text-4xl font-bold ${textColor} mb-1`}>{applications.filter(app => app.status === 'Shortlisted').length}</h3>
                <p className={`text-sm font-medium ${textSecondary}`}>Shortlisted</p>
              </div>
            </div>
          </div>

          {/* Filters Section - Modern Design */}
          <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-5 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                <Filter className="text-white" size={18} />
              </div>
              <h3 className={`text-lg font-bold ${textColor}`}>Filter Applications</h3>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Status Filter Tabs */}
              <div className="flex gap-3 flex-wrap">
                {['All', 'Pending', 'Shortlisted', 'Rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      filterStatus === status 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105' 
                        : `${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} ${textColor} hover:scale-105`
                    }`}
                  >
                    {status}
                    {status !== 'All' && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                        {status === 'Pending' ? applications.filter(app => app.status === 'Pending').length :
                         status === 'Shortlisted' ? applications.filter(app => app.status === 'Shortlisted').length :
                         applications.filter(app => app.status === 'Rejected').length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Job Filter Dropdown */}
              <div className="flex items-center gap-3">
                <label className={`text-sm font-semibold ${textColor} whitespace-nowrap flex items-center gap-2`}>
                  <Briefcase size={16} />
                  Filter by Job:
                </label>
                <select 
                  value={selectedJob} 
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm border-2 ${borderColor} ${cardBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium transition-all duration-200 hover:shadow-md`}
                >
                  <option value="All">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-12 text-center`}>
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-purple-500 mx-auto"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Users className="text-purple-500" size={32} />
                </div>
              </div>
              <h3 className={`text-xl font-bold ${textColor}`}>Loading applications...</h3>
              <p className={`${textSecondary} mt-2`}>Fetching candidate details</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-12 text-center`}>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-red-500 mb-2">Failed to Load Applications</h3>
              <p className={`${textSecondary}`}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredApplications.length === 0 && (
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-16 text-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText size={48} className="text-purple-500" />
                </div>
                <h3 className={`text-2xl font-bold ${textColor} mb-3`}>No Applications Found</h3>
                <p className={`text-lg ${textSecondary} max-w-md mx-auto`}>
                  {filterStatus === 'All' && selectedJob === 'All'
                    ? "No applications have been received yet. Start posting jobs to attract candidates!"
                    : "No applications match your current filter criteria. Try adjusting the filters."
                  }
                </p>
              </div>
            </div>
          )}

          {/* Applications List - Enhanced Cards */}
          <div className="space-y-5">
            {filteredApplications.map((application) => {
              const studentProfile = application.student_profile || {};
              return (
              <div key={application.application_id} className={`${cardBg} rounded-2xl shadow-md border ${borderColor} p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  application.status === 'Shortlisted' ? 'from-emerald-500/5 to-emerald-600/5' :
                  application.status === 'Pending' ? 'from-amber-500/5 to-amber-600/5' :
                  'from-rose-500/5 to-rose-600/5'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                          {studentProfile.logo || studentProfile.profile_image ? (
                            <img
                              src={studentProfile.logo || studentProfile.profile_image}
                              alt={application.student_name || 'Candidate'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl ${studentProfile.logo || studentProfile.profile_image ? 'hidden' : 'flex'}`}>
                            {application.student_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold ${textColor} mb-2`}>{application.student_name}</h3>
                          <div className="flex flex-col gap-2 text-sm">
                            <span className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                              <Mail size={16} className="text-blue-500" /> {application.student_email}
                            </span>
                            <span className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                              <Briefcase size={16} className="text-purple-500" /> Applied for: <span className="font-semibold">{application.job_title}</span>
                            </span>
                            <span className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                              <Calendar size={16} className="text-amber-500" /> Applied on: {new Date(application.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(application.status)} shadow-md whitespace-nowrap`}>
                      {application.status}
                    </span>
                  </div>

                  {/* Cover Letter Section */}
                  <div className={`p-5 rounded-xl mb-5 border-2 ${borderColor} ${isDark ? 'bg-gray-700/30' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                    <h5 className={`text-base font-bold ${textColor} mb-3 flex items-center gap-2`}>
                      <FileText size={18} className="text-blue-500" />
                      Cover Letter
                    </h5>
                    <p className={`text-sm ${textSecondary} leading-relaxed`}>
                      {application.cover_letter || 'No cover letter provided.'}
                    </p>
                  </div>

                  {/* Resume Section */}
                  <div className="flex items-center gap-4 mb-5 flex-wrap">
                    <h5 className={`text-base font-bold ${textColor} flex items-center gap-2`}>
                      <FileText size={18} className="text-purple-500" />
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

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    {application.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateApplicationStatus(application.application_id, true)}
                          disabled={loading}
                          className="flex-1 min-w-[160px] px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        >
                          <Check size={18} /> Shortlist Candidate
                        </button>
                        <button
                          onClick={() => handleUpdateApplicationStatus(application.application_id, false)}
                          disabled={loading}
                          className="flex-1 min-w-[160px] px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        >
                          <X size={18} /> Reject
                        </button>
                      </>
                    ) : application.status === 'Shortlisted' ? (
                      <button
                        onClick={() => handleUpdateApplicationStatus(application.application_id, false)}
                        disabled={loading}
                        className={`flex-1 min-w-[180px] px-6 py-3 border-2 ${borderColor} rounded-xl text-sm font-bold ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
                      >
                        <ArrowLeft size={18} /> Move to Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateApplicationStatus(application.application_id, true)}
                        disabled={loading}
                        className="flex-1 min-w-[160px] px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                      >
                        <Check size={18} /> Shortlist Candidate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateApplications;
