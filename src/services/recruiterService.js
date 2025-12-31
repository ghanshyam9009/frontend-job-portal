import apiClient from './apiClient';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

// In-memory cache for employer details to prevent duplicate API calls
const employerCache = new Map();
const ongoingRequests = new Map();

export const recruiterService = {
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.recruiters.register, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.recruiters.login, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.recruiters.resetPassword, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cached version to prevent duplicate API calls for employer details
  async getProfile(email, forceRefresh = false) {
    if (!email) {
      throw new Error('Email is required');
    }

    const cacheKey = email.toLowerCase();

    // If not forcing a refresh, return cached data if available and not expired (5 minutes TTL)
    const cached = employerCache.get(cacheKey);
    if (!forceRefresh && cached && (Date.now() - cached.timestamp) < 300000) {
      return { success: true, data: cached.data, fromCache: true };
    }

    // If there's already an ongoing request for the same email, wait for it
    const ongoing = ongoingRequests.get(cacheKey);
    if (ongoing) {
      return ongoing;
    }

    // Create new request
    const requestPromise = this._fetchEmployerDetails(email);

    // Store ongoing request to prevent duplicates
    ongoingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache the successful result
      if (result.success) {
        employerCache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        });
      }

      return result;
    } finally {
      // Remove from ongoing requests
      ongoingRequests.delete(cacheKey);
    }
  },

  // Private method to actually fetch data
  async _fetchEmployerDetails(email) {
    try {
      const endpoint = API_ENDPOINTS.recruiters.getEmployerDetails(email);
      const response = await apiClient.get(endpoint);
      return { success: true, data: response };
    } catch (error) {
      console.error(`Error fetching employer details for ${email}:`, error);
      throw error;
    }
  },

  // Clear cache for specific email (useful after updates)
  clearEmployerCache(email) {
    if (email) {
      employerCache.delete(email.toLowerCase());
    } else {
      // Clear all cache
      employerCache.clear();
    }
  },

  async updateProfile(email, profileData) {
    try {
      // Clear cache before updating to ensure fresh data on next fetch
      this.clearEmployerCache(email);

      // Send all fields as-is (including null values for optional fields)
      // Based on Postman testing, the API accepts null values for optional fields
      // Only filter out undefined values, but keep null and empty strings
      const cleanData = {};
      Object.keys(profileData).forEach(key => {
        const value = profileData[key];
        // Include the field if it's not undefined (allow null, empty string, 0, false)
        if (value !== undefined) {
          cleanData[key] = value;
        }
      });

      // Log the request details for debugging
      const endpoint = API_ENDPOINTS.recruiters.updateProfile(email);
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log('=== Profile Update Request ===');
      console.log('Full URL:', fullUrl);
      console.log('Endpoint:', endpoint);
      console.log('Email:', email);
      console.log('Data being sent:', JSON.stringify(cleanData, null, 2));
      console.log('Data keys:', Object.keys(cleanData));
      console.log('Data types:', Object.keys(cleanData).reduce((acc, key) => {
        acc[key] = typeof cleanData[key];
        return acc;
      }, {}));

      // Make the request
      const response = await apiClient.put(endpoint, cleanData);
      
      console.log('=== Profile Update Response ===');
      console.log('Response:', JSON.stringify(response, null, 2));

      // Handle different response formats
      // Some APIs return { success: true, data: {...} }
      // Others return { message: "...", profile: {...} }
      if (response) {
        // If response has success property, return as is
        if (response.success !== undefined) {
          // Cache the updated data if update was successful
          if (response.success && (response.data || response.profile)) {
            const cacheKey = email.toLowerCase();
            employerCache.set(cacheKey, {
              data: response.data || response.profile || response,
              timestamp: Date.now()
            });
          }
          return response;
        }
        
        // If response has message property (success message), treat as success
        if (response.message) {
          const cacheKey = email.toLowerCase();
          employerCache.set(cacheKey, {
            data: response.profile || response.data || response,
            timestamp: Date.now()
          });
          return { success: true, message: response.message, data: response.profile || response.data || response };
        }

        // If response has profile property, treat as success
        if (response.profile) {
          const cacheKey = email.toLowerCase();
          employerCache.set(cacheKey, {
            data: response.profile || response,
            timestamp: Date.now()
          });
          return { success: true, data: response.profile || response };
        }

        // Default: treat as success if we got a response
        return { success: true, data: response };
      }

      return { success: false, error: 'No response from server' };
    } catch (error) {
      console.error('=== Profile Update Error ===');
      console.error('Error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', error && typeof error === 'object' ? Object.keys(error) : 'N/A');
      
      // The apiClient interceptor returns error.response.data, so error is already the data object
      // Check if error is an object with 'error' or 'message' property (from interceptor)
      if (error && typeof error === 'object') {
        // Check if it's the error data object from the interceptor
        if (error.error || error.message) {
          const errorMessage = error.error || error.message || 'Failed to update profile';
          console.error('Error from interceptor (data object):', errorMessage);
          return {
            success: false,
            error: errorMessage,
            status: 500, // Assume 500 if we got error data
            fullError: error
          };
        }
        
        // Check if it's still an axios error object (shouldn't happen due to interceptor, but just in case)
        if (error.response) {
          const errorData = error.response.data || error.response;
          const errorMessage = errorData.error || errorData.message || `Server error: ${error.response.status}`;
          return {
            success: false,
            error: errorMessage,
            status: error.response.status,
            fullError: errorData
          };
        }
        
        // Check if it has request property (network error)
        if (error.request) {
          return {
            success: false,
            error: 'No response from server. Please check your connection.'
          };
        }
      }
      
      // Fallback: treat as string message or unknown error
      const errorMessage = typeof error === 'string' 
        ? error 
        : (error?.message || error?.error || 'Failed to update profile');
      
      return {
        success: false,
        error: errorMessage,
        fullError: error
      };
    }
  },

  async submitKyc(email, kycPayload) {
    if (!email) {
      throw new Error('Email is required for KYC submission');
    }

    try {
      const endpoint = API_ENDPOINTS.recruiters.submitKyc(email);
      let formData;

      if (kycPayload instanceof FormData) {
        formData = kycPayload;
      } else {
        formData = new FormData();
        Object.entries(kycPayload || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
          }
        });
      }

      const response = await apiClient.put(endpoint, formData);

      if (response?.success && (response.data || response.profile)) {
        this.clearEmployerCache(email);
        const cacheKey = email.toLowerCase();
        employerCache.set(cacheKey, {
          data: response.data?.profile || response.data || response.profile || response,
          timestamp: Date.now()
        });
      }

      if (response?.success !== undefined) {
        return response;
      }

      return { success: true, data: response };
    } catch (error) {
      console.error('=== KYC Submission Error ===');
      console.error('Error object:', error);

      if (error && typeof error === 'object') {
        if (error.error || error.message) {
          const errorMessage = error.error || error.message || 'Failed to submit KYC details';
          return {
            success: false,
            error: errorMessage,
            status: 500,
            fullError: error
          };
        }

        if (error.response) {
          const errorData = error.response.data || error.response;
          const errorMessage = errorData.error || errorData.message || `Server error: ${error.response.status}`;
          return {
            success: false,
            error: errorMessage,
            status: error.response.status,
            fullError: errorData
          };
        }

        if (error.request) {
          return {
            success: false,
            error: 'No response from server. Please check your connection.'
          };
        }
      }

      const errorMessage = typeof error === 'string'
        ? error
        : (error?.message || 'Failed to submit KYC details');

      return {
        success: false,
        error: errorMessage,
        fullError: error
      };
    }
  },

  async uploadLogoFile(email, logoFile) {
    try {
      // Use the correct relative path with apiClient (which handles authentication)
      const endpoint = `/Recruiter/profile/${email}/logo`;

      const formData = new FormData();
      // Based on the API response structure, the field name should be 'logo'
      formData.append('logo', logoFile, logoFile.name);

      console.log(`Uploading logo:`, {
        logoFileName: logoFile.name,
        fileSize: logoFile.size,
        fileType: logoFile.type,
        endpoint: endpoint,
        fieldName: 'logo'
      });

      // Use apiClient with PUT method (same as resume upload)
      const response = await apiClient.put(endpoint, formData);

      console.log('Logo upload response:', response);

      // Extract logo URL from response based on the provided API response structure
      let logoUrl = null;
      if (response) {
        if (response.logo) {
          logoUrl = response.logo;
        } else if (response.logoUrl) {
          logoUrl = response.logoUrl;
        } else if (response.profile?.logo) {
          logoUrl = response.profile.logo;
        }
      }

      console.log('Extracted logo URL:', logoUrl);

      return {
        success: true,
        data: {
          logoUrl: logoUrl,
          ...response
        }
      };
    } catch (error) {
      console.error('Logo upload error:', error);
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || 'Logo upload failed'
      };
    }
  }
};
