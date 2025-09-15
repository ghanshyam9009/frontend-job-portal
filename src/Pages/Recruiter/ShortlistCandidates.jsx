import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import styles from "../../Styles/RecruiterDashboard.module.css";

const ShortlistCandidates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [shortlistedCandidates] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      jobTitle: "Senior Frontend Developer",
      experience: "5 years",
      skills: ["React", "JavaScript", "TypeScript"],
      shortlistedDate: "2024-01-15",
      status: "Shortlisted"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      jobTitle: "UX Designer",
      experience: "3 years",
      skills: ["Figma", "Adobe XD", "User Research"],
      shortlistedDate: "2024-01-14",
      status: "Interview Scheduled"
    }
  ]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleContactCandidate = (candidate) => {
    alert(`Contacting ${candidate.name} at ${candidate.email}`);
  };

  const handleScheduleInterview = (candidate) => {
    alert(`Scheduling interview with ${candidate.name}`);
  };

  const handleRemoveFromShortlist = (candidateId) => {
    if (window.confirm("Remove this candidate from shortlist?")) {
      alert("Candidate removed from shortlist");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <RecruiterNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <RecruiterSidebar darkMode={darkMode} />
      <main className={styles.main}>
        <section className={styles.shortlistSection}>
          <div className={styles.sectionHeader}>
            <h1>Shortlisted Candidates</h1>
            <p>Manage your top candidate selections</p>
          </div>

          <div className={styles.candidatesGrid}>
            {shortlistedCandidates.map(candidate => (
              <div key={candidate.id} className={styles.candidateCard}>
                <div className={styles.candidateHeader}>
                  <h3>{candidate.name}</h3>
                  <span className={styles.statusBadge}>{candidate.status}</span>
                </div>
                <div className={styles.candidateInfo}>
                  <p><strong>Position:</strong> {candidate.jobTitle}</p>
                  <p><strong>Experience:</strong> {candidate.experience}</p>
                  <p><strong>Email:</strong> {candidate.email}</p>
                  <p><strong>Shortlisted:</strong> {candidate.shortlistedDate}</p>
                </div>
                <div className={styles.skillsList}>
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>
                <div className={styles.candidateActions}>
                  <button onClick={() => handleContactCandidate(candidate)}>
                    📧 Contact
                  </button>
                  <button onClick={() => handleScheduleInterview(candidate)}>
                    📅 Schedule Interview
                  </button>
                  <button onClick={() => handleRemoveFromShortlist(candidate.id)}>
                    ❌ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ShortlistCandidates;
