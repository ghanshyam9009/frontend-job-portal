import React, { useState, useEffect } from "react";
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
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
  const jobsPerPage = 7;

 // Theme-based styling
  const isDark = false;
  const bgPrimary = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBorder = isDark ? 'hover:border-blue-500' : 'hover:border-blue-400';
  const inputBg = isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-700';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  useEffect(() => {
    fetchJobs();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, filters, querySearch, queryLocation]);

  // Replace the fetchJobs function with this corrected version:

// Replace the fetchJobs function with this corrected version:

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
      let allJobs = Array.isArray(jobsArray) ? jobsArray : [];

      // DEBUG: Log sample job data to understand API response format
      if (allJobs.length > 0) {
        console.log('Sample Job Data:', {
          employment_type: allJobs[0].employment_type,
          category: allJobs[0].category,
          experience_level: allJobs[0].experience_level,
          skills_required: allJobs[0].skills_required,
          salary_range: allJobs[0].salary_range,
          all_employment_types: [...new Set(allJobs.map(j => j.employment_type).filter(Boolean))],
          all_categories: [...new Set(allJobs.map(j => j.category).filter(Boolean))],
          all_experience_levels: [...new Set(allJobs.map(j => j.experience_level).filter(Boolean))]
        });
      }

      // CLIENT-SIDE FILTERING
      let filteredJobs = allJobs;

      // Filter by search keyword
      if (querySearch) {
        const searchLower = querySearch.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.job_title?.toLowerCase().includes(searchLower) ||
          job.company_name?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower) ||
          job.skills_required?.some(skill => skill.toLowerCase().includes(searchLower))
        );
      }

      // Filter by location
      if (queryLocation) {
        const locationLower = queryLocation.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.location?.toLowerCase().includes(locationLower)
        );
      }

      // Filter by job type - FLEXIBLE MATCHING
      if (filters.jobType) {
        filteredJobs = filteredJobs.filter(job => {
          if (!job.employment_type) return true; // Don't filter out if no employment_type
          
          const jobType = job.employment_type.toLowerCase().trim();
          const filterType = filters.jobType.toLowerCase().trim();
          
          // Handle variations like "Full Time" vs "Full-Time" vs "Fulltime"
          const normalizeType = (type) => type.replace(/[-\s]/g, '');
          
          return normalizeType(jobType) === normalizeType(filterType) ||
                 jobType.includes(filterType) ||
                 filterType.includes(jobType);
        });
      }

      // Filter by category - FLEXIBLE MATCHING
      if (filters.category) {
        filteredJobs = filteredJobs.filter(job => {
          if (!job.category) return true; // Don't filter out if no category
          
          const jobCategory = job.category.toLowerCase().trim();
          const filterCategory = filters.category.toLowerCase().trim();
          
          return jobCategory.includes(filterCategory) || 
                 filterCategory.includes(jobCategory);
        });
      }

      // Filter by skills - VERY LENIENT MATCHING
      if (filters.skills.length > 0) {
        filteredJobs = filteredJobs.filter(job => {
          if (!job.skills_required || job.skills_required.length === 0) return true; // Don't filter out if no skills
          
          // Check if ANY of the selected filter skills match ANY of the job skills
          return filters.skills.some(filterSkill => {
            const filterSkillLower = filterSkill.toLowerCase().trim();
            
            return job.skills_required.some(jobSkill => {
              const jobSkillLower = jobSkill.toLowerCase().trim();
              
              // Very flexible matching - partial matches in both directions
              return jobSkillLower.includes(filterSkillLower) ||
                     filterSkillLower.includes(jobSkillLower) ||
                     jobSkillLower.replace(/[.\-\s]/g, '') === filterSkillLower.replace(/[.\-\s]/g, '');
            });
          });
        });
      }

      // Filter by salary range - FIXED LOGIC
      if (filters.salaryRange) {
        filteredJobs = filteredJobs.filter(job => {
          if (!job.salary_range) return false;
          
          const [minStr, maxStr] = filters.salaryRange.split('-');
          const filterMin = parseFloat(minStr) * 100000; // Convert lakhs to actual number
          const filterMax = maxStr ? (maxStr.includes('+') ? Infinity : parseFloat(maxStr) * 100000) : Infinity;

          let jobSalaryMin = 0;
          let jobSalaryMax = 0;

          // Handle different salary_range formats
          if (typeof job.salary_range === 'object') {
            jobSalaryMin = parseFloat(job.salary_range.min) || 0;
            jobSalaryMax = parseFloat(job.salary_range.max) || jobSalaryMin;
          } else if (typeof job.salary_range === 'string') {
            // Parse string format like "3-5L" or "500000-700000"
            const matches = job.salary_range.match(/(\d+\.?\d*)/g);
            if (matches && matches.length >= 2) {
              jobSalaryMin = parseFloat(matches[0]);
              jobSalaryMax = parseFloat(matches[1]);
              
              // If values are small, assume they're in lakhs
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

          // Check if job salary overlaps with filter range
          return (jobSalaryMax >= filterMin && jobSalaryMin <= filterMax) ||
                 (jobSalaryMin >= filterMin && jobSalaryMin <= filterMax);
        });
      }

      // Filter by experience level - FLEXIBLE MATCHING
      if (filters.experienceLevel) {
        filteredJobs = filteredJobs.filter(job => {
          if (!job.experience_level) return true; // Don't filter out if no experience_level
          
          const jobExpLevel = job.experience_level.toLowerCase().trim();
          const filterExpLevel = filters.experienceLevel.toLowerCase().trim();
          
          // Handle variations
          return jobExpLevel.includes(filterExpLevel) || 
                 filterExpLevel.includes(jobExpLevel) ||
                 jobExpLevel.replace(/[-\s]/g, '') === filterExpLevel.replace(/[-\s]/g, '');
        });
      }

      // Sort jobs: premium first, then by date
      filteredJobs.sort((a, b) => {
        if ((a.is_premium || false) && !(b.is_premium || false)) return -1;
        if (!(a.is_premium || false) && (b.is_premium || false)) return 1;
        const dateA = new Date(a.created_at || a.posted_date || 0);
        const dateB = new Date(b.created_at || b.posted_date || 0);
        return dateB - dateA;
      });

      // CLIENT-SIDE PAGINATION
      const totalCount = filteredJobs.length;
      const calculatedTotalPages = Math.max(1, Math.ceil(totalCount / jobsPerPage));
      
      // Get only the jobs for current page
      const startIndex = (currentPage - 1) * jobsPerPage;
      const endIndex = startIndex + jobsPerPage;
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

      console.log('Pagination Info:', {
        totalJobs: allJobs.length,
        filteredJobs: totalCount,
        currentPage: currentPage,
        jobsPerPage: jobsPerPage,
        totalPages: calculatedTotalPages,
        startIndex: startIndex,
        endIndex: endIndex,
        jobsInCurrentPage: paginatedJobs.length,
        activeFilters: {
          search: querySearch,
          location: queryLocation,
          ...filters
        },
        filteringBreakdown: {
          afterSearch: querySearch ? filteredJobs.length : 'N/A',
          afterLocation: queryLocation ? filteredJobs.length : 'N/A',
          afterJobType: filters.jobType ? filteredJobs.length : 'N/A',
          afterCategory: filters.category ? filteredJobs.length : 'N/A',
          afterSkills: filters.skills.length > 0 ? filteredJobs.length : 'N/A',
          afterSalary: filters.salaryRange ? filteredJobs.length : 'N/A',
          afterExperience: filters.experienceLevel ? filteredJobs.length : 'N/A',
          final: totalCount
        }
      });

      setJobs(paginatedJobs);
      setTotalJobs(totalCount);
      setTotalPages(calculatedTotalPages);
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
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to page 1 when filter changes
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
    setCurrentPage(1); // Reset to page 1 when clearing filters
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
      if (newBookmarked.has(jobId)) {
        newBookmarked.delete(jobId);
      } else {
        newBookmarked.add(jobId);
        await candidateExternalService.bookmarkJob({ 
          user_id: userId, 
          job_id: jobId 
        });
      }
      setBookmarkedJobs(newBookmarked);
    } catch (error) {
      console.error('Error bookmarking job:', error);
      alert('Failed to bookmark job. Please try again.');
    }
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

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Job Type */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-3 text-base flex items-center gap-2`}>
          <Filter className="w-4 h-4 text-blue-600" /> Job Type
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {["Full Time", "Part Time", "Contractual", "Intern", "Freelance", "Night Shift"].map((type) => (
            <label
              key={type}
              className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border transition-all cursor-pointer ${
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
                className="accent-blue-600"
              />
              <span className={filters.jobType === type ? "text-blue-700" : textPrimary}>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-3 text-base flex items-center gap-2`}>
          <Bookmark className="w-4 h-4 text-blue-600" /> Category
        </h3>
        <div className="relative">
          <select
            className={`w-full appearance-none border ${inputBorder} rounded-lg py-2 px-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
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
            {/* Add other categories as needed */}
          </select>
          <ChevronDown className={`absolute right-3 top-2.5 w-4 h-4 ${textSecondary} pointer-events-none`} />
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-3 text-base flex items-center gap-2`}>
          <Briefcase className="w-4 h-4 text-blue-600" /> Experience Level
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {["Fresher", "Entry Level", "Mid Level", "Senior Level", "Expert"].map((level) => (
            <label
              key={level}
              className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border transition-all cursor-pointer ${
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
                className="accent-blue-600"
              />
              <span className={filters.experienceLevel === level ? "text-blue-700" : textPrimary}>{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Popular Skills */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-3 text-base flex items-center gap-2`}>
          <Filter className="w-4 h-4 text-blue-600" /> Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "Excel", "Accounting", "Sales", "Marketing"].map((skill) => (
            <button
              key={skill}
              onClick={() => handleSkillToggle(skill)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
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

      {/* Salary Range */}
      <div>
        <h3 className={`${textPrimary} font-semibold mb-3 text-base flex items-center gap-2`}>
          <Briefcase className="w-4 h-4 text-blue-600" /> Salary Range
        </h3>
        <div className="relative">
          <select
            className={`w-full appearance-none border ${inputBorder} rounded-lg py-2 px-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
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
          <ChevronDown className={`absolute right-3 top-2.5 w-4 h-4 ${textSecondary} pointer-events-none`} />
        </div>
      </div>

      {/* Apply / Clear Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="text-sm font-semibold text-red-600 hover:text-red-700 transition"
        >
          Clear All
        </button>
        <button
          onClick={() => setMobileFilterOpen(false)}
          className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgPrimary} transition-colors duration-300 `}>
      <HomeNav/>
      
      {/* Search Section */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gray-50'} lg:mt-20 border-b ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className={`${bgSecondary} rounded-lg shadow-md p-4`}>
            {/* Desktop Layout */}
            <div className="hidden md:flex gap-3 items-center">
              <div className={`flex-1 flex items-center gap-2 px-4 py-3 border ${inputBorder} rounded-lg ${inputBg}`}>
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job Title, Keyword"
                  className={`flex-1 outline-none bg-transparent ${textPrimary}`}
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
                    setCurrentPage(1); // Reset to page 1 on search
                  }}
                />
              </div>

              <div className={`flex-1 flex items-center gap-2 px-4 py-3 border ${inputBorder} rounded-lg ${inputBg}`}>
                <MapPin className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Location"
                  className={`flex-1 outline-none bg-transparent ${textPrimary}`}
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
                    setCurrentPage(1); // Reset to page 1 on location change
                  }}
                />
              </div>

              <button 
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                onClick={() => {
                  // Trigger search - this will cause useEffect to run
                  setCurrentPage(1);
                  fetchJobs();
                }}
              >
                Search Job
              </button>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-3">
              <div className={`flex items-center gap-2 px-4 py-3 border ${inputBorder} rounded-lg ${inputBg}`}>
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job Title, Keyword"
                  className={`flex-1 outline-none bg-transparent ${textPrimary}`}
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
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex gap-2">
                <div className={`flex-1 flex items-center gap-2 px-4 py-3 border ${inputBorder} rounded-lg ${inputBg}`}>
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Location"
                    className={`flex-1 outline-none bg-transparent ${textPrimary}`}
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
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <button
                  className={`flex items-center gap-2 px-4 py-3 border ${inputBorder} rounded-lg hover:bg-opacity-50 ${textPrimary} whitespace-nowrap`}
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
              </div>

              <button 
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                onClick={() => {
                  // Trigger search - this will cause useEffect to run
                  setCurrentPage(1);
                  fetchJobs();
                }}
              >
                Search Job
              </button>
            </div>

            {/* Popular Tags */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className={`text-sm ${textSecondary} font-semibold`}>Popular Tag:</span>
              {["#Back office Job", "#SalesJobs", "Business Development", "Computer - Knowledge", "Accounting"].map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className={`absolute bottom-0 left-0 right-0 ${bgSecondary} rounded-t-3xl max-h-[85vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${bgSecondary} border-b ${borderColor} px-4 py-4 flex items-center justify-between`}>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>Filter jobs</h2>
              <button
                onClick={clearFilters}
                className="text-blue-600 text-sm font-semibold"
              >
                Clear all
              </button>
            </div>
            <div className="px-4 py-4">
              <FilterContent />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop Only */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <div className={`${bgSecondary} rounded-lg shadow-sm p-6 sticky top-24 border ${borderColor}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-lg font-semibold ${textPrimary}`}>All Filters</h2>
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h2 className={`text-3xl font-bold ${textPrimary} mb-2`}>Featured Jobs</h2>
                <div className={`text-sm ${textSecondary}`}>
                  Showing {Math.min((currentPage - 1) * jobsPerPage + 1, totalJobs)} - {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} jobs
                </div>
              </div>

              {/* Jobs List */}
              <div className="space-y-4 mb-6">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className={textSecondary}>Loading jobs...</p>
                  </div>
                )}

                {!loading && !error && jobs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className={`${textSecondary} text-lg`}>No jobs found matching your criteria.</p>
                  </div>
                )}

                {!loading && !error && jobs.map(job => (
                  <div 
                    key={job.job_id}
                    className={`${bgSecondary} rounded-xl shadow-sm border ${borderColor} ${hoverBorder} p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer`}
                    onClick={() => handleJobClick(job)}
                  >
                    
                    {/* Header with time and bookmark */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                        {formatDate(job.created_at)}
                      </span>
                       {/* Apply Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg text-sm"
                    >
                      Apply Now
                    </button>
                     
                    </div>

                    {/* Company Logo and Title */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white text-base font-bold">
                          {getInitials(job.company_name)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${textPrimary} mb-1 hover:text-blue-600 transition-colors`}>
                          {job.job_title}
                        </h3>
                        <p className={`text-xs ${textSecondary} font-medium flex items-center gap-1`}>
                          <Building2 className="w-3 h-3" />
                          {job.company_name}
                        </p>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                      <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2.5 py-1.5 rounded-md`}>
                        <Clock className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className={`${textSecondary} font-medium`}>{job.employment_type}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2.5 py-1.5 rounded-md`}>
                        <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className={`${textSecondary} font-medium`}>{job.location}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2.5 py-1.5 rounded-md`}>
                        <DollarSign className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className={`${textSecondary} font-medium`}>{formatSalary(job.salary_range)}</span>
                      </div>
                      {job.experience_required && (
                        <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2.5 py-1.5 rounded-md`}>
                          <Briefcase className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <span className={`${textSecondary} font-medium`}>
                            {job.experience_required.min_years}-{job.experience_required.max_years} yrs
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Job Description */}
                    <p className={`${textSecondary} text-sm mb-4 leading-relaxed`}>
                      {job.description
                        ? job.description.length > 150
                          ? `${job.description.substring(0, 150)}...`
                          : job.description
                        : "No description available."}
                    </p>

                    {/* Skills */}
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills_required.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {job.skills_required.length > 3 && (
                          <span className={`${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                            +{job.skills_required.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                  

                     <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(job.job_id);
                        }}
                        className={`${textSecondary}  hover:text-yellow-500 transition-colors p-1.5 rounded-lg`}
                      >
                        <Bookmark className="w-5 h-5"  fill={bookmarkedJobs.has(job.job_id) ? "currentColor" : "none"} />
                        
                      </button>
                   
                     
                     
                      {/* Premium Badge */}
                    {!job.is_premium && (
                      <div className="absolute bottom-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-tr-lg shadow-md">
                        PREMIUM
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    className={`px-4 py-2 ${bgSecondary} border ${borderColor} rounded-lg hover:bg-opacity-80 disabled:opacity-50 transition-colors ${textPrimary}`}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                    // Adjust start if we're near the end
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    // First page
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          className={`px-4 py-2 rounded-lg transition-colors ${
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
                          <span key="ellipsis1" className={`px-2 ${textSecondary}`}>...</span>
                        );
                      }
                    }

                    // Middle pages
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          className={`px-4 py-2 rounded-lg transition-colors ${
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

                    // Last page
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className={`px-2 ${textSecondary}`}>...</span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          className={`px-4 py-2 rounded-lg transition-colors ${
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
                    className={`px-4 py-2 ${bgSecondary} border ${borderColor} rounded-lg hover:bg-opacity-80 disabled:opacity-50 transition-colors ${textPrimary}`}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden  lg:block w-80 flex-shrink-0">
            <div
              className={`sticky top-24 ${
                isDark
                  ? 'bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600'
                  : 'bg-gradient-to-br from-blue-50 to-orange-50'
              } rounded-lg shadow-sm p-6 transition-colors duration-300`}
            >
              <div className={`${textPrimary} text-2xl mb-3`}>⚡ BigSources FASTFORWARD</div>

              <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                Get 3X more profile views from recruiters
              </h3>

              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Increase your chances of callback with BigSources FastForward
              </p>

              <button
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Know More
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default JobListings;