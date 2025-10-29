import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { useTheme } from "../Contexts/ThemeContext";
import { applicationService } from "../services/applicationService";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";
import CandidateSidebar from "../Components/Candidate/CandidateSidebar";
import styles from "./Jobdescription.module.css";

const Jobdescription = () => {
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();

  // Extract job ID from slug (assuming slug format: title-jobId)
  const extractJobIdFromSlug = (slugStr) => {
    // If slug contains a number at the end, extract it as job ID
    const match = slugStr.match(/-(\d+)$/);
    return match ? match[1] : slugStr;
  };

  const jobId = extractJobIdFromSlug(slug);

  useEffect(() => {
    fetchJobDetails();
  }, [slug]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jobsData = await response.json();
      const jobsArray = jobsData.jobs || jobsData.data || jobsData;

      if (!Array.isArray(jobsArray)) {
        throw new Error('Invalid response format');
      }

      // Find the specific job by ID or slug
      let foundJob = null;

      // First try to find by job_id
      foundJob = jobsArray.find(j =>
        (j.job_id || j.id) === jobId ||
        (j.job_id || j.id) === parseInt(jobId)
      );

      // If not found, try to find by title slug match
      if (!foundJob && slug) {
        const titleSlug = slug.toLowerCase().replace(/-\d+$/, ''); // Remove trailing numbers
        foundJob = jobsArray.find(j =>
          (j.job_title || j.title)?.toLowerCase().replace(/\s+/g, '-').includes(titleSlug) ||
          (j.job_title || j.title)?.toLowerCase().replace(/\s+/g, '-') === titleSlug
        );
      }

      if (!foundJob) {
        // Fall back to location.state if available (for backward compatibility)
        foundJob = location.state?.job;
      }

      if (!foundJob) {
        throw new Error('Job not found');
      }

      setJob(foundJob);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const derivedTitle = job?.job_title || job?.title || (slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Job");

  const handleApplyClick = async () => {
    if (!isAuthenticated) {
      alert("Please login first to apply for this job");
      navigate('/candidate/login');
      return;
    }

    // Check if user has premium membership or is within 45-day trial
    if (user?.membership === 'premium') {
      // Allow apply
    } else {
      // Check 45-day trial
      const registrationDate = new Date(user.created_at);
      const now = new Date();
      const daysSinceRegistration = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));

      if (daysSinceRegistration > 45) {
        alert("Your 45-day free trial has expired. You need a premium membership to apply for jobs. Redirecting to membership plans...");
        navigate('/membership');
        return;
      }
      // Within 45 days, allow apply
    }
    
    setIsApplying(true);
    setApplicationError("");
    setApplicationSuccess("");

    try {
      const applicationData = {
        student_id: user.id,
        resume_url: "https://myresume.com/johndoe.pdf", // Replace with actual resume URL
        cover_letter: "I am excited to apply for this role." // Replace with actual cover letter
      };
      const response = await applicationService.applyForJob(job.job_id || job.id, applicationData);
      if (response.success) {
        setApplicationSuccess("Application submitted successfully!");
      } else {
        setApplicationError(response.message || "Failed to submit application");
      }
    } catch (error) {
      setApplicationError("An error occurred while submitting the application");
    } finally {
      setIsApplying(false);
    }
  };
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f9fafb'
    }}>
      <CandidateNavbar toggleSidebar={toggleSidebar} />
      <CandidateSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main style={{
        flex: 1,
        marginLeft: '255px' ,
        marginTop: '70px',
        padding: '20px',
        overflowY: 'auto',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f9fafb',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      }}>
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            flexDirection: 'column'
          }}>
            <div style={{
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #16a34a',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '20px', color: theme === 'dark' ? '#ffffff' : '#000000' }}>Loading job details...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            flexDirection: 'column'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>❌</div>
            <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>Error Loading Job</h3>
            <p style={{ marginBottom: '20px', color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{error}</p>
            <button
              onClick={fetchJobDetails}
              style={{
                background: '#16a34a',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && job && (
          <>
        <section className={`${styles.headerCard} ${theme === 'dark' ? styles.darkCard : styles.lightCard}`}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>{derivedTitle}</h1>
            <button className={styles.applyBtn} onClick={handleApplyClick}>Apply Now</button>
          </div>
          <div className={styles.companyRow}>
            <div className={styles.companyIcon}>🏢</div>
            <div className={styles.companyName}>{job?.company_name || 'Company Name'}</div>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>📍 {job?.location || 'Location'}</span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaItem}>💰 ${job?.salary_min || '0'} - ${job?.salary_max || '0'} / Year</span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaItem}>🕒 {job?.job_type || 'Full-time'}</span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaItem}>📅 Apply by {job?.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'TBD'}</span>
          </div>
        </section>

        <section className={`${styles.contentCard} ${theme === 'dark' ? styles.darkCard : styles.lightCard}`}>
            <div className={styles.Titlecontainer}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: theme === 'dark' ? "1px solid #374151" : "1px solid #e5e7eb", paddingBottom: "8px" }}>Job Description</h2>
          </div>
          <div dangerouslySetInnerHTML={{ __html: job?.description || 'No description available' }} />

          {(job?.responsibilities?.length > 0 || job?.responsibilities_string) && (
            <>
              <h3 className={styles.subheading}>Responsibilities</h3>
              <ul className={styles.list}>
                {job.responsibilities?.length > 0 ? (
                  job.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: job.responsibilities_string }} />
                )}
              </ul>
            </>
          )}

          {(job?.requirements?.length > 0 || job?.requirements_string) && (
            <>
              <h3 className={styles.subheading}>Requirements</h3>
              <ul className={styles.list}>
                {job.requirements?.length > 0 ? (
                  job.requirements.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: job.requirements_string }} />
                )}
              </ul>
            </>
          )}

          {(job?.benefits?.length > 0 || job?.benefits_string) && (
            <>
              <h3 className={styles.subheading}>Benefits</h3>
              <ul className={styles.list}>
                {job.benefits?.length > 0 ? (
                  job.benefits.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: job.benefits_string }} />
                )}
              </ul>
            </>
          )}

          <div className={styles.applyCta}>
            <button className={styles.applyBtnLarge} onClick={handleApplyClick}>Apply Now</button>
            <div className={styles.smallPrint}>
              Applications close on {job?.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'TBD'}
            </div>
          </div>
        </section>

        <section className={`${styles.contentCard} ${theme === 'dark' ? styles.darkCard : styles.lightCard}`}>
          <div className={styles.Titlecontainer}>
            <h2 className={styles.sectionTitle} style={{ borderBottom: theme === 'dark' ? "1px solid #374151" : "1px solid #e5e7eb", paddingBottom: "8px" }}>
              Skills & Qualifications
            </h2>
          </div>

          <div className={styles.skillsWrapper}>
            {job?.skills?.length > 0 ? (
              job.skills.map((skill, index) => (
                <span
                  key={index}
                  className={`${styles.skill} ${theme === 'dark' ? styles.darkSkill : styles.lightSkill}`}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className={`${styles.skill} ${theme === 'dark' ? styles.darkSkill : styles.lightSkill}`}>
                No skills specified
              </span>
            )}
          </div>
        </section>

        <section className={`${styles.contentCard} ${theme === 'dark' ? styles.darkCard : styles.lightCard}`}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: theme === 'dark' ? "1px solid #374151" : "1px solid #e5e7eb", paddingBottom: "8px" }}>About Company</h2>
          <div dangerouslySetInnerHTML={{ __html: job?.company_description || 'No company description available' }} />
        </section>

        <section className={`${styles.contentCard} ${theme === 'dark' ? styles.darkCard : styles.lightCard}`}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: theme === 'dark' ? "1px solid #374151" : "1px solid #e5e7eb", paddingBottom: "8px" }}>Related Jobs</h2>
          <div className={styles.relatedGrid}>
            <article className={`${styles.relatedCard} ${theme === 'dark' ? styles.darkRelatedCard : styles.lightRelatedCard}`}>
              <div className={styles.relatedTop}>
                <div className={styles.relatedIcon}>💼</div>
                <div>
                  <div className={styles.relatedTitle}>Frontend Engineer</div>
                  <div className={styles.relatedMeta}>Remote • $110k‑$140k • Full‑time</div>
                </div>
              </div>
              <button className={styles.relatedBtn}>View</button>
            </article>
            <article className={`${styles.relatedCard} ${theme === 'dark' ? styles.darkRelatedCard : styles.lightRelatedCard}`}>
              <div className={styles.relatedTop}>
                <div className={styles.relatedIcon}>💼</div>
                <div>
                  <div className={styles.relatedTitle}>UI Engineer</div>
                  <div className={styles.relatedMeta}>SF/Remote • $120k‑$150k • Full‑time</div>
                </div>
              </div>
              <button className={styles.relatedBtn}>View</button>
            </article>
            <article className={`${styles.relatedCard} ${theme === 'dark' ? styles.darkRelatedCard : styles.lightRelatedCard}`}>
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
          </>
        )}
      </main>
    </div>
  );
};

export default Jobdescription;
