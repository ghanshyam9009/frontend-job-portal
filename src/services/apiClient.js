// API Client Service
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Try sessionStorage first (for session-based auth), then localStorage
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with retry logic
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const config = error.config;
    
    // Initialize retry count
    config.__retryCount = config.__retryCount || 0;

    // Retry on network errors or 5xx server errors
    const shouldRetry = 
      !error.response || // Network error
      (error.response?.status >= 500 && error.response?.status < 600);

    if (shouldRetry && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      console.warn(`Retrying request (${config.__retryCount}/${MAX_RETRIES}):`, config.url);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config.__retryCount));
      
      return apiClient(config);
    }

    // Handle specific error codes
    if (error.response?.status === 401) {
      console.error('Unauthorized - token may be expired');
    }
    
    if (error.response?.status === 403) {
      console.error('Access denied');
    }

    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data);
    }

    return Promise.reject(error.response?.data || error.message || error);
  }
);

export default apiClient;

