/** Whether the job was posted by admin (vs recruiter/employer). */
export const isAdminPostedJob = (job) => {
  const postedBy = (job?.posted_by || job?.postedBy || "")
    .toString()
    .trim()
    .toUpperCase();
  return postedBy === "ADMIN";
};

/** Candidate membership tier from auth user / profile fields. */
export const getCandidatePlanTier = (user) => {
  if (!user) return "free";

  const isPaid =
    user.premium_user === true ||
    user.premium_user === "true" ||
    user.is_premium === true ||
    user.is_premium === "true";

  if (!isPaid) return "free";

  const raw = String(
    user.plan_id || user.plan || user.membership_type || ""
  )
    .trim()
    .toLowerCase();

  if (!raw) return "premium";

  if (
    raw === "premium" ||
    raw.includes("premium") ||
    ["gold", "platinum"].includes(raw)
  ) {
    return "premium";
  }

  if (raw === "standard" || raw === "basic" || raw === "silver") {
    return "standard";
  }

  return "standard";
};

/**
 * Standard plan → recruiter jobs only.
 * Premium plan → admin + recruiter jobs.
 */
export const canCandidateApply = (user, job) => {
  const tier = getCandidatePlanTier(user);

  if (tier === "free") {
    return { allowed: false, reason: "membership_required" };
  }

  if (tier === "standard" && isAdminPostedJob(job)) {
    return { allowed: false, reason: "premium_plan_required" };
  }

  return {
    allowed: true,
    route: isAdminPostedJob(job) ? "admin" : "recruiter",
  };
};
