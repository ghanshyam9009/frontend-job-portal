// src/Pages/JobDescription.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { applicationService } from "../services/applicationService";
import {
  canCandidateApply,
  isAdminPostedJob,
} from "../utils/jobApplicationRules";
import { candidateExternalService } from "../services/candidateExternalService";
import { studentService } from "../services/studentService";
import HomeNav from "../Components/HomeNav";
import { Bookmark, Briefcase, Contact, Contact2, MapPin, Sparkles, TrendingUp, ArrowLeft, X, Crown, ArrowRight, CheckCircle } from "lucide-react";
import Footer from "../Components/Footer";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";
import RecruiterNavbar from "../Components/Recruiter/RecruiterNavbar";


const JobDescription = () => {
  // theme
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  // job state
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState("");
  const [job, setJob] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalReason, setPremiumModalReason] = useState("membership_required");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Calculate profile completion percentag

  const toggleBookmark = async (jobId) => {
    if (!isAuthenticated || !user) {
      alert('Please log in to bookmark jobs.');
      navigate('/candidate/login');
      return;
    }

    try {
      const userId = user.user_id || user.id;
      if (!userId) {
        alert('User ID not found. Please log in again.');
        navigate('/candidate/login');
        return;
      }

      const newBookmarked = new Set(bookmarkedJobs);
      if (newBookmarked.has(jobId)) {
        newBookmarked.delete(jobId);
        await candidateExternalService.removeBookmark({
          user_id: userId,
          job_id: jobId
        });
      } else {
        newBookmarked.add(jobId);
        await candidateExternalService.bookmarkJob({
          user_id: userId,
          job_id: jobId,
          action: 1
        });
      }
      setBookmarkedJobs(newBookmarked);
    } catch (error) {
      console.error('Error bookmarking job:', error);
      alert('Failed to bookmark job. Please try again.');
    }
  };

  const jobId = id;
  const isAdminView = (user?.role === 'admin') || location.state?.fromAdmin;
  const isRecruiter = !!(user?.company_name || user?.role === 'Recruiter' || user?.role === 'Employer');
  const resolvedJobId = job?.job_id || job?.id || jobId;

  useEffect(() => {
    fetchJobDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const checkAppliedStatus = async () => {
      if (!isAuthenticated || !user || !job) return;
      try {
        const userId = user?.user_id || user?.id || user?.student_id;
        if (!userId) return;

        const data = await candidateExternalService.getAppliedJobs(userId);
        const applications = data?.applications || data?.jobs || [];
        const alreadyApplied = applications.some((app) =>
          (app.job_id || app.id) === (job.job_id || job.id)
        );
        setHasApplied(Boolean(alreadyApplied));
      } catch (err) {
        console.error("Error checking application status:", err);
      }
    };

    if (job && !loading) checkAppliedStatus();
  }, [isAuthenticated, user, job, loading]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // If job is passed via route state (admin/recruiter), use it directly
      // but still try to fetch related jobs from listing API.
      const stateJob = location.state?.job;
      let baseJob = null;
      if (stateJob && (String(stateJob.job_id || stateJob.id) === String(jobId))) {
        setJob(stateJob);
        baseJob = stateJob;
      }

      const apiUrl =
        "https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs";
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jobsData = await response.json();
      const jobsArray = jobsData.jobs || jobsData.data || jobsData;

      if (!Array.isArray(jobsArray)) {
        throw new Error("Invalid response format");
      }

      let foundJob = jobsArray.find(
        (j) =>
          (String(j.job_id || j.id) === String(jobId)) ||
          (j.job_id || j.id) === parseInt(jobId)
      );

      if (!foundJob && baseJob) {
        foundJob = baseJob;
      }

      if (!foundJob) {
        throw new Error("Job not found");
      }

      // Keep applications from route state / list API when getalljobs omits them
      const mergedJob = {
        ...foundJob,
        ...(baseJob?.applications != null && { applications: baseJob.applications }),
        ...(baseJob?.applications_count != null && {
          applications_count: baseJob.applications_count,
        }),
      };
      setJob(mergedJob);

    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async () => {
    if (isAdminView) {
      // Admins can't apply to jobs; just ignore click
      return;
    }
    if (!isAuthenticated) {
      alert("Please login first to apply for this job");
      navigate("/candidate/login");
      return;
    }

    if (hasApplied) {
      setApplicationError("You have already applied for this job");
      return;
    }

    if (!user.resume || user.resume.trim() === "") {
      alert("You must upload a resume before applying for jobs. Redirecting to profile management...");
      navigate("/profile");
      return;
    }

    const eligibility = canCandidateApply(user, job);
    if (!eligibility.allowed) {
      setPremiumModalReason(eligibility.reason);
      setShowPremiumModal(true);
      if (eligibility.reason === "premium_plan_required") {
        setApplicationError(
          "Your Standard plan lets you apply to recruiter jobs only. Upgrade to Premium to apply for admin-posted jobs."
        );
      } else {
        setApplicationError("");
      }
      return;
    }

    setIsApplying(true);
    setApplicationError("");
    setApplicationSuccess("");

    try {
      let studentId = user?.user_id || user?.id || user?.student_id;

      if (!studentId && user?.email) {
        try {
          const profileResponse = await studentService.getProfile(user.email);
          if (profileResponse?.success && profileResponse?.data) {
            const profile = profileResponse.data;
            studentId = profile.id || profile.user_id || profile.student_id;
          }
        } catch (profileError) {
          console.error("Error fetching student profile:", profileError);
        }
      }

      if (!studentId) {
        setApplicationError(
          "Unable to identify student. Please try logging out and logging back in."
        );
        setIsApplying(false);
        return;
      }

      const applicationData = {
        student_id: studentId,
        student_email: user.email || "",
        resume_url: user.resume_url || "",
        cover_letter: user.cover_letter || "",
      };

      const response = await applicationService.applyForJob(
        job.job_id || job.id,
        applicationData,
        { postedBy: job.posted_by || job.postedBy }
      );

      if (response?.success) {
        setApplicationSuccess("You have successfully applied for this job");
        setHasApplied(true);
      } else {
        setApplicationError(response?.message || "Failed to submit application");
      }
    } catch (err) {
      console.error("Application error:", err);
      setApplicationError(
        err?.message || err?.error || "An error occurred while submitting the application"
      );
    } finally {
      setIsApplying(false);
    }
  };

  const formatPostedDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} month(s) ago`;
      return `${Math.floor(diffDays / 365)} year(s) ago`;
    } catch {
      return "Recently";
    }
  };

  const getSalaryDisplay = (job) => {
    const possibleFields = [
      job.salary && typeof job.salary === 'object' && job.salary.min && job.salary.max ?
        `${job.salary.min} - ${job.salary.max}` :
        (job.salary && typeof job.salary === 'object' && job.salary.min ? `${job.salary.min}+` : null),
      job.salary_range && typeof job.salary_range === 'object' && job.salary_range.min && job.salary_range.max ?
        `${job.salary_range.min} - ${job.salary_range.max}` :
        (job.salary_range && typeof job.salary_range !== 'object' ? job.salary_range : null),
      job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : null,
      job.min_salary && job.max_salary ? `${job.min_salary} - ${job.max_salary}` : null,
      job.salary_range?.min && job.salary_range?.max ? `${job.salary_range.min} - ${job.salary_range.max}` : null,
      job.salary_min ? `${job.salary_min}+` : null,
      job.min_salary ? `${job.min_salary}+` : null,
      job.salary_range?.min ? `${job.salary_range.min}+` : null,
      job.salary_max ? `Up to ${job.salary_max}` : null,
      job.max_salary ? `Up to ${job.max_salary}` : null,
      job.salary_range?.max ? `Up to ${job.salary_range.max}` : null,
      job.salary && typeof job.salary === 'object' && job.salary.max ? `Up to ${job.salary.max}` : null,
    ];

    const salaryInfo = possibleFields.find(field => field !== null && field !== undefined && field !== '');
    return salaryInfo || "Not Disclosed";
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "Not Disclosed";
    if (min && max) return `${min} - ${max}`;
    if (min) return `${min}+`;
    return `Up to ${max}`;
  };

  const parseJobDescription = (description) => {
    if (!description) return "";

    if (Array.isArray(description)) {
      return description
        .map(item => {
          const cleanLine = String(item).trim().replace(/^•\s*/, '');
          return `<p class="text-gray-900 dark:text-black leading-relaxed mb-4">${cleanLine}</p>`;
        })
        .join('');
    }

    if (typeof description === 'object') {
      return "";
    }

    const descStr = String(description);
    return descStr
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const cleanLine = line.trim().replace(/^•\s*/, '');
        return `<p class="text-gray-900 dark:text-black leading-relaxed mb-4">${cleanLine}</p>`;
      })
      .join('');
  };

  const cleanBulletPoints = (text) => {
    if (!text) return text;
    return text.replace(/^•\s*/gm, '').replace(/\n•\s*/g, '\n');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-900" : "bg-gray-100"}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-900" : "bg-gray-100"}`}>
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow text-center max-w-md mx-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold mb-2">Error Loading Job</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchJobDetails}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const applyEligibility =
    isAuthenticated && !isRecruiter && !isAdminView
      ? canCandidateApply(user, job)
      : null;
  const jobIsAdminPosted = isAdminPostedJob(job);

  return (
    <>
      {!isAdminView && (user ? (user.company_name ? <RecruiterNavbar /> : <CandidateNavbar />) : <HomeNav />)}

      <div className={`${isDarkMode ? "bg-slate-900 text-slate-100" : "bg-gray-100 text-slate-900"} min-h-screen font-sans ${isAdminView ? "pt-4" : "pt-20 lg:pt-24"}`}>

        {/* Back button – navbar ke niche, fixed spacing */}
        <div className="max-w-5xl mx-auto px-3 sm:px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">

            {/* LEFT / MAIN */}
            <main className="space-y-4 sm:space-y-6 lg:col-span-12">

              {/* Job header card */}
              <div className={`bg-white ${isDarkMode ? "dark:bg-slate-800" : ""} rounded-xl p-4 sm:p-6 shadow`}>

                {/* Title row */}
                <div className="flex justify-between items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="font-extrabold text-lg sm:text-xl text-slate-800 dark:text-black break-words">
                        {job.job_title || "Job_title"}
                      </span>
                      {job.company_rating && <span className="text-yellow-500">⭐ {job.company_rating}</span>}
                      {job.company_reviews && <span className="text-gray-400">({job.company_reviews} Reviews)</span>}
                      {job.is_premium && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Premium</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                      <span className="font-semibold text-sm sm:text-base text-slate-800 dark:text-black">
                        {job.company_name || "Company"}
                      </span>
                      {job.posted_by && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            jobIsAdminPosted
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          Posted by {(job.posted_by || "").toString().replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    {applyEligibility?.reason === "premium_plan_required" && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
                        Standard plan: apply to recruiter jobs only. Upgrade to Premium for admin-posted jobs.
                      </p>
                    )}
                    {/* Meta info - wraps gracefully on small screens */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">💰 {getSalaryDisplay(job)}</div>
                      <div className="flex items-center gap-1">📍 {job.location || "Remote"}</div>
                    </div>
                  </div>

                  {/* Logo */}
                  <div className="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg p-1.5 sm:p-2 flex items-center justify-center bg-blue-50 overflow-hidden">
                    {(() => {
                      const companyLogo = job.job_logo_url || job.job_logo || job.company_logo || job.logo;
                      if (companyLogo) {
                        return (
                          <img
                            src={companyLogo}
                            alt={`${job.company_name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${job.company_name}&background=2563eb&color=fff&size=80`;
                            }}
                          />
                        );
                      } else {
                        return (
                          <img
                            src={`https://ui-avatars.com/api/?name=${job.company_name}&background=2563eb&color=fff&size=80`}
                            alt={`${job.company_name} logo`}
                            className="w-full h-full object-contain rounded"
                          />
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* Posted / Contact info - stacks on mobile */}
                <div className="mt-4 border-t pt-4 flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1 flex-wrap">
                    📅 Posted: <strong className="text-gray-800 ml-1">{formatPostedDate(job.created_at)}</strong>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    📧 <strong className="text-gray-800">{job.contact_email}</strong>
                  </div>
                  {job.contact_number && (
                    <div className="flex items-center gap-1 flex-wrap">
                      📞 <strong className="text-gray-800">{job.contact_number}</strong>
                    </div>
                  )}
                </div>

                {/* Alerts – candidate ke liye hi (recruiter par apply nahi hota) */}
                {!isRecruiter && (
                  <div className="mt-4 space-y-2">
                    {applicationSuccess && (
                      <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm">{applicationSuccess}</div>
                    )}
                    {applicationError && (
                      <div className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm">{applicationError}</div>
                    )}
                    {hasApplied && !applicationError && !applicationSuccess && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm">You have already applied for this job</div>
                    )}
                  </div>
                )}

                {/* Action buttons – Recruiter/Admin par Apply nahi */}
                <div className="mt-4 flex gap-2 sm:gap-3">
                  {isAdminView ? (
                    <button
                      onClick={() =>
                        navigate(`/admin/edit-job/${job?.job_id || job?.id || jobId}`, {
                          state: { employer_id: job?.employer_id || job?.recruiter_id },
                        })
                      }
                      className="flex-1 border border-blue-500 text-blue-600 px-3 sm:px-4 py-2 rounded-full hover:bg-blue-50 text-sm"
                    >
                      Edit Job
                    </button>
                  ) : isRecruiter ? (
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">View only</span>
                  ) : !isAuthenticated ? (
                    <>
                      <button
                        onClick={() => navigate("/candidate/register")}
                        className="flex-1 border border-blue-500 text-blue-500 px-3 sm:px-4 py-2 rounded-full hover:bg-blue-50 text-sm"
                      >
                        Register to apply
                      </button>
                      <button
                        onClick={() => navigate("/candidate/login")}
                        className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-blue-700 text-sm"
                      >
                        Login to apply
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleApplyClick}
                        disabled={
                          hasApplied ||
                          isApplying ||
                          applyEligibility?.allowed === false
                        }
                        className={`flex-1 px-3 sm:px-4 py-2 rounded-full text-white text-sm sm:text-base ${
                          hasApplied || applyEligibility?.allowed === false
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {isApplying
                          ? "⏳ Applying..."
                          : hasApplied
                            ? "✓ Applied"
                            : applyEligibility?.reason === "premium_plan_required"
                              ? "Premium plan required"
                              : applyEligibility?.reason === "membership_required"
                                ? "Membership required"
                                : "Apply Now"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(job.job_id);
                        }}
                        className={`${textSecondary} hover:text-yellow-500 transition-colors p-1.5 rounded-lg flex-shrink-0`}
                      >
                        <Bookmark
                          className="w-5 h-5"
                          fill={bookmarkedJobs.has(job.job_id) ? "currentColor" : "none"}
                        />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Job description card */}
              <section className={`bg-white ${isDarkMode ? "dark:bg-slate-800" : ""} rounded-xl p-4 sm:p-6 shadow`}>
                <h2 className="text-base sm:text-lg font-semibold mb-4">Job description</h2>

                <div className="prose max-w-none prose-sm dark:prose-invert">
                  {job.description ? (
                    <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.description) }} />
                  ) : (
                    <p className="text-gray-900 dark:text-black">No description available.</p>
                  )}
                </div>

                {/* responsibilities */}
                {(job.responsibilities?.length > 0 || job.responsibilities_string) && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Key Responsibilities</h3>
                    <div className="text-gray-900 dark:text-black leading-relaxed space-y-2 text-sm sm:text-base">
                      {job.responsibilities?.length > 0 ? (
                        job.responsibilities.map((r, i) => <p key={i}>{cleanBulletPoints(r)}</p>)
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.responsibilities_string) }} />
                      )}
                    </div>
                  </div>
                )}

                {/* requirements */}
                {(job.requirements?.length > 0 || job.requirements_string) && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Requirements</h3>
                    <div className="text-gray-900 dark:text-black leading-relaxed space-y-2 text-sm sm:text-base">
                      {job.requirements?.length > 0 ? (
                        job.requirements.map((r, i) => <p key={i}>{cleanBulletPoints(r)}</p>)
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.requirements_string) }} />
                      )}
                    </div>
                  </div>
                )}

                {/* qualifications */}
                {(job.qualifications?.length > 0 || job.qualifications_string || job.qualification) && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Qualifications</h3>
                    <div className="text-gray-900 dark:text-black leading-relaxed space-y-2 text-sm sm:text-base">
                      {job.qualifications?.length > 0 ? (
                        job.qualifications.map((q, i) => <p key={i}>{cleanBulletPoints(q)}</p>)
                      ) : job.qualifications_string ? (
                        <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.qualifications_string) }} />
                      ) : job.qualification ? (
                        typeof job.qualification === 'string' ? (
                          <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.qualification) }} />
                        ) : (
                          <p>{cleanBulletPoints(String(job.qualification))}</p>
                        )
                      ) : null}
                    </div>
                  </div>
                )}

                {/* skills */}
                {job.skills_required?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required.map((s, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* benefits */}
                {(job.benefits?.length > 0 || job.benefits_string || job.additional_benefits) && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Benefits & Perks</h3>
                    <div className="text-gray-900 dark:text-black leading-relaxed space-y-2 text-sm sm:text-base">
                      {job.benefits?.length > 0 ? (
                        job.benefits.map((b, i) => <p key={i}>{cleanBulletPoints(b)}</p>)
                      ) : job.benefits_string ? (
                        <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.benefits_string) }} />
                      ) : null}

                      {job.additional_benefits && (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-2">Additional Benefits:</h4>
                          <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.additional_benefits) }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </main>

          </div>
        </div>
      </div>
      <Footer />

      {/* Premium Upgrade Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 mb-10">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setShowPremiumModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
            {/* Header / Accent */}
            <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
            
            <button 
              onClick={() => setShowPremiumModal(false)}
              className="absolute right-4 top-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 pt-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-500/10 mb-6 shadow-inner">
                <Crown size={40} className="text-amber-500" />
              </div>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                {premiumModalReason === "premium_plan_required"
                  ? "Premium plan required"
                  : "Membership required"}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8">
                {premiumModalReason === "premium_plan_required" ? (
                  <>
                    Your <span className="font-bold text-slate-800 dark:text-white">Standard</span> plan
                    lets you apply to recruiter-posted jobs. This job was posted by{" "}
                    <span className="font-bold text-indigo-600">Admin</span> — upgrade to a{" "}
                    <span className="text-amber-600 font-bold">Premium</span> plan to apply here
                    and unlock all job types.
                  </>
                ) : (
                  <>
                    You need an active membership to apply. Choose a{" "}
                    <span className="font-bold text-slate-800 dark:text-white">Standard</span> plan
                    for recruiter jobs, or <span className="text-amber-600 font-bold">Premium</span>{" "}
                    to apply on both recruiter and admin jobs.
                  </>
                )}
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowPremiumModal(false);
                    navigate("/membership-plans");
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  {premiumModalReason === "premium_plan_required"
                    ? "Upgrade to Premium plan"
                    : "View membership plans"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="w-full py-3 text-gray-500 dark:text-gray-400 font-semibold text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Maybe later
                </button>
              </div>

              {/* Benefits list (mini) */}
              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-tighter">
                  <CheckCircle size={14} className="text-green-500" />
                  Unlimited Apply
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-tighter">
                  <CheckCircle size={14} className="text-green-500" />
                  Priority Views
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobDescription;