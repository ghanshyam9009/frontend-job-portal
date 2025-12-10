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
import { Loader, ErrorBox, SkeletonJobCard, JobCard } from "../Components/Shared";

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

  const [error, setError] = useState(null);

  // Fetch government jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
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
        // Fix flickering: set data before setting loading to false
        setJobs(govtJobs);
        setFilteredJobs(govtJobs);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch government jobs:', error);
        setError(error.message || 'Failed to load government jobs');
        setJobs([]);
        setFilteredJobs([]);
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

  const isDark = theme === 'dark';

  return (
    <div className={`${styles.pageContainer} ${isDark ? styles.dark : ''}`}>
      {isAuthenticated ? <CandidateNavbar /> : <HomeNav />}
      <h1 className={styles.title}>Government Jobs</h1>
      <div className={styles.jobList}>
        {loading && <SkeletonJobCard count={5} />}
        
        {!loading && error && (
          <ErrorBox 
            error={error} 
            onRetry={() => window.location.reload()}
            title="Failed to load government jobs"
          />
        )}

        {!loading && !error && filteredJobs.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏛️</div>
            <h3>No government jobs found</h3>
            <p>No government jobs match your current filters.</p>
          </div>
        )}

        {!loading && !error && filteredJobs.map((job) => (
          <JobCard
            key={job.id || job.job_id}
            job={job}
            isDark={isDark}
            showBookmark={false}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default GovernmentJobs;
