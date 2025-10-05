import apiClient from './apiClient';

export const applicationService = {
  // Apply for a job
  async applyForJob(jobId, applicationData) {
    try {
      const response = await apiClient.post(`/api/application/jobs/${jobId}/apply`, applicationData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user's applications
  async getUserApplications(userId) {
    try {
      // Mock data - replace with actual API call
      const mockApplications = [
        {
          id: 1,
          job_id: "job-1",
          job_title: "Senior Software Engineer",
          company_name: "Tech Corp",
          application_date: "2025-01-15",
          status: "pending", // pending, approved, rejected, shortlisted
          applied_at: "2025-01-15T10:30:00Z"
        },
        {
          id: 2,
          job_id: "job-2",
          job_title: "Product Manager",
          company_name: "StartupXYZ",
          application_date: "2025-01-14",
          status: "shortlisted",
          applied_at: "2025-01-14T14:20:00Z"
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockApplications;
    } catch (error) {
      throw error;
    }
  },

  // Get application status
  async getApplicationStatus(applicationId) {
    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { 
        status: 'pending',
        message: 'Your application is under review',
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  },

  // Withdraw application
  async withdrawApplication(applicationId) {
    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Application withdrawn successfully' };
    } catch (error) {
      throw error;
    }
  }
};
