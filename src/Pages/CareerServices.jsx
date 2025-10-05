import React from "react";
import styles from "./CareerServices.module.css";
import HomeNav from "../Components/HomeNav";

const CareerServices = () => {
  const services = [
    {
      title: "Resume Writing",
      description: "Get a professional resume that stands out to employers.",
      price: "₹1,500",
    },
    {
      title: "LinkedIn Profile Optimization",
      description: "Optimize your LinkedIn profile to attract recruiters.",
      price: "₹1,000",
    },
    {
      title: "Cover Letter Writing",
      description: "A powerful cover letter that highlights your strengths.",
      price: "₹800",
    },
    {
      title: "Interview Preparation",
      description: "Mock interviews and expert tips to ace your next interview.",
      price: "₹2,000",
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <HomeNav />
      <header className={styles.header}>
        <h1 className={styles.title}>Career Services for Job Seekers</h1>
        <p className={styles.subtitle}>
          Invest in your career with our professional services.
        </p>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div key={index} className={styles.serviceCard}>
              <h2 className={styles.serviceTitle}>{service.title}</h2>
              <p className={styles.serviceDescription}>{service.description}</p>
              <p className={styles.servicePrice}>{service.price}</p>
              <button className={styles.purchaseButton}>Purchase Now</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CareerServices;
