// src/Pages/JobDescription.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { applicationService } from "../services/applicationService";
import { candidateExternalService } from "../services/candidateExternalService";
import { recruiterExternalService } from "../services/recruiterExternalService";
import { studentService } from "../services/studentService";
import HomeNav from "../Components/HomeNav";
import { Bookmark, Briefcase, Contact, Contact2, MapPin, ArrowLeft, Clock, DollarSign, Building } from "lucide-react";
import Footer from "../Components/Footer";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";
import RecruiterNavbar from "../Components/Recruiter/RecruiterNavbar";

const JobDescription = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState("");
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [adminApplicationCount, setAdminApplicationCount] = useState(null);

  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

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

  useEffect(() => {
    if (!isAdminView || !resolvedJobId) {
      setAdminApplicationCount(null);
      return;
    }

    let cancelled = false;
    recruiterExternalService
      .getApplicationCount(resolvedJobId)
      .then((res) => {
        if (cancelled) return;
        setAdminApplicationCount(Number(res?.application_count ?? 0));
      })
      .catch(() => {
        if (cancelled) return;
        setAdminApplicationCount(Number(job?.application_count ?? 0));
      });

    return () => {
      cancelled = true;
    };
  }, [isAdminView, resolvedJobId, job?.application_count]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const stateJob = location.state?.job;
      let baseJob = null;
      if (stateJob && (String(stateJob.job_id || stateJob.id) === String(jobId))) {
        setJob(stateJob);
        baseJob = stateJob;
      }

      const apiUrl = "https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs";
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

      setJob(foundJob);
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async () => {
    if (isAdminView) return;
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
        setApplicationError("Unable to identify student. Please try logging out and logging back in.");
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
        applicationData
      );

      if (response?.success) {
        setApplicationSuccess("You have successfully applied for this job");
        setHasApplied(true);
      } else {
        setApplicationError(response?.message || "Failed to submit application");
      }
    } catch (err) {
      console.error("Application error:", err);
      setApplicationError("An error occurred while submitting the application");
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
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return "Recently";
    }
  };

  const getSalaryDisplay = (job) => {
    const possibleFields = [
      job.salary && typeof job.salary === 'object' && job.salary.min && job.salary.max ? `${job.salary.min} - ${job.salary.max}` : null,
      job.salary_range && typeof job.salary_range === 'object' && job.salary_range.min && job.salary_range.max ? `${job.salary_range.min} - ${job.salary_range.max}` : null,
      job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : null,
      job.min_salary && job.max_salary ? `${job.min_salary} - ${job.max_salary}` : null,
      job.salary_min ? `${job.salary_min}+` : null,
      job.min_salary ? `${job.min_salary}+` : null,
      job.salary_max ? `Up to ${job.salary_max}` : null,
      job.max_salary ? `Up to ${job.max_salary}` : null,
    ];
    return possibleFields.find(field => field) || "Not Disclosed";
  };

  const parseJobDescription = (description) => {
    if (!description) return "";

    if (Array.isArray(description)) {
      return description
        .map(item => {
          const cleanLine = String(item).trim().replace(/^•\s*/, '');
          return `<p class="leading-relaxed mb-4 text-gray-700 dark:text-gray-300">${cleanLine}</p>`;
        })
        .join('');
    }

    if (typeof description === 'object') return "";

    const descStr = String(description);
    return descStr
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const cleanLine = line.trim().replace(/^•\s*/, '');
        return `<p class="leading-relaxed mb-4 text-gray-700 dark:text-gray-300">${cleanLine}</p>`;
      })
      .join('');
  };

  const cleanBulletPoints = (text) => text?.replace(/^•\s*/gm, '').replace(/\n•\s*/g, '\n') || text;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-[#0b0f19]" : "bg-slate-50"}`}>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-medium text-slate-500">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-[#0b0f19] text-white" : "bg-slate-50 text-slate-900"}`}>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm text-center max-w-sm w-full mx-4 border border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Unavailable</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
            {error || "Job details could not be found."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const companyLogo = job.job_logo_url || job.job_logo || job.company_logo || job.logo || `https://ui-avatars.com/api/?name=${job.company_name}&background=10b981&color=fff&size=100`;

  return (
    <>
      {!isAdminView && (user ? (user.company_name ? <RecruiterNavbar /> : <CandidateNavbar />) : <HomeNav />)}

      <div className={`${isDarkMode ? "bg-[#0b0f19] text-slate-200" : "bg-slate-50 text-slate-800"} min-h-screen font-sans ${isAdminView ? 'pt-8 lg:pt-10' : 'pt-20 lg:pt-28'} pb-24`}>
        
        {/* Navigation & Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className={`group inline-flex items-center gap-2 mb-6 sm:mb-8 text-sm font-semibold transition-all ${isDarkMode ? "text-slate-400 hover:text-emerald-400" : "text-slate-500 hover:text-emerald-600"}`}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to listings
          </button>

          {/* Main Job Card */}
          <div className={`overflow-hidden rounded-3xl ${isDarkMode ? "bg-slate-800/60 border border-slate-700" : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50"}`}>
            
            {/* Header / Banner */}
            <div className={`px-6 sm:px-10 py-8 border-b ${isDarkMode ? "border-slate-700/50" : "border-slate-100"}`}>
              <div className="flex flex-col sm:flex-row gap-6 sm:items-start justify-between">
                
                {/* Logo & Core Info */}
                <div className="flex items-start gap-5">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border p-1 sm:p-2 shadow-sm ${isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"}`}>
                    <img
                      src={companyLogo}
                      alt={`${job.company_name} logo`}
                      className="w-full h-full object-contain rounded-xl"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${job.company_name}&background=10b981&color=fff&size=100`; }}
                    />
                  </div>
                  
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        {job.job_title || "Job Title"}
                      </h1>
                      {job.is_premium && (
                        <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">Premium</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-sm font-medium mb-4">
                      <span className={`flex items-center gap-1.5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                        <Building className="w-4 h-4" />
                        {job.company_name || "Company Name"}
                      </span>
                      {job.company_rating && (
                        <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-md text-xs">
                          ⭐ {job.company_rating}
                        </span>
                      )}
                    </div>

                    {/* Meta Pills */}
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isDarkMode ? "bg-slate-700/50 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                        <MapPin className="w-3.5 h-3.5 opacity-70" />
                        {job.location || "Location Not Specified"}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isDarkMode ? "bg-slate-700/50 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                        <DollarSign className="w-3.5 h-3.5 opacity-70" />
                        {getSalaryDisplay(job)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
                        <Clock className="w-3.5 h-3.5 opacity-70" />
                        Posted {formatPostedDate(job.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[200px] mt-4 sm:mt-0">
                  {isAdminView ? (
                    <>
                      <button
                        onClick={() => {
                          const isJobByAdmin = job?.posted_by?.toLowerCase() === 'admin';
                          const routeId = job?.job_id || job?.id || jobId;
                          const targetRoute = isJobByAdmin 
                            ? `/admin/job-applications/${routeId}`
                            : `/admin/job-reports/applications/${routeId}`;
                          navigate(targetRoute, { state: { jobTitle: job?.job_title, companyName: job?.company_name } });
                        }}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                      >
                        View Applicants ({adminApplicationCount ?? Number(job?.application_count ?? 0)})
                      </button>
                      <button
                        onClick={() => navigate(`/admin/edit-job/${job.job_id || job.id}`, { state: { employer_id: job?.employer_id || job?.recruiter_id }})}
                        className={`w-full font-bold px-5 py-3 rounded-xl transition-colors border ${isDarkMode ? "border-slate-700 hover:bg-slate-700" : "border-slate-200 hover:bg-slate-50"}`}
                      >
                        Edit Details
                      </button>
                    </>
                  ) : isRecruiter ? (
                     <div className={`px-4 py-3 rounded-xl text-center text-sm font-semibold ${isDarkMode ? "bg-slate-700/50 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                       Recruiter View Active
                     </div>
                  ) : !isAuthenticated ? (
                     <>
                      <button onClick={() => navigate("/candidate/login")} className="w-full bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                        Login to Apply
                      </button>
                     </>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleApplyClick}
                        disabled={hasApplied || isApplying}
                        className={`flex-1 font-bold px-5 py-3 rounded-xl transition shadow-lg active:scale-[0.98] ${
                          hasApplied 
                            ? isDarkMode ? "bg-slate-700 text-slate-400 shadow-none" : "bg-slate-100 text-slate-400 shadow-none"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                        }`}
                      >
                        {isApplying ? "Sending..." : hasApplied ? "Application Submitted" : "Apply Now"}
                      </button>
                      <button
                        onClick={() => toggleBookmark(job.job_id || job.id)}
                        className={`flex items-center justify-center w-12 rounded-xl transition border ${
                          bookmarkedJobs.has(job.job_id || job.id)
                            ? "bg-yellow-50 border-yellow-200 text-yellow-500 dark:bg-yellow-500/10 dark:border-yellow-500/20"
                            : isDarkMode ? "border-slate-700 hover:bg-slate-700" : "border-slate-200 hover:bg-slate-50 text-slate-400"
                        }`}
                        title="Bookmark Job"
                      >
                        <Bookmark size={20} fill={bookmarkedJobs.has(job.job_id || job.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  )}

                  {/* Alerts below buttons */}
                  {!isRecruiter && (
                    <div className="text-center">
                       {applicationSuccess && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg py-2">{applicationSuccess}</p>}
                       {applicationError && <p className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg py-2">{applicationError}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Details / Contact Section */}
            <div className={`grid sm:grid-cols-2 gap-4 px-6 sm:px-10 py-5 sm:py-6 border-b ${isDarkMode ? "bg-slate-800/80 border-slate-700/50 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-600"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-slate-700" : "bg-white border shadow-sm"}`}>
                  <Contact className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold opacity-70 mb-0.5">Contact Email</p>
                  <p className="font-medium text-sm truncate">{job.contact_email || "Not provided"}</p>
                </div>
              </div>
              
              {job.contact_number && (
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-slate-700" : "bg-white border shadow-sm"}`}>
                    <Contact2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-70 mb-0.5">Phone Number</p>
                    <p className="font-medium text-sm">{job.contact_number}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Body */}
            <div className="px-6 sm:px-10 py-8 sm:py-10">
              
              {/* Overview / Description */}
              <div className="mb-10">
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
                  About the Role
                </h2>
                <div className="prose max-w-none prose-emerald dark:prose-invert text-base leading-relaxed opacity-90">
                  {job.description ? (
                    <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.description) }} />
                  ) : (
                    <p>No overarching description is available for this role.</p>
                  )}
                </div>
              </div>

              {/* Responsibilities */}
              {(job.responsibilities?.length > 0 || job.responsibilities_string) && (
                <div className="mb-10">
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
                    Key Responsibilities
                  </h3>
                  <div className="space-y-3 opacity-90 text-base leading-relaxed">
                    {job.responsibilities?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2">
                        {job.responsibilities.map((r, i) => <li key={i}>{cleanBulletPoints(r)}</li>)}
                      </ul>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.responsibilities_string) }} />
                    )}
                  </div>
                </div>
              )}

              {/* Requirements & Qualifications Grid */}
              <div className="grid sm:grid-cols-2 gap-8 mb-10">
                
                {/* Requirements */}
                {(job.requirements?.length > 0 || job.requirements_string) && (
                  <div>
                    <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Requirements</h3>
                    <div className="opacity-90 space-y-2 bg-rose-50 dark:bg-rose-500/5 p-4 sm:p-5 rounded-2xl border border-rose-100 dark:border-rose-500/10">
                      {job.requirements?.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1">
                          {job.requirements.map((r, i) => <li key={i} className="text-sm">{cleanBulletPoints(r)}</li>)}
                        </ul>
                      ) : (
                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: parseJobDescription(job.requirements_string) }} />
                      )}
                    </div>
                  </div>
                )}

                {/* Qualifications */}
                {(job.qualifications?.length > 0 || job.qualifications_string || job.qualification) && (
                  <div>
                    <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Qualifications</h3>
                    <div className="opacity-90 space-y-2 bg-indigo-50 dark:bg-indigo-500/5 p-4 sm:p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
                      {job.qualifications?.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1">
                          {job.qualifications.map((q, i) => <li key={i} className="text-sm">{cleanBulletPoints(q)}</li>)}
                        </ul>
                      ) : job.qualifications_string ? (
                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: parseJobDescription(job.qualifications_string) }} />
                      ) : (
                        <div className="text-sm" dangerouslySetInnerHTML={{ __html: parseJobDescription(String(job.qualification)) }} />
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills required */}
              {job.skills_required?.length > 0 && (
                <div className="mb-10">
                  <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Required Core Skills</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {job.skills_required.map((s, idx) => (
                      <span key={idx} className={`font-semibold px-4 py-1.5 rounded-full text-sm shadow-sm border transition-colors cursor-default ${
                        isDarkMode ? "bg-slate-700/50 border-slate-600 text-emerald-400 hover:bg-slate-700" : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      }`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {(job.benefits?.length > 0 || job.benefits_string || job.additional_benefits) && (
                <div className={`p-6 sm:p-8 rounded-3xl mb-4 ${isDarkMode ? "bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50" : "bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-100/50"}`}>
                  <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    <span className="w-1.5 h-6 bg-amber-400 rounded-full inline-block"></span>
                    Benefits & Perks
                  </h3>
                  
                  <div className="opacity-90 space-y-3">
                    {job.benefits?.length > 0 ? (
                      <ul className="grid sm:grid-cols-2 gap-2 list-none">
                        {job.benefits.map((b, i) => (
                           <li key={i} className="flex items-start gap-2">
                             <span className="text-amber-500 mt-0.5">✦</span> 
                             <span>{cleanBulletPoints(b)}</span>
                           </li>
                        ))}
                      </ul>
                    ) : job.benefits_string ? (
                      <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.benefits_string) }} />
                    ) : null}

                    {job.additional_benefits && (
                      <div className="mt-4 pt-4 border-t border-amber-200/30 dark:border-slate-600">
                        <h4 className="font-semibold text-sm mb-2 uppercase tracking-wide opacity-80">Plus Additional Benefits:</h4>
                        <div dangerouslySetInnerHTML={{ __html: parseJobDescription(job.additional_benefits) }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobDescription;