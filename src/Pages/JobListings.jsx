import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import styles from "./JobListings.module.css";
import HomeNav from "../Components/HomeNav";
import { candidateExternalService } from "../services";

const JobListings = () => {
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

  const [filters, setFilters] = useState({
    location: "",
    skills: [],
    salaryRange: "",
    jobType: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = {
          keyword: querySearch || "",
          location: queryLocation || filters.location,
          employment_type: filters.jobType || undefined,
          // skills, salaryRange not supported explicitly; pass keyword for broad search
        };
        const data = Object.values(params).some(Boolean)
          ? await candidateExternalService.getFilteredJobs(params)
          : await candidateExternalService.getAllJobs();

        const jobsData = Array.isArray(data) ? data : data?.jobs || [];
        const allJobs = jobsData.map((j, idx) => ({
          id: j.job_id || idx,
          title: j.job_title,
          company: j.company_name || "",
          salary: j.salary_range ? `₹${j.salary_range.min} - ₹${j.salary_range.max}` : "",
          location: j.location || "",
          type: j.employment_type || "Full-time",
        }));

        // client-side paginate since API shape varies
        const start = (currentPage - 1) * jobsPerPage;
        const paged = allJobs.slice(start, start + jobsPerPage);
        setJobs(paged);
        setTotalPages(Math.max(1, Math.ceil(allJobs.length / jobsPerPage)));
      } catch (err) {
        setError("Failed to fetch jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage, filters, querySearch, queryLocation]);

  const handleSkillToggle = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      skills: [],
      salaryRange: "",
      jobType: ""
    });
  };

  const handleJobClick = (job) => {
    navigate(`/job/${job.title.toLowerCase().replace(/\s+/g, '-')}`, {
      state: { job }
    });
  };

  return (
    <div className={styles.pageContainer}>
      <HomeNav />
      <div className={styles.mainContentNoSidebar}>
        <div className={styles.filtersResponsive}>
          <h3>Filters</h3>
          <div className={styles.filterGroup}>
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g., New York, Remote"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
          <div className={styles.filterGroup}>
            <label>Skills</label>
            <div className={styles.checkboxGroup}>
              {["React", "Node.js", "TypeScript", "AWS", "Python", "SQL"].map(skill => (
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
            <label>Salary Range</label>
            <select
              value={filters.salaryRange}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryRange: e.target.value }))}
            >
              <option value="">Select range</option>
              <option value="₹5L - ₹7L">₹5L - ₹7L</option>
              <option value="₹7L - ₹10L">₹7L - ₹10L</option>
              <option value="₹10L - ₹13L">₹10L - ₹13L</option>
              <option value="₹13L+">₹13L+</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Job Type</label>
            <div className={styles.radioGroup}>
              {["Full-time", "Part-time", "Contract", "Remote"].map(type => (
                <label key={type} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="jobType"
                    value={type}
                    checked={filters.jobType === type}
                    onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <button className={styles.clearBtn} onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div className={styles.contentColumn}>
          <div className={styles.heroBanner}>
            <div className={styles.heroText}>
              <h1>Find Your Dream Job</h1>
              <p>Explore thousands of job opportunities across various industries. Your next career move starts here.</p>
            </div>
            <div className={styles.heroImage}>
              <div className={styles.vrIcon}>🥽</div>
            </div>
          </div>

          <div className={styles.jobsSection}>
            <h2>Jobs Available</h2>
            <div className={styles.jobsColumn}>
              {loading && <div className={styles.loading}>Loading...</div>}
              {error && <div className={styles.error}>{error}</div>}
              {!loading && !error && jobs.length === 0 && (
                <div className={styles.noJobs}>No jobs found matching your criteria.</div>
              )}
              {!loading && !error && jobs.map(job => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobIcon}>💻</div>
                  <div className={styles.jobType}>{job.type}</div>
                  <div className={styles.jobHeader}>
                  <h3>{job.title}</h3>
                  <button className={styles.viewBtn} onClick={() => handleJobClick(job)}>View Details</button>

                  </div>
                  <p className={styles.company}>{job.company}</p>
                  <p className={styles.salary}>{job.salary}</p>
                  <p className={styles.location}>{job.location}</p>
                </div>
              ))}
            </div>
            <div className={styles.pagination}>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  className={`${styles.pageBtn} ${idx + 1 === currentPage ? styles.activePageBtn : ""}`}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="/resources">Resources</a>
          <a href="/legal">Legal</a>
          <a href="/company">Company</a>
        </div>
        <div className={styles.socialIcons}>
          <span>📘</span>
          <span>🐦</span>
          <span>💼</span>
          <span>📷</span>
        </div>
      </footer>
    </div>
  );
};

export default JobListings;
