// Candidate External Service - AWS API Gateway endpoints for public/candidate flows
import axios from 'axios';

// Use environment variables for API URLs, with fallbacks for local development
const CANDIDATE_JOBS_URL = import.meta.env.VITE_CANDIDATE_JOBS_URL || 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com/default/getalljobs';
const CANDIDATE_FILTERED_URL = import.meta.env.VITE_CANDIDATE_FILTERED_URL || 'https://1aiwecu37g.execute-api.ap-southeast-1.amazonaws.com/default/getallfilteredjobs';
const CANDIDATE_BOOKMARK_URL = import.meta.env.VITE_CANDIDATE_BOOKMARK_URL || 'https://jslq70120m.execute-api.ap-southeast-1.amazonaws.com/default/bookmarkjobs';
const CANDIDATE_GET_BOOKMARKS_URL = import.meta.env.VITE_CANDIDATE_GET_BOOKMARKS_URL || 'https://tojxfozsk2.execute-api.ap-southeast-1.amazonaws.com/default/getbookmarkedjobs';
const CANDIDATE_REMOVE_BOOKMARK_URL = import.meta.env.VITE_CANDIDATE_REMOVE_BOOKMARK_URL || 'https://jslq70120m.execute-api.ap-southeast-1.amazonaws.com/default/bookmarkjobs';
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
    // Expecting payload to contain necessary fields like { user_id, job_id, action }
    // action: 1 = add bookmark, 0 = remove bookmark
    const { data } = await axios.post(CANDIDATE_BOOKMARK_URL, payload);
    return data;
  },

  // Remove bookmark from a job for a user
  async removeBookmark(payload) {
    // Expecting payload to contain necessary fields like { user_id, job_id }
    const { data } = await axios.delete(CANDIDATE_REMOVE_BOOKMARK_URL, {
      data: payload // Send user_id and job_id in request body for DELETE request
    });
    return data;
  },

  // Get bookmarked jobs by user - try pagination approach
  async getBookmarkedJobs(userId) {
    try {
      // Try to get all pages if pagination exists
      let allBookmarks = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const { data } = await axios.get(CANDIDATE_GET_BOOKMARKS_URL, {
          params: {
            user_id: userId,
            page: page,
            per_page: 100,
            limit: 100
          }
        });

        // Handle different response formats
        let bookmarks = [];
        if (data && data.jobs && Array.isArray(data.jobs)) {
          bookmarks = data.jobs;
        } else if (data && Array.isArray(data)) {
          bookmarks = data;
        } else if (data && typeof data === 'object' && data.bookmarks && Array.isArray(data.bookmarks)) {
          bookmarks = data.bookmarks;
        } else if (data && typeof data === 'object' && data.jobs) {
          bookmarks = data.jobs;
        }

        allBookmarks = allBookmarks.concat(bookmarks);

        // Check if there's more data (if count is less than requested, no more pages)
        if (bookmarks.length < 100) {
          hasMorePages = false;
        } else {
          page++;
          // Safety check to prevent infinite loops
          if (page > 10) hasMorePages = false;
        }
      }

      return { jobs: allBookmarks, count: allBookmarks.length };
    } catch (error) {
      console.error('Error fetching bookmarked jobs:', error);
      // Fallback to single page request
      try {
        const { data } = await axios.get(CANDIDATE_GET_BOOKMARKS_URL, {
          params: { user_id: userId, limit: 1000, per_page: 1000, page: 1 }
        });
        return data;
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        return { jobs: [], count: 0 };
      }
    }
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
