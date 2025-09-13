import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from  "./JobListings.module.css";
import HomeNav from "../Components/HomeNav";

const JobListings = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    location: "",
    skills: ["React"],
    salaryRange: "₹7L - ₹10L",
    jobType: "Full-time"
  });

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
      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarNav}>
            <div className={styles.navItem}>Dashboard</div>
            <div className={`${styles.navItem} ${styles.active}`}>Job Listings</div>
            <div className={styles.navItem}>Applications</div>
            <div className={styles.navItem}>Messages</div>
            <div className={styles.navItem}>Settings</div>
            <div className={styles.navItem}>Support</div>
            <div className={styles.navItem}>Logout</div>
          </div>

          <div className={styles.filters}>
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
        </div>

        <div className={styles.content}>
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
            <div className={styles.jobsGrid}>
              {jobs.map(job => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobIcon}>{job.icon}</div>
                  <div className={styles.jobType}>{job.type}</div>
                  <h3>{job.title}</h3>
                  <p className={styles.company}>{job.company}</p>
                  <p className={styles.salary}>{job.salary}</p>
                  <p className={styles.location}>{job.location}</p>
                  <button className={styles.viewBtn} onClick={() => handleJobClick(job)}>View Details</button>
                </div>
              ))}
            </div>

            <div className={styles.pagination}>
              <button className={styles.pageBtn}>1</button>
              <button className={styles.pageBtn}>2</button>
              <button className={styles.pageBtn}>3</button>
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

