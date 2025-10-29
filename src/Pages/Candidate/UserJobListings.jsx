import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import CandidateSidebar from "../../Components/Candidate/CandidateSidebar";
import styles from "./UserDashboard.module.css";
import { candidateExternalService } from "../../services";
import { candidateService } from "../../services/candidateService";
import { Briefcase, Crown } from "lucide-react";

const UserJobListings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ keyword: "", location: "", employment_type: "" });
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await candidateExternalService.getAllJobs();
        const mapped = (data?.jobs || []).map((j, idx) => ({
          id: j.job_id || idx,
          title: j.job_title,
          company: j.company_name || "",
          salary: j.salary_range ? `₹${j.salary_range.min} - ₹${j.salary_range.max} / ${j.employment_type ? 'year' : ''}` : "",
          location: j.location || "",
          type: j.employment_type || "Full-time",
          isPremium: Math.random() > 0.7, // Simulate premium jobs
        }));
        setJobs(mapped);
      } catch (e) {
        setError(typeof e === 'string' ? e : e?.message || 'Failed to load jobs');
      } finally {
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
    try {
      setLoading(true);
      setError("");
      const params = {
        keyword: filters.keyword || undefined,
        location: filters.location || undefined,
        employment_type: filters.employment_type || undefined
      };
      const data = await candidateExternalService.getFilteredJobs(params);
      const mapped = (data?.jobs || []).map((j, idx) => ({
        id: j.job_id || idx,
        title: j.job_title,
        company: j.company_name || "",
        salary: j.salary_range ? `₹${j.salary_range.min} - ₹${j.salary_range.max} / ${j.employment_type ? 'year' : ''}` : "",
        location: j.location || "",
        type: j.employment_type || "Full-time",
      }));
      setJobs(mapped);
    } catch (e) {
      setError(typeof e === 'string' ? e : e?.message || 'Failed to filter jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (job) => {
    navigate(`/job/${job.title.toLowerCase().replace(/\s+/g, '-')}`, {
      state: { job }
    });
  };

  const handleSaveJob = async (job) => {
    try {
      if (!user?.user_id && !user?.id) {
        alert('Please log in to save jobs.');
        navigate('/candidate/login');
        return;
      }
      const userId = user.user_id || user.id;
      await candidateExternalService.bookmarkJob({ user_id: userId, job_id: job.id });
      alert('Job saved');
    } catch (e) {
      alert('Failed to save job');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <CandidateNavbar toggleSidebar={toggleSidebar} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <CandidateSidebar darkMode={darkMode} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
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
            {loading && <div className={styles.emptyState}><h3>Loading jobs…</h3></div>}
            {error && <div className={styles.emptyState}><h3>{error}</h3></div>}
            {isPremium && (
              <div className={styles.premiumMessage}>
                <span className={styles.premiumIcon}><Crown size={20} /></span>
                <p>You are a premium member! Enjoy enhanced features and priority access to jobs.</p>
              </div>
            )}
            {jobs.map(job => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobCardHeader}>
                  <div className={styles.jobIcon}><Briefcase size={20} /></div>
                  <div className={styles.jobType}>{job.type}</div>
                  {job.isPremium && <div className={styles.premiumBadge}>Premium</div>}
                </div>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <p className={styles.jobCompany}>{job.company}</p>
                <p className={styles.jobSalary}>{job.salary}</p>
                <p className={styles.jobLocation}>{job.location}</p>
                <button 
                  className={styles.viewBtn}
                  onClick={() => handleJobClick(job)}
                >
                  View Details
                </button>
                <button 
                  className={styles.applyBtn}
                  onClick={() => handleSaveJob(job)}
                >
                  Save Job
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserJobListings;
