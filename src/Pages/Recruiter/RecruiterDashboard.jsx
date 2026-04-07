import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import { recruiterExternalService } from "../../services";
import {
  Plus, Users, Star, Building, FileText, Trophy, Calendar,
  Briefcase, Mail, TrendingUp, Clock, MapPin, Eye, Edit,
  ArrowRight, AlertCircle, CheckCircle, Activity, Zap,
  BarChart2, ChevronRight,
} from "lucide-react";

/* ── helpers ── */
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const getBadgeClass = (status) => {
  const s = status?.toLowerCase() || "";
  if (["shortlisted", "active", "open", "approved"].includes(s))
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (s === "pending")
    return "bg-amber-50 text-amber-700 border border-amber-200";
  if (["rejected", "closed"].includes(s))
    return "bg-red-50 text-red-600 border border-red-200";
  return "bg-blue-50 text-blue-700 border border-blue-200";
};

/* ── Skeleton ── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

/* ── Stat Card ── */
const StatCard = ({ to, icon, value, label, iconWrapClass }) => {
  const inner = (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconWrapClass}`}>
        {icon}
      </div>
      <div className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
        {value ?? 0}
      </div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
  return to ? (
    <Link to={to} className="no-underline block">
      {inner}
    </Link>
  ) : inner;
};

/* ── Job Card ── */
const JobCard = ({ job, navigate }) => (
  <div
    onClick={() =>
      navigate(`/job/${job.job_id}`, {
        state: {
          fromRecruiter: true,
          job,
        },
      })
    }
    className="border border-slate-200 rounded-xl p-4 bg-white hover:bg-blue-50/40 hover:border-blue-200 transition-all duration-150 mb-3 last:mb-0 cursor-pointer"
  >
    <div className="flex justify-between items-start gap-2 mb-2">
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-slate-800 truncate mb-1">{job.job_title}</h4>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Building size={11} />
          <span className="truncate">{job.company_name}</span>
          {job.location && (
            <>
              <span className="text-slate-300">•</span>
              <MapPin size={10} />
              <span className="truncate">{job.location}</span>
            </>
          )}
        </div>
      </div>
      {job.status && (
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${getBadgeClass(job.status)}`}>
          {job.status}
        </span>
      )}
    </div>

    <div className="flex flex-wrap gap-1.5 mb-3">
      {job.employment_type && (
        <span className="text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-md">
          {job.employment_type}
        </span>
      )}
      {job.work_mode && (
        <span className="text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-md">
          {job.work_mode}
        </span>
      )}
      {job.created_at && (
        <span className="text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
          <Calendar size={9} /> {fmt(job.created_at)}
        </span>
      )}
    </div>

    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/edit-job/${job.job_id}`);
        }}
        className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
      >
        <Edit size={13} /> Edit / View
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/view-applications/${job.job_id}`);
        }}
        className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all duration-150"
      >
        <Eye size={13} /> View Applications ({job.application_count || 0})
      </button>
    </div>
  </div>
);

/* ── App Card ── */
const AppCard = ({ app }) => {
  const initials = app.student_name?.charAt(0)?.toUpperCase() || "U";
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white hover:bg-blue-50/30 hover:border-blue-200 transition-all duration-150 mb-3 last:mb-0">
      <div className="flex gap-2.5 items-start">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-extrabold text-base flex-shrink-0 overflow-hidden">
          {app.student_profile?.logo || app.student_profile?.profile_image ? (
            <img
              src={app.student_profile.logo || app.student_profile.profile_image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-0.5">
            <div className="font-bold text-xs text-slate-800 truncate">{app.student_name}</div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${getBadgeClass(app.status)}`}>
              {app.status}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 truncate mb-1">{app.student_email}</div>
          <div className="text-[11px] font-semibold text-blue-600 truncate mb-1.5">{app.job_title}</div>
          <div className="text-[10.5px] text-slate-400 flex items-center gap-1 mb-2.5">
            <Clock size={9} /> {fmt(app.created_at)}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => window.open(app.resume_url, "_blank")}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <FileText size={11} /> Resume
            </button>
            <button
              onClick={() => alert("Contact coming soon")}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail size={11} /> Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isPendingApproval = location.state?.status === "pending_approval";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0, activeJobs: 0, totalApplications: 0,
    shortlistedCandidates: 0, interviewsScheduled: 0, hired: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [recruiterProfile, setRecruiterProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const jobsData = await recruiterExternalService.getAllPostedJobs(user?.employer_id || user?.id);
        const jobsList = (jobsData?.jobs || []).filter((j) => j?.job_id && j?.job_title);
        setJobs(jobsList);

        const totalJobs = jobsList.length;
        const activeJobs = jobsList.filter(
          (j) => ["open", "active", "approved"].includes(j.status?.toLowerCase() || "") || !j.status
        ).length;

        let allApps = [], shortlisted = 0;
        for (const job of jobsList) {
          try {
            const d = await recruiterExternalService.getAllApplicants(job.job_id);
            const apps = (d.applications || []).map((a) => ({
              ...a, job_title: job.job_title, job_id: job.job_id,
            }));
            allApps.push(...apps);
            shortlisted += apps.filter((a) => a.status === "Shortlisted").length;
          } catch {}
        }

        const recent = allApps
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 4)
          .map((app) => {
            const sp = app.student_profile || {};
            return {
              ...app,
              student_name: sp.full_name || app.student_name || "Unknown",
              student_email: sp.email || app.student_email || "",
              resume_url: sp.resumeUrl || sp.resume || app.resume_url,
            };
          });

        setRecentApplications(recent);
        setStats({ totalJobs, activeJobs, totalApplications: allApps.length, shortlistedCandidates: shortlisted, interviewsScheduled: 0, hired: 0 });
      } catch {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    if (user && !isPendingApproval) fetchData();
    else setLoading(false);
  }, [user, isPendingApproval]);

  useEffect(() => {
    const id = user?.employer_id || user?.id;
    if (!id) return;
    recruiterExternalService.getRecruiterProfile(id).then(setRecruiterProfile).catch(() => {});
  }, [user?.employer_id, user?.id]);

  const quickActions = [
    { title: "Post New Job",    desc: "Create & publish an opening",      icon: <Plus size={19} />,     iconBg: "bg-blue-100",   iconColor: "text-blue-600",   bar: "from-blue-500 to-blue-400",   href: "/post-job" },
    { title: "Manage Jobs",     desc: "View & manage all your jobs",       icon: <Briefcase size={19} />,iconBg: "bg-violet-100", iconColor: "text-violet-600", bar: "from-violet-500 to-violet-400",href: "/manage-jobs" },
    { title: "Shortlist",       desc: "Review shortlisted candidates",     icon: <Star size={19} />,     iconBg: "bg-amber-100",  iconColor: "text-amber-600",  bar: "from-amber-500 to-amber-400",  href: "/shortlist-candidates" },
    { title: "Company Profile", desc: "Update your company information",   icon: <Building size={19} />, iconBg: "bg-emerald-100",iconColor: "text-emerald-600",bar: "from-emerald-500 to-emerald-400",href: "/company-profile" },
  ];

  const companyName = recruiterProfile?.company_name || recruiterProfile?.name || "Recruiter";

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-5">
        <Skeleton className="h-44 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center max-w-sm w-full">
        <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={26} className="text-red-500" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  /* ── Pending ── */
  if (isPendingApproval) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Clock size={36} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Approval Pending</h2>
        <p className="text-sm text-slate-500 leading-relaxed">Your registration is under review. You'll receive full access once approved by our admin team.</p>
      </div>
    </div>
  );

  /* ════════════════ MAIN ════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 pt-[95px] pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── HERO HEADER ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 rounded-2xl p-6 sm:p-8 shadow-lg shadow-blue-200">
          {/* decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-20 right-32 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-4 right-1/3 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-wrap gap-6 items-center justify-between">
            <div>
              {/* live badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-3 py-1 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">Hiring Cockpit</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2.5 leading-tight">
                Welcome back, {companyName} 👋
              </h1>
              <p className="text-white/75 text-sm sm:text-base max-w-lg leading-relaxed mb-4">
                Manage your jobs, review applicants, and track your hiring pipeline — all in one place.
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-xs font-semibold rounded-full px-3.5 py-1.5">
                  <CheckCircle size={12} /> {stats.activeJobs} Active Jobs
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-xs font-semibold rounded-full px-3.5 py-1.5">
                  <Users size={12} /> {stats.totalApplications} Applications
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => navigate("/post-job")}
                className="flex items-center justify-center gap-2 bg-white text-blue-700 font-extrabold text-sm px-7 py-3 rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                <Plus size={17} /> Post a Job
              </button>
              <button
                onClick={() => navigate("/manage-jobs")}
                className="flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold text-sm px-7 py-2.5 rounded-xl hover:bg-white/10 transition-colors duration-200"
              >
                <BarChart2 size={15} /> View All Jobs
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard to="/manage-jobs"          icon={<FileText size={18} className="text-blue-600" />}    value={stats.totalJobs}             label="Total Jobs"   iconWrapClass="bg-blue-50" />
          <StatCard to="/manage-jobs"          icon={<Activity size={18} className="text-emerald-600" />} value={stats.activeJobs}            label="Active Jobs"  iconWrapClass="bg-emerald-50" />
          <StatCard to="/manage-jobs"          icon={<Users size={18} className="text-violet-600" />}     value={stats.totalApplications}     label="Applications" iconWrapClass="bg-violet-50" />
          <StatCard to="/shortlist-candidates" icon={<Star size={18} className="text-amber-600" />}       value={stats.shortlistedCandidates} label="Shortlisted"  iconWrapClass="bg-amber-50" />
          <StatCard                             icon={<Calendar size={18} className="text-sky-600" />}     value={stats.interviewsScheduled}   label="Interviews"   iconWrapClass="bg-sky-50" />
          <StatCard                             icon={<Trophy size={18} className="text-rose-600" />}      value={stats.hired}                 label="Hired"        iconWrapClass="bg-rose-50" />
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Zap size={17} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(a.href)}
                className="relative overflow-hidden border-2 border-slate-100 rounded-2xl p-5 text-left bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                {/* color top bar */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${a.bar} rounded-t-2xl opacity-80`} />
                <div className={`w-11 h-11 rounded-xl ${a.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                  <span className={a.iconColor}>{a.icon}</span>
                </div>
                <div className="font-extrabold text-sm text-slate-800 mb-1">{a.title}</div>
                <div className="text-xs text-slate-500 leading-snug">{a.desc}</div>
                <ChevronRight size={14} className="absolute right-4 bottom-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200" />
              </button>
            ))}
          </div>
        </div>

        {/* ── JOBS + APPLICATIONS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent Jobs */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/60">
              <div className="flex items-center gap-2.5">
                <Briefcase size={18} className="text-blue-600" />
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Recent Job Postings
                </h2>
                <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {jobs.length}
                </span>
              </div>
              <button
                onClick={() => navigate("/manage-jobs")}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-[11px] sm:text-xs transition-colors group"
              >
                View All{" "}
                <ArrowRight
                  size={13}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {jobs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={24} className="text-blue-500 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-800 mb-2">
                    No Jobs Posted Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-5 max-w-xs mx-auto leading-relaxed px-1">
                    Start connecting with talented candidates by posting your first job.
                  </p>
                  <button
                    onClick={() => navigate("/post-job")}
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <Plus size={15} /> Post First Job
                  </button>
                </div>
              ) : (
                jobs.slice(0, 3).map((job) => <JobCard key={job.job_id} job={job} navigate={navigate} />)
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-white to-violet-50/60">
              <div className="flex items-center gap-2.5">
                <Users size={19} className="text-violet-600" />
                <h2 className="text-base font-extrabold text-slate-900">Applicants</h2>
              </div>
              <button
                onClick={() => navigate("/candidate-applications")}
                className="flex items-center gap-1 text-violet-600 hover:text-violet-700 font-bold text-xs transition-colors group"
              >
                All <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="p-4">
              {recentApplications.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-violet-50 border border-violet-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText size={22} className="text-violet-500" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2">No Applications Yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Post jobs to start receiving applications.</p>
                </div>
              ) : (
                recentApplications.map((app) => <AppCard key={app.application_id} app={app} />)
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;