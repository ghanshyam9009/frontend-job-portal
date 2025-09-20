// API Configuration
const API_CONFIG = {
  development: {
    baseURL: '/api',
    timeout: 10000
  },
  production: {
    baseURL: 'https://i9xj8uhrgg.execute-api.ap-southeast-1.amazonaws.com',
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
    register: '/students/register',
    recruiterRegister: '/recruiters/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
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
    create: '/jobs',
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
    updateStatus: (id) => `/applications/${id}/status`
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
