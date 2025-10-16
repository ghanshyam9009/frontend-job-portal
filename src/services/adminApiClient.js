import axios from 'axios';

// Create axios instance for admin API
const adminApiClient = axios.create({
  baseURL: 'https://api.bigsources.in/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
adminApiClient.interceptors.request.use(
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
adminApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to admin login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }

    if (error.response?.status === 403) {
      // Forbidden
      console.error('Access denied to admin API');
    }

    if (error.response?.status >= 500) {
      // Server error
      console.error('Admin API server error:', error.response.data);
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default adminApiClient;
