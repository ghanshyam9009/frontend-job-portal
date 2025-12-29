import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterExternalService } from "../../services";
import { Check, X, FileText, Download, ExternalLink, Search, Briefcase, Building, Clock, Mail, Phone, Calendar, Eye, MapPin } from "lucide-react";
import styles from "../../Styles/AdminDashboard.module.css";

function PendingJobApplications() {
  const { theme } = useTheme();
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState({});
  const [applicationDetails, setApplicationDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  // const [jobFilter, setJobFilter] = useState("all");

  // Fetch pending applications with full details and auto-approve new applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch pending applications
        const pendingTasks = await adminService.getPendingJobs();
        const newApplicationTasks = pendingTasks.filter(task =>
          task.category === 'newapplication' && task.status === 'pending'
        );

        // Auto-approve all new application tasks
        if (newApplicationTasks.length > 0) {
          for (const task of newApplicationTasks) {
            try {
              await adminService.approveJobApplicationByStudent(task.task_id);
              console.log(`Auto-approved application task: ${task.task_id}`);
            } catch (error) {
              console.error(`Failed to auto-approve task ${task.task_id}:`, error);
            }
          }

          // Re-fetch tasks after auto-approval
          const updatedTasks = await adminService.getPendingJobs();
          const remainingPendingApps = updatedTasks.filter(task =>
            task.category === 'newapplication' && task.status === 'pending'
          );

          setPendingApplications(remainingPendingApps);

          // Fetch detailed information for any remaining applications (should be none)
          if (remainingPendingApps.length > 0) {
            await fetchApplicationDetails(remainingPendingApps);
          }
        } else {
          // No new application tasks to approve
          const otherPendingTasks = pendingTasks.filter(task =>
            !(task.category === 'newapplication' && task.status === 'pending')
          );
          setPendingApplications(otherPendingTasks);

          // Fetch detailed information for other types of applications
          if (otherPendingTasks.length > 0) {
            await fetchApplicationDetails(otherPendingTasks);
          }
        }
      } catch (error) {
        console.error('Failed to fetch pending applications:', error);
        setPendingApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch pending applications
      const pendingTasks = await adminService.getPendingJobs();
      const pendingApps = pendingTasks.filter(task =>
        task.category === 'newapplication' && task.status === 'pending'
      );
      
      setPendingApplications(pendingApps);

      // Fetch detailed information for each application
      if (pendingApps.length > 0) {
        await fetchApplicationDetails(pendingApps);
      }
    } catch (error) {
      console.error('Failed to fetch pending applications:', error);
      setPendingApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch complete application details
  const fetchApplicationDetails = async (applications) => {
    const detailsMap = {};

    for (const app of applications) {
      try {
        console.log('Processing application:', app);
        const details = {
          studentName: 'Loading...',
          studentEmail: '',
          resumeUrl: '',
          studentPhone: '',
          studentSkills: [],
          jobTitle: 'Loading...',
          jobLocation: '',
          companyName: 'Loading...',
          applicationDate: app.created_at || app.posted_date || '',
          studentDetails: null
        };

        // Fetch job details
        if (app.job_id) {
          try {
            const jobResponse = await fetch(
              `https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs?job_id=${app.job_id}`
            );
            if (jobResponse.ok) {
              const jobData = await jobResponse.json();
              const job = Array.isArray(jobData.jobs)
                ? jobData.jobs.find(j => j.job_id === app.job_id) || jobData.jobs[0]
                : jobData.job || jobData;

              if (job) {
                details.jobTitle = job.job_title || job.title || 'Not specified';
                details.jobLocation = job.location || 'Not specified';
                details.companyName = job.company_name || 'Not specified';
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch job ${app.job_id}:`, err);
          }
        }

        // Fetch application details for the job to get student data
        if (app.job_id) {
          try {
            const applicationsResponse = await adminService.getApplicationsForJob(app.job_id);
            const applications = applicationsResponse.applications || [];

            const studentApplication = applications.find(a =>
              a.student_id?.toString() === app.student_id?.toString()
            ) || applications[0];

            if (studentApplication) {
              details.studentName = studentApplication.student_name || `Student ${app.student_id}`;
              details.studentEmail = studentApplication.student_email || studentApplication.email || '';
              details.resumeUrl = studentApplication.resume_url || studentApplication.resume || '';
              details.studentPhone = studentApplication.student_phone || '';
              details.studentSkills = studentApplication.student_skills
                ? (typeof studentApplication.student_skills === 'string'
                    ? studentApplication.student_skills.split(',').map(skill => skill.trim())
                    : Array.isArray(studentApplication.student_skills)
                    ? studentApplication.student_skills
                    : [])
                : [];

              details.studentDetails = {
                name: studentApplication.student_name || "Unknown",
                email: studentApplication.student_email || studentApplication.email || null,
                phone: studentApplication.student_phone || null,
                skills: studentApplication.student_skills
                  ? (typeof studentApplication.student_skills === 'string'
                      ? studentApplication.student_skills.split(',').map(skill => skill.trim())
                      : Array.isArray(studentApplication.student_skills)
                      ? studentApplication.student_skills
                      : [])
                  : [],
                location: studentApplication.student_location || null,
                experience: studentApplication.student_experience || null,
                education: studentApplication.student_university ? [studentApplication.student_university] : [],
                experience_years: studentApplication.student_experience_years || null,
                bio: studentApplication.student_bio || null,
                resumeUrl: studentApplication.resume_url || studentApplication.student_profile?.resume || null,
                department: studentApplication.student_department || null,
                cgpa: studentApplication.student_cgpa || null,
                logo: studentApplication.student_profile?.logo || studentApplication.student_profile?.profile_image || null
              };
            }
          } catch (error) {
            console.error(`Failed to fetch application details:`, error);
          }
        }

        // Fetch company name if recruiter_id is available
        if (app.recruiter_id && details.companyName === 'Loading...') {
          try {
            const recruiterData = await recruiterExternalService.getRecruiterCompanyName(app.recruiter_id);
            if (recruiterData && recruiterData.company_name) {
              details.companyName = recruiterData.company_name;
            }
          } catch (err) {
            console.warn(`Failed to fetch company:`, err);
          }
        }

        // Fallbacks
        if (details.studentName === 'Loading...' || !details.studentName) {
          details.studentName = `Student ${app.student_id || 'Unknown'}`;
        }
        if (details.companyName === 'Loading...' || !details.companyName) {
          details.companyName = app.company_name || 'Unknown Company';
        }

        detailsMap[app.task_id] = details;
      } catch (error) {
        console.error(`Error fetching details:`, error);
        detailsMap[app.task_id] = {
          studentName: `Student ${app.student_id || 'Unknown'}`,
          studentEmail: '',
          resumeUrl: '',
          studentPhone: '',
          studentSkills: [],
          jobTitle: app.title || 'Not specified',
          jobLocation: app.location || 'Not specified',
          companyName: app.company_name || 'Unknown Company',
          applicationDate: app.created_at || app.posted_date || '',
          studentDetails: null
        };
      }
    }

    setApplicationDetails(detailsMap);
  };

  const handleApproveApplication = async (taskId) => {
    try {
      setLoadingApplications(prev => ({ ...prev, [taskId]: true }));
      await adminService.approveJobApplicationByStudent(taskId);
      alert('Application approved successfully! The recruiter can now review this application.');
      await fetchData();
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert('Failed to approve application. Please try again.');
    } finally {
      setLoadingApplications(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleRejectApplication = async (taskId) => {
    const confirmReject = window.confirm('Are you sure you want to reject this application?');
    if (!confirmReject) return;

    try {
      setLoadingApplications(prev => ({ ...prev, [taskId]: true }));
      await adminService.rejectJob(taskId);
      alert('Application rejected successfully.');
      await fetchData();
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setLoadingApplications(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleViewCandidateDetails = (application, details) => {
    setSelectedCandidate({ ...application, details });
    setShowCandidateModal(true);
  };

  const handleExportToExcel = () => {
    alert('Export functionality is temporarily disabled.');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get unique companies for filter
  const uniqueCompanies = [...new Set(
    pendingApplications.map(app => applicationDetails[app.task_id]?.companyName).filter(Boolean)
  )];

  // Get unique jobs for filter
  const uniqueJobs = [...new Set(
    pendingApplications.map(app => {
      const details = applicationDetails[app.task_id];
      return details ? `${details.jobTitle}|${details.companyName}` : null;
    }).filter(Boolean)
  )];

  // Filter applications
  const filteredApplications = pendingApplications.filter(app => {
    const details = applicationDetails[app.task_id] || {};
    
    // Search filter
    const matchesSearch = 
      details.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Company filter
    const matchesCompany = companyFilter === "all" || details.companyName === companyFilter;
    
    // Job filter
    const jobKey = `${details.jobTitle}|${details.companyName}`;
    const matchesJob = jobFilter === "all" || jobKey === jobFilter;
    
    return matchesSearch && matchesCompany && matchesJob;
  });

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const mainContentClass = `${styles.mainContent} ${theme === 'dark' ? styles.dark : ''}`;
  const searchFilterClass = `${cardBg} rounded-lg border ${borderColor} p-4 mb-6 shadow-sm`;
  const searchInputClass = `w-full pl-10 pr-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`;
  const searchIconClass = `absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`;

  return (
    <div className={mainContentClass}>
      <div className={styles.contentHeader}>
        <h1 className={styles.pageTitle}>Job Applications Overview</h1>
        <p className={styles.pageSubtitle}>Monitor job applications - new applications are automatically approved</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Pending Job Applications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `Found ${filteredApplications.length} applications`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingJobApplications;
