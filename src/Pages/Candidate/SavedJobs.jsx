import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import CandidateNavbar from "../../Components/Candidate/CandidateNavbar";
import JobCard from "../../Components/Shared/JobCard";
import { candidateExternalService } from "../../services";
import { toast } from "react-toastify";
import {
  Briefcase,
  Bookmark,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const JOBS_PER_PAGE = 6;

const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const userId = user?.user_id || user?.id || "";
    if (!userId) return;

    const fetchSaved = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await candidateExternalService.getBookmarkedJobs(userId);
        const jobsArray = data?.bookmarked_jobs || data?.jobs || [];
        const normalizedJobs = Array.isArray(jobsArray) ? jobsArray : [jobsArray];

        const mapped = normalizedJobs
          .filter(Boolean)
          .map((j, idx) => ({
            ...j,
            job_id: j.job_id || j.id || idx,
            id: j.job_id || j.id || idx,
            job_title: j.job_title || j.title || "",
            company_name: j.company_name || j.company || "",
            location: j.location || "",
            employment_type: j.employment_type || j.type || "",
            salary_range: j.salary_range ?? j.salary_field ?? null,
            is_premium: j.premium_job === true || j.premium_job === "true" || j.is_premium === true,
            premium_job: j.premium_job ?? j.is_premium ?? false,
            saved_at: j.saved_at || j.bookmarked_at || "",
          }));

        setSavedJobs(mapped);
      } catch (e) {
        setError(typeof e === "string" ? e : e?.message || "Failed to load saved jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]);

  const filteredJobs = savedJobs.filter((job) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (job.job_title || "").toLowerCase().includes(q) ||
      (job.company_name || "").toLowerCase().includes(q) ||
      (job.location || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * JOBS_PER_PAGE;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleRemoveSaved = async (jobId) => {
    if (!user) {
      toast.error("Please log in to remove bookmarks.");
      return;
    }

    try {
      const userId = user.user_id || user.id;
      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        return;
      }

      await candidateExternalService.removeBookmark({
        user_id: userId,
        job_ids: [jobId],
      });

      setSavedJobs((prev) => {
        const next = prev.filter((job) => (job.job_id || job.id) !== jobId);
        const nextFiltered = next.filter((job) => {
          if (!searchTerm.trim()) return true;
          const q = searchTerm.toLowerCase();
          return (
            (job.job_title || "").toLowerCase().includes(q) ||
            (job.company_name || "").toLowerCase().includes(q) ||
            (job.location || "").toLowerCase().includes(q)
          );
        });
        const nextTotalPages = Math.max(1, Math.ceil(nextFiltered.length / JOBS_PER_PAGE));
        if (currentPage > nextTotalPages) {
          setCurrentPage(nextTotalPages);
        }
        return next;
      });
      toast.success("Job removed from bookmarks");
    } catch (err) {
      console.error("Error removing bookmark:", err);
      toast.error("Failed to remove bookmark. Please try again.");
    }
  };

  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-gray-950" : "bg-slate-50";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-slate-50" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-600";
  const borderColor = isDark ? "border-slate-700/60" : "border-slate-200";
  const accentBg = isDark ? "bg-blue-500/15" : "bg-blue-50";

  return (
    <div className={`min-h-screen ${bgColor} ${isDark ? "" : "bg-gradient-to-b from-blue-50/30 to-transparent"}`}>
      <CandidateNavbar darkMode={isDark} toggleDarkMode={toggleTheme} />

      <main className="pt-24 sm:pt-26 px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-6 sm:mb-7">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${accentBg} flex items-center justify-center ring-1 ring-blue-500/10`}
              >
                <Bookmark className="text-blue-600 dark:text-blue-400" size={22} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${textColor}`}>
                  Saved Jobs
                </h1>
                <p className={`${textSecondary} text-sm mt-0.5`}>
                  {loading
                    ? "Loading your bookmarks…"
                    : savedJobs.length > 0
                      ? `${savedJobs.length} bookmarked ${savedJobs.length === 1 ? "job" : "jobs"}`
                      : "Your bookmarked job opportunities"}
                </p>
              </div>
            </div>
          </header>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-200 dark:border-blue-500/30 border-t-blue-600 mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bookmark className="text-blue-600" size={18} />
                  </div>
                </div>
                <p className={`text-sm font-medium ${textSecondary}`}>Loading saved jobs…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div
              className={`${cardBg} border border-red-200 dark:border-red-900/50 rounded-xl p-6 sm:p-8 text-center shadow-sm`}
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <h3 className={`text-base font-bold ${textColor} mb-1`}>Couldn&apos;t load saved jobs</h3>
              <p className={`${textSecondary} text-sm mb-4`}>{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Search — show when user has saved jobs */}
          {!loading && !error && savedJobs.length > 0 && (
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search
                  size={16}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${textSecondary}`}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search title, company, location…"
                  className={`w-full pl-9 pr-3 py-2 text-sm border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${cardBg} ${textColor}`}
                />
              </div>
            </div>
          )}

          {/* Empty search results */}
          {!loading && !error && savedJobs.length > 0 && filteredJobs.length === 0 && (
            <div className={`${cardBg} border ${borderColor} rounded-xl p-6 text-center shadow-sm`}>
              <p className={`text-sm ${textSecondary} mb-3`}>
                No jobs match &quot;{searchTerm}&quot;
              </p>
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Clear search
              </button>
            </div>
          )}

          {!loading && !error && savedJobs.length === 0 && (
            <div className={`${cardBg} border ${borderColor} rounded-xl p-8 sm:p-10 text-center shadow-sm`}>
              <div
                className={`w-16 h-16 ${accentBg} rounded-xl flex items-center justify-center mx-auto mb-4 ring-1 ring-blue-500/10`}
              >
                <Bookmark size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className={`text-lg font-bold ${textColor} mb-1.5`}>No saved jobs yet</h3>
              <p className={`${textSecondary} text-sm mb-5 max-w-sm mx-auto`}>
                Bookmark jobs you&apos;re interested in and they&apos;ll show up here.
              </p>
              <button
                type="button"
                onClick={() => navigate("/userjoblistings")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Briefcase size={16} />
                Browse jobs
              </button>
            </div>
          )}

          {/* Jobs grid */}
          {!loading && !error && filteredJobs.length > 0 && (
            <>
              {filteredJobs.length > JOBS_PER_PAGE && (
                <p className={`text-xs ${textSecondary} mb-3`}>
                  Showing {startIndex + 1}–{Math.min(startIndex + JOBS_PER_PAGE, filteredJobs.length)} of{" "}
                  {filteredJobs.length} jobs
                  {searchTerm.trim() ? ` (filtered from ${savedJobs.length})` : ""}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {paginatedJobs.map((job) => {
                const jobId = job.job_id || job.id;
                const savedLabel = job.saved_at ? getRelativeTime(job.saved_at) : "";

                return (
                  <div key={jobId} className="flex flex-col gap-1">
                    {savedLabel && (
                      <p className={`text-[11px] font-medium ${textSecondary} px-0.5`}>
                        Saved {savedLabel}
                      </p>
                    )}
                    <JobCard
                      job={job}
                      isDark={isDark}
                      isBookmarked
                      onBookmark={handleRemoveSaved}
                      showBookmark
                    />
                  </div>
                );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      safePage === 1
                        ? "opacity-40 cursor-not-allowed border-transparent"
                        : `${borderColor} ${textColor} hover:bg-slate-100 dark:hover:bg-slate-800`
                    }`}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span className={`text-xs sm:text-sm ${textSecondary} px-2`}>
                    Page {safePage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      safePage === totalPages
                        ? "opacity-40 cursor-not-allowed border-transparent"
                        : `${borderColor} ${textColor} hover:bg-slate-100 dark:hover:bg-slate-800`
                    }`}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedJobs;
