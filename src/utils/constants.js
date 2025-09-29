// Application Constants

// User Roles
export const USER_ROLES = {
  CANDIDATE: 'Candidate',
  EMPLOYER: 'Employer',
  ADMIN: 'Admin'
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  BLOCKED: 'Blocked'
};

// Job Types
export const JOB_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  REMOTE: 'Remote'
};

// Job Status
export const JOB_STATUS = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  CLOSED: 'Closed'
};

// Application Status
export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Rejected',
  HIRED: 'Hired'
};

// Admin Action Types
export const ADMIN_ACTION_TYPES = {
  APPROVE: 'Approve',
  BLOCK: 'Block',
  DELETE: 'Delete',
  UPDATE: 'Update'
};

// Payment Types
export const PAYMENT_TYPES = {
  SUBSCRIPTION: 'subscription',
  TOKEN_PURCHASE: 'token_purchase'
};

// Payment Status
export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending'
};

// Token Types
export const TOKEN_TYPES = {
  SUBSCRIPTION: 'subscription',
  JOB_POSTING: 'job_posting'
};

// Plan Status
export const PLAN_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

// Experience Levels
export const EXPERIENCE_LEVELS = [
  { value: 'Entry Level', label: 'Entry Level (0-2 years)' },
  { value: 'Mid Level', label: 'Mid Level (3-5 years)' },
  { value: 'Senior Level', label: 'Senior Level (6+ years)' }
];

// Education Levels
export const EDUCATION_LEVELS = [
  { value: 'High School', label: 'High School' },
  { value: "Bachelor's", label: "Bachelor's Degree" },
  { value: "Master's", label: "Master's Degree" },
  { value: 'PhD', label: 'PhD' }
];

// Company Sizes
export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' }
];

// Industries
export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Media',
  'Real Estate',
  'Transportation',
  'Energy',
  'Government'
];

// Common Skills
export const COMMON_SKILLS = [
  'JavaScript',
  'Python',
  'Java',
  'React',
  'Node.js',
  'Angular',
  'Vue.js',
  'SQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Kubernetes',
  'Git',
  'Agile',
  'Scrum',
  'Project Management',
  'UI/UX Design',
  'Figma',
  'Adobe Creative Suite',
  'Data Analysis',
  'Machine Learning',
  'Artificial Intelligence',
  'DevOps',
  'Cybersecurity'
];

// Salary Ranges (in Lakhs)
export const SALARY_RANGES = [
  { value: '0-3', label: '₹0L - ₹3L' },
  { value: '3-5', label: '₹3L - ₹5L' },
  { value: '5-7', label: '₹5L - ₹7L' },
  { value: '7-10', label: '₹7L - ₹10L' },
  { value: '10-13', label: '₹10L - ₹13L' },
  { value: '13-16', label: '₹13L - ₹16L' },
  { value: '16-20', label: '₹16L - ₹20L' },
  { value: '20+', label: '₹20L+' }
];

// Job Duration Options
export const JOB_DURATION_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: '120', label: '120 days' }
];

// Notification Types
export const NOTIFICATION_TYPES = {
  JOB_APPLICATION: 'job_application',
  JOB_POSTED: 'job_posted',
  APPLICATION_STATUS: 'application_status',
  MESSAGE: 'message',
  SYSTEM: 'system'
};

// File Upload Limits
export const FILE_LIMITS = {
  RESUME_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  LOGO_MAX_SIZE: 2 * 1024 * 1024,   // 2MB
  ALLOWED_RESUME_TYPES: ['.pdf', '.doc', '.docx'],
  ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png', '.svg']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
};

export default {
  USER_ROLES,
  USER_STATUS,
  JOB_TYPES,
  JOB_STATUS,
  APPLICATION_STATUS,
  ADMIN_ACTION_TYPES,
  PAYMENT_TYPES,
  PAYMENT_STATUS,
  TOKEN_TYPES,
  PLAN_STATUS,
  GENDER_OPTIONS,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  COMPANY_SIZES,
  INDUSTRIES,
  COMMON_SKILLS,
  SALARY_RANGES,
  JOB_DURATION_OPTIONS,
  NOTIFICATION_TYPES,
  FILE_LIMITS,
  PAGINATION,
  API_STATUS
};
