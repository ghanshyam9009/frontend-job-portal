/** Whether the job was posted by admin (vs recruiter/employer). */
export const isAdminPostedJob = (job) => {
  const postedBy = (job?.posted_by || job?.postedBy || "")
    .toString()
    .trim()
    .toUpperCase();
  return postedBy === "ADMIN";
};

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

/**
 * Standard plan → recruiter jobs only.
 * Premium plan → admin + recruiter jobs.
 * Manual plan (is_manual_plan) follows the same rules as the assigned plan name.
 */
export const canCandidateApply = (user, job) => {
  const tier = getCandidatePlanTier(user);
  const manualPlan = getCandidateManualPlan(user);

  if (tier === "free") {
    return { allowed: false, reason: "membership_required" };
  }

  if (tier === "standard" && isAdminPostedJob(job)) {
    return {
      allowed: false,
      reason: manualPlan ? "manual_plan_upgrade_required" : "premium_plan_required",
      manualPlan,
      planLabel: getCandidatePlanLabel(user),
    };
  }

  return {
    allowed: true,
    route: isAdminPostedJob(job) ? "admin" : "recruiter",
    manualPlan,
    planLabel: getCandidatePlanLabel(user),
  };
};
