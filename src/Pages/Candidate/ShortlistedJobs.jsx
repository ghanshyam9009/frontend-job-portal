import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import { candidateExternalService, recruiterExternalService } from "../../services";
import {
  Briefcase,
  Star,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  Building,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Loader2,
  Tag,
  FileText,
  Globe,
  Award,
} from "lucide-react";

const ShortlistedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // { [jobId]: { open: bool, loading: bool, data: obj|null, error: str|null } }
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const userId = user?.user_id || user?.id || "";
    if (!userId) return;

    const fetchShortlistedJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const appliedData = await candidateExternalService.getAppliedJobs(userId);

        const jobsWithStatus = await Promise.all(
          (appliedData?.jobs || []).map(async (job, idx) => {
            try {
              const applicantsData = await recruiterExternalService.getAllApplicants(job.job_id);
              const currentUserApplication = (applicantsData.applications || []).find(
                (app) => app.student_id === userId
              );
              const status = currentUserApplication?.status || job.status || "Under Review";
              return {
                id: job.job_id || idx,
                job_id: job.job_id || idx,
                title: job.job_title || "",
                company: job.company_name || "",
                location: job.location && job.location.toLowerCase() !== "n/a" ? job.location : "",
                salary:
                  job.salary_range && job.salary_range.min && job.salary_range.max
                    ? `₹${job.salary_range.min} - ₹${job.salary_range.max}`
                    : "Salary not disclosed",
                appliedDateTime: job.created_at || "",
                status,
                is_premium: job.premium_job || false,
                // Keep full raw job from applied API for detail view (description, requirements, etc.)
                raw: job,
              };
            } catch (err) {
              console.error(`Failed to fetch applicants for job ${job.job_id}`, err);
              return null;
            }
          })
        );

        const shortlistedOnly = (jobsWithStatus || [])
          .filter(Boolean)
          .filter((j) => j.status && j.status.toLowerCase() === "shortlisted")
          .sort((a, b) => {
            const dateA = new Date(a.appliedDateTime || 0);
            const dateB = new Date(b.appliedDateTime || 0);
            const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
            const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
            return timeB - timeA;
          });

        setJobs(shortlistedOnly);
      } catch (e) {
        setError(typeof e === "string" ? e : e?.message || "Failed to load shortlisted jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchShortlistedJobs();
  }, [user]);

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleToggleDetails = async (job) => {
    const jobId = job.id || job.job_id;

    // Collapse if already open
    if (expanded[jobId]?.open) {
      setExpanded((prev) => ({ ...prev, [jobId]: { ...prev[jobId], open: false } }));
      return;
    }

    // Re-open if already fetched
    if (expanded[jobId]?.data) {
      setExpanded((prev) => ({ ...prev, [jobId]: { ...prev[jobId], open: true } }));
      return;
    }

    setExpanded((prev) => ({ ...prev, [jobId]: { open: true, loading: true, data: null, error: null } }));

    // Fallback from card + raw job from applied API (may already have description, etc.)
    const fallbackData = {
      job_id: jobId,
      job_title: job.title,
      company_name: job.company,
      location: job.location,
      description: "You have been shortlisted for this role. View the full job page for complete description and to apply or learn more.",
      responsibilities: [],
      requirements: [],
      skills_required: [],
      benefits: [],
      experience: null,
    };
    const fromRaw = job.raw || {};
    const mergedFallback = { ...fallbackData, ...fromRaw };

    try {
      const apiUrl = "https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs";
      const response = await fetch(apiUrl, { method: "GET", headers: { "Content-Type": "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let jobsData = await response.json();
      // AWS Lambda sometimes returns { body: "stringified JSON" }
      if (jobsData?.body && typeof jobsData.body === "string") {
        try {
          jobsData = JSON.parse(jobsData.body);
        } catch (_) {}
      }
      const jobsArray = jobsData?.jobs || jobsData?.data || (Array.isArray(jobsData) ? jobsData : []);

      const found = Array.isArray(jobsArray)
        ? jobsArray.find(
            (j) =>
              String(j.job_id || j.id) === String(jobId) ||
              Number(j.job_id || j.id) === Number(jobId)
          )
        : null;

      const detailData = found ? { ...mergedFallback, ...found } : mergedFallback;
      setExpanded((prev) => ({
        ...prev,
        [jobId]: {
          open: true,
          loading: false,
          data: detailData,
          error: null,
        },
      }));
    } catch (e) {
      console.error("[ShortlistedJobs] Fetch error:", e);
      setExpanded((prev) => ({
        ...prev,
        [jobId]: {
          open: true,
          loading: false,
          data: mergedFallback,
          error: e?.message || "Could not load full details from server.",
        },
      }));
    }
  };

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-950" : "bg-slate-50";
  const cardBg = isDark ? "bg-gray-800/80" : "bg-white";
  const cardBgElevated = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-slate-50" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-600";
  const borderColor = isDark ? "border-slate-700/60" : "border-slate-200";
  const accentBg = isDark ? "bg-amber-500/20" : "bg-amber-50";

  const renderSection = (value, label, Icon) => {
    if (!value) return null;
    const isArr = Array.isArray(value);
    if (isArr && value.length === 0) return null;
    return (
      <div className="pb-2">
        <h4 className={`flex items-center gap-2 text-sm font-semibold ${textColor} mb-2.5`}>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/20">
            <Icon size={14} className="text-amber-600 dark:text-amber-400" />
          </span>
          {label}
        </h4>
        {isArr ? (
          <ul className={`text-sm ${textSecondary} leading-relaxed space-y-1.5 list-disc list-inside pl-1`}>
            {value.map((item, i) => (
              <li key={i}>{String(item).replace(/^[•\-]\s*/, "")}</li>
            ))}
          </ul>
        ) : (
          <p className={`text-sm ${textSecondary} leading-relaxed whitespace-pre-line`}>{String(value)}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${bgColor} ${isDark ? "" : "bg-gradient-to-b from-amber-50/40 to-transparent"}`}>
      <CandidateNavbar darkMode={isDark} toggleDarkMode={toggleTheme} />

      <main className="pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-10 sm:mb-12">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${accentBg} flex items-center justify-center shadow-sm ring-1 ring-amber-500/10`}>
                <Star className="text-amber-500" size={28} strokeWidth={2} />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${textColor}`}>
                  Shortlisted Jobs
                </h1>
                <p className={`${textSecondary} text-sm sm:text-base mt-1 max-w-md`}>
                  Jobs where recruiters have shortlisted your profile
                </p>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-10">
            <div className={`${cardBgElevated} border ${borderColor} rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-500/30 transition-all duration-200`}>
              <div>
                <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider mb-1.5`}>
                  Total
                </p>
                <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${textColor}`}>{jobs.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <Star size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className={`${cardBgElevated} border ${borderColor} rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all duration-200`}>
              <div>
                <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider mb-1.5`}>
                  Active
                </p>
                <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${textColor}`}>
                  {jobs.filter((j) => j.status?.toLowerCase() === "shortlisted").length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className={`${cardBgElevated} border ${borderColor} rounded-2xl p-5 sm:p-6 flex items-center justify-between shadow-sm hover:shadow-md hover:border-sky-200 dark:hover:border-sky-500/30 transition-all duration-200`}>
              <div>
                <p className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider mb-1.5`}>
                  Latest
                </p>
                <p className={`text-lg sm:text-xl font-bold ${textColor}`}>
                  {jobs[0]?.appliedDateTime ? getRelativeTime(jobs[0].appliedDateTime) : "—"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
                <Clock size={24} className="text-sky-600 dark:text-sky-400" />
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-14 w-14 border-2 border-amber-200 dark:border-amber-500/30 border-t-amber-500 mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Star className="text-amber-500" size={22} />
                  </div>
                </div>
                <p className={`text-sm font-medium ${textSecondary}`}>Loading shortlisted jobs…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className={`${cardBgElevated} border border-red-200 dark:border-red-900/50 rounded-2xl p-8 sm:p-10 text-center shadow-sm`}>
              <div className="w-14 h-14 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-500" size={28} />
              </div>
              <h3 className={`text-lg font-bold ${textColor} mb-2`}>Couldn’t load shortlisted jobs</h3>
              <p className={`${textSecondary} text-sm max-w-sm mx-auto mb-6`}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && jobs.length === 0 && (
            <div className={`${cardBgElevated} border ${borderColor} rounded-2xl p-10 sm:p-14 text-center shadow-sm`}>
              <div className={`w-20 h-20 ${accentBg} rounded-2xl flex items-center justify-center mx-auto mb-5 ring-1 ring-amber-500/10`}>
                <Star size={40} className="text-amber-500" />
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-2`}>No shortlisted jobs yet</h3>
              <p className={`${textSecondary} text-sm sm:text-base mb-8 max-w-sm mx-auto`}>
                When a recruiter shortlists your profile for a job, it will show up here.
              </p>
              <button
                onClick={() => navigate("/userjoblistings")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors shadow-sm"
              >
                <Briefcase size={18} />
                Browse jobs
              </button>
            </div>
          )}

          {/* Job List */}
          {!loading && !error && jobs.length > 0 && (
            <div className="space-y-5">
              {jobs.map((job) => {
                const jobId = job.id || job.job_id;
                const exp = expanded[jobId] || {};
                const isOpen = !!exp.open;
                const detail = exp.data;

                return (
                  <article
                    key={jobId}
                    className={`relative ${cardBgElevated} border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm
                      ${isOpen
                        ? `border-amber-400/80 dark:border-amber-500/70 shadow-lg shadow-amber-500/10`
                        : `${borderColor} hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600`
                      }`}
                  >
                    {/* Shortlisted accent bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-500 rounded-l-2xl" />

                    <div className="pl-5 sm:pl-6 pr-6 py-5 sm:py-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h2 className={`text-lg sm:text-xl font-bold ${textColor}`}>{job.title}</h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/25 dark:text-amber-300">
                              <Star size={12} />
                              Shortlisted
                            </span>
                          </div>
                          <p className={`text-sm font-medium ${textColor} mb-3 flex items-center gap-1.5`}>
                            <Building size={14} className={textSecondary} />
                            {job.company}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                            {job.location && (
                              <span className={`flex items-center gap-1 ${textSecondary}`}>
                                <MapPin size={13} /> {job.location}
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${textSecondary}`}>
                              <DollarSign size={13} /> {job.salary}
                            </span>
                            <span className={`flex items-center gap-1 ${textSecondary}`}>
                              <Clock size={13} /> Applied {getRelativeTime(job.appliedDateTime)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleDetails(job)}
                          className={`self-start sm:self-center shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                            ${isOpen
                              ? "bg-amber-600 text-white hover:bg-amber-700"
                              : "bg-amber-500 text-white hover:bg-amber-600"
                            }`}
                        >
                          {exp.loading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : isOpen ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                          <span>{exp.loading ? "Loading…" : isOpen ? "Hide details" : "View details"}</span>
                          {!exp.loading && (isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                        </button>
                      </div>
                    </div>

                    {/* Details panel */}
                    {isOpen && (
                      <div className={`border-t ${borderColor} px-5 sm:px-6 pb-6 pt-5 ${isDark ? "bg-slate-800/50" : "bg-slate-50"}`}>

                        {exp.loading && (
                          <div className="flex items-center justify-center py-14 gap-3">
                            <Loader2 size={22} className="animate-spin text-amber-500" />
                            <span className={`${textSecondary} text-sm`}>Loading job details…</span>
                          </div>
                        )}

                        {!exp.loading && exp.error && (
                          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 mb-5`}>
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{exp.error}</span>
                          </div>
                        )}

                        {/* Detail content */}
                        {detail && !exp.loading && (() => {
                          // Normalize the experience field
                          const expVal = (() => {
                            const e = detail.experience || detail.experience_required;
                            if (!e) return null;
                            if (typeof e === "object") {
                              const min = e.min_years || e.min_experience;
                              const max = e.max_years || e.max_experience;
                              if (min && max) return `${min}–${max} Yrs`;
                              if (min) return `${min}+ Yrs`;
                              if (max) return `Up to ${max} Yrs`;
                            }
                            return String(e);
                          })();

                          const salary = (() => {
                            const sr = detail.salary_range;
                            if (!sr) {
                              if (job.salary && job.salary !== "Salary not disclosed") return job.salary;
                              return null;
                            }
                            const sym = (sr.currency === "INR" || !sr.currency) ? "₹" : sr.currency + " ";
                            if (sr.min != null && sr.max != null) return `${sym}${Number(sr.min).toLocaleString("en-IN")} – ${sym}${Number(sr.max).toLocaleString("en-IN")}`;
                            if (sr.min != null) return `${sym}${Number(sr.min).toLocaleString("en-IN")}+`;
                            return null;
                          })();

                          // Normalize description — string or array (same keys as Jobdescription + raw from applied API)
                          const description = (() => {
                            const d = detail.description || detail.job_description;
                            if (!d) return null;
                            if (Array.isArray(d)) {
                              return d
                                .map((s) => String(s).replace(/^[•\-]\s*/, "").trim())
                                .filter(Boolean);
                            }
                            return String(d).trim() || null;
                          })();

                          const responsibilities = (() => {
                            const r = detail.responsibilities || detail.key_responsibilities || detail.responsibilities_string;
                            if (!r) return null;
                            if (Array.isArray(r)) return r.map((s) => String(s).replace(/^[•\-]\s*/, "").trim()).filter(Boolean);
                            const str = String(r).trim();
                            if (!str) return null;
                            return str.split(/\n+/).map((line) => line.replace(/^[•\-]\s*/, "").trim()).filter(Boolean);
                          })();

                          const requirements = (() => {
                            const r = detail.requirements || detail.qualifications || detail.requirements_string;
                            if (!r) return null;
                            if (Array.isArray(r)) return r.map((s) => String(s).replace(/^[•\-]\s*/, "").trim()).filter(Boolean);
                            const str = String(r).trim();
                            if (!str) return null;
                            return str.split(/\n+/).map((line) => line.replace(/^[•\-]\s*/, "").trim()).filter(Boolean);
                          })();

                          const skills = (detail.skills_required || detail.skills || []).filter(Boolean);

                          const benefits = (() => {
                            const b = detail.additional_benefits || detail.benefits || detail.perks;
                            if (!b) return null;
                            if (Array.isArray(b)) return b.map((s) => String(s).replace(/^[•\-]\s*/, "").trim()).filter(Boolean);
                            return String(b).trim() || null;
                          })();

                          const hasRichContent = description || responsibilities || requirements || skills.length > 0 || benefits;

                          return (
                            <div className="space-y-6">
                              {/* Key info */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                  { icon: <Briefcase size={14} />, label: "Employment Type", value: detail.employment_type || detail.job_type || "—" },
                                  { icon: <Globe size={14} />,      label: "Work Mode",         value: detail.work_mode || (detail.is_remote ? "Remote" : "—") },
                                  { icon: <Award size={14} />,       label: "Experience",         value: expVal || "—" },
                                  { icon: <MapPin size={14} />,     label: "Location",           value: detail.location || "—" },
                                ].map((item, i) => (
                                  <div key={i} className={`${cardBgElevated} border ${borderColor} rounded-xl p-3.5 shadow-sm`}>
                                    <p className={`flex items-center gap-1.5 ${textSecondary} text-xs font-medium mb-1`}>
                                      {item.icon}
                                      {item.label}
                                    </p>
                                    <p className={`text-sm font-semibold ${textColor} truncate`}>{item.value}</p>
                                  </div>
                                ))}
                              </div>

                              {salary && (
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20`}>
                                  <DollarSign size={18} className="text-amber-500 shrink-0" />
                                  <span className={`text-sm ${textSecondary}`}>Salary: <strong className={textColor}>{salary}</strong></span>
                                </div>
                              )}

                              {/* Rich sections */}
                              {renderSection(description, "Job Description", FileText)}
                              {renderSection(responsibilities, "Key Responsibilities", FileText)}
                              {renderSection(requirements, "Qualifications", Award)}

                              {skills.length > 0 && (
                                <div className="pb-2">
                                  <h4 className={`flex items-center gap-2 text-sm font-semibold ${textColor} mb-2.5`}>
                                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                      <Tag size={14} className="text-amber-600 dark:text-amber-400" />
                                    </span>
                                    Skills required
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, i) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200/50 dark:border-amber-500/20"
                                      >
                                        {typeof skill === "string" ? skill : skill?.name || String(skill)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {renderSection(benefits, "Benefits & perks", Star)}

                              {(detail.contact_email || detail.contact_number) && (
                                <div className={`flex flex-wrap gap-6 text-sm pt-4 border-t ${borderColor}`}>
                                  {detail.contact_email && (
                                    <span className={`${textSecondary}`}>Email: <strong className={textColor}>{detail.contact_email}</strong></span>
                                  )}
                                  {detail.contact_number && (
                                    <span className={`${textSecondary}`}>Phone: <strong className={textColor}>{detail.contact_number}</strong></span>
                                  )}
                                </div>
                              )}

                              {!hasRichContent && !exp.error && (
                                <p className={`text-sm ${textSecondary} italic`}>
                                  No additional details are available for this posting.
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShortlistedJobs;
