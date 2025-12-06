// src/Pages/JobDescription.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { applicationService } from "../services/applicationService";
import { candidateExternalService } from "../services/candidateExternalService";
import { studentService } from "../services/studentService";
import HomeNav from "../Components/HomeNav";
import { Bookmark, Briefcase, MapPin, Sparkles, TrendingUp } from "lucide-react";
import Footer from "../Components/Footer";
import CandidateNavbar from "../Components/Candidate/CandidateNavbar";

const JobDescription = () => {
  // theme - now using localStorage to persist
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  // job state
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const [applicationSuccess, setApplicationSuccess] = useState("");
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState([]);
 const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    const steps = [
      {
        title: 'Personal Info',
        fields: [
          { name: 'full_name', required: true, weight: 10 },
          { name: 'phone_number', required: true, weight: 5 },
          { name: 'username', required: true, weight: 3 },
          { name: 'gender', required: true, weight: 2 }
        ],
        totalWeight: 20
      },
      {
        title: 'Address',
        fields: [
          { name: 'address.city', required: true, weight: 8 },
          { name: 'address.state', required: true, weight: 6 },
          { name: 'address.country', required: true, weight: 6 }
        ],
        totalWeight: 20
      },
      {
        title: 'Professional',
        fields: [
          { name: 'bio', required: true, weight: 15 },
          { name: 'skills', required: true, weight: 5 }
        ],
        totalWeight: 20
      },
      {
        title: 'Education',
        fields: [],
        totalWeight: 20,
        isArray: true,
        arrayField: 'education'
      },
      {
        title: 'Experience',
        fields: [],
        totalWeight: 20,
        isArray: true,
        arrayField: 'experience'
      }
    ];

    let totalCompleted = 0;

    steps.forEach(step => {
      let stepCompleted = 0;

      if (step.isArray) {
        // Handle array fields (education, experience)
        const arrayData = userData[step.arrayField] || [];
        if (Array.isArray(arrayData) && arrayData.length > 0) {
          const hasValidEntry = arrayData.some(item => {
            return Object.values(item).some(value =>
              value && typeof value === 'string' && value.trim() !== ''
            );
          });
          if (hasValidEntry) {
            stepCompleted = step.totalWeight;
          }
        }
      } else {
        // Handle regular fields
        const totalFieldWeight = step.fields.reduce((sum, field) => sum + field.weight, 0);
        let completedFieldWeight = 0;

        step.fields.forEach(field => {
          const keys = field.name.split('.');
          let value = userData;
          let hasValue = false;

          for (const key of keys) {
            value = value && value[key];
          }

          if (value && value.toString().trim() !== '') {
            hasValue = true;
          }

          if (hasValue) {
            completedFieldWeight += field.weight;
          }
        });

        if (totalFieldWeight > 0) {
          stepCompleted = Math.round((completedFieldWeight / totalFieldWeight) * step.totalWeight);
        }
      }

      totalCompleted += stepCompleted;
    });

    return Math.min(100, Math.round(totalCompleted));
  };

  const extractJobIdFromSlug = (slugStr) => {
    if (!slugStr) return null;
    const match = slugStr.match(/-(\d+)$/);
    return match ? match[1] : slugStr;
  };
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
       } else {
         newBookmarked.add(jobId);
         await candidateExternalService.bookmarkJob({ 
           user_id: userId, 
           job_id: jobId 
         });
       }
       setBookmarkedJobs(newBookmarked);
     } catch (error) {
       console.error('Error bookmarking job:', error);
       alert('Failed to bookmark job. Please try again.');
     }
   };
 
  const jobId = extractJobIdFromSlug(slug);

  // fetch job details
  useEffect(() => {
    fetchJobDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // check whether user already applied
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

      // try match by id first
      let foundJob = jobsArray.find(
        (j) =>
          (String(j.job_id || j.id) === String(jobId)) ||
          (j.job_id || j.id) === parseInt(jobId)
      );

      // fallback: match by slugified title
      if (!foundJob && slug) {
        const titleSlug = slug.toLowerCase().replace(/-\d+$/, "");
        foundJob = jobsArray.find((j) =>
          ((j.job_title || j.title) || "")
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .includes(titleSlug)
        );
      }

      if (!foundJob) {
        throw new Error("Job not found");
      }

      setJob(foundJob);

      const related = jobsArray
        .filter((j) => (j.job_id || j.id) !== (foundJob.job_id || foundJob.id))
        .slice(0, 6);
      setRelatedJobs(related);
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };
   const getCompanyColor = (index) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600'
    ];
    return colors[index % colors.length];
  };


  const handleApplyClick = async () => {
    // auth guard
    if (!isAuthenticated) {
      alert("Please login first to apply for this job");
      navigate("/candidate/login");
      return;
    }

    if (hasApplied) {
      setApplicationError("You have already applied for this job");
      return;
    }

    // Profile completion check removed - candidates can apply for jobs regardless of profile completeness
    // membership check
    if (user?.membership !== "premium") {
      try {
        const registrationDate = new Date(user.created_at);
        const now = new Date();
        const daysSinceRegistration = Math.floor(
          (now - registrationDate) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceRegistration > 45) {
          alert(
            "Your 45-day free trial has expired. You need a premium membership to apply for jobs. Redirecting to membership plans..."
          );
          navigate("/membership");
          return;
        }
      } catch {
        // if created_at invalid, continue (or ask user to login again)
      }
    }

    setIsApplying(true);
    setApplicationError("");
    setApplicationSuccess("");

    try {
      let studentId = user?.user_id || user?.id || user?.student_id;

      // if studentId not in user, try fetch by email
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
        student_email: user.email,
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

  // small format helpers
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
  const formatSalary = (min, max) => {
    if (!min && !max) return "Not Disclosed";
    if (min && max) return `${min} - ${max}`;
    if (min) return `${min}+`;
    return `Up to ${max}`;
  };

  const formatExperience = (exp) => {
    if (!exp) return "Not specified";

    // ADDED: Check if exp is an object with min/max keys (like {min_years: 2, max_years: 5})
    if (typeof exp === 'object' && exp !== null) {
      const min = exp.min_years || exp.min_experience;
      const max = exp.max_years || exp.max_experience;
      if (min && max) return `${min}-${max} Yrs`;
      if (min) return `${min}+ Yrs`;
      if (max) return `Up to ${max} Yrs`;
      return "Not specified"; // Fallback if object keys are missing
    }

    return exp; // Return as-is if it's already a string/number
  };

  const formatJobDescription = (description) => {
    if (!description) return null;

    // First, convert any existing <ul> to <ol>
    let formatted = description.replace(/<ul/g, '<ol').replace(/<\/ul>/g, '</ol>');

    // Split into lines and check for numbered lists
    const lines = formatted.split('\n').filter(line => line.trim() !== '');
    let hasNumberedLines = lines.some(line => /^\d+\.\s+/.test(line.trim()));

    if (hasNumberedLines) {
      // Process numbered lines and convert to proper list
      let html = '';
      let currentItem = '';
      let inNumberedList = false;

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (/^\d+\.\s+/.test(trimmed)) {
          // New numbered item
          if (inNumberedList) {
            html += `<li>${currentItem}</li>`;
          } else {
            html += '<ol class="list-decimal list-inside space-y-2 ml-4">';
            inNumberedList = true;
          }
          currentItem = trimmed.replace(/^\d+\.\s+/, '');
        } else if (inNumberedList) {
          // Continuation or sub-item
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            currentItem += '<br>• ' + trimmed.substring(1).trim();
          } else if (trimmed.trim() !== '' && currentItem) {
            currentItem += ' ' + trimmed;
          }
        }
      });

      if (inNumberedList && currentItem) {
        html += `<li>${currentItem}</li></ol>`;
      }

      return html;
    }

    return formatted;
  };

  // loading / error UI
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-black" : "bg-gray-100"}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-black" : "bg-gray-100"}`}>
        <div className="bg-white dark:bg-black p-8 rounded-lg shadow text-center max-w-md">
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

  return (

    <>  
    {user?<CandidateNavbar/>: <HomeNav/>}
    <div className={`${isDarkMode ? "bg-black text-white" : "bg-gray-100 text-slate-900"} lg:mt-18 min-h-screen font-sans`}>
      {/* header */}
    

      {/* main */}
      <div className="max-w-5xl  mx-auto px-4 py-8">
        <div className="grid  lg:grid-cols-12 gap-6">
          {/* left */}
          <main className=" space-y-6 lg:col-span-8">
            <div className={`lg:sticky lg:top-24 bg-white ${isDarkMode ? "dark:bg-black" : ""} rounded-xl p-6 shadow`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold mb-2">{job.job_title || job.title || "Job Title"}</h1>

                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="font-semibold text-base text-black">{job.company_name || "Company"}</span>
                    {job.company_rating && <span className="text-yellow-500">⭐ {job.company_rating}</span>}
                    {job.company_reviews && <span className="text-gray-400">({job.company_reviews} Reviews)</span>}
                    {job.is_premium && (
                      <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {/* <div className="flex items-center gap-1">💼 {formatExperience(job.experience_required || job.experience)}</div> */}
                    <div className="flex items-center gap-1">💰 <span className={formatSalary(job.salary_min, job.salary_max) === "Not Disclosed" ? "text-black" : ""}>{formatSalary(job.salary_min, job.salary_max)}</span></div>
                    <div className="flex items-center gap-1">📍 {job.location || "Remote"}</div>
                  </div>
                </div>

                <div className="w-20 h-20 rounded-lg p-2 flex items-center justify-center bg-blue-50">
                  <span className="text-3xl font-bold text-blue-600">{(job.company_name || "C")[0].toUpperCase()}</span>
                </div>
              </div>

              <div className="mt-4 border-t pt-4 flex flex-wrap gap-6 text-sm text-gray-600">
                <div>📅 Posted: <strong className="text-gray-800">{formatPostedDate(job.created_at)}</strong></div>
                <div>👥 {job.openings || 1} Openings</div>
                <div>📊 {job.applicants || "0"} Applicants</div>
              </div>

              {/* alerts */}
              <div className="mt-4 space-y-2">
                {applicationSuccess && (
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded">{applicationSuccess}</div>
                )}
                {applicationError && (
                  <div className="bg-red-100 text-red-800 px-3 py-2 rounded">{applicationError}</div>
                )}
              </div>

              {/* action */}
              <div className="mt-4 flex gap-3">
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => navigate("/candidate/register")}
                      className="flex-1 border border-blue-500 text-blue-500 px-4 py-2 rounded-full hover:bg-blue-50"
                    >
                      Register to apply
                    </button>
                    <button
                      onClick={() => navigate("/candidate/login")}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                    >
                      Login to apply
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleApplyClick}
                      disabled={hasApplied || isApplying}
                      className={`flex-1 px-4 py-2 rounded-full text-white ${hasApplied ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      {isApplying ? "⏳ Applying..." : hasApplied ? "✓ Applied" : " Apply Now"}
                    </button>
                   <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(job.job_id);
                        }}
                        className={`${textSecondary}  hover:text-yellow-500 transition-colors p-1.5 rounded-lg`}
                      >
                        <Bookmark className="w-5 h-5"  fill={bookmarkedJobs.has(job.job_id) ? "currentColor" : "none"} />

                        
                      </button>
                  </>
                )}
              </div>
            </div>

            {/* job description */}
            <section className={`lg:sticky lg:top-95 bg-white ${isDarkMode ? "dark:bg-black" : ""} rounded-xl p-6 shadow`}>
              <h2 className="text-lg font-semibold mb-4">Job description</h2>

              <div className="prose max-w-none prose-sm dark:prose-invert text-gray-700">
                {/* job.description may be HTML — render safely */}
                {job.description ? (
                  <div dangerouslySetInnerHTML={{ __html: formatJobDescription(job.description) }} />
                ) : (
                  <p>No description available.</p>
                )}
              </div>

              {/* responsibilities */}
              {(job.responsibilities?.length > 0 || job.responsibilities_string) && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Key Responsibilities</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {job.responsibilities?.length > 0 ? (
                      job.responsibilities.map((r, i) => <li key={i}>{r}</li>)
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: job.responsibilities_string }} />
                    )}
                  </ul>
                </div>
              )}

              {/* requirements */}
              {(job.requirements?.length > 0 || job.requirements_string) && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {job.requirements?.length > 0 ? (
                      job.requirements.map((r, i) => <li key={i}>{r}</li>)
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: job.requirements_string }} />
                    )}
                  </ul>
                </div>
              )}

              {/* skills */}
              {job.skills?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* benefits */}
              {(job.benefits?.length > 0 || job.benefits_string) && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Benefits & Perks</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {job.benefits?.length > 0 ? (
                      job.benefits.map((b, i) => <li key={i}>{b}</li>)
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: job.benefits_string }} />
                    )}
                  </ul>
                </div>
              )}
            </section>
          </main>
<aside className=" lg:col-span-4">
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg border ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} overflow-hidden`}>
          
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Top Opportunities</h3>
                <p className="text-white/80 text-sm">From leading companies</p>
              </div>
            </div>
          </div>

          {/* Job List */}
          <div className="p-4 space-y-3">
            {relatedJobs.length > 0 ? (
              relatedJobs.map((relJob, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    navigate(
                      `/candidate/jobs/${((relJob.job_title || relJob.title) || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}-${relJob.job_id || relJob.id}`
                    )
                  }
                  className={`group cursor-pointer p-4 rounded-xl transition-all duration-300 border ${
                    isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-indigo-500' 
                      : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Company Avatar with gradient */}
                    <div className={`flex-shrink-0 w-12 h-12 ${getCompanyColor(idx)} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white font-bold text-lg">
                        {(relJob.company_name || "C")[0].toUpperCase()}
                      </span>
                    </div>

                    {/* Job Info */}
                    <div className="flex-grow min-w-0">
                      <h4 className={`font-semibold text-sm mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'} group-hover:text-indigo-600 transition-colors`}>
                        {relJob.job_title || relJob.title || "Job Title"}
                      </h4>
                      <p className={`text-xs mb-2 truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {relJob.company_name || "Company"}
                      </p>
                      
                      {/* Info Pills */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          isDarkMode 
                            ? 'bg-slate-600 text-slate-200' 
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          <Briefcase className="w-3 h-3" />
                          {formatExperience(relJob.experience_required || relJob.experience)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          isDarkMode 
                            ? 'bg-slate-600 text-slate-200' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          <MapPin className="w-3 h-3" />
                          {relJob.location || "Remote"}
                        </span>
                      </div>
                      
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatPostedDate(relJob.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No similar jobs found</p>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="p-4 pt-2">
            <button
              onClick={() => navigate("/candidate/register")}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              🚀 Register to unlock all opportunities
            </button>
          </div>
        </div>
      </aside>

        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default JobDescription;
