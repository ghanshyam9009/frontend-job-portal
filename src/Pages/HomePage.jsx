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
import axisBanner1 from "../assets/a-1.png";
import bannerSmall from "../assets/banner-small.png";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";

// job role card
function JobRoleCard({ title, image, link, isDark }) {
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const cardBorder = isDark ? 'border-gray-700' : 'border-gray-200';
  const cardHoverBorder = isDark ? 'hover:border-[#2271B5]' : 'hover:border-[#2271B5]/50';
  const cardHoverShadow = isDark ? 'hover:shadow-[#2271B5]/20' : 'hover:shadow-xl';
  const iconBg = isDark ? 'bg-[#2271B5]/40' : 'bg-[#2271B5]/10';
  const iconHoverBg = isDark ? 'group-hover:bg-[#2271B5]/60' : 'group-hover:bg-[#2271B5]/20';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const textHoverColor = isDark ? 'group-hover:text-[#2271B5]' : 'group-hover:text-[#2271B5]';
  const imageBrightness = isDark ? 'brightness-110' : '';
 
  return (
    <Link 
      to={link}
      className={`group ${cardBg} rounded-lg p-6 flex flex-col items-center justify-center gap-4 ${cardHoverShadow} transition-all duration-300 cursor-pointer border ${cardBorder} ${cardHoverBorder} min-h-[180px]`}
    >
      <div className={`${iconBg} p-4 rounded-lg ${iconHoverBg} transition-colors duration-300 w-16 h-16 flex items-center justify-center`}>
        <img 
          src={image} 
          alt={title}
          loading="lazy"
          decoding="async"
          className={`w-10 h-10 object-contain ${imageBrightness}`}
        />
      </div>
      <div className="text-center">
        <h3 className={`font-medium text-base ${textColor} leading-snug ${textHoverColor} transition-colors duration-300`}>
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

// for dropdown job

  
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
        const jobs = data.jobs || [];

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
  // const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
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
      title: "Connect and Collaborate ",
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
      try {
        // Fetch only approved jobs
        const response = await fetch('https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs?status=approved&limit=7', {
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
        const mapped = (data.jobs || []).slice(0, 7).map((j, idx) => ({
          id: j.job_id || idx,
          title: j.job_title,
          company_name: j.company_name || "",
          location: j.location || "",
          salary:  formatSalary(j.salary_range),
          job_type: j.employment_type || "Full-time",
          company_logo: null,
          is_premium: j.is_premium || false,
          created_at: j.created_at || j.posted_date,
          description:j.description
        }));

        // Sort: Premium jobs first, then by latest date
        const sortedJobs = mapped.sort((a, b) => {
          if (a.is_premium && !b.is_premium) return -1;
          if (!a.is_premium && b.is_premium) return 1;
          // If both premium or both not, sort by date (latest first)
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });

        setFeaturedJobs(sortedJobs);
      } catch (error) {
        console.error("Failed to fetch featured jobs:", error);
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

        const jobs = data.jobs || [];

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
        // Add phone field as empty or remove userType since it may not be needed
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
    const jobSlug = job.job_title?.toLowerCase().replace(/\s+/g, '-') || job.id;
    navigate(`/job/${jobSlug}`, {
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


  // convert darkMode string to boolean
  darkMode = darkMode === "true";

  if (darkMode) {
    theme = "dark";
    localStorage.setItem("theme", "dark");
  } else {
    theme = "light";
    localStorage.setItem("theme", "light");
  }

  // Optional: Apply theme to HTML (for Tailwind dark mode)
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
  const badgeShadow = isDark ? 'shadow-[#2271B5]/30' : 'shadow-md';
  const toggleBg = isDark ? 'bg-gray-800' : 'bg-white';
  const toggleBorder = isDark ? 'border-gray-600' : 'border-gray-200';
  const toggleShadow = isDark ? 'shadow-gray-900/50' : 'shadow-xl';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
 const inputBg = isDark ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';
    const inputText = isDark ? 'text-white' : 'text-gray-900';
  // animate scroll
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
      
      // Show animation when scrolled down a bit
      if (scrollPosition > windowHeight * 0.1) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Fetch bookmarked jobs on component mount if user is authenticated
  useEffect(() => {
    const fetchBookmarkedJobs = async () => {
      if (user && isAuthenticated && featuredJobs.length > 0) {
        try {
          const userId = user.user_id || user.id;
          if (userId) {
            const response = await candidateExternalService.getBookmarkedJobs(userId);
            console.log('Bookmarked jobs response:', response);

            // Handle different response formats
            let bookmarks = [];
            if (response && response.jobs && Array.isArray(response.jobs)) {
              bookmarks = response.jobs;
            } else if (response && Array.isArray(response)) {
              bookmarks = response;
            } else if (response && typeof response === 'object' && response.bookmarks) {
              bookmarks = Array.isArray(response.bookmarks) ? response.bookmarks : [response.bookmarks];
            } else if (response && typeof response === 'object') {
              // If it's a single job object, make it an array
              bookmarks = [response];
            }

            console.log('Processing bookmarks:', bookmarks);
            console.log('Available job IDs from page:', featuredJobs.map(job => ({ title: job.title, id: job.id, job_id: job.job_id })));

            const bookmarkedJobIds = new Set(bookmarks.map(job => {
              // Try different possible ID fields
              const jobId = job.job_id || job.id;
              console.log('Job bookmark:', job.job_title, '-> ID:', jobId);
              return jobId;
            }).filter(Boolean));
            console.log('Extracted bookmark IDs:', bookmarkedJobIds);
            setBookmarkedJobs(bookmarkedJobIds);
          }
        } catch (error) {
          console.error('Error fetching bookmarked jobs:', error);
        }
      }
    };

    fetchBookmarkedJobs();
  }, [user, isAuthenticated, featuredJobs]);

  const toggleBookmark = async (jobId) => {
    if (!isAuthenticated || !user) {
      // Show login prompt or redirect to login
      alert('Please log in to bookmark jobs.');
      navigate('/candidate/login');
      return;
    }

    setBookmarkLoading(true);
    try {
      const userId = user.user_id || user.id;
      if (!userId) {
        alert('User ID not found. Please log in again.');
        navigate('/candidate/login');
        return;
      }

      const isCurrentlyBookmarked = bookmarkedJobs.has(jobId);

      // For now, we'll use the bookmark API which seems to be idempotent
      // If the job is already bookmarked, calling it again should unbookmark
      await candidateExternalService.bookmarkJob({
        user_id: userId,
        job_id: jobId
      });

      // Update local state
      setBookmarkedJobs(prev => {
        const newSet = new Set(prev);
        if (newSet.has(jobId)) {
          newSet.delete(jobId);
        } else {
          newSet.add(jobId);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    } finally {
      setBookmarkLoading(false);
    }
  };
  // Calculate time ago from created_at
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMs = now - created;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Generate company initials for fallback logo
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
    <div className={styles.container}>
      {/* Navigation */}


{user?<CandidateNavbar/>:<HomeNav/>}
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
    <div className="absolute inset-0  "></div>
  </div>

  {/* Hero Section */}
  {/* Increased vertical padding on larger screens (pt, pb) */}
  <div className="  relative z-10 max-w-8xl mx-auto px-6 sm:px-6 lg:px-16 pt-28 pb-24 md:pt-32 md:pb-28">
    {/* Main Heading */}
    <div className="text-center mb-8 md:mb-16">
      {/* Increased text size for xl screens */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-white ">
        Find Your Dream Job Today!
      </h1>
      {/* Increased paragraph text size on larger screens */}
      <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto">
        Discover thousands of opportunities from top companies worldwide
      </p>
    </div>

    {/* Search Bar */}
    {/* Increased max-width for the search bar container */}
    <div className="max-w-5xl mx-auto mb-10">
            <div className="rounded-xl shadow-2xl flex flex-col md:flex-row relative overflow-visible bg-gray-800/90 backdrop-blur-sm">
              
              {/* Job Title Input with Autocomplete */}
              <div className="flex-1 relative" ref={jobTitleRef}>
                <div className="p-5 border-b md:border-b-0 md:border-r border-gray-700">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5  text-white  flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Job Title or Keyword"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      onFocus={() => jobTitle.trim() && setShowJobTitleDropdown(true)}
                      className="w-full focus:outline-none text-lg bg-transparent text-white placeholder-white"
                    />
                  </div>
                </div>
                
                {/* Job Title Dropdown */}
                {showJobTitleDropdown && filteredJobTitles.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto z-100">
                    {filteredJobTitles.map((title, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 hover:bg-blue-600 transition-colors text-white text-sm border-b border-gray-700 last:border-b-0"
                        onMouseDown={() => handleJobTitleSelect(title)}
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Input with Autocomplete */}
              <div className="flex-1 relative" ref={locationRef}>
                <div className="p-5 border-b md:border-b-0 md:border-r border-gray-700">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5  text-white flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Select Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onFocus={() => location.trim() && setShowLocationDropdown(true)}
                      className="w-full focus:outline-none text-lg bg-transparent text-white placeholder-white"
                    />
                  </div>
                </div>
                
                {/* Location Dropdown */}
                {showLocationDropdown && filteredLocations.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto z-50">
                    {filteredLocations.map((loc, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 hover:bg-blue-600 transition-colors text-white text-sm border-b border-gray-700 last:border-b-0"
                        onMouseDown={() => handleLocationSelect(loc)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{loc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Category Input with Autocomplete */}
              <div className="flex-1 relative" ref={categoryRef}>
                <div className="p-5 border-b md:border-b-0 md:border-r border-gray-700">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-white flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      onFocus={() => category.trim() && setShowCategoryDropdown(true)}
                      className="w-full focus:outline-none text-lg bg-transparent text-white placeholder-white"
                    />
                  </div>
                </div>
                
                {/* Category Dropdown */}
                {showCategoryDropdown && filteredCategories.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto z-50">
                    {filteredCategories.map((cat, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-3 hover:bg-blue-600 transition-colors text-white text-sm border-b border-gray-700 last:border-b-0"
                        onMouseDown={() => handleCategorySelect(cat)}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
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
                className="bg-blue-600 rounded-bl-xl rounded-tl-xl rounded-tr-xl rounded-br-xl   hover:bg-blue-700 text-white px-8 py-5 font-semibold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Search Job
              </button>
            </div>
          </div>

    {/* Stats Section */}
    {/* Increased max-width for the stats container */}
    <div className=" grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      
      {/* Jobs */}
      {/* Increased icon container size, icon size, and text sizes */}
      <div className="hidden md:flex items-center gap-4 justify-center">
        <div className="w-16 h-16 md:w-18 md:h-18 bg-[#2042E3] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <Briefcase size={32} className="text-white" />
        </div>
        <div className="text-white">
          <div className="text-3xl md:text-2xl font-bold">25,850</div>
          <div className="text-base md:text-lg text-gray-300">Jobs</div>
        </div>
      </div>

      {/* Candidates */}
      {/* Increased icon container size, icon size, and text sizes */}
      <div className="hidden md:flex flex items-center gap-4 justify-center">
        <div className="w-16 h-16 md:w-18 md:h-18 bg-[#2042E3] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <Users size={32} className="text-white" />
        </div>
        <div className="text-white">
          <div className="text-3xl md:text-2xl font-bold">10,250</div>
          <div className="text-base md:text-lg text-gray-300">Candidates</div>
        </div>
      </div>

      {/* Companies */}
      {/* Increased icon container size, icon size, and text sizes */}
      <div className=" hidden md:flex flex items-center gap-4 justify-center">
        <div className="w-16 h-16 md:w-18 md:h-18 bg-[#2042E3] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
          <Building2 size={32} className="text-white" />
        </div>
        <div className="text-white">
          <div className="text-3xl md:text-2xl font-bold">18,400</div>
          <div className="text-base md:text-lg text-gray-300">Companies</div>
        </div>
      </div>
    </div>
  </div>
</div>
        

 
      

    
    <div className="w-full">
      {/* Blue Info Section */}
      <div className=" bg-[#2271B5] py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start">
                  {/* Icon Circle */}
                  <div className="mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                    <div className="w-20 h-20 rounded-full border-2 border-white border-dashed flex items-center justify-center">
                      <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h3 className="text-white text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <div className="w-12 h-0.5 bg-white mb-4 mx-auto md:mx-0"></div>
                    <p className="text-white text-base leading-relaxed opacity-90">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>

     
      <section className={`py-10 px-4 ${bgColor} transition-colors duration-300`}>
      

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Resume Card */}
          <div
            className={`${bgCard} rounded-2xl border ${borderColor} p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2271B5] to-[#1a5a8f] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${textPrimary} mb-1`}>
                  Upload Your Resume
                </h3>
                <p className={`text-sm ${textSecondary}`}>
                  Get matched with perfect jobs instantly
                </p>
              </div>
            </div>

            {/* Description */}
            <p className={`${textSecondary} mb-6 leading-relaxed`}>
              Upload your resume and get discovered by top employers.
            </p>

            {/* Button */}
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gradient-to-r from-[#2271B5] to-[#1a5a8f] hover:from-[#1a5a8f] hover:to-[#2271B5] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group/btn"
            >
              <Upload className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              <span>Upload Resume</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Post Job Card */}
          <div
            className={`${bgCard} rounded-2xl border ${borderColor} p-8 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${textPrimary} mb-1`}>
                  Post a Job
                </h3>
                <p className={`text-sm ${textSecondary}`}>
                  Find the perfect candidate for your team
                </p>
              </div>
            </div>

            {/* Description */}
            <p className={`${textSecondary} mb-6 leading-relaxed`}>
              Post your job in minutes and start receiving applications.
            </p>

            {/* Button */}
            <button
              onClick={() => navigate('/post-job')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group/btn"
            >
              <Building2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              <span>Post Job</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>


    <div className={`transition-colors duration-300 ${bgColor}`}>
  <section className="py-16 px-4">
    <div className="max-w-6xl mx-auto">
      <h2 className={`text-3xl font-bold text-center mb-12 transition-colors ${textPrimary}`}>
        Top Hiring Companies
      </h2>

      {/* Slider */}
      <Swiper
        modules={[Autoplay]}
        navigation
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        spaceBetween={10}
        loop={true}
        breakpoints={{
          320: { slidesPerView: 1 },   // Mobile
          640: { slidesPerView: 2 },   // Tablet
          1024: { slidesPerView: 4 },  // Large Screens
        }}
        className="pb-10"
      >
        {topHiringCompanies.map((company, index) => (
          <SwiperSlide key={index}>
            <div
              className={`${hoverBorder} w-40 h-30 mx-auto rounded-xl p-6 flex items-center justify-center transition-all duration-300 hover:shadow-xl border cursor-pointer ${cardBg} ${inputBorder} ${
                isDark ? "hover:bg-gray-750" : "hover:bg-gray-50"
              }`}
            >
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                loading="lazy"
                decoding="async"
                className="object-contain"
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

      {/* Featured Jobs */}
  <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Main Content - Jobs and Contact Side by Side */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Jobs Section - Left Side (Takes 7 columns on lg screens) */}
          <div className="lg:col-span-8">
            <div className={`${cardBg} border ${borderColor} rounded-2xl p-6 transition-colors duration-300 h-full`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className={`text-2xl sm:text-3xl font-bold ${textPrimary} mb-2`}>
                    Recent Jobs Available
                  </h1>
                  <p className={`text-sm ${textSecondary}`}>
                    Explore the latest opportunities
                  </p>
                </div>
                <Link to="/jobs" className="text-[#2271B5] hover:text-[#1a5a8f] font-semibold text-sm whitespace-nowrap transition-colors">
                  View all →
                </Link>
              </div>

              {/* Jobs List with Scroll */}
              <div 
                className="space-y-4 max-h-[1200px] overflow-y-auto pr-2"
                style={{ 
                  // scrollbarWidth: 'thin', 
                  // scrollbarColor: isDark ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6' 
                }}
              >
                {featuredJobs.slice(0, 5).map(job => (
                                  <div 
                                    key={job.job_id}
                                    className={`${bgSecondary} rounded-xl shadow-sm border ${borderColor} ${hoverBorder} p-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden cursor-pointer`}
                                    onClick={() => handleJobClick(job)}
                                  >
                                    
                                    {/* Header with time and bookmark */}
                                    <div className="flex items-center justify-between mb-3">
                                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                                        {getTimeAgo(job.created_at)}
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
                                          {job.title}
                      
                                              </h3>
                                        <p className={`text-xs ${textSecondary} font-bold flex items-center gap-1`}>
                                          <Building2 className="w-3 h-3" />
                                          {job.company_name}

                                        </p>

                                      </div>
                                      
                                    </div>
                
                                    {/* Job Details */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                                      <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2.5 py-1.5 rounded-md`}>
                                        <Clock className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                        <span className={`${textSecondary} font-bold`}>{job.job_type}</span>
                                      </div>
                                      <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2.5 py-1.5 rounded-md`}>
                                        <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                        <span className={`${textSecondary} font-bold`}>{job.location}</span>
                                      </div>
                                      <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2.5 py-1.5 rounded-md`}>
                                        <span className="w-3 h-3 text-blue-600 flex-shrink-0 text-xs font-bold">₹</span>
                                        <span className={`${textSecondary} font-bold`}>{job.salary}</span>
                                      </div>
                                      {job.experience_required && (
                                        <div className={`flex items-center gap-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} px-2.5 py-1.5 rounded-md`}>
                                          <Briefcase className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                          <span className={`${textSecondary} font-bold`}>
                                            {job.experience_required.min_years}-{job.experience_required.max_years} yrs
                                          </span>
                                        </div>
                                      )}
                                    </div>
                
                                    {/* Job Description */}
                                    <p className={`${textSecondary1} text-sm mb-4 leading-relaxed`}>
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
    toggleBookmark(job.id);
  }}
  className={`${textSecondary} absolute bottom-2 right-4 hover:text-yellow-500 transition-colors p-1.5 rounded-lg`}
>
  <Bookmark
    className="w-5 h-5"
    fill={bookmarkedJobs.has(job.id) ? "currentColor" : "none"}
  />
</button>

                                   
                                     
                                     
                                      {/* Premium Badge */}
                                    {!job.is_premium && (
                                      <div className="absolute bottom-0 left-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3   rounded-tr-lg shadow-md">
                                        PREMIUM
                                      </div>
                                    )}
                
                                  </div>
                                ))}
              </div>
            </div>
          </div>


          {/* Contact Form Section - Right Side (Takes 5 columns on lg screens) */}
          <div className="lg:col-span-4">

            <div className=" lg:top-8">
              <div className={`${cardBg} rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300`}>
                <div className="bg-gradient-to-r from-[#2271B5] to-[#2271B5] p-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">Request Free Demo</h3>
                  <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Send className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBorder} ${inputBg} ${inputText} placeholder-gray-400 focus:ring-2 focus:ring-[#2271B5] focus:border-transparent transition-all duration-300`}
                      value={demoData.fullName}
                      onChange={(e) => handleDemoInputChange('fullName', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBorder} ${inputBg} ${inputText} placeholder-gray-400 focus:ring-2 focus:ring-[#2271B5] focus:border-transparent transition-all duration-300`}
                      value={demoData.email}
                      onChange={(e) => handleDemoInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>I am a:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDemoInputChange('userType', 'candidate')}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 text-sm ${
                          demoData.userType === 'candidate'
                            ? 'bg-[#2271B5] text-white shadow-lg scale-105'
                            : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Candidate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDemoInputChange('userType', 'recruiter')}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 text-sm ${
                          demoData.userType === 'recruiter'
                            ? 'bg-[#2271B5] text-white shadow-lg scale-105'
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
                      rows={4}
                      className={`w-full px-4 py-2.5 rounded-lg border ${inputBorder} ${inputBg} ${inputText} placeholder-gray-400 focus:ring-2 focus:ring-[#2271B5] focus:border-transparent transition-all duration-300 resize-none`}
                      value={demoData.message}
                      onChange={(e) => handleDemoInputChange('message', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <button 
                      onClick={handleDemoSubmit}
                      className="w-full bg-[#2271B5] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={demoLoading}
                    >
                      {demoLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </span>
                      ) : "Submit Request"}
                    </button>
                  </div>

                  {demoSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Request sent successfully!
                    </div>
                  )}
                  
                  {demoError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {demoError}
                    </div>
                  )}
                </div>

                <div className={`${isDark ? 'bg-gray-700' : 'bg-[#2271B5]/10'} p-4 text-center transition-colors duration-300`}>
                  <p className={`text-sm ${textSecondary}`}>
                    Get started with your free demo today and explore all features!
                  </p>
                </div>
              </div>
            </div>
           

 

      {/* Axis Banner */}
            <section className={`hidden lg:block my-10  transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto">
        <div className="">
          <img 
            src={axisBanner1} 
            alt="Axis Bank Banner" 
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
           

          </div>

        </div>
      </div>
    </div>


      {/* Employer Section */}
       <section className={`${bgColor} p-10 transition-colors duration-300`}>
              <div className={`${cardBg} shadow-2xl border ${borderColor} max-w-7xl mx-auto rounded-2xl  transition-colors duration-300 h-full`}>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className={`text-3xl sm:text-4xl font-bold ${textPrimary} mb-8`}>
              Are You an Employer?
            </h2>
            <p className={`text-lg ${textSecondary} mb-10`}>
              Find the perfect candidates for your company and post job openings with ease
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/recruiter/login"
                className="w-full sm:w-auto bg-[#2271B5] hover:bg-[#1a5a8f] text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Your Hire
              </Link>
              <Link 
                to="/post-job"
                className={`w-full sm:w-auto ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'} font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 border-2 ${isDark ? 'border-gray-600' : 'border-[#2271B5]'} flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post a Job
              </Link>
            </div>
          </div>
        </div>
        </div>
      </section>

     
        <section className={`${bgColor} py-10 sm:py-10 lg:py-15 transition-colors duration-300 relative`}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <div className="inline-block">
            <h2 className={`text-3xl sm:text-4xl font-bold ${textPrimary} mb-2`}>
             Unlock Your Dream Job Working Process
            </h2>
            <div className="flex justify-center gap-2 mt-3">
              <div className="w-12 h-1 bg-[#2271B5] rounded-full"></div>
              <div className="w-12 h-1 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Steps Container */}
        <div className="relative">
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Mobile Dotted Line - Only between items */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute left-1/2 top-32 -translate-x-1/2 h-16 w-0.5">
                      <svg className="w-full h-full">
                        <line
                          x1="50%"
                          y1="0"
                          x2="50%"
                          y2="100%"
                          stroke={isDark ? '#6B7280' : '#D1D5DB'}
                          strokeWidth="2"
                          strokeDasharray="8,8"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Step Card */}
                  <div className="flex flex-col items-center text-center">
                    {/* Icon Circle */}
                    <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 relative z-10 ${badgeShadow} shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-3`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="flex justify-center gap-2 mt-16">
          <div className="w-12 h-1 bg-[#2271B5] rounded-full"></div>
          <div className={`w-12 h-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-full`}></div>
        </div>
      </div>
    </section>
      {/* upload resume section */}
      <div>
      {/* Hero Section */}
      <section className="bg-black relative min-h-24 flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: `url(${upload1})`
          }}
        
        />

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge with scroll animation */}
          <div 
            className={`inline-block mb-6 transition-all duration-700 ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-4'
            }`}
          >
            <span className="bg-white/20 text-white text-xs font-semibold px-6 py-2.5 rounded-full uppercase tracking-wider inline-block backdrop-blur-sm">
              Getting Started To Work
            </span>
          </div>

          {/* Main Heading with scroll animation */}
          <h1 
            className={`text-white font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-5xl leading-tight mb-6 transition-all duration-700 delay-100 ${
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
            className={`text-blue-100 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${
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
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-base sm:text-lg inline-flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Upload className="w-5 h-5" />
              Upload Your Resume
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent" />
      </section>

      
    </div>

      {/* Top Job Roles Section */}
      {/* <section className={styles.topJobRolesSection}>
        <div className={styles.topJobRolesContainer}>
          <h2 className={styles.topJobRolesTitle}>Top Job Roles</h2>
          <div className={styles.jobRolesGrid}>
            {topJobRoles.map((role, index) => (
              <div key={index} className={styles.jobRoleCard} onClick={() => navigate(role.link)}>
                <img src={role.image} alt={role.title} className={styles.jobRoleImage} />
                <div className={styles.jobRoleTitle}>{role.title}</div>
                <div className={styles.jobRoleCount}>{role.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <div>
      <div className={`${bgColor} min-h-screen w-full transition-colors duration-300`}>
        

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center gap-8 sm:gap-10 lg:gap-12">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 text-center max-w-3xl">
              <span className={`${badgeBg} text-white text-xs font-semibold px-4 py-2 rounded uppercase tracking-wider ${badgeShadow}`}>
                Job Category
              </span>
              <h1 className={`font-bold text-3xl sm:text-4xl lg:text-5xl ${textPrimary}`}>
                Choose Your Desire Category
              </h1>
              
            </div>

            {/* Job Role Grid */}
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {jobRoleDefinitions.map((role, index) => (
                  <JobRoleCard key={index} {...role} isDark={isDark} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Popular Searches Section */}
     <div className={`min-h-screen transition-colors duration-300 ${bgColor}`}>
      
      {/* Popular Searches Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-4xl font-extrabold mb-12 transition-colors ${textPrimary}`}>
            Popular Searches
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => handleNavigate(search.link)}
                className={`rounded-xl p-6 flex justify-between items-center cursor-pointer transition-all duration-300 hover:shadow-xl border ${cardBg} ${inputBorder} ${
                  isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-grow pr-4">
                  <span className={`text-xs font-semibold tracking-wider mb-2 block uppercase ${textSecondary}`}>
                    TRENDING AT {search.trend}
                  </span>
                  
                  <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>
                    {search.title}
                  </h3>
                   <Link to={search.link}>
                  <span className={`inline-flex items-center gap-2 text-sm font-semibold ${badgeBg} bg-opacity-20 px-3 py-1 rounded-full ${textPrimary}`}>
                   View all <ArrowRight size={16} />
                  </span>
                  </Link>
                </div>
                
                <img 
                  src={search.image} 
                  alt={search.title} 
                  style={{ width: '100px', height: '100px' }}
                  className="object-cover rounded-lg flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>


<div className={` transition-colors duration-300 ${bgColor}`}>
      
{/* Axis Banner */}
            <section className={`${bgColor} mx-4  transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <img 
            src={axisBanner} 
            alt="Axis Bank Banner" 
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
     
      {/* Trusted Companies Section with Infinite Scroll */}
      <section className={`py-16 px-4 transition-colors ${bgColor}`}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl font-bold text-center mb-12 transition-colors ${textPrimary}`}>
            Trusted by Leading Companies
          </h2>
          
          <div className="overflow-hidden relative">
            <div className="flex animate-scroll gap-16 items-center">
              {[...companies, ...companies, ...companies].map((company, index) => (
                <div key={index} className="flex flex-col items-center gap-2 min-w-[120px] flex-shrink-0">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center shadow-md border transition-colors ${
                    isDark ? 'bg-white border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${company.name}&background=2563eb&color=fff&size=48`;
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
  );
};

export default Homepage;
