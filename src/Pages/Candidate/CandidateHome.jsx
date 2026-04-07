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
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();

  const [profileCompletion, setProfileCompletion] = useState(0);
  const [latestJobs, setLatestJobs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    if (!userData) {
      console.log('✗ No user data provided');
      return 0;
    }

    console.log('=== CALCULATING PROFILE COMPLETION ===');
    console.log('Input user data:', JSON.stringify(userData, null, 2));

    let completedFields = 0;
    const totalFields = 10; // 10 core fields for 100% completion

    // Core required fields
    const fullName = userData.full_name || userData.fullName;
    if (fullName && String(fullName).trim()) {
      console.log('✓ full_name present:', fullName);
      completedFields++;
    } else {
      console.log('✗ full_name missing');
    }

    const phoneNumber = userData.phone_number || userData.phoneNumber;
    if (phoneNumber && String(phoneNumber).trim()) {
      console.log('✓ phone_number present:', phoneNumber);
      completedFields++;
    } else {
      console.log('✗ phone_number missing');
    }

    const gender = userData.gender;
    if (gender && String(gender).trim()) {
      console.log('✓ gender present:', gender);
      completedFields++;
    } else {
      console.log('✗ gender missing');
    }

    // Address fields - handle both object and flat structure
    const address = userData.address || {};
    const city = address.city || userData.address_city;
    const state = address.state || userData.address_state;
    const country = address.country || userData.address_country;

    if (city && String(city).trim()) {
      console.log('✓ address.city present:', city);
      completedFields++;
    } else {
      console.log('✗ address.city missing');
    }

    if (state && String(state).trim()) {
      console.log('✓ address.state present:', state);
      completedFields++;
    } else {
      console.log('✗ address.state missing');
    }

    if (country && String(country).trim()) {
      console.log('✓ address.country present:', country);
      completedFields++;
    } else {
      console.log('✗ address.country missing');
    }

    // Professional info
    const bio = userData.bio;
    if (bio && String(bio).trim()) {
      console.log('✓ bio present:', bio.substring(0, 50) + '...');
      completedFields++;
    } else {
      console.log('✗ bio missing');
    }

    const skills = userData.skills;
    if (skills && String(skills).trim()) {
      console.log('✓ skills present:', skills);
      completedFields++;
    } else {
      console.log('✗ skills missing');
    }

    // Education - handle different formats
    let education = userData.education;
    if (typeof education === 'string') {
      try {
        education = JSON.parse(education);
      } catch (e) {
        education = [];
      }
    }
    
    if (education && Array.isArray(education) && education.length > 0) {
      const hasValidEntry = education.some(edu => {
        const degree = edu?.degree || edu?.Degree || '';
        const institution = edu?.institution || edu?.Institution || '';
        return degree && String(degree).trim() && institution && String(institution).trim();
      });
      console.log('Education check - has array:', !!education, 'length:', education.length, 'has valid entry:', hasValidEntry);
      if (hasValidEntry) {
        completedFields++;
        console.log('✓ education present and valid');
      } else {
        console.log('✗ education entries incomplete');
      }
    } else {
      console.log('✗ education missing or empty, type:', typeof education, 'value:', education);
    }

    // Experience - handle different formats
    let experience = userData.experience;
    if (typeof experience === 'string') {
      try {
        experience = JSON.parse(experience);
      } catch (e) {
        experience = [];
      }
    }
    
    if (experience && Array.isArray(experience) && experience.length > 0) {
      const hasValidEntry = experience.some(exp => {
        const title = exp?.title || exp?.Title || '';
        const company = exp?.company || exp?.Company || '';
        return title && String(title).trim() && company && String(company).trim();
      });
      console.log('Experience check - has array:', !!experience, 'length:', experience.length, 'has valid entry:', hasValidEntry);
      if (hasValidEntry) {
        completedFields++;
        console.log('✓ experience present and valid');
      } else {
        console.log('✗ experience entries incomplete');
      }
    } else {
      console.log('✗ experience missing or empty, type:', typeof experience, 'value:', experience);
    }

    const percentage = Math.round((completedFields / totalFields) * 100);
    console.log(`COMPLETION RESULT: ${completedFields}/${totalFields} = ${percentage}%`);
    console.log('Final percentage:', percentage);

    return percentage;
  };

  // Recalculate completion when user data changes (real-time updates)
  useEffect(() => {
    if (user) {
      // Use a small delay to ensure data is normalized
      const timer = setTimeout(() => {
        const completion = calculateProfileCompletion(user);
        setProfileCompletion(completion);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch latest profile data to ensure we have the most up-to-date information
        let latestUserData = user;
        try {
          const profileResponse = await studentService.fetchProfileDetails(user.email);
          console.log('Profile fetch response:', profileResponse);
          
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data;
            console.log('Raw profile data from API:', profileData);
            
            // Normalize and merge the data
            latestUserData = {
              ...user,
              // Map all possible field name variations
              full_name: profileData.full_name || profileData.fullName || user.full_name || '',
              phone_number: profileData.phone_number || profileData.phoneNumber || user.phone_number || '',
              username: profileData.username || user.username || '',
              dob: profileData.dob || user.dob || '',
              gender: profileData.gender || user.gender || '',
              bio: profileData.bio || user.bio || '',
              skills: profileData.skills || user.skills || '',
              // Handle address - could be object or flat structure
              address: profileData.address || (profileData.address_city ? {
                street: profileData.address_street || user.address?.street || '',
                city: profileData.address_city || user.address?.city || '',
                state: profileData.address_state || user.address?.state || '',
                zip: profileData.address_zip || user.address?.zip || '',
                country: profileData.address_country || user.address?.country || ''
              } : user.address || {}),
              // Handle education - ensure it's an array
              education: Array.isArray(profileData.education) 
                ? profileData.education
                : (typeof profileData.education === 'string' 
                  ? (() => { try { return JSON.parse(profileData.education); } catch { return []; } })()
                  : (user.education || [])),
              // Handle experience - ensure it's an array
              experience: Array.isArray(profileData.experience)
                ? profileData.experience
                : (typeof profileData.experience === 'string'
                  ? (() => { try { return JSON.parse(profileData.experience); } catch { return []; } })()
                  : (user.experience || [])),
              resume: profileData.resume || profileData.resumeUrl || user.resume || user.resumeUrl || null
            };
            
            console.log('Normalized latest profile data:', latestUserData);
            
            // Update user context with normalized data
            if (user && Object.keys(latestUserData).length > 0) {
              updateUser(latestUserData);
              console.log('Updated user context with latest data');
            }
          } else {
            console.warn('Profile fetch returned no data, using cached user data');
          }
        } catch (profileError) {
          console.error('Error fetching profile details, using cached user data:', profileError);
        }

        // Calculate profile completion with latest user data
        console.log('=== CANDIDATE HOME COMPONENT LOADING ===');
        console.log('Final user data for completion calculation:', latestUserData);
        const completion = calculateProfileCompletion(latestUserData);

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
