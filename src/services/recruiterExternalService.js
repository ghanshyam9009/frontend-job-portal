// Recruiter External Service - AWS API Gateway endpoints provided
import axios from 'axios';

// Prefer env overrides; fall back to provided hosts
const JOBS_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RECRUITER_JOBS_BASE) || 'https://3lfruhyo2j.execute-api.ap-southeast-1.amazonaws.com';
const APPLICANTS_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RECRUITER_APPLICANTS_BASE) || 'https://fab65y8p6d.execute-api.ap-southeast-1.amazonaws.com';
const ACTIONS_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RECRUITER_ACTIONS_BASE) || 'https://qghn0cpfqj.execute-api.ap-southeast-1.amazonaws.com';
const JOB_CLOSE_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RECRUITER_JOB_CLOSE_BASE) || 'https://wxxi8h89m5.execute-api.ap-southeast-1.amazonaws.com';

export const recruiterExternalService = {
  async getAllPostedJobs(employerId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/recruiter/jobs/default/getallpostjobs`
      : `${JOBS_BASE}/default/getallpostjobs`;
    const response = await axios.get(url, { params: { employer_id: employerId } });
    return response.data;
  },

  async getAllApplicants(jobId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/recruiter/applicants/default/getallappplicants`
      : `${APPLICANTS_BASE}/default/getallappplicants`;
    const response = await axios.get(url, { params: { job_id: jobId } });
    return response.data;
  },

  async changeApplicationStatus(applicationId, statusBool) {
    const url = (import.meta.env?.DEV)
      ? `/ext/recruiter/actions/default/changeapplicationstatus`
      : `${ACTIONS_BASE}/default/changeapplicationstatus`;
    const response = await axios.get(url, { params: { application_id: applicationId, status_bool: statusBool ? 1 : 0 } });
    return response.data;
  },
  
  async closeJobOpening(jobId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/recruiter/job-close/default/closedjobopening`
      : `${JOB_CLOSE_BASE}/default/closedjobopening`;
    const response = await axios.get(url, { params: { job_id: jobId } });
    return response.data;
  }
};

export default recruiterExternalService;
