import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import styles from "./UserJobListings.module.css";
import { candidateExternalService } from "../../services";
import { candidateService } from "../../services/candidateService";
import { Briefcase, Crown } from "lucide-react";
import HomeNav from "../../Components/HomeNav";
import { Loader, ErrorBox, SkeletonJobCard, JobCard } from "../../Components/Shared";
import { toast } from "react-toastify";

const UserJobListings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ keyword: "", location: "", employment_type: "" });
  const [isPremium, setIsPremium] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());

  // Fetch bookmarked jobs on mount
  useEffect(() => {
    const fetchBookmarkedJobs = async () => {
      if (!user) return;
      
      try {
        const userId = user.user_id || user.id;
        if (!userId) return;

        const data = await candidateExternalService.getBookmarkedJobs(userId);
        const bookmarked = (data?.jobs || data?.bookmarkedJobs || []).map(job => 
          job.job_id || job.id
        );
        setBookmarkedJobs(new Set(bookmarked));
      } catch (error) {
        console.error('Error fetching bookmarked jobs:', error);
      }
    };

    fetchBookmarkedJobs();
  }, [user]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await candidateExternalService.getAllJobs();
        const mapped = (data?.jobs || []).map((j, idx) => ({
          id: j.job_id || idx,
          job_id: j.job_id || idx,
          job_title: j.job_title,
          title: j.job_title,
          company_name: j.company_name || "",
          company_logo: j.company_logo || j.logo || j.companyLogo || "",
          company: j.company_name || "",
          salary_range: j.salary_range,
          salary: j.salary_range ?
            (typeof j.salary_range === 'string' ?
              j.salary_range :
              `₹${j.salary_range.min} - ₹${j.salary_range.max}`)
            : "Salary not specified",
          location: j.location || "",
          employment_type: j.employment_type || "Full-time",
          type: j.employment_type || "Full-time",
          is_premium: j.is_premium || false,
          isPremium: j.is_premium || false,
          created_at: j.created_at || j.posted_date,
          posted_date: j.posted_date,
          description: j.description || "",
          skills_required: j.skills_required || []
        }));

        // Sort: Premium jobs first, then latest jobs on top
        mapped.sort((a, b) => {
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });

        // Fix flickering: set data before setting loading to false
        setJobs(mapped);
        setLoading(false);
      } catch (e) {
        setError(typeof e === 'string' ? e : e?.message || 'Failed to load jobs');
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchUserPremiumStatus = async () => {
      if (user?.email) {
        try {
          const response = await candidateService.getUserPremiumStatus(user.email);
          setIsPremium(response.data?.is_premium || false);
        } catch (error) {
          console.error('Error fetching premium status:', error);
        }
      }
    };
    fetchUserPremiumStatus();
  }, [user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        keyword: filters.keyword || undefined,
        location: filters.location || undefined,
        employment_type: filters.employment_type || undefined
      };
      const data = await candidateExternalService.getFilteredJobs(params);
      const mapped = (data?.jobs || []).map((j, idx) => ({
        id: j.job_id || idx,
        job_id: j.job_id || idx,
        job_title: j.job_title,
        title: j.job_title,
        company_name: j.company_name || "",
        company_logo: j.company_logo || j.logo || j.companyLogo || "",
        company: j.company_name || "",
        salary_range: j.salary_range,
        salary: j.salary_range ?
          (typeof j.salary_range === 'string' ?
            j.salary_range :
            `₹${j.salary_range.min} - ₹${j.salary_range.max}`)
          : "Salary not specified",
        location: j.location || "",
        employment_type: j.employment_type || "Full-time",
        type: j.employment_type || "Full-time",
        is_premium: j.is_premium || false,
        isPremium: j.is_premium || false,
        created_at: j.created_at || j.posted_date,
        posted_date: j.posted_date,
        description: j.description || "",
        skills_required: j.skills_required || []
      }));

      // Sort: Premium jobs first, then latest jobs on top
      mapped.sort((a, b) => {
        if (a.isPremium && !b.isPremium) return -1;
        if (!a.isPremium && b.isPremium) return 1;
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });

      // Fix flickering: set data before setting loading to false
      setJobs(mapped);
      setLoading(false);
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'Failed to filter jobs');
      setLoading(false);
    }
  };

  const handleJobClick = (job) => {
    navigate(`/job/${job.title.toLowerCase().replace(/\s+/g, '-')}`, {
      state: { job }
    });
  };

  const toggleBookmark = async (jobId) => {
    if (!user) {
      toast.error('Please log in to bookmark jobs.');
      navigate('/candidate/login');
      return;
    }

    try {
      const userId = user.user_id || user.id;
      if (!userId) {
        toast.error('User ID not found. Please log in again.');
        navigate('/candidate/login');
        return;
      }

      const newBookmarked = new Set(bookmarkedJobs);
      const isCurrentlyBookmarked = newBookmarked.has(jobId);
      
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        newBookmarked.delete(jobId);
        setBookmarkedJobs(newBookmarked);
        toast.success('Job removed from bookmarks');
      } else {
        // Add bookmark
        await candidateExternalService.bookmarkJob({ 
          user_id: userId, 
          job_id: jobId 
        });
        newBookmarked.add(jobId);
        setBookmarkedJobs(newBookmarked);
        toast.success('Job bookmarked successfully');
      }
    } catch (error) {
      console.error('Error bookmarking job:', error);
      toast.error('Failed to bookmark job. Please try again.');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* <HomeNav/>*/}
      {/* <CandidateNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> */}
      <main className={styles.main}>

        <section className={styles.jobsSection}>
          <div className={styles.jobsHeader}>
            <h2>Available Jobs</h2>
            <p>Discover your next career opportunity</p>
          </div>
          <div className={styles.filtersSection}>
            <input
              type="text"
              name="keyword"
              placeholder="Keyword (e.g., React, Node)"
              className={styles.formInput}
              value={filters.keyword}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="location"
              placeholder="Location (e.g., Bengaluru, India)"
              className={styles.formInput}
              value={filters.location}
              onChange={handleFilterChange}
            />
            <select
              name="employment_type"
              className={styles.formInput}
              value={filters.employment_type}
              onChange={handleFilterChange}
            >
              <option value="">Any Type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <button className={styles.primaryBtn} onClick={handleSearch}>Search</button>
          </div>
          
          <div className={styles.jobsGrid}>
            {loading && <SkeletonJobCard count={6} />}
            
            {!loading && error && (
              <ErrorBox 
                error={error} 
                onRetry={() => window.location.reload()}
                title="Failed to load jobs"
              />
            )}

            {!loading && !error && isPremium && (
              <div className={styles.premiumMessage}>
                <span className={styles.premiumIcon}><Crown size={20} /></span>
                <p>You are a premium member! Enjoy enhanced features and priority access to jobs.</p>
              </div>
            )}

            {!loading && !error && jobs.length === 0 && (
              <div className={styles.emptyState}>
                <h3>No jobs found</h3>
                <p>Try adjusting your search filters.</p>
              </div>
            )}

            {!loading && !error && jobs.map(job => (
              <JobCard
                key={job.id || job.job_id}
                job={job}
                onBookmark={toggleBookmark}
                isBookmarked={bookmarkedJobs.has(job.job_id || job.id)}
                isDark={darkMode}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserJobListings;
