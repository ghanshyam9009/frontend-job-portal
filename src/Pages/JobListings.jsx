import React, { useState, useEffect } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import styles from "./JobListings.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
import { jobService } from "../services/jobService";
import { showError } from "../utils/errorHandler";

const JobListings = () => {
  const { theme } = useTheme();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const navigate = useNavigate();
  const locationHook = useLocation();
  const querySearch = useMemo(() => {
    const params = new URLSearchParams(locationHook.search);
    return params.get("search") || "";
  }, [locationHook.search]);
  const queryLocation = useMemo(() => {
    const params = new URLSearchParams(locationHook.search);
    return params.get("location") || "";
  }, [locationHook.search]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const [filters, setFilters] = useState({
    location: "",
    skills: [],
    salaryRange: "",
    jobType: "",
    experienceLevel: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  useEffect(() => {
    fetchJobs();
  }, [currentPage, filters, querySearch, queryLocation]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = {
        page: currentPage,
        limit: jobsPerPage,
        keyword: querySearch || "",
        location: queryLocation || filters.location,
        employment_type: filters.jobType || undefined,
        experience_level: filters.experienceLevel || undefined,
        skills: filters.skills.length > 0 ? filters.skills.join(',') : undefined
      };

      // Remove undefined values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === undefined || searchParams[key] === "") {
          delete searchParams[key];
        }
      });

      const response = await jobService.searchJobs(searchParams);
      
      if (response.success) {
        const jobsData = response.data || response;
        setJobs(jobsData.jobs || jobsData);
        setTotalJobs(jobsData.total || jobsData.length);
        setTotalPages(Math.max(1, Math.ceil((jobsData.total || jobsData.length) / jobsPerPage)));
      } else {
        throw new Error(response.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      showError(err, 'Failed to fetch jobs. Please try again later.');
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      skills: [],
      salaryRange: "",
      jobType: "",
      experienceLevel: ""
    });
    setCurrentPage(1);
  };

  const handleJobClick = (job) => {
    const jobSlug = job.job_title?.toLowerCase().replace(/\s+/g, '-') || job.id;
    navigate(`/job/${jobSlug}`, {
      state: { job }
    });
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return "Salary not specified";
    if (typeof salaryRange === 'string') return salaryRange;
    if (salaryRange.min && salaryRange.max) {
      return `₹${salaryRange.min} - ₹${salaryRange.max}`;
    }
    return "Salary not specified";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />
      <div className={styles.mainContentNoSidebar}>
        <div className={styles.filtersResponsive}>
          <button 
            className={styles.filterToggleButton} 
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            {isFilterVisible ? "Hide Filters" : "Show Filters"}
          </button>
          <div className={`${styles.filtersContent} ${isFilterVisible ? styles.visible : ''}`}>
            <h3>Filters</h3>
            
            <div className={styles.filterGroup}>
              <label>Location</label>
              <input
                type="text"
                placeholder="e.g., Mumbai, Remote"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Experience Level</label>
              <select
                t value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
              >
                <option value="">All levels</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6+ years)</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Skills</label>
              <div className={styles.checkboxGroup}>
                {["React", "Node.js", "TypeScript", "AWS", "Python", "SQL", "JavaScript", "Java", "Angular", "Vue.js"].map(skill => (
                  <label key={skill} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filters.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                    />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Job Type</label>
              <div className={styles.radioGroup}>
                {["Full-time", "Part-time", "Contract", "Remote", "Internship"].map(type => (
                  <label key={type} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="jobType"
                      value={type}
                      checked={filters.jobType === type}
                      onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Salary Range</label>
              <select
                value={filters.salaryRange}
                onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
              >
                <option value="">Any salary</option>
                <option value="0-3">₹0 - ₹3L</option>
                <option value="3-5">₹3L - ₹5L</option>
                <option value="5-7">₹5L - ₹7L</option>
                <option value="7-10">₹7L - ₹10L</option>
                <option value="10-15">₹10L - ₹15L</option>
                <option value="15+">₹15L+</option>
              </select>
            </div>

            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <div className={styles.contentColumn}>
          <div className={styles.heroBanner}>
            <div className={styles.heroText}>
              <h1>Find Your Dream Job</h1>
              <p>Explore {totalJobs.toLocaleString()} job opportunities across various industries. Your next career move starts here.</p>
            </div>
            <div className={styles.heroImage}>
              <div className={styles.vrIcon}></div>
            </div>
          </div>

          <div className={styles.jobsSection}>
            <div className={styles.jobsHeader}>
              <h2>Available Jobs</h2>
              <div className={styles.jobsCount}>
                Showing {jobs.length} of {totalJobs.toLocaleString()} jobs
              </div>
            </div>
            
            <div className={styles.jobsColumn}>
              {loading && (
                <div className={styles.loading}>
                  <div className={styles.loadingSpinner}></div>
                  Loading jobs...
                </div>
              )}
              
              {error && (
                <div className={styles.error}>
                  {error}
                  <button onClick={fetchJobs} className={styles.retryBtn}>
                    Try Again
                  </button>
                </div>
              )}
              
              {!loading && !error && jobs.length === 0 && (
                <div className={styles.noJobs}>
                  <div className={styles.noJobsIcon}>🔍</div>
                  <h3>No jobs found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                  <button onClick={clearFilters} className={styles.clearFiltersBtn}>
                    Clear All Filters
                  </button>
                </div>
              )}
              
              {!loading && !error && jobs.map(job => (
                <div key={job.job_id || job.id} className={styles.jobCard}>
                  <div className={styles.jobCardHeader}>
                    <div className={styles.jobIcon}>💻</div>
                    <div className={styles.jobType}>{job.employment_type || job.type || 'Full-time'}</div>
                    <div className={styles.jobDate}>{formatDate(job.created_at || job.posted_date)}</div>
                  </div>
                  
                  <div className={styles.jobContent}>
                    <h3 className={styles.jobTitle}>{job.job_title || job.title}</h3>
                    <p className={styles.company}>{job.company_name || job.company}</p>
                    
                    <div className={styles.jobDetails}>
                      <div className={styles.jobDetail}>
                        <span className={styles.detailIcon}>📍</span>
                        <span>{job.location || 'Location not specified'}</span>
                      </div>
                      <div className={styles.jobDetail}>
                        <span className={styles.detailIcon}>💰</span>
                        <span>{formatSalary(job.salary_range || job.salary)}</span>
                      </div>
                      {job.experience_required && (
                        <div className={styles.jobDetail}>
                          <span className={styles.detailIcon}>👔</span>
                          <span>{job.experience_required}</span>
                        </div>
                      )}
                    </div>
                    
                    {job.description && (
                      <p className={styles.jobDescription}>
                        {job.description.length > 150 
                          ? `${job.description.substring(0, 150)}...` 
                          : job.description
                        }
                      </p>
                    )}
                    
                    <div className={styles.jobSkills}>
                      {job.skills_required && job.skills_required.slice(0, 3).map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.jobActions}>
                    <button 
                      className={styles.viewBtn} 
                      onClick={() => handleJobClick(job)}
                    >
                      View Details
                    </button>
                    <button className={styles.saveBtn}>
                      Save Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + idx;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      className={`${styles.pageBtn} ${pageNum === currentPage ? styles.activePageBtn : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  className={styles.pageBtn}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobListings;
