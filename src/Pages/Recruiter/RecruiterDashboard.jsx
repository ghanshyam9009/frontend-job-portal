import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services";
import { studentService } from "../../services/studentService";
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

        const recentWithDetails = await Promise.all(
          recent.map(async (app) => {
            try {
              const studentDetails = await studentService.getStudentById(app.student_id);
              return { ...app, ...studentDetails };
            } catch (err) {
              console.error(`Failed to fetch details for student ${app.student_id}:`, err);
              return { ...app, student_name: "Unknown", student_email: "Unknown" };
            }
          })
        );

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
      title: "View Applications",
      description: "Review candidate applications",
      icon: <Users size={20} />,
      gradient: "from-purple-500 to-purple-600",
      action: () => navigate('/candidate-applications')
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
      <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-blue-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Briefcase className="text-blue-500" size={32} />
              </div>
            </div>
            <h2 className={`mt-6 text-xl font-bold ${textColor}`}>Loading Dashboard...</h2>
            <p className={`mt-2 text-sm ${textSecondary}`}>Fetching your recruitment data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className={`${cardBg} rounded-2xl shadow-xl p-8 text-center border ${borderColor}`}>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className={`text-2xl font-bold ${textColor} mb-2`}>Oops! Something went wrong</h2>
            <p className={`${textSecondary} mb-6`}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-12`}>
      <div className="max-w-7xl mx-auto">
        {isPendingApproval ? (
          <div className={`${cardBg} rounded-2xl shadow-xl p-12 text-center border ${borderColor}`}>
            <div className="w-24 h-24 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock size={48} className="text-amber-500" />
            </div>
            <h2 className={`text-3xl font-bold ${textColor} mb-3`}>Approval Pending</h2>
            <p className={`text-lg ${textSecondary} mb-2`}>Your registration request is under review by our admin team.</p>
            <p className={`${textSecondary}`}>You'll receive full dashboard access once approved. Please check back soon!</p>
          </div>
        ) : (
          <>
            {/* Welcome Header with Illustration */}
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6 sm:p-8 mb-6 overflow-hidden relative`}>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${textColor} mb-2`}>
                      Hi, {recruiterProfile?.company_name || recruiterProfile?.name || 'Recruiter'} 👋
                    </h1>
                    <p className={`text-base ${textSecondary}`}>
                      Ready to start your day with some hiring decisions?
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className={`p-3 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl transition-all duration-200 relative`}>
                      <Bell size={20} className={textColor} />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        3
                      </span>
                    </button>
                    <button className={`p-3 ${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl transition-all duration-200`}>
                      <Search size={20} className={textColor} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl -z-0"></div>
            </div>

            {/* Stats Grid - Modern Cards with Gradients */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                      <FileText className="text-white" size={20} />
                    </div>
                    <TrendingUp className="text-emerald-500" size={18} />
                  </div>
                  <h3 className={`text-3xl font-bold ${textColor} mb-1`}>{stats.totalJobs}</h3>
                  <p className={`text-xs font-medium ${textSecondary}`}>Total Jobs</p>
                </div>
              </div>

              <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
                      <Activity className="text-white" size={20} />
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold ${textColor} mb-1`}>{stats.activeJobs}</h3>
                  <p className={`text-xs font-medium ${textSecondary}`}>Active Jobs</p>
                </div>
              </div>

              <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                      <Users className="text-white" size={20} />
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold ${textColor} mb-1`}>{stats.totalApplications}</h3>
                  <p className={`text-xs font-medium ${textSecondary}`}>Applications</p>
                </div>
              </div>

              <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg">
                      <Star className="text-white" size={20} />
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold ${textColor} mb-1`}>{stats.shortlistedCandidates}</h3>
                  <p className={`text-xs font-medium ${textSecondary}`}>Shortlisted</p>
                </div>
              </div>

              <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg">
                      <Calendar className="text-white" size={20} />
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold ${textColor} mb-1`}>{stats.interviewsScheduled}</h3>
                  <p className={`text-xs font-medium ${textSecondary}`}>Interviews</p>
                </div>
              </div>

              <div className={`${cardBg} rounded-xl shadow-md border ${borderColor} p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow-lg">
                      <Trophy className="text-white" size={20} />
                    </div>
                  </div>
                  <h3 className={`text-3xl font-bold ${textColor} mb-1`}>{stats.hired}</h3>
                  <p className={`text-xs font-medium ${textSecondary}`}>Hired</p>
                </div>
              </div>
            </div>

            {/* Quick Actions - Modern Gradient Cards */}
            <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} p-6 mb-6`}>
              <h2 className={`text-xl font-bold ${textColor} mb-5 flex items-center gap-2`}>
                <Target size={24} className="text-blue-500" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`group relative overflow-hidden rounded-xl p-5 border ${borderColor} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-left ${isDark ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white'}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {action.icon}
                      </div>
                      <h3 className={`font-bold text-base ${textColor} mb-1`}>{action.title}</h3>
                      <p className={`text-xs ${textSecondary}`}>{action.description}</p>
                      <ArrowRight className={`absolute bottom-4 right-4 ${textSecondary} opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1`} size={16} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Two Column Layout - Jobs & Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Job Postings */}
              <div className="lg:col-span-2">
                <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} overflow-hidden`}>
                  <div className={`p-6 border-b ${borderColor} flex items-center justify-between bg-gradient-to-r ${isDark ? 'from-gray-800/50 to-gray-800/30' : 'from-blue-50/50 to-purple-50/30'}`}>
                    <h2 className={`text-xl font-bold ${textColor} flex items-center gap-2`}>
                      <Briefcase size={24} className="text-blue-500" />
                      Recent Job Postings
                    </h2>
                    <button
                      onClick={() => navigate('/manage-jobs')}
                      className="text-blue-500 hover:text-blue-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all duration-200"
                    >
                      View All <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="p-6">
                    {jobs.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Briefcase size={36} className="text-blue-500" />
                        </div>
                        <h3 className={`text-lg font-bold ${textColor} mb-2`}>No Jobs Posted Yet</h3>
                        <p className={`text-sm ${textSecondary} mb-6 max-w-sm mx-auto`}>Start your recruitment journey by posting your first job and connect with talented candidates.</p>
                        <button
                          onClick={() => navigate('/post-job')}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium inline-flex items-center gap-2"
                        >
                          <Plus size={20} />
                          Post Your First Job
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {jobs.slice(0, 3).map((job) => (
                          <div key={job.job_id} className={`border ${borderColor} rounded-xl p-5 hover:shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-700/20 hover:bg-gray-700/40' : 'bg-gradient-to-br from-white to-gray-50/50 hover:from-gray-50 hover:to-white'}`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className={`font-bold text-base ${textColor} mb-2 hover:text-blue-500 transition-colors cursor-pointer`}>{job.job_title}</h4>
                                <p className={`text-sm ${textSecondary} flex items-center gap-1.5`}>
                                  <Building size={14} />
                                  {job.company_name}
                                </p>
                              </div>
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(job.status)} shadow-sm`}>
                                {job.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary}`}>
                                {job.employment_type}
                              </span>
                              <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary}`}>
                                {job.work_mode}
                              </span>
                              <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary} flex items-center gap-1`}>
                                <MapPin size={12} />
                                {job.location}
                              </span>
                              <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} ${textSecondary} flex items-center gap-1`}>
                                <Calendar size={12} />
                                {formatDate(job.created_at)}
                              </span>
                            </div>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => navigate(`/edit-job/${job.job_id}`)}
                                className={`flex-1 px-4 py-2.5 border ${borderColor} rounded-xl text-sm font-medium ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md`}
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                              <button 
                                onClick={() => navigate('/candidate-applications')}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                              >
                                <Eye size={16} />
                                View Applications
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="lg:col-span-1">
                <div className={`${cardBg} rounded-2xl shadow-lg border ${borderColor} overflow-hidden`}>
                  <div className={`p-6 border-b ${borderColor} flex items-center justify-between bg-gradient-to-r ${isDark ? 'from-gray-800/50 to-gray-800/30' : 'from-purple-50/50 to-pink-50/30'}`}>
                    <h2 className={`text-xl font-bold ${textColor} flex items-center gap-2`}>
                      <Users size={24} className="text-purple-500" />
                      Recent Applications
                    </h2>
                    <button
                      onClick={() => navigate('/candidate-applications')}
                      className="text-purple-500 hover:text-purple-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all duration-200"
                    >
                      View All <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="p-6">
                    {recentApplications.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText size={28} className="text-purple-500" />
                        </div>
                        <h3 className={`text-base font-bold ${textColor} mb-2`}>No Applications Yet</h3>
                        <p className={`text-sm ${textSecondary} mb-4 px-4`}>Post jobs to start receiving applications from candidates.</p>
                        <button
                          onClick={() => navigate('/post-job')}
                          className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Post a Job
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentApplications.map((application) => (
                          <div key={application.application_id} className={`border ${borderColor} rounded-xl p-4 hover:shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-700/20 hover:bg-gray-700/40' : 'bg-gradient-to-br from-white to-gray-50/50 hover:from-gray-50 hover:to-white'}`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {application.student_name?.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <h4 className={`font-bold ${textColor} text-sm`}>{application.student_name}</h4>
                                    <p className={`text-xs ${textSecondary}`}>{application.student_email}</p>
                                  </div>
                                </div>
                                <p className={`text-xs ${textSecondary} font-medium mb-1`}>{application.job_title}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)} shadow-sm whitespace-nowrap`}>
                                {application.status}
                              </span>
                            </div>
                            <p className={`text-xs ${textSecondary} mb-3 flex items-center gap-1`}>
                              <Clock size={12} />
                              Applied {formatDate(application.created_at)}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(application.resume_url, '_blank')}
                                className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg text-xs font-medium ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center gap-1.5 hover:shadow-md`}
                              >
                                <FileText size={14} />
                                Resume
                              </button>
                              <button
                                onClick={() => alert('Contact functionality will be implemented')}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                              >
                                <Mail size={14} />
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