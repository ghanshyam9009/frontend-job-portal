import React, { useState, useEffect } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Building2, Users, Clock } from "lucide-react";
import styles from "../Styles/GovernmentJobs.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
import { candidateExternalService } from "../services";

const GovernmentJobs = () => {
  const { theme } = useTheme();
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
        // Filter for government jobs based on department_name or category
        const govtJobs = (jobsData?.jobs || []).filter(job =>
          job.department_name?.toLowerCase().includes('government') ||
          job.department_name?.toLowerCase().includes('commission') ||
          job.department_name?.toLowerCase().includes('board') ||
          job.category?.toLowerCase().includes('government') ||
          job.job_title?.toLowerCase().includes('govt') ||
          job.job_title?.toLowerCase().includes('government')
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
        <HomeNav />
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />
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
                <button className={styles.applyButton}>Apply Now</button>
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
