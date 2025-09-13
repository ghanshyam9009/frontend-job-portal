import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import RecruiterSidebar from "../../Components/Recruiter/RecruiterSidebar";
import styles from "../../Styles/RecruiterDashboard.module.css";

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    company: user?.companyName || "",
    location: "",
    type: "Full-time",
    salaryMin: "",
    salaryMax: "",
    currency: "INR",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    skills: [],
    experience: "",
    education: "",
    applicationDeadline: "",
    remote: false
  });

  const [newSkill, setNewSkill] = useState("");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleInputChange = (field, value) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !jobData.skills.includes(newSkill.trim())) {
      setJobData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setJobData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically submit to backend
    alert("Job posted successfully!");
    navigate('/manage-jobs');
  };

  const handleSaveDraft = () => {
    alert("Job saved as draft!");
  };

  return (
    <div className={styles.dashboardContainer}>
      <RecruiterNavbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <RecruiterSidebar darkMode={darkMode} />
      <main className={styles.main}>
        <section className={styles.jobPostingSection}>
          <div className={styles.sectionHeader}>
            <h1>Post New Job</h1>
            <p>Create a compelling job posting to attract the best candidates</p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.jobForm}>
            <div className={styles.formSection}>
              <h2>Basic Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={jobData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={jobData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your company name"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Location *</label>
                  <input
                    type="text"
                    value={jobData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA or Remote"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Job Type *</label>
                  <select
                    value={jobData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    required
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Salary Range</label>
                  <div className={styles.salaryInputs}>
                    <select
                      value={jobData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <input
                      type="number"
                      value={jobData.salaryMin}
                      onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={jobData.salaryMax}
                      onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Experience Required</label>
                  <select
                    value={jobData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                  >
                    <option value="">Select experience level</option>
                    <option value="Entry Level">Entry Level (0-2 years)</option>
                    <option value="Mid Level">Mid Level (3-5 years)</option>
                    <option value="Senior Level">Senior Level (6+ years)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Education Required</label>
                  <select
                    value={jobData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                  >
                    <option value="">Select education level</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor's">Bachelor's Degree</option>
                    <option value="Master's">Master's Degree</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    value={jobData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={jobData.remote}
                      onChange={(e) => handleInputChange('remote', e.target.checked)}
                    />
                    Remote work allowed
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Job Description</h2>
              <div className={styles.formGroup}>
                <label>Job Description *</label>
                <textarea
                  value={jobData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, company culture, and what makes this opportunity unique..."
                  rows={6}
                  required
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Requirements & Responsibilities</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Key Responsibilities *</label>
                  <textarea
                    value={jobData.responsibilities}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                    placeholder="List the main responsibilities and duties..."
                    rows={4}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Requirements *</label>
                  <textarea
                    value={jobData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="List the required skills, qualifications, and experience..."
                    rows={4}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Benefits & Perks</label>
                  <textarea
                    value={jobData.benefits}
                    onChange={(e) => handleInputChange('benefits', e.target.value)}
                    placeholder="List the benefits, perks, and what you offer..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Skills & Keywords</h2>
              <div className={styles.skillsSection}>
                <div className={styles.skillInput}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, JavaScript, Python)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                  <button type="button" onClick={handleAddSkill} className={styles.addSkillBtn}>
                    Add
                  </button>
                </div>
                <div className={styles.skillsList}>
                  {jobData.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                      <button 
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className={styles.removeSkillBtn}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={handleSaveDraft} className={styles.draftBtn}>
                Save as Draft
              </button>
              <button type="submit" className={styles.submitBtn}>
                Post Job
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default PostJob;
