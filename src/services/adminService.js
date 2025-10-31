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

  // Job Management Functions
  async getPendingJobs() {
    try {
      // Using the external service to get all tasks
      const response = await adminExternalService.getAllTasks();
      // Ensure we return an array of jobs
      if (response && Array.isArray(response.tasks)) {
        // Create a map to cache company names and avoid duplicate API calls
        const companyCache = new Map();

        // Process tasks and fetch company names for recruits with recruiter_id
        const processedTasks = await Promise.all(
          response.tasks.map(async (task) => {
            let company_name = task.company_name || 'Unknown Company';

            // If we have a recruiter_id, fetch company name using the jobs API
            if (task.recruiter_id && !companyCache.has(task.recruiter_id)) {
              try {
                // Import recruiterExternalService dynamically to avoid circular dependency
                const { recruiterExternalService } = await import('./recruiterExternalService');
                const recruiterData = await recruiterExternalService.getAllPostedJobs(task.recruiter_id);
                if (recruiterData && recruiterData.jobs && recruiterData.jobs.length > 0) {
                  company_name = recruiterData.jobs[0].company_name || company_name;
                }
                companyCache.set(task.recruiter_id, company_name);
              } catch (error) {
                console.error(`Error fetching company for recruiter ${task.recruiter_id}:`, error);
                // Use cached value if available, otherwise keep default
                if (companyCache.has(task.recruiter_id)) {
                  company_name = companyCache.get(task.recruiter_id);
                }
              }
            } else if (task.recruiter_id && companyCache.has(task.recruiter_id)) {
              // Use cached company name
              company_name = companyCache.get(task.recruiter_id);
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
          })
        );

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
