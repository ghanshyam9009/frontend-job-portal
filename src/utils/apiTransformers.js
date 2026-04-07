// API Response Transformers - Centralized data mapping for consistent frontend data

/**
 * Transform job data from API response to frontend format
 */
export const transformJob = (job) => {
  if (!job) return null;
  
  return {
    id: job.job_id || job.id || job._id,
    title: job.job_title || job.title || '',
    company: job.company_name || job.company || '',
    companyLogo: job.company_logo || job.companyLogo || job.logo || null,
    location: job.location || job.job_location || '',
    employmentType: job.employment_type || job.employmentType || job.type || 'Full-time',
    salary: transformSalary(job.salary_range || job.salary || job.salaryRange),
    experience: transformExperience(job.experience_required || job.experience),
    description: job.description || job.job_description || '',
    requirements: job.requirements || job.job_requirements || [],
    skills: job.skills || job.required_skills || [],
    benefits: job.benefits || [],
    category: job.category || job.job_category || '',
    postedAt: job.created_at || job.createdAt || job.posted_at || null,
    updatedAt: job.updated_at || job.updatedAt || null,
    deadline: job.application_deadline || job.deadline || null,
    status: job.status || job.job_status || 'active',
    isPremium: job.is_premium || job.isPremium || false,
    isGovernment: job.is_government || job.isGovernment || false,
    vacancies: job.vacancies || job.openings || 1,
    applicationsCount: job.applications_count || job.applicationsCount || 0,
    employerId: job.employer_id || job.employerId || job.recruiter_id || null,
    slug: job.slug || job.job_slug || null,
    // Keep original data for any unmapped fields
    _original: job
  };
};

/**
 * Transform array of jobs
 */
export const transformJobs = (jobs) => {
  if (!Array.isArray(jobs)) return [];
  return jobs.map(transformJob).filter(Boolean);
};

/**
 * Transform salary data
 */
export const transformSalary = (salary) => {
  if (!salary) return { min: null, max: null, display: 'Not Disclosed' };
  
  // If salary is already an object
  if (typeof salary === 'object') {
    const min = salary.min || salary.min_salary || salary.minSalary || null;
    const max = salary.max || salary.max_salary || salary.maxSalary || null;
    return {
      min,
      max,
      currency: salary.currency || '₹',
      display: formatSalaryDisplay(min, max, salary.currency)
    };
  }
  
  // If salary is a string
  if (typeof salary === 'string') {
    return { min: null, max: null, display: salary };
  }
  
  return { min: null, max: null, display: 'Not Disclosed' };
};

/**
 * Transform experience data
 */
export const transformExperience = (experience) => {
  if (!experience) return { min: 0, max: null, display: 'Not specified' };
  
  if (typeof experience === 'object') {
    const min = experience.min || experience.min_years || experience.minYears || 0;
    const max = experience.max || experience.max_years || experience.maxYears || null;
    return {
      min,
      max,
      display: formatExperienceDisplay(min, max)
    };
  }
  
  if (typeof experience === 'number') {
    return { min: experience, max: null, display: `${experience}+ years` };
  }
  
  if (typeof experience === 'string') {
    return { min: 0, max: null, display: experience };
  }
  
  return { min: 0, max: null, display: 'Not specified' };
};

/**
 * Transform user/candidate data
 */
export const transformCandidate = (candidate) => {
  if (!candidate) return null;
  
  return {
    id: candidate.student_id || candidate.candidate_id || candidate.id || candidate._id,
    email: candidate.email || '',
    name: candidate.name || candidate.full_name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim(),
    firstName: candidate.first_name || candidate.firstName || '',
    lastName: candidate.last_name || candidate.lastName || '',
    phone: candidate.phone || candidate.mobile || candidate.contact_number || '',
    profileImage: candidate.profile_image || candidate.profileImage || candidate.avatar || null,
    resume: candidate.resume || candidate.resume_url || candidate.resumeUrl || null,
    skills: candidate.skills || [],
    experience: candidate.experience || candidate.total_experience || null,
    education: candidate.education || [],
    location: candidate.location || candidate.city || '',
    about: candidate.about || candidate.bio || candidate.summary || '',
    status: candidate.status || 'active',
    isPremium: candidate.is_premium || candidate.isPremium || false,
    createdAt: candidate.created_at || candidate.createdAt || null,
    _original: candidate
  };
};

/**
 * Transform recruiter data
 */
export const transformRecruiter = (recruiter) => {
  if (!recruiter) return null;
  
  return {
    id: recruiter.recruiter_id || recruiter.employer_id || recruiter.id || recruiter._id,
    email: recruiter.email || '',
    name: recruiter.name || recruiter.company_name || '',
    companyName: recruiter.company_name || recruiter.companyName || '',
    companyLogo: recruiter.company_logo || recruiter.companyLogo || recruiter.logo || null,
    phone: recruiter.phone || recruiter.contact_number || '',
    website: recruiter.website || recruiter.company_website || '',
    industry: recruiter.industry || '',
    companySize: recruiter.company_size || recruiter.companySize || '',
    location: recruiter.location || recruiter.company_location || '',
    about: recruiter.about || recruiter.company_description || '',
    status: recruiter.status || 'pending',
    isApproved: recruiter.is_approved || recruiter.isApproved || recruiter.status === 'approved',
    createdAt: recruiter.created_at || recruiter.createdAt || null,
    _original: recruiter
  };
};

/**
 * Transform application data
 */
export const transformApplication = (application) => {
  if (!application) return null;
  
  return {
    id: application.application_id || application.id || application._id,
    jobId: application.job_id || application.jobId,
    candidateId: application.student_id || application.candidate_id || application.candidateId,
    status: application.status || application.application_status || 'pending',
    appliedAt: application.applied_at || application.createdAt || application.created_at,
    updatedAt: application.updated_at || application.updatedAt,
    coverLetter: application.cover_letter || application.coverLetter || '',
    resume: application.resume || application.resume_url || null,
    notes: application.notes || application.recruiter_notes || '',
    // Include nested data if available
    job: application.job ? transformJob(application.job) : null,
    candidate: application.candidate || application.student ? 
      transformCandidate(application.candidate || application.student) : null,
    _original: application
  };
};

/**
 * Transform applications array
 */
export const transformApplications = (applications) => {
  if (!Array.isArray(applications)) return [];
  return applications.map(transformApplication).filter(Boolean);
};

/**
 * Transform saved/bookmarked job
 */
export const transformSavedJob = (savedJob) => {
  if (!savedJob) return null;
  
  return {
    id: savedJob.bookmark_id || savedJob.id || savedJob._id,
    jobId: savedJob.job_id || savedJob.jobId,
    userId: savedJob.user_id || savedJob.student_id || savedJob.userId,
    savedAt: savedJob.created_at || savedJob.createdAt || savedJob.saved_at,
    job: savedJob.job ? transformJob(savedJob.job) : null,
    _original: savedJob
  };
};

/**
 * Transform API list response with pagination
 */
export const transformPaginatedResponse = (response, transformer) => {
  if (!response) return { data: [], pagination: null };
  
  // Handle different API response structures
  const data = response.data || response.results || response.items || response;
  const pagination = response.pagination || response.meta || {
    total: response.total || response.totalCount || (Array.isArray(data) ? data.length : 0),
    page: response.page || response.currentPage || 1,
    pageSize: response.pageSize || response.limit || response.per_page || 10,
    totalPages: response.totalPages || response.total_pages || 1
  };
  
  return {
    data: Array.isArray(data) ? data.map(transformer).filter(Boolean) : [],
    pagination
  };
};

// Helper functions
function formatSalaryDisplay(min, max, currency = '₹') {
  if (!min && !max) return 'Not Disclosed';
  if (!min) return `Up to ${currency}${max} LPA`;
  if (!max) return `${currency}${min} LPA+`;
  if (min === max) return `${currency}${min} LPA`;
  return `${currency}${min} - ${currency}${max} LPA`;
}

function formatExperienceDisplay(min, max) {
  if (min === 0 && !max) return 'Fresher';
  if (min === 0 && max) return `0-${max} years`;
  if (!max) return `${min}+ years`;
  if (min === max) return `${min} years`;
  return `${min}-${max} years`;
}

export default {
  transformJob,
  transformJobs,
  transformSalary,
  transformExperience,
  transformCandidate,
  transformRecruiter,
  transformApplication,
  transformApplications,
  transformSavedJob,
  transformPaginatedResponse
};









