// Application Constants

// Employment Types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  TEMPORARY: 'Temporary'
};

export const EMPLOYMENT_TYPE_OPTIONS = Object.values(EMPLOYMENT_TYPES);

// Experience Levels
export const EXPERIENCE_LEVELS = {
  FRESHER: 'Fresher',
  JUNIOR: '1-2 years',
  MID: '3-5 years',
  SENIOR: '5-8 years',
  LEAD: '8-10 years',
  EXPERT: '10+ years'
};

export const EXPERIENCE_LEVEL_OPTIONS = Object.entries(EXPERIENCE_LEVELS).map(([key, value]) => ({
  value: key,
  label: value
}));

// Job Status
export const JOB_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CLOSED: 'closed',
  DRAFT: 'draft',
  PENDING: 'pending',
  EXPIRED: 'expired'
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

export const APPLICATION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interview: 'bg-indigo-100 text-indigo-800',
  offered: 'bg-green-100 text-green-800',
  hired: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800'
};

// User Roles
export const USER_ROLES = {
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
  ADMIN: 'admin'
};

// Recruiter Approval Status
export const RECRUITER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Education Levels
export const EDUCATION_LEVELS = [
  'High School',
  'Diploma',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD',
  'Other'
];

// Job Categories
export const JOB_CATEGORIES = [
  'Information Technology',
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Design',
  'Healthcare',
  'Education',
  'Legal',
  'Customer Service',
  'Administration',
  'Manufacturing',
  'Research',
  'Government',
  'Other'
];

// Indian States
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry'
];

// Major Cities
export const MAJOR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Noida',
  'Gurugram', 'Indore', 'Kochi', 'Coimbatore', 'Nagpur', 'Bhopal',
  'Vadodara', 'Surat', 'Remote'
];

// Salary Ranges (in LPA)
export const SALARY_RANGES = [
  { min: 0, max: 3, label: '0 - 3 LPA' },
  { min: 3, max: 6, label: '3 - 6 LPA' },
  { min: 6, max: 10, label: '6 - 10 LPA' },
  { min: 10, max: 15, label: '10 - 15 LPA' },
  { min: 15, max: 25, label: '15 - 25 LPA' },
  { min: 25, max: 50, label: '25 - 50 LPA' },
  { min: 50, max: null, label: '50+ LPA' }
];

// File Upload Limits
export const FILE_LIMITS = {
  RESUME: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['.pdf', '.doc', '.docx'],
    maxSizeLabel: '5MB'
  },
  PROFILE_IMAGE: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSizeLabel: '2MB'
  },
  COMPANY_LOGO: {
    maxSize: 1 * 1024 * 1024, // 1MB
    allowedTypes: ['.jpg', '.jpeg', '.png', '.svg'],
    maxSizeLabel: '1MB'
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Session
export const SESSION = {
  DURATION_HOURS: 24,
  WARNING_THRESHOLD_HOURS: 1,
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    USER: 'user',
    LOGIN_TIMESTAMP: 'loginTimestamp',
    ROLE: 'userRole'
  }
};

// API Response Codes
export const API_RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'DD MMM YYYY, hh:mm A',
  API: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};

// Skills (Common)
export const COMMON_SKILLS = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB',
  'AWS', 'Docker', 'Git', 'TypeScript', 'Angular', 'Vue.js', 'PHP',
  'C++', 'C#', '.NET', 'Ruby', 'Go', 'Kotlin', 'Swift', 'Flutter',
  'React Native', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap',
  'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API', 'Microservices',
  'Kubernetes', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'JIRA',
  'Machine Learning', 'Data Science', 'AI', 'Deep Learning', 'NLP',
  'Excel', 'PowerPoint', 'Communication', 'Leadership', 'Problem Solving'
];

export default {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_STATUS,
  APPLICATION_STATUS,
  APPLICATION_STATUS_COLORS,
  USER_ROLES,
  RECRUITER_STATUS,
  EDUCATION_LEVELS,
  JOB_CATEGORIES,
  INDIAN_STATES,
  MAJOR_CITIES,
  SALARY_RANGES,
  FILE_LIMITS,
  PAGINATION,
  SESSION,
  API_RESPONSE_CODES,
  DATE_FORMATS,
  COMMON_SKILLS
};
