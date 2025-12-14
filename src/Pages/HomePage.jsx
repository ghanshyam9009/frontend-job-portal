import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { Search, MapPin, Upload, Building2, Users, CheckCircle, Star, ArrowRight, UserPlus, User, BookOpen, Briefcase, Moon, Sun, ChevronDown, Bookmark, Clock, DollarSign, Send } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import styles from "./HomePage.module.css";
import Footer from "../Components/Footer";
import topHiringStyles from "../Styles/TopHiringCompanies.module.css";
import HomeNav from "../Components/HomeNav";
import { candidateExternalService } from "../services"; 
import { demoService } from "../services/demoService";
import { Loader, ErrorBox, SkeletonJobCard, JobCard } from "../Components/Shared";
import { toast } from "react-toastify";
import logo2 from "../assets/logo2.png";
import video from "../assets/Untitled design.mp4";
import video1 from "../assets/hero-video.mp4";
import image1 from "../assets/Screenshot 2025-10-06 190253.png";
import image2 from "../assets/Screenshot 2025-10-06 190818.png";
import image3 from "../assets/Screenshot 2025-10-06 194637.png";
import idbiLogo from "../assets/IDBI.jpg";
import idfcLogo from "../assets/IDFC.jpg";
import upload1 from "../assets/upload-r.jpg";
import kotakLogo from "../assets/Kotak.jpg";
import axisLogo from "../assets/Axis.jpg";
import iciciLogo from "../assets/icici.jpg";
import sbiLogo from "../assets/sbi.jpg";
import hdfcLogo from "../assets/hdfc.jpg";
import capgeminiLogo from "../assets/capgemini.jfif";
import jioLogo from "../assets/jio.jfif";
import sopraLogo from "../assets/sopra.jfif";
import kotakMahindraLogo from "../assets/kotak.jfif";
import nttdataLogo from "../assets/nttdata.jfif";
import relianceLogo from "../assets/relince.jfif";
import techmahindraLogo from "../assets/techmahindra.jfif";
import sbilifeLogo from "../assets/sbilife.jfif";
import ltimindtreeLogo from "../assets/lit.jfif";
import requestDemoImage from "../assets/Request free demo.png";
import jobImage from "../assets/job.jfif";
import axisBanner from "../assets/axis-banner.jpg";
import axisBanner1 from "../assets/carrericici.webp";
import bannerSmall from "../assets/banner-small.png";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";
import RecruiterNavbar from "../Components/Recruiter/RecruiterNavbar";

// job role card
function JobRoleCard({ title, image, link, isDark }) {
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const cardBorder = isDark ? 'border-gray-700' : 'border-gray-200';
  const cardHoverBorder = isDark ? 'hover:border-[#2271B5]' : 'hover:border-[#2271B5]/50';
  const cardHoverShadow = isDark ? 'hover:shadow-[#2271B5]/20' : 'hover:shadow-lg';
  const iconBg = isDark ? 'bg-[#2271B5]/40' : 'bg-[#2271B5]/10';
  const iconHoverBg = isDark ? 'group-hover:bg-[#2271B5]/60' : 'group-hover:bg-[#2271B5]/20';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const textHoverColor = isDark ? 'group-hover:text-[#2271B5]' : 'group-hover:text-[#2271B5]';
  const imageBrightness = isDark ? 'brightness-110' : '';

  return (
    <Link 
      to={link}
      className={`group ${cardBg} rounded-lg p-4 flex flex-col items-center justify-center gap-3 ${cardHoverShadow} transition-all duration-300 cursor-pointer border ${cardBorder} ${cardHoverBorder} min-h-[140px]`}
    >
      <div className={`${iconBg} p-3 rounded-lg ${iconHoverBg} transition-colors duration-300 w-12 h-12 flex items-center justify-center`}>
        <img 
          src={image} 
          alt={title}
          className={`w-8 h-8 object-contain ${imageBrightness}`}
          loading="lazy"
        />
      </div>
      <div className="text-center">
        <h3 className={`font-medium text-sm ${textColor} leading-snug ${textHoverColor} transition-colors duration-300`}>
          {title}
        </h3>
      </div>
    </Link>
  );
}

const companies = [
  { name: "IDBI", logo: idbiLogo },
  { name: "IDFC", logo: idfcLogo },
  { name: "Kotak", logo: kotakLogo },
  { name: "Axis", logo: axisLogo },
  { name: "ICICI", logo: iciciLogo },
  { name: "SBI", logo: sbiLogo },
  { name: "HDFC", logo: hdfcLogo },
];

const topHiringCompanies = [
  { name: "Capgemini", logo: capgeminiLogo },
  { name: "ICICI Bank", logo: iciciLogo },
  { name: "Sopra Steria", logo: sopraLogo },
  { name: "Kotak", logo: kotakMahindraLogo },
  { name: "NTT Data", logo: nttdataLogo },
  { name: "Reliance Nippon Life Insurance", logo: relianceLogo },
  { name: "Tech Mahindra", logo: techmahindraLogo },
  { name: "SBI Life Insurance", logo: sbilifeLogo },
  { name: "LTIMindtree", logo: ltimindtreeLogo },
];

const stats = [
  { number: "50K+", label: "Jobs Available" },
  { number: "30K+", label: "Happy Candidates" },
  { number: "500+", label: "Companies" },
  { number: "98%", label: "Success Rate" }
];

const Homepage = () => {
  const [jobTitle, setJobTitle] = useState('');
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState("");
  
  // Autocomplete states
  const [showJobTitleDropdown, setShowJobTitleDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const [availableJobTitles, setAvailableJobTitles] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  const [filteredJobTitles, setFilteredJobTitles] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  
  // Refs for click outside detection
  const jobTitleRef = useRef(null);
  const locationRef = useRef(null);
  const categoryRef = useRef(null);

  // Fetch jobs data on mount
  useEffect(() => {
    const fetchJobsData = async () => {
      try {
        const response = await fetch(
          'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs?status=approved&limit=500',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Filter out government jobs for the homepage
        const jobs = (data.jobs || []).filter(job => job.job_type !== "GOVERNMENT");

        // Extract unique job titles
        const jobTitles = [...new Set(jobs
          .map(job => job.job_title)
          .filter(Boolean)
        )].sort();

        // Extract unique locations
        const locations = [...new Set(jobs
          .map(job => job.location)
          .filter(Boolean)
        )].sort();

        // Extract unique categories/companies
        const categories = [...new Set(jobs
          .map(job => job.company_name)
          .filter(Boolean)
        )].sort();

        setAvailableJobTitles(jobTitles);
        setAvailableLocations(locations);
        setAvailableCategories(categories);
      } catch (error) {
        console.error("Failed to fetch jobs data:", error);
      }
    };

    fetchJobsData();
  }, []);

  // Filter job titles based on input
  useEffect(() => {
    if (jobTitle.trim()) {
      const filtered = availableJobTitles.filter(title =>
        title.toLowerCase().includes(jobTitle.toLowerCase())
      );
      setFilteredJobTitles(filtered.slice(0, 10));
      setShowJobTitleDropdown(filtered.length > 0);
    } else {
      setFilteredJobTitles([]);
      setShowJobTitleDropdown(false);
    }
  }, [jobTitle, availableJobTitles]);

  // Filter locations based on input
  useEffect(() => {
    if (location.trim()) {
      const filtered = availableLocations.filter(loc =>
        loc.toLowerCase().includes(location.toLowerCase())
      );
      setFilteredLocations(filtered.slice(0, 10));
      setShowLocationDropdown(filtered.length > 0);
    } else {
      setFilteredLocations([]);
      setShowLocationDropdown(false);
    }
  }, [location, availableLocations]);

  // Filter categories based on input
  useEffect(() => {
    if (category.trim()) {
      const filtered = availableCategories.filter(cat =>
        cat.toLowerCase().includes(category.toLowerCase())
      );
      setFilteredCategories(filtered.slice(0, 10));
      setShowCategoryDropdown(filtered.length > 0);
    } else {
      setFilteredCategories([]);
      setShowCategoryDropdown(false);
    }
  }, [category, availableCategories]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobTitleRef.current && !jobTitleRef.current.contains(event.target)) {
        setShowJobTitleDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleJobTitleSelect = (title) => {
    setJobTitle(title);
    setShowJobTitleDropdown(false);
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setShowLocationDropdown(false);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setShowCategoryDropdown(false);
  };

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredJobsLoading, setFeaturedJobsLoading] = useState(true);
  const [featuredJobsError, setFeaturedJobsError] = useState(null);
  const [demoData, setDemoData] = useState({ fullName: "", email: "", message: "", userType: "candidate" });
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState(null);
  const [demoSuccess, setDemoSuccess] = useState(false);

  const features = [
    {
      icon: User,
      title: "Register and Set Up Profile",
      description: "Recruiters or companies create an account by providing essential details such as company name, recruiter information, and contact details."
    },
    {
      icon: Upload,
      title: "Post and Manage Job",
      description: "Once registered, recruiters can create job postings by entering job titles, descriptions, required skills, experience levels, and salary ranges."
    },
    {
      icon: Briefcase,
      title: "Connect and Collaborate",
      description: "Recruiters can invite other HR members or interviewers to join their team."
    }
  ];

  const actions = [
    {
      icon: Upload,
      iconBg: "bg-[#2271B5]/20",
      iconColor: "text-[#2271B5]",
      title: "Upload Your Resume",
      subtitle: "Get matched with perfect jobs instantly",
      description: "Upload your resume and get discovered by top employers.",
      buttonText: "Upload Resume",
      buttonBg: "bg-[#2271B5] hover:bg-[#1a5a8f]",
      buttonShadow: "hover:shadow-[#2271B5]/30",
      path: "/profile",
      gradient: "from-[#2271B5]/10 to-white"
    },
    {
      icon: Building2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Post a Job",
      subtitle: "Find the perfect candidate for your team",
      description: "Post your job in minutes and start receiving applications from top talent.",
      buttonText: "Post Job",
      buttonBg: "bg-green-600 hover:bg-green-700",
      buttonShadow: "hover:shadow-green-200",
      path: "/post-job",
      gradient: "from-green-50 to-white"
    }
  ];

  const popularSearches = [
    { title: "Jobs for Freshers", trend: "#1", image: image1, link: "/jobs?search=fresher" },
    { title: "Work from home Jobs", trend: "#2", image: image2, link: "/jobs?search=work from home" },
    { title: "Part time Jobs", trend: "#3", image: image3, link: "/jobs?search=part time" },
    { title: "Jobs for Women", trend: "#4", image: image1, link: "/jobs?search=women" },
    { title: "Full time Jobs", trend: "#5", image: image2, link: "/jobs?search=full time" },
  ];

  const [topJobRoles, setTopJobRoles] = useState([]);

  // Static job role definitions with search terms
  const jobRoleDefinitions = [
    {
      title: "Work from Home",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/workfromhome.svg",
      keywords: ["work from home", "remote", "wfh", "home based"],
      link: "/jobs?search=work from home"
    },
    {
      title: "Accountant",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Accountant.svg",
      keywords: ["accountant", "finance", "accounts", "auditor"],
      link: "/jobs?search=accountant"
    },
    {
      title: "BPO / Customer care",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/BPO_Telecallers.svg",
      keywords: ["bpo", "customer care", "telecaller", "call center", "customer service"],
      link: "/jobs?search=bpo"
    },
    {
      title: "Data Entry / Back Office",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Data_entry_Back_office.svg",
      keywords: ["data entry", "back office", "admin", "clerical"],
      link: "/jobs?search=data entry"
    },
    {
      title: "Sales / Marketing",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Sales.svg",
      keywords: ["sales", "marketing", "business development", "sales executive"],
      link: "/jobs?search=sales"
    },
    {
      title: "Receptionist / Front Office",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Receptionist_Front_office.svg",
      keywords: ["receptionist", "front office", "front desk"],
      link: "/jobs?search=receptionist"
    },
    {
      title: "Hospitality Executives",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Hospitality_Executives.svg",
      keywords: ["hospitality", "hotel", "restaurant", "food service"],
      link: "/jobs?search=hospitality"
    },
    {
      title: "Delivery",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Delivery_boy.svg",
      keywords: ["delivery", "rider", "logistics"],
      link: "/jobs?search=delivery"
    },
    {
      title: "Driver",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Driver.svg",
      keywords: ["driver", "transport", "chaffeour"],
      link: "/jobs?search=driver"
    },
    {
      title: "Beauticians / Spa",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Beauticians.svg",
      keywords: ["beautician", "spa", "salon", "beauty"],
      link: "/jobs?search=beautician"
    },
    {
      title: "Mechanic",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Mechanic.svg",
      keywords: ["mechanic", "automobile", "car repair"],
      link: "/jobs?search=mechanic"
    },
    {
      title: "IT Software-Engineer",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/IT-Software.svg",
      keywords: ["software engineer", "developer", "programmer", "it", "tech"],
      link: "/jobs?search=software engineer"
    },
    {
      title: "Retail / Store Executive",
      image: "https://d3isa0ssinyrxx.cloudfront.net/images/design/logos/role_icons/Retail.svg",
      keywords: ["retail", "store executive", "shop", "sales associate"],
      link: "/jobs?search=retail"
    }
  ];

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      setFeaturedJobsLoading(true);
      setFeaturedJobsError(null);
      try {
        // Fetch only approved jobs - get enough to sort properly
        const response = await fetch('https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs?status=approved&limit=100', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.jobs) {
          throw new Error('Invalid response format');
        }
        // Filter out government jobs for the featured jobs section
        const nonGovJobs = (data.jobs || []).filter(job => job.job_type !== "GOVERNMENT");

        // Sort by latest jobs only (most recent first)
        const sortedNonGovJobs = nonGovJobs.sort((a, b) => {
          const dateA = new Date(a.created_at || a.posted_date || 0);
          const dateB = new Date(b.created_at || b.posted_date || 0);
          return dateB - dateA;
        });

        const mapped = sortedNonGovJobs.slice(0, 7).map((j, idx) => ({
          id: j.job_id || idx,
          job_id: j.job_id || idx,
          job_title: j.job_title,
          title: j.job_title,
          company_name: j.company_name || "",
          location: j.location || "",
          salary_range: j.salary_range,
          salary: formatSalary(j.salary_range),
          employment_type: j.employment_type || "Full-time",
          job_type: j.employment_type || "Full-time",
          company_logo: j.company_logo || j.logo || j.companyLogo || null,
          is_premium: j.premium_job || j.is_premium || false,
          created_at: j.created_at || j.posted_date,
          posted_date: j.posted_date,
          description: j.description,
          skills_required: j.skills_required || []
        }));

        // Jobs are already sorted, no need to sort again
        const sortedJobs = mapped;

        // Fix flickering: set data before setting loading to false
        setFeaturedJobs(sortedJobs);
        setFeaturedJobsLoading(false);
      } catch (error) {
        console.error("Failed to fetch featured jobs:", error);
        setFeaturedJobsError(error.message || 'Failed to load featured jobs');
        setFeaturedJobsLoading(false);
      }
    };

    const fetchTopJobRoles = async () => {
      try {
        // Fetch jobs for counting (limit to reasonable number)
        const response = await fetch('https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs?status=approved&limit=500', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.jobs) {
          throw new Error('Invalid response format');
        }

        // Filter out government jobs for job role counting
        const jobs = (data.jobs || []).filter(job => job.job_type !== "GOVERNMENT");

        // Count jobs by category using keyword matching
        const roleCounts = jobRoleDefinitions.map(role => {
          const count = jobs.filter(job => {
            const jobTitle = (job.job_title || "").toLowerCase();
            const jobDescription = (job.description || "").toLowerCase();
            const searchText = jobTitle + " " + jobDescription;

            return role.keywords.some(keyword =>
              searchText.includes(keyword.toLowerCase())
            );
          }).length;

          return {
            ...role,
            count: count,
            countText: `${count} Active Job${count !== 1 ? 's' : ''}`
          };
        });

        setTopJobRoles(roleCounts);
      } catch (error) {
        console.error("Failed to fetch Top Job Roles:", error);
        // Fallback to static data with 0 counts
        const fallbackRoles = jobRoleDefinitions.map(role => ({
          ...role,
          count: 0,
          countText: "0 Active Jobs"
        }));
        setTopJobRoles(fallbackRoles);
      }
    };

    fetchFeaturedJobs();
    fetchTopJobRoles();
  }, []);

  const handleSearch = () => {
    navigate(`/jobs?search=${searchTerm}&location=${location}`);
  };

  const handleDemoInputChange = (field, value) => {
    setDemoData(prev => ({ ...prev, [field]: value }));
  };

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setDemoLoading(true);
    setDemoError(null);
    setDemoSuccess(false);
    try {
      // Transform form data to match API expectations
      const apiData = {
        name: demoData.fullName,
        email: demoData.email,
        question: demoData.message,
      };

      await demoService.requestDemo(apiData);
      setDemoSuccess(true);
      setDemoData({ fullName: "", email: "", message: "", userType: "candidate" });
    } catch (err) {
      setDemoError("Failed to send request. Please try again.");
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleJobClick = (job) => {
    // Use job ID for consistent URLs
    const jobId = job.job_id || job.id;
    navigate(`/job/${jobId}`, {
      state: { job }
    });
  };

  const handleNavigate = (link) => {
    console.log('Navigating to:', link);
    navigate(link);
  };

  // manage dark mode and light mode
  let theme = localStorage.getItem("theme");
  let darkMode = localStorage.getItem("darkmode");

  useEffect(() => {
    darkMode = darkMode === "true";
    if (darkMode) {
      theme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      theme = "light";
      localStorage.setItem("theme", "light");
    }
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return "Salary not specified";
    if (typeof salaryRange === 'string') return salaryRange;
    if (salaryRange.min && salaryRange.max) {
      return `₹${salaryRange.min} - ₹${salaryRange.max}`;
    }
    return "Salary not specified";
  };

  const isDark = theme === 'dark';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-white';
  const bgCard = isDark ? 'bg-gray-800' : 'bg-white';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-[#F8F9FA]';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-900';
  const textSecondary1 = isDark ? 'text-gray-400' : 'text-gray-600';
  const badgeBg = isDark ? 'bg-[#2271B5]' : 'bg-[#2271B5]';
  const badgeShadow = isDark ? 'shadow-[#2271B5]/30' : 'shadow-sm';
  const toggleBg = isDark ? 'bg-gray-800' : 'bg-white';
  const toggleBorder = isDark ? 'border-gray-600' : 'border-gray-200';
  const toggleShadow = isDark ? 'shadow-gray-900/50' : 'shadow-md';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const cardBg1 = isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-orange-50';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputText = isDark ? 'text-white' : 'text-gray-900';
  const badgeBg1 = isDark ? 'bg-[#2271B5]/20' : 'bg-[#2271B5]/10';
  const [isVisible, setIsVisible] = useState(false);
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBorder = isDark ? 'hover:border-[#2271B5]' : 'hover:border-[#2271B5]';
  const badgeText = isDark ? 'text-[#2271B5]' : 'text-[#2271B5]';
  const detailBg = isDark ? 'bg-gray-700' : 'bg-gray-50';

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      if (scrollPosition > windowHeight * 0.1) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());

  // Fetch bookmarked jobs on mount if user is authenticated
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
        // Don't show error to user, just silently fail
      }
    };

    fetchBookmarkedJobs();
  }, [isAuthenticated, user]);
  
  const toggleBookmark = async (jobId) => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to bookmark jobs.');
      navigate('/candidate/login');
      return;
    }

    try {
      const userId = user.user_id || user.id;
      if (!userId) {
        toast.error('User ID not found. Please log in again.');
        navigate('/candidate/login');
        return;
      }

      const newBookmarked = new Set(bookmarkedJobs);
      const isCurrentlyBookmarked = newBookmarked.has(jobId);
      
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        newBookmarked.delete(jobId);
        // Note: API might not support unbookmark, but we'll update UI optimistically
        setBookmarkedJobs(newBookmarked);
        toast.success('Job removed from bookmarks');
      } else {
        // Add bookmark
        await candidateExternalService.bookmarkJob({
          user_id: userId,
          job_id: jobId,
          action: 1
        });
        newBookmarked.add(jobId);
        setBookmarkedJobs(newBookmarked);
        toast.success('Job bookmarked successfully');
      }
    } catch (error) {
      console.error('Error bookmarking job:', error);
      toast.error('Failed to bookmark job. Please try again.');
    }
  };


  const steps = [
    {
      icon: UserPlus,
      title: "Create account",
      description: "Aliquam facilisis egestas sapien, nec tempor leo tristique at.",
      color: "bg-[#2271B5]"
    },
    {
      icon: Upload,
      title: "Upload CV/Resume",
      description: "Curabitur sit amet maximus liguis. Nam a nulla ante. Nam sodales",
      color: "bg-[#2271B5]"
    },
    {
      icon: Search,
      title: "Find suitable job",
      description: "Phasellus quis eleifend ex. Morbi nec fringilla nibh.",
      color: "bg-[#2271B5]"
    },
    {
      icon: CheckCircle,
      title: "Apply job",
      description: "Curabitur sit amet maximus ligula. Nam a nulla ante. Nam sodales purus.",
      color: "bg-[#2271B5]"
    }
  ];

  return (
    <> {/* Navigation */}

    {console.log(user)}
      {user? (user.company_name ?<RecruiterNavbar/>: <CandidateNavbar />) : <HomeNav />}
    <div className="">
     

      {/* Hero section */}
      <div className="relative min-h-24 bg-gray-900 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            <source src={video1} type="video/mp4" />
          </video>
          <div className="absolute inset-0"></div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-16 pt-20 pb-16 md:pt-24 md:pb-20">
          {/* Main Heading */}
          <div className="text-center mb-6 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-bold mb-4 text-white">
              Find Your Dream Job Today!
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-gray-300 max-w-3xl mx-auto">
              Discover thousands of opportunities from top companies worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="rounded-xl shadow-lg flex flex-col md:flex-row relative overflow-visible bg-gray-800/90 backdrop-blur-sm">
              
              {/* Job Title Input with Autocomplete */}
              <div className="flex-1 relative" ref={jobTitleRef}>
                <div className="p-3 border-b md:border-b-0 md:border-r border-gray-700">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-white flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Job Title or Keyword"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      onFocus={() => jobTitle.trim() && setShowJobTitleDropdown(true)}
                      className="w-full focus:outline-none text-sm bg-transparent text-white placeholder-white"
                    />
                  </div>
                </div>
                
                {/* Job Title Dropdown */}
                {showJobTitleDropdown && filteredJobTitles.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                    {filteredJobTitles.map((title, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-blue-600 transition-colors text-white text-xs border-b border-gray-700 last:border-b-0"
                        onMouseDown={() => handleJobTitleSelect(title)}
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Input with Autocomplete */}
              <div className="flex-1 relative" ref={locationRef}>
                <div className="p-3 border-b md:border-b-0 md:border-r border-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Select Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onFocus={() => location.trim() && setShowLocationDropdown(true)}
                      className="w-full focus:outline-none text-sm bg-transparent text-white placeholder-white"
                    />
                  </div>
                </div>
                
                {/* Location Dropdown */}
                {showLocationDropdown && filteredLocations.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                    {filteredLocations.map((loc, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-blue-600 transition-colors text-white text-xs border-b border-gray-700 last:border-b-0"
                        onMouseDown={() => handleLocationSelect(loc)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{loc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Category Input with Autocomplete */}
              <div className="flex-1 relative" ref={categoryRef}>
                <div className="p-3 border-b md:border-b-0 md:border-r border-gray-700">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-white flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      onFocus={() => category.trim() && setShowCategoryDropdown(true)}
                      className="w-full focus:outline-none text-sm bg-transparent text-white placeholder-white"
                    />
                  </div>
                </div>
                
                {/* Category Dropdown */}
                {showCategoryDropdown && filteredCategories.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                    {filteredCategories.map((cat, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-blue-600 transition-colors text-white text-xs border-b border-gray-700 last:border-b-0"
                        onMouseDown={() => handleCategorySelect(cat)}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{cat}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="bg-blue-600 rounded-bl-xl rounded-tl-xl rounded-tr-xl rounded-br-xl hover:bg-blue-700 text-white px-6 py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Search Job
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            
            {/* Jobs */}
            <div className="hidden md:flex items-center gap-3 justify-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#2042E3] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <Briefcase size={24} className="text-white" />
              </div>
              <div className="text-white">
                <div className="text-xl md:text-2xl font-bold">25,850</div>
                <div className="text-xs md:text-sm text-gray-300">Jobs</div>
              </div>
            </div>

            {/* Candidates */}
            <div className="hidden md:flex flex items-center gap-3 justify-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#2042E3] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <Users size={24} className="text-white" />
              </div>
              <div className="text-white">
                <div className="text-xl md:text-2xl font-bold">10,250</div>
                <div className="text-xs md:text-sm text-gray-300">Candidates</div>
              </div>
            </div>

            {/* Companies */}
            <div className="hidden md:flex flex items-center gap-3 justify-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#2042E3] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <Building2 size={24} className="text-white" />
              </div>
              <div className="text-white">
                <div className="text-xl md:text-2xl font-bold">18,400</div>
                <div className="text-xs md:text-sm text-gray-300">Companies</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blue Info Section */}
      <div className="bg-[#2271B5] py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start">
                  {/* Icon Circle */}
                  <div className="mb-3 md:mb-0 md:mr-4 flex-shrink-0">
                    <div className="w-16 h-16 rounded-full border-2 border-white border-dashed flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h3 className="text-white text-sm font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <div className="w-8 h-0.5 bg-white mb-3 mx-auto md:mx-0"></div>
                    <p className="text-white text-xs leading-relaxed opacity-90">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Cards Section */}
      <section className={`py-8 px-4 ${bgColor} transition-colors duration-300`}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Resume Card */}
            <div
              className={`${bgCard} rounded-xl border ${borderColor} p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group`}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2271B5] to-[#1a5a8f] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-md">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-base font-bold ${textPrimary} mb-1`}>
                    Upload Your Resume
                  </h3>
                  <p className={`text-xs ${textSecondary}`}>
                    Get matched with perfect jobs instantly
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className={`${textSecondary} mb-4 leading-relaxed text-xs`}>
                Upload your resume and get discovered by top employers.
              </p>

              {/* Button */}
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-gradient-to-r from-[#2271B5] to-[#1a5a8f] hover:from-[#1a5a8f] hover:to-[#2271B5] text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn text-sm"
              >
                <Upload className="w-4 h-4 group-hover/btn:scale-105 transition-transform" />
                <span>Upload Resume</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Post Job Card */}
            <div
              className={`${bgCard} rounded-xl border ${borderColor} p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group`}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-base font-bold ${textPrimary} mb-1`}>
                    Post a Job
                  </h3>
                  <p className={`text-xs ${textSecondary}`}>
                    Find the perfect candidate for your team
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className={`${textSecondary} mb-4 leading-relaxed text-xs`}>
                Post your job in minutes and start receiving applications.
              </p>

              {/* Button */}
              <button
                onClick={() => navigate('/post-job')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn text-sm"
              >
                <Building2 className="w-4 h-4 group-hover/btn:scale-105 transition-transform" />
                <span>Post Job</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Hiring Companies */}
      <div className={`transition-colors duration-300 ${bgColor}`}>
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-xl font-bold text-center mb-8 transition-colors ${textPrimary}`}>
              Top Hiring Companies
            </h2>

            {/* Slider */}
            <Swiper
              modules={[Autoplay]}
              navigation
              autoplay={{ delay: 2000, disableOnInteraction: false }}
              spaceBetween={8}
              loop={true}
              breakpoints={{
                320: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              className="pb-8"
            >
              {topHiringCompanies.map((company, index) => (
                <SwiperSlide key={index}>
                  <div
                    className={`${hoverBorder} w-32 h-24 mx-auto rounded-lg p-4 flex items-center justify-center transition-all duration-300 hover:shadow-md border cursor-pointer ${cardBg} ${inputBorder} ${
                      isDark ? "hover:bg-gray-750" : "hover:bg-gray-50"
                    }`}
                  >
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="object-contain max-h-12"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${company.name}&background=2563eb&color=fff&`;
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      </div>

      {/* Featured Jobs and Demo Form */}
      <div className={` ${bgColor} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Jobs Section - Left Side */}
            <div className="lg:col-span-8">
              <div className={`${cardBg} border ${borderColor} rounded-xl p-4 transition-colors duration-300 h-full`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h1 className={`text-lg sm:text-xl font-bold ${textPrimary} mb-1`}>
                      Recent Jobs Available
                    </h1>
                    <p className={`text-xs ${textSecondary}`}>
                      Explore the latest opportunities
                    </p>
                  </div>
                  <Link to="/jobs" className="text-[#2271B5] hover:text-[#1a5a8f] font-semibold text-xs whitespace-nowrap transition-colors">
                    View all →
                  </Link>
                </div>

                {/* Jobs List */}
                <div className="space-y-3 max-h-[1000px] overflow-y-auto pr-2">
                  {featuredJobsLoading && <SkeletonJobCard count={5} />}
                  
                  {!featuredJobsLoading && featuredJobsError && (
                    <ErrorBox 
                      error={featuredJobsError} 
                      onRetry={() => window.location.reload()}
                      title="Failed to load jobs"
                    />
                  )}

                  {!featuredJobsLoading && !featuredJobsError && featuredJobs.slice(0, 5).map(job => (
                    <JobCard
                      key={job.job_id || job.id}
                      job={job}
                      onBookmark={toggleBookmark}
                      isBookmarked={bookmarkedJobs.has(job.job_id || job.id)}
                      isDark={isDark}
                    />
                  ))}
                </div>
               <div className="flex justify-center py-4">
                <Link to="/jobs" className=" text-[#2271B5] hover:text-[#1a5a8f] font-semibold text-xl whitespace-nowrap transition-colors">
                    View all →
                  </Link>
               </div>

                
              </div>
              
            </div>

            {/* Contact Form Section - Right Side */}
            <div className="lg:col-span-4">
              <div className={`${cardBg1} rounded-xl shadow-lg overflow-hidden transition-colors duration-300`}>
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-4 text-center">
                  <h3 className="text-base font-bold text-black mb-2">Request Free Demo</h3>
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Send className="w-6 h-6 black" />
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      className={`w-full px-3 py-2 rounded-md border ${inputBorder} ${inputBg} ${inputText} placeholder-gray-400 focus:ring-1 focus:ring-[#2271B5] focus:border-transparent transition-all duration-300 text-xs`}
                      value={demoData.fullName}
                      onChange={(e) => handleDemoInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className={`w-full px-3 py-2 rounded-md border ${inputBorder} ${inputBg} ${inputText} placeholder-gray-400 focus:ring-1 focus:ring-[#2271B5] focus:border-transparent transition-all duration-300 text-xs`}
                      value={demoData.email}
                      onChange={(e) => handleDemoInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-medium ${textSecondary} mb-1`}>I am a:</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleDemoInputChange('userType', 'candidate')}
                        className={`flex-1 py-2 px-3 rounded-md font-semibold transition-all duration-300 text-xs ${
                          demoData.userType === 'candidate'
                            ? 'bg-[#2271B5] text-white shadow-md scale-105'
                            : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Candidate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoInputChange('userType', 'recruiter')}
                        className={`flex-1 py-2 px-3 rounded-md font-semibold transition-all duration-300 text-xs ${
                          demoData.userType === 'recruiter'
                            ? 'bg-[#2271B5] text-white shadow-md scale-105'
                            : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Recruiter
                      </button>
                    </div>
                  </div>

                  <div>
                    <textarea 
                      placeholder="Message"
                      rows={3}
                      className={`w-full px-3 py-2 rounded-md border ${inputBorder} ${inputBg} ${inputText} placeholder-gray-400 focus:ring-1 focus:ring-[#2271B5] focus:border-transparent transition-all duration-300 resize-none text-xs`}
                      value={demoData.message}
                      onChange={(e) => handleDemoInputChange('message', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <button 
                      onClick={handleDemoSubmit}
                      className="w-full bg-[#2271B5] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      disabled={demoLoading}
                    >
                      {demoLoading ? (
                        <span className="flex items-center justify-center gap-1">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </span>
                      ) : "Submit Request"}
                    </button>
                  </div>

                  {demoSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md flex items-center gap-1 text-xs">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Request sent successfully!
                    </div>
                  )}
                  
                  {demoError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs">
                      {demoError}
                    </div>
                  )}
                </div>

                <div className={`${isDark ? 'bg-gray-700' : 'bg-[#2271B5]/10'} p-3 text-center transition-colors duration-300`}>
                  <p className={`text-xs ${textSecondary}`}>
                    Get started with your free demo today and explore all features!
                  </p>
                </div>
              </div>

              {/* Axis Banner */}
              <section className="hidden lg:block my-6 pt-6 transition-colors duration-300">
                <div className="max-w-4xl mx-auto">
                  
                  <div className="">
                    <img 
                      src={axisBanner1} 
                      alt="Axis Bank Banner" 
                      className="w-full h-auto object-cover rounded-xl"
                      loading="lazy"
                    />
                   
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Employer Section */}
      <section className={`${bgColor} p-8 transition-colors duration-300`}>
        <div className={`${cardBg} shadow-lg border ${borderColor} max-w-5xl mx-auto rounded-xl transition-colors duration-300 h-full`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className={`text-xl sm:text-2xl font-bold ${textPrimary} mb-6`}>
                Are You an Employer?
              </h2>
              <p className={`text-sm ${textSecondary} mb-8`}>
                Find the perfect candidates for your company and post job openings with ease
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link 
                  to="/recruiter/login"
                  className="w-full sm:w-auto bg-[#2271B5] hover:bg-[#1a5a8f] text-white font-bold px-6 py-3 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-1 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Your Hire
                </Link>
                <Link 
                  to="/post-job"
                  className={`w-full sm:w-auto ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'} font-bold px-6 py-3 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 border ${isDark ? 'border-gray-600' : 'border-[#2271B5]'} flex items-center justify-center gap-1 text-sm`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Post a Job
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className={`${bgColor} py-8 sm:py-8 lg:py-12 transition-colors duration-300 relative`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-12">
            <div className="inline-block">
              <h2 className={`text-xl sm:text-2xl font-bold ${textPrimary} mb-1`}>
                Unlock Your Dream Job Working Process
              </h2>
              <div className="flex justify-center gap-1 mt-2">
                <div className="w-8 h-0.5 bg-[#2271B5] rounded-full"></div>
                <div className="w-8 h-0.5 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative">
                    {/* Mobile Dotted Line */}
                    {index < steps.length - 1 && (
                      <div className="lg:hidden absolute left-1/2 top-24 -translate-x-1/2 h-12 w-0.5">
                        <svg className="w-full h-full">
                          <line
                            x1="50%"
                            y1="0"
                            x2="50%"
                            y2="100%"
                            stroke={isDark ? '#6B7280' : '#D1D5DB'}
                            strokeWidth="2"
                            strokeDasharray="6,6"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Step Card */}
                    <div className="flex flex-col items-center text-center">
                      {/* Icon Circle */}
                      <div className={`${step.color} w-12 h-12 rounded-full flex items-center justify-center mb-4 relative z-10 ${badgeShadow} shadow-md`}>
                        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <h3 className={`text-sm font-semibold ${textPrimary} mb-2`}>
                        {step.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Decorative Line */}
          <div className="flex justify-center gap-1 mt-12">
            <div className="w-8 h-0.5 bg-[#2271B5] rounded-full"></div>
            <div className={`w-8 h-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-full`}></div>
          </div>
        </div>
      </section>

      {/* Upload Resume Section */}
      <div>
        <section className="bg-black relative min-h-20 flex items-center justify-center overflow-hidden">
          {/* Background Image Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{
              backgroundImage: `url(${upload1})`
            }}
          />

          {/* Content Container */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            {/* Badge with scroll animation */}
            <div 
              className={`inline-block mb-4 transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-4'
              }`}
            >
              <span className="bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider inline-block backdrop-blur-sm">
                Getting Started To Work
              </span>
            </div>

            {/* Main Heading with scroll animation */}
            <h1 
              className={`text-white font-bold text-2xl sm:text-3xl lg:text-3xl xl:text-3xl leading-tight mb-4 transition-all duration-700 delay-100 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-4'
              }`}
            >
              Don't just find. Be found. 
              <br />
              Put your CV in front of 
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">great employers</span>
              </span>
            </h1>

            {/* Description with scroll animation */}
            <p 
              className={`text-blue-100 text-xs sm:text-sm lg:text-sm max-w-2xl mx-auto mb-8 leading-relaxed transition-all duration-700 delay-200 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-4'
              }`}
            >
              It helps you to increase your chances of finding a suitable job and let recruiters contact you about jobs that are not needed to pay for advertising.
            </p>

            {/* Upload Button with scroll animation */}
            <div 
              className={`transition-all duration-700 delay-300 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 -translate-y-4'
              }`}
            >
              <button 
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md font-semibold text-sm sm:text-sm inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Upload className="w-4 h-4" />
                Upload Your Resume
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 to-transparent" />
        </section>
      </div>

      {/* Job Categories Section */}
      <div className={`hidden md:block ${bgColor} w-full transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center max-w-2xl">
              <span className={`${badgeBg} text-white text-xs font-semibold px-3 py-1 rounded uppercase tracking-wider ${badgeShadow}`}>
                Job Category
              </span>
              <h1 className={`font-bold text-xl sm:text-2xl lg:text-3xl ${textPrimary}`}>
                Choose Your Desire Category
              </h1>
            </div>

            {/* Job Role Grid */}
            <div className="w-full max-w-5xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {jobRoleDefinitions.map((role, index) => (
                  <JobRoleCard key={index} {...role} isDark={isDark} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Searches Section */}
      <div className={`transition-colors duration-300 ${bgColor}`}>
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-2xl font-bold mb-8 transition-colors ${textPrimary}`}>
              Popular Searches
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularSearches.map((search, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate(search.link)}
                  className={`rounded-lg p-4 flex justify-between items-center cursor-pointer transition-all duration-300 hover:shadow-md border ${cardBg} ${inputBorder} ${
                    isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-grow pr-3">
                    <span className={`text-xs font-semibold tracking-wider mb-1 block uppercase ${textSecondary}`}>
                      TRENDING AT {search.trend}
                    </span>
                    
                    <h3 className={`text-base font-bold mb-3 ${textPrimary}`}>
                      {search.title}
                    </h3>
                    <Link to={search.link}>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${badgeBg} bg-opacity-20 px-2 py-1 rounded-full ${textPrimary}`}>
                        View all <ArrowRight size={12} />
                      </span>
                    </Link>
                  </div>
                  
                  <img 
                    src={search.image} 
                    alt={search.title} 
                    style={{ width: '80px', height: '80px' }}
                    className="object-cover rounded-md flex-shrink-0"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Axis Banner and Trusted Companies */}
      <div className={`transition-colors duration-300 ${bgColor}`}>
        {/* Axis Banner */}
        <section className={`${bgColor} mx-4 transition-colors duration-300`}>
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <img 
                src={axisBanner} 
                alt="Axis Bank Banner" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Trusted Companies Section with Infinite Scroll */}
        <section className={`py-12 px-4 transition-colors ${bgColor}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-xl font-bold text-center mb-8 transition-colors ${textPrimary}`}>
              Trusted by Leading Companies
            </h2>
            
            <div className="overflow-hidden relative">
              <div className="flex animate-scroll gap-12 items-center">
                {[...companies, ...companies, ...companies].map((company, index) => (
                  <div key={index} className="flex flex-col items-center gap-1 min-w-[100px] flex-shrink-0">
                    <div className={`w-20 h-20 rounded-md flex items-center justify-center shadow-sm border transition-colors ${
                      isDark ? 'bg-white border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      <img 
                        src={company.logo} 
                        alt={company.name}
                        className="w-10 h-10 object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${company.name}&background=2563eb&color=fff&size=40`;
                        }}
                      />
                    </div>
                    <span className={`text-xs font-semibold text-center transition-colors ${textPrimary}`}>
                      {company.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333%);
            }
          }

          .animate-scroll {
            animation: scroll 30s linear infinite;
          }

          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>

      <Footer />
    </div>
    </>
  );
};

export default Homepage;
