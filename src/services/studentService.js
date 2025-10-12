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
      
      const response = await apiClient.post(API_ENDPOINTS.students.uploadResume(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
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
