// Recruiter External Service - AWS API Gateway endpoints provided
import axios from 'axios';

// Use environment variables for API URLs, with fallbacks for local development
const JOBS_URL = import.meta.env.VITE_RECRUITER_JOBS_URL || 'https://3lfruhyo2j.execute-api.ap-southeast-1.amazonaws.com/default/getallpostjobs';
const APPLICANTS_URL = import.meta.env.VITE_RECRUITER_APPLICANTS_URL || 'https://fab65y8p6d.execute-api.ap-southeast-1.amazonaws.com/default/getallappplicants';
const ACTIONS_URL = import.meta.env.VITE_RECRUITER_ACTIONS_URL || 'https://qghn0cpfqj.execute-api.ap-southeast-1.amazonaws.com/default/changeapplicationstatus';
const JOB_CLOSE_URL = import.meta.env.VITE_RECRUITER_JOB_CLOSE_URL || 'https://wxxi8h89m5.execute-api.ap-southeast-1.amazonaws.com/default/closedjobopening';

export const recruiterExternalService = {
  async getAllPostedJobs(employerId) {
    const response = await axios.get(JOBS_URL, { params: { employer_id: employerId } });
    return response.data;
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
  }
};

export default recruiterExternalService;
