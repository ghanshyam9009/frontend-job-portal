import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services";
import { 
  Plus, 
  Users, 
  Star, 
  Building, 
  FileText, 
  Circle, 
  Trophy, 
  Calendar, 
  Briefcase, 
  Mail, 
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  Eye,
  Edit,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Search,
  Bell,
  BarChart3,
  Activity,
  Target
} from "lucide-react";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isPendingApproval = location.state?.status === 'pending_approval';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    interviewsScheduled: 0,
    hired: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recruiterProfile, setRecruiterProfile] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const jobsData = await recruiterExternalService.getAllPostedJobs(user?.employer_id || user?.id);
        const allJobs = jobsData?.jobs || [];

        console.log('Dashboard - Employer ID:', user?.employer_id || user?.id);
        console.log('Dashboard - Raw jobs data:', allJobs);

        const jobsList = allJobs.filter(job => job && job.job_id && job.job_title);
        console.log('Dashboard - Filtered jobs:', jobsList);

        setJobs(jobsList);

        const totalJobs = jobsList.length;
        const activeJobs = jobsList.filter(job =>
          job.status?.toLowerCase() === 'open' ||
          job.status?.toLowerCase() === 'active' ||
          job.status?.toLowerCase() === 'approved' ||
          !job.status
        ).length;
        
        let allApplications = [];
        let shortlistedCount = 0;
        
        for (const job of jobsList) {
          try {
            const applicationsData = await recruiterExternalService.getAllApplicants(job.job_id);
            const jobApplications = (applicationsData.applications || []).map(app => ({
              ...app,
              job_title: job.job_title,
              job_id: job.job_id,
              candidateName: `Student ${app.student_id}`,
              experience: "N/A"
            }));
            allApplications.push(...jobApplications);
            
            shortlistedCount += jobApplications.filter(app => app.status === 'Shortlisted').length;
          } catch (err) {
            console.error(`Failed to fetch applications for job ${job.job_id}:`, err);
          }
        }

        const sortedApplications = allApplications.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        const recent = sortedApplications.slice(0, 4);

        // Use embedded student data from application response
        const recentWithDetails = recent.map((app) => {
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

        setRecentApplications(recentWithDetails);
        setStats({
          totalJobs,
          activeJobs,
          totalApplications: allApplications.length,
          shortlistedCandidates: shortlistedCount,
          interviewsScheduled: 0,
          hired: 0
        });

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user && !isPendingApproval) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, isPendingApproval]);

  // Fetch recruiter profile
  useEffect(() => {
    const fetchRecruiterProfile = async () => {
      if (user?.employer_id || user?.id) {
        try {
          const profile = await recruiterExternalService.getRecruiterProfile(user.employer_id || user.id);
          setRecruiterProfile(profile);
        } catch (err) {
          console.error('Failed to fetch recruiter profile:', err);
        }
      }
    };

    fetchRecruiterProfile();
  }, [user?.employer_id, user?.id]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'shortlisted':
      case 'active':
      case 'open':
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'rejected':
      case 'closed':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const quickActions = [
    {
      title: "Post New Job",
      description: "Create and publish a new job posting",
      icon: <Plus size={20} />,
      gradient: "from-blue-500 to-blue-600",
      action: () => navigate('/post-job')
    },
    {
      title: "Manage Jobs",
      description: "Review candidate applications",
      icon: <Users size={20} />,
      gradient: "from-purple-500 to-purple-600",
      action: () => navigate('/manage-jobs')
    },
    {
      title: "Shortlist Candidates",
      description: "Manage your candidate shortlist",
      icon: <Star size={20} />,
      gradient: "from-amber-500 to-amber-600",
      action: () => navigate('/shortlist-candidates')
    },
    {
      title: "Company Profile",
      description: "Update your company information",
      icon: <Building size={20} />,
      gradient: "from-emerald-500 to-emerald-600",
      action: () => navigate('/company-profile')
    }
  ];

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20';
  const cardBg = isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700/50' : 'border-gray-200/50';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} pt-14 sm:pt-20 lg:pt-24 px-3 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-14 w-14 sm:h-20 sm:w-20 border-b-4 border-t-4 border-blue-500" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Briefcase className="text-blue-500" size={28} />
              </div>
            </div>
            <h2 className={`mt-4 sm:mt-6 text-lg sm:text-xl font-bold ${textColor}`}>Loading Dashboard...</h2>
            <p className={`mt-2 text-sm ${textSecondary}`}>Fetching your recruitment data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgColor} pt-14 sm:pt-20 lg:pt-24 px-3 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 text-center border ${borderColor}`}>
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500 sm:w-8 sm:h-8" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold ${textColor} mb-2`}>Oops! Something went wrong</h2>
            <p className={`text-sm ${textSecondary} mb-6`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium touch-manipulation"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} pt-14 sm:pt-20 lg:pt-24 px-3 sm:px-6 lg:px-8 pb-24 sm:pb-12`}>
      <div className="max-w-7xl mx-auto">
        {isPendingApproval ? (
          <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-12 text-center border ${borderColor}`}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
              <Clock size={40} className="text-amber-500 sm:w-12 sm:h-12" />
            </div>
            <h2 className={`text-xl sm:text-3xl font-bold ${textColor} mb-2 sm:mb-3`}>Approval Pending</h2>
            <p className={`text-sm sm:text-lg ${textSecondary} mb-2`}>Your registration request is under review by our admin team.</p>
            <p className={`text-sm ${textSecondary}`}>You'll receive full dashboard access once approved. Please check back soon!</p>
          </div>
        ) : (
          <>
            {/* Welcome Header - mobile compact */}
            <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-lg border ${borderColor} p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 overflow-hidden relative`}>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h1 className={`text-xl sm:text-3xl lg:text-4xl font-bold ${textColor} mb-1 truncate`}>
                      Hi, {recruiterProfile?.company_name || recruiterProfile?.name || 'Recruiter'} 👋
                    </h1>
                    <p className={`text-sm sm:text-base ${textSecondary}`}>
                      Ready to start your day with some hiring decisions?
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className={`min-h-[44px] min-w-[44px] p-3 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl transition-all duration-200 relative touch-manipulation`}>
                      <Bell size={20} className={textColor} />
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        3
                      </span>
                    </button>
                    <button className={`min-h-[44px] min-w-[44px] p-3 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl transition-all duration-200 touch-manipulation`}>
                      <Search size={20} className={textColor} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-0" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl -z-0" />
            </div>

            {/* Stats Grid - mobile smaller cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Link to={"/manage-jobs"} className="min-w-0">
                <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-3 sm:p-5 hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 relative overflow-hidden group h-full`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                        <FileText className="text-white" size={18} />
                      </div>
                      <TrendingUp className="text-emerald-500 hidden sm:block" size={18} />
                    </div>
                    <h3 className={`text-2xl sm:text-3xl font-bold ${textColor} mb-0.5`}>{stats.totalJobs}</h3>
                    <p className={`text-[11px] sm:text-xs font-medium ${textSecondary} leading-tight`}>Total Jobs</p>
                  </div>
                </div>
              </Link>
              <Link to={"/manage-jobs"} className="min-w-0">
                <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-3 sm:p-5 hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 relative overflow-hidden group h-full`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
                        <Activity className="text-white" size={18} />
                      </div>
                    </div>
                    <h3 className={`text-2xl sm:text-3xl font-bold ${textColor} mb-0.5`}>{stats.activeJobs}</h3>
                    <p className={`text-[11px] sm:text-xs font-medium ${textSecondary} leading-tight`}>Active Jobs</p>
                  </div>
                </div>
              </Link>
              <Link to={"/manage-jobs"} className="min-w-0">
                <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-3 sm:p-5 hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 relative overflow-hidden group h-full`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                        <Users className="text-white" size={18} />
                      </div>
                    </div>
                    <h3 className={`text-2xl sm:text-3xl font-bold ${textColor} mb-0.5`}>{stats.totalApplications}</h3>
                    <p className={`text-[11px] sm:text-xs font-medium ${textSecondary} leading-tight`}>Applications</p>
                  </div>
                </div>
              </Link>
              <Link to={"/shortlist-candidates"} className="min-w-0">
                <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-3 sm:p-5 hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 relative overflow-hidden group h-full`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg">
                        <Star className="text-white" size={18} />
                      </div>
                    </div>
                    <h3 className={`text-2xl sm:text-3xl font-bold ${textColor} mb-0.5`}>{stats.shortlistedCandidates}</h3>
                    <p className={`text-[11px] sm:text-xs font-medium ${textSecondary} leading-tight`}>Shortlisted</p>
                  </div>
                </div>
              </Link>
              <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-3 sm:p-5 hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 relative overflow-hidden group h-full min-w-0`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg">
                      <Calendar className="text-white" size={18} />
                    </div>
                  </div>
                  <h3 className={`text-2xl sm:text-3xl font-bold ${textColor} mb-0.5`}>{stats.interviewsScheduled}</h3>
                  <p className={`text-[11px] sm:text-xs font-medium ${textSecondary} leading-tight`}>Interviews</p>
                </div>
              </div>
              <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-3 sm:p-5 hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 relative overflow-hidden group h-full min-w-0`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="p-2 sm:p-2.5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow-lg">
                      <Trophy className="text-white" size={18} />
                    </div>
                  </div>
                  <h3 className={`text-2xl sm:text-3xl font-bold ${textColor} mb-0.5`}>{stats.hired}</h3>
                  <p className={`text-[11px] sm:text-xs font-medium ${textSecondary} leading-tight`}>Hired</p>
                </div>
              </div>
            </div>

            {/* Quick Actions - mobile touch friendly */}
            <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-lg border ${borderColor} p-4 sm:p-6 mb-4 sm:mb-6`}>
              <h2 className={`text-lg sm:text-xl font-bold ${textColor} mb-4 sm:mb-5 flex items-center gap-2`}>
                <Target size={22} className="text-blue-500 sm:w-6 sm:h-6" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`group relative overflow-hidden rounded-xl p-4 sm:p-5 border ${borderColor} transition-all duration-300 sm:hover:shadow-2xl sm:hover:-translate-y-1 text-left min-h-[88px] sm:min-h-0 touch-manipulation active:scale-[0.99] ${isDark ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white'}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <div className="relative z-10 flex items-start gap-3 sm:block">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center text-white flex-shrink-0 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm sm:text-base ${textColor} mb-0.5 sm:mb-1`}>{action.title}</h3>
                        <p className={`text-[11px] sm:text-xs ${textSecondary} line-clamp-2 sm:line-clamp-none`}>{action.description}</p>
                        <ArrowRight className={`hidden sm:block absolute bottom-4 right-4 ${textSecondary} opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1`} size={16} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Two Column Layout - Jobs & Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Recent Job Postings */}
              <div className="lg:col-span-2">
                <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-lg border ${borderColor} overflow-hidden`}>
                  <div className={`p-4 sm:p-6 border-b ${borderColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gradient-to-r ${isDark ? 'from-gray-800/50 to-gray-800/30' : 'from-blue-50/50 to-purple-50/30'}`}>
                    <h2 className={`text-lg sm:text-xl font-bold ${textColor} flex items-center gap-2`}>
                      <Briefcase size={22} className="text-blue-500 sm:w-6 sm:h-6" />
                      Recent Job Postings
                    </h2>
                    <button
                      onClick={() => navigate('/manage-jobs')}
                      className="text-blue-500 hover:text-blue-600 font-semibold text-sm flex items-center gap-1 min-h-[44px] touch-manipulation"
                    >
                      View All <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="p-4 sm:p-6">
                    {jobs.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Briefcase size={32} className="text-blue-500 sm:w-9 sm:h-9" />
                        </div>
                        <h3 className={`text-base sm:text-lg font-bold ${textColor} mb-2`}>No Jobs Posted Yet</h3>
                        <p className={`text-xs sm:text-sm ${textSecondary} mb-4 sm:mb-6 max-w-sm mx-auto px-2`}>Start your recruitment journey by posting your first job and connect with talented candidates.</p>
                        <button
                          onClick={() => navigate('/post-job')}
                          className="min-h-[44px] px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium inline-flex items-center gap-2 touch-manipulation"
                        >
                          <Plus size={20} />
                          Post Your First Job
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {jobs.slice(0, 3).map((job) => (
                          <div key={job.job_id} className={`border ${borderColor} rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-700/20 hover:bg-gray-700/40' : 'bg-gradient-to-br from-white to-gray-50/50 hover:from-gray-50 hover:to-white'}`}>
                            <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm sm:text-base ${textColor} mb-1 truncate hover:text-blue-500 transition-colors cursor-pointer`}>{job.job_title}</h4>
                                <p className={`text-xs sm:text-sm ${textSecondary} flex items-center gap-1.5 truncate`}>
                                  <Building size={12} />
                                  {job.company_name}
                                </p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${getStatusColor(job.status)} shadow-sm flex-shrink-0`}>
                                {job.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                              <span className={`text-[11px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary}`}>
                                {job.employment_type}
                              </span>
                              <span className={`text-[11px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary}`}>
                                {job.work_mode}
                              </span>
                              <span className={`text-[11px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary} flex items-center gap-1 truncate max-w-full`}>
                                <MapPin size={10} />
                                {job.location}
                              </span>
                              <span className={`text-[11px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary} flex items-center gap-1`}>
                                <Calendar size={10} />
                                {formatDate(job.created_at)}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <button
                                onClick={() => navigate(`/edit-job/${job.job_id}`)}
                                className={`w-full sm:flex-1 min-h-[44px] px-4 py-2.5 border ${borderColor} rounded-xl text-sm font-medium ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation`}
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                              <button
                                onClick={() => navigate(`/view-applications/${job.job_id}`)}
                                className="w-full sm:flex-1 min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-md touch-manipulation"
                              >
                                <Eye size={16} />
                                View Applications ({job.application_count || 0})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Applications - mobile compact */}
              <div className="lg:col-span-1">
                <div className={`${cardBg} rounded-xl sm:rounded-2xl shadow-lg border ${borderColor} overflow-hidden`}>
                  <div className={`p-4 sm:p-6 border-b ${borderColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gradient-to-r ${isDark ? 'from-gray-800/50 to-gray-800/30' : 'from-purple-50/50 to-pink-50/30'}`}>
                    <h2 className={`text-lg sm:text-xl font-bold ${textColor} flex items-center gap-2`}>
                      <Users size={22} className="text-purple-500 sm:w-6 sm:h-6" />
                      Recent Applications
                    </h2>
                    <button
                      onClick={() => navigate('/candidate-applications')}
                      className="text-purple-500 hover:text-purple-600 font-semibold text-sm flex items-center gap-1 min-h-[44px] touch-manipulation"
                    >
                      View All <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="p-4 sm:p-6">
                    {recentApplications.length === 0 ? (
                      <div className="text-center py-8 sm:py-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText size={26} className="text-purple-500 sm:w-7 sm:h-7" />
                        </div>
                        <h3 className={`text-sm sm:text-base font-bold ${textColor} mb-2`}>No Applications Yet</h3>
                        <p className={`text-xs sm:text-sm ${textSecondary} mb-4 px-2`}>Post jobs to start receiving applications from candidates.</p>
                        <button
                          onClick={() => navigate('/post-job')}
                          className="min-h-[44px] px-4 sm:px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-xl inline-flex items-center gap-2 touch-manipulation"
                        >
                          <Plus size={18} />
                          Post a Job
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {recentApplications.map((application) => (
                          <div key={application.application_id} className={`border ${borderColor} rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-700/20 hover:bg-gray-700/40' : 'bg-gradient-to-br from-white to-gray-50/50 hover:from-gray-50 hover:to-white'}`}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                    {application.student_profile?.logo || application.student_profile?.profile_image ? (
                                      <img
                                        src={application.student_profile.logo || application.student_profile.profile_image}
                                        alt={application.student_name || 'Candidate'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          const next = e.target.nextElementSibling;
                                          if (next) next.style.display = 'flex';
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm ${application.student_profile?.logo || application.student_profile?.profile_image ? 'hidden' : 'flex'}`}>
                                      {application.student_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className={`font-bold ${textColor} text-xs sm:text-sm truncate`}>{application.student_name}</h4>
                                    <p className={`text-[11px] sm:text-xs ${textSecondary} truncate`}>{application.student_email}</p>
                                  </div>
                                </div>
                                <p className={`text-[11px] sm:text-xs ${textSecondary} font-medium mb-1 truncate`}>{application.job_title}</p>
                              </div>
                              <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusColor(application.status)} shadow-sm flex-shrink-0`}>
                                {application.status}
                              </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs ${textSecondary} mb-2 flex items-center gap-1`}>
                              <Clock size={10} />
                              Applied {formatDate(application.created_at)}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(application.resume_url, '_blank')}
                                className={`flex-1 min-h-[40px] sm:min-h-0 sm:py-2 px-3 py-2 border ${borderColor} rounded-lg text-[11px] sm:text-xs font-medium ${textColor} flex items-center justify-center gap-1.5 touch-manipulation`}
                              >
                                <FileText size={12} />
                                Resume
                              </button>
                              <button
                                onClick={() => alert('Contact functionality will be implemented')}
                                className="flex-1 min-h-[40px] sm:min-h-0 sm:py-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[11px] sm:text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 touch-manipulation"
                              >
                                <Mail size={12} />
                                Contact
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
