// API Configuration
// API Configuration
const API_CONFIG = {
  development: {
    // In development, we use a proxy to avoid CORS issues.
    // See vite.config.js for the proxy configuration.
    baseURL: 'http://18.141.113.253/api',
    timeout: 10000
  },
  production: {
    // In production, the API server must be configured to accept requests
    // from the frontend's domain to avoid CORS errors.
    baseURL: 'http://18.141.113.253/api',
    timeout: 15000
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';
const config = API_CONFIG[environment];

// Base API configuration
export const API_BASE_URL = config.baseURL;
export const API_TIMEOUT = config.timeout;
// API endpoints
export const API_ENDPOINTS = {
  // Authentication 
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  },
  
  // Students
  students: {
    register: '/students/register',
    login: '/students/login',
    resetPassword: '/students/reset-password',
    getProfile: (email) => `/students/profile/${email}`
  },

  // Recruiters
  recruiters: {
    register: '/Recruiter/register',
    login: '/Recruiter/login',
    resetPassword: '/Recruiter/reset-password',
    getProfile: (email) => `/Recruiter/profile/${email}`
  },

  // Admin
  admin: {
    register: '/admin/register',
    login: '/admin/login',
    resetPassword: '/admin/reset-password',
    getProfile: (email) => `/admin/profile/${email}`
  },

  // Users
  users: {
    getAll: '/users',
    getById: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    changePassword: (id) => `/users/${id}/password`,
    updateStatus: (id) => `/users/${id}/status`
  },
  
  // Candidates
  candidates: {
    getAll: '/candidates',
    getById: (id) => `/candidates/${id}`,
    update: (id) => `/candidates/${id}`,
    uploadResume: (id) => `/candidates/${id}/resume`,
    getSkills: (id) => `/candidates/${id}/skills`,
    updateSkills: (id) => `/candidates/${id}/skills`
  },
  
  // Employers
  employers: {
    getAll: '/employers',
    getById: (id) => `/employers/${id}`,
    update: (id) => `/employers/${id}`,
    getJobs: (id) => `/employers/${id}/jobs`,
    getApplications: (id) => `/employers/${id}/applications`
  },
  
  // Jobs
  jobs: {
    getAll: '/jobs',
    getById: (id) => `/jobs/${id}`,
    create: '/job/jobs',
    update: (id) => `/jobs/${id}`,
    delete: (id) => `/jobs/${id}`,
    search: '/jobs/search',
    getByEmployer: (employerId) => `/jobs/employer/${employerId}`,
    updateStatus: (id) => `/jobs/${id}/status`
  },
  
  // Applications
  applications: {
    getAll: '/applications',
    getById: (id) => `/applications/${id}`,
    create: '/applications',
    update: (id) => `/applications/${id}`,
    getByJob: (jobId) => `/applications/job/${jobId}`,
    getByCandidate: (candidateId) => `/applications/candidate/${candidateId}`,
    updateStatus: (id) => `/applications/${id}/status`,
    applyToJob: (jobId) => `/application/jobs/${jobId}/apply`
  },
  
  // Saved Jobs
  savedJobs: {
    getAll: '/saved-jobs',
    getByCandidate: (candidateId) => `/saved-jobs/candidate/${candidateId}`,
    save: '/saved-jobs',
    unsave: (jobId, candidateId) => `/saved-jobs/${jobId}/candidate/${candidateId}`
  },
  
  // Skills
  skills: {
    getAll: '/skills',
    getById: (id) => `/skills/${id}`,
    create: '/skills',
    update: (id) => `/skills/${id}`,
    delete: (id) => `/skills/${id}`,
    search: '/skills/search'
  },
  
  // Notifications
  notifications: {
    getAll: '/notifications',
    getByUser: (userId) => `/notifications/user/${userId}`,
    markAsRead: (id) => `/notifications/${id}/read`,
    markAllAsRead: (userId) => `/notifications/user/${userId}/read-all`,
    create: '/notifications'
  },
  
  // Plans & Subscriptions
  plans: {
    getAll: '/plans',
    getById: (id) => `/plans/${id}`,
    create: '/plans',
    update: (id) => `/plans/${id}`,
    delete: (id) => `/plans/${id}`
  },
  
  // Tokens
  tokens: {
    getByUser: (userId) => `/tokens/user/${userId}`,
    purchase: '/tokens/purchase',
    useToken: '/tokens/use'
  },
  
  // Payments
  payments: {
    create: '/payments',
    getByUser: (userId) => `/payments/user/${userId}`,
    getById: (id) => `/payments/${id}`,
    verify: (id) => `/payments/${id}/verify`
  },
  
  // Admin Actions
  adminActions: {
    getAll: '/admin/actions',
    create: '/admin/actions',
    getByAdmin: (adminId) => `/admin/actions/admin/${adminId}`,
    getByTarget: (targetId) => `/admin/actions/target/${targetId}`
  },
  
  // Statistics & Analytics
  stats: {
    dashboard: '/stats/dashboard',
    jobs: '/stats/jobs',
    candidates: '/stats/candidates',
    employers: '/stats/employers',
    applications: '/stats/applications'
  }
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_ENDPOINTS
};
