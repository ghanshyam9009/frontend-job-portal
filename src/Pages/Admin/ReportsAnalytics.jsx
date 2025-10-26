import React, { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, Users, FileText, DollarSign } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const ReportsAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");

  const stats = [
    { title: "Total Users", value: "2,543", change: "+12%", trend: "up", icon: Users },
    { title: "Active Jobs", value: "1,234", change: "+8%", trend: "up", icon: FileText },
    { title: "Applications", value: "5,678", change: "+15%", trend: "up", icon: FileText },
    { title: "Revenue", value: "$45,678", change: "+23%", trend: "up", icon: DollarSign }
  ];

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Reports & Analytics</h1>
        <p className={styles.pageSubtitle}>View platform statistics and performance metrics</p>
      </div>

      {/* Period Selector */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${selectedPeriod === '7days' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('7days')}
          >
            Last 7 Days
          </button>
          <button
            className={`${styles.filterBtn} ${selectedPeriod === '30days' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('30days')}
          >
            Last 30 Days
          </button>
          <button
            className={`${styles.filterBtn} ${selectedPeriod === '90days' ? styles.active : ''}`}
            onClick={() => setSelectedPeriod('90days')}
          >
            Last 90 Days
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3 className={styles.statTitle}>{stat.title}</h3>
              <span className={`${styles.statChange} ${styles[stat.trend]}`}>
                {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {stat.change}
              </span>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className={styles.chartsContainer}>
        <div className={styles.chartCard}>
          <h3>User Growth</h3>
          <div className={styles.chartPlaceholder}>
            <TrendingUp size={48} /> Chart will be implemented here
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3>Job Postings</h3>
          <div className={styles.chartPlaceholder}>
            <BarChart3 size={48} /> Chart will be implemented here
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
