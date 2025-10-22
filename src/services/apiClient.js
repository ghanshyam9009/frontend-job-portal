// API Client Service
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';
import { handleApiError } from '../utils/errorHandler';

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
    // Handle common errors but avoid forcibly clearing auth on 401 here.
    // Let feature code or a centralized auth layer decide what to do.
    if (error.response?.status === 403) {
      console.error('Access denied');
    }

    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;

