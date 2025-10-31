import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { Search, MapPin, Upload, Building2, Users, CheckCircle, Star, ArrowRight, UserPlus } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import styles from "./HomePage.module.css";
import Footer from "../Components/Footer";
import topHiringStyles from "../Styles/TopHiringCompanies.module.css";
import HomeNav from "../Components/HomeNav";
import { candidateExternalService } from "../services"; 
import { demoService } from "../services/demoService";
import logo2 from "../assets/logo2.png";
import video from "../assets/Untitled design.mp4";
import image1 from "../assets/Screenshot 2025-10-06 190253.png";
import image2 from "../assets/Screenshot 2025-10-06 190818.png";
import image3 from "../assets/Screenshot 2025-10-06 194637.png";
import idbiLogo from "../assets/IDBI.jpg";
import idfcLogo from "../assets/IDFC.jpg";
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [demoData, setDemoData] = useState({ fullName: "", email: "", message: "", userType: "candidate" });
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState(null);
  const [demoSuccess, setDemoSuccess] = useState(false);

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
          salary: j.salary_range ? `₹${j.salary_range.min} - ₹${j.salary_range.max}` : "",
          job_type: j.employment_type || "Full-time",
          company_logo: null,
          is_premium: j.is_premium || false
        }));
        setFeaturedJobs(mapped);
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
      await demoService.requestDemo(demoData);
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

  return (
    <div className={styles.container}>
      {/* Navigation */}
     
<HomeNav/>
      {/* Hero Section */}
      <section className={styles.hero}>
        <video autoPlay loop muted className={styles.heroVideo}>
          <source src={video} type="video/mp4" />
        </video>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Find Your Dream Job Today
            </h1>
            <p className={styles.heroSubtitle}>
              Discover thousands of opportunities from top companies worldwide
            </p>
            
            {/* Search Box */}
            <div className={styles.searchBox}>
              <div className={styles.searchInputs}>
                <div className={styles.inputGroup}>
                  <Search className={styles.inputIcon} />
                  <input 
                    type="text" 
                    placeholder="Job title, keywords, or company"
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <MapPin className={styles.inputIcon} />
                  <input 
                    type="text" 
                    placeholder="Location"
                    className={styles.searchInput}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <button className={styles.searchButton} onClick={handleSearch}>
                  <Search className={styles.buttonIcon} />
                  <span>Search Jobs</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <div className={styles.statNumber}>{stat.number}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.actionsSection}>
        <div className={styles.actionsContainer}>
          <div className={styles.actionsGrid}>
            <div className={styles.actionCard}>
              <div className={styles.actionHeader}>
                <div className={styles.actionIcon}>
                  <Upload className={styles.iconSvg} />
                </div>
                <div className={styles.actionText}>
                  <h3 className={styles.actionTitle}>Upload Your Resume</h3>
                  <p className={styles.actionSubtitle}>Get matched with perfect jobs instantly</p>
                </div>
              </div>
              <p className={styles.actionDescription}>
               Upload your resume and get discovered by top employers.
              </p>
              <button className={styles.actionButton} onClick={() => navigate('/profile')}>
                <Upload className={styles.buttonIcon} />
                <span>Upload Resume</span>
                <ArrowRight className={styles.buttonIcon} />
              </button>
            </div>
            
            <div className={styles.actionCard}>
              <div className={styles.actionHeader}>
                <div className={`${styles.actionIcon} ${styles.actionIconGreen}`}>
                  <Building2 className={styles.iconSvg} />
                </div>
                <div className={styles.actionText}>
                  <h3 className={styles.actionTitle}>Post a Job</h3>
                  <p className={styles.actionSubtitle}>Find the perfect candidate for your team</p>
                </div>
              </div>
              <p className={styles.actionDescription}>
               Post your job in minutes and start receiving applications from top talent.
              </p>
              <button className={`${styles.actionButton} ${styles.actionButtonGreen}`} onClick={() => navigate('/post-job')}>
                <Building2 className={styles.buttonIcon} />
                <span>Post Job</span>
                <ArrowRight className={styles.buttonIcon} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Hiring Companies */}
     

      {/* Featured Jobs */}
      <section className={styles.jobsSection}>
        <div className={styles.jobsContainer}>
          <div className={styles.jobsGrid}>
            <div className={styles.jobsColumn}>
              <div className={styles.jobsHeader}>
                <h2 className={styles.sectionTitle}>Featured Jobs</h2>
              </div>

              <div className={styles.jobsList}>
                {featuredJobs.map((job) => (
                  <div key={job.id} className={styles.jobCard}>
                    {job.is_premium && (
                      <div className={styles.premiumBadge}>
                        <span className={styles.premiumCrown}>👑</span>
                        Premium
                      </div>
                    )}
                    <div className={styles.jobContent}>
                      <div className={styles.jobLeft}>
                        {/* <div className={styles.jobLogo}>
                          {job.company_logo || '🏢'}
                        </div> */}
                        <div className={styles.jobInfo}>
                          <h3 className={styles.jobTitle}>{job.title}</h3>
                          <div className={styles.jobMeta}>
                            <p className={styles.jobCompany}>{job.company_name}</p>
                            <span className={styles.jobLocation}>
                              <MapPin className={styles.metaIcon} />
                              <span>{job.location}</span>
                            </span>
                            <span className={styles.jobSalary}>{job.salary}</span>
                            <span className={styles.jobType}>
                              {job.job_type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className={styles.applyButton} onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/candidate/login');
                        } else {
                          handleJobClick(job);
                        }
                      }}>
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
                <div className={styles.viewAllContainer}>
                  <button className={styles.viewAllBtn} onClick={() => navigate('/jobs')}>
                    <span>View All</span>
                    <ArrowRight className={styles.buttonIcon} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <form className={styles.contactForm} onSubmit={handleDemoSubmit}>

              <div className={styles.formImageContainer}>
                <h3 className={styles.formTitle}>Request</h3>
                <img src={requestDemoImage} alt="Request Free Demo" className={styles.formImage} />
              </div>
              <div className={styles.formFields}>


                <div className={styles.fieldGroup}>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    className={styles.formInput}
                    value={demoData.fullName}
                    onChange={(e) => handleDemoInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
              
               
                <div className={styles.fieldGroup}>
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    className={styles.formInput}
                    value={demoData.email}
                    onChange={(e) => handleDemoInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.userTypeSelector}>
                    <button
                      type="button"
                      className={`${styles.userTypeButton} ${demoData.userType === 'candidate' ? styles.active : ''}`}
                      onClick={() => handleDemoInputChange('userType', 'candidate')}
                    >
                      Candidate
                    </button>
                    <button
                      type="button"
                      className={`${styles.userTypeButton} ${demoData.userType === 'recruiter' ? styles.active : ''}`}
                      onClick={() => handleDemoInputChange('userType', 'recruiter')}
                    >
                      Recruiter
                    </button>
                  </div>
                </div>
             
                <div className={styles.fieldGroup}>
                  <textarea 
                    placeholder="Message"
                    rows={4}
                    className={styles.formTextarea}
                    value={demoData.message}
                    onChange={(e) => handleDemoInputChange('message', e.target.value)}
                    required
                  ></textarea>
                </div>
            
                <div className={styles.formButtons}>
                  <button type="submit" className={styles.submitBtn} disabled={demoLoading}>
                    {demoLoading ? "Sending..." : "Submit"}
                  </button>
                   {/* <img src={jobImage} alt="Job Image" className={styles.formImage} /> */}

                </div>
                {demoSuccess && <p className={styles.successText}>Request sent successfully!</p>}
                {demoError && <p className={styles.errorText}>{demoError}</p>}
              </div>

            </form>
          </div>
        </div>
      </section>



      {/* Employer Section */}
      <section className={styles.employerSection}>
        <div className={styles.employerContainer}>
          <h2 className={styles.employerTitle}>Are You an Employer?</h2>
          <div className={styles.employerButtons}>
            <button className={styles.employerButton} onClick={() => navigate('/recruiter/login')}>
              Search Your Hire
            </button>
            <button className={styles.employerButton} onClick={() => navigate('/post-job')}>
              Post a job
            </button>
          </div>
        </div>
      </section>

      {/* Working Process Section */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsContainer}>
          <h2 className={styles.stepsTitle}>Unlock Your Dream Job Working Process</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepIconContainer}>
                <UserPlus className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Unlock Your Dream Job</h3>
              <p className={styles.stepDescription}>Browse through a diverse range of job listings tailored to your interests and expertise.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIconContainer}>
                <Upload className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Create Your Profile</h3>
              <p className={styles.stepDescription}>Build a standout profile highlighting your skills, experience, and qualifications.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIconContainer}>
                <Search className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Apply with Ease</h3>
              <p className={styles.stepDescription}>Apply To Matching Jobs With Just A Few Simple Clicks.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIconContainer}>
                <CheckCircle className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Track Your Progress</h3>
              <p className={styles.stepDescription}>Apply To Your Dream Job In One Click & Track Progress Live On Your Dashboard!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Job Roles Section */}
      <section className={styles.topJobRolesSection}>
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
      </section>

      {/* Popular Searches Section */}
      <section className={styles.popularSearchesSection}>
        <div className={styles.popularSearchesContainer}>
          <h2 className={styles.popularSearchesTitle}>Popular Searches</h2>
          <div className={styles.popularSearchesGrid}>
            {popularSearches.map((search, index) => (
              <div key={index} className={styles.searchCard} onClick={() => navigate(search.link)}>
                <div className={styles.searchCardContent}>
                  <span className={styles.searchCardTrend}>TRENDING AT {search.trend}</span>
                  <h3 className={styles.searchCardTitle}>{search.title}</h3>
                  <span className={styles.searchCardLink}>View all <ArrowRight size={16} /></span>
                </div>
                <img src={search.image} alt={search.title} className={styles.searchCardImage} />
              </div>
            ))}
          </div>
        </div>
      </section>


 <section className={topHiringStyles.hiringCompaniesSection}>
        <div className={topHiringStyles.hiringCompaniesContainer}>
          <h2 className={topHiringStyles.hiringCompaniesTitle}>Top Hiring Companies</h2>
          <div className={topHiringStyles.logoGrid}>
            {topHiringCompanies.map((company, index) => (
              <div key={index} className={topHiringStyles.logoCard}>
                <img src={company.logo} alt={`${company.name} logo`} className={topHiringStyles.logoImage} />
              </div>
            ))}
          </div>
         
        </div>
      </section>

      {/* Trusted Companies */}
      <section className={styles.companiesSection}>
        <div className={styles.companiesContainer}>
          <h2 className={styles.companiesTitle}>
            Trusted by Leading Companies
          </h2>
          
          <div className={styles.logoSlider}>
            <div className={styles.logoTrack}>
              {[...companies, ...companies, ...companies].map((company, index) => (
                <div key={index} className={styles.logoItem}>
                  <div className={styles.logoImage}>
                    <img src={company.logo} alt={company.name} />
                  </div>
                  <span className={styles.logoName}>{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
