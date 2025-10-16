// Error handling utilities
import { toast } from 'react-toastify';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error messages mapping
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  PASSWORD_RESET_FAILED: 'Password reset failed. Please try again.',
  PROFILE_UPDATE_FAILED: 'Profile update failed. Please try again.',
  JOB_CREATE_FAILED: 'Failed to create job. Please try again.',
  JOB_UPDATE_FAILED: 'Failed to update job. Please try again.',
  APPLICATION_FAILED: 'Failed to submit application. Please try again.',
  FILE_UPLOAD_FAILED: 'File upload failed. Please try again.'
};

// Success messages mapping
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Registration successful!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  PASSWORD_RESET_SUCCESS: 'Password reset successful!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  JOB_CREATE_SUCCESS: 'Job created successfully!',
  JOB_UPDATE_SUCCESS: 'Job updated successfully!',
  APPLICATION_SUCCESS: 'Application submitted successfully!',
  FILE_UPLOAD_SUCCESS: 'File uploaded successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  SAVE_SUCCESS: 'Saved successfully!'
};

// Parse error from API response
export const parseError = (error) => {
  if (typeof error === 'string') {
    return {
      type: ERROR_TYPES.UNKNOWN,
      message: error,
      details: null
    };
  }

  if (error?.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          type: ERROR_TYPES.VALIDATION,
          message: data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
          details: data?.errors || null
        };
      case 401:
        return {
          type: ERROR_TYPES.AUTHENTICATION,
          message: data?.message || ERROR_MESSAGES.AUTHENTICATION_ERROR,
          details: null
        };
      case 403:
        return {
          type: ERROR_TYPES.AUTHORIZATION,
          message: data?.message || ERROR_MESSAGES.AUTHORIZATION_ERROR,
          details: null
        };
      case 404:
        return {
          type: ERROR_TYPES.VALIDATION,
          message: 'Resource not found',
          details: null
        };
      case 422:
        return {
          type: ERROR_TYPES.VALIDATION,
          message: data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
          details: data?.errors || null
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ERROR_TYPES.SERVER,
          message: data?.message || ERROR_MESSAGES.SERVER_ERROR,
          details: null
        };
      default:
        return {
          type: ERROR_TYPES.UNKNOWN,
          message: data?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
          details: null
        };
    }
  }

  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return {
      type: ERROR_TYPES.NETWORK,
      message: ERROR_MESSAGES.NETWORK_ERROR,
      details: null
    };
  }

  return {
    type: ERROR_TYPES.UNKNOWN,
    message: error?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    details: null
  };
};

// Show error toast
export const showError = (error, customMessage = null) => {
  const parsedError = parseError(error);
  const message = customMessage || parsedError.message;
  
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  // Log error for debugging
  console.error('Error:', parsedError);
  
  return parsedError;
};

// Show success toast
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Show info toast
export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Show warning toast
export const showWarning = (message) => {
  toast.warn(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Handle API errors with automatic toast
export const handleApiError = (error, customMessage = null) => {
  const parsedError = showError(error, customMessage);
  
  // Handle specific error types
  if (parsedError.type === ERROR_TYPES.AUTHENTICATION) {
    // Clear auth data and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/candidate/login';
  }
  
  return parsedError;
};

// Async wrapper for API calls with error handling
export const withErrorHandling = async (apiCall, errorMessage = null) => {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    const parsedError = handleApiError(error, errorMessage);
    return { success: false, error: parsedError };
  }
};

// Validation helper
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Form validation
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${rule.label || field} is required`;
      return;
    }
    
    if (value && rule.type === 'email' && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address';
      return;
    }
    
    if (value && rule.type === 'password' && !validatePassword(value)) {
      errors[field] = 'Password must be at least 6 characters long';
      return;
    }
    
    if (value && rule.type === 'phone' && !validatePhone(value)) {
      errors[field] = 'Please enter a valid phone number';
      return;
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
      return;
    }
    
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${rule.label || field} must not exceed ${rule.maxLength} characters`;
      return;
    }
  });
  
  return errors;
};

export default {
  ERROR_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  parseError,
  showError,
  showSuccess,
  showInfo,
  showWarning,
  handleApiError,
  withErrorHandling,
  validateEmail,
  validatePassword,
  validatePhone,
  validateForm
};

