/** Application count from admin-jobs / recruiter-jobs list API */
export const getJobApplicationCount = (job) =>
  job?.applications_count ??
  job?.application_count ??
  (Array.isArray(job?.applications) ? job.applications.length : 0);

/** Navigation state for Application Report page */
export const buildApplicationsNavState = (job) => ({
  jobTitle: job?.job_title || "Job",
  companyName: job?.company_name || job?.posted_company_name || "",
  location: job?.location || "",
  postedDate: job?.created_at || "",
  applications: Array.isArray(job?.applications) ? job.applications : [],
  applicationsPreloaded: Array.isArray(job?.applications),
});

export const enrichApplicationForAdminReport = (app) => {
  const needsApproval =
    app.needs_approval ??
    (String(app.status_verified || "").toLowerCase() === "notverified" ||
      (String(app.status || "").toLowerCase() === "pending" &&
        app.to_show_recruiter === false));

  return {
    ...app,
    needs_approval: Boolean(needsApproval),
    student_details: {
      name: app.student_name || app.student_profile?.full_name || "Unknown",
      email: app.student_email || app.email || app.student_profile?.email || null,
      phone:
        app.student_phone ||
        app.student_profile?.phone_number ||
        null,
      skills: app.student_skills
        ? typeof app.student_skills === "string"
          ? app.student_skills.split(",").map((s) => s.trim()).filter(Boolean)
          : Array.isArray(app.student_skills)
            ? app.student_skills
            : []
        : app.student_profile?.skills
          ? typeof app.student_profile.skills === "string"
            ? app.student_profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : []
          : [],
      location:
        app.student_location ||
        (app.student_profile?.address?.city
          ? `${app.student_profile.address.city}${app.student_profile.address.country ? `, ${app.student_profile.address.country}` : ""}`
          : null),
      experience:
        app.student_experience ||
        app.student_profile?.experienceLevel ||
        app.student_profile?.experience ||
        null,
      education: app.student_university
        ? [app.student_university]
        : app.student_profile?.education || [],
      experience_years: app.student_experience_years || null,
      bio: app.student_bio || app.student_profile?.bio || null,
      resumeUrl:
        app.resume_url ||
        app.student_profile?.resume ||
        app.student_profile?.resumeUrl ||
        null,
      department: app.student_department || null,
      cgpa: app.student_cgpa || null,
      logo:
        app.student_profile?.logo ||
        app.student_profile?.profile_image ||
        null,
      premium_user: app.student_profile?.premium_user || false,
      plan: app.student_profile?.plan || null,
    },
  };
};

export const enrichApplicationsList = (applications) =>
  (Array.isArray(applications) ? applications : []).map(enrichApplicationForAdminReport);
