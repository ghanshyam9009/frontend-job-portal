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

      // Fetch all jobs from external API to get premium status
      let jobsData = [];
      try {
        const apiUrl = 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
        const searchParams = {
          page: 1,
          limit: 1000, // Get all jobs to ensure we have premium status for all
          status: 'approved'
        };

        const queryString = new URLSearchParams(searchParams).toString();
        const jobsResponse = await fetch(`${apiUrl}?${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (jobsResponse.ok) {
          const jobsResult = await jobsResponse.json();
          jobsData = jobsResult?.jobs || jobsResult.data || jobsResult || [];
        }
      } catch (error) {
        console.error('Error fetching jobs data for premium status:', error);
        // Continue without premium status if API fails
      }

      // Create a map of job_id to premium status for quick lookup
      const premiumStatusMap = {};
      jobsData.forEach(job => {
        if (job.job_id) {
          premiumStatusMap[job.job_id] = job.is_premium || false;
        }
      });

      // Ensure we return an array of jobs
      if (response && Array.isArray(response.tasks)) {
        // Process tasks with pre-fetched recruiter data and premium status
        const processedTasks = response.tasks.map((task) => {
          let company_name = task.company_name || 'Unknown Company';

          // Use pre-fetched recruiter data if available
          if (task.recruiter_id && recruiterData[task.recruiter_id]) {
            company_name = recruiterData[task.recruiter_id].company_name;
          }

          // Get premium status from the jobs data
          const is_premium = task.job_id ? premiumStatusMap[task.job_id] || false : false;

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
            student_id: task.student_id,
            is_premium: is_premium
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

      console.log(`Fetched ${jobs.length} jobs from external API`);

      // Optimized batch processing to avoid overwhelming the API
      const { recruiterExternalService } = await import('./recruiterExternalService');

      const BATCH_SIZE = 5; // Process 5 jobs at a time
      const DELAY_MS = 200; // 200ms delay between batches
      const RETRY_ATTEMPTS = 2; // Retry failed requests up to 2 times

      const jobsWithCounts = [];
      const errors = [];

      // Process jobs in batches
      for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jobs.length / BATCH_SIZE)} (${batch.length} jobs)`);

        // Process batch in parallel
        const batchPromises = batch.map(async (job) => {
          const jobId = job.job_id || job.id;

          // Retry logic for failed API calls
          for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
            try {
              console.log(`Fetching applicants for job ${jobId} (attempt ${attempt + 1})`);
              const applicantsData = await recruiterExternalService.getAllApplicants(jobId);

              // Handle different response formats from the API
              let applications = [];
              let applicationCount = 0;

              if (applicantsData) {
                if (Array.isArray(applicantsData)) {
                  // Direct array of applications
                  applications = applicantsData;
                  applicationCount = applicantsData.length;
                } else if (applicantsData.applications && Array.isArray(applicantsData.applications)) {
                  // Object with applications array and count
                  applications = applicantsData.applications;
                  applicationCount = applicantsData.count || applicantsData.applications.length;
                } else if (typeof applicantsData === 'object' && applicantsData.count !== undefined) {
                  // Object with count but no applications array
                  applicationCount = applicantsData.count;
                  applications = [];
                }
              }

              console.log(`Job ${jobId}: ${applicationCount} applications`);
              return {
                ...job,
                application_count: applicationCount,
                applications: applications
              };
            } catch (error) {
              console.error(`Attempt ${attempt + 1} failed for job ${jobId}:`, error.message);

              if (attempt === RETRY_ATTEMPTS) {
                // All retry attempts failed
                errors.push({ jobId, error: error.message });
                return {
                  ...job,
                  application_count: 0,
                  applications: []
                };
              }

              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
          }
        });

        // Wait for current batch to complete
        const batchResults = await Promise.all(batchPromises);
        jobsWithCounts.push(...batchResults);

        // Add delay between batches (except for the last batch)
        if (i + BATCH_SIZE < jobs.length) {
          console.log(`Waiting ${DELAY_MS}ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }

      console.log(`Processing complete. ${jobsWithCounts.length} jobs processed.`);
      if (errors.length > 0) {
        console.warn(`${errors.length} jobs had API errors:`, errors);
      }

      const totalApplications = jobsWithCounts.reduce((sum, job) => sum + (job.application_count || 0), 0);
      console.log(`Total applications across all jobs: ${totalApplications}`);

      return jobsWithCounts;
    } catch (error) {
      console.error('Failed to fetch jobs with application counts:', error);
      return [];
    }
  }
};
