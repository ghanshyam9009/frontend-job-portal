import React, { useState, useEffect } from "react";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import { 
  Check, 
  Eye, 
  Edit, 
  X, 
  Search, 
  FileText, 
  Star,
  Building,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Users,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Plus,
  Trash2,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from "lucide-react";

const ManageJobs = () => {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // New state for date filter
  const [sortBy, setSortBy] = useState("newest"); // New state for sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [recruiterDetails, setRecruiterDetails] = useState(null);
  const [hiddenJobs, setHiddenJobs] = useState(new Set());

  // Load premium status from localStorage
  const [premiumOverrides, setPremiumOverrides] = useState(() => {
    try {
      const stored = localStorage.getItem('jobPremiumOverrides');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

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
    contact_number: "",
    job_status: "open",
  });

  const [applicationData, setApplicationData] = useState([]);
  const [applicantDetails, setApplicantDetails] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [loadingJobEdit, setLoadingJobEdit] = useState(false);
  const jobsPerPage = 25;

  // Cache for API calls
  const [recruiterCache, setRecruiterCache] = useState({});
  const [jobDataCache, setJobDataCache] = useState({});
  const [applicantsCache, setApplicantsCache] = useState({});

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobsData = await adminService.getPendingJobs();
        const jobsArray = Array.isArray(jobsData) ? jobsData : [];
        setJobs(jobsArray);
        setFilteredJobs(jobsArray);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setError('Failed to fetch jobs. Please try again.');
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Helper function to filter jobs by date
  const filterJobsByDate = (jobs, dateFilter) => {
    if (dateFilter === "all") return jobs;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return jobs.filter(job => {
      const jobDate = new Date(job.posted_date);
      const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());

      switch (dateFilter) {
        case "today":
          return jobDateOnly.getTime() === today.getTime();
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return jobDateOnly.getTime() === yesterday.getTime();
        }
        case "last7days": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return jobDateOnly >= weekAgo;
        }
        case "last30days": {
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          return jobDateOnly >= monthAgo;
        }
        case "thisMonth": {
          return jobDate.getMonth() === now.getMonth() && 
                 jobDate.getFullYear() === now.getFullYear();
        }
        case "lastMonth": {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return jobDate.getMonth() === lastMonth.getMonth() && 
                 jobDate.getFullYear() === lastMonth.getFullYear();
        }
        default:
          return true;
      }
    });
  };

  // Helper function to sort jobs
  const sortJobs = (jobs, sortBy) => {
    const sorted = [...jobs];
    
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => {
          const dateA = new Date(a.posted_date || 0);
          const dateB = new Date(b.posted_date || 0);
          return dateB - dateA;
        });
        break;
      case "oldest":
        sorted.sort((a, b) => {
          const dateA = new Date(a.posted_date || 0);
          const dateB = new Date(b.posted_date || 0);
          return dateA - dateB;
        });
        break;
      case "company_asc":
        sorted.sort((a, b) => 
          (a.company_name || '').localeCompare(b.company_name || '')
        );
        break;
      case "company_desc":
        sorted.sort((a, b) => 
          (b.company_name || '').localeCompare(a.company_name || '')
        );
        break;
      case "updated":
        sorted.sort((a, b) => {
          const dateA = new Date(a.updated_date || 0);
          const dateB = new Date(b.updated_date || 0);
          return dateB - dateA;
        });
        break;
      default:
        break;
    }
    
    return sorted;
  };

  // Group and filter jobs
  useEffect(() => {
    let tasks = Array.isArray(jobs) ? jobs : [];
    const groupedJobs = {};

    tasks.forEach(task => {
      const jobId = task.job_id || `no-job-${task.id}`;

      if (!groupedJobs[jobId]) {
        groupedJobs[jobId] = {
          id: task.id,
          job_id: jobId,
          company_name: task.company_name || 'N/A',
          title: task.title || task.category,
          posted_date: task.posted_date,
          updated_date: task.updated_date,
          is_premium: premiumOverrides[task.job_id] !== undefined ? premiumOverrides[task.job_id] : (task.is_premium || task.premium_job || false),
          tasks: []
        };
      }

      groupedJobs[jobId].tasks.push(task);
    });

    let filtered = Object.values(groupedJobs).filter(job => !hiddenJobs.has(job.job_id));

    // Apply status filter first (before search)
    if (statusFilter !== "all") {
      filtered = filtered.filter(job =>
        job.tasks.some(task => task.status === statusFilter)
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    filtered = filterJobsByDate(filtered, dateFilter);

    // Apply sorting
    filtered = sortJobs(filtered, sortBy);

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, sortBy, jobs, premiumOverrides, hiddenJobs]);

  // Fetch edit data
  useEffect(() => {
    const fetchEditData = async () => {
      if (!editingTask) return;

      try {
        setLoadingJobEdit(true);

        let recruiterDetails = recruiterCache[editingTask.recruiter_id];
        if (!recruiterDetails && editingTask.recruiter_id) {
          recruiterDetails = await recruiterExternalService.getRecruiterCompanyName(editingTask.recruiter_id);
          setRecruiterCache(prev => ({ ...prev, [editingTask.recruiter_id]: recruiterDetails }));
        }
        setRecruiterDetails(recruiterDetails);

        if (editingTask.category === 'editjob' || editingTask.category === 'postnewjob' || editingTask.category === 'viewjob') {
          if (!editingTask.job_id || !editingTask.recruiter_id) {
            setLoadingJobEdit(false);
            return;
          }

          let jobsData = jobDataCache[editingTask.recruiter_id];
         
          if (!jobsData) {
            jobsData = await recruiterExternalService.getAllPostedJobs(editingTask.recruiter_id);
            setJobDataCache(prev => ({ ...prev, [editingTask.recruiter_id]: jobsData }));
            
          }

          const job = jobsData?.jobs?.find(j => j.job_id === editingTask.job_id);
     console.log(job)
          if (job) {
            setJobData({
              job_title: job.job_title || "",
              company_name: job.company_name || "",
              location: job.location || "",
              employment_type: job.employment_type || "Full-Time",
              work_mode: job.work_mode || "On-site",
              salary_range: {
                min: job.salary_range?.min ? String(job.salary_range.min) : "",
                max: job.salary_range?.max ? String(job.salary_range.max) : "",
                currency: job.salary_range?.currency || "INR",
              },
              experience_required: {
                min_years: job.experience_required?.min_years ? String(job.experience_required.min_years) : "",
                max_years: job.experience_required?.max_years ? String(job.experience_required.max_years) : "",
              },
              skills_required: job.skills_required || [],
              description: job.description || "",
              responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join("\n") : job.responsibilities || "",
              qualifications: Array.isArray(job.qualifications) ? job.qualifications.join("\n") : job.qualifications || "",
              application_deadline: job.application_deadline || "",
              contact_email: job.contact_email || "",
              // contact_number: job.contact_number || "",
              job_status: job.job_status || "open",
            });
          } else {
            alert('Job not found or you may not have permission to edit this job');
            setEditingTask(null);
          }
        } else if (editingTask.category === 'newapplication' || editingTask.category === 'change status of application') {
          if (!editingTask.job_id) {
            setLoadingJobEdit(false);
            return;
          }

          setApplicantDetails({
            job_id: editingTask.job_id,
            recruiter_id: editingTask.recruiter_id,
            task_category: editingTask.category,
            task_id: editingTask.task_id
          });

          let recruiterDetails = recruiterCache[editingTask.recruiter_id];
          if (!recruiterDetails && editingTask.recruiter_id) {
            try {
              let recruiterEmail = null;

              try {
                const basicRecruiterResponse = await recruiterExternalService.getRecruiterCompanyName(editingTask.recruiter_id);
                if (basicRecruiterResponse && basicRecruiterResponse.email) {
                  recruiterEmail = basicRecruiterResponse.email;
                }
              } catch (basicError) {
                console.warn('Could not get basic recruiter info:', basicError);
              }

              if (recruiterEmail) {
                const detailedApiUrl = `https://4x10ubol84.execute-api.ap-southeast-1.amazonaws.com/default/getepmloyerdetailed?email=${encodeURIComponent(recruiterEmail)}`;
                const detailedResponse = await fetch(detailedApiUrl, {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json' },
                });

                if (detailedResponse.ok) {
                  recruiterDetails = await detailedResponse.json();
                }
              }

              setRecruiterCache(prev => ({ ...prev, [editingTask.recruiter_id]: recruiterDetails }));
            } catch (error) {
              console.error('Failed to fetch recruiter details:', error);
            }
          }

          if (recruiterDetails) {
            setApplicantDetails(prevDetails => ({
              ...prevDetails,
              recruiter_name: recruiterDetails.full_name || recruiterDetails.name || "Not available",
              company_name: recruiterDetails.company_name || "Not available",
              email: recruiterDetails.email || "Not available",
              phone: recruiterDetails.phone_number || recruiterDetails.phone || "Not available",
              industry: recruiterDetails.industry || "Not available",
              company_size: recruiterDetails.company_size || "Not available",
              location: recruiterDetails.location || "Not available",
              kyc_status: recruiterDetails.kyc_status || "Not verified",
              approval_status: recruiterDetails.hasadminapproved ? "Approved" : "Pending",
              registration_date: recruiterDetails.created_at || recruiterDetails.registration_date || "",
              bio: recruiterDetails.description || recruiterDetails.bio || "",
              experience_years: recruiterDetails.experience_years || "",
              website: recruiterDetails.company_website || recruiterDetails.website || "",
              company_logo: recruiterDetails.company_logo || null,
              kyc_doc_url: recruiterDetails.kycDocUrl || null,
              kyc_document_number: recruiterDetails.kyc_document_number || "",
              kyc_notes: recruiterDetails.kyc_notes || "",
              kyc_type: recruiterDetails.kyc_type || "",
              rejection_reason: recruiterDetails.rejection_reason || "",
              account_status: recruiterDetails.status || "active",
              address: recruiterDetails.address || "",
              city: recruiterDetails.city || "",
              state: recruiterDetails.state || "",
              country: recruiterDetails.country || "",
              postal_code: recruiterDetails.postal_code || "",
              founded_year: recruiterDetails.founded_year || ""
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load data for editing:', error);
        alert('Failed to load data for editing');
        setEditingTask(null);
      } finally {
        setLoadingJobEdit(false);
      }
    };

    fetchEditData();
  }, [editingTask, recruiterCache]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApproveTask = async (task) => {
    try {
      setLoading(true);
      let result;

      switch (task.category) {
        case 'postnewjob':
          result = await adminService.approveJob(task.task_id);
          break;
        case 'editjob':
          result = await adminService.approveEditedJob(task.task_id);
          break;
        case 'closedjob':
          result = await adminService.approveJobClosing(task.task_id);
          break;
        case 'newapplication':
          result = await adminService.approveJobApplicationByStudent(task.task_id);
          break;
        case 'change status of application':
          result = await adminService.approveApplicationStatusChanged(task.task_id);
          break;
        default:
          throw new Error('Unknown task category');
      }

      alert(`Job approved successfully: ${result.message || 'Job fulfilled'}`);

      // Hide the job from frontend immediately
      const jobId = task.job_id || `no-job-${task.id}`;
      setHiddenJobs(prev => new Set([...prev, jobId]));

    } catch (error) {
      console.error('Failed to approve job:', error);
      alert('Failed to approve job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTask = async (task) => {
    try {
      setLoading(true);
      let result;

      switch (task.category) {
        case 'postnewjob':
          result = await adminService.rejectJob(task.task_id);
          break;
        default:
          throw new Error('Rejection not supported for this task type');
      }

      alert(`Job rejected successfully: ${result.message || 'Job rejected'}`);

      // Hide the job from frontend immediately
      const jobId = task.job_id || `no-job-${task.id}`;
      setHiddenJobs(prev => new Set([...prev, jobId]));

    } catch (error) {
      console.error('Failed to reject job:', error);
      alert('Failed to reject job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditJobSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingJobEdit(true);

      const jobPayload = {
        ...jobData,
        employer_id: editingTask.recruiter_id,
        responsibilities: jobData.responsibilities.split("\n").filter(r => r.trim()),
        qualifications: jobData.qualifications.split("\n").filter(q => q.trim()),
      };

      await recruiterExternalService.updateJob(editingTask.job_id, jobPayload);
      alert('Job updated successfully');
      setEditingTask(null);
      setJobData({
        job_title: "",
        company_name: "",
        location: "",
        employment_type: "Full-Time",
        work_mode: "On-site",
        salary_range: { min: "", max: "", currency: "INR" },
        experience_required: { min_years: "", max_years: "" },
        skills_required: [],
        description: "",
        responsibilities: "",
        qualifications: "",
        application_deadline: "",
        contact_email: "",
        contact_number: "",
        job_status: "open",
      });
      setRecruiterDetails(null);

      const jobsData = await adminService.getPendingJobs();
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
    } catch (error) {
      console.error('Failed to update job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setLoadingJobEdit(false);
    }
  };

  const handleMarkJobPremium = async (task, isPremium = true) => {
    if (!task.job_id) {
      alert('Cannot mark this job as premium: Job ID not found');
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.markJobPremium(task.job_id, isPremium, 'job');
      alert(`Job successfully marked as ${isPremium ? 'premium' : 'non-premium'}: ${result.message || 'Success'}`);

      const updatedOverrides = { ...premiumOverrides, [task.job_id]: isPremium };
      setPremiumOverrides(updatedOverrides);
      localStorage.setItem('jobPremiumOverrides', JSON.stringify(updatedOverrides));

      setJobs(prevJobs => prevJobs.map(job => {
        if (job.job_id === task.job_id) {
          const updatedTasks = job.tasks ? job.tasks.map(t => ({
            ...t,
            premium_job: isPremium
          })) : [];
          return { ...job, premium_job: isPremium, is_premium: isPremium, tasks: updatedTasks };
        }
        return job;
      }));

      setFilteredJobs(prevFiltered => prevFiltered.map(job => {
        if (job.job_id === task.job_id) {
          const updatedTasks = job.tasks ? job.tasks.map(t => ({
            ...t,
            premium_job: isPremium
          })) : [];
          return { ...job, premium_job: isPremium, is_premium: isPremium, tasks: updatedTasks };
        }
        return job;
      }));

    } catch (error) {
      console.error('Failed to mark job as premium:', error);
      alert('Failed to mark job as premium. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const safeFilteredJobs = Array.isArray(filteredJobs) ? filteredJobs : [];
  const totalPages = Math.ceil(safeFilteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = safeFilteredJobs.slice(startIndex, endIndex);

  // Calculate counts for all jobs (not just filtered)
  const allGroupedJobs = React.useMemo(() => {
    let tasks = Array.isArray(jobs) ? jobs : [];
    const groupedJobs = {};

    tasks.forEach(task => {
      const jobId = task.job_id || `no-job-${task.id}`;

      if (!groupedJobs[jobId]) {
        groupedJobs[jobId] = {
          id: task.id,
          job_id: jobId,
          company_name: task.company_name || 'N/A',
          title: task.title || task.category,
          posted_date: task.posted_date,
          updated_date: task.updated_date,
          is_premium: premiumOverrides[task.job_id] !== undefined ? premiumOverrides[task.job_id] : (task.is_premium || task.premium_job || false),
          tasks: []
        };
      }

      groupedJobs[jobId].tasks.push(task);
    });

    return Object.values(groupedJobs).filter(job => !hiddenJobs.has(job.job_id));
  }, [jobs, premiumOverrides, hiddenJobs]);

  const totalJobsCount = allGroupedJobs.length;
  const pendingJobsCount = allGroupedJobs.filter(j => j.tasks?.some(t => t.status === 'pending')).length;
  const fulfilledJobsCount = allGroupedJobs.filter(j => j.tasks?.some(t => t.status === 'fulfilled')).length;

  // Theme variables
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Briefcase className="text-blue-500" size={24} />
            </div>
          </div>
          <h3 className={`text-lg font-bold ${textColor}`}>Loading jobs...</h3>
          <p className={`${textSecondary} mt-2`}>Please wait</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-lg border ${borderColor} p-8 max-w-md w-full text-center`}>
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className={`text-xl font-bold ${textColor} mb-2`}>Error Loading Jobs</h2>
          <p className={`${textSecondary} mb-6`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor} flex items-center gap-2`}>
                  <Briefcase className="text-blue-500" size={28} />
                  Manage Jobs
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  View and manage all pending jobs requiring approval
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className={textSecondary} />
                  <span className={`text-sm font-semibold ${textColor}`}>{safeFilteredJobs.length}</span>
                  <span className={`text-xs ${textSecondary}`}>Total Jobs</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    {safeFilteredJobs.filter(j => j.tasks?.some(t => t.status === 'pending')).length}
                  </span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">Pending</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-green-50 dark:bg-green-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    {safeFilteredJobs.filter(j => j.tasks?.some(t => t.status === 'fulfilled')).length}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400">Fulfilled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className={`${cardBg} rounded-lg border ${borderColor} p-4 mb-6`}>
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by job title, company, or ID..."
                  className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                />
              </div>
            </div>

            {/* Status, Date, and Sort Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  All ({totalJobsCount})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'pending'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  Pending ({pendingJobsCount})
                </button>
                <button
                  onClick={() => setStatusFilter('fulfilled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'fulfilled'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                      : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                  }`}
                >
                  Fulfilled ({fulfilledJobsCount})
                </button>
              </div>

              {/* Date Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Calendar size={18} className={textSecondary} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`px-4 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={18} className={textSecondary} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-4 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor} cursor-pointer`}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="updated">Recently Updated</option>
                  <option value="company_asc">Company (A-Z)</option>
                  <option value="company_desc">Company (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-4">
          <p className={`text-sm ${textSecondary}`}>
            Showing <span className={`font-semibold ${textColor}`}>{safeFilteredJobs.length}</span> {safeFilteredJobs.length === 1 ? 'job' : 'jobs'}
            {dateFilter !== 'all' && (
              <span className="ml-2">
                ({dateFilter.replace(/([A-Z])/g, ' $1').trim()})
              </span>
            )}
          </p>
        </div>

        {/* Jobs List */}
        {currentJobs.length === 0 ? (
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className={`w-16 h-16 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <FileText size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>No jobs found</h3>
            <p className={`${textSecondary}`}>
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? "Try adjusting your filters" : "No jobs match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentJobs.map((job) => {
              const tasks = job.tasks || [];
              const pendingTasks = tasks.filter(task => task.status === 'pending');
              const fulfilledTasks = tasks.filter(task => task.status === 'fulfilled');
          
              return (
                <div
                  key={job.job_id || job.id}
                  className={`${cardBg} border ${borderColor} rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 transition-colors shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-base font-bold ${textColor} truncate`}>
                          {job.company_name || 'N/A'}
                        </h3>
                        {job.is_premium && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 rounded text-xs font-semibold flex items-center gap-1">
                            <Star size={11} fill="currentColor" />
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className={`flex items-center gap-1 ${textSecondary}`}>
                          <Calendar size={11} />
                          Created: {formatDate(job.posted_date)}
                        </span>
                        <span className={`flex items-center gap-1 ${textSecondary}`}>
                          <Clock size={11} />
                          Updated: {formatDate(job.updated_date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pendingTasks.length > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400 rounded text-xs font-semibold whitespace-nowrap">
                          {pendingTasks.length} Pending
                        </span>
                      )}
                      {fulfilledTasks.length > 0 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 rounded text-xs font-semibold whitespace-nowrap">
                          {fulfilledTasks.length} Fulfilled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!tasks.some(task => task.status === 'pending' && (task.category === 'postnewjob' || task.category === 'editjob'))}
                      onClick={() => {
                        const pendingTask = tasks.find(t => t.status === 'pending' && (t.category === 'postnewjob' || t.category === 'editjob'));
                        if (pendingTask) handleApproveTask(pendingTask);
                      }}
                    >
                      <Check size={12} />
                      Approve
                    </button>

                    <button
                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!tasks.some(task => task.status === 'pending' && task.category === 'postnewjob')}
                      onClick={() => handleRejectTask(tasks.find(t => t.category === 'postnewjob' && t.status === 'pending'))}
                    >
                      <X size={12} />
                      Reject
                    </button>

                    <button
                      className={`px-3 py-1.5 border ${borderColor} ${textColor} rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1`}
                      onClick={() => {
                        const jobTask = tasks.find(t => t.category === 'editjob' || t.category === 'postnewjob');
                        if (jobTask) setEditingTask({...jobTask, category: 'viewjob'});
                      }}
                    >
                      <Eye size={12} />
                      View
                    </button>

                    <button
                      className={`px-3 py-1.5 border ${borderColor} ${textColor} rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50`}
                      disabled={!tasks.some(task => task.category === 'editjob' || task.category === 'postnewjob')}
                      onClick={() => {
                        const jobTask = tasks.find(t => t.category === 'editjob' || t.category === 'postnewjob');
                        if (jobTask) setEditingTask(jobTask);
                      }}
                    >
                      <Edit size={12} />
                      Edit
                    </button>

                    {job.job_id && tasks.length > 0 && (
                      <button
                        className={`px-3 py-1.5 ${job.is_premium ? 'bg-gray-600' : 'bg-yellow-600'} text-white rounded hover:opacity-90 transition-opacity text-xs font-medium flex items-center gap-1`}
                        onClick={() => handleMarkJobPremium(tasks[0], !job.is_premium)}
                      >
                        <Star size={12} fill={job.is_premium ? "currentColor" : "none"} />
                        {job.is_premium ? 'Remove Premium' : 'Mark Premium'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${cardBg} border ${borderColor} ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className={`text-sm ${textColor} px-4 py-2 ${cardBg} border ${borderColor} rounded-lg`}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${cardBg} border ${borderColor} ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal for Edit/View */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${cardBg} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-5 border-b ${borderColor} sticky top-0 ${cardBg} z-10`}>
              <h2 className={`text-xl font-bold ${textColor}`}>
                {editingTask.category === 'newapplication' || editingTask.category === 'change status of application'
                  ? 'View Application Details'
                  : editingTask.category === 'viewjob'
                  ? 'View Job Details'
                  : 'Edit Job Posting'}
              </h2>
              <button
                onClick={() => setEditingTask(null)}
                className={`${textSecondary} hover:${textColor} transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}
              >
                <X size={24} />
              </button>
            </div>

            {recruiterDetails && (
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/30">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className={`text-sm font-semibold ${textColor}`}>
                    {recruiterDetails.company_name || 'Unknown Company'}
                  </span>
                </div>
              </div>
            )}

            <div className="p-6">
              {loadingJobEdit ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className={textSecondary}>Loading data...</p>
                </div>
              ) : (
                <>
                  {/* Application Details View */}
                  {(editingTask.category === 'newapplication' || editingTask.category === 'change status of application') && applicantDetails && (
                    <div className="space-y-6">
                      {/* Recruiter Profile Card */}
                      
                      <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-4 border ${borderColor}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 border-2 border-blue-400">
                            {applicantDetails.company_logo ? (
                              <img
                                src={applicantDetails.company_logo}
                                alt={applicantDetails.company_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl ${applicantDetails.company_logo ? 'hidden' : 'flex'}`}>
                              {(applicantDetails.company_name || 'C').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-bold ${textColor} mb-1`}>
                              {applicantDetails.recruiter_name || 'Not available'}
                            </h3>
                            <p className={`text-base font-semibold ${textSecondary} mb-1`}>
                              {applicantDetails.company_name || 'Company not specified'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className={`flex items-center gap-1 ${textSecondary}`}>
                                <Mail size={13} />
                                {applicantDetails.email || 'No email'}
                              </span>
                              {applicantDetails.phone && (
                                <span className={`flex items-center gap-1 ${textSecondary}`}>
                                  <Phone size={13} />
                                  {applicantDetails.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              applicantDetails.approval_status === 'Approved' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400'
                            }`}>
                              {applicantDetails.approval_status || 'Pending'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              applicantDetails.kyc_status === 'Verified'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
                            }`}>
                              KYC: {applicantDetails.kyc_status || 'Not verified'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Industry</label>
                          <p className={`text-sm ${textColor}`}>{applicantDetails.industry || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Company Size</label>
                          <p className={`text-sm ${textColor}`}>{applicantDetails.company_size || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Location</label>
                          <p className={`text-sm ${textColor}`}>{applicantDetails.location || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Founded Year</label>
                          <p className={`text-sm ${textColor}`}>{applicantDetails.founded_year || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>KYC Type</label>
                          <p className={`text-sm ${textColor} uppercase`}>{applicantDetails.kyc_type || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>KYC Document Number</label>
                          <p className={`text-sm ${textColor}`}>{applicantDetails.kyc_document_number || 'Not provided'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Registration Date</label>
                          <p className={`text-sm ${textColor}`}>
                            {applicantDetails.registration_date ? formatDate(applicantDetails.registration_date) : 'Not available'}
                          </p>
                        </div>
                        {applicantDetails.website && (
                          <div className="md:col-span-2">
                            <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Website</label>
                            <a 
                              href={applicantDetails.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              {applicantDetails.website}
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                        {applicantDetails.kyc_doc_url && (
                          <div className="md:col-span-2">
                            <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>KYC Document</label>
                            <a 
                              href={applicantDetails.kyc_doc_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              View KYC Document
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Job View/Edit Form */}
                  {!(editingTask.category === 'newapplication' || editingTask.category === 'change status of application') && (
                    editingTask.category === 'viewjob' ? (
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                          <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}>
                            <Briefcase size={18} className="text-blue-500" />
                            Basic Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Job Title</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                                {jobData.job_title || 'Not specified'}
                              </div>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Company Name</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                                {jobData.company_name || 'Not specified'}
                              </div>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Location</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                                {jobData.location || 'Not specified'}
                              </div>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Employment Type</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                                {jobData.employment_type || 'Not specified'}
                              </div>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Work Mode</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                                {jobData.work_mode || 'Not specified'}
                              </div>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Contact Email</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                                {jobData.contact_email || 'Not specified'}
                              </div>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Contact Number</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                                {jobData.contact_number || 'Not specified'}
                              </div>
                            </div>
                          </div>

                          {/* Salary & Experience */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Salary Range</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                                {jobData.salary_range?.min && jobData.salary_range?.max
                                  ? `${jobData.salary_range.currency || 'INR'} ${jobData.salary_range.min} - ${jobData.salary_range.max}`
                                  : 'Not specified'}
                              </div>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Experience (Years)</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                                {jobData.experience_required?.min_years && jobData.experience_required?.max_years
                                  ? `${jobData.experience_required.min_years} - ${jobData.experience_required.max_years} years`
                                  : 'Not specified'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div>
                          <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}>
                            <FileText size={18} className="text-blue-500" />
                            Job Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Description</label>
                              <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700 min-h-[100px] whitespace-pre-wrap`}>
                                {jobData.description || 'Not specified'}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Responsibilities</label>
                                <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700 min-h-[80px] whitespace-pre-wrap`}>
                                  {jobData.responsibilities || 'Not specified'}
                                </div>
                              </div>
                              <div>
                                <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Qualifications</label>
                                <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700 min-h-[80px] whitespace-pre-wrap`}>
                                  {jobData.qualifications || 'Not specified'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div>
                          <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Required Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {jobData.skills_required && jobData.skills_required.length > 0 ? (
                              jobData.skills_required.map((skill, index) => (
                                <span
                                  key={index}
                                  className={`px-3 py-1 ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-700' : 'bg-blue-100 text-blue-700 border border-blue-200'} rounded-lg text-sm`}
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className={`text-sm ${textSecondary}`}>No skills specified</span>
                            )}
                          </div>
                        </div>

                        {/* Application Deadline */}
                        <div>
                          <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Application Deadline</label>
                          <div className={`w-full px-3 py-2 border ${borderColor} rounded-lg text-sm ${cardBg} ${textColor} bg-gray-50 dark:bg-gray-700`}>
                            {jobData.application_deadline ? formatDate(jobData.application_deadline) : 'Not specified'}
                          </div>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => setEditingTask(null)}
                            className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleEditJobSubmit} className="space-y-6">
                        {console.log(jobData)}
                        {/* Basic Information */}
                        <div>
                          <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}>
                            <Briefcase size={18} className="text-blue-500" />
                            Basic Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Job Title *</label>
                              <input
                                type="text"
                                value={jobData.job_title}
                                onChange={(e) => handleInputChange('job_title', e.target.value)}
                                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                                required
                              />
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Company Name *</label>
                              <input
                                type="text"
                                value={jobData.company_name}
                                onChange={(e) => handleInputChange('company_name', e.target.value)}
                                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                                required
                              />
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Location *</label>
                              <input
                                type="text"
                                value={jobData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                                required
                              />
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Employment Type *</label>
                              <select
                                value={jobData.employment_type}
                                onChange={(e) => handleInputChange('employment_type', e.target.value)}
                                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                                required
                              >
                                <option value="Full-Time">Full-time</option>
                                <option value="Part-Time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                              </select>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Work Mode *</label>
                              <select
                                value={jobData.work_mode}
                                onChange={(e) => handleInputChange('work_mode', e.target.value)}
                                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                                required
                              >
                                <option value="On-site">On-site</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                              </select>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Contact Email</label>
                              <input
                                type="email"
                                value={jobData.contact_email}
                                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                              />
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Contact Number</label>
                              <input
                                type="tel"
                                value={jobData.contact_number}
                                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                placeholder="+91 XXXXX XXXXX"
                                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                              />
                            </div>
                          </div>

                          {/* Salary & Experience */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Salary Range</label>
                              <div className="flex gap-2">
                                <select
                                  value={jobData.salary_range.currency}
                                  onChange={(e) => handleInputChange('salary_range.currency', e.target.value)}
                                  className={`px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${cardBg} ${textColor}`}
                                >
                                  <option value="INR">₹</option>
                                  <option value="USD">$</option>
                                  <option value="EUR">€</option>
                                  <option value="GBP">£</option>
                                </select>
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={jobData.salary_range.min}
                                  onChange={(e) => handleInputChange('salary_range.min', e.target.value)}
                                  className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${cardBg} ${textColor}`}
                                />
                                <span className={`flex items-center ${textSecondary}`}>-</span>
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={jobData.salary_range.max}
                                  onChange={(e) => handleInputChange('salary_range.max', e.target.value)}
                                  className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${cardBg} ${textColor}`}
                                />
                              </div>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Experience (Years)</label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  placeholder="Min"
                                  value={jobData.experience_required.min_years}
                                  onChange={(e) => handleInputChange('experience_required.min_years', e.target.value)}
                                  className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${cardBg} ${textColor}`}
                                />
                                <span className={`flex items-center ${textSecondary}`}>-</span>
                                <input
                                  type="number"
                                  placeholder="Max"
                                  value={jobData.experience_required.max_years}
                                  onChange={(e) => handleInputChange('experience_required.max_years', e.target.value)}
                                  className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm ${cardBg} ${textColor}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div>
                          <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}>
                            <FileText size={18} className="text-blue-500" />
                            Job Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Description *</label>
                              <textarea
                                value={jobData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                                className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Responsibilities *</label>
                                <textarea
                                  value={jobData.responsibilities}
                                  onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                                  rows={3}
                                  placeholder="One per line"
                                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                                  required
                                />
                              </div>
                              <div>
                                <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Qualifications *</label>
                                <textarea
                                  value={jobData.qualifications}
                                  onChange={(e) => handleInputChange('qualifications', e.target.value)}
                                  rows={3}
                                  placeholder="One per line"
                                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div>
                          <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Required Skills</h3>
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              placeholder="Add a required skill"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                              className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                            />
                            <button
                              type="button"
                              onClick={handleAddSkill}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                            >
                              <Plus size={14} />
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {jobData.skills_required.map((skill, index) => (
                              <span
                                key={index}
                                className={`px-3 py-1 ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-700' : 'bg-blue-100 text-blue-700 border border-blue-200'} rounded-lg text-sm flex items-center gap-2`}
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Application Deadline */}
                        <div>
                          <label className={`text-xs font-semibold ${textSecondary} mb-1 block`}>Application Deadline</label>
                          <input
                            type="date"
                            value={jobData.application_deadline}
                            onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                            className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => setEditingTask(null)}
                            className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loadingJobEdit}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {loadingJobEdit ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Updating...
                              </>
                            ) : (
                              <>
                                <Check size={16} />
                                Update Job
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )
                  )}

                  {/* Close Button for Application View */}
                  {(editingTask.category === 'newapplication' || editingTask.category === 'change status of application') && (
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                      <button
                        onClick={() => setEditingTask(null)}
                        className={`px-6 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;