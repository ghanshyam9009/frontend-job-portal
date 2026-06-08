/** Whether the job was posted by admin (vs recruiter/employer). */
export const isAdminPostedJob = (job) => {
  const postedBy = (job?.posted_by || job?.postedBy || "")
    .toString()
    .trim()
    .toUpperCase();
  return postedBy === "ADMIN";
};

/** Whether the job is marked as premium (premium_job / is_premium). */
export const isPremiumJob = (job) =>
  Boolean(job?.is_premium || job?.premium_job);

/** Admin-assigned manual plan from Free Referral (e.g. "basic", "premium"). */
export const getCandidateManualPlan = (user) => {
  const manual = user?.is_manual_plan;
  if (manual == null || manual === "") return null;
  return String(manual).trim().toLowerCase();
};

export const hasCandidateManualPlan = (user) => Boolean(getCandidateManualPlan(user));

/** Display label for the candidate's active plan name. */
export const getCandidatePlanLabel = (user) => {
  const manual = getCandidateManualPlan(user);
  if (manual) {
    return manual.charAt(0).toUpperCase() + manual.slice(1);
  }

  const raw = String(
    user?.plan_name || user?.plan_id || user?.plan || user?.membership_type || ""
  ).trim();
  if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1);
  return null;
};

const mapPlanNameToTier = (raw) => {
  const plan = String(raw || "").trim().toLowerCase();
  if (!plan) return "free";

  if (
    plan === "premium" ||
    plan.includes("premium") ||
    ["gold", "platinum"].includes(plan)
  ) {
    return "premium";
  }

  if (plan === "standard" || plan === "basic" || plan === "silver") {
    return "standard";
  }

  return "standard";
};

/** Candidate membership tier from auth user / profile fields. */
export const getCandidatePlanTier = (user) => {
  if (!user) return "free";

  const manualPlan = getCandidateManualPlan(user);
  if (manualPlan) {
    return mapPlanNameToTier(manualPlan);
  }

  const isPaid =
    user.premium_user === true ||
    user.premium_user === "true" ||
    user.is_premium === true ||
    user.is_premium === "true";

  if (!isPaid) return "free";

  return mapPlanNameToTier(
    user.plan_id || user.plan || user.membership_type || ""
  );
};

const buildEligibility = (allowed, reason, user, job, extra = {}) => ({
  allowed,
  reason,
  manualPlan: getCandidateManualPlan(user),
  planLabel: getCandidatePlanLabel(user),
  isPremiumJob: isPremiumJob(job),
  route: isAdminPostedJob(job) ? "admin" : "recruiter",
  ...extra,
});

/**
 * Manual referral plan (is_manual_plan):
 *   basic  → basic (non-premium) jobs only
 *   premium → premium jobs bhi apply kar sakta hai
 *
 * Paid membership (no manual plan):
 *   standard → recruiter jobs only
 *   premium  → admin + recruiter jobs
 */
export const canCandidateApply = (user, job) => {
  const manualPlan = getCandidateManualPlan(user);
  const planLabel = getCandidatePlanLabel(user);
  const jobIsPremium = isPremiumJob(job);

  if (manualPlan) {
    const tier = mapPlanNameToTier(manualPlan);

    if (tier === "standard" && jobIsPremium) {
      return buildEligibility(false, "manual_premium_job_required", user, job);
    }

    return buildEligibility(true, null, user, job);
  }

  const tier = getCandidatePlanTier(user);

  if (tier === "free") {
    return buildEligibility(false, "membership_required", user, job);
  }

  if (tier === "standard" && isAdminPostedJob(job)) {
    return buildEligibility(false, "premium_plan_required", user, job);
  }

  return buildEligibility(true, null, user, job);
};
