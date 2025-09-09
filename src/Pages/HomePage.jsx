import React from "react";
import HomeNav from "../Components/HomeNav";
import styles from "../Styles/HomePage.module.css";
import heroBg from "../assets/background.jpg";
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
    meta: "Remote  •  $130k - $180k  •  Full-time",
  },
  {
    title: "Product Manager (AI/ML)",
    company: "InnovatAI",
    meta: "Remote  •  $150k - $190k  •  Full-time",
  },
  {
    title: "Product Manager (AI/ML)",
    company: "InnovatAI",
    meta: "Remote  •  $130k - $180k  •  Full-time",
  },
  {
    title: "Product Manager (AI/ML)",
    company: "InnovatAI",
    meta: "Remote  •  $150k - $190k  •  Full-time",
  },
  {
    title: "Product Manager (AI/ML)",
    company: "InnovatAI",
    meta: "Remote  •  $130k - $180k  •  Full-time",
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

const Homepage = () => {
  return (
    <div style={{ width: "100%" }}>
      <HomeNav />
      <header className={styles.hero}>
  <img src={heroBg} alt="Background" className={styles.heroImg} />
  <div className={styles.overlay}>
    <h1>Find your dream job today</h1>
    <p>Search from millions of job openings...</p>
    <div className={styles.searchBox}>
      <input type="text" placeholder="Software Engineer" />
      <input type="text" placeholder="New York, NY" />
      <button>Find Jobs</button>
    </div>
  </div>
</header>
<section className={styles.cardsSection}>
  <div className={styles.cardsGrid}>
    
    <div className={styles.card}>
      <div className={styles.cardIcon}>
        <div className={styles.iconSquare}>
          📄
        </div>
      </div>
      <h3>Upload Your Resume</h3>
      <p>Get matched with jobs and let recruiters find you. It only takes a few seconds.</p>
      <button className={styles.cardBtn}>Upload Resume</button>
    </div>
    <div className={styles.card}>
      <div className={styles.cardIcon}>
        <div className={styles.iconSquare}>
          🏢
        </div>
      </div>
      <h3>post job</h3>
      <p>Discover great places to work and see what they have to offer.</p>
      <button className={styles.cardBtn}>View Companies</button>
    </div>
    
  </div>
</section>

<section className={styles.featuredJobsSection}>
  <h2 className={styles.sectionTitle}>Featured Job Openings</h2>
  <div className={styles.jobsTwoCol}>
    <div className={styles.jobsCol}>
      {jobData.map((job, idx) => (
        <div key={idx} className={styles.jobCard}>
          <div className={styles.jobLeft}>
            <div className={styles.jobIcon}>🏢</div>
            <div className={styles.jobText}>
              <div className={styles.jobTitle}>{job.title}</div>
              <div className={styles.jobCompany}>{job.company}</div>
              <div className={styles.jobMetaRow}>{job.meta}</div>
            </div>
          </div>
          <button className={styles.applyNowBtn}>Apply Now</button>
        </div>
      ))}
      <div className={styles.viewAllWrap}>
        <button className={styles.viewAllBtn}>View All Jobs</button>
      </div>
    </div>
    <aside className={styles.demoCol}>
      <div className={styles.demoCard}>
        <h3>Request Free Demo</h3>
        <label>
          <span>Name</span>
          <input type="text" placeholder="Your name" />
        </label>
        <label>
          <span>Email</span>
          <input type="email" placeholder="you@example.com" />
        </label>
        <button className={styles.demoBtn}>View Companies</button>
      </div>
    </aside>
  </div>
</section>

<section className={styles.trustedSection}>
  <h2 className={styles.sectionTitle}>Trusted by leading companies</h2>
  <div className={styles.logoSlider}>
    <div className={styles.logoTrack}>
      {[...companies, ...companies, ...companies].map((company,  i) => (
        <div key={i} className={styles.logoItem}>
          <img src={company.logo} alt={company.name} className={styles.logoImg} />
          <span className={styles.logoName}>{company.name}</span>
        </div>
      ))}
    </div>
  </div>
</section>

<section className={styles.advertisementSection}>
  <div className={styles.adContainer}>
    <div className={styles.adPlaceholder}>
    </div>
  </div>
</section>

<footer className={styles.footer}>
  <div className={styles.footerInner}>
    <div className={styles.footerBrand}>
      <div className={styles.footerLogo}>⭐ logo</div>
      <p>Connecting talent with opportunity.</p>
      <div className={styles.socialRow}>
        <span></span><span></span><span></span>
      </div>
    </div>
    <div className={styles.footerCols}>
      <div className={styles.footerCol}>
        <h4>Job Seekers</h4>
        <a href="#">Find Jobs</a>
        <a href="#">Upload Resume</a>
        <a href="#">Company Reviews</a>
        <a href="#">Salary Tools</a>
      </div>
      <div className={styles.footerCol}>
        <h4>Employers</h4>
        <a href="#">Post a Job</a>
        <a href="#">Search Resumes</a>
        <a href="#">Employer Branding</a>
        <a href="#">Recruiting Solutions</a>
      </div>
      <div className={styles.footerCol}>
        <h4>CareerConnect</h4>
        <a href="#">About Us</a>
        <a href="#">Contact Us</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </div>
  </div>
  <div className={styles.footerBottom}>
    © {new Date().getFullYear()} JobPortal. All rights reserved.
  </div>
</footer>

    </div>
  );
};

export default Homepage;
