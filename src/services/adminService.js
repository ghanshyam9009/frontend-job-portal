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

      const jobRowById = {};
      jobsData.forEach((j) => {
        if (j?.job_id != null) jobRowById[j.job_id] = j;
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

          // Get premium status - prioritize task.premium_job if it exists (from recent API calls), otherwise use jobs data
          const is_premium = task.premium_job !== undefined ? task.premium_job : (task.job_id ? premiumStatusMap[task.job_id] || false : false);

          const rawStatus = (task.status || 'pending').toString().toLowerCase();
          const status = ['pending', 'fulfilled', 'rejected'].includes(rawStatus) ? rawStatus : 'pending';
          const fromJob = task.job_id != null ? jobRowById[task.job_id] : null;
          const job_logo_url = fromJob?.job_logo_url ?? task.job_logo_url;
          const job_logo = fromJob?.job_logo ?? task.job_logo;
          const company_logo = fromJob?.company_logo ?? task.company_logo ?? fromJob?.logo ?? task.logo;
          const companyLogo = fromJob?.companyLogo ?? task.companyLogo;
          const logo = fromJob?.logo ?? task.logo;

          return {
            id: task.task_id,
            task_id: task.task_id,
            category: task.category,
            title: this.getTaskTitle(task),
            company_name: company_name,
            location: task.location || 'Unknown Location',
            salary: task.salary || 'Not specified',
            job_type: task.employment_type || 'Unknown',
            status,
            posted_date: task.created_at || new Date().toISOString(),
            updated_date: task.updated_at || new Date().toISOString(),
            description: task.description || 'No description available',
            job_id: task.job_id,
            recruiter_id: task.recruiter_id,
            application_id: task.application_id,
            student_id: task.student_id,
            is_premium: is_premium,
            job_logo_url,
            job_logo,
            company_logo,
            companyLogo,
            logo
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

  async rejectJob(taskId, rejectionReason) {
    try {
      return await adminExternalService.rejectJobPosting(taskId, rejectionReason);
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

  async approveReopenJob(taskId, jobId) {
    try {
      return await adminExternalService.approveReopenJob(taskId, jobId);
    } catch (error) {
      throw error;
    }
  },

  async closeJobAdmin(payload) {
    try {
      return await adminExternalService.closeJobAdmin(payload);
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
    // API requires job_id and employer_id in body; use same payload for primary and fallback
    const payload = {
      ...jobData,
      job_id: jobData.job_id || jobId,
      employer_id: jobData.employer_id
    };
    try {
      const response = await adminApiClient.post(`/job/updateadminjobs/${jobId}`, payload);
      return response.data;
    } catch (error) {
      try {
        const fallbackResponse = await adminApiClient.post(`/job/Updatejobs/${jobId}`, payload);
        return fallbackResponse.data;
      } catch (fallbackErr) {
        console.error('Error updating admin job (primary and fallback):', error, fallbackErr);
        throw fallbackErr;
      }
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
      const response = await adminApiClient.post(API_ENDPOINTS.admin.deleteAdminJob(jobId));
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

        // Extract city from location data
        const getCityOnly = () => {
          const locationData = candidate.location || candidate.address;
          if (!locationData) return 'Not specified';
          if (typeof locationData === 'string') {
            // If it's already a string, take first part before comma (likely the city)
            return locationData.split(',')[0].trim() || 'Not specified';
          }
          if (typeof locationData === 'object') {
            if (Array.isArray(locationData)) {
              return locationData[0] || 'Not specified'; // First element might be city
            }
            // Return only the city from the object, ignore street
            return locationData.city || 'Not specified';
          }
          return 'Not specified';
        };

        return {
          id: candidate.candidate_id || candidate.user_id || candidate.id,
          name: candidate.full_name || candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown',
          email: candidate.email || '',
          phone: candidate.phone_number || candidate.phone || '',
          location: normalizeLocation(), // Keep full address for other uses
          city: getCityOnly(), // Add separate city field for display
          experience: normalizeExperience(),
          skills: normalizeSkills(candidate.skills),
          status: candidate.status || 'active',
          is_admin_closed: candidate.is_admin_closed, // Include the blocking field
          created_at: candidate.created_at || candidate.registration_date || new Date().toISOString(),
          profile_image: candidate.profile_image || null,
          logo: candidate.profile_image || candidate.logo || null, // Include logo field for compatibility
          resume: candidate.resume || candidate.resumeUrl || null, // Use resume or resumeUrl directly from candidate
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

  async blockStudent(email) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://api.bigsources.in/api/admin/block-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error blocking student:', error);
      throw error;
    }
  },

  async blockRecruiter(email) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://api.bigsources.in/api/admin/block-recruiter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error blocking recruiter:', error);
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

      // Handle different response structures
      let recruitersArray = [];

      if (response.data) {
        // Check if response.data is already an array
        if (Array.isArray(response.data)) {
          recruitersArray = response.data;
        }
        // Check if response.data has a recruiters array
        else if (response.data.recruiters && Array.isArray(response.data.recruiters)) {
          recruitersArray = response.data.recruiters;
        }
        // Check if response.data has an employers array
        else if (response.data.employers && Array.isArray(response.data.employers)) {
          recruitersArray = response.data.employers;
        }
        // Check if response.data has a single employer object
        else if (response.data.employer) {
          recruitersArray = [response.data.employer];
        }
        // Check if response.data itself is the recruiter object
        else if (response.data.email || response.data.employer_id) {
          recruitersArray = [response.data];
        }
      }

      return { recruiters: recruitersArray };
    } catch (error) {
      console.error('Error fetching recruiters:', error);
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

      // Filter for government jobs based on job_type field
      const govtJobs = allJobs.filter(job =>
        job.job_type === "GOVERNMENT"
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
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://api.bigsources.in/api/premium/mark-job-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          category: category,
          is_premium: isPremium,
          job_id: jobId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking job as premium:', error);
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

  normalizeJobDetailLambdaResponse(raw) {
    if (raw == null) return null;
    let data = raw;
    if (typeof data.body === 'string') {
      try {
        data = JSON.parse(data.body);
      } catch {
        return null;
      }
    }
    const job =
      data?.job ??
      data?.data ??
      (Array.isArray(data?.jobs) ? data.jobs[0] : null) ??
      (data?.job_id != null || data?.id != null ? data : null);
    return job;
  },

  mapToReportJob(from) {
    if (!from) return null;
    const id = from.job_id ?? from.id;
    return {
      ...from,
      id,
      job_id: from.job_id ?? id,
      application_count: from.application_count ?? 0,
    };
  },

  passesRecruiterReportRules(job) {
    if (!job) return false;
    if (job.job_type === 'GOVERNMENT') return false;
    const pb = (job.posted_by || '').toString().trim().toUpperCase();
    if (pb === 'ADMIN') return false;
    return pb === 'RECRUITER' || pb === 'EMPLOYER' || Boolean(job.recruiter_id);
  },

  /**
   * Single job via getalljobs?job_id= (public GET — same pattern as PendingJobApplications).
   */
  async getJobByIdViaGetAllJobsQuery(jobId) {
    if (jobId == null || jobId === '') return null;
    const idNorm = String(jobId).trim();
    try {
      const apiUrl = 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
      const response = await fetch(`${apiUrl}?job_id=${encodeURIComponent(idNorm)}`);
      if (!response.ok) return null;
      const jobData = await response.json();
      if (Array.isArray(jobData.jobs)) {
        const match = jobData.jobs.find((j) => {
          const jid = j.job_id ?? j.id;
          if (jid == null) return false;
          return String(jid) === idNorm || String(jid) === String(Number(idNorm));
        });
        return match || null;
      }
      const single = jobData.job ?? jobData.data;
      if (single && (single.job_id != null || single.id != null)) return single;
      if (jobData.job_id != null || jobData.id != null) return jobData;
      return null;
    } catch (error) {
      console.error('getalljobs?job_id= failed:', error);
      return null;
    }
  },

  /**
   * Job detail for admin report: 1) getjobdetail (GET_JOB_DETAIL_URL / VITE_ADMIN_GET_JOB_DETAIL_URL)
   * 2) getalljobs?job_id= 3) full list scan.
   */
  async getJobDetailForReport(jobId) {
    if (jobId == null || jobId === '') return null;

    try {
      const raw = await adminExternalService.getJobDetailFromLambda(jobId);
      const fromLambda = this.normalizeJobDetailLambdaResponse(raw);
      const mapped = this.mapToReportJob(fromLambda);
      if (mapped && this.passesRecruiterReportRules(mapped)) {
        return mapped;
      }
    } catch (error) {
      console.warn('getjobdetail failed, falling back:', error?.message || error);
    }

    try {
      const fromQuery = await this.getJobByIdViaGetAllJobsQuery(jobId);
      const mapped = this.mapToReportJob(fromQuery);
      if (mapped && this.passesRecruiterReportRules(mapped)) {
        return mapped;
      }
    } catch (error) {
      console.warn('getalljobs?job_id= failed:', error);
    }

    return this.getRecruiterJobForReportById(jobId);
  },

  /** Fetch all jobs (no status filter) for admin - to include pending/rejected in reports */
  async getAllJobsForAdmin() {
    try {
      const apiUrl = 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
      const response = await fetch(`${apiUrl}?page=1&limit=5000`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jobsData = await response.json();
      const jobs = jobsData?.jobs || jobsData?.data || (Array.isArray(jobsData) ? jobsData : []);
      return Array.isArray(jobs) ? jobs : [];
    } catch (error) {
      console.error('Failed to fetch all jobs for admin:', error);
      return [];
    }
  },

  /**
   * Single recruiter job for admin job reports / detail (one getalljobs call, no applications lambda).
   * Matches recruiter-report filters: not government, not admin-posted, recruiter or employer or recruiter_id.
   */
  async getRecruiterJobForReportById(jobId) {
    if (jobId == null || jobId === '') return null;
    try {
      const all = await this.getAllJobsForAdmin();
      const idNorm = String(jobId).trim();
      const found = (all || []).find((j) => {
        const jid = j.job_id ?? j.id;
        if (jid == null) return false;
        return String(jid) === idNorm || String(jid) === String(Number(idNorm));
      });
      if (!found) return null;
      if (found.job_type === 'GOVERNMENT') return null;
      const pb = (found.posted_by || '').toString().trim().toUpperCase();
      if (pb === 'ADMIN') return null;
      const isRecruiter =
        pb === 'RECRUITER' || pb === 'EMPLOYER' || Boolean(found.recruiter_id);
      if (!isRecruiter) return null;
      const id = found.job_id || found.id;
      return {
        ...found,
        id,
        application_count: found.application_count ?? 0,
      };
    } catch (error) {
      console.error('Failed to resolve recruiter job for report:', error);
      return null;
    }
  },

  /**
   * Admin’s own posted job for Manage Jobs (job posting) detail — one getalljobs call via candidate API, no applications lambda.
   */
  async getAdminPostedJobForManage(adminId, jobId) {
    if (adminId == null || jobId == null || jobId === '') return null;
    try {
      const { candidateExternalService } = await import('./candidateExternalService');
      const jobsData = await candidateExternalService.getAllJobs();
      const jobs = jobsData?.jobs || [];
      const idNorm = String(jobId).trim();
      const parsed = parseInt(idNorm, 10);
      const found = jobs.find((j) => {
        const jid = j.job_id ?? j.id;
        if (jid == null) return false;
        const idMatch =
          jid === parsed ||
          String(jid) === idNorm ||
          (Number.isFinite(parsed) && parseInt(String(jid), 10) === parsed);
        if (!idMatch) return false;
        const aid = j.admin_id;
        const adminMatch =
          aid === adminId ||
          String(aid) === String(adminId);
        if (!adminMatch) return false;
        if ((j.posted_by || '').toLowerCase() !== 'admin') return false;
        if (j.job_type === 'GOVERNMENT') return false;
        return true;
      });
      if (!found) return null;
      const id = found.job_id || found.id;
      return {
        ...found,
        id,
        application_count: found.application_count ?? 0,
      };
    } catch (error) {
      console.error('Failed to resolve admin posted job for manage:', error);
      return null;
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
