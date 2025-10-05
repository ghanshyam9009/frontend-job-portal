// Candidate External Service - AWS API Gateway endpoints for public/candidate flows
import axios from 'axios';

// Allow overriding base hosts via env; default to provided execute-api hosts
const CANDIDATE_JOBS_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CANDIDATE_JOBS_BASE) || 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com';
const CANDIDATE_FILTERED_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CANDIDATE_FILTERED_BASE) || 'https://1aiwecu37g.execute-api.ap-southeast-1.amazonaws.com';
const CANDIDATE_BOOKMARK_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CANDIDATE_BOOKMARK_BASE) || 'https://jslq70120m.execute-api.ap-southeast-1.amazonaws.com';
const CANDIDATE_GET_BOOKMARKS_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CANDIDATE_GET_BOOKMARKS_BASE) || 'https://tojxfozsk2.execute-api.ap-southeast-1.amazonaws.com';
const CANDIDATE_APPLIED_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CANDIDATE_APPLIED_BASE) || 'https://798vt2a100.execute-api.ap-southeast-1.amazonaws.com';
const CANDIDATE_STATUS_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CANDIDATE_STATUS_BASE) || 'https://87lubscaj2.execute-api.ap-southeast-1.amazonaws.com';

export const candidateExternalService = {
  // Get all jobs (public list)
  async getAllJobs() {
    const url = (import.meta.env?.DEV)
      ? `/ext/jobs`
      : `${CANDIDATE_JOBS_BASE}/default/getalljobs`;
    const { data } = await axios.get(url);
    return data;
  },
  // Get filtered jobs (pass filters in params, e.g., location, skills, etc.)
  async getFilteredJobs(params = {}) {
    const url = (import.meta.env?.DEV)
      ? `/ext/filtered`
      : `${CANDIDATE_FILTERED_BASE}/default/getallfilteredjobs`;
    const { data } = await axios.get(url, { params });
    return data;
  },

  // Bookmark a job for a user
  async bookmarkJob(payload) {
    // Expecting payload to contain necessary fields like { user_id, job_id }
    const url = (import.meta.env?.DEV)
      ? `/ext/candidate/bookmark/default/bookmarkjobs`
      : `${CANDIDATE_BOOKMARK_BASE}/default/bookmarkjobs`;
    const { data } = await axios.post(url, payload);
    return data;
  },

  // Get bookmarked jobs by user
  async getBookmarkedJobs(userId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/bookmarks`
      : `${CANDIDATE_GET_BOOKMARKS_BASE}/default/getbookmarkedjobs`;
    const { data } = await axios.get(url, { params: { user_id: userId } });
    return data;
  },

  // Get applied jobs by user
  async getAppliedJobs(userId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/applied`
      : `${CANDIDATE_APPLIED_BASE}/default/getappliedjobs`;
    const { data } = await axios.get(url, { params: { user_id: userId } });
    return data;
  },

  // Get status of a specific application
  async getApplicationStatus(applicationId) {
    const url = (import.meta.env?.DEV)
      ? `/ext/jobstatus`
      : `${CANDIDATE_STATUS_BASE}/default/getjobstatus`;
    const { data } = await axios.get(url, { params: { application_id: applicationId } });
    return data;
  }
};

export default candidateExternalService;
