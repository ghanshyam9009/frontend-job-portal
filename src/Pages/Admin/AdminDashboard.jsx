import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../Contexts/ThemeContext';
import {
  Users,
  Building,
  Briefcase,
  FileText,
  TrendingUp,
  Clock,
  UserPlus,
  Bell,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Loading states for progressive loading
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    candidates: true,
    recruiters: true,
    jobs: true,
    tasks: true
  });

  // Data states
  const [dashboardStats, setDashboardStats] = useState({
    totalCandidates: 0,
    totalRecruiters: 0,
    activeJobs: 0,
    totalApplications: 0,
    candidateGrowth: 0,
    recruiterGrowth: 0,
    jobGrowth: 0,
    applicationGrowth: 0
  });

  const [recentCandidates, setRecentCandidates] = useState([]);
  const [pendingActions, setPendingActions] = useState({
    recruiters: 0,
    jobs: 0,
    applications: 0
  });

  // Fetch Dashboard Data with progressive loading
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch candidates data first (usually fastest)
      const candidatesPromise = adminService.getCandidates()
        .then(candidatesData => {
          // Filter out blocked candidates where is_admin_closed is true, status is blocked/inactive, or blocked field is true
          const activeCandidates = candidatesData.filter(candidate => {
            const isClosed = candidate.is_admin_closed === true ||
                            candidate.is_admin_closed === "true" ||
                            candidate.is_admin_closed === 1 ||
                            candidate.is_admin_closed === "1";
            const isBlocked = candidate.status?.toLowerCase() === 'blocked' ||
                             candidate.status?.toLowerCase() === 'inactive';
            const isBlockedField = candidate.blocked === true ||
                                  candidate.blocked === "true" ||
                                  candidate.blocked === 1 ||
                                  candidate.blocked === "1";

            return !isClosed && !isBlocked && !isBlockedField;
          });
          console.log('Candidates data:', activeCandidates.length, 'active candidates found');
          setLoadingStates(prev => ({ ...prev, candidates: false }));
          return activeCandidates;
        })
        .catch(err => {
          console.error('Candidates fetch error:', err);
          setLoadingStates(prev => ({ ...prev, candidates: false }));
          return [];
        });

      // Fetch recruiters data
      const recruitersPromise = adminService.getAllRecruiters()
        .then(response => {
          const recruitersData = response.recruiters || response.data || response || [];
          // Filter out blocked recruiters where is_admin_closed is true
          const activeRecruiters = recruitersData.filter(recruiter =>
            recruiter.is_admin_closed !== true &&
            recruiter.is_admin_closed !== "true" &&
            recruiter.is_admin_closed !== 1 &&
            recruiter.is_admin_closed !== "1"
          );
          console.log('Recruiters data:', activeRecruiters.length, 'active recruiters found');
          setLoadingStates(prev => ({ ...prev, recruiters: false }));
          return activeRecruiters;
        })
        .catch(err => {
          console.error('Recruiters fetch error:', err);
          setLoadingStates(prev => ({ ...prev, recruiters: false }));
          return [];
        });

      // Fetch jobs data
      const jobsPromise = adminService.getJobsWithApplicationCounts()
        .then(jobsData => {
          const jobs = Array.isArray(jobsData) 
            ? jobsData.filter(job => job.job_type !== "GOVERNMENT")
            : [];
          setLoadingStates(prev => ({ ...prev, jobs: false }));
          return jobs;
        })
        .catch(err => {
          console.error('Jobs fetch error:', err);
          setLoadingStates(prev => ({ ...prev, jobs: false }));
          return [];
        });

      // Fetch pending tasks
      const tasksPromise = adminService.getPendingJobs()
        .then(pendingTasksRes => {
          const pendingTasks = Array.isArray(pendingTasksRes) ? pendingTasksRes : [];
          setLoadingStates(prev => ({ ...prev, tasks: false }));
          return pendingTasks;
        })
        .catch(err => {
          console.error('Tasks fetch error:', err);
          setLoadingStates(prev => ({ ...prev, tasks: false }));
          return [];
        });

      // Wait for all promises to resolve
      const [candidates, recruitersData, jobs, pendingTasks] = await Promise.all([
        candidatesPromise,
        recruitersPromise,
        jobsPromise,
        tasksPromise
      ]);

      // Debug logging
      console.log('=== Dashboard Data Summary ===');
      console.log('Total Candidates:', candidates.length);
      console.log('Total Recruiters:', recruitersData.length);
      console.log('Total Jobs:', jobs.length);
      console.log('Sample Candidate:', candidates[0]);
      console.log('Sample Recruiter:', recruitersData[0]);
      console.log('==============================');

      // Calculate total applications from jobs
      const totalApps = jobs.reduce((sum, job) => sum + (parseInt(job.application_count) || 0), 0);

      // Calculate active jobs - Check for multiple possible status formats
      const activeJobsCount = jobs.filter(j => {
        const status = (j.status || '').toLowerCase();
        const isApproved = j.isadminapproved === true || j.isadminapproved === 1;
        // Consider a job active if it's approved OR if status is 'active' or 'pending' or empty/null
        return isApproved || status === 'active' || status === 'pending' || !status;
      }).length;

      // Calculate growth percentages
      const now = new Date();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const candidatesThisMonth = candidates.filter(c => {
        if (!c.created_at) return false;
        const date = new Date(c.created_at);
        return date >= lastMonthDate;
      }).length;
      
      const recruitersThisMonth = recruitersData.filter(r => {
        if (!r.created_at && !r.createdAt) return false;
        const date = new Date(r.created_at || r.createdAt);
        return date >= lastMonthDate;
      }).length;

      const jobsThisMonth = jobs.filter(j => {
        if (!j.created_at) return false;
        const date = new Date(j.created_at);
        return date >= lastMonthDate;
      }).length;

      const candidateGrowth = candidates.length > 0 
        ? Math.round((candidatesThisMonth / candidates.length) * 100)
        : 0;
      
      const recruiterGrowth = recruitersData.length > 0
        ? Math.round((recruitersThisMonth / recruitersData.length) * 100)
        : 0;

      const jobGrowth = jobs.length > 0
        ? Math.round((jobsThisMonth / jobs.length) * 100)
        : 0;

      // Calculate application growth if we have historical data
      const appsLastMonth = jobs.reduce((sum, job) => {
        if (!job.created_at || new Date(job.created_at) >= lastMonthDate) return sum;
        return sum + (parseInt(job.application_count) || 0);
      }, 0);
      
      const applicationGrowth = appsLastMonth > 0
        ? Math.round(((totalApps - appsLastMonth) / appsLastMonth) * 100)
        : totalApps > 0 ? 100 : 0;

      // Set dashboard stats
      setDashboardStats({
        totalCandidates: candidates.length,
        totalRecruiters: recruitersData.length,
        activeJobs: activeJobsCount,
        totalApplications: totalApps,
        candidateGrowth: candidateGrowth,
        recruiterGrowth: recruiterGrowth,
        jobGrowth: jobGrowth,
        applicationGrowth: applicationGrowth
      });

      // Get recent candidates (last 5, sorted by created date)
      const sortedCandidates = [...candidates].sort((a, b) => 
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
      
      const recent = sortedCandidates.slice(0, 5).map(candidate => ({
        id: candidate.id || candidate.user_id,
        name: candidate.name || candidate.full_name || 'Unknown',
        email: candidate.email || '',
        position: candidate.experience || 'Not specified',
        experience: candidate.experience_years || 0,
        created_at: candidate.created_at,
        logo: candidate.logo || candidate.profile_image || candidate.profile_pic || null,
        initials: getInitials(candidate.name || candidate.full_name || 'U'),
        color: getAvatarColor(candidate.id || Math.random())
      }));
      setRecentCandidates(recent);

      // Calculate pending actions
      const pendingRecruiters = recruitersData.filter(r => 
        r.hasadminapproved === false && 
        r.status !== 'rejected' && 
        r.status !== 'inactive' &&
        r.status !== 'blocked'
      ).length;

      const pendingJobTasks = pendingTasks.filter(task => 
        task.status === 'pending' && 
        (task.category === 'postnewjob' || task.category === 'editjob')
      ).length;

      const pendingApplications = pendingTasks.filter(task =>
        task.category === 'newapplication' && task.status === 'pending'
      ).length;

      setPendingActions({
        recruiters: pendingRecruiters,
        jobs: pendingJobTasks,
        applications: pendingApplications
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load some dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length > 1 
      ? `${parts[0][0]}${parts[1][0]}`
      : parts[0].substring(0, 2);
  };

  const getAvatarColor = (id) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-green-400 to-green-600',
      'from-pink-400 to-pink-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600'
    ];
    const index = typeof id === 'number' ? id % colors.length : Math.floor(Math.random() * colors.length);
    return colors[index];
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const past = new Date(date);
    const diffHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  // Navigation handlers
  const handleNavigateToPendingRecruiters = () => {
    navigate('/admin/employers');
  };

  const handleNavigateToPendingJobs = () => {
    navigate('/admin/pending-jobs');
  };

  const handleNavigateToPendingApplications = () => {
    navigate('/admin/pending-applications');
  };

  const handleNavigateToAllCandidates = () => {
    navigate('/admin/candidates');
  };

  const handleNavigateToJobReports = () => {
    navigate('/admin/job-application-reports');
  };

  const handleRefreshDashboard = () => {
    setLoadingStates({
      candidates: true,
      recruiters: true,
      jobs: true,
      tasks: true
    });
    fetchDashboardData();
    toast.success('Dashboard refreshed!');
  };

  // Theme variables
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Skeleton loader components
  const SkeletonCard = () => (
    <div className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-gray-300 dark:border-gray-600 animate-pulse`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
        </div>
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );

  const SkeletonItem = () => (
    <div className="flex items-center justify-between p-3 rounded-lg animate-pulse">
      <div className="flex items-center flex-1">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="ml-3 flex-1">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
    </div>
  );

  // Memoize total pending count
  const totalPending = useMemo(() => 
    pendingActions.recruiters + pendingActions.jobs + pendingActions.applications,
    [pendingActions]
  );

  // Show skeleton loaders during initial load
  if (loading && Object.values(loadingStates).every(state => state === true)) {
    return (
      <div className={`min-h-screen ${bgColor}`}>
        {/* Top Bar Skeleton */}
        <header className={`${cardBg} shadow-sm sticky top-0 z-30 w-full`}>
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div>
                <h2 className={`text-2xl font-bold ${textColor}`}>Dashboard</h2>
                <p className={`text-sm ${textSecondary} mt-1 flex items-center gap-2`}>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  Loading latest data...
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Skeletons */}
        <div className="p-6 w-full">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Content Area Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className={`${cardBg} rounded-xl shadow-lg p-6 lg:col-span-2`}>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-40 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </div>
            </div>
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4 animate-pulse"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
            <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Top Bar */}
      <header className={`${cardBg} shadow-sm sticky top-0 z-30 w-full`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div>
              <h2 className={`text-2xl font-bold ${textColor}`}>Dashboard</h2>
              <p className={`text-sm ${textSecondary} mt-1`}>Welcome back, Admin</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefreshDashboard}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className={`relative p-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}>
              <Bell size={20} />
              {totalPending > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {totalPending > 9 ? '9+' : totalPending}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Candidates */}
          <div 
            onClick={handleNavigateToAllCandidates}
            className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textSecondary} text-sm font-medium`}>Total Candidates</p>
                <h3 className={`text-3xl font-bold ${textColor} mt-2`}>
                  {dashboardStats.totalCandidates.toLocaleString()}
                </h3>
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {dashboardStats.candidateGrowth}% from last month
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="text-blue-500" size={28} />
              </div>
            </div>
          </div>

          {/* Total Recruiters */}
          <div 
            onClick={handleNavigateToPendingRecruiters}
            className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-purple-500 transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textSecondary} text-sm font-medium`}>Total Recruiters</p>
                <h3 className={`text-3xl font-bold ${textColor} mt-2`}>
                  {dashboardStats.totalRecruiters.toLocaleString()}
                </h3>
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {dashboardStats.recruiterGrowth}% from last month
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Building className="text-purple-500" size={28} />
              </div>
            </div>
          </div>

          {/* Active Jobs */}
          <div 
            onClick={handleNavigateToJobReports}
            className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-green-500 transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textSecondary} text-sm font-medium`}>Active Jobs</p>
                <h3 className={`text-3xl font-bold ${textColor} mt-2`}>
                  {dashboardStats.activeJobs.toLocaleString()}
                </h3>
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {dashboardStats.jobGrowth}% from last month
                </p>
              </div>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Briefcase className="text-green-500" size={28} />
              </div>
            </div>
          </div>

          {/* Total Applications */}
          <div 
            onClick={handleNavigateToJobReports}
            className={`${cardBg} rounded-xl shadow-lg p-6 border-l-4 border-orange-500 transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textSecondary} text-sm font-medium`}>Total Applications</p>
                <h3 className={`text-3xl font-bold ${textColor} mt-2`}>
                  {dashboardStats.totalApplications.toLocaleString()}
                </h3>
                <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {dashboardStats.applicationGrowth}% from last month
                </p>
              </div>
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <FileText className="text-orange-500" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pending Approvals */}
          <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
            <h3 className={`text-lg font-bold ${textColor} mb-4 flex items-center gap-2`}>
              <Clock className="text-yellow-500" size={20} />
              Pending Actions
            </h3>
            <div className="space-y-3">
              <div 
                onClick={handleNavigateToPendingRecruiters}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <p className={`text-sm font-medium ${textColor}`}>
                  {pendingActions.recruiters} Recruiters Awaiting Approval
                </p>
                <button className="text-indigo-600 dark:text-indigo-400 text-xs font-medium mt-1 hover:underline flex items-center gap-1">
                  Review Now <ChevronRight size={12} />
                </button>
              </div>
              <div 
                onClick={handleNavigateToPendingJobs}
                className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              >
                <p className={`text-sm font-medium ${textColor}`}>
                  {pendingActions.jobs} Jobs Pending Review
                </p>
                <button className="text-indigo-600 dark:text-indigo-400 text-xs font-medium mt-1 hover:underline flex items-center gap-1">
                  Review Now <ChevronRight size={12} />
                </button>
              </div>
              <div 
                onClick={handleNavigateToPendingApplications}
                className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <p className={`text-sm font-medium ${textColor}`}>
                  {pendingActions.applications} New Applications
                </p>
                <button className="text-indigo-600 dark:text-indigo-400 text-xs font-medium mt-1 hover:underline flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Candidates */}
          <div className={`${cardBg} rounded-xl shadow-lg p-6 lg:col-span-2`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                <UserPlus className="text-blue-500" size={20} />
                Recent Candidates
              </h3>
              <button 
                onClick={handleNavigateToAllCandidates}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {recentCandidates.map((candidate, index) => (
                <div
                  key={candidate.id || index}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer`}
                  onClick={() => navigate(`/admin/candidates/profile/${candidate.email}`)}
                >
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-gray-200 dark:border-gray-600">
                      {candidate.logo ? (
                        <img
                          src={candidate.logo}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide image and show fallback on error
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full bg-gradient-to-br ${candidate.color} flex items-center justify-center text-white font-bold text-sm ${candidate.logo ? 'hidden' : 'flex'}`}
                      >
                        {candidate.initials}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${textColor}`}>{candidate.name}</p>
                      <p className={`text-xs ${textSecondary}`}>
                        {candidate.position} {candidate.experience ? `• ${candidate.experience} years exp` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs ${textSecondary}`}>
                    {formatTimeAgo(candidate.created_at)}
                  </span>
                </div>
              ))}
              {recentCandidates.length === 0 && (
                <div className="text-center py-8">
                  <p className={textSecondary}>No recent candidates</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Trends */}
          <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
            <h3 className={`text-lg font-bold ${textColor} mb-4`}>Application Trends</h3>
            <div className="h-64 flex items-end justify-around space-x-2">
              {[60, 75, 85, 90, 70, 95, 100].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${height}% of target`}
                ></div>
              ))}
            </div>
            <div className={`flex justify-around mt-4 text-xs ${textSecondary}`}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Job Categories */}
          <div className={`${cardBg} rounded-xl shadow-lg p-6`}>
            <h3 className={`text-lg font-bold ${textColor} mb-4`}>Job Categories</h3>
            <div className="space-y-4">
              <div>
                <div className={`flex justify-between text-sm mb-1`}>
                  <span className={textSecondary}>Software Development</span>
                  <span className={`font-medium ${textColor}`}>45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className={`flex justify-between text-sm mb-1`}>
                  <span className={textSecondary}>Design & Creative</span>
                  <span className={`font-medium ${textColor}`}>25%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div>
                <div className={`flex justify-between text-sm mb-1`}>
                  <span className={textSecondary}>Marketing & Sales</span>
                  <span className={`font-medium ${textColor}`}>15%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: '15%' }}></div>
                </div>
              </div>
              <div>
                <div className={`flex justify-between text-sm mb-1`}>
                  <span className={textSecondary}>Finance & Accounting</span>
                  <span className={`font-medium ${textColor}`}>10%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: '10%' }}></div>
                </div>
              </div>
              <div>
                <div className={`flex justify-between text-sm mb-1`}>
                  <span className={textSecondary}>Others</span>
                  <span className={`font-medium ${textColor}`}>5%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;