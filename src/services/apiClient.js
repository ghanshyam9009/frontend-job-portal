// API Client Service
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to appropriate login
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to role-specific login page
      let loginPath = '/candidate/login';
      if (user.role === 'admin') {
        loginPath = '/admin/login';
      } else if (user.role === 'recruiter') {
        loginPath = '/recruiter/login';
      }
      
      window.location.href = loginPath;
    }
    
    if (error.response?.status === 403) {
      // Forbidden
      console.error('Access denied');
    }
    
    if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;

