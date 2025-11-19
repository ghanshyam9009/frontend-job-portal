import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { candidateExternalService } from "../../services";
import { studentService } from "../../services/studentService";
import { FileText, Heart, List, User, Calendar, TrendingUp, Bell, CreditCard, Edit } from "lucide-react";
import styles from "./CandidateHome.module.css";

const CandidateHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [latestJobs, setLatestJobs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    const steps = [
      {
        fields: ['full_name', 'phone_number', 'username', 'dob', 'gender'],
        weight: 20
      },
      {
        fields: ['address.street', 'address.city', 'address.state', 'address.zip', 'address.country'],
        weight: 20
      },
      {
        fields: ['bio', 'skills'],
        weight: 20
      },
      {
        fields: ['education'],
        weight: 20
      },
      {
        fields: ['experience'],
        weight: 20
      }
    ];

    let completedWeight = 0;
    let totalWeight = 0;

    steps.forEach(step => {
      totalWeight += step.weight;

      if (step.fields.includes('education') || step.fields.includes('experience')) {
        const field = step.fields[0];
        if (userData[field] && Array.isArray(userData[field]) && userData[field].length > 0) {
          const hasValidData = userData[field].some(item =>
            Object.values(item).some(value => value && value.trim() !== '')
          );
          if (hasValidData) {
            completedWeight += step.weight;
          }
        }
      } else {
        const hasAllFields = step.fields.every(field => {
          const keys = field.split('.');
          let value = userData;
          for (const key of keys) {
            value = value && value[key];
          }
          return value && value.trim() !== '';
        });
        if (hasAllFields) {
          completedWeight += step.weight;
        }
      }
    });

    return Math.round((completedWeight / totalWeight) * 100);
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile data
        let profileData = user;
        try {
          const profileResponse = await studentService.getProfile(user.email);
          if (profileResponse?.success && profileResponse?.data) {
            profileData = { ...user, ...profileResponse.data };
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        // Calculate profile completion
        const completion = calculateProfileCompletion(profileData);
        setProfileCompletion(completion);

        // Fetch latest jobs
        try {
          const jobsResponse = await candidateExternalService.getAllJobs();
          const latest = jobsResponse?.jobs?.slice(0, 6) || [];
          setLatestJobs(latest);
        } catch (jobsError) {
          console.error('Error fetching jobs:', jobsError);
        }

        // Fetch recent activity (applications)
        try {
          const userId = user?.user_id || user?.id || user?.student_id;
          if (userId) {
            const applicationsResponse = await candidateExternalService.getAppliedJobs(userId);
            const applications = applicationsResponse?.applications || applicationsResponse?.jobs || [];

            // Convert applications to activity items
            const activities = applications.slice(0, 4).map(app => ({
              id: app.id || app.application_id,
              type: 'application',
              text: `Applied to ${app.job_title || 'Job'} at ${app.company_name || 'Company'}`,
              time: app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recently'
            }));

            setRecentActivity(activities);
          }
        } catch (activityError) {
          console.error('Error fetching activity:', activityError);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getUserName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    return 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'user@example.com';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Left Sidebar - Profile Section */}
        <div className={styles.profileSection}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                <User size={40} />
              </div>
              <div className={styles.profileInfo}>
                <h3>{getUserName()}</h3>
                <p>{getUserEmail()}</p>
              </div>
            </div>

            <div className={styles.profileCompletion}>
              <div className={styles.completionHeader}>
                <span>Profile Completion</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className={styles.completionText}>
                {profileCompletion === 100 ? 'Complete!' : 'Complete your profile to get better job matches'}
              </p>
              <button
                className={styles.completeProfileBtn}
                onClick={() => handleNavigation('/profile')}
              >
                <Edit size={16} />
                Complete Profile
              </button>
            </div>

            <div className={styles.quickLinks}>
              <button
                className={styles.linkItem}
                onClick={() => handleNavigation('/my-applications')}
              >
                <FileText size={20} />
                <span>My Applications</span>
              </button>
              <button
                className={styles.linkItem}
                onClick={() => handleNavigation('/saved-jobs')}
              >
                <Heart size={20} />
                <span>Saved Jobs</span>
              </button>
              <button
                className={styles.linkItem}
                onClick={() => handleNavigation('/userjoblistings')}
              >
                <List size={20} />
                <span>Job Listings</span>
              </button>
              <button
                className={styles.linkItem}
                onClick={() => handleNavigation('/membership-plans')}
              >
                <CreditCard size={20} />
                <span>Membership Plans</span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section - Latest Jobs */}
        <div className={styles.jobsSection}>
          <div className={styles.sectionHeader}>
            <h2>Latest Jobs</h2>
            <button
              className={styles.viewAllBtn}
              onClick={() => handleNavigation('/userjoblistings')}
            >
              View All
            </button>
          </div>

          <div className={styles.jobsGrid}>
            {latestJobs.map((job) => (
              <div key={job.job_id} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <h3>{job.job_title}</h3>
                  <span className={styles.company}>{job.company_name}</span>
                </div>
                <div className={styles.jobDetails}>
                  <span className={styles.location}>{job.location}</span>
                  <span className={styles.salary}>
                    {job.salary_min && job.salary_max
                      ? `$${job.salary_min} - $${job.salary_max}`
                      : 'Salary not disclosed'
                    }
                  </span>
                </div>
                <div className={styles.jobTags}>
                  {job.job_type && <span className={styles.tag}>{job.job_type}</span>}
                  {job.experience_level && <span className={styles.tag}>{job.experience_level}</span>}
                </div>
                <button
                  className={styles.applyBtn}
                  onClick={() => navigate('/job/manager')}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Recent Activity */}
        <div className={styles.upcomingSection}>
          <div className={styles.upcomingCard}>
            <h3>Recent Activity</h3>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityDot}></div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>{activity.text}</p>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.activityItem}>
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>No recent activity yet. Start applying to jobs!</p>
                  <span className={styles.activityTime}>Welcome</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateHome;
