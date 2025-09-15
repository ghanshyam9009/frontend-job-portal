import React from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import HomeNav from "../Components/HomeNav";
import styles from "./Jobdescription.module.css";

const Jobdescription = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const job = location.state?.job;
  const derivedTitle = job?.title || (slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Job");

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      alert("Please login first to apply for this job");
      navigate('/candidate/login');
      return;
    }
    
    // Check membership as per the flow diagram
    if (!user?.membership || user?.membership === 'free') {
      alert("You need a premium membership to apply for jobs. Redirecting to membership plans...");
      navigate('/membership');
      return;
    }
    
    // If has membership, proceed with application
    alert("Application submitted successfully!");
    // Here you would typically handle the actual application logic
  };
  return (
    <div>
      <HomeNav />
      <main className={styles.page}>
        <section className={styles.headerCard}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>{derivedTitle}</h1>
            <button className={styles.applyBtn} onClick={handleApplyClick}>Apply Now</button>
          </div>
          <div className={styles.companyRow}>
            <div className={styles.companyIcon}>🏢</div>
            <div className={styles.companyName}>Tech Innovations Inc.</div>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>📍 San Francisco, CA (Remote‑friendly)</span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaItem}>💰 $120,000 - $150,000 / Year</span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaItem}>🕒 Full‑time</span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaItem}>📅 Apply by 2024‑08‑31</span>
          </div>
        </section>

        <section className={styles.contentCard}>
            <div className={styles.Titlecontainer}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>Job Description</h2>
          </div>
          <p>
            Tech Innovations Inc. is seeking a talented and experienced Senior Frontend Developer
            to join our growing team. You will be instrumental in developing and maintaining our
            cutting‑edge web applications, ensuring a seamless and intuitive user experience. This
            role requires a strong understanding of modern web development practices and a passion
            for building high‑quality, performant UIs.
          </p>
          <p>
            As a Senior Frontend Developer, you will collaborate closely with product managers,
            UX/UI designers, and backend engineers to define, design, and implement new features.
            You will also be responsible for mentoring junior developers and contributing to our
            frontend architecture and best practices.
          </p>

          <h3 className={styles.subheading}>Responsibilities</h3>
          <ul className={styles.list}>
            <li>Build and ship high‑quality React components and features.</li>
            <li>Collaborate with cross‑functional teams to scope and deliver projects.</li>
            <li>Optimize applications for speed, accessibility, and scalability.</li>
            <li>Write clean, maintainable code with strong test coverage.</li>
            <li>Review code, mentor teammates, and improve engineering standards.</li>
          </ul>

          <h3 className={styles.subheading}>Requirements</h3>
          <ul className={styles.list}>
            <li>5+ years of professional experience in frontend development.</li>
            <li>Expertise with React, modern JavaScript/TypeScript, and CSS.</li>
            <li>Strong understanding of state management and React hooks.</li>
            <li>Experience with REST/GraphQL, bundlers, and build tools.</li>
            <li>Excellent communication and problem‑solving skills.</li>
          </ul>

          <h3 className={styles.subheading}>Benefits</h3>
          <ul className={styles.list}>
            <li>Competitive salary and equity.</li>
            <li>Health, dental, and vision coverage.</li>
            <li>401(k) with company match.</li>
            <li>Flexible hours and remote‑friendly culture.</li>
            <li>Professional development budget.</li>
          </ul>

          <div className={styles.applyCta}>
            <button className={styles.applyBtnLarge} onClick={handleApplyClick}>Apply Now</button>
            <div className={styles.smallPrint}>Applications close on 2024‑08‑31</div>
          </div>
        </section>
        
        <section className={styles.contentCard}>
  <div className={styles.Titlecontainer}>
    <h2 className={styles.sectionTitle} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
      Skills & Qualifications
    </h2>
  </div>

  <div className={styles.skillsWrapper}>
    <span className={styles.skill}>React</span>
    <span className={styles.skill}>React Router</span>
    <span className={styles.skill}>State Management</span>
    <span className={styles.skill}>HTML5</span>
    <span className={styles.skill}>CSS Modules</span>
    <span className={styles.skill}>Responsive Design</span>
    <span className={styles.skill}>TypeScript</span>
    <span className={styles.skill}>Jest</span>
    <span className={styles.skill}>Accessibility</span>
    <span className={styles.skill}>Performance</span>
    <span className={styles.skill}>API Integration</span>
    <span className={styles.skill}>Design Systems</span>
  </div>
</section>


        <section className={styles.contentCard}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>About Company</h2>
          <p>
            Tech Innovations Inc. builds developer‑first platforms that power thousands of
            businesses worldwide. Our culture values ownership, craftsmanship, and a bias
            for action. We invest heavily in tooling, learning, and a supportive environment
            so engineers can do their best work.
          </p>
          <p>
            We are a distributed team with hubs in San Francisco and New York, and we
            welcome remote teammates across time zones.
          </p>
        </section>

        <section className={styles.contentCard}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>Related Jobs</h2>
          <div className={styles.relatedGrid}>
            <article className={styles.relatedCard}>
              <div className={styles.relatedTop}>
                <div className={styles.relatedIcon}>💼</div>
                <div>
                  <div className={styles.relatedTitle}>Frontend Engineer</div>
                  <div className={styles.relatedMeta}>Remote • $110k‑$140k • Full‑time</div>
                </div>
              </div>
              <button className={styles.relatedBtn}>View</button>
            </article>
            <article className={styles.relatedCard}>
              <div className={styles.relatedTop}>
                <div className={styles.relatedIcon}>💼</div>
                <div>
                  <div className={styles.relatedTitle}>UI Engineer</div>
                  <div className={styles.relatedMeta}>SF/Remote • $120k‑$150k • Full‑time</div>
                </div>
              </div>
              <button className={styles.relatedBtn}>View</button>
            </article>
            <article className={styles.relatedCard}>
              <div className={styles.relatedTop}>
                <div className={styles.relatedIcon}>💼</div>
                <div>
                  <div className={styles.relatedTitle}>React Native Developer</div>
                  <div className={styles.relatedMeta}>Remote • $120k‑$160k • Full‑time</div>
                </div>
              </div>
              <button className={styles.relatedBtn}>View</button>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Jobdescription;


