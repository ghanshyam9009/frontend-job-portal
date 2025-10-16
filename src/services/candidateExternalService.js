// Candidate External Service - AWS API Gateway endpoints for public/candidate flows
import axios from 'axios';

// Use environment variables for API URLs, with fallbacks for local development
const CANDIDATE_JOBS_URL = import.meta.env.VITE_CANDIDATE_JOBS_URL || 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
const CANDIDATE_FILTERED_URL = import.meta.env.VITE_CANDIDATE_FILTERED_URL || 'https://1aiwecu37g.execute-api.ap-southeast-1.amazonaws.com/default/getallfilteredjobs';
const CANDIDATE_BOOKMARK_URL = import.meta.env.VITE_CANDIDATE_BOOKMARK_URL || 'https://jslq70120m.execute-api.ap-southeast-1.amazonaws.com/default/bookmarkjobs';
const CANDIDATE_GET_BOOKMARKS_URL = import.meta.env.VITE_CANDIDATE_GET_BOOKMARKS_URL || 'https://tojxfozsk2.execute-api.ap-southeast-1.amazonaws.com/default/getbookmarkedjobs';
const CANDIDATE_APPLIED_URL = import.meta.env.VITE_CANDIDATE_APPLIED_URL || 'https://798vt2a100.execute-api.ap-southeast-1.amazonaws.com/default/getappliedjobs';
const CANDIDATE_STATUS_URL = import.meta.env.VITE_CANDIDATE_STATUS_URL || 'https://87lubscaj2.execute-api.ap-southeast-1.amazonaws.com/default/getjobstatus';

export const candidateExternalService = {
  // Get all jobs (public list)

  async getAllJobs() {
    const { data } = await axios.get(CANDIDATE_JOBS_URL);
    return data;
  },
  // Get filtered jobs (pass filters in params, e.g., location, skills, etc.)
  async getFilteredJobs(params = {}) {
    const { data } = await axios.get(CANDIDATE_FILTERED_URL, { params });
    return data;
  },

  // Bookmark a job for a user
  async bookmarkJob(payload) {
    // Expecting payload to contain necessary fields like { user_id, job_id }
    const { data } = await axios.post(CANDIDATE_BOOKMARK_URL, payload);
    return data;
  },

  // Get bookmarked jobs by user
  async getBookmarkedJobs(userId) {
    const { data } = await axios.get(CANDIDATE_GET_BOOKMARKS_URL, { params: { user_id: userId } });
    return data;
  },

  // Get applied jobs by user
  async getAppliedJobs(userId) {
    const { data } = await axios.get(CANDIDATE_APPLIED_URL, { params: { user_id: userId } });
    return data;
  },

  // Get status of a specific application
  async getApplicationStatus(applicationId) {
    const { data } = await axios.get(CANDIDATE_STATUS_URL, { params: { application_id: applicationId } });
    return data;
  }
};

export default candidateExternalService;
