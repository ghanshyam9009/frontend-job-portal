import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const adminService = {
  async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.admin.register, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.admin.login, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.admin.resetPassword, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getProfile(email) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.admin.getProfile(email));
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(email, profileData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.admin.getProfile(email), profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Job Management Functions
  async getPendingJobs() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.jobs.getAll);
      // Assuming the response data is an array of jobs
      return response.data.filter(job => job.status === 'pending');
    } catch (error) {
      throw error;
    }
  },

  async approveJob(jobId) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.jobs.updateStatus(jobId), { status: 'approved' });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async rejectJob(jobId) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.jobs.updateStatus(jobId), { status: 'rejected' });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Candidate Management Functions
  async getCandidates() {
    try {
      // Mock data - replace with actual API call
      const mockCandidates = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0123',
          location: 'San Francisco, CA',
          experience: '5 years',
          skills: ['React', 'Node.js', 'Python'],
          status: 'active',
          created_at: '2025-01-10'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+1-555-0124',
          location: 'New York, NY',
          experience: '3 years',
          skills: ['Vue.js', 'PHP', 'MySQL'],
          status: 'active',
          created_at: '2025-01-09'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockCandidates;
    } catch (error) {
      throw error;
    }
  },

  // Employer Management Functions
  async getEmployers() {
    try {
      // Mock data - replace with actual API call
      const mockEmployers = [
        {
          id: 1,
          company_name: 'Tech Corp',
          email: 'hr@techcorp.com',
          phone: '+1-555-0100',
          location: 'San Francisco, CA',
          industry: 'Technology',
          company_size: '100-500',
          status: 'active',
          created_at: '2025-01-08'
        },
        {
          id: 2,
          company_name: 'StartupXYZ',
          email: 'careers@startupxyz.com',
          phone: '+1-555-0101',
          location: 'New York, NY',
          industry: 'Fintech',
          company_size: '10-50',
          status: 'active',
          created_at: '2025-01-07'
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockEmployers;
    } catch (error) {
      throw error;
    }
  },

  // Government Jobs Management Functions
  async createGovernmentJob(jobData) {
    try {
      const response = await apiClient.post('/job/Govtjobs', jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateGovernmentJob(jobId, jobData) {
    try {
      const response = await apiClient.put(`/job/updateGovtjobs/${jobId}`, jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getGovernmentJobs() {
    try {
      // Mock data - replace with actual API call
      const mockGovtJobs = [
        {
          id: "govt-1",
          job_title: "SSC CGL 2025 Notification",
          description: "Recruitment for various Group B & C posts in different ministries and departments.",
          location: "India",
          salary_range: "₹44,900 - ₹1,42,400",
          employment_type: "Full-time",
          department_name: "Staff Selection Commission",
          application_deadline: "2025-12-31",
          contact_email: "ssc@nic.in",
          posted_date: "2025-01-15",
          status: "Open",
          total_posts: 7500,
          application_fee: "₹100"
        },
        {
          id: "govt-2",
          job_title: "IBPS PO 2025",
          description: "Probationary Officer recruitment in various public sector banks.",
          location: "Pan India",
          salary_range: "₹36,000 - ₹63,840",
          employment_type: "Full-time",
          department_name: "Institute of Banking Personnel Selection",
          application_deadline: "2025-03-15",
          contact_email: "ibps@ibps.in",
          posted_date: "2025-01-10",
          status: "Open",
          total_posts: 4000,
          application_fee: "₹850"
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockGovtJobs;
    } catch (error) {
      throw error;
    }
  },

  // Application Management Functions
  async getJobApplications() {
    try {
      // Mock data - replace with actual API call
      const mockApplications = [
        {
          id: 1,
          job_id: "job-1",
          job_title: "Senior Software Engineer",
          company_name: "Tech Corp",
          candidate_name: "John Doe",
          candidate_email: "john.doe@email.com",
          candidate_phone: "+1-555-0123",
          application_date: "2025-01-15",
          status: "pending", // pending, approved, rejected
          resume_url: "/resumes/john_doe_resume.pdf",
          cover_letter: "I am very interested in this position...",
          experience: "5 years",
          skills: ["React", "Node.js", "Python"]
        },
        {
          id: 2,
          job_id: "job-2",
          job_title: "Product Manager",
          company_name: "StartupXYZ",
          candidate_name: "Jane Smith",
          candidate_email: "jane.smith@email.com",
          candidate_phone: "+1-555-0124",
          application_date: "2025-01-14",
          status: "approved",
          resume_url: "/resumes/jane_smith_resume.pdf",
          cover_letter: "I have extensive experience in product management...",
          experience: "3 years",
          skills: ["Product Management", "Agile", "Analytics"]
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockApplications;
    } catch (error) {
      throw error;
    }
  },

  async approveApplication(applicationId) {
    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Application approved and sent to recruiter' };
    } catch (error) {
      throw error;
    }
  },

  async rejectApplication(applicationId) {
    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Application rejected' };
    } catch (error) {
      throw error;
    }
  }
};
