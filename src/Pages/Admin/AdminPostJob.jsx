import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuth } from "../../Contexts/AuthContext";
import { adminService } from "../../services/adminService";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import { adminExternalService } from "../../services/adminExternalService";
import { jobService } from "../../services/jobService";
import {
  FileText,
  MapPin,
  Clock,
  Plus,
  Award,
  CheckCircle,
  X,
  ArrowLeft,
  Save,
  Phone,
  Mail,
  Users
} from "lucide-react";

const AdminPostJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams(); // For edit mode
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const fromApproveFlow = location.state?.fromApproveFlow === true;
  const employerIdFromState = location.state?.employer_id ?? location.state?.employerId;
  const approveTaskId = location.state?.approveTaskId;
  const approveType = location.state?.approveType; // editjob | postnewjob | closedjob
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  // Check if we should bypass permission checks (for debugging)
  const searchParams = new URLSearchParams(window.location.search);
  const bypassPermissions = searchParams.get('bypass') === 'true';

  if (bypassPermissions) {
    console.warn('⚠️ PERMISSION BYPASS ENABLED - This should only be used for debugging');
  }

  // Form state
  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    description: "",
    location: "",
    salary_range: {
      min: "",
      max: "",
      currency: "INR",
    },
    employment_type: "Full-Time",
    work_mode: "On-site",
    experience_required: {
      min_years: "",
      max_years: "",
    },
    skills_required: [],
    category: "",
    responsibilities: "",
    qualifications: "",
    application_deadline: "",
    contact_email: "",
    contact_number: "",
    is_premium: false,
    additional_benefits: []
  });

  // Fetch job details if editing
  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, user]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const employerIdFromState = location.state?.employer_id ?? location.state?.employerId;
      let job = null;
      let allJobs = [];
      let availableJobsForLog = [];

      // Recruiter-side edit flow jaisa hi approach: pehle employer_id se job list fetch.
      if (employerIdFromState) {
        try {
          const jobsDataByEmployer = await recruiterExternalService.getAllPostedJobs(employerIdFromState);
          const allJobsRawByEmployer = jobsDataByEmployer?.jobs || jobsDataByEmployer || [];
          allJobs = Array.isArray(allJobsRawByEmployer) ? allJobsRawByEmployer : [];
          availableJobsForLog = allJobs;

          job = allJobs.find((j) => (j?.job_id == jobId || j?.id == jobId)) || null;

          console.log('=== EDIT JOB DEBUG (EMPLOYER FETCH) ===', {
            employerId: employerIdFromState,
            totalJobsFetched: allJobs.length,
            jobFound: Boolean(job),
          });
        } catch (empErr) {
          console.warn('Failed to fetch jobs by employer id:', empErr);
        }
      }

      // Agar employer_id list me nahi mila, to admin ke liye all jobs fallback.
      if (!job) {
        const jobsData = await adminService.getAllJobsForAdmin();
        const allJobsRaw = jobsData?.jobs || jobsData || [];
        allJobs = Array.isArray(allJobsRaw) ? allJobsRaw : [];
        availableJobsForLog = allJobs;

        console.log('=== EDIT JOB DEBUG INFO ===');
        console.log('JobId from URL:', jobId);
        console.log('User object:', JSON.stringify(user, null, 2));
        console.log('Total jobs fetched:', allJobs.length);

        job = allJobs.find((j) => (j?.job_id == jobId || j?.id == jobId)) || null;
      } else {
        console.log('=== EDIT JOB DEBUG INFO ===');
        console.log('JobId from URL:', jobId);
        console.log('User object:', JSON.stringify(user, null, 2));
        console.log('Total jobs fetched:', allJobs.length);
      }

      // Fallback: agar job getalljobs me available nahi hai (pending state),
      // to tasks list (admin approvals workflow) se details lete hain.
      if (!job) {
        try {
          const tasksData = await adminExternalService.getAllTasks();
          const tasks = tasksData?.tasks || [];
          const task = tasks.find(t =>
            t?.job_id == jobId ||
            t?.jobId == jobId ||
            t?.jobID == jobId ||
            t?.id == jobId
          );

          if (task) {
            // Many backends store edited job fields inside nested objects (e.g. task.data / task.payload / task.job).
            // We'll merge those objects into `job` so AdminPostJob's form can fill everything.
            const payload =
              task?.job && typeof task.job === "object"
                ? task.job
                : task?.data && typeof task.data === "object"
                  ? task.data
                  : task?.payload && typeof task.payload === "object"
                    ? task.payload
                    : task?.after && typeof task.after === "object"
                      ? task.after
                      : task?.result && typeof task.result === "object"
                        ? task.result
                        : null;

            job = {
              ...task,
              ...(payload ? payload : {}),
              // Normalize identifiers so the rest of this file works.
              id: task.id ?? task.job_id ?? task.jobId ?? task.jobID ?? payload?.id ?? payload?.job_id ?? payload?.jobId,
              job_id: task.job_id ?? task.id ?? task.jobId ?? task.jobID ?? payload?.job_id ?? payload?.id ?? payload?.jobId,
              // Normalize common naming differences.
              job_title: task.job_title ?? task.title ?? task.jobTitle ?? payload?.job_title ?? payload?.title ?? payload?.jobTitle ?? "",
              company_name:
                task.company_name ?? task.company ?? task.companyName ?? task.recruiter_company_name ?? payload?.company_name ?? payload?.company ?? payload?.companyName ?? "",
              location: task.location ?? task.job_location ?? task.jobLocation ?? payload?.location ?? payload?.job_location ?? payload?.jobLocation ?? "",
            };

            console.log("=== EDIT JOB FALLBACK TASK ===", {
              foundTaskJobId: task?.job_id ?? task?.id,
              taskKeysCount: task ? Object.keys(task).length : 0,
              payloadMerged: Boolean(payload),
              payloadKeysCount: payload ? Object.keys(payload).length : 0,
            });
            if (payload) {
              console.log("=== EDIT JOB FALLBACK TASK PAYLOAD KEYS ===", Object.keys(payload));
            }
          }
        } catch (taskErr) {
          console.warn('Failed to fetch pending task fallback job:', taskErr);
        }
      }
      
      if (!job) {
        console.error('=== JOB NOT FOUND ===');
        console.log('Searched for job with ID:', jobId);
        console.log('Available job IDs (first 10):', availableJobsForLog.map(j => ({
          job_id: j.job_id,
          id: j.id,
          title: j.job_title,
          posted_by: j.posted_by
        })).slice(0, 10));
        setError('Job not found. This job may not exist or could not be loaded.');
        return;
      }

      console.log('=== JOB FOUND ===');
      console.log('Found job:', {
        job_id: job.job_id,
        id: job.id,
        title: job.job_title,
        company: job.company_name,
        posted_by: job.posted_by
      });

      // Normalize task/job payload fields (backend me naming variations ho sakti hain)
      job = {
        ...job,
        // Job title/company/location
        job_title:
          job.job_title ??
          job.title ??
          job.jobTitle ??
          job.job_name ??
          job.new_job_title ??
          job.updated_job_title ??
          job.posting_title ??
          "",
        company_name:
          job.company_name ??
          job.company ??
          job.companyName ??
          job.employer_company_name ??
          job.recruiter_company_name ??
          job.new_company_name ??
          "",
        location:
          job.location ??
          job.job_location ??
          job.jobLocation ??
          job.city ??
          job.country ??
          job.new_location ??
          "",

        // Core content
        description:
          job.description ??
          job.job_description ??
          job.jobDescription ??
          job.desc ??
          job.job_desc ??
          job.new_description ??
          "",
        responsibilities: job.responsibilities ?? job.responsibility ?? job.new_responsibilities ?? "",
        qualifications: job.qualifications ?? job.qualification ?? job.new_qualifications ?? "",

        // Skills
        skills_required:
          job.skills_required ??
          job.skills ??
          job.skill_list ??
          job.required_skills ??
          job.requiredSkills ??
          job.new_skills ??
          [],

        // Deadline/contact
        application_deadline:
          job.application_deadline ??
          job.deadline ??
          job.application_deadline_date ??
          job.deadline_date ??
          job.due_date ??
          "",
        contact_email: job.contact_email ?? job.email ?? job.contactEmail ?? job.contact_email_address ?? "",
        contact_number: job.contact_number ?? job.phone_number ?? job.phone ?? job.contactPhone ?? job.contact_phone ?? "",

        // Employment/meta
        employment_type: job.employment_type ?? job.job_type ?? job.jobType ?? job.type ?? "Full-Time",
        work_mode: job.work_mode ?? job.workMode ?? job.work_mode_type ?? "On-site",

        // Premium/benefits
        is_premium: job.is_premium ?? job.premium_job ?? job.premium ?? false,
        additional_benefits: job.additional_benefits ?? job.benefits ?? job.new_benefits ?? [],

        // Salary/experience (only best-effort; formatter further handles shapes)
        salary_range: job.salary_range ?? job.salary ?? job.compensation ?? null,
        experience_required: job.experience_required ?? job.experience ?? job.experienceRange ?? null,
      };

      console.log('=== EDIT JOB NORMALIZED FIELDS ===', {
        job_title: job.job_title,
        company_name: job.company_name,
        location: job.location,
        skills_required_count: Array.isArray(job.skills_required) ? job.skills_required.length : typeof job.skills_required,
        has_description: Boolean(job.description),
        responsibilities_type: Array.isArray(job.responsibilities) ? 'array' : typeof job.responsibilities,
        qualifications_type: Array.isArray(job.qualifications) ? 'array' : typeof job.qualifications,
        has_salary_range: Boolean(job.salary_range),
        has_experience_required: Boolean(job.experience_required),
      });

      // Format experience_required
      let experienceRequired = {
        min_years: "",
        max_years: "",
      };

      if (job.experience_required) {
        if (typeof job.experience_required === 'object') {
          experienceRequired = {
            min_years: job.experience_required.min_years?.toString() || "",
            max_years: job.experience_required.max_years?.toString() || "",
          };
        }
      }

      // Format salary_range
      let salaryRangeObj = {
        min: "",
        max: "",
        currency: "INR",
      };
      
      if (job.salary_range) {
        if (typeof job.salary_range === 'object') {
          salaryRangeObj = {
            min: job.salary_range.min?.toString() || "",
            max: job.salary_range.max?.toString() || "",
            currency: job.salary_range.currency || "INR",
          };
        } else if (typeof job.salary_range === 'string') {
          // Try to parse string format "INR 500000 - 800000" or "₹5,00,000 - ₹8,00,000"
          salaryRangeObj = {
            min: "",
            max: "",
            currency: "INR",
          };
        }
      }

      // Format skills
      let skillsArray = [];
      if (job.skills_required) {
        if (Array.isArray(job.skills_required)) {
          skillsArray = job.skills_required;
        } else if (typeof job.skills_required === 'string') {
          // Try splitting by comma or comma+space
          if (job.skills_required.includes(',')) {
            skillsArray = job.skills_required.split(',').map(s => s.trim()).filter(s => s);
          } else if (job.skills_required.includes(', ')) {
            skillsArray = job.skills_required.split(', ').map(s => s.trim()).filter(s => s);
          } else {
            // Single skill
            skillsArray = [job.skills_required.trim()];
          }
        }
      }

      // Format responsibilities
      let responsibilitiesText = "";
      if (job.responsibilities) {
        if (Array.isArray(job.responsibilities)) {
          responsibilitiesText = job.responsibilities.filter(r => r && r.trim()).join("\n");
        } else if (typeof job.responsibilities === 'string') {
          responsibilitiesText = job.responsibilities;
        }
      }

      // Format qualifications
      let qualificationsText = "";
      if (job.qualifications) {
        if (Array.isArray(job.qualifications)) {
          qualificationsText = job.qualifications.filter(q => q && q.trim()).join("\n");
        } else if (typeof job.qualifications === 'string') {
          qualificationsText = job.qualifications;
        }
      }

      // Format application_deadline
      let deadlineDate = "";
      if (job.application_deadline) {
        try {
          // Convert to YYYY-MM-DD format for date input
          const date = new Date(job.application_deadline);
          if (!isNaN(date.getTime())) {
            deadlineDate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn('Failed to parse application deadline:', e);
        }
      }

      const formDataToSet = {
        job_title: job.job_title || "",
        company_name: job.company_name || "",
        description: job.description || "",
        location: job.location || "",
        salary_range: salaryRangeObj,
        employment_type: job.employment_type || "Full-Time",
        work_mode: job.work_mode || "On-site",
        experience_required: experienceRequired,
        skills_required: skillsArray,
        category: job.category || "",
        responsibilities: responsibilitiesText,
        qualifications: qualificationsText,
        application_deadline: deadlineDate,
        contact_email: job.contact_email || "",
        contact_number: job.contact_number || "",
        is_premium: job.is_premium || false,
        additional_benefits: Array.isArray(job.additional_benefits) ? job.additional_benefits : []
      };

      setFormData(formDataToSet);

      console.log('=== FORM DATA SET ===');
      console.log('Job Title:', formDataToSet.job_title);
      console.log('Company:', formDataToSet.company_name);
      console.log('Skills count:', skillsArray.length);
      console.log('Responsibilities lines:', responsibilitiesText ? responsibilitiesText.split('\n').length : 0);
      console.log('Qualifications lines:', qualificationsText ? qualificationsText.split('\n').length : 0);
      console.log('Is Premium:', formDataToSet.is_premium);
      console.log('Additional Benefits:', formDataToSet.additional_benefits);
      console.log('=========================');
    } catch (error) {
      console.error('=== ERROR FETCHING JOB ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError('Failed to load job details: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    const keys = field.split(".");
    if (keys.length > 1) {
      setFormData((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleBenefitChange = (benefit) => {
    setFormData(prev => ({
      ...prev,
      additional_benefits: (prev.additional_benefits || []).includes(benefit)
        ? (prev.additional_benefits || []).filter(b => b !== benefit)
        : [...(prev.additional_benefits || []), benefit]
    }));
  };



  const performSaveJob = async ({ silent = false } = {}) => {
    const jobData = {
      job_title: formData.job_title,
      company_name: formData.company_name || null,
      description: formData.description,
      location: formData.location,
      employment_type: formData.employment_type,
      work_mode: formData.work_mode,
      salary_range: formData.salary_range,
      experience_required: formData.experience_required,
      skills_required: formData.skills_required,
      responsibilities: formData.responsibilities.split("\n").filter(r => r.trim()),
      qualifications: formData.qualifications.split("\n").filter(q => q.trim()),
      category: formData.category || null,
      application_deadline: formData.application_deadline || null,
      contact_email: formData.contact_email || null,
      contact_number: formData.contact_number || null,
      additional_benefits: formData.additional_benefits || [],
      status: "Open",
      is_premium: formData.is_premium,
      posted_by: "admin",
      to_show_user: true,
      admin_id: user?.admin_id || user?.id || user?.user_id,
      // adminService.updateAdminJob expects employer_id in body for some backends.
      employer_id: employerIdFromState ?? user?.employer_id ?? null
    };

    let jobResult;

    if (jobId) {
      // Update existing job
      jobResult = await adminService.updateAdminJob(jobId, jobData);
      if (!silent) alert("Job updated successfully!");
    } else {
      // Create new job
      jobResult = await adminService.postJobByAdmin(jobData);
      if (!silent) alert("Job posted successfully!");
    }

    // If logo file is selected, upload the logo
    if (logoFile && (jobResult?.job_id || jobId)) {
      try {
        const targetJobId = jobId || jobResult.job_id;
        await jobService.uploadJobLogo(targetJobId, logoFile);
        console.log("Job logo uploaded successfully");
      } catch (logoErr) {
        console.error("Failed to upload job logo:", logoErr);
        alert("Job saved successfully, but failed to upload logo. You can try again later.");
      }
    }

    // Mark job as premium if checkbox was checked
    if (formData.is_premium) {
      try {
        const targetJobId = jobId || jobResult.job_id;
        await adminService.markJobPremium(targetJobId, true, "job");
        console.log("Job marked as premium successfully");
      } catch (premiumError) {
        console.error("Failed to mark job as premium:", premiumError);
        alert("Job saved successfully, but failed to mark as premium. You can try again later.");
      }
    }

    // Clear logo file after successful submission
    setLogoFile(null);

    return jobResult;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await performSaveJob();
      // If coming from approve flow, go back to reports
      navigate(fromApproveFlow ? "/admin/job-application-reports" : "/admin/job-posting");
    } catch (error) {
      console.error("Failed to save job:", error);
      setError("Failed to save job. Please try again.");
      alert("Failed to save job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAndApprove = async () => {
    if (!approveTaskId) {
      alert("Approve task ID missing. Please go back and try again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("=== UPDATE & APPROVE FLOW ===", {
        jobId,
        fromApproveFlow,
        approveTaskId,
        approveType,
        employerIdFromState,
      });

      await performSaveJob({ silent: true });

      console.log("=== UPDATE DONE, START APPROVAL ===");

      // Backend workflow:
      // - "postnewjob"   => approveJob()
      // - "editjob"      => approveEditedJob()
      // - "closedjob"   => approveJobClosing()
      if (approveType === "editjob") {
        console.log("Calling approveEditedJob with", approveTaskId);
        await adminService.approveEditedJob(approveTaskId);
      } else if (approveType === "postnewjob") {
        console.log("Calling approveJob with", approveTaskId);
        await adminService.approveJob(approveTaskId);
      } else if (approveType === "closedjob") {
        console.log("Calling approveJobClosing with", approveTaskId);
        await adminService.approveJobClosing(approveTaskId);
      } else {
        // Safe default
        console.log("Fallback calling approveJob with", approveTaskId, "approveType:", approveType);
        await adminService.approveJob(approveTaskId);
      }

      alert("Job updated and approved successfully!");
      navigate("/admin/job-application-reports");
    } catch (error) {
      console.error("Failed to update and approve job:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update and approve job. Please try again.";
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Show loading state when fetching job data for edit
  if (jobId && loading) {
    return (
      <div className={`min-h-screen ${bgColor}`}>
        <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/job-posting')}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <ArrowLeft size={20} className={textColor} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${textColor}`}>
                  Edit Job Posting
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Loading job details...
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <FileText className="text-blue-500" size={24} />
              </div>
            </div>
            <h3 className={`text-lg font-bold ${textColor}`}>Loading job details...</h3>
            <p className={`${textSecondary} mt-2`}>Please wait while we fetch the job information</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if job not found
  if (jobId && error) {
    return (
      <div className={`min-h-screen ${bgColor}`}>
        <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <ArrowLeft size={20} className={textColor} />
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${textColor}`}>
                  Edit Job Posting
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="text-red-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-red-500 mb-2">Failed to Load Job</h3>
            <p className={`${textSecondary} mb-6`}>{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
            >
              <ArrowLeft size={20} className={textColor} />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${textColor}`}>
                {jobId ? 'Edit Job Posting' : 'Post New Job'}
              </h1>
              <p className={`text-sm ${textSecondary} mt-1`}>
                {jobId ? 'Update job details' : 'Create a new job posting'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Show edit mode indicator */}
        {jobId && formData.job_title && (
          <div className={`mb-4 p-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDark ? 'border-blue-500/30' : 'border-blue-200'} rounded-lg`}>
            <div className="flex items-start gap-3">
              <FileText className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${textColor} mb-2`}>Editing Job: {formData.job_title}</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className={textSecondary}>Company:</span>
                    <p className={`font-medium ${textColor}`}>{formData.company_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className={textSecondary}>Location:</span>
                    <p className={`font-medium ${textColor}`}>{formData.location || 'N/A'}</p>
                  </div>
                  <div>
                    <span className={textSecondary}>Type:</span>
                    <p className={`font-medium ${textColor}`}>{formData.employment_type}</p>
                  </div>
                  <div>
                    <span className={textSecondary}>Skills:</span>
                    <p className={`font-medium ${textColor}`}>{formData.skills_required.length} loaded</p>
                  </div>
                </div>
                <p className={`text-xs ${textSecondary} mt-2`}>Job ID: {jobId} • All data loaded successfully</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className={`rounded-lg shadow-sm border ${borderColor} ${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className={isDark ? 'text-blue-400' : 'text-blue-500'} size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Basic Information</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange("job_title", e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${jobId && formData.job_title ? 'ring-1 ring-green-500' : ''}`}
                />
                {jobId && formData.job_title && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Loaded from existing job</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  placeholder="Your company name"
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                />
              </div>

              <div className="col-span-2">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Job Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const maxSize = 5 * 1024 * 1024;
                      if (file.size > maxSize) {
                        alert('File size must be less than 5MB');
                        e.target.value = '';
                        setLogoFile(null);
                        return;
                      }
                      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                      if (!allowedTypes.includes(file.type)) {
                        alert('Please select a valid image file (JPG, PNG, or GIF)');
                        e.target.value = '';
                        setLogoFile(null);
                        return;
                      }
                      setLogoFile(file);
                    } else {
                      setLogoFile(null);
                    }
                  }}
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                />
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Upload a logo for this job posting (optional). Max size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Mumbai, India or Remote"
                    required
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => handleInputChange("employment_type", e.target.value)}
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                >
                  <option value="Full-Time">Full-time</option>
                  <option value="Part-Time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Work Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.work_mode}
                  onChange={(e) => handleInputChange("work_mode", e.target.value)}
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Application Deadline
                </label>
                <div className="relative">
                  <Clock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Salary Range
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={formData.salary_range.currency}
                    onChange={(e) => handleInputChange("salary_range.currency", e.target.value)}
                    className={`px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <input
                    type="number"
                    value={formData.salary_range.min}
                    onChange={(e) => handleInputChange("salary_range.min", e.target.value)}
                    placeholder="Min"
                    className={`flex-1 px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                  <span className={textSecondary}>-</span>
                  <input
                    type="number"
                    value={formData.salary_range.max}
                    onChange={(e) => handleInputChange("salary_range.max", e.target.value)}
                    placeholder="Max"
                    className={`flex-1 px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Experience Required (Years)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.experience_required.min_years}
                    onChange={(e) => handleInputChange("experience_required.min_years", e.target.value)}
                    placeholder="Min"
                    className={`flex-1 px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                  <span className={textSecondary}>-</span>
                  <input
                    type="number"
                    value={formData.experience_required.max_years}
                    onChange={(e) => handleInputChange("experience_required.max_years", e.target.value)}
                    placeholder="Max"
                    className={`flex-1 px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              {/* Premium Job Toggle */}
              <div className="col-span-2">
                <label className={`flex items-center gap-2 ${textColor} text-sm font-medium`}>
                  <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Mark as Premium Job (will appear first in search results)
                </label>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={`rounded-lg shadow-sm border ${borderColor} ${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Users className={isDark ? 'text-indigo-400' : 'text-indigo-500'} size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Contact Information</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    required
                    placeholder="contact@company.com"
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) => handleInputChange('contact_number', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-10 pr-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                  />
                </div>
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Optional: Provide a contact number for applicants to reach you
                </p>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className={`rounded-lg shadow-sm border ${borderColor} ${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className={isDark ? 'text-purple-400' : 'text-purple-500'} size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Job Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Provide a detailed job description..."
                  rows={14}
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm `}
                />
               
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Responsibilities <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => handleInputChange("responsibilities", e.target.value)}
                  placeholder="List key responsibilities (one per line)..."
                  rows={6}
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm `}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textColor} mb-2`}>
                  Qualifications <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) => handleInputChange("qualifications", e.target.value)}
                  placeholder="List required qualifications (one per line)..."
                  rows={6}
                  required
                  className={`w-full px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm `}
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className={`rounded-lg shadow-sm border ${borderColor} ${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Award className={isDark ? 'text-green-400' : 'text-green-500'} size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Required Skills</h2>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a required skill and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className={`flex-1 px-3 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.skills_required.map((skill, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'} rounded-full text-sm font-medium`}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className={`hover:${isDark ? 'text-blue-200' : 'text-blue-800'}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className={`rounded-lg shadow-sm border ${borderColor} ${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Award className={isDark ? 'text-yellow-400' : 'text-yellow-500'} size={20} />
              <h2 className={`text-lg font-bold ${textColor}`}>Additional Benefits</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                'PF & ESIC',
                'Health Insurance',
                'Performance Bonus',
                'Flexible Working Hours',
                'Work From Home',
                'Paid Leaves',
                'Travelling Allowance',
                'Dearness Allowance'
              ].map((benefit) => (
                <label key={benefit} className={`flex items-center gap-3 ${textColor} text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md`}>
                  <input
                    type="checkbox"
                    checked={(formData.additional_benefits || []).includes(benefit)}
                    onChange={() => handleBenefitChange(benefit)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="font-medium">{benefit}</span>
                </label>
              ))}
            </div>

            <p className={`text-xs ${textSecondary} mt-3`}>
              Select the additional benefits offered by this job posting
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(fromApproveFlow ? "/admin/job-application-reports" : "/admin/job-posting")}
              className={`px-6 py-2.5 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} border rounded-md transition-colors font-medium text-sm`}
            >
              Cancel
            </button>
            {fromApproveFlow && approveTaskId && (
              <button
                type="button"
                onClick={handleUpdateAndApprove}
                disabled={loading}
                className="px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Update & Approve
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {jobId ? "Updating..." : "Posting..."}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {jobId ? "Update Job" : "Post Job"}
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