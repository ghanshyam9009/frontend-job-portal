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

  async fetchProfileDetailsById(email) {
    return withErrorHandling(async () => {
      // Construct the URL for fetching student details by ID
      const response = await apiClient.get(`https://gfiwltw271.execute-api.ap-southeast-1.amazonaws.com/default/getstudentdetails?email=${email}`);
      return response;
    }, 'Failed to fetch profile details by ID');
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
      // Use the working combination: endpoint `/students/profile/${email}/upload` with field name `document`
      const endpoint = `/students/profile/${email}/upload`;
      const fieldName = 'document';

      try {
        const formData = new FormData();
        // Ensure the file is properly attached
        formData.append(fieldName, resumeFile, resumeFile.name);

        console.log(`Uploading resume:`, {
          resumeUrl: resumeFile.name,
          fileSize: resumeFile.size,
          fileType: resumeFile.type,
          endpoint: endpoint,
          fieldName: fieldName,
          formDataFields: Array.from(formData.keys()) // Debug: check what fields are in formData
        });

        // Use apiClient (handles auth automatically)
        // Let axios automatically set Content-Type for FormData with proper boundary
        const response = await apiClient.put(endpoint, formData);

        console.log('Upload response:', response);
        console.log('Upload response profile resume data:', {
          profileResumeUrl: response?.profile?.resumeUrl,
          profileResume: response?.profile?.resume,
          profileResumeFile: response?.profile?.resumeFile
        });

        // Handle different response formats
        let resumeUrl = null;
        if (response) {
          // Response might be the URL directly, or nested within profile/resumeFile objects
          if (typeof response === 'string') {
            resumeUrl = response;
          } else if (response.resumeUrl) {
            resumeUrl = response.resumeUrl;
          } else if (response.url) {
            resumeUrl = response.url;
          } else if (response.profile?.resumeUrl) {
            resumeUrl = response.profile.resumeUrl;
          } else if (response.profile?.resume) {
            resumeUrl = response.profile.resume;
          } else if (response.profile?.resumeFile?.resumeUrl) {
            resumeUrl = response.profile.resumeFile.resumeUrl;
          } else if (response.profile?.resumeFile?.url) {
            resumeUrl = response.profile.resumeFile.url;
          } else if (typeof response.profile?.resumeFile === 'string') {
            resumeUrl = response.profile.resumeFile;
          } else if (response.profile?.resumeUrl === null && response.profile?.resume !== null) {
            resumeUrl = response.profile.resume;
          } else if (response.data?.resumeUrl) {
            resumeUrl = response.data.resumeUrl;
          } else if (response.data?.url) {
            resumeUrl = response.data.url;
          } else if (response.data?.profile?.resumeUrl) {
            resumeUrl = response.data.profile.resumeUrl;
          } else if (response.resumeFile?.url) {
            resumeUrl = response.resumeFile.url;
          } else if (response.resumeFile?.resumeUrl) {
            resumeUrl = response.resumeFile.resumeUrl;
          } else if (typeof response.resumeFile === 'string') {
            resumeUrl = response.resumeFile;
          }
        }

        if (!resumeUrl) {
          // Construct default URL if API didn't return one
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

  async uploadLogoFile(email, logoFile) {
    return withErrorHandling(async () => {
      // Use the same endpoint pattern as resume upload but with different field name for logo/profile image
      const endpoint = `/students/profile/${email}/upload`;
      const fieldName = 'document'; // Same field name based on working resume upload

      try {
        const formData = new FormData();
        // Ensure the file is properly attached
        formData.append(fieldName, logoFile, logoFile.name);

        console.log(`Uploading logo:`, {
          logoFileName: logoFile.name,
          fileSize: logoFile.size,
          fileType: logoFile.type,
          endpoint: endpoint,
          fieldName: fieldName,
          formDataFields: Array.from(formData.keys())
        });

        // Use apiClient (handles auth automatically)
        const response = await apiClient.put(endpoint, formData);

        console.log('Logo upload response:', response);

        // Handle different response formats for logo/profile image
        let logoUrl = null;
        if (response) {
          if (typeof response === 'string') {
            logoUrl = response;
          } else if (response.logoUrl) {
            logoUrl = response.logoUrl;
          } else if (response.logo) {
            logoUrl = response.logo;
          } else if (response.profileImageUrl) {
            logoUrl = response.profileImageUrl;
          } else if (response.profileImage) {
            logoUrl = response.profileImage;
          } else if (response.imageUrl) {
            logoUrl = response.imageUrl;
          } else if (response.url) {
            logoUrl = response.url;
          } else if (response.profile?.logoUrl) {
            logoUrl = response.profile.logoUrl;
          } else if (response.profile?.logo) {
            logoUrl = response.profile.logo;
          } else if (response.profile?.profileImageUrl) {
            logoUrl = response.profile.profileImageUrl;
          } else if (response.profile?.profileImage) {
            logoUrl = response.profile.profileImage;
          } else if (response.profile?.imageUrl) {
            logoUrl = response.profile.imageUrl;
          } else if (response.profile?.url) {
            logoUrl = response.profile.url;
          } else if (typeof response.profile?.profileImage === 'string') {
            logoUrl = response.profile.profileImage;
          } else if (response.data?.logoUrl) {
            logoUrl = response.data.logoUrl;
          } else if (response.data?.logo) {
            logoUrl = response.data.logo;
          } else if (response.data?.profileImageUrl) {
            logoUrl = response.data.profileImageUrl;
          } else if (response.data?.profileImage) {
            logoUrl = response.data.profileImage;
          } else if (response.data?.imageUrl) {
            logoUrl = response.data.imageUrl;
          } else if (response.data?.url) {
            logoUrl = response.data.url;
          } else if (response.data?.profile?.logoUrl) {
            logoUrl = response.data.profile.logoUrl;
          } else if (response.data?.profile?.logo) {
            logoUrl = response.data.profile.logo;
          } else if (response.data?.profile?.profileImageUrl) {
            logoUrl = response.data.profile.profileImageUrl;
          } else if (response.data?.profile?.profileImage) {
            logoUrl = response.data.profile.profileImage;
          } else if (response.profileImage?.url) {
            logoUrl = response.profileImage.url;
          } else if (response.profileImage?.logoUrl) {
            logoUrl = response.profileImage.logoUrl;
          } else if (typeof response.profileImage === 'string') {
            logoUrl = response.profileImage;
          }
        }

        if (!logoUrl) {
          // Construct default URL if API didn't return one
          logoUrl = `https://api.bigsources.in/profile-image/${email}`;
        }

        console.log('Extracted logo URL:', logoUrl);

        return {
          success: true,
          data: {
            logoUrl: logoUrl,
            ...(typeof response === 'object' && response !== null ? response : {})
          }
        };
      } catch (error) {
        console.error('Logo upload error:', error);
        throw error;
      }
    }, 'Logo upload failed');
  },

  async uploadProfileImage(endpoint, imageFile) {
    return withErrorHandling(async () => {
      const formData = new FormData();

      // Try different field names that might work, starting with common ones
      const fieldNames = ['document', 'profile_image', 'image', 'file', 'photo'];

      for (const fieldName of fieldNames) {
        formData.append(fieldName, imageFile, imageFile.name);

        console.log(`Attempting profile image upload with fieldName: ${fieldName}`);

        try {
          // Try PUT first (like resume upload), then POST if that fails
          let response;
          try {
            response = await apiClient.put(endpoint, formData);
            console.log(`PUT request successful for fieldName: ${fieldName}`);
          } catch (putError) {
            console.log(`PUT failed for fieldName: ${fieldName}, trying POST...`);
            try {
              response = await apiClient.post(endpoint, formData);
              console.log(`POST request successful for fieldName: ${fieldName}`);
            } catch (postError) {
              console.log(`POST also failed for fieldName: ${fieldName}`);
              // Try next field name
              formData.delete(fieldName);
              continue;
            }
          }

          console.log('Profile image upload response:', response);

          // Check if the response contains a valid image URL
          let imageUrl = null;
          if (response && typeof response === 'object') {
            // Check common response formats
            imageUrl = response.logoUrl || response.logo || response.profileImageUrl ||
                       response.profileImage || response.profile_image || response.imageUrl ||
                       response.image || response.url || response.data?.logoUrl ||
                       response.data?.logo || response.data?.profileImageUrl;

            // Check nested profile object
            if (!imageUrl && response.profile) {
              imageUrl = response.profile.logoUrl || response.profile.logo ||
                         response.profile.profileImageUrl || response.profile.profileImage ||
                         response.profile.imageUrl || response.profile.image;
            }

            if (!imageUrl && response.profile?.profileImage && typeof response.profile.profileImage === 'string') {
              imageUrl = response.profile.profileImage;
            }
          }

          // If we got any image URL that's not the dummy one, return success
          if (imageUrl && imageUrl !== 'https://example.com/uploads/profile/john_doe.jpg') {
            console.log('Extracted profile image URL:', imageUrl);
            return {
              success: true,
              data: {
                imageUrl: imageUrl,
                ...(response ? response : {})
              }
            };
          }

          // If response is just a URL string, use that
          if (typeof response === 'string' && response.startsWith('http') &&
              response !== 'https://example.com/uploads/profile/john_doe.jpg') {
            console.log('Response was URL string:', response);
            return {
              success: true,
              data: {
                imageUrl: response,
                ...(response ? { response } : {})
              }
            };
          }

        } catch (error) {
          console.log(`Error with fieldName ${fieldName}:`, error.message);
          formData.delete(fieldName);
          continue;
        }

        // Clean up for next attempt
        formData.delete(fieldName);
      }

      // If we reach here, none of the field names worked
      throw new Error('All field name attempts failed. Check backend endpoint and field names.');

    }, 'Profile image upload failed');
  }
};
