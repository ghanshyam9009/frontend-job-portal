import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { Search, MapPin, Filter, ChevronDown, Briefcase, Bookmark, Clock, Building2, DollarSign, Crown } from "lucide-react";
import styles from "./JobListings.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
import { jobService } from "../services/jobService";
import { showError } from "../utils/errorHandler";
import { candidateExternalService } from "../services/candidateExternalService";
import { candidateService } from "../services/candidateService";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";
import { Loader, ErrorBox, SkeletonJobCard, JobCard } from "../Components/Shared";
import RecruiterNavbar from "../Components/Recruiter/RecruiterNavbar";
import vacancy1 from "../assets/vacancy1.jpeg";

const JobListings = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const navigate = useNavigate();
  const locationHook = useLocation();
  const [querySearch, setQuerySearch] = useState("");
  const [queryLocation, setQueryLocation] = useState("");
 
  useEffect(() => {
    const params = new URLSearchParams(locationHook.search);
    setQuerySearch(params.get("search") || "");
    setQueryLocation(params.get("location") || "");
  }, [locationHook.search]);

  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Autocomplete states
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableJobTypes, setAvailableJobTypes] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredJobTypes, setFilteredJobTypes] = useState([]);
  
  const searchRef = useRef(null);
  const locationRef = useRef(null);

  const [filters, setFilters] = useState({
    location: "",
    skills: [],
    salaryRange: "",
    jobType: "",
    experienceLevel: "",
    category: "",
    remoteOnly: false
  });

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 25;

  // Theme-based styling - COMPACT
  const isDark = false;
  const bgPrimary = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-900';
  const textSecondary1 = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBorder = isDark ? 'hover:border-blue-500' : 'hover:border-blue-400';
  const inputBg = isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-700';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  useEffect(() => {
    fetchJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, filters, querySearch, queryLocation]);

  // Load user's saved jobs
  useEffect(() => {
    const fetchBookmarkedJobs = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const userId = user.user_id || user.id;
        if (!userId) return;

        const data = await candidateExternalService.getBookmarkedJobs(userId);
        const bookmarked = (data?.jobs || data?.bookmarkedJobs || []).map(job =>
          job.job_id || job.id
        );
        setBookmarkedJobs(new Set(bookmarked));
      } catch (error) {
        console.error('Error fetching bookmarked jobs:', error);
      }
    };

    fetchBookmarkedJobs();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (queryLocation.trim()) {
      const filtered = availableLocations.filter(loc =>
        loc.toLowerCase().includes(queryLocation.toLowerCase())
      );
      setFilteredLocations(filtered.slice(0, 10));
      setShowLocationDropdown(filtered.length > 0);
    } else {
      setFilteredLocations([]);
      setShowLocationDropdown(false);
    }
  }, [queryLocation, availableLocations]);

  useEffect(() => {
    if (querySearch.trim()) {
      const filtered = availableJobTypes.filter(type =>
        type.toLowerCase().includes(querySearch.toLowerCase())
      );
      setFilteredJobTypes(filtered.slice(0, 10));
      setShowSearchDropdown(filtered.length > 0);
    } else {
      setFilteredJobTypes([]);
      setShowSearchDropdown(false);
    }
  }, [querySearch, availableJobTypes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (jobType) => {
    setQuerySearch(jobType);
    const params = new URLSearchParams(locationHook.search);
    params.set('search', jobType);
    navigate({ search: params.toString() }, { replace: true });
    setShowSearchDropdown(false);
    setCurrentPage(1);
  };

  const handleLocationSelect = (location) => {
    setQueryLocation(location);
    const params = new URLSearchParams(locationHook.search);
    params.set('location', location);
    setShowLocationDropdown(false);
    setCurrentPage(1);
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
      const searchParams = {
        status: 'approved',
        ...(querySearch && { keyword: querySearch }),
        ...(queryLocation && { location: queryLocation }),
      };

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
          let jobsArray = jobsData.jobs || jobsData.data || jobsData;
          // Filter out government jobs for the job listings page
          let allJobsData = (Array.isArray(jobsArray) ? jobsArray : []).filter(job => job.job_type !== "GOVERNMENT");

        const locations = [...new Set(allJobsData.map(job => job.location).filter(Boolean))].sort();
        const jobTypes = [...new Set(allJobsData.map(job => job.job_title).filter(Boolean))].sort();

        setAvailableLocations(locations);
        setAvailableJobTypes(jobTypes);
        setAllJobs(allJobsData);

        let filteredJobs = allJobsData;

        if (querySearch) {
          const searchLower = querySearch.toLowerCase();
          filteredJobs = filteredJobs.filter(job => 
            job.job_title?.toLowerCase().includes(searchLower) ||
            job.company_name?.toLowerCase().includes(searchLower) ||
            job.description?.toLowerCase().includes(searchLower) ||
            job.skills_required?.some(skill => skill.toLowerCase().includes(searchLower))
          );
        }

        if (queryLocation) {
          const locationLower = queryLocation.toLowerCase();
          filteredJobs = filteredJobs.filter(job => 
            job.location?.toLowerCase().includes(locationLower)
          );
        }

        if (filters.jobType) {
          filteredJobs = filteredJobs.filter(job => {
            if (!job.employment_type) return true;
            const jobType = job.employment_type.toLowerCase().trim();
            const filterType = filters.jobType.toLowerCase().trim();
            const normalizeType = (type) => type.replace(/[-\s]/g, '');
            return normalizeType(jobType) === normalizeType(filterType) ||
                   jobType.includes(filterType) ||
                   filterType.includes(jobType);
          });
        }

        if (filters.category) {
          filteredJobs = filteredJobs.filter(job => {
            if (!job.category) return true;
            const jobCategory = job.category.toLowerCase().trim();
            const filterCategory = filters.category.toLowerCase().trim();
            return jobCategory.includes(filterCategory) || filterCategory.includes(jobCategory);
          });
        }

        if (filters.skills.length > 0) {
          filteredJobs = filteredJobs.filter(job => {
            if (!job.skills_required || job.skills_required.length === 0) return true;
            return filters.skills.some(filterSkill => {
              const filterSkillLower = filterSkill.toLowerCase().trim();
              return job.skills_required.some(jobSkill => {
                const jobSkillLower = jobSkill.toLowerCase().trim();
                return jobSkillLower.includes(filterSkillLower) ||
                       filterSkillLower.includes(jobSkillLower) ||
                       jobSkillLower.replace(/[.\-\s]/g, '') === filterSkillLower.replace(/[.\-\s]/g, '');
              });
            });
          });
        }

        if (filters.salaryRange) {
          filteredJobs = filteredJobs.filter(job => {
            if (!job.salary_range) return false;
            const [minStr, maxStr] = filters.salaryRange.split('-');
            const filterMin = parseFloat(minStr) * 100000;
            const filterMax = maxStr ? (maxStr.includes('+') ? Infinity : parseFloat(maxStr) * 100000) : Infinity;

            let jobSalaryMin = 0;
            let jobSalaryMax = 0;

            if (typeof job.salary_range === 'object') {
              jobSalaryMin = parseFloat(job.salary_range.min) || 0;
              jobSalaryMax = parseFloat(job.salary_range.max) || jobSalaryMin;
            } else if (typeof job.salary_range === 'string') {
              const matches = job.salary_range.match(/(\d+\.?\d*)/g);
              if (matches && matches.length >= 2) {
                jobSalaryMin = parseFloat(matches[0]);
                jobSalaryMax = parseFloat(matches[1]);
                if (jobSalaryMax < 1000) {
                  jobSalaryMin *= 100000;
                  jobSalaryMax *= 100000;
                }
              } else if (matches && matches.length === 1) {
                jobSalaryMax = parseFloat(matches[0]);
                if (jobSalaryMax < 1000) {
                  jobSalaryMax *= 100000;
                }
                jobSalaryMin = jobSalaryMax;
              }
            } else if (typeof job.salary_range === 'number') {
              jobSalaryMax = job.salary_range;
              jobSalaryMin = jobSalaryMax;
            }

            return (jobSalaryMax >= filterMin && jobSalaryMin <= filterMax) ||
                   (jobSalaryMin >= filterMin && jobSalaryMin <= filterMax);
          });
        }

        if (filters.experienceLevel) {
          filteredJobs = filteredJobs.filter(job => {
            if (!job.experience_level) return true;
            const jobExpLevel = job.experience_level.toLowerCase().trim();
            const filterExpLevel = filters.experienceLevel.toLowerCase().trim();
            return jobExpLevel.includes(filterExpLevel) || 
                   filterExpLevel.includes(jobExpLevel) ||
                   jobExpLevel.replace(/[-\s]/g, '') === filterExpLevel.replace(/[-\s]/g, '');
          });
        }

        filteredJobs.sort((a, b) => {
          if ((a.is_premium || false) && !(b.is_premium || false)) return -1;
          if (!(a.is_premium || false) && (b.is_premium || false)) return 1;
          const dateA = new Date(a.created_at || a.posted_date || 0);
          const dateB = new Date(b.created_at || b.posted_date || 0);
          return dateB - dateA;
        });

        // Map jobs to include is_premium field (similar to HomePage.jsx)
        const mappedJobs = filteredJobs.map((j) => ({
          id: j.job_id || j.id,
          job_id: j.job_id || j.id,
          job_title: j.job_title,
          title: j.job_title,
          company_name: j.company_name || "",
          company_logo: j.company_logo || j.logo || j.companyLogo || null,
          job_logo_url: j.job_logo_url || null, // Include job-specific logo URL
          company: j.company_name || "",
          salary_range: j.salary_range,
          salary: j.salary_range ?
            (typeof j.salary_range === 'string' ?
              j.salary_range :
              `₹${j.salary_range.min} - ₹${j.salary_range.max}`)
            : "Salary not specified",
          location: j.location || "",
          employment_type: j.employment_type || "Full-time",
          type: j.employment_type || "Full-time",
          is_premium: j.premium_job || j.is_premium || false,
          created_at: j.created_at || j.posted_date,
          posted_date: j.posted_date,
          description: j.description || "",
          skills_required: j.skills_required || []
        }));

        const totalCount = mappedJobs.length;
        const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / jobsPerPage));
        const startIndex = (currentPage - 1) * jobsPerPage;
        const endIndex = startIndex + jobsPerPage;
        const paginatedJobs = mappedJobs.slice(startIndex, endIndex);

        // Fix flickering: set data before setting loading to false
        setJobs(paginatedJobs);
        setTotalJobs(totalCount);
        setTotalPages(calculatedTotalPages);
        setLoading(false);
      } else {
        throw new Error(jobsData.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      showError(err, 'Failed to fetch jobs. Please try again later.');
      setError('Failed to fetch jobs. Please try again later.');
      setJobs([]);
      setTotalJobs(0);
      setTotalPages(1);
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
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      skills: [],
      salaryRange: "",
      jobType: "",
      experienceLevel: "",
      category: "",
      remoteOnly: false
    });
    setCurrentPage(1);
  };

  const handleJobClick = (job) => {
    const jobSlug = job.job_title?.toLowerCase().replace(/\s+/g, '-') || job.id;
    navigate(`/job/${jobSlug}`, {
      state: { job }
    });
  };

  const toggleBookmark = async (jobId) => {
    if (!isAuthenticated || !user) {
      alert('Please log in to bookmark jobs.');
      navigate('/candidate/login');
      return;
    }

    try {
      const userId = user.user_id || user.id;
      if (!userId) {
        alert('User ID not found. Please log in again.');
        navigate('/candidate/login');
        return;
      }

      const newBookmarked = new Set(bookmarkedJobs);
      const isCurrentlyBookmarked = newBookmarked.has(jobId);

      if (isCurrentlyBookmarked) {
        // Remove bookmark from UI optimistically
        newBookmarked.delete(jobId);
        setBookmarkedJobs(newBookmarked);
        console.log('Job removed from bookmarks');
      } else {
        // Add bookmark
        await candidateExternalService.bookmarkJob({
          user_id: userId,
          job_id: jobId,
          action: 1
        });
        newBookmarked.add(jobId);
        setBookmarkedJobs(newBookmarked);
        console.log('Job bookmarked successfully');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to bookmark job. Please try again.');
    }
  };


  // COMPACT Filter Content
  const FilterContent = () => (
    <div className="space-y-5">
      {/* Job Type - Compact */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-2 text-sm flex items-center gap-1.5`}>
          <Filter className="w-3.5 h-3.5 text-blue-600" /> Job Type
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {["Full Time", "Part Time", "Contractual", "Intern", "Freelance", "Night Shift"].map((type) => (
            <label
              key={type}
              className={`flex items-center gap-1.5 text-xs rounded-md px-2 py-1.5 border transition-all cursor-pointer ${
                filters.jobType === type
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : `${borderColor} hover:bg-opacity-50`
              }`}
            >
              <input
                type="radio"
                name="jobType"
                value={type}
                checked={filters.jobType === type}
                onChange={(e) => handleFilterChange("jobType", e.target.value)}
                className="accent-blue-600 w-3 h-3"
              />
              <span className={filters.jobType === type ? "text-blue-700" : textPrimary}>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category - Compact */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-2 text-sm flex items-center gap-1.5`}>
          <Bookmark className="w-3.5 h-3.5 text-blue-600" /> Category
        </h3>
        <div className="relative">
          <select
            className={`w-full appearance-none border ${inputBorder} rounded-md py-1.5 px-2.5 text-xs ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
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
                  <option value="Mechanical Fitter">Mechanical Fitter</option>                   <option value="Media & Entertainment">Media & Entertainment</option>
                  <option value="Medical/Pharma/pharmaceutica">Medical/Pharma/pharmaceutica</option>
                  <option value="Operations, Management">Operations, Management</option>
                  <option value="Others">Others</option>
                  <option value="Packaging Industries">Packaging Industries</option>
                  <option value="Packers & Movers">Packers & Movers</option>                   <option value="Production/Manufacturing">Production/Manufacturing</option>
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
          <ChevronDown className={`absolute right-2 top-1.5 w-3.5 h-3.5 ${textSecondary} pointer-events-none`} />
        </div>
      </div>

      {/* Experience Level - Compact */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-2 text-sm flex items-center gap-1.5`}>
          <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Experience Level
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {["Fresher", "Entry Level", "Mid Level", "Senior Level", "Expert"].map((level) => (
            <label
              key={level}
              className={`flex items-center gap-1.5 text-xs rounded-md px-2 py-1.5 border transition-all cursor-pointer ${
                filters.experienceLevel === level
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : `${borderColor} hover:bg-opacity-50`
              }`}
            >
              <input
                type="radio"
                name="experienceLevel"
                value={level}
                checked={filters.experienceLevel === level}
                onChange={(e) => handleFilterChange("experienceLevel", e.target.value)}
                className="accent-blue-600 w-3 h-3"
              />
              <span className={filters.experienceLevel === level ? "text-blue-700" : textPrimary}>{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skills - Compact */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-2 text-sm flex items-center gap-1.5`}>
          <Filter className="w-3.5 h-3.5 text-blue-600" /> Skills
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "Excel", "Accounting", "Sales", "Marketing"].map((skill) => (
            <button
              key={skill}
              onClick={() => handleSkillToggle(skill)}
              className={`text-xs px-2 py-1 rounded-full transition-all ${
                filters.skills.includes(skill)
                  ? "bg-blue-600 text-white"
                  : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} hover:bg-blue-100 hover:text-blue-700`
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Range - Compact */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-2 text-sm flex items-center gap-1.5`}>
          <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Salary Range
        </h3>
        <div className="relative">
          <select
            className={`w-full appearance-none border ${inputBorder} rounded-md py-1.5 px-2.5 text-xs ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
            value={filters.salaryRange}
            onChange={(e) => handleFilterChange("salaryRange", e.target.value)}
          >
            <option value="">Any Salary</option>
            <option value="0-3">₹0 - ₹3L</option>
            <option value="3-5">₹3L - ₹5L</option>
            <option value="5-7">₹5L - ₹7L</option>
            <option value="7-10">₹7L - ₹10L</option>
            <option value="10-15">₹10L - ₹15L</option>
            <option value="15+">₹15L+</option>
          </select>
          <ChevronDown className={`absolute right-2 top-1.5 w-3.5 h-3.5 ${textSecondary} pointer-events-none`} />
        </div>
      </div>

      {/* Action Buttons - Compact */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
        >
          Clear All
        </button>
        <button
          onClick={() => setMobileFilterOpen(false)}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgPrimary} transition-colors duration-300`}>
      {/* {console.log(user.company_name)} */}
      {user? (user.company_name ?<RecruiterNavbar/>: <CandidateNavbar />) : <HomeNav />}
      
      {/* Search Section - COMPACT */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gray-50'} lg:mt-20 border-b ${borderColor}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className={`${bgSecondary} rounded-lg shadow-md p-3`}>
            {/* Desktop Layout - COMPACT */}
            <div className="hidden md:flex gap-2 items-center">
              {/* Job Title Search */}
              <div className="flex-1 relative" ref={searchRef}>
                <div className={`flex items-center gap-2 px-3 py-2 border ${inputBorder} rounded-md ${inputBg}`}>
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Job Title, Keyword"
                    className={`flex-1 outline-none bg-transparent ${textPrimary} text-sm`}
                    value={querySearch}
                    onChange={(e) => {
                      const newSearch = e.target.value;
                      setQuerySearch(newSearch);
                      const params = new URLSearchParams(locationHook.search);
                      if (newSearch) {
                        params.set('search', newSearch);
                      } else {
                        params.delete('search');
                      }
                      navigate({ search: params.toString() });
                      setCurrentPage(1);
                    }}
                    onFocus={() => querySearch.trim() && setShowSearchDropdown(true)}
                  />
                </div>
                
                {/* Autocomplete Dropdown - COMPACT */}
                {showSearchDropdown && filteredJobTypes.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-1 ${bgSecondary} border ${borderColor} rounded-md shadow-xl max-h-56 overflow-y-auto z-50`}>
                    {filteredJobTypes.map((jobType, index) => (
                      <button
                        key={index}
                        className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${textPrimary} text-xs border-b ${borderColor} last:border-b-0`}
                        onMouseDown={() => handleSearchSelect(jobType)}
                      >
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <span className="truncate">{jobType}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Search */}
              <div className="flex-1 relative" ref={locationRef}>
                <div className={`flex items-center gap-2 px-3 py-2 border ${inputBorder} rounded-md ${inputBg}`}>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter Location"
                    className={`flex-1 outline-none bg-transparent ${textPrimary} text-sm`}
                    value={queryLocation}
                    onChange={(e) => {
                      const newLocation = e.target.value;
                      setQueryLocation(newLocation);
                      const params = new URLSearchParams(locationHook.search);
                      if (newLocation) {
                        params.set('location', newLocation);
                      } else {
                        params.delete('location');
                      }
                      navigate({ search: params.toString() });
                      setCurrentPage(1);
                    }}
                    onFocus={() => queryLocation.trim() && setShowLocationDropdown(true)}
                  />
                </div>
                
                {/* Location Dropdown - COMPACT */}
                {showLocationDropdown && filteredLocations.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-1 ${bgSecondary} border ${borderColor} rounded-md shadow-xl max-h-56 overflow-y-auto z-50`}>
                    {filteredLocations.map((location, index) => (
                      <button
                        key={index}
                        className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${textPrimary} text-xs border-b ${borderColor} last:border-b-0`}
                        onMouseDown={() => handleLocationSelect(location)}
                      >
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-sm"
                onClick={() => {
                  setCurrentPage(1);
                  fetchJobs();
                }}
              >
                Search Job
              </button>
            </div>

            {/* Mobile Layout - COMPACT */}
            <div className="md:hidden space-y-2">
              <div className="relative" ref={searchRef}>
                <div className={`flex items-center gap-2 px-3 py-2 border ${inputBorder} rounded-md ${inputBg}`}>
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Job Title, Keyword"
                    className={`flex-1 outline-none bg-transparent ${textPrimary} text-sm`}
                    value={querySearch}
                    onChange={(e) => {
                      const newSearch = e.target.value;
                      setQuerySearch(newSearch);
                      const params = new URLSearchParams(locationHook.search);
                      if (newSearch) params.set('search', newSearch);
                      else params.delete('search');
                      navigate({ search: params.toString() });
                      setCurrentPage(1);
                    }}
                    onFocus={() => querySearch.trim() && setShowSearchDropdown(true)}
                  />
                </div>
                
                {showSearchDropdown && filteredJobTypes.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-1 ${bgSecondary} border ${borderColor} rounded-md shadow-xl max-h-44 overflow-y-auto z-50`}>
                    {filteredJobTypes.map((jobType, index) => (
                      <button
                        key={index}
                        className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${textPrimary} text-xs border-b ${borderColor}`}
                        onClick={() => handleSearchSelect(jobType)}
                      >

                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3 text-blue-600" />
                          <span className="truncate">{jobType}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative" ref={locationRef}>
                  <div className={`flex items-center gap-2 px-3 py-2 border ${inputBorder} rounded-md ${inputBg}`}>
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Location"
                      className={`flex-1 outline-none bg-transparent ${textPrimary} text-sm`}
                      value={queryLocation}
                      onChange={(e) => {
                        const newLocation = e.target.value;
                        setQueryLocation(newLocation);
                        const params = new URLSearchParams(locationHook.search);
                        if (newLocation) params.set('location', newLocation);
                        else params.delete('location');
                        navigate({ search: params.toString() });
                        setCurrentPage(1);
                      }}
                      onFocus={() => queryLocation.trim() && setShowLocationDropdown(true)}
                    />
                  </div>
                  
                  {showLocationDropdown && filteredLocations.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 ${bgSecondary} border ${borderColor} rounded-md shadow-xl max-h-44 overflow-y-auto z-50`}>
                      {filteredLocations.map((location, index) => (
                        <button
                          key={index}
                          className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors ${textPrimary} text-xs border-b ${borderColor}`}
                          onClick={() => handleLocationSelect(location)}
                        >
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            <span className="truncate">{location}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className={`flex items-center gap-1.5 px-3 py-2 border ${inputBorder} rounded-md hover:bg-opacity-50 ${textPrimary} whitespace-nowrap`}
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span className="text-xs">Filter</span>
                </button>
              </div>

              <button 
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-sm"
                onClick={() => {
                  setCurrentPage(1);
                  fetchJobs();
                }}
              >
                Search Job
              </button>
            </div>

            {/* Popular Tags - COMPACT */}
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs ${textSecondary} font-semibold`}>Popular:</span>
              {["#Back office", "#Sales", "Business Dev", "Computer", "Accounting"].map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer - COMPACT */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className={`absolute bottom-0 left-0 right-0 ${bgSecondary} rounded-t-2xl max-h-[80vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${bgSecondary} border-b ${borderColor} px-4 py-3 flex items-center justify-between`}>
              <h2 className={`text-base font-semibold ${textPrimary}`}>Filter jobs</h2>
              <button
                onClick={clearFilters}
                className="text-blue-600 text-xs font-semibold"
              >
                Clear all
              </button>
            </div>
            <div className="px-4 py-3">
              <FilterContent />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Sidebar Filters - Desktop - COMPACT */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className={`${bgSecondary} rounded-lg shadow-sm p-4 sticky top-20 border ${borderColor}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-base font-semibold ${textPrimary}`}>All Filters</h2>
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Main Content - COMPACT */}
          <div className="flex-1">
            <div className="max-w-5xl mx-auto">
              {/* Header - COMPACT */}
              <div className="mb-4">
                <h2 className={`text-2xl font-bold ${textPrimary} mb-1`}>Featured Jobs</h2>
                <div className={`text-xs ${textSecondary}`}>
                  Showing {Math.min((currentPage - 1) * jobsPerPage + 1, totalJobs)} - {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} jobs
                </div>
              </div>

              {/* Jobs List - COMPACT */}
              <div className="space-y-3 mb-4">
                {loading && <SkeletonJobCard count={5} />}

                {!loading && error && (
                  <ErrorBox 
                    error={error} 
                    onRetry={fetchJobs}
                    title="Failed to load jobs"
                  />
                )}

                {!loading && !error && jobs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className={`${textSecondary} text-base`}>No jobs found matching your criteria.</p>
                  </div>
                )}

                {!loading && !error && jobs.map(job => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    onBookmark={toggleBookmark}
                    isBookmarked={bookmarkedJobs.has(job.job_id)}
                    isDark={isDark}
                  />
                ))}
              </div>
              {console.log(jobs)}

              {/* Pagination - COMPACT */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <button
                    className={`px-3 py-1.5 ${bgSecondary} border ${borderColor} rounded-md hover:bg-opacity-80 disabled:opacity-50 transition-colors ${textPrimary} text-xs`}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {/* Page Numbers - COMPACT */}
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          className={`px-3 py-1.5 rounded-md transition-colors text-xs ${
                            1 === currentPage 
                              ? 'bg-blue-600 text-white' 
                              : `${bgSecondary} border ${borderColor} hover:bg-opacity-80 ${textPrimary}`
                          }`}
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis1" className={`px-1 ${textSecondary} text-xs`}>...</span>
                        );
                      }
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          className={`px-3 py-1.5 rounded-md transition-colors text-xs ${
                            i === currentPage 
                              ? 'bg-blue-600 text-white' 
                              : `${bgSecondary} border ${borderColor} hover:bg-opacity-80 ${textPrimary}`
                          }`}
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </button>
                      );
                    }

                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className={`px-1 ${textSecondary} text-xs`}>...</span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          className={`px-3 py-1.5 rounded-md transition-colors text-xs ${
                            totalPages === currentPage 
                              ? 'bg-blue-600 text-white' 
                              : `${bgSecondary} border ${borderColor} hover:bg-opacity-80 ${textPrimary}`
                          }`}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  <button
                    className={`px-3 py-1.5 ${bgSecondary} border ${borderColor} rounded-md hover:bg-opacity-80 disabled:opacity-50 transition-colors ${textPrimary} text-xs`}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Desktop - COMPACT */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div
              className={`sticky top-20 ${
                isDark
                  ? 'bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600'
                  : 'bg-gradient-to-br from-blue-50 to-orange-50'
              } rounded-lg shadow-sm p-4 transition-colors duration-300`}
            >
              <div className={`${textPrimary} text-xl mb-2`}>⚡ BigSources FASTFORWARD</div>

              <h3 className={`font-semibold mb-1.5 text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                Get 3X more profile views from recruiters
              </h3>

              <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Increase your chances of callback with BigSources FastForward
              </p>

              <button
                className={`text-xs font-semibold transition-colors duration-200 ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Know More
              </button>
            </div>
              {/* Axis Banner */}
                    <section className={` sticky top-80 mt-4 transition-colors duration-300`}>
                      <div className="max-w-3xl mx-auto">
                        <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                          <img 
                            src={vacancy1} 
                            alt="Axis Bank Banner" 
                            className="w-full h-auto object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </section>
   </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobListings;
