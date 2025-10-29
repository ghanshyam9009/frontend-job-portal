import React from "react";
import styles from "./FastTrack.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
import { CheckCircle, Clock, Users, Award, TrendingUp, Star, ArrowRight, Phone, Mail } from 'lucide-react';
import { useTheme } from "../Contexts/ThemeContext";

const FastTrack = () => {
  const { theme } = useTheme();
  const programHighlights = [
    "Personal Career Coach assigned to you",
    "Weekly one-on-one strategy sessions",
    "Customized job search roadmap",
    "Interview preparation and mock sessions",
    "LinkedIn profile optimization",
    "Resume and cover letter refinement",
    "Salary negotiation mastery",
    "Industry networking opportunities",
    "Guaranteed interview opportunities",
    "Direct recruiter connections"
  ];

  const processSteps = [
    {
      step: "1",
      title: "Initial Assessment",
      description: "Comprehensive career evaluation and goal setting session"
    },
    {
      step: "2",
      title: "Strategy Development",
      description: "Customized career roadmap and action plan creation"
    },
    {
      step: "3",
      title: "Profile Enhancement",
      description: "Resume, LinkedIn, and personal branding optimization"
    },
    {
      step: "4",
      title: "Skill Building",
      description: "Interview preparation and professional development"
    },
    {
      step: "5",
      title: "Job Search Execution",
      description: "Active job search with recruiter connections"
    },
    {
      step: "6",
      title: "Offer & Negotiation",
      description: "Job offer evaluation and salary negotiation support"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      company: "Tech Corp",
      content: "The Fast Track program helped me land my dream job in just 8 weeks. The personalized coaching was incredible!",
      rating: 5
    },
    {
      name: "Rahul Kumar",
      role: "Product Manager",
      company: "StartupXYZ",
      content: "From career transition to job offer in 10 weeks. The structured approach made all the difference.",
      rating: 5
    },
    {
      name: "Anita Desai",
      role: "Marketing Specialist",
      company: "Digital Agency",
      content: "The interview preparation sessions were game-changing. I felt confident and prepared for every interview.",
      rating: 5
    }
  ];

  return (
    <div className={`${styles.pageContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <HomeNav />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Clock size={20} />
            <span>2-3 Months Program</span>
          </div>
          <h1 className={styles.heroTitle}>Fast Track Your Career Success</h1>
          <p className={styles.heroSubtitle}>
            Intensive career acceleration program designed for ambitious professionals ready to make their next big move
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>95%</span>
              <span className={styles.statLabel}>Success Rate</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>8 weeks</span>
              <span className={styles.statLabel}>Average Time to Placement</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>₹15,000</span>
              <span className={styles.statLabel}>Investment</span>
            </div>
          </div>
          <div className={styles.heroButtons}>
            <button className={styles.primaryBtn}>Enroll Now</button>
            <button className={styles.secondaryBtn}>Schedule Consultation</button>
          </div>
        </div>
      </section>

      {/* Program Highlights */}
      <section className={styles.highlightsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What's Included in Fast Track</h2>
          <div className={styles.highlightsGrid}>
            {programHighlights.map((highlight, index) => (
              <div key={index} className={styles.highlightItem}>
                <CheckCircle size={20} className={styles.checkIcon} />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={styles.processSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Proven 6-Step Process</h2>
          <div className={styles.processGrid}>
            {processSteps.map((step, index) => (
              <div key={index} className={styles.processStep}>
                <div className={styles.stepNumber}>{step.step}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
                {index < processSteps.length - 1 && <ArrowRight className={styles.arrowIcon} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Success Stories</h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.rating}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className={styles.star} />
                    ))}
                  </div>
                </div>
                <p className={styles.testimonialContent}>"{testimonial.content}"</p>
                <div className={styles.testimonialAuthor}>
                  <div>
                    <div className={styles.authorName}>{testimonial.name}</div>
                    <div className={styles.authorRole}>{testimonial.role}</div>
                    <div className={styles.authorCompany}>{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Ready to Fast Track Your Career?</h2>
            <p>Join hundreds of professionals who have accelerated their careers with our proven program</p>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaPrimaryBtn}>Start Fast Track Program</button>
              <button className={styles.ctaSecondaryBtn}>
                <Phone size={20} />
                Call: +91-9876543210
              </button>
              <button className={styles.ctaSecondaryBtn}>
                <Mail size={20} />
                Email: fasttrack@careerportal.com
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FastTrack;
