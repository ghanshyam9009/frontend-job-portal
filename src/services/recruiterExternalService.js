// Recruiter External Service - AWS API Gateway endpoints provided
import axios from 'axios';

// Use environment variables for API URLs, with fallbacks for local development
const JOBS_URL = import.meta.env.VITE_RECRUITER_JOBS_URL || 'https://3lfruhyo2j.execute-api.ap-southeast-1.amazonaws.com/default/getallpostjobs';
const APPLICANTS_URL = import.meta.env.VITE_RECRUITER_APPLICANTS_URL || 'https://fab65y8p6d.execute-api.ap-southeast-1.amazonaws.com/default/getallappplicants';
const ACTIONS_URL = import.meta.env.VITE_RECRUITER_ACTIONS_URL || 'https://qghn0cpfqj.execute-api.ap-southeast-1.amazonaws.com/default/changeapplicationstatus';
const JOB_CLOSE_URL = import.meta.env.VITE_RECRUITER_JOB_CLOSE_URL || 'https://wxxi8h89m5.execute-api.ap-southeast-1.amazonaws.com/default/closedjobopening';
const UPDATE_JOB_URL = 'https://api.bigsources.in/api/job/Updatejobs';

export const recruiterExternalService = {
  async getAllPostedJobs(employerId) {
    const response = await axios.get(JOBS_URL, { params: { employer_id: employerId } });
    return response.data;
  },

  async getRecruiterProfile(employerId) {
    try {
      const response = await axios.get(JOBS_URL, { params: { employer_id: employerId } });
      // Extract company name from the first job's company_name field
      const data = response.data;
      if (data && data.jobs && data.jobs.length > 0) {
        const firstJob = data.jobs[0];
        return {
          company_name: firstJob.company_name,
          employer_id: employerId,
          jobs: data.jobs
        };
      }
      return { company_name: null, employer_id: employerId, jobs: [] };
    } catch (error) {
      console.error('Error fetching recruiter profile:', error);
      return { company_name: null, employer_id: employerId, jobs: [] };
    }
  },

  async getAllApplicants(jobId) {
    const response = await axios.get(APPLICANTS_URL, { params: { job_id: jobId } });
    return response.data;
  },

  async changeApplicationStatus(applicationId, statusBool) {
    const response = await axios.get(ACTIONS_URL, { params: { application_id: applicationId, status_bool: statusBool ? 1 : 0 } });
    return response.data;
  },
  
  async closeJobOpening(jobId) {
    const response = await axios.get(JOB_CLOSE_URL, { params: { job_id: jobId } });
    return response.data;
  },

  async getJobById(jobId, employerId) {
    const response = await axios.get(JOBS_URL, { params: { employer_id: employerId } });
    const data = response.data;
    if (data && data.jobs && data.jobs.length > 0) {
      const job = data.jobs.find(j => j.job_id === jobId);
      return job || null;
    }
    return null;
  },

  async updateJob(jobId, jobData) {
    const response = await axios.post(`${UPDATE_JOB_URL}/${jobId}`, jobData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Get company name and other recruiter details based on employer_id
  async getRecruiterCompanyName(employerId) {
    const response = await axios.get(JOBS_URL, { params: { employer_id: employerId } });
    const data = response.data;
    if (data && data.jobs && data.jobs.length > 0) {
      const firstJob = data.jobs[0];
      return {
        company_name: firstJob.company_name,
        employer_id: employerId,
        contact_email: firstJob.contact_email
      };
    }
    return null;
  },

  // Get specific application details (for admin to view/edit application data)
  async getApplicationById(applicationId) {
    try {
      // Since the API requires job_id and returns multiple applicants,
      // this method currently needs integration with the applications table
      // For now, return application info from the task data
      // This will need to be updated when specific application API is available
      return {
        application_id: applicationId,
        // Note: Complete application details would need specific API endpoint
      };
    } catch (error) {
      console.error('Error fetching application details:', error);
      return null;
    }
  },

  // Get all applicants for a specific job (for detailed view)
  async getApplicantsByJobId(jobId) {
    try {
      return await this.getAllApplicants(jobId);
    } catch (error) {
      console.error('Error fetching applicants for job:', error);
      return [];
    }
  }
};

export default recruiterExternalService;
