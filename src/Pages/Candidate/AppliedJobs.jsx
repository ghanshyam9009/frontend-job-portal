import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import styles from "./UserDashboard.module.css";
import { candidateExternalService } from "../../services";
import { Briefcase, Eye, Calendar, PartyPopper, X, FileText } from "lucide-react";

const AppliedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = user?.user_id || user?.id || '';
    if (!userId) return;
    const fetchApplied = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await candidateExternalService.getAppliedJobs(userId);
        const mapped = (data?.applications || data?.jobs || []).map((a, idx) => ({
          id: a.job_id || idx,
          title: a.job_title || a.title || '',
          company: a.company_name || '',
          salary: a.salary_range ? `₹${a.salary_range.min} - ₹${a.salary_range.max}` : '',
          location: a.location || '',
          type: a.employment_type || '',
          appliedDate: a.created_at ? a.created_at.split('T')[0] : '',
          status: a.status || 'Under Review',
          applicationId: a.application_id || ''
        }));
        setAppliedJobs(mapped);
      } catch (e) {
        setError(typeof e === 'string' ? e : e?.message || 'Failed to load applied jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchApplied();
  }, [user]);

  const handleJobClick = (job) => {
    navigate(`/job/${job.title.toLowerCase().replace(/\s+/g, '-')}`, {
      state: { job }
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'under review':
        return styles.statusReview;
      case 'interview scheduled':
        return styles.statusInterview;
      case 'offer received':
        return styles.statusOffer;
      case 'rejected':
        return styles.statusRejected;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'under review':
        return <Eye size={14} />;
      case 'interview scheduled':
        return <Calendar size={14} />;
      case 'offer received':
        return <PartyPopper size={14} />;
      case 'rejected':
        return <X size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const handleTrack = async (applicationId) => {
    try {
      if (!applicationId) return alert('No application ID');
      const data = await candidateExternalService.getApplicationStatus(applicationId);
      alert(`Status: ${data?.status || 'Unknown'}${data?.message ? `\n${data.message}` : ''}`);
    } catch (e) {
      alert('Failed to fetch status');
    }
  };

  return (
    <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.dark : ''}`}>
      <CandidateNavbar darkMode={theme === 'dark'} toggleDarkMode={toggleTheme} />
      <main className={styles.main}>
        <section className={styles.jobsSection}>
          <div className={styles.jobsHeader}>
            <h2>Applied Jobs</h2>
            <p>Track the status of your job applications</p>
          </div>
          
          {loading && (
            <div className={styles.emptyState}><h3>Loading applications…</h3></div>
          )}
          {error && (
            <div className={styles.emptyState}><h3>{error}</h3></div>
          )}
          {appliedJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><FileText size={48} /></div>
              <h3>No applications yet</h3>
              <p>Start applying to jobs to track your progress here.</p>
              <button 
                className={styles.primaryBtn}
                onClick={() => navigate('/userjoblistings')}
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className={styles.jobsGrid}>
              {appliedJobs.map(job => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobCardHeader}>
                    <div className={styles.jobIcon}><Briefcase size={20} /></div>
                    <div className={`${styles.jobStatus} ${getStatusColor(job.status)}`}>
                      <span className={styles.statusIcon}>{getStatusIcon(job.status)}</span>
                      {job.status}
                    </div>
                  </div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobCompany}>{job.company}</p>
                  <p className={styles.jobSalary}>{job.salary}</p>
                  <p className={styles.jobLocation}>{job.location}</p>
                  <div className={styles.jobMeta}>
                    <span className={styles.appliedDate}>Applied: {job.appliedDate}</span>
                    <span className={styles.applicationId}>ID: {job.applicationId}</span>
                  </div>
                  {job.interviewDate && (
                    <div className={styles.interviewInfo}>
                      <span className={styles.interviewLabel}>Interview:</span>
                      <span className={styles.interviewDate}>{job.interviewDate}</span>
                    </div>
                  )}
                  <div className={styles.jobButtons}>
                    <button 
                      className={styles.viewBtn}
                      onClick={() => handleJobClick(job)}
                    >
                      View Details
                    </button>
                    <button 
                      className={styles.trackBtn}
                      onClick={() => handleTrack(job.applicationId)}
                    >
                      Track Application
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AppliedJobs;
