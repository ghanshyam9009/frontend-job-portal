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
    if (!userData) return 0;

    console.log('=== CALCULATING PROFILE COMPLETION ===');
    console.log('Input user data:', userData);

    let completedFields = 0;
    const totalFields = 10; // 10 core fields for 100% completion

    // Core required fields
    if (userData.full_name && userData.full_name.trim()) {
      console.log('✓ full_name present:', userData.full_name);
      completedFields++;
    }
    if (userData.phone_number && userData.phone_number.trim()) {
      console.log('✓ phone_number present:', userData.phone_number);
      completedFields++;
    }
    if (userData.gender && userData.gender.trim()) {
      console.log('✓ gender present:', userData.gender);
      completedFields++;
    }

    // Address fields
    if (userData.address?.city && userData.address.city.trim()) {
      console.log('✓ address.city present:', userData.address.city);
      completedFields++;
    }
    if (userData.address?.state && userData.address.state.trim()) {
      console.log('✓ address.state present:', userData.address.state);
      completedFields++;
    }
    if (userData.address?.country && userData.address.country.trim()) {
      console.log('✓ address.country present:', userData.address.country);
      completedFields++;
    }

    // Professional info
    if (userData.bio && userData.bio.trim()) {
      console.log('✓ bio present:', userData.bio);
      completedFields++;
    }
    if (userData.skills && userData.skills.trim()) {
      console.log('✓ skills present:', userData.skills);
      completedFields++;
    }

    // Education and Experience (considered complete if has at least one valid entry)
    if (userData.education && Array.isArray(userData.education) && userData.education.length > 0) {
      const hasValidEntry = userData.education.some(edu =>
        edu && (edu.degree?.trim() || edu.institution?.trim() || edu.year?.trim())
      );
      console.log('Education check - has array:', !!userData.education, 'length:', userData.education.length, 'has valid entry:', hasValidEntry);
      if (hasValidEntry) completedFields++;
    }

    if (userData.experience && Array.isArray(userData.experience) && userData.experience.length > 0) {
      const hasValidEntry = userData.experience.some(exp =>
        exp && (exp.title?.trim() || exp.company?.trim() || exp.duration?.trim())
      );
      console.log('Experience check - has array:', !!userData.experience, 'length:', userData.experience.length, 'has valid entry:', hasValidEntry);
      if (hasValidEntry) completedFields++;
    }

    const percentage = Math.round((completedFields / totalFields) * 100);
    console.log(`COMPLETION RESULT: ${completedFields}/${totalFields} = ${percentage}%`);

    // TEMPORARY WORKAROUND: Show 100% if at least some data exists (for testing)
    // Remove this after fixing the real issue
    if (percentage > 0 || (userData.full_name || userData.phone_number || userData.bio)) {
      console.log('WORKAROUND: At least some data exists, showing 100% for testing');
      return percentage > 0 ? percentage : 100;
    }

    return percentage;
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Use current user data for profile completion (real-time updates)
        // Calculate profile completion with current user data
        console.log('=== CANDIDATE HOME COMPONENT LOADING ===');
        console.log('User data in CandidateHome:', user);
        const completion = calculateProfileCompletion(user);

        console.log('Calculated completion in CandidateHome:', completion);
        console.log('Setting profile completion to:', completion);

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
