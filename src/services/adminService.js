import adminApiClient from './adminApiClient';
import { API_ENDPOINTS } from '../config/api';
import { adminExternalService } from './adminExternalService';

export const adminService = {
  async register(userData) {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.admin.register, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.admin.login, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email, password) {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.admin.resetPassword, { email, password });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getProfile(email) {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.admin.getProfile(email));
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(email, profileData) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.admin.getProfile(email), profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Optimized function to fetch all recruiter data in one call
  async getAllRecruiterData() {
    try {
      // Get all recruiters first
      const recruitersResponse = await this.getAllRecruiters();
      const recruiters = recruitersResponse?.recruiters || recruitersResponse || [];

      // Create a map of recruiter_id to company_name
      const recruiterMap = {};
      recruiters.forEach(recruiter => {
        if (recruiter.employer_id) {
          recruiterMap[recruiter.employer_id] = {
            company_name: recruiter.company_name || 'Unknown Company',
            email: recruiter.email,
            status: recruiter.status
          };
        }
      });

      return recruiterMap;
    } catch (error) {
      console.error('Error fetching all recruiter data:', error);
      return {};
    }
  },

  // Job Management Functions
  async getPendingJobs() {
    try {
      // Using the external service to get all tasks
      const response = await adminExternalService.getAllTasks();

      // Fetch all recruiter data in one optimized call
      const recruiterData = await this.getAllRecruiterData();

      // Ensure we return an array of jobs
      if (response && Array.isArray(response.tasks)) {
        // Process tasks with pre-fetched recruiter data
        const processedTasks = response.tasks.map((task) => {
          let company_name = task.company_name || 'Unknown Company';

          // Use pre-fetched recruiter data if available
          if (task.recruiter_id && recruiterData[task.recruiter_id]) {
            company_name = recruiterData[task.recruiter_id].company_name;
          }

          return {
            id: task.task_id,
            task_id: task.task_id,
            category: task.category,
            title: this.getTaskTitle(task),
            company_name: company_name,
            location: task.location || 'Unknown Location',
            salary: task.salary || 'Not specified',
            job_type: task.employment_type || 'Unknown',
            status: task.status || 'pending',
            posted_date: task.created_at || new Date().toISOString(),
            updated_date: task.updated_at || new Date().toISOString(),
            description: task.description || 'No description available',
            job_id: task.job_id,
            recruiter_id: task.recruiter_id,
            application_id: task.application_id,
            student_id: task.student_id
          };
        });

        return processedTasks;
      }
      return [];
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      return [];
    }
  },

  getTaskTitle(task) {
    switch (task.category) {
      case 'postnewjob':
        return `New Job Posting - Job ID: ${task.job_id || 'Unknown'}`;
      case 'editjob':
        return `Edit Job - Job ID: ${task.job_id || 'Unknown'}`;
      case 'closedjob':
        return `Close Job - Job ID: ${task.job_id || 'Unknown'}`;
      case 'newapplication':
        return `New Application - Student ID: ${task.student_id || 'Unknown'}`;
      case 'change status of application':
        return `Application Status Change - Application ID: ${task.application_id || 'Unknown'}`;
      default:
        return `${task.category || 'Unknown Task'}`;
    }
  },

  async approveJob(taskId) {
    try {
      // Using the external service for job posting approval
      return await adminExternalService.approveJobPosting(taskId, 1);
    } catch (error) {
      throw error;
    }
  },

  async rejectJob(taskId) {
    try {
      // Using the external service for job posting rejection
      return await adminExternalService.rejectJobPosting(taskId, 0);
    } catch (error) {
      throw error;
    }
  },

  async approveEditedJob(taskId) {
    try {
      return await adminExternalService.approveEditedJob(taskId);
    } catch (error) {
      throw error;
    }
  },

  async approveJobClosing(taskId) {
    try {
      return await adminExternalService.approveJobClosing(taskId);
    } catch (error) {
      throw error;
    }
  },

  async approveJobApplicationByStudent(taskId) {
    try {
      return await adminExternalService.approveJobApplicationByStudent(taskId);
    } catch (error) {
      throw error;
    }
  },

  async approveApplicationStatusChanged(taskId) {
    try {
      return await adminExternalService.approveApplicationStatusChanged(taskId);
    } catch (error) {
      throw error;
    }
  },

  async editTask(taskId, taskData) {
    try {
      // Placeholder for edit functionality
      // Assuming an API endpoint exists or needs to be implemented
      // For example, using adminExternalService.editTask if available
      // return await adminExternalService.editTask(taskId, taskData);
      console.log('Editing task:', taskId, taskData);
      return { message: 'Task edited successfully (placeholder)' };
    } catch (error) {
      throw error;
    }
  },

  // Candidate Management Functions
  async getCandidates() {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.candidates.getAll);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Employer Management Functions
  async getEmployers() {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.employers.getAll);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Recruiter Management Functions
  async getAllRecruiters() {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.admin.getAllRecruiters);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async approveRecruiter(recruiter) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.admin.approveRecruiter, {
        email: recruiter.email
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateRecruiter(recruiterId, recruiterData) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.admin.updateRecruiter, {
        employer_id: recruiterId,
        ...recruiterData
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async rejectRecruiter(recruiter) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.admin.rejectRecruiter, {
        email: recruiter.email,
        status: 'rejected'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Government Jobs Management Functions
  async createGovernmentJob(jobData) {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.jobs.createGovernmentJob, jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateGovernmentJob(jobId, jobData) {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.jobs.updateGovernmentJob(jobId), jobData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getGovernmentJobs() {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.jobs.getGovernmentJobs);
      return response.data || [];
    } catch (error) {
      throw error;
    }
  },

  // Application Management Functions
  async getJobApplications() {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.applications.getAll);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async approveApplication(applicationId) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.applications.updateStatus(applicationId), { status: 'approved' });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async rejectApplication(applicationId) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.applications.updateStatus(applicationId), { status: 'rejected' });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Premium Management Functions
  async getPremiumPrices() {
    try {
      const response = await adminApiClient.get(API_ENDPOINTS.premium.getPremiumPrices);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updatePremiumPrices(priceData) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.premium.updatePremiumPrices, priceData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async markJobPremium(jobId, isPremium = true, category = 'job') {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.premium.markJobPremium, {
        job_id: jobId,
        is_premium: isPremium,
        category: category
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async markStudentPremium(email, isPremium = true, plan = 'gold') {
    try {
      const response = await adminApiClient.post(API_ENDPOINTS.premium.markStudentPremium, {
        email: email,
        is_premium: isPremium,
        plan: plan
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Job Applications Summary Functions
  async getJobsWithApplicationCounts() {
    try {
      // Fetch all active jobs using the external API (same as JobListings.jsx)
      const apiUrl = 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
      const searchParams = {
        page: 1,
        limit: 1000, // Get all active jobs
        status: 'approved'
      };

      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${apiUrl}?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jobsData = await response.json();
      const jobs = jobsData?.jobs || jobsData.data || jobsData || [];

      // Debug: Log jobs to check structure
      console.log('Fetched jobs from external API:', jobs);

      // Fetch applicants for each job individually
      const { recruiterExternalService } = await import('./recruiterExternalService');

      const jobsWithCounts = await Promise.all(
        jobs.slice(0, 10).map(async (job) => { // Limit to first 10 jobs for testing
          try {
            console.log(`Fetching applicants for job ${job.job_id || job.id}`);
            // Get applicants for this specific job
            const applicantsData = await recruiterExternalService.getAllApplicants(job.job_id || job.id);
            console.log(`API response for job ${job.job_id || job.id}:`, applicantsData);

            // The API returns an array of applicants with student_id, count them
            const applicationCount = applicantsData && Array.isArray(applicantsData) ? applicantsData.length : 0;

            return {
              ...job,
              application_count: applicationCount,
              applications: applicantsData || []
            };
          } catch (error) {
            console.error(`Failed to fetch applicants for job ${job.id}:`, error);
            // Return job with zero applications on error
            return {
              ...job,
              application_count: 0,
              applications: []
            };
          }
        })
      );

      console.log('Jobs with counts:', jobsWithCounts);
      return jobsWithCounts;
    } catch (error) {
      console.error('Failed to fetch jobs with application counts:', error);
      return [];
    }
  }
};
