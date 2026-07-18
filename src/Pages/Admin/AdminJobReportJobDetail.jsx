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
  const returnViewMode = location.state?.returnViewMode || "jobs";
  const backTargetPath = returnViewMode === "reports" ? "/admin/job-application-reports" : "/admin/job-posting";
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
        console.error("Failed to load application count:", e);
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
  const bgColor = isDark ? "bg-[#0f172a]" : "bg-[#f8fafc]";
  const cardBg = isDark ? "bg-[#1e293b]" : "bg-white";
  const textColor = isDark ? "text-slate-100" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const borderColor = isDark ? "border-slate-700/50" : "border-slate-200";

  const description = job?.job_description || job?.description || job?.new_description || "";
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

  if (loading && !job) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-6`}>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className={`${cardBg} relative rounded-2xl border ${borderColor} p-8 text-center max-w-sm w-full shadow-2xl backdrop-blur-xl`}>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-6" />
            <p className={`text-lg font-semibold ${textColor}`}>Fetching job details...</p>
            <p className={`text-sm ${textSecondary} mt-2`}>Optimizing your workspace</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className={`min-h-screen ${bgColor} px-4 py-12`}>
        <div className="max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(backTargetPath, { state: { returnViewMode } })}
            className={`flex items-center gap-2 mb-8 ${textSecondary} hover:${textColor} transition-colors font-medium`}
          >
            <ArrowLeft size={20} />
            Back to job reports
          </button>
          <div className={`${cardBg} border-l-4 border-red-500 rounded-2xl p-8 shadow-xl`}>
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold">Oops! Something went wrong</h3>
            </div>
            <p className={`${textSecondary} text-lg leading-relaxed`}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusOpen = job?.status === "open" || job?.job_status === "open";
  const statusClosed = job?.status === "closed" || job?.job_status === "closed";

  return (
    <div className={`min-h-screen ${bgColor} pb-20`}>
      {/* Sticky Top Header */}
      <div className={`${cardBg} border-b ${borderColor} sticky top-0 z-50 backdrop-blur-md bg-opacity-80`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                onClick={() => {
                  const targetState = returnViewMode === "reports" ? { returnViewMode: "reports" } : { returnViewMode: "jobs" };
                  navigate(backTargetPath, { state: targetState, replace: true });
                }}
                className={`flex items-center justify-center p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all ${textColor} group`}
              >
                <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              <div className="flex items-center gap-3 min-w-0">
                {logoUrl && (
                  <div className={`w-10 h-10 rounded-xl overflow-hidden border ${borderColor} shrink-0 bg-white shadow-sm`}>
                    <img
                      src={logoUrl}
                      alt=""
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job?.company_name || "Co")}&background=random&color=fff`;
                      }}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className={`text-base sm:text-lg font-bold ${textColor} truncate leading-tight`}>
                    {job?.job_title || "Job Details"}
                  </h1>
                  <p className={`text-xs ${textSecondary} truncate`}>
                    {job?.company_name} · {job?.location}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                statusOpen ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : 
                statusClosed ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : 
                "bg-slate-500/10 text-slate-500 border border-slate-500/20"
              }`}>
                {statusOpen ? "Active" : statusClosed ? "Closed" : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Glassmorphic Hero Card */}
            <div className="relative overflow-hidden rounded-3xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90 dark:opacity-80"></div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-700"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative p-8 sm:p-10 text-white">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-3xl p-3 shadow-2xl flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job?.company_name || "Co")}&background=000&color=fff&size=128`;
                        }}
                      />
                    ) : (
                      <span className="text-3xl font-black text-indigo-600">
                        {getCompanyInitials(job?.company_name)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {statusOpen && <span className="px-2.5 py-1 bg-emerald-400/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest text-emerald-300 border border-emerald-400/30">Live Now</span>}
                        {job?.is_premium && <span className="px-2.5 py-1 bg-amber-400/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest text-amber-300 border border-amber-400/30 flex items-center gap-1.5"><Star size={12} fill="currentColor" /> Premium Listing</span>}
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                        {job?.job_title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-blue-100/80">
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                          <Building size={18} className="opacity-70" />
                          <span className="font-medium">{job?.company_name}</span>
                        </div>
                        <div className="w-1 h-1 bg-white/30 rounded-full hidden sm:block"></div>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
                          <MapPin size={18} className="opacity-70" />
                          <span className="font-medium">{job?.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className={`${cardBg} rounded-[2rem] border ${borderColor} shadow-sm overflow-hidden`}>
              <div className="p-8 sm:p-10 space-y-12">
                
                {/* Description */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                      <FileText size={22} className="text-blue-500" />
                    </div>
                    <h3 className={`text-xl font-bold ${textColor}`}>Job Description</h3>
                  </div>
                  <div className={`prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed ${textSecondary}`}>
                    {description || "No detailed description provided for this position."}
                  </div>
                </section>

                {/* Responsibilities */}
                {responsibilitiesList.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                        <ShieldCheck size={22} className="text-indigo-500" />
                      </div>
                      <h3 className={`text-xl font-bold ${textColor}`}>Key Responsibilities</h3>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-4">
                      {responsibilitiesList.map((item, idx) => (
                        <li key={idx} className={`flex items-start gap-3 p-4 rounded-2xl border ${borderColor} hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group`}>
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 group-hover:scale-150 transition-transform"></div>
                          <span className={`${textSecondary} text-sm`}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Qualifications */}
                {qualificationsList.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-purple-500/10 rounded-xl">
                        <Tag size={22} className="text-purple-500" />
                      </div>
                      <h3 className={`text-xl font-bold ${textColor}`}>Qualifications</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {qualificationsList.map((item, idx) => (
                        <span key={idx} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${borderColor} ${textSecondary} text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar (Details & Actions) */}
          <div className="space-y-6">
            
            {/* Quick Summary Card */}
            <div className={`${cardBg} rounded-3xl border ${borderColor} p-6 shadow-sm space-y-6`}>
              <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                <Clock size={20} className="text-indigo-500" />
                Employment Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-slate-400" />
                    <span className={`text-sm ${textSecondary}`}>Job Type</span>
                  </div>
                  <span className={`text-sm font-bold ${textColor}`}>{jobTypeLabel || "Full-time"}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Laptop size={18} className="text-slate-400" />
                    <span className={`text-sm ${textSecondary}`}>Work Mode</span>
                  </div>
                  <span className={`text-sm font-bold ${textColor}`}>{workMode || "In-office"}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Hash size={18} className="text-slate-400" />
                    <span className={`text-sm ${textSecondary}`}>Experience</span>
                  </div>
                  <span className={`text-sm font-bold ${textColor}`}>{formatExperience(job)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <Gift size={18} className="text-emerald-500" />
                    <span className={`text-sm text-emerald-600 dark:text-emerald-400`}>Salary</span>
                  </div>
                  <span className={`text-sm font-black text-emerald-600 dark:text-emerald-400`}>{formatJobSalary(job)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={() => navigate(`/admin/job-reports/applications/${jobId}`, {
                    state: {
                      jobTitle: job?.job_title,
                      companyName: job?.company_name,
                      returnViewMode,
                    },
                  })}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Users size={20} />
                  View {applicationCountLoading ? "..." : applicationCount} Applications
                </button>
                
                <button
                  onClick={() => navigate(`/admin/edit-job/${job?.job_id || job?.id || jobId}`, {
                    state: {
                      employer_id: job?.employer_id,
                      returnViewMode,
                    },
                  })}
                  className={`w-full py-4 border-2 border-slate-200 dark:border-slate-700 ${textColor} hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95`}
                >
                  <Briefcase size={20} />
                  Edit Position
                </button>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className={`${cardBg} rounded-3xl border border-dashed ${borderColor} p-6 space-y-5`}>
              <h4 className={`text-sm font-black uppercase tracking-widest ${textSecondary}`}>Recruiter Contact</h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-500 transition-colors">
                    <Mail size={16} className="text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-bold uppercase ${textSecondary}`}>Email Address</p>
                    <a href={`mailto:${contactEmail}`} className={`text-sm font-semibold ${textColor} truncate block hover:text-indigo-600`}>
                      {contactEmail || "No email available"}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 group">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-500 transition-colors">
                    <Phone size={16} className="text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-bold uppercase ${textSecondary}`}>Phone Number</p>
                    <a href={`tel:${contactPhone}`} className={`text-sm font-semibold ${textColor} truncate block hover:text-indigo-600`}>
                      {contactPhone || "No contact number"}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Badges */}
            <div className={`${cardBg} rounded-3xl border ${borderColor} p-6 shadow-sm space-y-6`}>
              <h3 className={`text-lg font-bold ${textColor}`}>Desired Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skillsList.length > 0 ? (
                  skillsList.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className={`text-sm ${textSecondary} italic`}>General requirements</span>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobReportJobDetail;
