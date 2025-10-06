import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Upload, Building2, Users, CheckCircle, Star, ArrowRight } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import styles from "./HomePage.module.css";
import topHiringStyles from "../Styles/TopHiringCompanies.module.css";
import HomeNav from "../Components/HomeNav";
import { candidateExternalService } from "../services"; 
import { demoService } from "../services/demoService";
import logo2 from "../assets/logo2.png";
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
  { name: "Jio", logo: jioLogo },
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

const BackgroundImage = ({ imageUrl }) => {
  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
  }, [imageUrl]);

  return <div className={styles.heroSlide} style={{ backgroundImage: `url(${imageUrl})` }}></div>;
};

const Homepage = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const data = await candidateExternalService.getAllJobs();
        const mapped = (data?.jobs || []).slice(0, 5).map((j, idx) => ({
          id: j.job_id || idx,
          title: j.job_title,
          company_name: j.company_name || "",
          location: j.location || "",
          salary: j.salary_range ? `₹${j.salary_range.min} - ₹${j.salary_range.max}` : "",
          job_type: j.employment_type || "Full-time",
          company_logo: null
        }));
        setFeaturedJobs(mapped);
      } catch (error) {
        console.error("Failed to fetch featured jobs:", error);
      }
    };

    fetchFeaturedJobs();
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

  return (
    <div className={styles.container}>
      {/* Navigation */}
     
<HomeNav/>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroSlider}>
          <BackgroundImage imageUrl={image1} />
          <BackgroundImage imageUrl={image2} />
          <BackgroundImage imageUrl={image3} />
          <BackgroundImage imageUrl={image1} />
        </div>
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
          <a href="#" className={topHiringStyles.viewAllLink}>View All</a>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className={styles.jobsSection}>
        <div className={styles.jobsContainer}>
          <div className={styles.jobsGrid}>
            <div className={styles.jobsColumn}>
              <div className={styles.jobsHeader}>
                <h2 className={styles.sectionTitle}>Featured Jobs</h2>
                <button className={styles.viewAllBtn} onClick={() => navigate('/jobs')}>
                  <span>View All</span>
                  <ArrowRight className={styles.buttonIcon} />
                </button>
              </div>
              
              <div className={styles.jobsList}>
                {featuredJobs.map((job) => (
                  <div key={job.id} className={styles.jobCard}>
                    <div className={styles.jobContent}>
                      <div className={styles.jobLeft}>
                        <div className={styles.jobLogo}>
                          {job.company_logo || '🏢'}
                        </div>
                        <div className={styles.jobInfo}>
                          <h3 className={styles.jobTitle}>{job.title}</h3>
                          <p className={styles.jobCompany}>{job.company_name}</p>
                          <div className={styles.jobMeta}>
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
                      <button className={styles.applyButton} onClick={() => navigate(`/jobs/${job.id}`)}>
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contact Form */}
            <form className={styles.contactForm} onSubmit={handleDemoSubmit}>
              <h3 className={styles.formTitle}>Request Free Demo</h3>
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
                  <select
                    className={styles.formInput}
                    value={demoData.userType}
                    onChange={(e) => handleDemoInputChange('userType', e.target.value)}
                    required
                  >
                    <option value="candidate">I am a Candidate</option>
                    <option value="recruiter">I am a Recruiter</option>
                  </select>
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
                  <button type="reset" className={styles.resetBtn} onClick={() => setDemoData({ fullName: "", email: "", message: "", userType: "candidate" })}>
                    Reset
                  </button>
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

      {/* Steps Section */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsContainer}>
          <h2 className={styles.stepsTitle}>Get started in 3 easy steps</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepIconContainer}>
                <div className={styles.stepNumber}>1</div>
                <Upload className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Post a Job</h3>
              <p className={styles.stepDescription}>Tell us what you need in a candidate in just 5-minutes.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIconContainer}>
                <div className={styles.stepNumber}>2</div>
                <CheckCircle className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Get Verified</h3>
              <p className={styles.stepDescription}>Our team will call to verify your employer account.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepIconContainer}>
                <div className={styles.stepNumber}>3</div>
                <Users className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Get calls. Hire.</h3>
              <p className={styles.stepDescription}>You will get calls from relevant candidates within one hour or call them directly from our candidate database.</p>
            </div>
          </div>
          <button className={styles.stepsButton} onClick={() => navigate('/post-job')}>
            Post your Job
          </button>
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

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <div className={styles.footerLogoIcon}>
                  <img src={logo2} alt="JobPortal Logo" />
                </div>
                <span className={styles.footerLogoText}></span>
              </div>
              <p className={styles.footerDescription}>Connecting talent with opportunity worldwide.</p>
              <div className={styles.socialLinks}>
                <a href="https://www.facebook.com/pages/Bigsources-Placement-Services/1530903963853104" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className={styles.socialLink}>
                  <FaFacebook />
                </a>
                <a href="#" className={styles.socialLink}><FaTwitter /></a>
                <a href="#" className={styles.socialLink}><FaLinkedin /></a>
              </div>
            </div>
            
            <div className={styles.footerColumn}>
              <h4 className={styles.footerColumnTitle}>Job Seekers</h4>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>Find Jobs</a>
                <a href="#" className={styles.footerLink}>Upload Resume</a>
                <a href="#" className={styles.footerLink}>Company Reviews</a>
                <a href="#" className={styles.footerLink}>Salary Tools</a>
              </div>
            </div>
            
            <div className={styles.footerColumn}>
              <h4 className={styles.footerColumnTitle}>Employers</h4>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>Post a Job</a>
                <a href="#" className={styles.footerLink}>Search Resumes</a>
                <a href="#" className={styles.footerLink}>Employer Branding</a>
                <a href="#" className={styles.footerLink}>Recruiting Solutions</a>
              </div>
            </div>
            
            <div className={styles.footerColumn}>
              <h4 className={styles.footerColumnTitle}>Company</h4>
              <div className={styles.footerLinks}>
                <a href="#" className={styles.footerLink}>About Us</a>
                <a href="#" className={styles.footerLink}>Contact Us</a>
                <a href="#" className={styles.footerLink}>Privacy Policy</a>
                <a href="#" className={styles.footerLink}>Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContent}>
            <div className={styles.copyright}>
              Copyright © Bigsources Manpower Solution PVT. LTD. 2025. All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
