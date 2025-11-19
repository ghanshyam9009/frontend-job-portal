import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { handleApiError, withErrorHandling } from '../utils/errorHandler';

export const studentService = {
  async register(userData) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.students.register, userData);
      return response;
    }, 'Registration failed');
  },

  async login(email, password) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.students.login, { email, password });
      return response;
    }, 'Login failed');
  },

  async sendOtp(data) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.password.sendOtp, data);
      return response;
    }, 'Failed to send OTP');
  },

  async verifyOtp(data) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.password.verifyOtp, data);
      return response;
    }, 'Failed to verify OTP');
  },

  async resetPassword(data) {
    return withErrorHandling(async () => {
      const response = await apiClient.post(API_ENDPOINTS.password.resetPassword, data);
      return response;
    }, 'Password reset failed');
  },

  async getProfile(email) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.students.getProfile(email));
      return response;
    }, 'Failed to fetch profile');
  },

  async updateProfile(email, profileData) {
    return withErrorHandling(async () => {
      const response = await apiClient.put(API_ENDPOINTS.students.updateProfile(email), profileData);
      return response;
    }, 'Profile update failed');
  },

  async fetchProfileDetails(email) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(`https://gfiwltw271.execute-api.ap-southeast-1.amazonaws.com/default/getstudentdetails?email=${email}`);
      return response;
    }, 'Failed to fetch profile details');
  },

  async updateProfileDetails(email, profileData) {
    return withErrorHandling(async () => {
      const response = await apiClient.put(`https://api.bigsources.in/api/students/profile/${email}`, profileData);
      return response;
    }, 'Failed to update profile details');
  },



  async getAllStudents(params = {}) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.students.getAll, { params });
      return response;
    }, 'Failed to fetch students');
  },

  async getStudentById(id) {
    return withErrorHandling(async () => {
      const response = await apiClient.get(API_ENDPOINTS.students.getById(id));
      return response;
    }, 'Failed to fetch student');
  },

  async updateStudent(id, studentData) {
    return withErrorHandling(async () => {
      const response = await apiClient.put(API_ENDPOINTS.students.update(id), studentData);
      return response;
    }, 'Failed to update student');
  },

  async deleteStudent(id) {
    return withErrorHandling(async () => {
      const response = await apiClient.delete(API_ENDPOINTS.students.delete(id));
      return response;
    }, 'Failed to delete student');
  },

  async uploadResume(id, resumeFile) {
    return withErrorHandling(async () => {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await apiClient.put(API_ENDPOINTS.students.uploadResume(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    }, 'Resume upload failed');
  },

  async uploadResumeFile(email, resumeFile) {
    return withErrorHandling(async () => {
      // Use the working combination: endpoint `/students/profile/${email}/upload` with field name `resumeFile`
      const endpoint = `/students/profile/${email}/upload`;
      const fieldName = 'resumeFile';
      
      try {
        const formData = new FormData();
        // Ensure the file is properly attached
        formData.append(fieldName, resumeFile, resumeFile.name);
        
        console.log(`Uploading resume:`, {
          fileName: resumeFile.name,
          fileSize: resumeFile.size,
          fileType: resumeFile.type,
          endpoint: endpoint,
          fieldName: fieldName
        });

        // Use apiClient (handles auth automatically)
        // Note: Don't set Content-Type manually - axios will set it with boundary automatically
        const response = await apiClient.put(endpoint, formData);
        
        console.log('Upload response:', response);
        
        // Handle different response formats
        let resumeUrl = null;
        if (response) {
          // Response might be the URL directly, or an object with url/resumeUrl property
          if (typeof response === 'string') {
            resumeUrl = response;
          } else if (response.resumeUrl) {
            resumeUrl = response.resumeUrl;
          } else if (response.url) {
            resumeUrl = response.url;
          } else if (response.data?.resumeUrl) {
            resumeUrl = response.data.resumeUrl;
          } else if (response.data?.url) {
            resumeUrl = response.data.url;
          } else if (response.resumeFile?.url) {
            resumeUrl = response.resumeFile.url;
          } else if (response.resumeFile?.resumeUrl) {
            resumeUrl = response.resumeFile.resumeUrl;
          } else if (response.resumeFile && typeof response.resumeFile === 'string') {
            resumeUrl = response.resumeFile;
          } else {
            // Construct default URL if not provided
            resumeUrl = `https://api.bigsources.in/resume/${email}`;
          }
        } else {
          // Default fallback URL
          resumeUrl = `https://api.bigsources.in/resume/${email}`;
        }
        
        console.log('Extracted resume URL:', resumeUrl);
        
        return { 
          success: true, 
          data: { 
            resumeUrl: resumeUrl,
            ...(typeof response === 'object' && response !== null ? response : {})
          } 
        };
      } catch (error) {
        // If apiClient fails, log the error and throw
        console.error('Resume upload error:', error);
        throw error;
      }
    }, 'Resume upload failed');
  },

  async uploadProfileImage(id, imageFile) {
    return withErrorHandling(async () => {
      const formData = new FormData();
      formData.append('profile_image', imageFile);
      
      const response = await apiClient.post(API_ENDPOINTS.students.uploadProfileImage(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    }, 'Profile image upload failed');
  }
};
