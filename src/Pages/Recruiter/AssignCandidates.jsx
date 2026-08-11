import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import { candidateService, jobService } from "../../services";
import { referralService } from "../../services/referralService";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Download,
  ExternalLink,
  Eye,
  Filter,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) return skills.filter(Boolean);
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeCandidate = (raw = {}) => {
  const profile = raw.student || raw.profile || raw.data || raw;
  const education = Array.isArray(profile.education) ? profile.education : [];
  const qualification =
    education[0]?.degree ||
    education[0]?.institution ||
    profile.qualification ||
    "";

  return {
    id: profile.user_id || profile.student_id || profile.id || null,
    name: profile.full_name || profile.name || "Unknown Candidate",
    email: profile.email || "",
    phone: profile.phone_number || profile.phone || "",
    location:
      profile.address?.city ||
      profile.city ||
      profile.location ||
      "",
    bio: profile.bio || "",
    skills: normalizeSkills(profile.skills),
    experience:
      profile.experience_years != null
        ? `${profile.experience_years} years`
        : profile.experience || profile.experienceLevel || "",
    qualification,
    education,
    resumeUrl:
      profile.resume ||
      profile.resumeUrl ||
      profile.resume_url ||
      null,
    logo:
      profile.logo ||
      profile.profile_picture_url ||
      profile.profile_image ||
      null,
  };
};

const normalizeJob = (raw = {}) => {
  const job = raw.job || raw.data || raw;
  return {
    id: job.job_id || job.id || null,
    title: job.job_title || job.title || "Untitled Job",
    company: job.company_name || job.company || "",
    location:
      job.location ||
      (Array.isArray(job.locations) ? job.locations.join(", ") : ""),
    type: job.employment_type || job.job_type || "",
    status: job.status || job.job_status || "",
    description: job.job_description || job.description || "",
  };
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const AssignCandidates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState(null);

  const recruiterId =
    user?.employer_id ||
    user?.recruiter_id ||
    user?.id ||
    null;

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!recruiterId) {
        setError("Recruiter ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const referrals = await referralService.getReferralsByRecruiterId(recruiterId);

        const enriched = await Promise.all(
          referrals.map(async (referral) => {
            const referralId =
              referral.referralId ||
              referral.referral_id ||
              referral.id;
            const userId = referral.userId || referral.user_id;
            const jobId = referral.jobId || referral.job_id;

            let candidate = null;
            let job = null;

            const tasks = [];

            if (userId) {
              tasks.push(
                candidateService
                  .getCandidateById(userId)
                  .then((response) => {
                    candidate = normalizeCandidate(response);
                  })
                  .catch(() => {
                    candidate = {
                      id: userId,
                      name: "Unknown Candidate",
                      email: "",
                      phone: "",
                      location: "",
                      bio: "",
                      skills: [],
                      experience: "",
                      qualification: "",
                      education: [],
                      resumeUrl: null,
                      logo: null,
                    };
                  })
              );
            }

            if (jobId) {
              tasks.push(
                jobService
                  .getJobById(jobId)
                  .then((response) => {
                    job = normalizeJob(response);
                  })
                  .catch(() => {
                    job = {
                      id: jobId,
                      title: "Unknown Job",
                      company: "",
                      location: "",
                      type: "",
                      status: "",
                      description: "",
                    };
                  })
              );
            }

            await Promise.all(tasks);

            return {
              referralId,
              userId,
              jobId,
              assignedAt: referral.createdAt || referral.created_at || "",
              recruiterId:
                referral.targetRecruiterId ||
                referral.recruiterId ||
                referral.recruiter_id ||
                recruiterId,
              candidate,
              job,
              raw: referral,
            };
          })
        );

        setAssignments(enriched);
      } catch (err) {
        console.error("Failed to load assigned candidates:", err);
        setError(
          typeof err === "string"
            ? err
            : err?.message || "Failed to load assigned candidates."
        );
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [recruiterId]);

  const jobOptions = useMemo(() => {
    const map = new Map();
    assignments.forEach((item) => {
      if (item.job?.id) {
        const key = String(item.job.id);
        const existing = map.get(key);
        map.set(key, {
          id: key,
          title: item.job.title,
          count: (existing?.count || 0) + 1,
        });
      }
    });
    return Array.from(map.values());
  }, [assignments]);

  const stats = useMemo(() => {
    return {
      total: assignments.length,
      jobs: jobOptions.length,
    };
  }, [assignments, jobOptions.length]);

  const filteredAssignments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return assignments.filter((item) => {
      const jobMatch =
        selectedJob === "all" || String(item.jobId) === selectedJob;
      const textMatch =
        !query ||
        item.candidate?.name?.toLowerCase().includes(query) ||
        item.candidate?.email?.toLowerCase().includes(query) ||
        item.job?.title?.toLowerCase().includes(query) ||
        item.job?.company?.toLowerCase().includes(query);
      return jobMatch && textMatch;
    });
  }, [assignments, searchQuery, selectedJob]);

  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";

  const hasActiveFilters = selectedJob !== "all" || searchQuery.trim() !== "";

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <RecruiterNavbar toggleSidebar={() => {}} />

      <div className={`${cardBg} border-b ${borderColor} mt-20 sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/recruiter/dashboard")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className={textColor} />
              </button>
              <div className="flex-1">
                <h1 className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                  Assigned Candidates
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Candidates assigned to you by admin
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className={`px-4 py-2 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                <div className="flex items-center gap-2">
                  <Users size={16} className={textSecondary} />
                  <span className={`text-sm font-semibold ${textColor}`}>{stats.total}</span>
                  <span className={`text-xs ${textSecondary}`}>Total</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    {stats.jobs}
                  </span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-500">Jobs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-72 flex-shrink-0">
            <div className={`${cardBg} rounded-lg border ${borderColor} p-5 lg:sticky lg:top-24`}>
              <h2 className={`text-lg font-bold ${textColor} mb-4 flex items-center gap-2`}>
                <Filter size={20} />
                Filters
              </h2>

              <div className="mb-6">
                <label className={`block text-sm font-semibold ${textColor} mb-2`}>
                  Search Candidates
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name or email..."
                    className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${cardBg} ${textColor}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${textColor} mb-3`}>
                  Assigned Jobs
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJob("all")}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedJob === "all"
                        ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"
                        : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>All</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                        {stats.total}
                      </span>
                    </div>
                  </button>

                  {jobOptions.map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setSelectedJob(job.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedJob === job.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"
                          : `${cardBg} ${textColor} border ${borderColor} hover:bg-gray-50 dark:hover:bg-gray-700`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{job.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                          {job.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <p className={`text-sm ${textSecondary}`}>
                Showing{" "}
                <span className={`font-semibold ${textColor}`}>
                  {filteredAssignments.length}
                </span>{" "}
                {filteredAssignments.length === 1 ? "candidate" : "candidates"}
              </p>
            </div>

            {loading && (
              <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
                <div className="relative mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-blue-500 mx-auto" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Users className="text-blue-500" size={24} />
                  </div>
                </div>
                <h3 className={`text-lg font-bold ${textColor}`}>Loading assigned candidates...</h3>
                <p className={`${textSecondary} mt-2`}>Please wait</p>
              </div>
            )}

            {error && !loading && (
              <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="text-red-500" size={32} />
                </div>
                <h3 className="text-lg font-bold text-red-500 mb-2">
                  Failed to Load Assigned Candidates
                </h3>
                <p className={textSecondary}>{error}</p>
              </div>
            )}

            {!loading && !error && filteredAssignments.length === 0 && (
              <div className={`${cardBg} rounded-lg border ${borderColor} p-12 text-center`}>
                <div className={`w-16 h-16 ${isDark ? "bg-blue-500/20" : "bg-blue-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Users size={32} className="text-blue-500" />
                </div>
                <h3 className={`text-lg font-semibold ${textColor} mb-2`}>
                  No assigned candidates found
                </h3>
                <p className={`${textSecondary} mb-6`}>
                  {hasActiveFilters
                    ? "Try adjusting your filters or search query"
                    : "When admin assigns candidates to you, they will appear here."}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJob("all");
                      setSearchQuery("");
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {!loading && !error && filteredAssignments.length > 0 && (
              <div className="space-y-2.5">
                {filteredAssignments.map((item) => (
                  <div
                    key={item.referralId || `${item.userId}-${item.jobId}`}
                    className={`${cardBg} border ${borderColor} rounded-lg p-2.5 hover:border-blue-300 dark:hover:border-blue-500 transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                          {item.candidate?.logo ? (
                            <img
                              src={item.candidate.logo}
                              alt={item.candidate.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                              {getInitials(item.candidate?.name)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-bold ${textColor} truncate leading-tight`}>
                            {item.candidate?.name || "Unknown Candidate"}
                          </h4>
                          <p className={`text-xs ${textSecondary} truncate`} style={{ fontSize: "0.7rem" }}>
                            {item.candidate?.email || "No email"}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className={`text-xs ${textSecondary}`} style={{ fontSize: "0.65rem" }}>
                              Assigned {formatDate(item.assignedAt)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30" style={{ fontSize: "0.65rem" }}>
                              Assigned
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`${isDark ? "bg-gray-700/50" : "bg-gray-50"} rounded-lg p-2 mb-2 border ${borderColor}`}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: "0.7rem" }}>
                            <Briefcase size={12} />
                            Assigned Job
                          </h5>
                          <p className={`text-xs ${textSecondary}`} style={{ fontSize: "0.7rem" }}>
                            {item.job?.title || "Job not found"}
                          </p>
                          {item.job?.company && (
                            <p className={`text-xs ${textSecondary} flex items-center gap-1 mt-0.5`} style={{ fontSize: "0.65rem" }}>
                              <Building size={11} />
                              {item.job.company}
                            </p>
                          )}
                        </div>

                        <div>
                          <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: "0.7rem" }}>
                            <GraduationCap size={12} />
                            Qualification
                          </h5>
                          <p className={`text-xs ${textSecondary}`} style={{ fontSize: "0.7rem" }}>
                            {item.candidate?.qualification || "Not provided"}
                          </p>
                        </div>

                        <div>
                          <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: "0.7rem" }}>
                            <Briefcase size={12} />
                            Experience
                          </h5>
                          <p className={`text-xs ${textSecondary}`} style={{ fontSize: "0.7rem" }}>
                            {item.candidate?.experience || "Not provided"}
                          </p>
                        </div>

                        <div>
                          <h5 className={`text-xs font-semibold ${textColor} mb-0.5 flex items-center gap-1`} style={{ fontSize: "0.7rem" }}>
                            <Phone size={12} />
                            Contact Number
                          </h5>
                          <p className={`text-xs ${textSecondary}`} style={{ fontSize: "0.7rem" }}>
                            {item.candidate?.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(item)}
                        className={`px-2.5 py-1 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        <Eye size={12} />
                        View Profile
                      </button>
                      {item.candidate?.resumeUrl ? (
                        <a
                          href={item.candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-2.5 py-1 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          <ExternalLink size={12} />
                          Resume
                        </a>
                      ) : (
                        <span
                          className={`px-2.5 py-1 border ${borderColor} ${textSecondary} rounded-lg text-xs font-medium flex items-center gap-1 opacity-60`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          <Download size={12} />
                          No Resume
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProfile && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className={`${cardBg} rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 flex items-center justify-between p-5 border-b ${borderColor} ${cardBg} z-10`}>
              <div>
                <h2 className={`text-xl font-bold ${textColor}`}>Candidate Profile</h2>
                <p className={`text-sm ${textSecondary}`}>
                  Assigned for {selectedProfile.job?.title || "job"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className={`${textSecondary} hover:text-red-500 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded`}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                  {selectedProfile.candidate?.logo ? (
                    <img
                      src={selectedProfile.candidate.logo}
                      alt={selectedProfile.candidate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                      {getInitials(selectedProfile.candidate?.name)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${textColor}`}>
                    {selectedProfile.candidate?.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    {selectedProfile.candidate?.email && (
                      <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                        <Mail size={15} />
                        {selectedProfile.candidate.email}
                      </span>
                    )}
                    {selectedProfile.candidate?.phone && (
                      <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                        <Phone size={15} />
                        {selectedProfile.candidate.phone}
                      </span>
                    )}
                    {selectedProfile.candidate?.location && (
                      <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                        <MapPin size={15} />
                        {selectedProfile.candidate.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedProfile.candidate?.bio && (
                <div>
                  <h4 className={`font-semibold mb-2 ${textColor}`}>About</h4>
                  <p className={`text-sm leading-relaxed ${textSecondary}`}>
                    {selectedProfile.candidate.bio}
                  </p>
                </div>
              )}

              <div className={`rounded-lg border ${borderColor} p-4`}>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${textColor}`}>
                  <Briefcase size={18} className="text-blue-500" />
                  Assigned Job
                </h4>
                <p className={`font-medium ${textColor}`}>{selectedProfile.job?.title}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  {selectedProfile.job?.company && (
                    <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                      <Building size={14} />
                      {selectedProfile.job.company}
                    </span>
                  )}
                  {selectedProfile.job?.location && (
                    <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                      <MapPin size={14} />
                      {selectedProfile.job.location}
                    </span>
                  )}
                </div>
                {selectedProfile.job?.description && (
                  <p className={`text-sm mt-3 leading-relaxed ${textSecondary}`}>
                    {selectedProfile.job.description}
                  </p>
                )}
              </div>

              {selectedProfile.candidate?.skills?.length > 0 && (
                <div>
                  <h4 className={`font-semibold mb-2 ${textColor}`}>Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={`sticky bottom-0 flex justify-end gap-3 p-5 border-t ${borderColor} ${cardBg}`}>
              {selectedProfile.candidate?.resumeUrl && (
                <a
                  href={selectedProfile.candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Download Resume
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className={`px-5 py-2.5 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignCandidates;
