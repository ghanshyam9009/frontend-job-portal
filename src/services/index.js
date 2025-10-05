// Services Index - Export all services
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

// Additional Services
export { default as notificationService } from './notificationService';
export { default as planService } from './planService';
export { default as tokenService } from './tokenService';
export { default as paymentService } from './paymentService';
export { default as statsService } from './statsService';

// Re-export API configuration
export { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from '../config/api';

// External recruiter AWS endpoints
export { default as recruiterExternalService } from './recruiterExternalService';

// External admin AWS approval endpoints
export { default as adminExternalService } from './adminExternalService';

// External candidate AWS endpoints
export { default as candidateExternalService } from './candidateExternalService';



