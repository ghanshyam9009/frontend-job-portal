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
  CheckCircle
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
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected':
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
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
      icon: <Plus size={24} />,
      color: "bg-blue-500",
      action: () => navigate('/post-job')
    },
    {
      title: "View Applications",
      description: "Review candidate applications",
      icon: <Users size={24} />,
      color: "bg-purple-500",
      action: () => navigate('/candidate-applications')
    },
    {
      title: "Shortlist Candidates",
      description: "Manage your candidate shortlist",
      icon: <Star size={24} />,
      color: "bg-yellow-500",
      action: () => navigate('/shortlist-candidates')
    },
    {
      title: "Company Profile",
      description: "Update your company information",
      icon: <Building size={24} />,
      color: "bg-green-500",
      action: () => navigate('/company-profile')
    }
  ];

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2271B5]"></div>
            <h2 className={`mt-4 text-xl font-semibold ${textColor}`}>Loading Dashboard...</h2>
            <p className={`mt-2 ${textSecondary}`}>Fetching your job postings and applications data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className={`${cardBg} rounded-lg shadow-md p-8 text-center`}>
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className={`text-xl font-semibold ${textColor} mb-2`}>Error Loading Dashboard</h2>
            <p className={`${textSecondary} mb-4`}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#2271B5] text-white rounded-md hover:bg-[#1a5a8f] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8`}>
      <div className="max-w-7xl mx-auto">
        {isPendingApproval ? (
          <div className={`${cardBg} rounded-lg shadow-md p-8 text-center`}>
            <Clock size={64} className="mx-auto text-yellow-500 mb-4" />
            <h2 className={`text-2xl font-bold ${textColor} mb-2`}>Waiting for Admin Approval</h2>
            <p className={`${textSecondary} mb-2`}>Your registration request has been sent to the administrator for approval.</p>
            <p className={`${textSecondary}`}>Once approved, you will have full access to the dashboard. Please check back later.</p>
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="mb-6">
              <h1 className={`text-2xl lg:text-3xl font-bold ${textColor} mb-1`}>
                Welcome back, {recruiterProfile?.company_name || recruiterProfile?.name || 'Recruiter'}!
              </h1>
              <p className={`text-sm ${textSecondary}`}>
                Here's what's happening with your job postings and candidates.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
              <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="text-blue-500" size={20} />
                  </div>
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{stats.totalJobs}</h3>
                <p className={`text-xs ${textSecondary}`}>Total Jobs</p>
              </div>

              <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Circle className="text-green-500" size={20} />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{stats.activeJobs}</h3>
                <p className={`text-xs ${textSecondary}`}>Active Jobs</p>
              </div>

              <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="text-purple-500" size={20} />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{stats.totalApplications}</h3>
                <p className={`text-xs ${textSecondary}`}>Applications</p>
              </div>

              <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Star className="text-yellow-500" size={20} />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{stats.shortlistedCandidates}</h3>
                <p className={`text-xs ${textSecondary}`}>Shortlisted</p>
              </div>

              <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Calendar className="text-indigo-500" size={20} />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{stats.interviewsScheduled}</h3>
                <p className={`text-xs ${textSecondary}`}>Interviews</p>
              </div>

              <div className={`${cardBg} rounded-lg shadow-sm p-4 border ${borderColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Trophy className="text-emerald-500" size={20} />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold ${textColor} mb-0.5`}>{stats.hired}</h3>
                <p className={`text-xs ${textSecondary}`}>Hired</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`${cardBg} rounded-lg shadow-sm p-5 border ${borderColor} mb-6`}>
              <h2 className={`text-lg font-bold ${textColor} mb-3`}>Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`${isDark ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-3 border ${borderColor} transition-all duration-200 hover:shadow-md group text-left`}
                  >
                    <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <h3 className={`font-semibold text-sm ${textColor} mb-0.5`}>{action.title}</h3>
                    <p className={`text-xs ${textSecondary}`}>{action.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Job Postings - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} overflow-hidden`}>
                  <div className="p-4 border-b ${borderColor} flex items-center justify-between">
                    <h2 className={`text-lg font-bold ${textColor}`}>Recent Job Postings</h2>
                    <button
                      onClick={() => navigate('/manage-jobs')}
                      className="text-[#2271B5] hover:text-[#1a5a8f] font-medium text-sm flex items-center gap-1"
                    >
                      Manage All <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="p-4">
                    {jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase size={40} className={`mx-auto ${textSecondary} mb-3`} />
                        <h3 className={`text-base font-semibold ${textColor} mb-2`}>No Jobs Posted Yet</h3>
                        <p className={`text-sm ${textSecondary} mb-3`}>Create your first job posting to start attracting candidates.</p>
                        <button
                          onClick={() => navigate('/post-job')}
                          className="px-5 py-2 bg-[#2271B5] text-white text-sm rounded-md hover:bg-[#1a5a8f] transition-colors"
                        >
                          Post Your First Job
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {jobs.slice(0, 3).map((job) => (
                          <div key={job.job_id} className={`border ${borderColor} rounded-lg p-3 hover:shadow-md transition-shadow`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className={`font-semibold text-sm ${textColor} mb-1`}>{job.job_title}</h4>
                                <p className={`text-xs ${textSecondary} flex items-center gap-1`}>
                                  <Building size={12} />
                                  {job.company_name}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                {job.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}>
                                {job.employment_type}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}>
                                {job.work_mode}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary} flex items-center gap-1`}>
                                <MapPin size={10} />
                                {job.location}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textSecondary}`}>
                                {formatDate(job.created_at)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => navigate(`/edit-job/${job.job_id}`)}
                                className={`flex-1 px-3 py-1.5 border ${borderColor} rounded-md text-xs ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1`}
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button 
                                onClick={() => navigate('/candidate-applications')}
                                className="flex-1 px-3 py-1.5 bg-[#2271B5] text-white text-xs rounded-md hover:bg-[#1a5a8f] transition-colors flex items-center justify-center gap-1"
                              >
                                <Eye size={14} />
                                Applications
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Applications - Takes 1 column */}
              <div className="lg:col-span-1">
                <div className={`${cardBg} rounded-lg shadow-sm border ${borderColor} overflow-hidden`}>
                  <div className="p-4 border-b ${borderColor} flex items-center justify-between">
                    <h2 className={`text-lg font-bold ${textColor}`}>Recent Applications</h2>
                    <button
                      onClick={() => navigate('/candidate-applications')}
                      className="text-[#2271B5] hover:text-[#1a5a8f] font-medium text-sm flex items-center gap-1"
                    >
                      View All <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="p-4">
                    {recentApplications.length === 0 ? (
                      <div className="text-center py-6">
                        <FileText size={40} className={`mx-auto ${textSecondary} mb-3`} />
                        <h3 className={`text-sm font-semibold ${textColor} mb-2`}>No Applications Yet</h3>
                        <p className={`text-xs ${textSecondary} mb-3`}>Start posting jobs to receive applications.</p>
                        <button
                          onClick={() => navigate('/post-job')}
                          className="px-4 py-1.5 bg-[#2271B5] text-white text-xs rounded-md hover:bg-[#1a5a8f] transition-colors"
                        >
                          Post a Job
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentApplications.map((application) => (
                          <div key={application.application_id} className={`border ${borderColor} rounded-lg p-3 hover:shadow-md transition-shadow`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className={`font-semibold ${textColor} text-xs mb-1`}>{application.student_name}</h4>
                                <p className={`text-xs ${textSecondary} mb-0.5`}>{application.student_email}</p>
                                <p className={`text-xs ${textSecondary}`}>{application.job_title}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                            </div>
                            <p className={`text-xs ${textSecondary} mb-2`}>
                              Applied {formatDate(application.created_at)}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(application.resume_url, '_blank')}
                                className={`flex-1 px-2 py-1 border ${borderColor} rounded-md text-xs ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1`}
                              >
                                <FileText size={12} />
                                Resume
                              </button>
                              <button
                                onClick={() => alert('Contact functionality will be implemented')}
                                className="flex-1 px-2 py-1 bg-[#2271B5] text-white text-xs rounded-md hover:bg-[#1a5a8f] transition-colors flex items-center justify-center gap-1"
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