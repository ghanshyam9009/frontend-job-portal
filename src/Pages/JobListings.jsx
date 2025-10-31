import React, { useState, useEffect } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { Search, MapPin, Filter } from "lucide-react";
import styles from "./JobListings.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
import { jobService } from "../services/jobService";
import { showError } from "../utils/errorHandler";
import { candidateExternalService } from "../services/candidateExternalService";
import { candidateService } from "../services/candidateService";

const JobListings = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
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
    experienceLevel: "",
    category: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 7;

  useEffect(() => {
    fetchJobs();
  }, [currentPage, filters, querySearch, queryLocation]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the general jobs API endpoint
      const apiUrl = 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
      const searchParams = {
        page: currentPage,
        limit: jobsPerPage,
        status: 'approved', // Only fetch approved jobs
        ...(querySearch && { keyword: querySearch }),
        ...(queryLocation && { location: queryLocation }),
        ...(filters.jobType && { employment_type: filters.jobType }),
        ...(filters.experienceLevel && { experience_level: filters.experienceLevel }),
        ...(filters.skills.length > 0 && { skills: filters.skills.join(',') }),
        ...(filters.category && { category: filters.category }),
        ...(filters.salaryRange && { salary_range: filters.salaryRange })
      };

      // Remove empty values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === undefined || searchParams[key] === "" || searchParams[key] === null) {
          delete searchParams[key];
        }
      });

      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${apiUrl}?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jobsData = await response.json();

      if (jobsData.jobs || Array.isArray(jobsData)) {
        const jobsArray = jobsData.jobs || jobsData.data || jobsData;
        const validJobs = Array.isArray(jobsArray) ? jobsArray : [];

        // Sort: Premium jobs first, then latest jobs on top
        validJobs.sort((a, b) => {
          if ((a.is_premium || false) && !(b.is_premium || false)) return -1;
          if (!(a.is_premium || false) && (b.is_premium || false)) return 1;
          const dateA = new Date(a.created_at || a.posted_date || 0);
          const dateB = new Date(b.created_at || b.posted_date || 0);
          return dateB - dateA;
        });

        // Debug: Check if any jobs are premium
        const premiumJobs = validJobs.filter(job => job.is_premium);
        console.log('Total jobs:', validJobs.length);
        console.log('Premium jobs:', premiumJobs.length);
        if (premiumJobs.length > 0) {
          console.log('Premium job IDs:', premiumJobs.map(job => job.job_id || job.id));
        }

        setJobs(validJobs);
        setTotalJobs(jobsData.count || validJobs.length || 0);
        setTotalPages(Math.max(1, Math.ceil((jobsData.count || validJobs.length || 0) / jobsPerPage)));
      } else {
        throw new Error(jobsData.message || 'Failed to fetch jobs');
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
      experienceLevel: "",
      category: ""
    });
    setCurrentPage(1);
  };

  const handleJobClick = (job) => {
    const jobSlug = job.job_title?.toLowerCase().replace(/\s+/g, '-') || job.id;
    navigate(`/job/${jobSlug}`, {
      state: { job }
    });
  };

  const handleSaveJob = async (job) => {
    try {
      if (!isAuthenticated || !user) {
        alert('Please log in to save jobs.');
        navigate('/candidate/login');
        return;
      }
      
      const userId = user.user_id || user.id;
      if (!userId) {
        alert('User ID not found. Please log in again.');
        navigate('/candidate/login');
        return;
      }

      await candidateExternalService.bookmarkJob({ 
        user_id: userId, 
        job_id: job.job_id || job.id 
      });
      
      alert('Job saved successfully!');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
    }
  };

  // const handleMarkJobPremium = async (job) => {
  //   try {
  //     if (!isAuthenticated || !user) {
  //       alert('Please log in to mark jobs as premium.');
  //       return;
  //     }

  //     // Check if user is recruiter or admin
  //     if (user.role !== 'recruiter' && user.role !== 'admin') {
  //       alert('Only recruiters and admins can mark jobs as premium.');
  //       return;
  //     }

  //     await candidateService.markJobPremium({
  //       job_id: job.job_id || job.id,
  //       is_premium: true,
  //       category: 'job'
  //     });

  //     alert('Job marked as premium successfully!');
  //     // Optionally, refresh jobs or update state
  //   } catch (error) {
  //     console.error('Error marking job as premium:', error);
  //     alert('Failed to mark job as premium. Please try again.');
  //   }
  // };

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

      {/* Search Bar Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <div className={styles.searchInputGroup}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Job Title, Keyword"
                className={styles.searchInput}
                value={querySearch}
                onChange={(e) => {
                  const newSearch = e.target.value;
                  const params = new URLSearchParams(locationHook.search);
                  if (newSearch) {
                    params.set('search', newSearch);
                  } else {
                    params.delete('search');
                  }
                  navigate({ search: params.toString() });
                }}
              />
            </div>

            <div className={styles.searchInputGroup}>
              <MapPin className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Enter Location"
                className={styles.searchInput}
                value={queryLocation}
                onChange={(e) => {
                  const newLocation = e.target.value;
                  const params = new URLSearchParams(locationHook.search);
                  if (newLocation) {
                    params.set('location', newLocation);
                  } else {
                    params.delete('location');
                  }
                  navigate({ search: params.toString() });
                }}
              />
            </div>

            <button
              className={styles.filterButton}
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              <Filter className={styles.filterIcon} />
              Filter
            </button>

            <button className={styles.searchButton}>
              Search Job
            </button>
          </div>

          {/* Popular Tags */}
          <div className={styles.popularTags}>
            <span className={styles.popularLabel}>Popular Tag:</span>
            <div className={styles.tagsList}>
              {["#Back office Job", "#SalesJobs", "Business Development", "Computer - Knowledge Of Billing Excel&More", "Accounting", "Telecalling-Job-Bpo & All Sector", "Counter sales Job", "HR Recruiter", "Tally"].map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel Overlay */}
      {isFilterVisible && (
        <div className={styles.filterOverlay} onClick={() => setIsFilterVisible(false)}>
          <div className={styles.filterPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.filterHeader}>
              <h3>Filter</h3>
              <button
                className={styles.closeFilterBtn}
                onClick={() => setIsFilterVisible(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.filterContent}>
              <div className={styles.filterGroup}>
                <label>Job Type</label>
                <div className={styles.radioGroup}>
                  {["Full Time", "Part Time", "Contractual", "Intern", "Freelance", "Night Shift"].map(type => (
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
                <label>Category</label>
                <select
                  className={styles.categorySelect}
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Accounting, Data Entry">Accounting, Data Entry</option>
                  <option value="Accounts & Finance">Accounts & Finance</option>
                  <option value="Administration">Administration</option>
                  <option value="Administrative & Office Support">Administrative & Office Support</option>
                  <option value="Auto Mobile Sector">Auto Mobile Sector</option>
                  <option value="Automobile Industry">Automobile Industry</option>
                  <option value="Automotive Diagnostics">Automotive Diagnostics</option>
                  <option value="Automotive, Evaluation">Automotive, Evaluation</option>
                  <option value="Back Office Jobs">Back Office Jobs</option>
                  <option value="Back Office and Sales">Back Office and Sales</option>
                  <option value="Banking Sector">Banking Sector</option>
                  <option value="Beauty & Wellness, Hairdressing">Beauty & Wellness, Hairdressing</option>
                  <option value="Beauty Industry/Telecaller & Receptionist in Beauty Industry">Beauty Industry/Telecaller & Receptionist in Beauty Industry</option>
                  <option value="Bpo & kpo - Sector">Bpo & kpo - Sector</option>
                  <option value="Broking Firm">Broking Firm</option>
                  <option value="Construction">Construction</option>
                  <option value="Counseling Jobs">Counseling Jobs</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Customer Service and Telesales">Customer Service and Telesales</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Data Entry/ Administration">Data Entry/ Administration</option>
                  <option value="Delivery Services">Delivery Services</option>
                  <option value="Design/Creative">Design/Creative</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Distributor/Super Stockist">Distributor/Super Stockist</option>
                  <option value="Driving/Motor Technician">Driving/Motor Technician</option>
                  <option value="Education, Teaching">Education, Teaching</option>
                  <option value="Electronic Repair, Electronics Technician, Industrial Electronics">Electronic Repair, Electronics Technician, Industrial Electronics</option>
                  <option value="Energy/Solar Power / Consultation & Etc">Energy/Solar Power / Consultation & Etc</option>
                  <option value="Engineer/Architects">Engineer/Architects</option>
                  <option value="Engineering / Manufacturing">Engineering / Manufacturing</option>
                  <option value="Engineering/Design">Engineering/Design</option>
                  <option value="FInancial Consultancy">FInancial Consultancy</option>
                  <option value="FMCG Sales industry">FMCG Sales industry</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Finance & Banking">Finance & Banking</option>
                  <option value="Finance/Administration">Finance/Administration</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Garments/Textile">Garments/Textile</option>
                  <option value="Glass industry">Glass industry</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="HR/Recruitment">HR/Recruitment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Helper">Helper</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="IT & Technology">IT & Technology</option>
                  <option value="IT & Telecommunication">IT & Telecommunication</option>
                  <option value="IT/Computer/Mis/System Work">IT/Computer/Mis/System Work</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Insurance, Sales">Insurance, Sales</option>
                  <option value="Internship">Internship</option>
                  <option value="Laboratories">Laboratories</option>
                  <option value="Law/Legal/Immigration Consultant,Legal Assistant">Law/Legal/Immigration Consultant,Legal Assistant</option>
                  <option value="Logistics and Supply Chain">Logistics and Supply Chain</option>
                  <option value="Logistics, Packaging">Logistics, Packaging</option>
                  <option value="Management">Management</option>
                  <option value="Manufacturer & Supplier">Manufacturer & Supplier</option>
                  <option value="Manufacturer of Polycarbonate">Manufacturer of Polycarbonate</option>
                  <option value="Manufacturing, Operations">Manufacturing, Operations</option>
                  <option value="Marketing & Media">Marketing & Media</option>
                  <option value="Marketing Jobs">Marketing Jobs</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Mechanical Fitter">Mechanical Fitter</option>
                  <option value="Media & Entertainment">Media & Entertainment</option>
                  <option value="Medical/Pharma/pharmaceutica">Medical/Pharma/pharmaceutica</option>
                  <option value="Operations, Management">Operations, Management</option>
                  <option value="Others">Others</option>
                  <option value="Packaging Industries">Packaging Industries</option>
                  <option value="Packers & Movers">Packers & Movers</option>
                  <option value="Production/Manufacturing">Production/Manufacturing</option>
                  <option value="Quality Control/Inventory Jobs">Quality Control/Inventory Jobs</option>
                  <option value="Real Rstates">Real Rstates</option>
                  <option value="Real State Valuation">Real State Valuation</option>
                  <option value="Restaurant, Cafe, Food Service">Restaurant, Cafe, Food Service</option>
                  <option value="Retail industry services">Retail industry services</option>
                  <option value="Sales & Business Development">Sales & Business Development</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Sales & Marketing, Retail">Sales & Marketing, Retail</option>
                  <option value="Sales Jobs">Sales Jobs</option>
                  <option value="Sales, Marketing, Back Office">Sales, Marketing, Back Office</option>
                  <option value="Sales, Marketing, Design, E-commerce">Sales, Marketing, Design, E-commerce</option>
                  <option value="School/College">School/College</option>
                  <option value="Security Services">Security Services</option>
                  <option value="Service & Housekeeping">Service & Housekeeping</option>
                  <option value="Service & Trading">Service & Trading</option>
                  <option value="Software Operation">Software Operation</option>
                  <option value="Supervision Inspection Monitoring">Supervision Inspection Monitoring</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Support Staff/Office Services/Office Boy">Support Staff/Office Services/Office Boy</option>
                  <option value="Tax Consultants (Law Firm ) Legal Services">Tax Consultants (Law Firm ) Legal Services</option>
                  <option value="Technical">Technical</option>
                  <option value="Transport /Logistics">Transport /Logistics</option>
                  <option value="Transportation, Driving Jobs">Transportation, Driving Jobs</option>
                  <option value="Welding and Fabrication">Welding and Fabrication</option>
                  <option value="Workshop">Workshop</option>
                  <option value="kpo">kpo</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Salary Range</label>
                <select
                  className={styles.salarySelect}
                  value={filters.salaryRange}
                  onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
                >
                  <option value="">Any Salary</option>
                  <option value="0-3">₹0 - ₹3L</option>
                  <option value="3-5">₹3L - ₹5L</option>
                  <option value="5-7">₹5L - ₹7L</option>
                  <option value="7-10">₹7L - ₹10L</option>
                  <option value="10-15">₹10L - ₹15L</option>
                  <option value="15+">₹15L+</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" />
                    Remote Jobs Only
                  </label>
                </div>
              </div>

              <div className={styles.filterActions}>
                <button className={styles.applyFilterBtn} onClick={() => setIsFilterVisible(false)}>
                  Apply Filters
                </button>
                <button className={styles.clearFilterBtn} onClick={clearFilters}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.mainContentNoSidebar} >
        <div className={styles.filtersResponsive}>
          <div className={styles.heroBanner}>
            <div className={styles.heroText}>
              <h1>Featured Jobs</h1>
              <p>Discover opportunities that match your skills</p>
            </div>
          </div>

          {/* Attractive Content */}
          <div className={styles.sidebarContent}>
            <div className={styles.sidebarSection}>
              <h3>Top Job Categories</h3>
              <ul className={styles.categoryList}>
                <li>Technology</li>
                <li>Finance</li>
                <li>Healthcare</li>
                <li>Marketing</li>
                <li>Sales</li>
              </ul>
            </div>



            <div className={styles.sidebarSection}>
              <h3>Quick Tips</h3>
              <ul className={styles.tipsList}>
                <li>Update your profile for better matches</li>
                <li>Apply early for better chances</li>
                <li>Customize your resume for each job</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.contentColumn}>
          <div className={styles.jobsSection}>
            <div className={styles.jobHeader}>
              <h2>Featured Jobs</h2>
              <div className={styles.jobsInfo}>
                Showing {Math.min((currentPage - 1) * jobsPerPage + 1, totalJobs)} - {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} jobs
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
                  {job.is_premium && (
                    <div className={styles.premiumBadge}>
                      <span className={styles.premiumCrown}>👑</span>
                      Premium
                    </div>
                  )}
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
                          <span>{job.experience_required.min_years} - {job.experience_required.max_years} years</span>
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
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/candidate/login');
                        } else {
                          handleJobClick(job);
                        }
                      }}
                    >
                      Apply Now
                    </button>
                    <button 
                      className={styles.saveBtn}
                      onClick={() => handleSaveJob(job)}
                    >
                      Save Job
                    </button>
                    {/* {(user?.role === 'recruiter' || user?.role === 'admin') && (
                      <button 
                        className={styles.premiumBtn}
                        onClick={() => handleMarkJobPremium(job)}
                      >
                        Mark Premium
                      </button>
                    )} */}
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
