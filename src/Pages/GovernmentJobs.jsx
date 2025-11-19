import React, { useState, useEffect } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useAuth } from "../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Building2, Users, Clock } from "lucide-react";
import styles from "../Styles/GovernmentJobs.module.css";
import HomeNav from "../Components/HomeNav";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";
import Footer from "../Components/Footer";
import { candidateExternalService } from "../services";

const GovernmentJobs = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Fetch government jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await candidateExternalService.getAllJobs();
        // Filter for government jobs posted by admin
        const govtJobs = (jobsData?.jobs || []).filter(job =>
          job.posted_by === 'admin' &&
          (job.department_name?.toLowerCase().includes('government') ||
           job.department_name?.toLowerCase().includes('commission') ||
           job.department_name?.toLowerCase().includes('board') ||
           job.department_name?.toLowerCase().includes('railway') ||
           job.department_name?.toLowerCase().includes('police') ||
           job.department_name?.toLowerCase().includes('public sector') ||
           job.department_name?.toLowerCase().includes('psu') ||
           job.department_name?.toLowerCase().includes('central govt') ||
           job.department_name?.toLowerCase().includes('state govt') ||
           job.department_name?.toLowerCase().includes('ministry') ||
           job.department_name?.toLowerCase().includes('department') ||
           job.category?.toLowerCase().includes('government') ||
           job.job_title?.toLowerCase().includes('govt') ||
           job.job_title?.toLowerCase().includes('government') ||
           job.job_title?.toLowerCase().includes('railway') ||
           job.job_title?.toLowerCase().includes('police') ||
           job.job_title?.toLowerCase().includes('upsc') ||
           job.job_title?.toLowerCase().includes('ssc') ||
           job.job_title?.toLowerCase().includes('bank') ||
           job.job_title?.toLowerCase().includes('defense') ||
           job.job_title?.toLowerCase().includes('army') ||
           job.job_title?.toLowerCase().includes('navy') ||
           job.job_title?.toLowerCase().includes('air force'))
        );
        setJobs(govtJobs);
        setFilteredJobs(govtJobs);
      } catch (error) {
        console.error('Failed to fetch government jobs:', error);
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(job =>
        job.department_name.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, departmentFilter, jobs]);

  const handleJobClick = (job) => {
    const jobSlug = job.job_title?.toLowerCase().replace(/\s+/g, '-') || job.id;
    navigate(`/job/${jobSlug}`, {
      state: { job }
    });
  };

  const handleApply = (e, job) => {
    e.stopPropagation(); // Prevent the job card click

    if (!isAuthenticated) {
      // Redirect to candidate login with return path
      navigate('/candidate/login', {
        state: {
          from: `/government-jobs`,
          job: job // Optional: pass job data for post-login flow
        }
      });
      return;
    }

    // If authenticated, proceed with application or redirect to job details
    const jobSlug = job.job_title?.toLowerCase().replace(/\s+/g, '-') || job.id;
    navigate(`/job/${jobSlug}`, {
      state: { job, apply: true }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
        {isAuthenticated ? <CandidateNavbar /> : <HomeNav />}
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      {isAuthenticated ? <CandidateNavbar /> : <HomeNav />}
      <h1 className={styles.title}>Government Jobs</h1>
      <div className={styles.jobList}>
        {filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏛️</div>
            <h3>No government jobs found</h3>
            <p>No government jobs match your current filters.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id || job.job_id} className={styles.jobCard} onClick={() => handleJobClick(job)}>
              <h2 className={styles.jobTitle}>{job.job_title || 'N/A'}</h2>
              <p className={styles.department}>{job.department_name || 'N/A'}</p>
              <div className={styles.details}>
                <p className={styles.location}>{job.location || 'N/A'}</p>
                <button className={styles.applyButton} onClick={(e) => handleApply(e, job)}>Apply Now</button>
              </div>
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GovernmentJobs;
