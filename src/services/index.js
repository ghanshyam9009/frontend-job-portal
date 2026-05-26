// Services Index - Export all services from single entry point
export { default as apiClient } from './apiClient';

// Authentication
export { default as authService } from './authService';

// Core Services
export { default as userService } from './userService';
export { default as candidateService } from './candidateService';
export { default as employerService } from './employerService';
export { default as jobService } from './jobService';
export { applicationService } from './applicationService';
export { default as savedJobService } from './savedJobService';
export { default as appliedJobService } from './appliedJobService';
// studentService only has a named export, so re-export that instead of default
export { studentService } from './studentService';

// Additional Services
export { default as notificationService } from './notificationService';
export { default as planService } from './planService';
export { default as tokenService } from './tokenService';
export { default as paymentService } from './paymentService';
export { default as statsService } from './statsService';
export { default as contactService } from './contactService';
export { default as demoService } from './demoService';
export { default as taskService } from './taskService';

// Admin Services
export { default as adminService } from './adminService';
export { default as adminPlanService } from './adminPlanService';
export { default as adminApiClient } from './adminApiClient';
export { default as adminExternalService } from './adminExternalService';

// Recruiter Services
export { recruiterService } from './recruiterService';
export { default as recruiterExternalService } from './recruiterExternalService';

// Candidate External Services
export { default as candidateExternalService } from './candidateExternalService';

// Re-export API configuration
export { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from '../config/api';
