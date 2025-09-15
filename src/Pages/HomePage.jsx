import React from "react";
import { Search, MapPin, Upload, Building2, Users, CheckCircle, Star, ArrowRight } from "lucide-react";
import styles from "./HomePage.module.css";
import HomeNav from "../Components/HomeNav";
import logo2 from "../assets/logo2.png";
import idbiLogo from "../assets/IDBI.jpg";
import idfcLogo from "../assets/IDFC.jpg";
import kotakLogo from "../assets/Kotak.jpg";
import axisLogo from "../assets/Axis.jpg";
import iciciLogo from "../assets/icici.jpg";
import sbiLogo from "../assets/sbi.jpg";
import hdfcLogo from "../assets/hdfc.jpg";

const jobData = [
  {
    title: "Product Manager (AI/ML)",
    company: "InnovatAI",
    location: "Remote",
    salary: "$130k - $180k",
    type: "Full-time",
    logo: "🚀"
  },
  {
    title: "Senior Software Engineer",
    company: "TechCorp",
    location: "New York",
    salary: "$150k - $190k",
    type: "Full-time",
    logo: "💻"
  },
  {
    title: "UX Designer",
    company: "DesignHub",
    location: "San Francisco",
    salary: "$130k - $180k",
    type: "Full-time",
    logo: "🎨"
  },
  {
    title: "Data Scientist",
    company: "DataPro",
    location: "Boston",
    salary: "$140k - $185k",
    type: "Full-time",
    logo: "📊"
  },
  {
    title: "Marketing Manager",
    company: "GrowthCo",
    location: "Remote",
    salary: "$120k - $160k",
    type: "Full-time",
    logo: "📈"
  },
];

const companies = [
  { name: "IDBI", logo: idbiLogo },
  { name: "IDFC", logo: idfcLogo },
  { name: "Kotak", logo: kotakLogo },
  { name: "Axis", logo: axisLogo },
  { name: "ICICI", logo: iciciLogo },
  { name: "SBI", logo: sbiLogo },
  { name: "HDFC", logo: hdfcLogo },
];

const stats = [
  { number: "50K+", label: "Jobs Available" },
  { number: "30K+", label: "Happy Candidates" },
  { number: "500+", label: "Companies" },
  { number: "98%", label: "Success Rate" }
];

const Homepage = () => {
  return (
    <div className={styles.container}>
      {/* Navigation */}
     
<HomeNav/>
      {/* Hero Section */}
      <section className={styles.hero}>
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
                  />
                </div>
                <div className={styles.inputGroup}>
                  <MapPin className={styles.inputIcon} />
                  <input 
                    type="text" 
                    placeholder="Location"
                    className={styles.searchInput}
                  />
                </div>
                <button className={styles.searchButton}>
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
                Let our AI-powered system match you with the best opportunities. Upload your resume and get discovered by top employers.
              </p>
              <button className={styles.actionButton}>
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
                Reach thousands of qualified candidates. Post your job in minutes and start receiving applications from top talent.
              </p>
              <button className={`${styles.actionButton} ${styles.actionButtonGreen}`}>
                <Building2 className={styles.buttonIcon} />
                <span>Post Job</span>
                <ArrowRight className={styles.buttonIcon} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className={styles.jobsSection}>
        <div className={styles.jobsContainer}>
          <div className={styles.jobsGrid}>
            <div className={styles.jobsColumn}>
              <div className={styles.jobsHeader}>
                <h2 className={styles.sectionTitle}>Featured Jobs</h2>
                <button className={styles.viewAllBtn}>
                  <span>View All</span>
                  <ArrowRight className={styles.buttonIcon} />
                </button>
              </div>
              
              <div className={styles.jobsList}>
                {jobData.map((job, index) => (
                  <div key={index} className={styles.jobCard}>
                    <div className={styles.jobContent}>
                      <div className={styles.jobLeft}>
                        <div className={styles.jobLogo}>
                          {job.logo}
                        </div>
                        <div className={styles.jobInfo}>
                          <h3 className={styles.jobTitle}>{job.title}</h3>
                          <p className={styles.jobCompany}>{job.company}</p>
                          <div className={styles.jobMeta}>
                            <span className={styles.jobLocation}>
                              <MapPin className={styles.metaIcon} />
                              <span>{job.location}</span>
                            </span>
                            <span className={styles.jobSalary}>{job.salary}</span>
                            <span className={styles.jobType}>
                              {job.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className={styles.applyButton}>
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contact Form */}
            <div className={styles.contactForm}>
              <h3 className={styles.formTitle}>Get in Touch</h3>
              <div className={styles.formFields}>
                <div className={styles.fieldGroup}>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="gender" value="male" className={styles.radioInput} />
                    <span>Male</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="gender" value="female" className={styles.radioInput} />
                    <span>Female</span>
                  </label>
                </div>
                <div className={styles.fieldGroup}>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <input 
                    type="text" 
                    placeholder="Address"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <textarea 
                    placeholder="Message"
                    rows={4}
                    className={styles.formTextarea}
                  ></textarea>
                </div>
                <div className={styles.fieldGroup}>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    className={styles.fileInput}
                  />
                  <p className={styles.fileHint}>Upload your resume (PDF, DOC, DOCX)</p>
                </div>
                <div className={styles.formButtons}>
                  <button className={styles.submitBtn}>
                    Submit
                  </button>
                  <button className={styles.resetBtn}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
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
                  📘
                </a>
                <span className={styles.socialLink}>🐦</span>
                <span className={styles.socialLink}>💼</span>
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
