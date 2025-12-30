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
      
      <main className="pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header with Gradient Background */}
          <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6 sm:p-8 mb-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                  <Star className="text-white" size={28} />
                </div>
                <div>
                  <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${textColor}`}>
                    Shortlisted Candidates
                  </h1>
                  <p className={`text-base ${textSecondary} mt-1`}>
                    Your top talent picks - candidates ready for the next stage
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Modern Gradient Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                    <Award className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-emerald-500" size={20} />
                </div>
                <h3 className={`text-4xl font-bold ${textColor} mb-1`}>{shortlistedCandidates.length}</h3>
                <p className={`text-sm font-medium ${textSecondary}`}>Total Shortlisted Candidates</p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Briefcase className="text-white" size={24} />
                  </div>
                </div>
                <h3 className={`text-4xl font-bold ${textColor} mb-1`}>{jobs.length}</h3>
                <p className={`text-sm font-medium ${textSecondary}`}>Active Job Openings</p>
              </div>
            </div>
          </div>

          {/* Filter Section - Modern Design */}
          <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-5 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                <Filter className="text-white" size={18} />
              </div>
              <h3 className={`text-lg font-bold ${textColor}`}>Filter Candidates</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Job Filter Dropdown */}
              <div className="flex items-center gap-3 flex-1">
                <label className={`text-sm font-semibold ${textColor} whitespace-nowrap flex items-center gap-2`}>
                  <Briefcase size={16} />
                  Filter by Job:
                </label>
                <select 
                  value={selectedJob} 
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm border-2 ${borderColor} ${cardBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium transition-all duration-200 hover:shadow-md`}
                >
                  <option value="All">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>

              {/* Stats Summary */}
              <div className={`flex items-center gap-4 px-5 py-3 rounded-xl ${isDark ? 'bg-gray-700/30' : 'bg-gradient-to-r from-amber-50 to-yellow-50'} border ${borderColor}`}>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${textColor}`}>{filteredCandidates.length}</p>
                  <p className={`text-xs font-semibold ${textSecondary}`}>Showing</p>
                </div>
                <div className={`h-10 w-px ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${textColor}`}>{shortlistedCandidates.length}</p>
                  <p className={`text-xs font-semibold ${textSecondary}`}>Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-12 text-center`}>
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-amber-500 mx-auto"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Star className="text-amber-500" size={32} />
                </div>
              </div>
              <h3 className={`text-xl font-bold ${textColor}`}>Loading shortlisted candidates...</h3>
              <p className={`${textSecondary} mt-2`}>Fetching your top talent</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-12 text-center`}>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-red-500 mb-2">Failed to Load Candidates</h3>
              <p className={`${textSecondary}`}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredCandidates.length === 0 && (
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-16 text-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-500/20 dark:to-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star size={48} className="text-amber-500" />
                </div>
                <h3 className={`text-2xl font-bold ${textColor} mb-3`}>No Shortlisted Candidates</h3>
                <p className={`text-lg ${textSecondary} max-w-md mx-auto`}>
                  {selectedJob === "All"
                    ? "You haven't shortlisted any candidates yet. Visit the applications page to review and shortlist promising candidates."
                    : "No candidates have been shortlisted for this job yet. Review applications to find your next hire!"
                  }
                </p>
              </div>
            </div>
          )}

          {/* Candidates List - Enhanced Cards */}
          <div className="space-y-5">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.application_id} className={`${cardBg} rounded-2xl shadow-md border ${borderColor} p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        {/* Profile Avatar */}
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 ring-4 ring-amber-100 dark:ring-amber-500/20">
                          {candidate.student_profile?.logo || candidate.student_profile?.profile_image ? (
                            <img
                              src={candidate.student_profile?.logo || candidate.student_profile?.profile_image}
                              alt={candidate.student_name || 'Candidate'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-2xl ${candidate.student_profile?.logo || candidate.student_profile?.profile_image ? 'hidden' : 'flex'}`}>
                            {candidate.student_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl font-bold ${textColor}`}>{candidate.student_name}</h3>
                            <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                              <Star size={14} fill="white" />
                              Shortlisted
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 text-sm">
                            <span className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                              <Mail size={16} className="text-blue-500" /> {candidate.student_email}
                            </span>
                            <span className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                              <Briefcase size={16} className="text-purple-500" /> Applied for: <span className="font-semibold">{candidate.job_title}</span>
                            </span>
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                                <Calendar size={16} className="text-amber-500" /> Applied: {new Date(candidate.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className={`flex items-center gap-2 ${textSecondary} font-medium`}>
                                <UserCheck size={16} className="text-emerald-500" /> Shortlisted: {new Date(candidate.updated_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter Section */}
                  <div className={`p-5 rounded-xl mb-5 border-2 ${borderColor} ${isDark ? 'bg-gray-700/30' : 'bg-gradient-to-br from-amber-50 to-yellow-50'}`}>
                    <h5 className={`text-base font-bold ${textColor} mb-3 flex items-center gap-2`}>
                      <FileText size={18} className="text-amber-500" />
                      Cover Letter
                    </h5>
                    <p className={`text-sm ${textSecondary} leading-relaxed`}>
                      {candidate.cover_letter || 'No cover letter provided.'}
                    </p>
                  </div>

                  {/* Resume Section */}
                  <div className="flex items-center gap-4 mb-5 flex-wrap">
                    <h5 className={`text-base font-bold ${textColor} flex items-center gap-2`}>
                      <FileText size={18} className="text-purple-500" />
                      Resume:
                    </h5>
                    <a
                      href={candidate.resume_url}
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
                    <button
                      className="flex-1 min-w-[140px] px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm font-bold hover:scale-105"
                      onClick={() => alert('Contact functionality will be implemented')}
                    >
                      <Mail size={18} />
                      Contact Candidate
                    </button>
                    
                    <button
                      className="flex-1 min-w-[140px] px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm font-bold hover:scale-105"
                      onClick={() => alert('Interview scheduling will be implemented')}
                    >
                      <Calendar size={18} />
                      Schedule Interview
                    </button>
                    
                    <button
                      className={`px-6 py-3 border-2 ${borderColor} rounded-xl text-sm font-bold ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
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
