import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import styles from "./AppliedJobs.module.css";
import { candidateExternalService } from "../../services";
import { Briefcase, Eye, Calendar, PartyPopper, X, FileText, Check } from "lucide-react";

const AppliedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const userId = user?.user_id || user?.id || '';
    if (!userId) return;
    const fetchApplied = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await candidateExternalService.getAppliedJobs(userId);
        const mapped = (data?.jobs || []).map((a, idx) => ({
          id: a.job_id || idx,
          title: a.job_title || '',
          company: a.company_name || '',
          salary: a.salary_range ? `₹${a.salary_range.min} - ₹${a.salary_range.max}` : 'Salary not disclosed',
          location: a.location || '',
          type: a.employment_type || '',
          appliedDate: a.created_at ? a.created_at.split('T')[0] : '',
          appliedDateTime: a.created_at || '',
          status: a.status || 'Under Review',
          applicationId: a.job_id || '',
          is_premium: a.premium_job || false,
        }));

        // Sort by applied date (latest first)
        const sorted = mapped.sort((a, b) => {
          const dateA = new Date(a.appliedDateTime || 0);
          const dateB = new Date(b.appliedDateTime || 0);

          // Handle invalid dates
          const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
          const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

          return timeB - timeA; // Latest first
        });

        setAppliedJobs(sorted);
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

  const handleTrack = async (jobId) => {
    if (!jobId) return alert('No job ID');

    try {
      const data = await candidateExternalService.getApplicationStatus(jobId);

      // Add a defensive check for the response data
      if (!data || typeof data.status !== 'string') {
        console.error("Invalid status data received:", data);
        alert('Could not retrieve valid tracking information.');
        return;
      }

      setTrackingInfo(data);

      const statusOrder = ['pending', 'applied', 'under review', 'interview scheduled', 'offer received', 'hired'];
      const currentStatus = data.status.toLowerCase();
      const isRejected = currentStatus === 'rejected';
      const currentIndex = statusOrder.indexOf(currentStatus);

      let timeline = [
        // Ensure applied_date or created_at is used for the first step
        { stage: 'Application Sent', status: 'Pending', date: data.applied_date || data.created_at || null },
        { stage: 'Under Review', status: 'Pending', date: null },
        { stage: 'Interview Scheduled', status: 'Pending', date: null },
        { stage: 'Offer Received', status: 'Pending', date: null },
        { stage: 'Hired', status: 'Pending', date: null },
      ];

      if (isRejected) {
        // If rejected, mark 'Applied' as complete and add a 'Rejected' step.
        timeline[0].status = 'Completed';
        timeline.push({ 
          stage: 'Rejected', 
          status: 'Completed', 
          date: data.status_date || data.updated_at || new Date().toISOString() 
        });
      } else if (currentIndex > -1) {
        // Mark all steps up to and including the current one as complete.
        for (let i = 0; i <= currentIndex; i++) {
          timeline[i].status = 'Completed';
          // Put the date on the actual current step
          if (i === currentIndex) {
            timeline[i].date = data.status_date || data.updated_at || new Date().toISOString();
          }
        }
      } else {
        // If the status is unknown but not rejected, just show 'Applied' as completed.
        timeline[0].status = 'Completed';
      }

      setTimeline(timeline);
      setIsModalOpen(true);
    } catch (e) {
      console.error('Failed to fetch application status:', e);
      if (e.error === 'Application not found') {
        alert('Could not find application. It might still be processing. Please try again later.');
      } else {
        const errorMessage = e?.message || 'An unknown error occurred.';
        alert(`Failed to fetch status: ${errorMessage}`);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTrackingInfo(null);
    setTimeline([]);
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
                  {job.is_premium && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      color: '#000',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: 1
                    }}>
                      <span>👑</span>
                      Premium
                    </div>
                  )}
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

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Application Status</h3>
              <button onClick={closeModal} className={styles.closeButton}><X size={24} /></button>
            </div>
            <ul className={styles.timeline}>
              {timeline.map((item, index) => (
                <li key={index} className={styles.timelineItem}>
                  <div className={`${styles.timelineIcon} ${item.status === 'Completed' ? styles.completed : ''}`}>
                    {item.status === 'Completed' && <Check size={14} />}
                  </div>
                  <div className={styles.timelineContent}>
                    <h4>{item.stage}</h4>
                    <p>{item.date ? new Date(item.date).toLocaleDateString() : 'Pending'}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;
