import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./JobListings.module.css";
import HomeNav from "../Components/HomeNav";

const JobListings = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    location: "",
    skills: [],
    salaryRange: "",
    jobType: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "InnovateX",
      salary: "₹12L-₹15L/year",
      location: "Remote-Worldwide",
      type: "Full-time",
      icon: "💻"
    },
    {
      id: 2,
      title: "Data Scientist (Machine Learning)",
      company: "Quantify Analytics",
      salary: "₹13L-₹16L/year",
      location: "San Francisco, CA",
      type: "Full-time",
      icon: "📊"
    },
    {
      id: 3,
      title: "UX/UI Designer",
      company: "Creative Flow",
      salary: "₹9L-₹11L/year",
      location: "New York, NY",
      type: "Full-time",
      icon: "🎨"
    },
    {
      id: 4,
      title: "Backend Engineer (Node.js)",
      company: "ServerLogic",
      salary: "₹11L-₹14L/year",
      location: "Seattle, WA",
      type: "Full-time",
      icon: "⚙️"
    },
    {
      id: 5,
      title: "Product Manager",
      company: "Visionary Solutions",
      salary: "₹14L-₹17L/year",
      location: "Remote-Europe",
      type: "Full-time",
      icon: "📋"
    },
    {
      id: 6,
      title: "DevOps Engineer",
      company: "CloudWorks",
      salary: "₹12.5L-₹15.5L/year",
      location: "Austin, TX",
      type: "Full-time",
      icon: "☁️"
    },
    {
      id: 7,
      title: "Mobile App Developer",
      company: "AppGenius",
      salary: "₹10.5L-₹13.5L/year",
      location: "Remote-Asia",
      type: "Full-time",
      icon: "📱"
    },
    {
      id: 8,
      title: "Cybersecurity Analyst",
      company: "SecureNet",
      salary: "₹9.5L-₹12L/year",
      location: "Boston, MA",
      type: "Full-time",
      icon: "🔒"
    }
  ];

  // Filtering logic
  const filteredJobs = jobs.filter(job => {
    const matchesLocation =
      !filters.location ||
      job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesSkills =
      filters.skills.length === 0 ||
      filters.skills.some(skill =>
        job.title.toLowerCase().includes(skill.toLowerCase())
      );
    const matchesSalary =
      !filters.salaryRange ||
      job.salary.includes(filters.salaryRange.replace("₹", ""));
    const matchesType =
      !filters.jobType || job.type === filters.jobType || (filters.jobType === "Remote" && job.location.toLowerCase().includes("remote"));
    return matchesLocation && matchesSkills && matchesSalary && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
              {paginatedJobs.length === 0 && (
                <div className={styles.noJobs}>No jobs found matching your criteria.</div>
              )}
              {paginatedJobs.map(job => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobIcon}>{job.icon}</div>
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