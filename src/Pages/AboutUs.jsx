import React from "react";
import { useTheme } from "../Contexts/ThemeContext";
import { Building2, TrendingUp, Target, Star, Users, Briefcase, Calculator, FileText, Scale, Globe } from "lucide-react";
import styles from "../Styles/AboutUs.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";

const AboutUs = () => {
  const { theme } = useTheme();

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>About Us</h1>
            <p className={styles.heroSubtitle}>
              Empowering businesses through innovative HR solutions and professional recruitment services
            </p>
            <button className={styles.heroButton}>Discover Our Journey</button>
          </div>
         
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.counterNumber} data-target="500" data-suffix="+">0+</div>
            <div className={styles.statLabel}>Successful Placements</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.counterNumber} data-target="150" data-suffix="+">0+</div>
            <div className={styles.statLabel}>Partner Companies</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.counterNumber} data-target="10" data-suffix="+">0+</div>
            <div className={styles.statLabel}>Years of Excellence</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.counterNumber} data-target="95" data-suffix="%">0%</div>
            <div className={styles.statLabel}>Client Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.storySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Story</h2>
          <p className={styles.sectionSubtitle}>Building bridges between talent and opportunity across India</p>
        </div>
        <div className={styles.storyContent}>
          <div className={styles.storyGrid}>
            <div className={styles.storyCard}>
              <Building2 className={styles.cardIcon} />
              <h3>Our Foundation</h3>
              <p>
                Bigsources Manpower Solution PVT. LTD. is a young, vibrant and fast growing recruitment consultant with offices in Indore, with a prime objective of providing professional and value added services in terms of recruitment of quality manpower.
              </p>
              <p>
                We have been providing our recruitment services to a large spectrum of reputed companies all across the nation. Our strategy is to provide professionalism of highest standard to our clients.
              </p>
            </div>

            <div className={styles.storyCard}>
              <TrendingUp className={styles.cardIcon} />
              <h3>Our Evolution</h3>
              <p>
                Over the years we have evolved into one of the most reputed and reliable name for all aspects of HR Consultancy and Recruitment services in India. Payroll outsourcing is the act of delegating payroll administration to third party having expertise in payroll processes.
              </p>
              <p>
                Generally companies outsource their payroll functions to cut costs, and to get better services. Moreover such companies can concentrate on core business activities with more time available.
              </p>
            </div>

            <div className={styles.storyCard}>
              <Target className={styles.cardIcon} />
              <h3>Our Mission</h3>
              <p>
                Bigsources Manpower Solution PVT. LTD. was established with a mission to provide world class Executive Search and Consulting services to our clients to help them enhance their competitiveness through quality human capital.
              </p>
              <p>
                At the same time we aim to help candidates achieve their career objectives. We have a highly motivated team of HR consultants with professional skills and proven expertise.
              </p>
            </div>

            <div className={styles.storyCard}>
              <Star className={styles.cardIcon} />
              <h3>Our Vision</h3>
              <p>
                We were established by a team of dedicated and trained professionals to be the single stop for offshore company formation, business and legal services for clients in India and abroad.
              </p>
              <p>
                The aim of the company is to provide best quality consultancy service at affordable prices to service the specific requirements of the clients in various spheres of business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.servicesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Services</h2>
          <p className={styles.sectionSubtitle}>Comprehensive solutions for all your HR and business needs</p>
        </div>
        <div className={styles.servicesGrid}>
          <div className={styles.featureCard}>
            <Users className={styles.featureIcon} />
            <h3>Recruitment Services</h3>
            <p>Professional recruitment solutions for identifying, evaluating and successfully hiring the best possible candidates.</p>
          </div>
          <div className={styles.featureCard}>
            <Briefcase className={styles.featureIcon} />
            <h3>Executive Search</h3>
            <p>Specialized executive search services to help you find top-tier leadership talent that drives organizational success.</p>
          </div>
          <div className={styles.featureCard}>
            <Calculator className={styles.featureIcon} />
            <h3>Payroll Outsourcing</h3>
            <p>Complete payroll management services that allow you to focus on core business activities while we handle complexities.</p>
          </div>
          <div className={styles.featureCard}>
            <FileText className={styles.featureIcon} />
            <h3>HR Consultancy</h3>
            <p>Comprehensive HR consulting services including policy development, compliance, and organizational development.</p>
          </div>
          <div className={styles.featureCard}>
            <Scale className={styles.featureIcon} />
            <h3>Legal Services</h3>
            <p>Business formation, legal compliance, and regulatory services to support your business operations and growth.</p>
          </div>
          <div className={styles.featureCard}>
            <Globe className={styles.featureIcon} />
            <h3>Global Solutions</h3>
            <p>International business services and offshore company formation to help you expand globally.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
