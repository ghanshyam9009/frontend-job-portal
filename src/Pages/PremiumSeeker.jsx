import React from "react";
import styles from "./PremiumSeeker.module.css";
import HomeNav from "../Components/HomeNav";
import Footer from "../Components/Footer";
import { CheckCircle, Star, Users, Award, TrendingUp, Crown, ArrowRight, Phone, Mail, Calendar } from 'lucide-react';

const PremiumSeeker = () => {
  const executiveFeatures = [
    "Executive Career Coach with 15+ years experience",
    "Bi-weekly one-on-one strategy sessions",
    "Executive personal branding and positioning",
    "Board-level interview preparation",
    "C-Suite and leadership networking opportunities",
    "Comprehensive leadership assessment",
    "Personal brand development and management",
    "Direct access to executive search firms",
    "Advanced salary optimization strategies",
    "Career transition and relocation support",
    "Executive presence and communication coaching",
    "Industry thought leadership positioning"
  ];

  const processSteps = [
    {
      step: "1",
      title: "Executive Assessment",
      description: "Comprehensive evaluation of your executive presence, leadership style, and market positioning"
    },
    {
      step: "2",
      title: "Strategic Positioning",
      description: "Development of your unique value proposition and executive personal brand strategy"
    },
    {
      step: "3",
      title: "Network Activation",
      description: "Strategic introduction to key decision-makers and executive search partners"
    },
    {
      step: "4",
      title: "Interview Excellence",
      description: "Rigorous preparation for board-level interviews and presentations"
    },
    {
      step: "5",
      title: "Offer Strategy",
      description: "Advanced negotiation strategies for executive compensation and benefits"
    },
    {
      step: "6",
      title: "Transition Management",
      description: "Seamless onboarding support and long-term career partnership"
    }
  ];

  const testimonials = [
    {
      name: "Vikram Singh",
      role: "Chief Technology Officer",
      company: "Fortune 500 Tech Company",
      content: "The Premium Seeker program positioned me perfectly for CTO roles. The executive networking was invaluable for my career transition.",
      rating: 5
    },
    {
      name: "Meera Patel",
      role: "VP of Operations",
      company: "Manufacturing Corp",
      content: "From Director to VP in 5 months. The leadership assessment and personal branding transformed how I presented myself to boards.",
      rating: 5
    },
    {
      name: "Arjun Kumar",
      role: "Managing Director",
      company: "Financial Services Firm",
      content: "The executive presence coaching and C-suite connections opened doors I didn't know existed. Worth every penny.",
      rating: 5
    }
  ];

  const pricingTiers = [
    {
      name: "Executive Track",
      duration: "4 Months",
      price: "₹35,000",
      popular: false,
      features: [
        "Executive Career Coach",
        "Bi-weekly Sessions",
        "Executive Branding",
        "Board Interview Prep",
        "C-Suite Networking",
        "Leadership Assessment"
      ]
    },
    {
      name: "Leadership Track",
      duration: "6 Months",
      price: "₹50,000",
      popular: true,
      features: [
        "Everything in Executive Track",
        "Personal Brand Management",
        "Executive Search Access",
        "Salary Optimization",
        "Career Transition Support",
        "Long-term Partnership"
      ]
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <HomeNav />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Crown size={20} />
            <span>Executive Program</span>
          </div>
          <h1 className={styles.heroTitle}>Premium Seeker Program</h1>
          <p className={styles.heroSubtitle}>
            Elite career transformation program designed for senior leaders and executives ready to reach the C-suite
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>98%</span>
              <span className={styles.statLabel}>Executive Placement Rate</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>4-6 months</span>
              <span className={styles.statLabel}>Program Duration</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>₹2L+</span>
              <span className={styles.statLabel}>Average Salary Increase</span>
            </div>
          </div>
          <div className={styles.heroButtons}>
            <button className={styles.primaryBtn}>Apply for Premium Program</button>
            <button className={styles.secondaryBtn}>Schedule Executive Consultation</button>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className={styles.overviewSection}>
        <div className={styles.container}>
          <div className={styles.overviewGrid}>
            <div className={styles.overviewContent}>
              <h2 className={styles.sectionTitle}>Designed for Senior Leaders</h2>
              <p className={styles.overviewText}>
                Our Premium Seeker Program is specifically crafted for experienced professionals
                targeting Director, VP, and C-suite positions. We understand the unique challenges
                and opportunities at the executive level.
              </p>
              <div className={styles.overviewHighlights}>
                <div className={styles.highlight}>
                  <Award size={24} />
                  <span>Executive-level coaching and mentorship</span>
                </div>
                <div className={styles.highlight}>
                  <Users size={24} />
                  <span>Direct access to decision-makers</span>
                </div>
                <div className={styles.highlight}>
                  <TrendingUp size={24} />
                  <span>Advanced career positioning strategies</span>
                </div>
              </div>
            </div>
            <div className={styles.overviewVisual}>
              <div className={styles.tierBadge}>C-Suite Ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className={styles.pricingSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Choose Your Executive Track</h2>
          <div className={styles.pricingGrid}>
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`${styles.pricingCard} ${tier.popular ? styles.popular : ''}`}>
                {tier.popular && <div className={styles.popularBadge}>Most Popular</div>}
                <div className={styles.pricingHeader}>
                  <h3 className={styles.pricingTitle}>{tier.name}</h3>
                  <div className={styles.pricingMeta}>
                    <span className={styles.duration}>{tier.duration}</span>
                    <span className={styles.price}>{tier.price}</span>
                  </div>
                </div>
                <div className={styles.pricingFeatures}>
                  {tier.features.map((feature, i) => (
                    <div key={i} className={styles.featureItem}>
                      <CheckCircle size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <button className={`${styles.pricingBtn} ${tier.popular ? styles.popularBtn : ''}`}>
                  {tier.popular ? 'Start Leadership Track' : 'Choose Executive Track'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={styles.processSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Executive Process</h2>
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

      {/* Executive Features */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Executive-Level Features</h2>
          <div className={styles.featuresGrid}>
            {executiveFeatures.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <CheckCircle size={20} className={styles.featureIcon} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Executive Success Stories</h2>
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
            <h2>Ready for Executive Leadership?</h2>
            <p>Join elite professionals who have reached the C-suite with our premium program</p>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaPrimaryBtn}>Apply for Premium Program</button>
              <button className={styles.ctaSecondaryBtn}>
                <Calendar size={20} />
                Schedule Executive Consultation
              </button>
              <button className={styles.ctaSecondaryBtn}>
                <Phone size={20} />
                Call: +91-9876543210
              </button>
              <button className={styles.ctaSecondaryBtn}>
                <Mail size={20} />
                Email: premium@careerportal.com
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PremiumSeeker;
