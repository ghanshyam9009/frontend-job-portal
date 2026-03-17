import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import { recruiterExternalService } from "../../services";
import { Star, Mail, Calendar, ArrowLeft, FileText, Award, Briefcase, TrendingUp, Filter, UserCheck, Clock, ExternalLink } from "lucide-react";

const ShortlistCandidates = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState("All");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const fetchShortlistedCandidates = async () => {
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

        // Fetch applications for all jobs and filter shortlisted ones
        const allShortlistedCandidates = [];
        for (const job of jobsList) {
          try {
            const applicationsData = await recruiterExternalService.getAllApplicants(job.id);
            const shortlistedApps = (applicationsData.applications || [])
              .filter(app => app.status === 'Shortlisted')
              .map(app => ({
                ...app,
                job_title: job.title,
                job_id: job.id
              }));
            allShortlistedCandidates.push(...shortlistedApps);
          } catch (err) {
            console.error(`Failed to fetch applications for job ${job.id}:`, err);
          }
        }
        
        // Use embedded student data from application response
        const candidatesWithDetails = allShortlistedCandidates.map((app) => {
          // Extract student profile data from the embedded student_profile object
          const studentProfile = app.student_profile || {};

          // Get resume URL from student profile
          const resumeUrl = studentProfile.resumeUrl || studentProfile.resume || app.resume_url;

          return {
            ...app,
            student_name: studentProfile.full_name || app.student_name || "Unknown Candidate",
            student_email: studentProfile.email || app.student_email || "Unknown Email",
            resume_url: resumeUrl, // Use the resume URL from student profile
            student_profile: studentProfile, // Store the full profile for image access
          };
        });

        setShortlistedCandidates(candidatesWithDetails);
      } catch (e) {
        console.error(e);
        setError(typeof e === "string" ? e : e?.message || "Failed to load shortlisted candidates");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchShortlistedCandidates();
    }
  }, [user]);

  const handleUpdateApplicationStatus = async (applicationId, statusBool) => {
    try {
      setLoading(true);
      await recruiterExternalService.changeApplicationStatus(applicationId, statusBool);
      
      // Update local state
      setShortlistedCandidates(prev => prev.map(app => 
        app.application_id === applicationId 
          ? { ...app, status: statusBool ? 'Shortlisted' : 'Pending' }
          : app
      ));
      
      // Remove from shortlisted if moved to pending
      if (!statusBool) {
        setShortlistedCandidates(prev => prev.filter(app => app.application_id !== applicationId));
      }
      
      alert(`Candidate ${statusBool ? 'remains shortlisted' : 'moved to pending'} successfully`);
    } catch (e) {
      console.error(e);
      alert('Failed to update candidate status');
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = selectedJob === "All" 
    ? shortlistedCandidates 
    : shortlistedCandidates.filter(candidate => candidate.job_id === selectedJob);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-amber-50/30 to-yellow-50/20';
  const cardBg = isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700/50' : 'border-gray-200/50';

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      
      <main className="pt-14 sm:pt-20 lg:pt-24 px-3 sm:px-6 lg:px-8 pb-24 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header - mobile compact */}
          <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-lg border ${borderColor} p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 sm:gap-4 mb-1">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg flex-shrink-0">
                  <Star className="text-white" size={24} />
                </div>
                <div className="min-w-0">
                  <h1 className={`text-xl sm:text-3xl lg:text-4xl font-bold ${textColor} truncate`}>
                    Shortlisted Candidates
                  </h1>
                  <p className={`text-sm sm:text-base ${textSecondary} mt-0.5 line-clamp-2`}>
                    Your top talent picks - candidates ready for the next stage
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - mobile smaller */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-4 sm:p-6 hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg sm:rounded-xl shadow-lg">
                    <Award className="text-white" size={20} />
                  </div>
                  <TrendingUp className="text-emerald-500 hidden sm:block" size={20} />
                </div>
                <h3 className={`text-2xl sm:text-4xl font-bold ${textColor} mb-0.5`}>{shortlistedCandidates.length}</h3>
                <p className={`text-xs sm:text-sm font-medium ${textSecondary} leading-tight`}>Total Shortlisted</p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-4 sm:p-6 hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg">
                    <Briefcase className="text-white" size={20} />
                  </div>
                </div>
                <h3 className={`text-2xl sm:text-4xl font-bold ${textColor} mb-0.5`}>{jobs.length}</h3>
                <p className={`text-xs sm:text-sm font-medium ${textSecondary} leading-tight`}>Active Jobs</p>
              </div>
            </div>
          </div>

          {/* Filter Section - mobile stack */}
          <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-4 sm:p-5 mb-4 sm:mb-6`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex-shrink-0">
                <Filter className="text-white" size={16} />
              </div>
              <h3 className={`text-base sm:text-lg font-bold ${textColor}`}>Filter Candidates</h3>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
                <label className={`text-sm font-semibold ${textColor} flex items-center gap-2 flex-shrink-0`}>
                  <Briefcase size={16} />
                  Filter by Job:
                </label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className={`w-full sm:flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm border-2 ${borderColor} ${cardBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium`}
                >
                  <option value="All">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div className={`flex items-center justify-between sm:justify-start gap-4 px-4 py-3 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gradient-to-r from-amber-50 to-yellow-50'} border ${borderColor}`}>
                <div className="text-center flex-1 sm:flex-initial">
                  <p className={`text-xl sm:text-2xl font-bold ${textColor}`}>{filteredCandidates.length}</p>
                  <p className={`text-xs font-semibold ${textSecondary}`}>Showing</p>
                </div>
                <div className={`h-10 w-px ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <div className="text-center flex-1 sm:flex-initial">
                  <p className={`text-xl sm:text-2xl font-bold ${textColor}`}>{shortlistedCandidates.length}</p>
                  <p className={`text-xs font-semibold ${textSecondary}`}>Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State - mobile compact */}
          {loading && (
            <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-lg border ${borderColor} p-8 sm:p-12 text-center`}>
              <div className="relative mb-4 sm:mb-6">
                <div className="animate-spin rounded-full h-14 w-14 sm:h-20 sm:w-20 border-b-4 border-t-4 border-amber-500 mx-auto" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Star className="text-amber-500" size={28} />
                </div>
              </div>
              <h3 className={`text-lg sm:text-xl font-bold ${textColor}`}>Loading shortlisted candidates...</h3>
              <p className={`text-sm ${textSecondary} mt-2`}>Fetching your top talent</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-lg border ${borderColor} p-8 sm:p-12 text-center`}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="text-red-500" size={28} />
              </div>
              <h3 className={`text-lg sm:text-xl font-bold text-red-500 mb-2`}>Failed to Load Candidates</h3>
              <p className={`text-sm ${textSecondary}`}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredCandidates.length === 0 && (
            <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-lg border ${borderColor} p-8 sm:p-16 text-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-500/20 dark:to-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Star size={40} className="text-amber-500 sm:w-12 sm:h-12" />
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold ${textColor} mb-2 sm:mb-3`}>No Shortlisted Candidates</h3>
                <p className={`text-sm sm:text-lg ${textSecondary} max-w-md mx-auto`}>
                  {selectedJob === "All"
                    ? "You haven't shortlisted any candidates yet. Visit the applications page to review and shortlist promising candidates."
                    : "No candidates have been shortlisted for this job yet. Review applications to find your next hire!"
                  }
                </p>
              </div>
            </div>
          )}

          {/* Candidates List - mobile responsive cards */}
          <div className="space-y-4 sm:space-y-5">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.application_id} className={`${cardBg} rounded-xl sm:rounded-2xl shadow-md border ${borderColor} p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-1 relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 ring-2 sm:ring-4 ring-amber-100 dark:ring-amber-500/20">
                      {candidate.student_profile?.logo || candidate.student_profile?.profile_image ? (
                        <img
                          src={candidate.student_profile?.logo || candidate.student_profile?.profile_image}
                          alt={candidate.student_name || 'Candidate'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.nextElementSibling;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg sm:text-2xl ${candidate.student_profile?.logo || candidate.student_profile?.profile_image ? 'hidden' : 'flex'}`}>
                        {candidate.student_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
                        <h3 className={`text-base sm:text-xl font-bold ${textColor} truncate`}>{candidate.student_name}</h3>
                        <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-[11px] sm:text-xs font-bold shadow-md flex items-center gap-1">
                          <Star size={12} fill="white" />
                          Shortlisted
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <span className={`flex items-center gap-1.5 min-w-0 ${textSecondary} font-medium truncate`}>
                          <Mail size={14} className="text-blue-500 flex-shrink-0" /> <span className="truncate">{candidate.student_email}</span>
                        </span>
                        <span className={`flex items-center gap-1.5 min-w-0 ${textSecondary} font-medium`}>
                          <Briefcase size={14} className="text-purple-500 flex-shrink-0" /> <span className="truncate">Applied for: <span className="font-semibold">{candidate.job_title}</span></span>
                        </span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className={`flex items-center gap-1.5 ${textSecondary} font-medium`}>
                            <Calendar size={14} className="text-amber-500 flex-shrink-0" /> Applied: {new Date(candidate.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className={`flex items-center gap-1.5 ${textSecondary} font-medium`}>
                            <UserCheck size={14} className="text-emerald-500 flex-shrink-0" /> Shortlisted: {new Date(candidate.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter - mobile compact */}
                  <div className={`p-3 sm:p-5 rounded-lg sm:rounded-xl mb-4 sm:mb-5 border-2 ${borderColor} ${isDark ? 'bg-gray-700/30' : 'bg-gradient-to-br from-amber-50 to-yellow-50'}`}>
                    <h5 className={`text-sm sm:text-base font-bold ${textColor} mb-2 sm:mb-3 flex items-center gap-2`}>
                      <FileText size={16} className="text-amber-500 flex-shrink-0" />
                      Cover Letter
                    </h5>
                    <p className={`text-xs sm:text-sm ${textSecondary} leading-relaxed line-clamp-4 sm:line-clamp-none`}>
                      {candidate.cover_letter || 'No cover letter provided.'}
                    </p>
                  </div>

                  {/* Resume - mobile full width button */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-5">
                    <h5 className={`text-sm sm:text-base font-bold ${textColor} flex items-center gap-2 flex-shrink-0`}>
                      <FileText size={16} className="text-purple-500" />
                      Resume:
                    </h5>
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg text-sm font-bold touch-manipulation"
                    >
                      <ExternalLink size={16} />
                      View Resume
                    </a>
                  </div>

                  {/* Action Buttons - mobile stacked, touch friendly */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      className="w-full min-h-[44px] px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-sm font-bold touch-manipulation active:scale-[0.99]"
                      onClick={() => alert('Contact functionality will be implemented')}
                    >
                      <Mail size={18} />
                      Contact Candidate
                    </button>
                    <button
                      className="w-full min-h-[44px] px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 text-sm font-bold touch-manipulation active:scale-[0.99]"
                      onClick={() => alert('Interview scheduling will be implemented')}
                    >
                      <Calendar size={18} />
                      Schedule Interview
                    </button>
                    <button
                      className={`w-full sm:flex-initial min-h-[44px] px-4 sm:px-6 py-3 border-2 ${borderColor} rounded-xl text-sm font-bold ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-[0.99]`}
                      onClick={() => handleUpdateApplicationStatus(candidate.application_id, false)}
                      disabled={loading}
                    >
                      <ArrowLeft size={18} />
                      Move to Pending
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShortlistCandidates;
