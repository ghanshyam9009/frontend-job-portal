import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import styles from "../../Styles/RecruiterDashboard.module.css";

const CandidateApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications] = useState([
    {
      id: 1,
      candidateName: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      jobTitle: "Senior Frontend Developer",
      appliedDate: "2024-01-15",
      status: "Under Review",
      experience: "5 years",
      skills: ["React", "JavaScript", "TypeScript", "Node.js"],
      resumeUrl: "/resumes/john-smith-resume.pdf",
      coverLetter: "I am very interested in this position and believe my experience with React and modern web development makes me a great fit for your team.",
      education: "Bachelor's in Computer Science",
      location: "San Francisco, CA",
      expectedSalary: "₹13L - ₹15L"
    },
    {
      id: 2,
      candidateName: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 234-5678",
      jobTitle: "UX Designer",
      appliedDate: "2024-01-14",
      status: "Shortlisted",
      experience: "3 years",
      skills: ["Figma", "Adobe XD", "Sketch", "User Research"],
      resumeUrl: "/resumes/sarah-johnson-resume.pdf",
      coverLetter: "I have a passion for creating user-centered designs and have worked with several startups to improve their user experience.",
      education: "Master's in Design",
      location: "New York, NY",
      expectedSalary: "₹9.5L - ₹11.5L"
    },
    {
      id: 3,
      candidateName: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "+1 (555) 345-6789",
      jobTitle: "Backend Engineer",
      appliedDate: "2024-01-13",
      status: "Interview Scheduled",
      experience: "6 years",
      skills: ["Python", "Django", "PostgreSQL", "AWS"],
      resumeUrl: "/resumes/mike-chen-resume.pdf",
      coverLetter: "I have extensive experience building scalable backend systems and would love to contribute to your engineering team.",
      education: "Bachelor's in Software Engineering",
      location: "Seattle, WA",
      expectedSalary: "₹14L - ₹16L"
    },
    {
      id: 4,
      candidateName: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1 (555) 456-7890",
      jobTitle: "Product Manager",
      appliedDate: "2024-01-12",
      status: "Rejected",
      experience: "4 years",
      skills: ["Product Strategy", "Analytics", "Agile", "User Research"],
      resumeUrl: "/resumes/emily-davis-resume.pdf",
      coverLetter: "I have successfully launched multiple products and have experience working with cross-functional teams.",
      education: "MBA in Product Management",
      location: "Austin, TX",
      expectedSalary: "₹12L - ₹14L"
    }
  ]);

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleViewResume = (application) => {
    alert(`Opening resume: ${application.resumeUrl}`);
    // Here you would typically open the resume in a new tab or modal
  };

  const handleContactCandidate = (application) => {
    alert(`Contacting ${application.candidateName} at ${application.email}`);
    // Here you would typically open an email composer or contact form
  };

  const handleUpdateStatus = (applicationId, newStatus) => {
    alert(`Status updated to: ${newStatus}`);
    // Here you would typically update the status in your backend
  };

  const handleShortlistCandidate = (application) => {
    alert(`${application.candidateName} has been added to your shortlist!`);
    // Here you would typically add to shortlist in your backend
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === "All" || app.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Review':
        return styles.statusUnderReview;
      case 'Shortlisted':
        return styles.statusShortlisted;
      case 'Interview Scheduled':
        return styles.statusInterview;
      case 'Rejected':
        return styles.statusRejected;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <RecruiterNavbar toggleSidebar={toggleSidebar} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <RecruiterSidebar darkMode={darkMode} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={styles.main}>
        <section className={styles.applicationsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h1>Candidate Applications</h1>
              <p>Review and manage candidate applications for your job postings</p>
            </div>
          </div>

          <div className={styles.filtersSection}>
            <div className={styles.searchAndFilters}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search by candidate name or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <span className={styles.searchIcon}>🔍</span>
              </div>
              <div className={styles.filterTabs}>
                {['All', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected'].map(status => (
                  <button
                    key={status}
                    className={`${styles.filterTab} ${filterStatus === status ? styles.activeFilter : ''}`}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.statsSummary}>
              <span>Total Applications: {applications.length}</span>
              <span>Under Review: {applications.filter(app => app.status === 'Under Review').length}</span>
              <span>Shortlisted: {applications.filter(app => app.status === 'Shortlisted').length}</span>
            </div>
          </div>

          <div className={styles.applicationsGrid}>
            {filteredApplications.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>
                <h3>No applications found</h3>
                <p>No applications match your current filter criteria.</p>
              </div>
            ) : (
              filteredApplications.map(application => (
                <div key={application.id} className={styles.applicationCard}>
                  <div className={styles.applicationHeader}>
                    <div className={styles.candidateInfo}>
                      <h3 className={styles.candidateName}>{application.candidateName}</h3>
                      <p className={styles.jobTitle}>{application.jobTitle}</p>
                      <p className={styles.appliedDate}>Applied: {application.appliedDate}</p>
                    </div>
                    <div className={styles.applicationStatus}>
                      <span className={`${styles.statusBadge} ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>

                  <div className={styles.candidateDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Experience:</span>
                      <span className={styles.detailValue}>{application.experience}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Education:</span>
                      <span className={styles.detailValue}>{application.education}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Location:</span>
                      <span className={styles.detailValue}>{application.location}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Expected Salary:</span>
                      <span className={styles.detailValue}>{application.expectedSalary}</span>
                    </div>
                  </div>

                  <div className={styles.skillsSection}>
                    <span className={styles.skillsLabel}>Skills:</span>
                    <div className={styles.skillsList}>
                      {application.skills.map((skill, index) => (
                        <span key={index} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.coverLetter}>
                    <span className={styles.coverLetterLabel}>Cover Letter:</span>
                    <p className={styles.coverLetterText}>{application.coverLetter}</p>
                  </div>

                  <div className={styles.applicationActions}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleViewResume(application)}
                    >
                      📄 View Resume
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleContactCandidate(application)}
                    >
                      📧 Contact
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleShortlistCandidate(application)}
                    >
                      ⭐ Shortlist
                    </button>
                    <select 
                      className={styles.statusSelect}
                      value={application.status}
                      onChange={(e) => handleUpdateStatus(application.id, e.target.value)}
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CandidateApplications;
