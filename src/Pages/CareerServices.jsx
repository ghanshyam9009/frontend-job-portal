import React, { useState } from "react";
import styles from "./CareerServices.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
import { CheckCircle, Star, Clock, Users, Award, TrendingUp, ArrowRight } from 'lucide-react';
import { useTheme } from "../Contexts/ThemeContext";

const CareerServices = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  const careerPaths = [
    {
      title: "Fast Track Program",
      icon: <Clock size={40} />,
      description: "Accelerated career advancement for ambitious professionals",
      duration: "2-3 Months",
      investment: "₹15,000",
      features: [
        "Personal Career Coach",
        "Weekly 1-on-1 Sessions",
        "Job Search Strategy",
        "Interview Mastery",
        "LinkedIn Optimization",
        "Salary Negotiation",
        "Industry Networking",
        "Guaranteed Interviews"
      ],
      link: "/fast-track"
    },
    {
      title: "Premium Seeker Program",
      icon: <Star size={40} />,
      description: "Elite career transformation for senior professionals",
      duration: "4-6 Months",
      investment: "₹35,000",
      features: [
        "Executive Career Coach",
        "Bi-weekly Strategy Sessions",
        "Executive Branding",
        "Board-Level Interview Prep",
        "C-Suite Networking",
        "Leadership Assessment",
        "Personal Brand Development",
        "Executive Search Access",
        "Salary Optimization",
        "Career Transition Support"
      ],
      link: "/premium-seeker"
    }
  ];

  const services = [
    {
      category: "Resume & Profile Services",
      items: [
        {
          title: "Professional Resume Writing",
          description: "ATS-optimized resume tailored to your target roles",
          price: "₹2,500",
          duration: "3-5 days",
          popular: false
        },
        {
          title: "LinkedIn Profile Makeover",
          description: "Complete LinkedIn optimization for maximum visibility",
          price: "₹1,800",
          duration: "2-3 days",
          popular: true
        },
        {
          title: "Cover Letter Creation",
          description: "Compelling cover letters for each application",
          price: "₹1,200",
          duration: "2 days",
          popular: false
        }
      ]
    },
    {
      category: "Interview Preparation",
      items: [
        {
          title: "Mock Interview Sessions",
          description: "Practice interviews with industry experts",
          price: "₹3,000",
          duration: "Per session",
          popular: true
        },
        {
          title: "Technical Interview Prep",
          description: "Coding challenges and system design preparation",
          price: "₹4,000",
          duration: "2 sessions",
          popular: false
        },
        {
          title: "Behavioral Interview Coaching",
          description: "STAR method and storytelling techniques",
          price: "₹2,500",
          duration: "Per session",
          popular: false
        }
      ]
    },
    {
      category: "Career Guidance",
      items: [
        {
          title: "Career Transition Coaching",
          description: "Strategic planning for career changes",
          price: "₹5,000",
          duration: "3 sessions",
          popular: false
        },
        {
          title: "Salary Negotiation Workshop",
          description: "Master the art of salary and benefits negotiation",
          price: "₹2,800",
          duration: "2 sessions",
          popular: true
        },
        {
          title: "Personal Branding Session",
          description: "Build your professional brand and online presence",
          price: "₹3,500",
          duration: "2 sessions",
          popular: false
        }
      ]
    }
  ];

  const stats = [
    { number: "95%", label: "Success Rate", icon: <TrendingUp size={24} /> },
    { number: "500+", label: "Happy Clients", icon: <Users size={24} /> },
    { number: "50+", label: "Expert Coaches", icon: <Award size={24} /> },
    { number: "24/7", label: "Support", icon: <CheckCircle size={24} /> }
  ];

  const handleProgramClick = (link) => {
    // Navigate to the specific program page
    window.location.href = link;
  };

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Accelerate Your Career Growth</h1>
          <p className={styles.heroSubtitle}>
            Professional career services designed to fast-track your journey to success
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.primaryBtn}>Get Started Today</button>
            <button className={styles.outlineBtn}>View Success Stories</button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statText}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Services Grid */}
      <section className={styles.servicesSection}>
        <h2 className={styles.sectionTitle}>Services</h2>
        <p className={styles.sectionSubtitle}>
          Individual services to address specific career needs
        </p>

        <div className={styles.servicesContainer}>
          {services.map((category, index) => (
            <div key={index} className={styles.serviceCategory}>
              <h3 className={styles.categoryTitle}>{category.category}</h3>
              <div className={styles.categoryGrid}>
                {category.items.map((service, i) => (
                  <div key={i} className={`${styles.serviceCard} ${service.popular ? styles.popular : ''}`}>
                    {service.popular && <div className={styles.popularBadge}>Popular</div>}
                    <h4 className={styles.serviceTitle}>{service.title}</h4>
                    <p className={styles.serviceDescription}>{service.description}</p>
                    <div className={styles.serviceFooter}>
                      <div className={styles.servicePrice}>
                        <span className={styles.price}>{service.price}</span>
                        <span className={styles.duration}>{service.duration}</span>
                      </div>
                      <button className={styles.serviceBtn}>Book Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Transform Your Career?</h2>
          <p>Join thousands of professionals who have accelerated their careers with our expert guidance</p>
          <button className={styles.ctaBtn}>Start Your Journey</button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareerServices;
