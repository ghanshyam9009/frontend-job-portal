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

  // Admin Job Management Functions
  async postJobByAdmin(jobData) {
    try {
      const response = await adminApiClient.post('/job/jobsadmin', jobData);
      return response.data;
    } catch (error) {
      console.error('Error posting job by admin:', error);
      throw error;
    }
  },

  async updateAdminJob(jobId, jobData) {
    try {
      const response = await adminApiClient.post(`/job/updateadminjobs/${jobId}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error updating admin job:', error);
      throw error;
    }
  },

  async getAdminPostedJobs() {
    try {
      const response = await adminApiClient.get('/job/adminjobs');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching admin posted jobs:', error);
      return [];
    }
  },

  async deleteAdminJob(jobId) {
    try {
      const response = await adminApiClient.delete(`/job/adminjobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting admin job:', error);
      throw error;
    }
  },

  async closeAdminJob(jobId) {
    try {
      const response = await adminApiClient.post(`/job/closedadminjobs/${jobId}`, { job_id: jobId });
      return response.data;
    } catch (error) {
      console.error('Error closing admin job:', error);
      throw error;
    }
  },

  // Candidate Management Functions
  async getCandidates() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://api.bigsources.in/api/admin/get-all-candidates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Transform the API response to match the expected format
      let candidateArray = [];

      if (Array.isArray(data)) {
        candidateArray = data;
      } else if (data && typeof data === 'object') {
        // Check for multiple possible array keys
        if (Array.isArray(data.candidates)) {
          candidateArray = data.candidates;
        } else if (Array.isArray(data.recruiters)) {  // API uses "recruiters" for candidates
          candidateArray = data.recruiters;
        } else if (Array.isArray(data.data)) {
          candidateArray = data.data;
        } else if (Array.isArray(data.students)) {
          candidateArray = data.students;
        } else {
          // If no arrays found, wrap object in array or treat as empty
          candidateArray = [];
        }
      } else {
        candidateArray = [];
      }

      console.log('Candidate Array:', candidateArray);

      const candidates = candidateArray.map(candidate => {
        const normalizeSkills = (skillsValue) => {
          if (!skillsValue) return [];
          if (Array.isArray(skillsValue)) {
            return skillsValue.map(skill => {
              if (typeof skill === 'string') return skill.trim();
              if (skill && typeof skill === 'object') {
                return [skill.name, skill.level].filter(Boolean).join(' - ') || 'Skill';
              }
              return 'Skill';
            }).filter(Boolean);
          }
          if (typeof skillsValue === 'object') {
            return Object.values(skillsValue).map(value => value?.toString().trim()).filter(Boolean);
          }
          return skillsValue.split(',').map(s => s.trim()).filter(Boolean);
        };

        const normalizeExperience = () => {
          if (candidate.experience_years) {
            return typeof candidate.experience_years === 'string'
              ? candidate.experience_years
              : `${candidate.experience_years} years`;
          }
          const experienceData = candidate.experience;
          if (!experienceData) return 'Not specified';
          if (typeof experienceData === 'string') return experienceData;
          if (Array.isArray(experienceData)) {
            if (experienceData.length === 0) return 'Not specified';
            return experienceData
              .map(exp => {
                if (typeof exp === 'string') return exp;
                if (exp && typeof exp === 'object') {
                  return [exp.title, exp.company, exp.duration].filter(Boolean).join(' | ');
                }
                return '';
              })
              .filter(Boolean)
              .join(', ');
          }
          if (typeof experienceData === 'object') {
            return [experienceData.title, experienceData.company, experienceData.duration]
              .filter(Boolean)
              .join(' | ') || 'Not specified';
          }
          return 'Not specified';
        };

        const normalizeLocation = () => {
          const locationData = candidate.location || candidate.address;
          if (!locationData) return 'Not specified';
          if (typeof locationData === 'string') return locationData;
          if (typeof locationData === 'object') {
            if (Array.isArray(locationData)) {
              return locationData.join(', ');
            }
            return [locationData.street, locationData.city, locationData.state, locationData.country]
              .filter(Boolean)
              .join(', ') || 'Not specified';
          }
          return 'Not specified';
        };

        return {
          id: candidate.candidate_id || candidate.user_id || candidate.id,
          name: candidate.full_name || candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown',
          email: candidate.email || '',
          phone: candidate.phone_number || candidate.phone || '',
          location: normalizeLocation(),
          experience: normalizeExperience(),
          skills: normalizeSkills(candidate.skills),
          status: candidate.status || 'active',
          created_at: candidate.created_at || candidate.registration_date || new Date().toISOString(),
          profile_image: candidate.profile_image || null,
          bio: candidate.bio || '',
          education: candidate.education || [],
          dob: candidate.dob || null,
          gender: candidate.gender || null,
          role: candidate.role || 'Candidate',
          premium_user: candidate.premium_user || false,
          plan: candidate.plan || null
        };
      });

      console.log('Transformed candidates:', candidates);
      return candidates;
    } catch (error) {
      console.error('Error fetching candidates from API:', error);
      throw error;
    }
  },

  async updateCandidateStatus(email, status) {
    try {
      const response = await adminApiClient.put(API_ENDPOINTS.admin.updateCandidateStatus(email), { status });
      return response.data;
    } catch (error) {
      console.error('Error updating candidate status:', error);
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
      // Send email as JSON object in request body
      const response = await adminApiClient.put(API_ENDPOINTS.admin.approveRecruiter, {
        email: recruiter.email
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
      // Fetch all jobs from the general jobs API and filter for government jobs posted by admin
      const apiUrl = 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
      const searchParams = {
        page: 1,
        limit: 1000, // Get all jobs
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
      const allJobs = jobsData?.jobs || jobsData.data || jobsData || [];

      // Filter for government jobs posted by admin
      const govtJobs = allJobs.filter(job =>
        job.posted_by === 'admin' &&
        (job.department_name?.toLowerCase().includes('government') ||
         job.department_name?.toLowerCase().includes('commission') ||
         job.department_name?.toLowerCase().includes('board') ||
         job.department_name?.toLowerCase().includes('railway') ||
         job.department_name?.toLowerCase().includes('police') ||
         job.department_name?.toLowerCase().includes('public sector') ||
         job.department_name?.toLowerCase().includes('psu') ||
         job.department_name?.toLowerCase().includes('central govt') ||
         job.department_name?.toLowerCase().includes('state govt') ||
         job.department_name?.toLowerCase().includes('ministry') ||
         job.department_name?.toLowerCase().includes('department') ||
         job.category?.toLowerCase().includes('government') ||
         job.job_title?.toLowerCase().includes('govt') ||
         job.job_title?.toLowerCase().includes('government') ||
         job.job_title?.toLowerCase().includes('railway') ||
         job.job_title?.toLowerCase().includes('police') ||
         job.job_title?.toLowerCase().includes('upsc') ||
         job.job_title?.toLowerCase().includes('ssc') ||
         job.job_title?.toLowerCase().includes('bank') ||
         job.job_title?.toLowerCase().includes('defense') ||
         job.job_title?.toLowerCase().includes('army') ||
         job.job_title?.toLowerCase().includes('navy') ||
         job.job_title?.toLowerCase().includes('air force'))
      );

      return govtJobs;
    } catch (error) {
      console.error('Error fetching government jobs:', error);
      return [];
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

  async getJobsWithApplicationCounts() {
    try {
      const apiUrl = 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
      const searchParams = {
        page: 1,
        limit: 1000, 
        status: 'approved'
      };

      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${apiUrl}?${queryString}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jobsData = await response.json();
      const jobs = jobsData?.jobs || jobsData.data || [];

      return jobs.map(job => ({
        ...job,
        id: job.job_id,
        application_count: job.application_count || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch jobs with application counts:', error);
      return [];
    }
  },

  async getApplicationsForJob(jobId) {
    try {
        const { recruiterExternalService } = await import('./recruiterExternalService');
        const applicantsData = await recruiterExternalService.getAllApplicants(jobId);
        return applicantsData;
    } catch (error) {
        console.error(`Failed to fetch applications for job ${jobId}:`, error);
        return { applications: [] };
    }
  },
};


export default adminService;
