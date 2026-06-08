import { isAdminPostedJob } from "./jobApplicationRules";

const titleCase = (value) =>
  String(value)
    .trim()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const getRecruiterNameFromJob = (job) => {
  const candidates = [
    job?.recruiter_name,
    job?.recruiter_full_name,
    job?.employer_name,
    job?.employer_full_name,
    job?.posted_by_name,
    job?.recruiter?.full_name,
    job?.recruiter?.name,
    job?.employer?.full_name,
    job?.employer?.name,
  ];

  for (const name of candidates) {
    if (name != null && String(name).trim()) {
      return String(name).trim();
    }
  }

  return null;
};

/** Display label for "Posted by …" — Admin stays Admin; recruiter jobs show recruiter name. */
export const getJobPostedByDisplayLabel = (job) => {
  if (!job) return null;

  if (isAdminPostedJob(job)) {
    return "Admin";
  }

  const recruiterName = getRecruiterNameFromJob(job);
  if (recruiterName) {
    return recruiterName;
  }

  const postedBy = (job?.posted_by || job?.postedBy || "").toString().trim();
  if (!postedBy) return null;

  const postedByKey = postedBy.toUpperCase();
  if (postedByKey === "RECRUITER" || postedByKey === "EMPLOYER") {
    return "Recruiter";
  }

  return titleCase(postedBy);
};
