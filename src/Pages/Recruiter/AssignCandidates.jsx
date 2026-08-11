import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import RecruiterNavbar from "../../Components/Recruiter/RecruiterNavbar";
import { candidateService, jobService } from "../../services";
import { referralService } from "../../services/referralService";
import {
  Briefcase,
  Building,
  Download,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
  UserPlus,
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
        : profile.experience || "",
    education: Array.isArray(profile.education) ? profile.education : [],
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

const AssignCandidates = () => {
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
        map.set(String(item.job.id), item.job.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [assignments]);

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

  const bg = isDark ? "bg-gray-900" : "bg-slate-50";
  const surface = isDark
    ? "bg-gray-800/80 border-gray-700"
    : "bg-white border-gray-100";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const inputCls = isDark
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${bg}`}>
      <RecruiterNavbar toggleSidebar={() => {}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              <UserPlus size={22} />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${textColor}`}>
                Assigned Candidates
              </h1>
              <p className={`text-sm ${textSecondary} mt-1`}>
                Candidates assigned to you by admin with job and profile details.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`rounded-2xl border p-5 ${surface}`}>
            <div className="flex items-center gap-3">
              <Users size={18} className="text-blue-500" />
              <div>
                <p className={`text-2xl font-bold ${textColor}`}>{assignments.length}</p>
                <p className={`text-xs ${textSecondary}`}>Total Assigned</p>
              </div>
            </div>
          </div>
          <div className={`rounded-2xl border p-5 ${surface}`}>
            <div className="flex items-center gap-3">
              <Briefcase size={18} className="text-emerald-500" />
              <div>
                <p className={`text-2xl font-bold ${textColor}`}>{jobOptions.length}</p>
                <p className={`text-xs ${textSecondary}`}>Linked Jobs</p>
              </div>
            </div>
          </div>
          <div className={`rounded-2xl border p-5 ${surface}`}>
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-purple-500" />
              <div>
                <p className={`text-2xl font-bold ${textColor}`}>{filteredAssignments.length}</p>
                <p className={`text-xs ${textSecondary}`}>Showing Results</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 mb-6 ${surface}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate, email, job or company..."
                className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none text-sm ${inputCls}`}
              />
            </div>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className={`sm:w-64 px-4 py-3 rounded-xl border outline-none text-sm ${inputCls}`}
            >
              <option value="all">All jobs</option>
              {jobOptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className={`rounded-2xl border p-12 text-center ${surface}`}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className={textSecondary}>Loading assigned candidates...</p>
          </div>
        ) : error ? (
          <div className={`rounded-2xl border p-8 text-center ${surface}`}>
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className={`rounded-2xl border p-12 text-center ${surface}`}>
            <UserPlus size={40} className={`mx-auto mb-4 ${textSecondary}`} />
            <h3 className={`text-lg font-semibold ${textColor}`}>No assigned candidates yet</h3>
            <p className={`text-sm ${textSecondary} mt-2`}>
              When admin assigns candidates to you, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((item) => (
              <div
                key={item.referralId || `${item.userId}-${item.jobId}`}
                className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                      {item.candidate?.logo ? (
                        <img
                          src={item.candidate.logo}
                          alt={item.candidate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(item.candidate?.name)
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className={`text-lg font-bold ${textColor}`}>
                        {item.candidate?.name || "Unknown Candidate"}
                      </h3>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 text-sm">
                        {item.candidate?.email && (
                          <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                            <Mail size={14} />
                            {item.candidate.email}
                          </span>
                        )}
                        {item.candidate?.phone && (
                          <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                            <Phone size={14} />
                            {item.candidate.phone}
                          </span>
                        )}
                        {item.candidate?.location && (
                          <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                            <MapPin size={14} />
                            {item.candidate.location}
                          </span>
                        )}
                      </div>

                      <div className={`mt-4 rounded-xl border ${borderColor} p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase size={16} className="text-blue-500" />
                          <h4 className={`font-semibold ${textColor}`}>
                            {item.job?.title || "Job not found"}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {item.job?.company && (
                            <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                              <Building size={14} />
                              {item.job.company}
                            </span>
                          )}
                          {item.job?.location && (
                            <span className={`flex items-center gap-1.5 ${textSecondary}`}>
                              <MapPin size={14} />
                              {item.job.location}
                            </span>
                          )}
                          {item.job?.type && (
                            <span className={`${textSecondary}`}>{item.job.type}</span>
                          )}
                        </div>
                      </div>

                      {item.candidate?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.candidate.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[170px]">
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(item)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <Eye size={16} />
                      View Profile
                    </button>
                    {item.candidate?.resumeUrl ? (
                      <a
                        href={item.candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${borderColor} ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                      >
                        <Download size={16} />
                        Download Resume
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${borderColor} opacity-50 cursor-not-allowed`}
                      >
                        <Download size={16} />
                        No Resume
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProfile && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`sticky top-0 flex items-center justify-between p-5 border-b ${borderColor} ${isDark ? "bg-gray-800" : "bg-white"}`}>
              <div>
                <h2 className={`text-xl font-bold ${textColor}`}>Candidate Profile</h2>
                <p className={`text-sm ${textSecondary}`}>
                  Assigned for {selectedProfile.job?.title || "job"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className={`p-2 rounded-lg ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xl font-bold overflow-hidden">
                  {selectedProfile.candidate?.logo ? (
                    <img
                      src={selectedProfile.candidate.logo}
                      alt={selectedProfile.candidate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(selectedProfile.candidate?.name)
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

              <div className={`rounded-xl border ${borderColor} p-4`}>
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

              {selectedProfile.candidate?.experience && (
                <div>
                  <h4 className={`font-semibold mb-2 ${textColor}`}>Experience</h4>
                  <p className={`text-sm ${textSecondary}`}>{selectedProfile.candidate.experience}</p>
                </div>
              )}

              {selectedProfile.candidate?.education?.length > 0 && (
                <div>
                  <h4 className={`font-semibold mb-2 ${textColor}`}>Education</h4>
                  <div className="space-y-2">
                    {selectedProfile.candidate.education.map((edu, index) => (
                      <div
                        key={index}
                        className={`rounded-lg border ${borderColor} p-3 text-sm ${textSecondary}`}
                      >
                        {edu.degree || edu.institution || "Education"}
                        {edu.year ? ` • ${edu.year}` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

            <div className={`sticky bottom-0 flex justify-end gap-3 p-5 border-t ${borderColor} ${isDark ? "bg-gray-800" : "bg-white"}`}>
              {selectedProfile.candidate?.resumeUrl && (
                <a
                  href={selectedProfile.candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Download Resume
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border ${borderColor} ${textColor}`}
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
