import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { candidateExternalService } from "../../services";
import styles from "./UserDashboard.module.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [dashboardData, setDashboardData] = useState({
    savedJobsCount: 0,
    appliedJobsCount: 0,
    membershipStatus: 'Free',
    profileCompletion: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    const steps = [
      {
        title: 'Personal Info',
        fields: [
          { name: 'full_name', required: true, weight: 10 },
          { name: 'phone_number', required: true, weight: 5 },
          { name: 'username', required: true, weight: 3 },
          { name: 'gender', required: true, weight: 2 }
        ],
        totalWeight: 20
      },
      {
        title: 'Address',
        fields: [
          { name: 'address.city', required: true, weight: 8 },
          { name: 'address.state', required: true, weight: 6 },
          { name: 'address.country', required: true, weight: 6 }
        ],
        totalWeight: 20
      },
      {
        title: 'Professional',
        fields: [
          { name: 'bio', required: true, weight: 15 },
          { name: 'skills', required: true, weight: 5 }
        ],
        totalWeight: 20
      },
      {
        title: 'Education',
        fields: [],
        totalWeight: 20,
        isArray: true,
        arrayField: 'education'
      },
      {
        title: 'Experience',
        fields: [],
        totalWeight: 20,
        isArray: true,
        arrayField: 'experience'
      }
    ];

    let totalCompleted = 0;

    steps.forEach(step => {
      let stepCompleted = 0;

      if (step.isArray) {
        // Handle array fields (education, experience)
        const arrayData = userData[step.arrayField] || [];
        if (Array.isArray(arrayData) && arrayData.length > 0) {
          const hasValidEntry = arrayData.some(item => {
            return Object.values(item).some(value =>
              value && typeof value === 'string' && value.trim() !== ''
            );
          });
          if (hasValidEntry) {
            stepCompleted = step.totalWeight;
          }
        }
      } else {
        // Handle regular fields
        const totalFieldWeight = step.fields.reduce((sum, field) => sum + field.weight, 0);
        let completedFieldWeight = 0;

        step.fields.forEach(field => {
          const keys = field.name.split('.');
          let value = userData;
          let hasValue = false;

          for (const key of keys) {
            value = value && value[key];
          }

          if (value && value.toString().trim() !== '') {
            hasValue = true;
          }

          if (hasValue) {
            completedFieldWeight += field.weight;
          }
        });

        if (totalFieldWeight > 0) {
          stepCompleted = Math.round((completedFieldWeight / totalFieldWeight) * step.totalWeight);
        }
      }

      totalCompleted += stepCompleted;
    });

    return Math.min(100, Math.round(totalCompleted));
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.user_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Fetch saved jobs count
        const savedJobsData = await candidateExternalService.getBookmarkedJobs(user.user_id);
        // Handle both array and single object responses
        const jobsArray = savedJobsData?.bookmarked_jobs || savedJobsData?.jobs || [];
        const normalizedJobs = Array.isArray(jobsArray) ? jobsArray : [jobsArray];
        const savedJobsCount = normalizedJobs.length;

        // Fetch applied jobs count
        const appliedJobsData = await candidateExternalService.getAppliedJobs(user.user_id);
        const appliedJobsCount = appliedJobsData?.applications?.length || appliedJobsData?.jobs?.length || 0;

        // Get membership status
        const membershipStatus = user.membership === 'premium' ? 'Pro Member' :
                               user.membership === 'basic' ? 'Basic Member' : 'Free Member';

        // Calculate profile completion
        const profileCompletion = calculateProfileCompletion(user);

        setDashboardData({
          savedJobsCount,
          appliedJobsCount,
          membershipStatus,
          profileCompletion
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'jobs':
        navigate('/userjoblistings');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'saved':
        navigate('/saved-jobs');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const getUserName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    return 'User';
  };

  return (
    <div className={`${styles.container} ${theme === 'dark' ? 'dark' : ''}`}>
      {loading && (
        <div className={styles.loading}>
          <h3>Loading dashboard...</h3>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Welcome Header */}
          <div className={styles.dashboardHeader}>
            <div className={styles.welcomeSection}>
              <h1>Welcome back, {getUserName()}! 👋</h1>
              <p>Here's what's happening with your job search today</p>
            </div>
          </div>

          {/* KPI Cards */}
          <section className={styles.kpis}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiIcon}>💼</span>
                Saved Jobs
              </div>
              <div className={styles.kpiValue}>{dashboardData.savedJobsCount}</div>
              <div className={styles.kpiFoot}>From all job listings</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiIcon}>📄</span>
                Applied Jobs
              </div>
              <div className={styles.kpiValue}>{dashboardData.appliedJobsCount}</div>
              <div className={styles.kpiFoot}>Applications submitted</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiIcon}>⭐</span>
                Active Plan
              </div>
              <div className={styles.kpiValue}>{dashboardData.membershipStatus}</div>
              <div className={styles.kpiFoot}>Current membership</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiIcon}>📊</span>
                Profile Status
              </div>
              <div className={styles.kpiValue}>{dashboardData.profileCompletion}%</div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progress} 
                  style={{ width: `${dashboardData.profileCompletion}%` }} 
                />
              </div>
              <div className={styles.kpiFoot}>
                {dashboardData.profileCompletion === 100 ? 'Complete' : 'Update your details'}
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <section className={styles.grid}>
            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h3>Quick Actions</h3>
              <ul>
                <li>
                  <button
                    className={styles.qaItem}
                    onClick={() => handleQuickAction('jobs')}
                  >
                    <span className={styles.qaIcon}>🔍</span>
                    Find New Jobs
                  </button>
                </li>
                <li>
                  <button
                    className={styles.qaItem}
                    onClick={() => handleQuickAction('profile')}
                  >
                    <span className={styles.qaIcon}>👤</span>
                    Update Profile
                  </button>
                </li>
                <li>
                  <button
                    className={styles.qaItem}
                    onClick={() => handleQuickAction('saved')}
                  >
                    <span className={styles.qaIcon}>❤️</span>
                    View Saved Jobs
                  </button>
                </li>
                <li>
                  <button
                    className={styles.qaItem}
                    onClick={() => handleQuickAction('settings')}
                  >
                    <span className={styles.qaIcon}>⚙️</span>
                    Settings
                  </button>
                </li>
              </ul>
            </div>

            {/* Recent Activity */}
            <div className={styles.recentActivity}>
              <h3>Recent Activity</h3>
              <ul className={styles.activityList}>
                <li>
                  Applied to Senior React Developer at Tech Solutions Inc.
                  <span className={styles.meta}>2 hours ago</span>
                  <span className={styles.badge}>New</span>
                </li>
                <li>
                  Recruiter viewed your profile for Marketing Manager role.
                  <span className={styles.meta}>Yesterday</span>
                  <span className={styles.badgeMuted}>Viewed</span>
                </li>
                <li>
                  Saved 'Software Engineer' job at Innovate Corp.
                  <span className={styles.meta}>2 days ago</span>
                  <span className={styles.badgeMuted}>Saved</span>
                </li>
                <li>
                  Application status updated for Product Designer role: Interview Scheduled.
                  <span className={styles.meta}>3 days ago</span>
                  <span className={styles.badge}>Update</span>
                </li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
