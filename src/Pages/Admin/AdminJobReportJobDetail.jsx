import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTheme } from "../../Contexts/ThemeContext";
import { adminService } from "../../services/adminService";
import { recruiterExternalService } from "../../services/recruiterExternalService";
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  Mail,
  Phone,
  Clock,
  FileText,
  Hash,
  Laptop,
  Star,
  ShieldCheck,
  Gift,
  Eye,
  EyeOff,
  Tag,
} from "lucide-react";

/** Primary: `job_logo_url`; then company / legacy fields */
const getJobLogoUrl = (job) =>
  job?.job_logo_url ||
  job?.job_logo ||
  job?.company_logo ||
  job?.companyLogo ||
  job?.logo ||
  null;

const getCompanyInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const toStringArray = (value) => {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const extractContactNumber = (job) =>
  job?.contact_number ??
  job?.phone_number ??
  job?.phone ??
  job?.mobile ??
  job?.contact_phone ??
  "";

const formatJobSalary = (job) => {
  const sr = job?.salary_range;
  if (sr) {
    if (typeof sr === "string") return sr;
    if (sr.min != null && sr.max != null) {
      return `${sr.min} – ${sr.max} ${sr.currency || "INR"}`;
    }
    if (sr.min != null || sr.max != null) {
      return `${sr.min ?? sr.max} ${sr.currency || "INR"}`;
    }
  }
  if (job?.salary_min != null || job?.salary_max != null) {
    return `${job.salary_min ?? "—"} – ${job.salary_max ?? "—"} ${job.currency || "INR"}`;
  }
  return "Not specified";
};

const formatExperience = (job) => {
  const exp = job?.experience_required;
  if (!exp || (exp.min_years == null && exp.max_years == null)) return "—";
  if (exp.min_years != null && exp.max_years != null) {
    return `${exp.min_years} – ${exp.max_years} years`;
  }
  if (exp.min_years != null) return `${exp.min_years}+ years`;
  if (exp.max_years != null) return `Up to ${exp.max_years} years`;
  return "—";
};

const getSkillsList = (job) => {
  if (!job) return [];
  if (Array.isArray(job.skills_required) && job.skills_required.length) {
    return job.skills_required.map((s) => String(s).trim()).filter(Boolean);
  }
  if (Array.isArray(job.skills) && job.skills.length) {
    return job.skills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof job.skills === "string" && job.skills.trim()) {
    return job.skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (typeof job.required_skills === "string" && job.required_skills.trim()) {
    return job.required_skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const AdminJobReportJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [job, setJob] = useState(() => {
    const j = location.state?.job;
    if (!j) return null;
    return { ...j, id: j.job_id || j.id };
  });
  const [loading, setLoading] = useState(() => !location.state?.job);
  const [error, setError] = useState("");
  const [applicationCount, setApplicationCount] = useState(null);
  const [applicationCountLoading, setApplicationCountLoading] = useState(true);
  const prevJobIdRef = useRef();

  useEffect(() => {
    let cancelled = false;

    if (prevJobIdRef.current !== undefined && prevJobIdRef.current !== jobId) {
      setLoading(true);
      setJob(null);
    }
    prevJobIdRef.current = jobId;

    const load = async () => {
      setError("");
      try {
        // getJobDetailForReport: getjobdetail → getalljobs?job_id= → full list
        const resolved = await adminService.getJobDetailForReport(jobId);
        if (cancelled) return;
        if (!resolved) {
          setError("Job not found or not a recruiter job in this report.");
          setJob(null);
          return;
        }
        setJob(resolved);
      } catch (e) {
        if (!cancelled) {
          setError("Failed to load job details.");
          console.error(e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  useEffect(() => {
    if (!jobId) {
      setApplicationCount(null);
      setApplicationCountLoading(false);
      return;
    }
    let cancelled = false;
    setApplicationCountLoading(true);
    setApplicationCount(null);
    recruiterExternalService
      .getApplicationCount(jobId)
      .then((res) => {
        if (cancelled) return;
        setApplicationCount(res?.application_count ?? 0);
      })
      .catch((e) => {
        console.error("Failed to load application count from getallappplicants:", e);
        if (!cancelled) setApplicationCount(null);
      })
      .finally(() => {
        if (!cancelled) setApplicationCountLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  const description =
    job?.job_description || job?.description || job?.new_description || "";
  const responsibilitiesList = toStringArray(job?.responsibilities);
  const qualificationsList = toStringArray(job?.qualifications);
  const benefitsList = toStringArray(job?.additional_benefits);
  const skillsList = getSkillsList(job);
  const contactEmail = job?.contact_email || job?.email || "";
  const contactPhone = extractContactNumber(job);
  const workMode = job?.work_mode || job?.work_mode_detail || "";
  const postedBy = (job?.posted_by || "").toString().trim();
  const jobNumericId = job?.job_id ?? job?.id;
  const logoUrl = job ? getJobLogoUrl(job) : null;
  const jobTypeLabel = (job?.job_type || "").toString().trim();
  const statusVerified = (job?.status_verified || "").toString().trim();
  const editVerified = (job?.edit_verified || "").toString().trim();
  const editState = (job?.edit || "").toString().trim();

  if (loading && !job) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center max-w-lg`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className={textColor}>Loading job…</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className={`min-h-screen ${bgColor} px-4 py-8`}>
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => navigate("/admin/job-application-reports")}
            className={`flex items-center gap-2 mb-6 ${textSecondary} hover:opacity-80`}
          >
            <ArrowLeft size={20} />
            Back to reports
          </button>
          <div className={`${cardBg} border ${borderColor} rounded-xl p-6 text-red-600 dark:text-red-400`}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  const statusOpen =
    job?.status === "open" || job?.job_status === "open";
  const statusClosed =
    job?.status === "closed" || job?.job_status === "closed";

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-40 shadow-sm`}>
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/admin/job-application-reports")}
              className={`inline-flex items-center justify-center p-2 rounded-xl shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700 ${textColor}`}
              aria-label="Back to reports"
            >
              <ArrowLeft size={22} />
            </button>
            {logoUrl ? (
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border ${borderColor} shrink-0 ${isDark ? "bg-gray-700" : "bg-white"}`}
              >
                <img
                  src={logoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      job?.company_name || "Co"
                    )}&background=2563eb&color=fff&size=64`;
                  }}
                />
              </div>
            ) : null}
            <div className="flex-1 min-w-0">
              <h1 className={`text-base sm:text-lg font-bold ${textColor} truncate`}>
                {job?.job_title || "Job"}
              </h1>
              <p className={`text-xs sm:text-sm ${textSecondary} truncate`}>
                {job?.company_name || "—"} · {job?.location || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Hero — logo + title + status chips */}
        <div className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden shadow-sm`}>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-center sm:items-start text-center sm:text-left">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 ${borderColor} flex items-center justify-center shrink-0 shadow-inner ${isDark ? "bg-gray-700/80" : "bg-white"}`}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        job?.company_name || "Co"
                      )}&background=2563eb&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <span className={`text-2xl sm:text-3xl font-bold ${textSecondary}`}>
                    {getCompanyInitials(job?.company_name)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full space-y-4">
                <div>
                  <h2 className={`text-2xl sm:text-3xl font-bold ${textColor} leading-tight break-words`}>
                    {job?.job_title || "—"}
                  </h2>
                  <p
                    className={`mt-3 text-sm sm:text-base ${textSecondary} flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-x-3`}
                  >
                    <span className="inline-flex items-center justify-center sm:justify-start gap-2">
                      <Building className="shrink-0 opacity-80" size={18} />
                      <span className="break-words">{job?.company_name || "—"}</span>
                    </span>
                    <span className="hidden sm:inline opacity-40">|</span>
                    <span className="inline-flex items-center justify-center sm:justify-start gap-2">
                      <MapPin className="shrink-0 opacity-80" size={18} />
                      <span>{job?.location || "—"}</span>
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      statusOpen
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600/40"
                        : statusClosed
                          ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600/40"
                          : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {statusOpen ? "Active" : statusClosed ? "Closed" : job?.status || job?.job_status || "—"}
                  </span>
                  {job?.is_premium ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40">
                      <Star size={14} className="shrink-0" fill="currentColor" />
                      Premium
                    </span>
                  ) : null}
                  {jobTypeLabel ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-indigo-200 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/40">
                      <Tag size={14} className="shrink-0" />
                      {jobTypeLabel}
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${borderColor} ${textSecondary}`}
                  >
                    {applicationCountLoading ? (
                      <>
                        <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin opacity-70" />
                        Applications…
                      </>
                    ) : applicationCount !== null ? (
                      <>
                        <Users size={14} className="shrink-0 opacity-80" />
                        {applicationCount} application{applicationCount === 1 ? "" : "s"}
                      </>
                    ) : job?.application_count != null ? (
                      <>
                        {job.application_count} application{job.application_count === 1 ? "" : "s"}{" "}
                        <span className="opacity-70">(list)</span>
                      </>
                    ) : (
                      "Applications unavailable"
                    )}
                  </span>
                  {statusVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40">
                      <ShieldCheck size={14} className="shrink-0" />
                      Listing {statusVerified}
                    </span>
                  ) : null}
                  {editVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-sky-200 bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/40">
                      <ShieldCheck size={14} className="shrink-0" />
                      Edit {editVerified}
                    </span>
                  ) : null}
                  {editState ? (
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${borderColor} ${textSecondary}`}
                    >
                      Edit: {editState}
                    </span>
                  ) : null}
                  {typeof job?.to_show_user === "boolean" ? (
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${borderColor}`}
                    >
                      {job.to_show_user ? (
                        <>
                          <Eye size={14} className="shrink-0" />
                          Public on site
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} className="shrink-0" />
                          Hidden from listings
                        </>
                      )}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 sm:p-6 lg:p-8 shadow-sm space-y-6 sm:space-y-8`}>
          <div>
            <h2 className={`text-base font-semibold ${textColor} mb-3 flex items-center gap-2`}>
              <Briefcase size={18} className="text-purple-500 shrink-0" />
              Basic information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className={`flex items-start gap-2 ${textSecondary}`}>
                <Hash size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                    Job ID
                  </span>
                  <span className={textColor}>{jobNumericId != null ? String(jobNumericId) : "—"}</span>
                </div>
              </div>
              <div className={`flex items-start gap-2 ${textSecondary}`}>
                <Building size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                    Company
                  </span>
                  <span className={textColor}>{job?.company_name || "—"}</span>
                </div>
              </div>
              <div className={`flex items-start gap-2 ${textSecondary}`}>
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                    Location
                  </span>
                  <span className={textColor}>{job?.location || "—"}</span>
                </div>
              </div>
              <div className={`flex items-start gap-2 ${textSecondary}`}>
                <Briefcase size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                    Employment type
                  </span>
                  <span className={textColor}>
                    {job?.employment_type || job?.job_type_detail || "—"}
                  </span>
                </div>
              </div>
              <div className={`flex items-start gap-2 ${textSecondary}`}>
                <Tag size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                    Job category
                  </span>
                  <span className={textColor}>{jobTypeLabel || "—"}</span>
                </div>
              </div>
              <div className={`flex items-start gap-2 ${textSecondary}`}>
                <Laptop size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                    Work mode
                  </span>
                  <span className={textColor}>{workMode || "—"}</span>
                </div>
              </div>
              <div className={`flex items-start gap-2 ${textSecondary}`}>
                <Calendar size={18} className="shrink-0 mt-0.5" />
                <div>
                  <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                    Posted
                  </span>
                  <span className={textColor}>{formatDate(job?.created_at)}</span>
                </div>
              </div>
              {job?.updated_at && (
                <div className={`flex items-start gap-2 ${textSecondary}`}>
                  <Calendar size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                      Last updated
                    </span>
                    <span className={textColor}>{formatDate(job.updated_at)}</span>
                  </div>
                </div>
              )}
              {(postedBy || job?.employer_id != null || job?.recruiter_id != null) && (
                <div className={`sm:col-span-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${textSecondary}`}>
                  {postedBy && (
                    <span>
                      Posted by: <span className={textColor}>{postedBy}</span>
                    </span>
                  )}
                  {job?.employer_id != null && (
                    <span>
                      Employer ID: <span className={textColor}>{String(job.employer_id)}</span>
                    </span>
                  )}
                  {job?.recruiter_id != null && (
                    <span>
                      Recruiter ID: <span className={textColor}>{String(job.recruiter_id)}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={`grid sm:grid-cols-2 gap-4 pt-2 border-t ${borderColor}`}>
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wide ${textSecondary} mb-1`}>
                Salary
              </h3>
              <p className={`text-sm ${textColor}`}>{formatJobSalary(job)}</p>
            </div>
            <div>
              <h3 className={`text-xs font-semibold uppercase tracking-wide ${textSecondary} mb-1`}>
                Experience
              </h3>
              <p className={`text-sm ${textColor}`}>{formatExperience(job)}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className={`flex items-start gap-2 text-sm ${textSecondary}`}>
              <Mail size={18} className="shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                  Contact email
                </span>
                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}`}
                    className={`${textColor} break-all hover:underline`}
                  >
                    {contactEmail}
                  </a>
                ) : (
                  <span className={textColor}>—</span>
                )}
              </div>
            </div>
            <div className={`flex items-start gap-2 text-sm ${textSecondary}`}>
              <Phone size={18} className="shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className={`block text-xs uppercase tracking-wide ${textSecondary}`}>
                  Contact number
                </span>
                {contactPhone ? (
                  <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className={`${textColor} break-all hover:underline`}>
                    {contactPhone}
                  </a>
                ) : (
                  <span className={textColor}>—</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wide ${textSecondary} mb-1 flex items-center gap-2`}>
              <Clock size={16} className="shrink-0" />
              Application deadline
            </h3>
            <p className={`text-sm ${textColor}`}>
              {job?.application_deadline ? formatDate(job.application_deadline) : "—"}
            </p>
          </div>

          <div>
            <h2 className={`text-base font-semibold ${textColor} mb-3 flex items-center gap-2`}>
              <Gift size={18} className="text-amber-500 shrink-0" />
              Additional benefits
            </h2>
            {benefitsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {benefitsList.map((b, i) => (
                  <span
                    key={`${b}-${i}`}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                      isDark
                        ? "bg-amber-900/25 text-amber-200 border-amber-700/50"
                        : "bg-amber-50 text-amber-900 border-amber-200"
                    }`}
                  >
                    {b}
                  </span>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${textSecondary}`}>—</p>
            )}
          </div>

          <div>
            <h2 className={`text-base font-semibold ${textColor} mb-3`}>Required skills</h2>
            <div className="flex flex-wrap gap-2">
              {skillsList.length > 0 ? (
                skillsList.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${
                      isDark
                        ? "bg-purple-900/30 text-purple-400 border-purple-700"
                        : "bg-purple-100 text-purple-700 border-purple-200"
                    }`}
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className={`text-sm ${textSecondary}`}>No skills specified</span>
              )}
            </div>
          </div>

          <div>
            <h2 className={`text-base font-semibold ${textColor} mb-3 flex items-center gap-2`}>
              <FileText size={18} className="text-purple-500 shrink-0" />
              Description
            </h2>
            {description ? (
              <div
                className={`prose prose-sm dark:prose-invert max-w-none text-sm ${textSecondary} whitespace-pre-wrap`}
              >
                {description}
              </div>
            ) : (
              <p className={`text-sm ${textSecondary}`}>No description provided.</p>
            )}
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 pt-2 border-t ${borderColor}`}>
            <div className="min-w-0">
              <h3 className={`text-sm font-semibold ${textColor} mb-3`}>Responsibilities</h3>
              {responsibilitiesList.length > 0 ? (
                <ul className={`list-disc list-outside pl-5 space-y-2.5 text-sm ${textSecondary}`}>
                  {responsibilitiesList.map((line, i) => (
                    <li key={i} className={`leading-relaxed ${textColor}`}>
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${textSecondary}`}>—</p>
              )}
            </div>
            <div className="min-w-0">
              <h3 className={`text-sm font-semibold ${textColor} mb-3`}>Qualifications</h3>
              {qualificationsList.length > 0 ? (
                <ul className={`list-disc list-outside pl-5 space-y-2.5 text-sm ${textSecondary}`}>
                  {qualificationsList.map((line, i) => (
                    <li key={i} className={`leading-relaxed ${textColor}`}>
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm ${textSecondary}`}>—</p>
              )}
            </div>
          </div>

          <div className={`flex flex-col sm:flex-row flex-wrap gap-3 pt-2 border-t ${borderColor}`}>
          <button
              type="button"
              onClick={() =>
                navigate(`/admin/job-reports/applications/${jobId}`, {
                  state: {
                    jobTitle: job?.job_title,
                    companyName: job?.company_name,
                  },
                })
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shrink-0"
            >
              <Users size={18} />
              View applications
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(`/admin/edit-job/${job?.job_id || job?.id || jobId}`, {
                  state: { employer_id: job?.employer_id },
                })
              }
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-500/20 dark:text-blue-300 text-sm font-medium`}
            >
              <Briefcase size={16} />
              Edit job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobReportJobDetail;
