import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { jobService } from "../../services/jobService";
import { Check } from "lucide-react";
import styles from "../../Styles/RecruiterDashboard.module.css";

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [jobData, setJobData] = useState({
    job_title: "",
    company_name: user?.company_name || "",
    location: "",
    employment_type: "Full-Time",
    work_mode: "On-site",
    salary_range: {
      min: "",
      max: "",
      currency: "INR",
    },
    experience_required: {
      min_years: "",
      max_years: "",
    },
    skills_required: [],
    description: "",
    responsibilities: "",
    qualifications: "",
    application_deadline: "",
    contact_email: user?.email || "",
    job_status: "open",
  });

  const [newSkill, setNewSkill] = useState("");

  const handleInputChange = (field, value) => {
    const keys = field.split(".");
    if (keys.length > 1) {
      setJobData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setJobData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !jobData.skills_required.includes(newSkill.trim())) {
      setJobData((prev) => ({
        ...prev,
        skills_required: [...prev.skills_required, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setJobData((prev) => ({
      ...prev,
      skills_required: prev.skills_required.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const jobPayload = {
        ...jobData,
        employer_id: user.employer_id,
        responsibilities: jobData.responsibilities.split("\n"),
        qualifications: jobData.qualifications.split("\n"),
      };
      await jobService.createJob(jobPayload);
      setShowSuccessModal(true);
      // Clear form data after successful submission
      setJobData({
        job_title: "",
        company_name: user?.company_name || "",
        location: "",
        employment_type: "Full-Time",
        work_mode: "On-site",
        salary_range: {
          min: "",
          max: "",
          currency: "INR",
        },
        experience_required: {
          min_years: "",
          max_years: "",
        },
        skills_required: [],
        description: "",
        responsibilities: "",
        qualifications: "",
        application_deadline: "",
        contact_email: user?.email || "",
        job_status: "open",
      });
    } catch (err) {
      setError("Failed to post job. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    alert("Job saved as draft!");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccess(false);
  };

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showSuccessModal) {
        handleCloseSuccessModal();
      }
    };

    if (showSuccessModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showSuccessModal]);

  // Handle click outside modal to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseSuccessModal();
    }
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <main className={styles.main}>
        <section className={styles.jobPostingSection}>
          <div className={styles.sectionHeader}>
            <h1>Post New Job</h1>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.jobForm}>
            <div className={styles.formSection}>
              <h2>Basic Information</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={jobData.job_title}
                    onChange={(e) => handleInputChange("job_title", e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={jobData.company_name}
                    onChange={(e) => handleInputChange("company_name", e.target.value)}
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
                  <label>Employment Type *</label>
                  <select
                    value={jobData.employment_type}
                    onChange={(e) =>
                      handleInputChange("employment_type", e.target.value)
                    }
                    required
                  >
                    <option value="Full-Time">Full-time</option>
                    <option value="Part-Time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Work Mode *</label>
                  <select
                    value={jobData.work_mode}
                    onChange={(e) => handleInputChange("work_mode", e.target.value)}
                    required
                  >
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Salary Range</label>
                  <div className={styles.salaryInputs}>
                    <select
                      value={jobData.salary_range.currency}
                      onChange={(e) =>
                        handleInputChange("salary_range.currency", e.target.value)
                      }
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <input
                      type="number"
                      value={jobData.salary_range.min}
                      onChange={(e) =>
                        handleInputChange("salary_range.min", e.target.value)
                      }
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={jobData.salary_range.max}
                      onChange={(e) =>
                        handleInputChange("salary_range.max", e.target.value)
                      }
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Experience Required (Years)</label>
                  <div className={styles.salaryInputs}>
                    <input
                      type="number"
                      value={jobData.experience_required.min_years}
                      onChange={(e) =>
                        handleInputChange(
                          "experience_required.min_years",
                          e.target.value
                        )
                      }
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={jobData.experience_required.max_years}
                      onChange={(e) =>
                        handleInputChange(
                          "experience_required.max_years",
                          e.target.value
                        )
                      }
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    value={jobData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Job Details</h2>
              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  value={jobData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Provide a detailed job description..."
                  rows={6}
                  required
                />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Responsibilities *</label>
                  <textarea
                    value={jobData.responsibilities}
                    onChange={(e) =>
                      handleInputChange("responsibilities", e.target.value)
                    }
                    placeholder="List the key responsibilities (one per line)..."
                    rows={4}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Qualifications *</label>
                  <textarea
                    value={jobData.qualifications}
                    onChange={(e) =>
                      handleInputChange("qualifications", e.target.value)
                    }
                    placeholder="List the required qualifications (one per line)..."
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2>Skills</h2>
              <div className={styles.skillsSection}>
                <div className={styles.skillInput}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a required skill and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className={styles.addSkillBtn}
                  >
                    Add Skill
                  </button>
                </div>
                <div className={styles.skillsList}>
                  {jobData.skills_required.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className={styles.removeSkillBtn}
                      >
                        &times;
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
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Posting..." : "Post Job"}
              </button>
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
          </form>
        </section>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Success!</h2>
              <button 
                className={styles.closeButton}
                onClick={handleCloseSuccessModal}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.successIcon}><Check size={24} /></div>
              <p className={styles.successMessage}>
                Job posted successfully! It will be reviewed by an admin.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.okButton}
                onClick={handleCloseSuccessModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostJob;
