import React, { useState } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { Plus, Save, X } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

const AdminPostJob = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [jobData, setJobData] = useState({
    job_title: "",
    company_name: "",
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
    contact_email: "",
    job_status: "open",
    is_premium: false,
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
      // Format salary range as string
      const salaryMin = jobData.salary_range.min;
      const salaryMax = jobData.salary_range.max;
      const currency = jobData.salary_range.currency;
      const salaryRange = salaryMin && salaryMax ? `${currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}${salaryMin} - ${currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}${salaryMax}` : null;

      // Format experience as string if provided
      const expMin = jobData.experience_required.min_years;
      const expMax = jobData.experience_required.max_years;
      const experienceRequired = expMin || expMax ? `${expMin || 0}-${expMax || ''} years` : null;

      const jobPayload = {
        job_title: jobData.job_title,
        company_name: jobData.company_name || null,
        description: jobData.description,
        location: jobData.location,
        employment_type: jobData.employment_type,
        work_mode: jobData.work_mode || null,
        salary_range: salaryRange,
        experience_required: experienceRequired,
        skills_required: jobData.skills_required,
        responsibilities: jobData.responsibilities.split("\n").filter(r => r.trim()),
        qualifications: jobData.qualifications.split("\n").filter(q => q.trim()),
        application_deadline: jobData.application_deadline || null,
        contact_email: jobData.contact_email || null,
        status: "Open", // Admin jobs are visible and open
        is_premium: jobData.is_premium,
        posted_by: "admin"
      };

      const result = await adminService.postJobByAdmin(jobPayload);

      setSuccess(true);
      alert(`Job posted successfully! Job ID: ${result.job_id || 'Generated'}`);

      // Reset form
      setJobData({
        job_title: "",
        company_name: "",
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
        contact_email: "",
        job_status: "open",
        is_premium: false,
      });

    } catch (error) {
      console.error('Failed to post job:', error);
      setError(error.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Post Job as Admin</h1>
        <p className={styles.pageSubtitle}>Create and publish jobs directly to candidates</p>
      </div>

      {success && (
        <div className={styles.successMessage}>
          Job posted successfully! It will be visible to candidates immediately.
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.jobForm}>
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Job Title *</label>
                <input
                  type="text"
                  value={jobData.job_title}
                  onChange={(e) => handleInputChange('job_title', e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Company Name *</label>
                <input
                  type="text"
                  value={jobData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g., Tech Corp"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location *</label>
                <input
                  type="text"
                  value={jobData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g., Mumbai, India"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Employment Type *</label>
                <select
                  value={jobData.employment_type}
                  onChange={(e) => handleInputChange('employment_type', e.target.value)}
                  className={styles.formSelect}
                  required
                >
                  <option value="Full-Time">Full-time</option>
                  <option value="Part-Time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Work Mode *</label>
                <select
                  value={jobData.work_mode}
                  onChange={(e) => handleInputChange('work_mode', e.target.value)}
                  className={styles.formSelect}
                  required
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contact Email</label>
                <input
                  type="email"
                  value={jobData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className={styles.formInput}
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            {/* Premium Job Toggle */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={jobData.is_premium}
                  onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                  className={styles.checkbox}
                />
                Mark as Premium Job
              </label>
            </div>
          </div>

          {/* Salary Range */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Salary Range</h3>
            <div className={styles.salaryGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Currency</label>
                <select
                  value={jobData.salary_range.currency}
                  onChange={(e) => handleInputChange('salary_range.currency', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Minimum Salary</label>
                <input
                  type="number"
                  value={jobData.salary_range.min}
                  onChange={(e) => handleInputChange('salary_range.min', e.target.value)}
                  className={styles.formInput}
                  placeholder="50000"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Maximum Salary</label>
                <input
                  type="number"
                  value={jobData.salary_range.max}
                  onChange={(e) => handleInputChange('salary_range.max', e.target.value)}
                  className={styles.formInput}
                  placeholder="80000"
                />
              </div>
            </div>
          </div>

          {/* Experience Required */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Experience Required</h3>
            <div className={styles.experienceGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Minimum Years</label>
                <input
                  type="number"
                  value={jobData.experience_required.min_years}
                  onChange={(e) => handleInputChange('experience_required.min_years', e.target.value)}
                  className={styles.formInput}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Maximum Years</label>
                <input
                  type="number"
                  value={jobData.experience_required.max_years}
                  onChange={(e) => handleInputChange('experience_required.max_years', e.target.value)}
                  className={styles.formInput}
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Job Details</h3>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Job Description *</label>
              <textarea
                value={jobData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={styles.formTextarea}
                rows={6}
                placeholder="Describe the job role, requirements, and what the candidate will be doing..."
                required
              />
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Responsibilities *</label>
                <textarea
                  value={jobData.responsibilities}
                  onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                  className={styles.formTextarea}
                  rows={4}
                  placeholder="List key responsibilities (one per line)"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Qualifications *</label>
                <textarea
                  value={jobData.qualifications}
                  onChange={(e) => handleInputChange('qualifications', e.target.value)}
                  className={styles.formTextarea}
                  rows={4}
                  placeholder="List required qualifications (one per line)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Required Skills</h3>
            <div className={styles.skillsSection}>
              <div className={styles.skillInputGroup}>
                <input
                  type="text"
                  placeholder="Add a required skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  className={styles.skillInput}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className={styles.addSkillBtn}
                >
                  <Plus size={16} />
                  Add
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
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Application Deadline */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Application Details</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Application Deadline</label>
              <input
                type="date"
                value={jobData.application_deadline}
                onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                className={styles.formInput}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setJobData({
                  job_title: "",
                  company_name: "",
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
                  contact_email: "",
                  job_status: "open",
                  is_premium: false,
                });
                setNewSkill("");
                setError(null);
                setSuccess(false);
              }}
              className={styles.resetBtn}
            >
              Reset Form
            </button>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Posting Job...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Post Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPostJob;
