import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import { recruiterExternalService } from "../../services";
import {
  Star, Mail, Calendar, ArrowLeft, FileText,
  Briefcase, UserCheck, ExternalLink, Search,
  X, Users, ChevronLeft, Award
} from "lucide-react";

/* ─── AVATAR ─── */
const AVATAR_COLORS = [
  { bg: "bg-amber-100",   text: "text-amber-700", ring: "ring-amber-200"   },
  { bg: "bg-blue-100",    text: "text-blue-700",  ring: "ring-blue-200"    },
  { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
  { bg: "bg-indigo-100",  text: "text-indigo-700", ring: "ring-indigo-200"  },
  { bg: "bg-rose-100",    text: "text-rose-700",  ring: "ring-rose-200"    },
];

const Avatar = ({ name, src, index = 0 }) => {
  const [imgError, setImgError] = useState(false);
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initials = name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <div
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm ring-2 ${color.ring} ${color.bg} ${color.text} relative overflow-hidden group`}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

/* ─── SKELETON ─── */
const SkeletonCard = ({ isDark }) => (
  <div
    className={`rounded-3xl border p-5 sm:p-6 mb-4 animate-pulse relative overflow-hidden ${
      isDark ? "bg-gray-800/40 border-gray-700/50" : "bg-white border-gray-100 shadow-sm"
    }`}
  >
    <div className="flex gap-4 items-center">
      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex-shrink-0 ${isDark ? "bg-gray-700/60" : "bg-gray-200/60"}`} />
      <div className="flex-1 space-y-3">
        <div className={`h-4 w-40 rounded-full ${isDark ? "bg-gray-700/60" : "bg-gray-200/60"}`} />
        <div className={`h-3 w-56 max-w-full rounded-full ${isDark ? "bg-gray-700/60" : "bg-gray-200/60"}`} />
      </div>
      <div className={`hidden sm:block h-8 w-24 rounded-full ${isDark ? "bg-gray-700/60" : "bg-gray-200/60"}`} />
    </div>
    <div className={`mt-5 h-20 rounded-2xl ${isDark ? "bg-gray-700/40" : "bg-gray-50"}`} />
    <div className="mt-5 flex gap-3 flex-col sm:flex-row">
      <div className={`h-11 flex-1 rounded-xl ${isDark ? "bg-gray-700/60" : "bg-gray-200/60"}`} />
      <div className={`h-11 w-full sm:w-36 rounded-xl ${isDark ? "bg-gray-700/60" : "bg-gray-200/60"}`} />
    </div>
  </div>
);

/* ─── EMPTY STATE ─── */
const EmptyState = ({ hasFilter, isDark }) => (
  <div className={`py-16 sm:py-24 flex flex-col items-center text-center px-6 rounded-3xl border ${isDark ? "bg-gray-800/30 border-gray-700/50" : "bg-white border-gray-100 shadow-sm"}`}>
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${
        isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-100"
      }`}
    >
      {hasFilter ? (
        <Search size={32} className={isDark ? "text-gray-500" : "text-gray-400"} />
      ) : (
        <Users size={32} className={isDark ? "text-gray-500" : "text-gray-400"} />
      )}
    </div>
    <h3 className={`text-xl sm:text-2xl font-bold mb-2 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
      {hasFilter ? "No matches found" : "No shortlisted candidates"}
    </h3>
    <p className={`text-sm sm:text-base leading-relaxed max-w-md mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
      {hasFilter
        ? "We couldn't find any candidates matching your current search or filters. Try adjusting them."
        : "You haven't shortlisted anyone yet. Review outstanding applications to build your dream team."}
    </p>
    {hasFilter && (
      <button className="mt-6 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
        Clear all filters
      </button>
    )}
  </div>
);

/* ─── CANDIDATE CARD ─── */
const CandidateCard = ({ candidate, index, isDark, onMoveToPending, actionLoading }) => {
  const [coverExpanded, setCoverExpanded] = useState(false);

  const appliedDate = new Date(candidate.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const shortDate = new Date(candidate.updated_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const profileImg = candidate.student_profile?.logo || candidate.student_profile?.profile_image;

  const surface   = isDark
    ? "bg-gray-800/40 border-gray-700/50 hover:border-emerald-500/30"
    : "bg-white border-gray-200/60 hover:border-emerald-200 hover:shadow-md";
  const muted     = isDark ? "text-gray-400" : "text-gray-500";
  const body      = isDark ? "text-gray-200" : "text-gray-700";
  const coverBg   = isDark ? "bg-gray-900/50 border border-gray-700/50" : "bg-gray-50 border border-gray-100";
  const divider   = isDark ? "border-gray-700/50" : "border-gray-100";
  
  const pBtn = isDark 
    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200";
    
  const dangerBtn = isDark
    ? "bg-gray-800 border border-gray-700 text-gray-300 hover:border-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10"
    : "bg-white border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50";

  return (
    <div
      className={`relative rounded-3xl border transition-all duration-300 overflow-hidden group ${surface}`}
      style={{ boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.03)" }}
    >
      {/* Decorative gradient blob */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-20' : 'opacity-40'} group-hover:opacity-100`}></div>

      <div className="p-5 sm:p-6 relative z-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <Avatar name={candidate.student_name} src={profileImg} index={index} />
            <div className="sm:hidden">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                <Star size={11} fill="currentColor" />
                Shortlisted
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className={`text-lg sm:text-xl font-bold truncate tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                {candidate.student_name}
              </h3>
              <div className="hidden sm:block">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/50">
                  <Star size={10} fill="currentColor" />
                  Shortlisted
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2.5">
              <div className={`flex items-center gap-2 text-sm ${muted}`}>
                <div className={`p-1.5 rounded-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <Briefcase size={13} className={isDark ? "text-gray-400" : "text-gray-500"} />
                </div>
                <span className={`font-medium ${body}`}>{candidate.job_title}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${muted}`}>
                <div className={`p-1.5 rounded-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <Mail size={13} className={isDark ? "text-gray-400" : "text-gray-500"} />
                </div>
                <span className="truncate max-w-[200px]">{candidate.student_email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cover letter */}
        {candidate.cover_letter && (
          <div className={`mt-5 rounded-2xl p-4 transition-all duration-300 ${coverBg}`}>
            <button
              onClick={() => setCoverExpanded((p) => !p)}
              className={`flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"} hover:text-emerald-500 transition-colors`}
            >
              <span className="flex items-center gap-2">
                <FileText size={14} />
                Cover Letter
              </span>
              <span className={`transition-transform duration-300 ${coverExpanded ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${coverExpanded ? "max-h-[500px] opacity-100" : "max-h-[44px] opacity-80"}`}>
              <p className={`text-sm leading-relaxed ${body} ${coverExpanded ? "" : "line-clamp-2"}`}>
                {candidate.cover_letter}
              </p>
            </div>
          </div>
        )}

        {/* Divider + bottom row */}
        <div className={`mt-6 pt-5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${divider}`}>
          {/* Dates */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <Calendar size={14} className={isDark ? "text-gray-500" : "text-gray-400"} />
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase tracking-wide font-semibold ${muted}`}>Applied</span>
                <span className={`text-xs font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{appliedDate}</span>
              </div>
            </div>
            <div className={`hidden sm:block w-px h-8 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
            <div className="flex items-center gap-2">
              <UserCheck size={14} className={isDark ? "text-gray-500" : "text-gray-400"} />
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase tracking-wide font-semibold ${muted}`}>Shortlisted</span>
                <span className={`text-xs font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{shortDate}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
            {candidate.resume_url && (
              <a
                href={candidate.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 sm:flex-none inline-flex justify-center items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm active:scale-95 ${pBtn}`}
              >
                <ExternalLink size={16} />
                Resume
              </a>
            )}
            <button
              disabled={actionLoading}
              onClick={() => onMoveToPending(candidate.application_id)}
              className={`flex-1 sm:flex-none inline-flex justify-center items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm ${dangerBtn}`}
            >
              <ChevronLeft size={16} />
              Move back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── STAT CARD ─── */
const StatCard = ({ value, label, icon: Icon, isDark, trend, index }) => {
  const gradients = [
    "from-emerald-500/20 to-teal-500/5",
    "from-blue-500/20 to-cyan-500/5",
    "from-purple-500/20 to-indigo-500/5"
  ];
  const bgGradient = gradients[index % gradients.length];
  
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-transform hover:-translate-y-1 ${
        isDark ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-100"
      }`}
      style={{ boxShadow: isDark ? "none" : "0 4px 15px rgba(0,0,0,0.02)" }}
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${bgGradient} blur-2xl`}></div>
      <div className="relative z-10 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl ${isDark ? "bg-gray-700/60 text-gray-300" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>
            <Icon size={20} />
          </div>
          {trend && (
             <span className="inline-flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
               +{trend}%
             </span>
          )}
        </div>
        <div>
          <p className={`text-3xl sm:text-4xl font-bold tracking-tight mb-1 tabular-nums ${isDark ? "text-white" : "text-gray-900"}`}>
            {value}
          </p>
          <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN PAGE ─── */
const ShortlistCandidates = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const isDark = theme === "dark";

  const bg      = isDark ? "bg-[#0b0f19] selection:bg-emerald-500/30" : "bg-slate-50/50 selection:bg-emerald-200";
  const surface = isDark ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-md" : "bg-white/80 border-gray-200/60 backdrop-blur-md";
  const text    = isDark ? "text-white" : "text-gray-900";
  const muted   = isDark ? "text-gray-400" : "text-gray-500";
  const inputCls = isDark
    ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:bg-white";

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const jobsData = await recruiterExternalService.getAllPostedJobs(user?.employer_id || user?.id);
        const jobsList = (jobsData?.jobs || []).map((j) => ({ id: j.job_id, title: j.job_title }));
        setJobs(jobsList);

        const all = [];
        for (const job of jobsList) {
          try {
            const { applications = [] } = await recruiterExternalService.getAllApplicants(job.id);
            applications
              .filter((a) => a.status === "Shortlisted")
              .forEach((a) => {
                const sp = a.student_profile || {};
                all.push({
                  ...a,
                  job_title: job.title,
                  job_id: job.id,
                  student_name: sp.full_name || a.student_name || "Unknown",
                  student_email: sp.email || a.student_email || "—",
                  resume_url: sp.resumeUrl || sp.resume || a.resume_url,
                  student_profile: sp,
                });
              });
          } catch (_) {}
        }
        setCandidates(all);
      } catch (e) {
        setError(e?.message || "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return candidates.filter((c) => {
      const jobMatch  = selectedJob === "all" || String(c.job_id) === selectedJob;
      const textMatch =
        !q ||
        c.student_name?.toLowerCase().includes(q) ||
        c.student_email?.toLowerCase().includes(q) ||
        c.job_title?.toLowerCase().includes(q);
      return jobMatch && textMatch;
    });
  }, [candidates, selectedJob, searchQuery]);

  const handleMoveToPending = async (applicationId) => {
    try {
      setActionLoading(true);
      await recruiterExternalService.changeApplicationStatus(applicationId, false);
      setCandidates((prev) => prev.filter((a) => a.application_id !== applicationId));
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const hasFilter = selectedJob !== "all" || searchQuery.trim() !== "";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${bg}`}>
      <RecruiterNavbar
        toggleSidebar={() => setSidebarOpen((p) => !p)}
        darkMode={isDark}
        toggleDarkMode={toggleTheme}
      />

      <main className="pt-20 sm:pt-24 lg:pt-28 px-4 sm:px-6 lg:px-8 pb-32 sm:pb-20 max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`group flex items-center gap-1.5 mb-6 text-sm font-medium transition-all w-fit ${isDark ? "text-gray-400 hover:text-emerald-400" : "text-gray-500 hover:text-emerald-600"}`}
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        {/* Page header */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">
              <Award size={14} />
              Top Talent
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 ${text}`}>
              Shortlisted Candidates
            </h1>
            <p className={`text-base sm:text-lg ${muted} max-w-2xl`}>
              Review and manage the top tier applicants ready for the next stage.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 sm:mb-10">
          <StatCard index={0} value={candidates.length} label="Total Shortlisted" icon={Star}     isDark={isDark} />
          <StatCard index={1} value={jobs.length}       label="Active Positions" icon={Briefcase} isDark={isDark} />
          <StatCard index={2} value={filtered.length}   label="Showing Result"     icon={Users}     isDark={isDark} />
        </div>

        {/* Search + filter (Sticky on mobile) */}
        <div className={`sticky top-[60px] sm:top-20 z-30 mb-8 transition-shadow duration-300 ${isScrolled ? 'shadow-lg shadow-black/5 -mx-4 px-4 py-3 sm:mx-0 sm:px-0 sm:py-0' : ''} ${isScrolled && isDark ? 'bg-[#0b0f19]/95 backdrop-blur border-b border-gray-800' : isScrolled ? 'bg-slate-50/95 backdrop-blur border-b border-gray-200' : ''}`}>
          <div
            className={`rounded-3xl border p-2 sm:p-4 transition-all duration-300 ${surface}`}
            style={{ boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.03)" }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  placeholder="Search by name, email or position…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-11 pr-10 py-3.5 text-sm sm:text-base font-medium rounded-2xl outline-none transition-all duration-200 ${inputCls}`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isDark ? "hover:bg-gray-700 bg-gray-800" : "hover:bg-gray-200 bg-gray-100"}`}
                  >
                    <X size={14} className={isDark ? "text-gray-300" : "text-gray-600"} />
                  </button>
                )}
              </div>

              <div className="relative sm:w-64">
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className={`w-full appearance-none pl-4 pr-10 py-3.5 text-sm sm:text-base font-medium rounded-2xl outline-none cursor-pointer transition-all duration-200 ${inputCls}`}
                >
                  <option value="all">All positions</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={String(j.id)}>{j.title}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px]">
          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} isDark={isDark} />)}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              className={`rounded-3xl border p-10 text-center shadow-sm ${surface}`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${isDark ? "bg-rose-500/10 border border-rose-500/20" : "bg-rose-50 border border-rose-100"}`}>
                <X size={32} className="text-rose-500" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Something went wrong</h3>
              <p className={`text-sm max-w-md mx-auto ${muted}`}>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-6 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState hasFilter={hasFilter} isDark={isDark} />
          )}

          {/* Candidate cards */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-4 sm:space-y-5">
              {filtered.map((c, i) => (
                <CandidateCard
                  key={c.application_id}
                  candidate={c}
                  index={i}
                  isDark={isDark}
                  onMoveToPending={handleMoveToPending}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ShortlistCandidates;