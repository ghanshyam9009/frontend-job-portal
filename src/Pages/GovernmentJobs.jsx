import React, { useState, useEffect } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Building2, Users, Clock } from "lucide-react";
import styles from "../Styles/GovernmentJobs.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";

const GovernmentJobs = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Mock government jobs data
  useEffect(() => {
    const mockGovtJobs = [
      {
        id: "govt-1",
        job_title: "SSC CGL 2025 Notification",
        description: "Recruitment for various Group B & C posts in different ministries and departments.",
        location: "India",
        salary_range: "₹44,900 - ₹1,42,400",
        employment_type: "Full-time",
        department_name: "Staff Selection Commission",
        application_deadline: "2025-12-31",
        contact_email: "ssc@nic.in",
        posted_date: "2025-01-15",
        status: "Open",
        total_posts: 7500,
        application_fee: "₹100"
      },
      {
        id: "govt-2",
        job_title: "IBPS PO 2025",
        description: "Probationary Officer recruitment in various public sector banks.",
        location: "Pan India",
        salary_range: "₹36,000 - ₹63,840",
        employment_type: "Full-time",
        department_name: "Institute of Banking Personnel Selection",
        application_deadline: "2025-03-15",
        contact_email: "ibps@ibps.in",
        posted_date: "2025-01-10",
        status: "Open",
        total_posts: 4000,
        application_fee: "₹850"
      },
      {
        id: "govt-3",
        job_title: "Railway Recruitment Board - NTPC",
        description: "Non-Technical Popular Categories recruitment in Indian Railways.",
        location: "All India",
        salary_range: "₹19,900 - ₹35,400",
        employment_type: "Full-time",
        department_name: "Railway Recruitment Board",
        application_deadline: "2025-04-30",
        contact_email: "rrb@railnet.gov.in",
        posted_date: "2025-01-05",
        status: "Open",
        total_posts: 35000,
        application_fee: "₹500"
      },
      {
        id: "govt-4",
        job_title: "UPSC Civil Services 2025",
        description: "Indian Administrative Service, Indian Police Service, and other Group A services.",
        location: "India",
        salary_range: "₹56,100 - ₹2,50,000",
        employment_type: "Full-time",
        department_name: "Union Public Service Commission",
        application_deadline: "2025-02-21",
        contact_email: "upsc@nic.in",
        posted_date: "2024-12-20",
        status: "Open",
        total_posts: 1056,
        application_fee: "₹100"
      },
      {
        id: "govt-5",
        job_title: "Defence Research and Development Organisation",
        description: "Scientist and Engineer positions in DRDO laboratories.",
        location: "Various Locations",
        salary_range: "₹67,700 - ₹2,08,700",
        employment_type: "Full-time",
        department_name: "DRDO",
        application_deadline: "2025-03-10",
        contact_email: "recruitment@drdo.in",
        posted_date: "2025-01-12",
        status: "Open",
        total_posts: 300,
        application_fee: "₹100"
      }
    ];

    setTimeout(() => {
      setJobs(mockGovtJobs);
      setFilteredJobs(mockGovtJobs);
      setLoading(false);
    }, 1000);
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

  const handleJobClick = (jobId) => {
    navigate(`/government-job/${jobId}`);
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
        {filteredJobs.map((job) => (
          <div key={job.id} className={styles.jobCard} onClick={() => handleJobClick(job.id)}>
            <h2 className={styles.jobTitle}>{job.job_title}</h2>
            <p className={styles.department}>{job.department_name}</p>
            <div className={styles.details}>
              <p className={styles.location}>{job.location}</p>
              <button className={styles.applyButton}>Apply Now</button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default GovernmentJobs;
