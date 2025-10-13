// API Configuration
const API_CONFIG = {
  development: {
    // In development, we use a proxy to avoid CORS issues.
    // See vite.config.js for the proxy configuration.
    baseURL: '/api',
    timeout: 10000
  },
  production: {
    // In production, the API server must be configured to accept requests
    // from the frontend's domain to avoid CORS errors.
    baseURL: 'https://api.bigsources.in/api',
    timeout: 15000
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';
const config = API_CONFIG[environment];

// Base API configuration
export const API_BASE_URL = config.baseURL;
export const API_TIMEOUT = config.timeout;
export const API_ENDPOINTS = {
  // Authentication 
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  },

  // Password
  password: {
    sendOtp: '/password/send-otp',
    verifyOtp: '/password/verify-otp',
    resetPassword: '/password/reset-password'
  },
  
  // Students
  students: {
    register: '/students/register',
    login: '/students/login',
    forgotPassword: '/students/forgot-password',
    resetPassword: '/students/reset-password',
    getProfile: (email) => `/student/profile/${email}`,
    updateProfile: (email) => `/student/profile/${email}`,
    getAll: '/students',
    getById: (id) => `/students/${id}`,
    update: (id) => `/students/${id}`,
    delete: (id) => `/students/${id}`,
    uploadResume: (id) => `/students/${id}/resume`,
    uploadProfileImage: (id) => `/students/${id}/profile-image`
  },

  // Recruiters/Employers
  recruiters: {
    register: '/Recruiter/register',
    login: '/Recruiter/login',
   resetPassword: '/Recruiter/reset-password',
    getProfile: (email) => `/Recruiter/profile/${email}`,
    updateProfile: (email) => `/employers/profile/${email}`,
    getAll: '/employers',
    getById: (id) => `/employers/${id}`,
    update: (id) => `/employers/${id}`,
    delete: (id) => `/employers/${id}`,
    getJobs: (id) => `/employers/${id}/jobs`,
    getApplications: (id) => `/employers/${id}/applications`,
    uploadLogo: (id) => `/employers/${id}/logo`
  },

  // Admin
  admin: {
    register: '/admin/register',
    login: '/admin/login',
    resetPassword: '/admin/reset-password',
    getProfile: (email) => `/admin/profile/${email}`,
    updateProfile: (email) => `/admin/profile/${email}`,
    getAll: '/admin',
    getById: (id) => `/admin/${id}`,
    update: (id) => `/admin/${id}`,
    delete: (id) => `/admin/${id}`
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
    updateStatus: (id) => `/jobs/${id}/status`,
    getFeatured: '/jobs/featured',
    getRecent: '/jobs/recent',
    getByLocation: (location) => `/jobs/location/${location}`,
    getBySkills: '/jobs/skills',
    getGovernmentJobs: '/jobs/government',
    createGovernmentJob: '/jobs/government',
    updateGovernmentJob: (id) => `/jobs/government/${id}`
  },
  
  // Applications
  applications: {
    getAll: '/applications',
    getById: (id) => `/applications/${id}`,
    create: '/applications',
    update: (id) => `/applications/${id}`,
    getByJob: (jobId) => `/applications/job/${jobId}`,
    getByStudent: (studentId) => `/applications/student/${studentId}`,
    updateStatus: (id) => `/applications/${id}/status`,
    applyToJob: (jobId) => `/applications/jobs/${jobId}/apply`,
    withdraw: (id) => `/applications/${id}/withdraw`,
    getByEmployer: (employerId) => `/applications/employer/${employerId}`
  },
  
  // Saved Jobs (Bookmark Jobs)
  savedJobs: {
    getAll: '/bookmarkjobs',
    getByUser: (userId) => `/bookmarkjobs/user/${userId}`,
    save: '/bookmarkjobs',
    unsave: (jobId, userId) => `/bookmarkjobs/${jobId}/user/${userId}`,
    checkSaved: (jobId, userId) => `/bookmarkjobs/${jobId}/user/${userId}/check`
  },

  // Applied Jobs
  appliedJobs: {
    getAll: '/appliedjobs',
    getByUser: (userId) => `/appliedjobs/user/${userId}`,
    getByJob: (jobId) => `/appliedjobs/job/${jobId}`,
    create: '/appliedjobs',
    update: (id) => `/appliedjobs/${id}`,
    delete: (id) => `/appliedjobs/${id}`,
    getStats: (userId) => `/appliedjobs/user/${userId}/stats`
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
  
  // Tasks (Admin Approval System)
  tasks: {
    getAll: '/tasks',
    getById: (id) => `/tasks/${id}`,
    update: (id) => `/tasks/${id}`,
    delete: (id) => `/tasks/${id}`,
    getByCategory: (category) => `/tasks/category/${category}`,
    getByStatus: (status) => `/tasks/status/${status}`,
    approve: (id) => `/tasks/${id}/approve`,
    reject: (id) => `/tasks/${id}/reject`
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
