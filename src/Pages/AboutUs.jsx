import React from "react";
import styles from "../Styles/AboutUs.module.css";
import HomeNav from "../Components/HomeNav";

const AboutUs = () => {
  return (
    <div className={styles.pageContainer}>
      <HomeNav />
      
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1>Innovating the Future of Digital Solutions</h1>
            <p>
              We are a leading technology company dedicated to transforming businesses 
              through innovative digital solutions. Our mission is to empower organizations 
              with cutting-edge technology that drives growth and success.
            </p>
            <button className={styles.learnMoreBtn}>Learn More</button>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.laptopIcon}>💻</div>
          </div>
        </div>
      </section>

      {/* Our Purpose Section */}
      <section className={styles.purposeSection}>
        <div className={styles.sectionHeader}>
          <h2>Our Purpose</h2>
          <p>Driving innovation and excellence in everything we do</p>
        </div>
        <div className={styles.purposeCards}>
          <div className={styles.purposeCard}>
            <div className={styles.cardIcon}>🌐</div>
            <h3>Our Mission</h3>
            <p>
              To revolutionize the digital landscape by providing innovative solutions 
              that empower businesses to achieve their full potential and create lasting 
              value for their customers.
            </p>
          </div>
          <div className={styles.purposeCard}>
            <div className={styles.cardIcon}>💡</div>
            <h3>Our Vision</h3>
            <p>
              To be the global leader in digital transformation, recognized for our 
              innovative approach, exceptional service, and commitment to creating 
              a better future through technology.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.storySection}>
        <div className={styles.storyContent}>
          <div className={styles.storyText}>
            <h2>Our Story</h2>
            <p>
              Founded in 2015, our company began as a small team of passionate developers 
              with a vision to transform how businesses interact with technology. What started 
              as a startup in a small office has grown into a global organization serving 
              clients across multiple industries.
            </p>
            <p>
              Over the years, we've built a reputation for excellence, innovation, and 
              customer satisfaction. Our team has grown from 5 to over 200 dedicated 
              professionals, each bringing unique skills and perspectives to our mission.
            </p>
            <p>
              Today, we continue to push the boundaries of what's possible, leveraging 
              the latest technologies to create solutions that not only meet today's 
              challenges but anticipate tomorrow's opportunities.
            </p>
          </div>
          <div className={styles.storyImage}>
            <div className={styles.teamIcon}>👥</div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.sectionHeader}>
          <h2>Meet Our Team</h2>
          <p>The talented individuals who make our vision a reality</p>
        </div>
        <div className={styles.teamGrid}>
          <div className={styles.teamCard}>
            <div className={styles.teamPhoto}>👩‍💼</div>
            <h3>Dr. Evelyn Reed</h3>
            <p className={styles.teamTitle}>CEO & Founder</p>
            <p className={styles.teamBio}>
              Visionary leader with 15+ years in technology and business strategy. 
              Evelyn founded the company with a mission to democratize access to 
              cutting-edge digital solutions.
            </p>
          </div>
          <div className={styles.teamCard}>
            <div className={styles.teamPhoto}>👨‍💻</div>
            <h3>Michael Chen</h3>
            <p className={styles.teamTitle}>Chief Technology Officer</p>
            <p className={styles.teamBio}>
              Technology innovator and software architect with expertise in cloud 
              computing and AI. Michael leads our technical strategy and ensures 
              we stay at the forefront of innovation.
            </p>
          </div>
          <div className={styles.teamCard}>
            <div className={styles.teamPhoto}>👩‍🎨</div>
            <h3>Sarah Williams</h3>
            <p className={styles.teamTitle}>Head of Marketing</p>
            <p className={styles.teamBio}>
              Creative strategist with a passion for building brands and connecting 
              with customers. Sarah drives our marketing initiatives and helps 
              communicate our value to the world.
            </p>
          </div>
          <div className={styles.teamCard}>
            <div className={styles.teamPhoto}>👨‍🎨</div>
            <h3>David Garcia</h3>
            <p className={styles.teamTitle}>Lead Product Designer</p>
            <p className={styles.teamBio}>
              User experience expert focused on creating intuitive and beautiful 
              interfaces. David ensures our products not only work well but provide 
              exceptional user experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Innovate Together?</h2>
          <p>
            Whether you're looking for innovative solutions for your business or 
            want to join our team of talented professionals, we'd love to hear from you.
          </p>
          <button className={styles.contactBtn}>Contact Us Today</button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <div className={styles.footerLogo}>🌟 JobPortal</div>
            <p>Empowering businesses through innovative digital solutions.</p>
            <div className={styles.socialIcons}>
              <span>💼</span>
              <span>🐦</span>
              <span>📷</span>
              <span>📺</span>
            </div>
          </div>
          <div className={styles.footerRight}>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <a href="/about">About Us</a>
              <a href="/careers">Careers</a>
              <a href="/press">Press</a>
              <a href="/blog">Blog</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Products</h4>
              <a href="/overview">Overview</a>
              <a href="/features">Features</a>
              <a href="/pricing">Pricing</a>
              <a href="/integrations">Integrations</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Resources</h4>
              <a href="/documentation">Documentation</a>
              <a href="/support">Support</a>
              <a href="/community">Community</a>
              <a href="/api">API</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2023 JobPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

